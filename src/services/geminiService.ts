import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BoundingBox {
  y: number;
  x: number;
  width: number;
  height: number;
}

export async function detectCardInImage(base64Image: string, mimeType: string): Promise<BoundingBox | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Detect the edges of the main ID card (like Aadhar card, PAN card, or license) in this image. I need the bounding box that tightly crops only the card area, excluding the background. Return the bounding box coordinates in normalized scale [0, 1000] as JSON format: {\"box_2d\": [ymin, xmin, ymax, xmax]}. Return ONLY the JSON, no markdown, no text." },
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    clearTimeout(timeoutId);

    const text = response.text;
    if (!text) return null;

    try {
      // Handle potential markdown code blocks in the response
      const jsonMatch = text.match(/\{.*\}/s);
      const cleanedJson = jsonMatch ? jsonMatch[0] : text;
      const data = JSON.parse(cleanedJson);
      
      if (data.box_2d && Array.isArray(data.box_2d)) {
        const [ymin, xmin, ymax, xmax] = data.box_2d;
        // Convert 0-1000 to percentages for react-image-crop
        return {
          y: ymin / 10,
          x: xmin / 10,
          width: (xmax - xmin) / 10,
          height: (ymax - ymin) / 10
        };
      }
    } catch (e) {
      console.error("Gemini JSON Parse Error:", e, text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return null;
  }
}

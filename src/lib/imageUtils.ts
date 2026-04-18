export const compressImageToKB = async (
  file: File,
  targetWidth: number,
  targetHeight: number,
  maxKB: number,
  format: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Fill white background for JPEG
      if (format === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // Draw image scaled to target dimensions
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      let minQuality = 0.1;
      let maxQuality = 1.0;
      let quality = 0.9;
      let resultDataUrl = "";
      let iterations = 0;
      const maxIterations = 10;

      // Binary search for the right quality to hit the KB limit
      const compress = () => {
        resultDataUrl = canvas.toDataURL(format, quality);
        // Calculate size in KB (approximate base64 size)
        const sizeKB = Math.round((resultDataUrl.length * 3) / 4 / 1024);

        if (sizeKB <= maxKB || iterations >= maxIterations) {
          // If we are under the limit or out of attempts, return
          // If we are still over, force a very low quality as fallback
          if (sizeKB > maxKB && format === "image/jpeg") {
             resultDataUrl = canvas.toDataURL(format, 0.1);
          }
          resolve(resultDataUrl);
        } else {
          // Too big, lower quality
          maxQuality = quality;
          quality = (minQuality + maxQuality) / 2;
          iterations++;
          compress();
        }
      };

      compress();
    };

    img.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { PanResizer } from './components/PanResizer';
import { MultiIdMaker } from './components/MultiIdMaker';
import { ResumeMaker } from './components/ResumeMaker';
import { DocumentScanner } from './components/DocumentScanner';
import { ImageTools } from './components/ImageTools';
import { PdfTools } from './components/PdfTools';
import { TextTools } from './components/TextTools';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

export type Page = 'home' | 'pan-resizer' | 'id-maker' | 'resume-maker' | 'signature-resizer' | 'whatsapp-print' | 'image-to-pdf' | 'image-resizer' | 'pdf-merge' | 'pdf-split' | 'pdf-rotate' | 'text-case' | 'word-counter' | 'password-gen' | 'password-strength' | 'privacy-policy' | 'terms-of-service';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'pan-resizer':
        return <PanResizer onNavigate={setCurrentPage} />;
      case 'id-maker':
        return <MultiIdMaker onNavigate={setCurrentPage} />;
      case 'resume-maker':
        return <ResumeMaker onNavigate={setCurrentPage} />;
      case 'whatsapp-print':
        return <DocumentScanner onNavigate={setCurrentPage} />;
      case 'image-to-pdf':
        return <ImageTools onNavigate={setCurrentPage} initialTool="pdf" />;
      case 'image-resizer':
        return <ImageTools onNavigate={setCurrentPage} initialTool="resize" />;
      case 'pdf-merge':
        return <PdfTools onNavigate={setCurrentPage} initialTool="merge" />;
      case 'pdf-split':
        return <PdfTools onNavigate={setCurrentPage} initialTool="split" />;
      case 'pdf-rotate':
        return <PdfTools onNavigate={setCurrentPage} initialTool="rotate" />;
      case 'text-case':
        return <TextTools onNavigate={setCurrentPage} initialTool="case" />;
      case 'word-counter':
        return <TextTools onNavigate={setCurrentPage} initialTool="counter" />;
      case 'password-gen':
        return <TextTools onNavigate={setCurrentPage} initialTool="password" />;
      case 'password-strength':
        return <TextTools onNavigate={setCurrentPage} initialTool="strength" />;
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={setCurrentPage} />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={setCurrentPage} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-8">This tool is currently under development.</p>
            <button 
              onClick={() => setCurrentPage('home')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}


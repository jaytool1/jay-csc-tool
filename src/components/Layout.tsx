import React from 'react';
import { Page } from '../App';
import { Wrench, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems: { id: Page; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
    { id: 'terms-of-service', label: 'Terms of Service' },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[70px]">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Wrench size={24} />
              </div>
              <span className="text-[22px] font-[800] text-gradient tracking-tight">
                Jay CSC Tool
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPage === item.id ? 'text-primary border-b-2 border-primary' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    currentPage === item.id
                      ? 'bg-slate-100 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-primary" />
            <span className="font-[800] text-slate-900 tracking-tight">Jay CSC Tool</span>
          </div>
          <p className="text-sm text-slate-500 text-center md:text-left font-medium">
            © {new Date().getFullYear()} Jay CSC Tool. All rights reserved. 100% Client-Side Processing.
          </p>
          <div className="flex gap-4 text-sm font-semibold">
            <button 
              onClick={() => onNavigate('privacy-policy')}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate('terms-of-service')}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

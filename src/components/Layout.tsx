import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <div className="min-h-screen animated-bg">
      <nav className="glass-card border-0 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="hover:opacity-80 transition-opacity duration-200 floating-element">
                <img 
                  src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
                  alt="iGrad Enrich" 
                  className="h-8 w-auto"
                />
              </Link>
              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link text-sm font-medium ${
                      location.pathname === item.path
                        ? 'text-white'
                        : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
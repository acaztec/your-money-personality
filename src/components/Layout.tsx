import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/topics', label: 'Topics' },
    { path: '/mindfulness', label: 'Mindfulness' },
    { path: '/investing', label: 'Investing Classroom' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 shadow-sm border-b border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex-shrink-0">
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
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'text-white border-b-2 border-white'
                        : 'text-primary-100 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                1,250 Points
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
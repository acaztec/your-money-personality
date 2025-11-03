import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  to: string;
}

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'For Individuals', to: '/' },
      { label: 'For Advisors', to: '/advisor' },
    ],
    []
  );

  const footerColumns: FooterColumn[] = useMemo(
    () => [
      {
        heading: 'Your Money Personality',
        links: [
          { label: 'Get your Analysis', to: '/assessment' },
          { label: 'Advisor resources', to: '/advisor' },
          ...(isAuthenticated
            ? [{ label: 'Advisor Dashboard', to: '/advisor/dashboard' }]
            : [{ label: 'Advisor Log In', to: '/advisor/login' }]),
        ],
      },
      {
        heading: 'Help',
        links: [
          { label: 'Contact Support', href: 'mailto:support@enrich.org' },
          { label: 'Privacy Policy', href: 'https://www.igrad.com/privacy' },
          { label: 'Terms of Use', href: 'https://www.igrad.com/terms' },
        ],
      },
    ],
    [isAuthenticated]
  );

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="shadow-sm">
        <div className="bg-primary-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-3">
                <span className="sr-only">Enrich Home</span>
                <img
                  src="https://media-cdn.igrad.com/IMAGE/Logos/Standard-White/Enrich.png"
                  alt="Enrich by iGrad"
                  className="h-8 w-auto"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`text-sm font-semibold transition ${
                      isActive(item.to)
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4 lg:gap-6">
                <Link
                  to="/assessment"
                  className="hidden lg:inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-white/90"
                >
                  Get your Analysis
                </Link>
                <button
                  type="button"
                  className="lg:hidden rounded-md border border-white/30 p-2 text-white"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle navigation"
                >
                  <span className="sr-only">Toggle navigation</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-primary-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              <nav className="space-y-4" aria-label="Mobile">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base font-semibold ${
                      isActive(item.to)
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                to="/assessment"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-white/90"
              >
                Get your Analysis
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-neutral-200 text-ink mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2">
                <img
                  src="https://media-cdn.igrad.com/IMAGE/Logos/Standard-White/Enrich.png"
                  alt="Enrich by iGrad"
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Your Money Personality is an Enrich experience that helps individuals understand the motivations behind their money decisions.
              </p>
            </div>
            {footerColumns.map((column) => (
              <div key={column.heading} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  {column.heading}
                </h3>
                <ul className="space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to} className="text-neutral-600 transition hover:text-primary-700">
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-neutral-600 transition hover:text-primary-700"
                          target={link.href?.startsWith('http') ? '_blank' : undefined}
                          rel={link.href?.startsWith('http') ? 'noreferrer' : undefined}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Enrich by Aztec | iGrad. All rights reserved.</span>
            <span>Enrich is a registered trademark of iGrad, Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
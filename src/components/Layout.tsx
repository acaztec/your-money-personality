import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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

const navItems: NavItem[] = [
  { label: 'Assessment', to: '/assessment' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Advisor', to: '/advisor' },
];

const footerColumns: FooterColumn[] = [
  {
    heading: 'Your Money Personality',
    links: [
      { label: 'Start Assessment', to: '/assessment' },
      { label: 'View Dashboard', to: '/dashboard' },
      { label: 'Share with an Advisor', to: '/advisor' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Contact Support', href: 'mailto:support@enrich.org' },
      { label: 'Privacy Policy', href: 'https://www.enrich.org/privacy-policy' },
      { label: 'Terms of Use', href: 'https://www.enrich.org/terms' },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="shadow-sm">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-3">
                <span className="sr-only">Enrich Home</span>
                <img
                  src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
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
                        ? 'text-primary-700'
                        : 'text-neutral-700 hover:text-primary-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4 lg:gap-6">
                <Link
                  to="/assessment"
                  className="hidden lg:inline-flex items-center rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
                >
                  Start Assessment
                </Link>
                <button
                  type="button"
                  className="lg:hidden rounded-md border border-neutral-200 p-2 text-neutral-700"
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
          <div className="lg:hidden border-t border-neutral-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              <nav className="space-y-4" aria-label="Mobile">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base font-semibold ${
                      isActive(item.to)
                        ? 'text-primary-700'
                        : 'text-neutral-800 hover:text-primary-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                to="/assessment"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
              >
                Start Assessment
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="bg-primary-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-4">
              <img
                src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
                alt="Enrich by iGrad"
                className="h-8 w-auto"
              />
              <p className="text-sm text-primary-300 leading-relaxed">
                Your Money Personality is an Enrich experience that helps individuals understand the motivations behind their money decisions.
              </p>
            </div>
            {footerColumns.map((column) => (
              <div key={column.heading} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-300">
                  {column.heading}
                </h3>
                <ul className="space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to} className="text-primary-300 transition hover:text-white">
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-primary-300 transition hover:text-white"
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
        <div className="border-t border-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2 text-xs text-primary-200 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Enrich by Aztec | iGrad. All rights reserved.</span>
            <span>Enrich is a registered trademark of iGrad, Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

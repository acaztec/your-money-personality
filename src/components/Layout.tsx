import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavLinkItem {
  label: string;
  href: string;
}

interface NavSection {
  label: string;
  href?: string;
  links?: NavLinkItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Services',
    links: [
      { label: 'Financial Wellness Programs', href: '#programs' },
      { label: 'Personalized Coaching', href: '#personalized-support' },
      { label: 'Engagement Campaigns', href: '#engagement' },
    ],
  },
  {
    label: 'Financial Wellness Resources',
    links: [
      { label: 'Resource Library', href: '#resources' },
      { label: 'Money Personality Chapters', href: '#chapters' },
      { label: 'Success Stories', href: '#success' },
    ],
  },
  {
    label: 'About Us',
    links: [
      { label: 'Our Story', href: '#about-enrich' },
      { label: 'Research & Outcomes', href: '#outcomes' },
      { label: 'Partners', href: '#partners' },
    ],
  },
  {
    label: 'Blog & Press',
    href: '#insights',
  },
];

const footerColumns = [
  {
    heading: 'Company',
    links: [
      { label: 'About Enrich', href: '#about-enrich' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Money Personality Assessment', href: '#programs' },
      { label: 'Financial Wellness Checkup', href: '#resources' },
      { label: 'Blog & Press', href: '#insights' },
    ],
  },
  {
    heading: 'Compliance',
    links: [
      { label: 'Accessibility', href: '#accessibility' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Use', href: '#terms' },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (label: string) => {
    setOpenSection((current) => (current === label ? null : label));
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="shadow-sm">
        <div className="bg-primary-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="font-semibold tracking-wide">Contact Sales (888) 844-1525</span>
              <Link to="/advisor/login" className="text-primary-300 hover:text-white transition-colors">
                Client Login
              </Link>
            </div>
            <Link
              to="/advisor"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-accent-600 px-4 py-2 font-semibold text-white transition hover:bg-accent-700"
            >
              Schedule a Call
            </Link>
          </div>
        </div>

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
                {navSections.map((section) => (
                  <div key={section.label} className="relative">
                    {section.links ? (
                      <div className="group inline-flex flex-col">
                        <button
                          type="button"
                          onClick={() => toggleSection(section.label)}
                          onMouseEnter={() => setOpenSection(section.label)}
                          onMouseLeave={() => setOpenSection(null)}
                          className="text-sm font-semibold text-neutral-700 hover:text-primary-700 flex items-center gap-2"
                          aria-expanded={openSection === section.label}
                        >
                          {section.label}
                          <span aria-hidden="true">▾</span>
                        </button>
                        <div
                          onMouseEnter={() => setOpenSection(section.label)}
                          onMouseLeave={() => setOpenSection(null)}
                          className={`absolute left-1/2 top-10 z-40 hidden min-w-[240px] -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-4 shadow-subtle group-hover:block ${
                            openSection === section.label ? 'block' : ''
                          }`}
                        >
                          <ul className="space-y-2">
                            {section.links.map((item) => (
                              <li key={item.label}>
                                <a
                                  href={item.href}
                                  className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-canvas hover:text-primary-700"
                                >
                                  {item.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={section.href}
                        className={`text-sm font-semibold transition hover:text-primary-700 ${
                          location.hash === section.href ? 'text-primary-700' : 'text-neutral-700'
                        }`}
                      >
                        {section.label}
                      </a>
                    )}
                  </div>
                ))}
              </nav>

              <div className="flex items-center gap-4 lg:gap-6">
                <Link
                  to="/assessment"
                  className="hidden lg:inline-flex items-center rounded-full border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-500 hover:text-primary-900"
                >
                  Start Assessment
                </Link>
                <Link
                  to="/advisor"
                  className="hidden lg:inline-flex items-center rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
                >
                  Schedule a Call
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
              {navSections.map((section) => (
                <div key={section.label} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                  {section.links ? (
                    <details>
                      <summary className="cursor-pointer text-base font-semibold text-neutral-800">
                        {section.label}
                      </summary>
                      <ul className="mt-3 space-y-3 pl-4">
                        {section.links.map((item) => (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              className="block text-sm font-medium text-neutral-700 transition hover:text-primary-700"
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <a
                      href={section.href}
                      className="text-base font-semibold text-neutral-800 transition hover:text-primary-700"
                    >
                      {section.label}
                    </a>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-3">
                <Link
                  to="/assessment"
                  className="inline-flex items-center justify-center rounded-full border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-500 hover:text-primary-900"
                >
                  Start Assessment
                </Link>
                <Link
                  to="/advisor"
                  className="inline-flex items-center justify-center rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
                >
                  Schedule a Call
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="bg-primary-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="space-y-4">
              <img
                src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
                alt="Enrich by iGrad"
                className="h-8 w-auto"
              />
              <p className="text-sm text-primary-300 leading-relaxed">
                Enrich is an Aztec | iGrad solution that delivers measurable financial wellness outcomes through personalized learning, actionable tools, and consultative support.
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
                      <a
                        href={link.href}
                        className="text-primary-300 transition hover:text-white"
                      >
                        {link.label}
                      </a>
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

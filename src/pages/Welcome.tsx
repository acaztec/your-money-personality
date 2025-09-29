import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const stats = [
  { label: 'Completed assessments', value: '500K+' },
  { label: 'Average completion time', value: '10 minutes' },
  { label: 'Personality lenses', value: '5 core styles' },
];

const highlights = [
  {
    title: 'Personalized guidance',
    description:
      'Discover the motivators behind spending, saving, and planning so you can make confident choices that fit your life.',
    image: {
      src: 'https://enrich.org/wp-content/uploads/2024/10/small_Woman_smiling_while_using_laptop_to_view_reporting_console_07897d71ee-e1728799046817.webp',
      alt: 'Participant smiling while reviewing financial wellness insights on a laptop.',
    },
  },
  {
    title: 'Dashboard follow-up',
    description:
      'Review tailored insights and recommended next steps inside the Money Personality dashboard after you finish.',
    image: {
      src: 'https://enrich.org/wp-content/uploads/2024/12/maxresdefault.jpg',
      alt: 'Straight-on preview of the Money Personality dashboard video cover.',
    },
  },
  {
    title: 'Advisor collaboration',
    description:
      'Share results securely with an Enrich advisor or trusted partner to continue the financial wellness conversation.',
    image: {
      src: 'https://enrich.org/wp-content/uploads/2024/10/small_Home_Page_Block_2_e828cca6d4.webp',
      alt: 'Advisor collaborating virtually with a participant over shared resources.',
    },
  },
];

const steps = [
  {
    title: 'Answer intuitive questions',
    description:
      'Work through a short series of statements about money habits. Use the seven-point scale to choose what fits you best.',
  },
  {
    title: 'Reveal your personality blend',
    description:
      'Instantly see how your motivations align to our five Money Personality styles with plain-language descriptions.',
  },
  {
    title: 'Put insights to work',
    description:
      'Jump into the dashboard for reflection exercises, coaching prompts, and actions you can revisit over time.',
  },
];

export default function Welcome() {
  return (
    <Layout>
      <div className="bg-canvas">
        <section id="hero" className="hero-section hero-section--full">
          <div className="hero-section__inner">
            <div className="hero-card">
              <div className="hero-card__accent hero-card__accent--dots" aria-hidden="true" />
              <div className="hero-card__accent hero-card__accent--orb" aria-hidden="true" />
              <div className="hero-card__layout">
                <div className="hero-card__content">
                  <p className="hero-card__kicker">Your Money Personality</p>
                  <h1 className="hero-card__title">
                    Feel confident about your financial choices—one step at a time
                  </h1>
                  <p className="hero-card__description">
                    Explore the Your Money Personality assessment to understand the motivations guiding how you save, spend, and plan. It only takes a few minutes to reveal insights you can use right away.
                  </p>
                  <div className="hero-card__actions">
                    <Link to="/assessment" className="btn-primary">
                      Start assessment
                    </Link>
                    <Link to="/dashboard" className="btn-secondary">
                      View sample results
                    </Link>
                  </div>
                </div>
                <div className="hero-card__media" aria-hidden="true">
                  <div className="hero-card__photo-frame">
                    <img
                      src="https://media-cdn.igrad.com/IMAGE/hub-redesign/enrich/home-hero.webp"
                      alt="Parent and child smiling while reviewing Money Personality guidance"
                    />
                  </div>
                </div>
              </div>
              <dl className="hero-card__stats">
                {stats.map((item) => (
                  <div key={item.label} className="hero-card__stat">
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="py-20" id="how-it-works">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-ink">A focused experience built around self-reflection</h2>
              <p className="mt-4 text-neutral-700">
                Your Money Personality keeps the process simple so you can concentrate on honest answers. Progress saves automatically, and you can move back to adjust selections at any point.
              </p>
            </div>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-primary-500">
                    <span>Step {index + 1}</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="text-neutral-700 leading-relaxed">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-20 bg-white" id="highlights">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">What you gain</p>
              <h2 className="mt-4 text-3xl font-semibold text-ink">Insights that translate into practical next steps</h2>
              <p className="mt-4 text-neutral-700">
                Each Money Personality report combines narrative guidance with prompts you can return to over time. Use it on your own or as a conversation starter with someone you trust.
              </p>
            </div>
            <div className="grid gap-10 lg:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.title} className="space-y-5">
                  <div className="feature-card__media">
                    <div className="feature-card__image-frame">
                      <img src={item.image.src} alt={item.image.alt} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-ink">{item.title}</h3>
                  <p className="text-neutral-700 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="share">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-ink">Share your results when you are ready</h2>
              <p className="text-neutral-700">
                Invite an advisor, coach, or accountability partner into the experience. Shared assessments surface discussion prompts and next steps so every conversation stays productive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/advisor" className="btn-secondary">
                  Invite an advisor
                </Link>
                <Link to="/dashboard" className="inline-flex items-center font-semibold text-primary-700 hover:text-primary-500">
                  Preview shared view
                </Link>
              </div>
            </div>
            <div className="share-card__media">
              <div className="share-card__image-frame">
                <img
                  src="https://images.pexels.com/photos/1181356/pexels-photo-1181356.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=1"
                  alt="Two colleagues collaborating over a laptop while reviewing assessment responses."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white" id="cta">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-semibold text-ink">Begin your Money Personality journey</h2>
            <p className="text-neutral-700 max-w-3xl mx-auto">
              Set aside a quiet moment, work through the assessment at your own pace, and return to your dashboard whenever you need a refresher. Your progress is saved so you can pick up right where you left off.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="btn-primary">
                Start assessment
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Continue where you left off
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

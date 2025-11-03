import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const stats = [
  { label: 'Completed assessments', value: '500K+' },
  { label: '96% completion rate', value: 'Learners finish what they start' },
  { label: 'Personality lenses', value: '5 core insights' },
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
      src: 'https://media.istockphoto.com/id/2161896248/photo/smiling-businessman-in-team-meeting-with-colleagues-in-office.jpg?s=612x612&w=0&k=20&c=6Y1U-APKe1WwLAsYjJIYTkj1Rcpqnir1iE4jBtRhBTk=',
      alt: 'Team members smiling together during a collaborative planning session.',
    },
  },
  {
    title: 'Advisor-ready summaries',
    description:
      'Share results securely with an Enrich advisor or trusted partner when you are ready to continue the conversation.',
    image: {
      src: 'https://www.advocis.ca/wp-content/uploads/2023/08/iStock-1448489359.jpg',
      alt: 'Advisor and participant reviewing insights together at a table.',
    },
  },
];

const glanceItems = [
  {
    title: 'Emotions',
    description: 'How do you feel about money?',
  },
  {
    title: 'Outlook',
    description: 'What is your viewpoint about the future?',
  },
  {
    title: 'Focus',
    description: 'Are you centered on the present or the future?',
  },
  {
    title: 'Influence',
    description: 'Do others impact your money decisions?',
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
      'Instantly see how your motivations align to our five Money Personality insights with plain-language descriptions.',
  },
  {
    title: 'Put insights to work',
    description:
      'Use your personalized insights to reflect, plan next steps, and revisit recommendations as your goals evolve.',
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
                  <h1 className="hero-card__title">Discover your personality type</h1>
                  <div className="hero-card__description space-y-3">
                    <p>Understand the strengths and weaknesses of your relationship with money.</p>
                    <p>Receive recommendations tailored to the motivations behind your money decisions.</p>
                    <p>Learn how to manage your money in a way that makes sense for you with personality-specific insights.</p>
                  </div>
                  <div className="hero-card__actions">
                    <Link to="/assessment" className="btn-primary">
                      Get your Analysis
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

        <section className="py-16 bg-white" id="at-a-glance">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold text-ink">Your Money Personality® at a glance</h2>
              <p className="mt-4 text-neutral-700">
                Understand how each category contributes to the way you approach money before you dive into your full analysis.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {glanceItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-subtle space-y-3"
                >
                  <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="text-neutral-700 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="how-it-works">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-ink">A focused experience built around self-reflection</h2>
              <p className="mt-4 text-neutral-700">
                Discover what influences your relationship with money, uncover growth opportunities, and receive tailored guidance you can immediately put into practice.
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

        <section className="py-16" id="trusted-by">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">Trusted by learners across industries</p>
            <h2 className="text-3xl font-semibold text-ink">Helping organizations empower financial confidence</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 items-center">
              {['University of Kentucky', 'Principal®', 'ADP®', 'Community Banks', 'Credit Unions Nationwide'].map((name) => (
                <div
                  key={name}
                  className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 text-lg font-semibold text-neutral-700 shadow-subtle"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

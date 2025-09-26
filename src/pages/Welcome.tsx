import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const stats = [
  { label: 'Organizations served', value: '1,200+' },
  { label: 'Participant satisfaction', value: '94%' },
  { label: 'Average engagement lift', value: '3.2x' },
];

const featureSections = [
  {
    id: 'programs',
    heading: 'Financial wellness programs built for measurable outcomes',
    body: 'Blend self-paced learning with guided interventions that meet employees where they are. Our behavioral design team curates money personality insights, financial wellness checkups, and custom communications to drive lasting change.',
    imageNote: 'Placeholder: Wide image of professionals collaborating over tablets in a workplace coaching session.',
  },
  {
    id: 'personalized-support',
    heading: 'Personalized coaching that adapts to each money personality',
    body: 'Advisors and coaches receive actionable dashboards that translate assessment responses into tailored talking points. Participants gain clarity on habits, motivators, and next steps that align with their financial goals.',
    imageNote: 'Placeholder: Portrait image of an Enrich coach meeting virtually with a participant.',
  },
  {
    id: 'engagement',
    heading: 'Campaigns that sustain engagement quarter after quarter',
    body: 'Deploy turnkey campaigns with curated content, events, and nudges rooted in behavioral science. Every touchpoint reinforces your program KPIs and demonstrates progress to leadership.',
    imageNote: 'Placeholder: Email or campaign collage illustrating engagement touchpoints.',
  },
];

const resourceCards = [
  {
    id: 'resources',
    eyebrow: 'Resource library',
    title: 'Financial Wellness Checkup toolkit',
    description: 'Download session guides, participant one-pagers, and measurement templates that streamline your launch.',
  },
  {
    id: 'chapters',
    eyebrow: 'Money personality chapters',
    title: 'Your Money Personality in action',
    description: 'Explore turnkey chapter layouts with imagery, talking points, and exercises you can drop into your LMS.',
  },
  {
    id: 'success',
    eyebrow: 'Success story',
    title: 'How Aztec Credit Union doubled program completion',
    description: 'See how a blended learning journey and advisor follow-up increased assessment completions by 112%.',
  },
];

export default function Welcome() {
  return (
    <Layout>
      <div className="bg-canvas">
        <section id="hero" className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">Your Money Personality</p>
                  <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-ink">
                    Financial wellness that looks beyond the numbers
                  </h1>
                  <p className="text-lg text-neutral-700 leading-relaxed max-w-xl">
                    Discover the motivations behind money decisions and deliver experiences that feel personal from the very first assessment. Enrich pairs science-backed insights with consultative support so you can measure results with confidence.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/assessment" className="btn-primary">
                    Start the Money Personality assessment
                  </Link>
                  <a href="#programs" className="btn-secondary">
                    Review our programs
                  </a>
                </div>
                <dl className="grid gap-6 sm:grid-cols-3 pt-8 border-t border-neutral-200">
                  {stats.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <dt className="text-sm font-medium text-neutral-500 uppercase tracking-wide">{item.label}</dt>
                      <dd className="text-2xl font-semibold text-primary-700">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="relative">
                <div className="rounded-[2rem] overflow-hidden placeholder-image flex items-center justify-center p-10 text-center text-sm font-medium leading-relaxed min-h-[360px]">
                  {featureSections[0].imageNote}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about-enrich" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-ink">
                Financial wellness leadership backed by Aztec | iGrad
              </h2>
              <p className="text-lg text-neutral-700">
                For over a decade, Enrich has helped employers, credit unions, and universities build cultures of financial wellbeing. Our research partnerships and behavioral economists ensure every touchpoint—from Your Money Personality to ongoing coaching—supports measurable outcomes.
              </p>
              <p className="text-neutral-700">
                When you collaborate with Enrich, you gain a consultative team, branded resource hubs, and audience-specific journeys that highlight your value proposition.
              </p>
            </div>
            <div className="rounded-[2rem] overflow-hidden placeholder-image flex items-center justify-center p-10 text-center text-sm font-medium leading-relaxed min-h-[320px]">
              Placeholder: Team photo featuring Enrich consultants collaborating with partners.
            </div>
          </div>
        </section>

        <section className="py-20 bg-white" id="outcomes">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-ink">Proven outcomes clients can share with leadership</h2>
              <ul className="space-y-4 text-neutral-700">
                <li>• 75% of participants report improved confidence managing day-to-day finances after completing the assessment series.</li>
                <li>• Employers see measurable reductions in financial stress markers and absenteeism within the first six months.</li>
                <li>• Advisors leverage the dashboard to prioritize outreach by readiness and personalize consultations.</li>
              </ul>
              <Link to="/dashboard" className="inline-flex items-center font-semibold text-primary-700 hover:text-primary-500">
                View sample reporting
              </Link>
            </div>
            <div className="rounded-[2rem] overflow-hidden placeholder-image flex items-center justify-center p-10 text-center text-sm font-medium leading-relaxed min-h-[320px]">
              Placeholder: Screenshot collage of Enrich reporting dashboard and outcome highlights.
            </div>
          </div>
        </section>

        <section className="py-20" id="solutions">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {featureSections.map((section, index) => (
              <div key={section.id} id={section.id} className="grid gap-10 lg:grid-cols-2 items-center">
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''} space-y-5`}>
                  <h3 className="text-2xl font-semibold text-ink">{section.heading}</h3>
                  <p className="text-neutral-700 leading-relaxed">{section.body}</p>
                </div>
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} rounded-[1.75rem] overflow-hidden placeholder-image flex items-center justify-center p-10 text-center text-sm font-medium leading-relaxed min-h-[280px]`}
                >
                  {section.imageNote}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-white" id="resources">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">Financial wellness resources</p>
              <h2 className="text-3xl font-semibold text-ink">Curated tools to power every stage of your program</h2>
              <p className="text-neutral-700">
                Activate Your Money Personality chapters, deploy ready-to-use campaigns, and equip advisors with turn-key guides. Every resource is written in Enrich’s voice and ready for your brand system.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {resourceCards.map((card) => (
                <article key={card.id} id={card.id} className="resource-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{card.eyebrow}</p>
                  <h3 className="mt-3 text-xl font-semibold text-ink">{card.title}</h3>
                  <p className="mt-4 text-neutral-700 leading-relaxed">{card.description}</p>
                  <a href="#insights" className="mt-6 inline-flex items-center font-semibold text-primary-700 hover:text-primary-500">
                    Explore details
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="partners">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-ink">Trusted by organizations who care about financial wellness</h2>
              <p className="text-neutral-700">
                From Fortune 500 employers to regional credit unions, Enrich adapts to your culture, compliance requirements, and brand guidelines. Partner with us to launch a turnkey program or refresh your existing initiatives.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                  <p className="text-sm text-neutral-500 uppercase tracking-wide">Testimonial highlight</p>
                  <p className="mt-3 text-neutral-700">
                    “Your Money Personality gave our members language to talk about money. Engagement with our advisors has never been stronger.”
                  </p>
                  <p className="mt-4 text-sm font-semibold text-primary-700">VP of Member Experience, Regional Credit Union</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                  <p className="text-sm text-neutral-500 uppercase tracking-wide">Data point</p>
                  <p className="mt-3 text-neutral-700">
                    68% of participants schedule a follow-up consultation within two weeks of receiving their personalized report.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-primary-700">Program Impact Study, 2024</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.75rem] overflow-hidden placeholder-image flex items-center justify-center p-10 text-center text-sm font-medium leading-relaxed min-h-[280px]">
              Placeholder: Montage of partner logos (credit unions, universities, employers) on a neutral background.
            </div>
          </div>
        </section>

        <section className="py-20 bg-white" id="insights">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">Blog & Press</p>
                <h2 className="text-3xl font-semibold text-ink">Latest insights from the Enrich newsroom</h2>
                <p className="text-neutral-700">
                  Stay current with trends in financial wellbeing, behavior change, and benefits communication. Our editorial team translates research into actionable guidance for your population.
                </p>
              </div>
              <a href="#contact" className="inline-flex items-center font-semibold text-primary-700 hover:text-primary-500">
                View all updates
              </a>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((article) => (
                <article key={article} className="resource-card">
                  <div className="h-40 rounded-xl placeholder-image flex items-center justify-center text-center text-sm font-medium leading-relaxed">
                    Placeholder: Editorial image for blog post {article}.
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">Press release headline placeholder {article}</h3>
                  <p className="mt-4 text-neutral-700">
                    Brief summary of a recent Enrich partnership, product enhancement, or behavioral insight.
                  </p>
                  <a href="#contact" className="mt-6 inline-flex items-center font-semibold text-primary-700 hover:text-primary-500">
                    Read more
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="contact">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-semibold text-ink">Ready to align your program with the Enrich experience?</h2>
            <p className="text-neutral-700 max-w-3xl mx-auto">
              Bring Your Money Personality to your audience with a cohesive brand system, curated resources, and advisor enablement. We will collaborate on imagery, copy, and rollout plans that reflect your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/advisor" className="btn-primary">Schedule a consultation</Link>
              <a href="mailto:hello@enrich.org" className="btn-secondary">Email our team</a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

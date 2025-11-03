import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { AssessmentService } from '../services/assessmentService';

interface FeedbackState {
  type: 'idle' | 'success' | 'error' | 'info';
  message: string;
}

export default function AdvisorLanding() {
  const { isAuthenticated, advisor } = useAuth();
  const [formData, setFormData] = useState({
    advisorEmail: advisor?.email || '',
    clientEmail: '',
  });
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle', message: '' });
  const [shareLink, setShareLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseAssessmentLink = useMemo(() => `${window.location.origin}/assessment`, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFeedback({ type: 'idle', message: '' });
  };

  const handleShare = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.advisorEmail || !formData.clientEmail) {
      setFeedback({ type: 'error', message: 'Please enter both email addresses before sharing the assessment.' });
      return;
    }

    if (!isAuthenticated) {
      setShareLink(baseAssessmentLink);
      setFeedback({
        type: 'info',
        message:
          'Copy the link below to invite your contact. Log in as an advisor to unlock AI summaries and tracked invitations.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    try {
      const result = await AssessmentService.shareAssessment(
        advisor?.name || '',
        formData.advisorEmail,
        formData.clientEmail
      );

      if (result.success) {
        setShareLink(result.assessmentLink || '');
        setFeedback({
          type: 'success',
          message:
            'Invitation sent! Share the link below if you would like to follow up manually with your client.',
        });
        setFormData({
          advisorEmail: advisor?.email || '',
          clientEmail: '',
        });
      } else {
        setFeedback({ type: 'error', message: result.error || 'We were unable to send the invitation. Please try again.' });
        if (result.assessmentLink) {
          setShareLink(result.assessmentLink);
        }
      }
    } catch (error) {
      console.error('Failed to share assessment:', error);
      setFeedback({ type: 'error', message: 'Something went wrong. Please try again in a moment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setFeedback({ type: 'success', message: 'Link copied! Share it with your client to begin their assessment.' });
    } catch (error) {
      console.error('Unable to copy link:', error);
      setFeedback({
        type: 'info',
        message: 'Copy the URL manually if automatic copy does not work in your browser.',
      });
    }
  };

  const feedbackStyles: Record<FeedbackState['type'], string> = {
    idle: '',
    success: 'border-accent-600/40 text-accent-700',
    error: 'border-red-500/30 text-red-700',
    info: 'border-primary-500/30 text-primary-800',
  };

  return (
    <Layout>
      <div className="bg-canvas">
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">Advisor resources</p>
            <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Discover your Client’s Money Personality.</h1>
            <p className="text-neutral-700 text-lg">
              Using a Myers-Briggs assessment format built with behavioral scientists, we provide a psychological profile of
              your client’s financial motivators, stressors, and emotional relationship with their finances.
            </p>
            <p className="text-neutral-700 text-lg">
              Understand their behavioral patterns, build deeper trust and communicate more effectively with our proven
              insights.
            </p>
            <p className="text-neutral-700 text-lg">
              Invite someone to take the assessment and explore their motivations around money. Advisors who log in receive
              AI-powered summaries and dashboard access once a client completes the experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link to="/advisor/dashboard" className="btn-secondary">
                  Go to your advisor dashboard
                </Link>
              ) : (
                <Link to="/advisor/login" className="btn-secondary">
                  Advisor log in
                </Link>
              )}
              <Link to="/assessment" className="btn-link">
                Preview the participant experience
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-neutral-200 bg-white shadow-subtle p-8 sm:p-10 space-y-8">
              <div className="space-y-3 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-ink">Send an assessment invite</h2>
                <p className="text-neutral-600">
                  Enter your contact’s email to generate a shareable link. Logged-in advisors automatically receive client
                  results and AI insights when the assessment is finished.
                </p>
              </div>

              <form onSubmit={handleShare} className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                <div className="sm:col-span-1">
                  <label htmlFor="advisorEmail" className="block text-sm font-semibold text-neutral-700">
                    Your email
                  </label>
                  <input
                    id="advisorEmail"
                    name="advisorEmail"
                    type="email"
                    value={formData.advisorEmail}
                    onChange={handleChange}
                    placeholder="you@yourpractice.com"
                    className="mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                    required
                    readOnly={isAuthenticated}
                  />
                  {isAuthenticated && (
                    <p className="mt-2 text-xs text-neutral-500">
                      Using your advisor account email ensures invites stay linked to your dashboard.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="clientEmail" className="block text-sm font-semibold text-neutral-700">
                    Email address of the person you’re inviting
                  </label>
                  <input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    className="mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isAuthenticated ? 'Send invite' : 'Generate share link'}
                  </button>
                  <p className="text-sm text-neutral-500 sm:text-right">
                    Sharing without advisor login keeps AI-powered summaries disabled until the client connects with you.
                  </p>
                </div>
              </form>

              {feedback.type !== 'idle' && (
                <div className={`rounded-2xl border bg-white px-5 py-4 text-sm ${feedbackStyles[feedback.type]}`}>
                  {feedback.message}
                </div>
              )}

              {shareLink && (
                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-neutral-700 break-all">{shareLink}</div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Copy link
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-2 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-ink">Want to share with a friend instead?</h2>
              <p className="text-neutral-700">
                Participants can invite someone they trust straight from their Money Personality dashboard. These peer-to-peer
                shares provide comparison insights but do not include advisor-only AI summaries.
              </p>
              <Link to="/dashboard" className="btn-link">
                Explore the participant dashboard
              </Link>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 space-y-4 text-sm text-neutral-700">
              <p className="font-semibold text-ink">Advisor benefits at a glance</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Automated AI recaps tailored to each client’s assessment responses.</li>
                <li>Dashboard visibility into completion status and shared activity.</li>
                <li>Starter email copy to make introductions quick and on-brand.</li>
              </ul>
              {!isAuthenticated && (
                <p className="text-neutral-600">
                  Log in when you’re ready to unlock these benefits and streamline your follow-up process.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

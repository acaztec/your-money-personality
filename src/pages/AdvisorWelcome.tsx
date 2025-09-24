import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, TrendingUp, MessageCircle, ArrowRight, Users, Mail, CheckCircle, BarChart3, LogOut } from 'lucide-react';
import { AssessmentService } from '../services/assessmentService';
import { buildAdvisorForwardingCopy, SAMPLE_REPORT_PLACEHOLDER_URL } from '../utils/advisorForwardingCopy';

export default function AdvisorWelcome() {
  const { advisor, logout } = useAuth();
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [lastShareDetails, setLastShareDetails] = useState<{
    clientEmail: string;
    clientName?: string;
    qualifiesForTrial?: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    advisorName: advisor?.name || '',
    advisorEmail: advisor?.email || '',
    clientEmail: '',
    clientName: ''
  });

  const handleCopyLink = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopyFeedback('Link copied to clipboard!');
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setCopyFeedback('Unable to copy automatically. Please copy the link manually.');
      setTimeout(() => setCopyFeedback(''), 4000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/advisor/login');
  };

  const handleShareAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSharing(true);
    setShareError('');
    setShareSuccess(false);
    setGeneratedLink('');
    setCopyFeedback('');
    setLastShareDetails(null);

    const result = await AssessmentService.shareAssessment(
      formData.advisorName,
      formData.advisorEmail,
      formData.clientEmail,
      formData.clientName || undefined
    );

    setIsSharing(false);

    if (result.success) {
      setShareSuccess(true);
      setGeneratedLink(result.assessmentLink || '');
      setCopyFeedback('');
      setLastShareDetails({
        clientEmail: formData.clientEmail,
        clientName: formData.clientName || undefined,
        qualifiesForTrial: result.qualifiesForTrial,
      });
      setFormData({
        advisorName: advisor?.name || '',
        advisorEmail: advisor?.email || '',
        clientEmail: '',
        clientName: ''
      });
    } else {
      setShareError(result.error || 'Failed to share assessment');
      if (result.assessmentLink) {
        setGeneratedLink(result.assessmentLink);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-primary-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
              alt="iGrad Enrich"
              className="h-8 w-auto"
            />
            <div className="flex items-center space-x-4">
              <Link
                to="/advisor/dashboard"
                className="text-primary-100 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/"
                className="text-primary-100 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                For Individuals
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 text-primary-100 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your Client's
            <span className="text-blue-600"> Money Personality</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Unlock the emotional side of your clients' financial decisions. Understand their behavioral patterns, 
            build deeper trust, and provide more personalized financial guidance with our proven assessment.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">500K+</div>
            <div className="text-gray-600">Assessments Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600">Completion Rate</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">10 min</div>
            <div className="text-gray-600">Average Time</div>
          </div>
        </div>

        {/* Share Assessment Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Assessment with Client</h2>
            <p className="text-gray-600">Send a personalized invitation to your client to complete their Money Personality assessment</p>
          </div>

          {shareSuccess && lastShareDetails && (() => {
            const clientLabel = lastShareDetails.clientName?.trim() || lastShareDetails.clientEmail;
            const copy = buildAdvisorForwardingCopy({
              clientDisplayName: clientLabel,
              advisorName: advisor?.name,
            });
            const sampleReportUrl = SAMPLE_REPORT_PLACEHOLDER_URL;

            return (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50/80 p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-900 font-semibold">{copy.headline}</p>
                    <p className="text-green-800 text-sm mt-1">{copy.intro}</p>
                  </div>
                </div>

                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-green-800">
                  {copy.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>

                {lastShareDetails.qualifiesForTrial ? (
                  <div className="mt-4 rounded-lg border border-green-300 bg-white p-4 text-sm text-green-800">
                    <p className="font-semibold text-green-900">Complimentary preview unlocked</p>
                    <p className="mt-1">
                      Because this is your first Money Personality invitation, you'll be able to review {clientLabel}'s full results at no cost once they finish the assessment.
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-green-800">
                    We'll follow up as soon as your client completes the assessment so you can unlock their full Money Personality report.
                  </p>
                )}

                <div className="mt-4 rounded-lg bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">{copy.sample.heading}</p>
                  <p className="mt-1 text-sm text-gray-700">{copy.sample.description}</p>
                  <a
                    href={sampleReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    {copy.sample.ctaLabel}
                  </a>
                </div>

                {generatedLink && (
                  <div className="mt-4 rounded-lg bg-white p-4">
                    <p className="text-sm font-semibold text-gray-900">Need to resend the link?</p>
                    <p className="mt-1 text-sm text-gray-700">
                      Copy the invitation URL below to share it directly with your client if needed.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
                      >
                        Copy link
                      </button>
                    </div>
                    {copyFeedback && <p className="mt-2 text-xs text-gray-600">{copyFeedback}</p>}
                  </div>
                )}

                <p className="mt-4 text-sm text-green-800">
                  {copy.dashboard.description}{' '}
                  <Link to="/advisor/dashboard" className="font-semibold text-green-900 underline-offset-2 hover:underline">
                    {copy.dashboard.ctaLabel}
                  </Link>
                  .
                </p>

                <p className="mt-2 text-xs text-green-700">{copy.closing}</p>
              </div>
            );
          })()}

          {shareError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error: {shareError}</p>
              {generatedLink && (
                <div className="mt-4 text-left">
                  <p className="text-sm text-red-700 mb-2">
                    The assessment link was still created—share it manually while email delivery is unavailable:
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 px-3 py-2 border border-red-200 rounded-lg bg-white text-sm text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                    >
                      Copy link
                    </button>
                  </div>
                  {copyFeedback && (
                    <p className="text-xs text-red-700 mt-2">{copyFeedback}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleShareAssessment} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="advisorName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="advisorName"
                  name="advisorName"
                  required
                  readOnly
                  value={formData.advisorName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label htmlFor="advisorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="advisorEmail"
                  name="advisorEmail"
                  required
                  readOnly
                  value={formData.advisorEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                  placeholder="john@advisorfirm.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email *
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  required
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name (Optional)
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSharing}
                className={`inline-flex items-center px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                  isSharing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-3" />
                    Share Assessment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Behavioral Analysis
            </h3>
            <p className="text-gray-600">
              42 scientifically-designed questions reveal your client's financial personality across five key dimensions.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600">
              Get detailed advisor-specific recommendations on how to communicate and work effectively with each client.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Deeper Client Relationships
            </h3>
            <p className="text-gray-600">
              Build trust and rapport by understanding the emotional drivers behind your clients' financial decisions.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Share Assessment</h4>
              <p className="text-gray-600 text-sm">Send personalized invitation to your client via email</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Client Completes</h4>
              <p className="text-gray-600 text-sm">Client takes 10-minute assessment at their convenience</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Notified</h4>
              <p className="text-gray-600 text-sm">Receive email notification when assessment is complete</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Access Insights</h4>
              <p className="text-gray-600 text-sm">Review detailed results and AI-powered advisor recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
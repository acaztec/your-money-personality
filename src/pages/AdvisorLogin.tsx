import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdvisorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  const from = location.state?.from?.pathname || '/advisor/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignup) {
        if (!formData.name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }

        const result = await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          company: formData.company || undefined
        });

        if (result.success) {
          setSuccess('Account created successfully! Redirecting…');
          setTimeout(() => navigate(from), 1500);
        } else {
          setError(result.error || 'Signup failed');
        }
      } else {
        const result = await login({
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          setSuccess('Login successful! Redirecting…');
          setTimeout(() => navigate(from), 1000);
        } else {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen professional-bg flex flex-col">
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/">
            <img
              src="https://media-cdn.igrad.com/IMAGE/Logos/Standard-White/Enrich.png"
              alt="Enrich"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-primary-700 transition hover:text-primary-900"
          >
            Return to Money Personality
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Advisor access</p>
                <h1 className="text-4xl font-semibold text-primary-900 sm:text-5xl">
                  Support every client’s Money Personality journey.
                </h1>
                <p className="text-lg text-ink/85">
                  Invite clients to complete the assessment, unlock their behavioral insights, and personalize your guidance with Enrich resources.
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-subtle">
                <img
                  src="https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=1"
                  alt="Advisor meeting with clients while reviewing financial plans."
                  className="h-72 w-full object-cover"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Measure progress</p>
                  <p className="mt-2 text-sm text-ink/80">
                    Track completion rates and access Money Personality profiles with a single login.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Personalize coaching</p>
                  <p className="mt-2 text-sm text-ink/80">
                    Use Enrich tools and resources tailored to each behavioral segment.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-[1.25rem] border border-neutral-200 bg-white p-8 shadow-subtle sm:p-10">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-primary-900">
                    {isSignup ? 'Create advisor account' : 'Advisor sign in'}
                  </h2>
                  <p className="text-sm text-ink/80">
                    {isSignup
                      ? 'Set up access for your firm to share assessments with clients.'
                      : 'Log in to manage invitations and review client results.'}
                  </p>
                </div>

                {error && (
                  <div className="mt-6 rounded-xl border border-primary-700/40 bg-white px-4 py-3 text-sm text-primary-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-6 rounded-xl border border-accent-600/40 bg-white px-4 py-3 text-sm text-accent-600">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {isSignup && (
                    <>
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-700">
                          Full name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required={isSignup}
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Jamie Advisor"
                          className="mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                        />
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-neutral-700">
                          Company (optional)
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Your advisory firm"
                          className="mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-700">
                      Email address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="advisor@firm.com"
                      className="mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-neutral-700">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={6}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
                    />
                    {isSignup && (
                      <p className="mt-2 text-xs text-neutral-500">Minimum 6 characters</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (isSignup ? 'Creating account…' : 'Signing in…') : isSignup ? 'Create account' : 'Sign in'}
                  </button>
                </form>

                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                    setSuccess('');
                    setFormData({ email: '', password: '', name: '', company: '' });
                  }}
                  className="mt-6 text-sm font-semibold text-primary-700 transition hover:text-primary-900"
                >
                  {isSignup ? 'Already have an account? Sign in' : "New to Money Personality? Create an advisor account"}
                </button>

                <div className="mt-8 space-y-4">
                  {!isSignup && (
                    <div className="rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-600">
                      <strong className="font-semibold text-primary-900">New advisor?</strong> Create an account to invite clients and track their assessments.
                    </div>
                  )}
                  <div className="rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-600">
                    <strong className="font-semibold text-primary-900">Email confirmation:</strong> After signup, check your inbox for the confirmation link before signing in.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

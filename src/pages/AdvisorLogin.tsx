import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

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
          setSuccess('Account created successfully! Redirecting...');
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
          setSuccess('Login successful! Redirecting...');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-primary-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <img 
                src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
                alt="iGrad Enrich" 
                className="h-8 w-auto"
              />
            </Link>
            <Link
              to="/"
              className="text-primary-100 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              For Individuals
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignup ? 'Create Advisor Account' : 'Advisor Login'}
              </h2>
              <p className="text-gray-600">
                {isSignup 
                  ? 'Join thousands of advisors using Money Personality assessments'
                  : 'Access your client assessments and insights'
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignup && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required={isSignup}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your Financial Firm"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="advisor@firm.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                {isSignup && (
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setSuccess('');
                  setFormData({ email: '', password: '', name: '', company: '' });
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isSignup 
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>

            {!isSignup && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>New User?</strong> Create an account to get started with the Money Personality assessment platform.
                </p>
              </div>
            )}

            {isSignup && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> If you get an authentication error, please try logging in with your new credentials.
                </p>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Demo Account:</strong> For testing, you can use email <code>test@advisor.com</code> with password <code>password123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
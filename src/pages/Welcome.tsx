import { Link } from 'react-router-dom';
import { Brain, TrendingUp, MessageCircle, ArrowRight } from 'lucide-react';

export default function Welcome() {
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
            <Link
              to="/advisor"
              className="text-primary-100 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              For Advisors
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your
            <span className="text-blue-600"> Money Personality</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Take our comprehensive behavioral assessment to understand your financial decision-making patterns, 
            discover your unique money personality, and get personalized insights for better financial wellness.
          </p>
          <Link
            to="/assessment"
            className="btn-primary"
          >
            <span>Take Assessment</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">500K+</div>
            <div className="text-gray-600">People Assessed</div>
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Behavioral Assessment
            </h3>
            <p className="text-gray-600">
              42 scientifically-designed questions analyze your financial behaviors across five key personality dimensions.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personalized Insights
            </h3>
            <p className="text-gray-600">
              Discover your unique money personality with detailed explanations, strengths, challenges, and action plans.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Instant Results
            </h3>
            <p className="text-gray-600">
              Get immediate access to your comprehensive money personality report with actionable insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
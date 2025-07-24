import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, MessageCircle, ArrowRight } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img
            src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
            alt="iGrad Enrich"
            className="h-8 w-auto bg-primary-500 px-3 py-1 rounded"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your
            <span className="text-primary-600"> Money Personality</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Take our comprehensive assessment to understand your financial behaviors, 
            get personalized recommendations, and unlock your path to financial wellness.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center space-x-2 btn-primary text-lg px-8 py-4"
          >
            <span>Start Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personality Assessment
            </h3>
            <p className="text-gray-600">
              42 carefully crafted questions to analyze your financial mindset across five key dimensions.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <TrendingUp className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personalized Insights
            </h3>
            <p className="text-gray-600">
              Get tailored recommendations for tools, courses, and strategies based on your unique profile.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Financial Coach
            </h3>
            <p className="text-gray-600">
              Chat with your personal AI coach for ongoing support and guidance tailored to your personality.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands who have discovered their money personality and improved their financial wellness.
          </p>
          <Link
            to="/assessment"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
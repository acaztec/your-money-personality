import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Profile } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setProfile(JSON.parse(savedProfile));
    
    const savedSummary = localStorage.getItem('advisorSummary');
    if (savedSummary) {
      setAdvisorSummary(savedSummary);
    }
  }, [navigate]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Money Personality Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Money Personality Assessment Results</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Personality Types</h3>
                <div className="space-y-4">
                  {profile.personalities.map((personality, index) => (
                    <div key={personality} className="border-l-4 border-primary-500 pl-4">
                      <h4 className="font-medium text-gray-900 capitalize">{personality.replace('-', ' ')}</h4>
                      <p className="text-sm text-gray-600 mt-1">{profile.descriptions?.[index] || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
                <p className="text-gray-600">
                  Based on the responses, this client's financial personality has been identified using 
                  a rule-based algorithm. This assessment provides insights for financial advisors to 
                  better understand their client's money management style and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Advisor Summary */}
      {/* Personality Chapters */}
      <div className="space-y-8">
        {profile.personalities.map((personality, index) => {
          const categoryMap = {
            'Future Focused': 'Focus',
            'Present Focused': 'Focus',
            'Apprehensive': 'Emotions',
            'Cautious': 'Emotions', 
            'Relaxed': 'Emotions',
            'Confident': 'Outlook',
            'Optimistic': 'Outlook',
            'Skeptical': 'Outlook',
            'Independent': 'Influence',
            'Social': 'Influence',
            'Elusive': 'Influence',
            'Organized': 'Bonus',
            'Fun Seeking': 'Bonus',
            'Change Seeking': 'Bonus'
          };

          const category = categoryMap[personality];
          const chapterNumber = index + 1;

          return (
            <div key={personality} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Chapter Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Chapter {chapterNumber}: {category}
                    </h2>
                    <p className="text-primary-100">Your {category.toUpperCase()} Type</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{chapterNumber}</div>
                    <div className="text-sm text-primary-100">of {profile.personalities.length}</div>
                  </div>
                </div>
              </div>

              {/* Personality Content */}
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{personality}</h3>
                  <p className="text-gray-600">Your {category} personality type</p>
                </div>

                {/* Summary Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {profile.descriptions?.[index] || ''}
                    </p>
                  </div>
                </div>

                {/* What It Means */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">What It Means</h4>
                  <p className="text-gray-700 leading-relaxed">
                    This personality type influences how you approach financial decisions, 
                    manage money, and plan for the future. Understanding these traits can help 
                    you make more informed financial choices.
                  </p>
                </div>

                {/* Strengths and Challenges Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      3 Biggest Strengths
                    </h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-medium">{num}</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Your {personality.toLowerCase()} nature provides unique financial advantages 
                            that can help you achieve your goals.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-orange-600 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      3 Biggest Challenges
                    </h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-orange-600 text-sm font-medium">{num}</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Areas where your {personality.toLowerCase()} tendencies might require 
                            extra attention or different strategies.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Action Items
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <p className="text-blue-800 font-medium mb-3">When you're {personality}...</p>
                    <div className="space-y-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{num}</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-900 mb-1">
                              Actionable step for {personality.toLowerCase()} types
                            </h5>
                            <p className="text-blue-700 text-sm">
                              Specific recommendations tailored to your {personality.toLowerCase()} personality 
                              to help optimize your financial decisions.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Advisor Summary */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Advisor Summary</h2>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-8">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Client Summary</h3>
              <p className="text-sm text-blue-600 mb-4">For Financial Advisor Use Only</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{advisorSummary}</div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
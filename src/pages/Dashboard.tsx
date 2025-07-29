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
        <div className="mb-12">
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

        {/* Resources from bff.enrich */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Financial Wellness Resources</h2>
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Continue Your Financial Journey
            </h3>
            <p className="text-gray-600 mb-6">
              Explore comprehensive financial education resources at bff.enrich.org
            </p>
            <a
              href="https://bff.enrich.org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit bff.enrich.org
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import Layout from '../components/Layout';
import { Heart, Brain, Zap, Target } from 'lucide-react';

const mindfulnessContent = [
  {
    title: 'Financial Stress Management',
    icon: Heart,
    description: 'Learn techniques to manage anxiety and stress related to money',
    duration: '15 min',
    color: 'bg-pink-50 text-pink-600'
  },
  {
    title: 'Mindful Spending',
    icon: Brain,
    description: 'Develop awareness around your spending habits and triggers',
    duration: '20 min',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Goal Visualization',
    icon: Target,
    description: 'Use visualization techniques to achieve your financial goals',
    duration: '12 min',
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'Energy and Money',
    icon: Zap,
    description: 'Understand the relationship between your energy and financial decisions',
    duration: '18 min',
    color: 'bg-yellow-50 text-yellow-600'
  }
];

export default function Mindfulness() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mindfulness & Money</h1>
          <p className="text-gray-600">
            Develop a healthier relationship with money through mindfulness practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {mindfulnessContent.map((content) => (
            <div
              key={content.title}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className={`w-16 h-16 rounded-lg ${content.color} flex items-center justify-center mb-6`}>
                <content.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                {content.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {content.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{content.duration}</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200">
                  Start Practice
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Daily Mindfulness Challenge
          </h2>
          <p className="text-gray-600 mb-6">
            Take 5 minutes each day to reflect on your financial decisions and emotions.
          </p>
          <button className="btn-primary">
            Start Today's Challenge
          </button>
        </div>
      </div>
    </Layout>
  );
}
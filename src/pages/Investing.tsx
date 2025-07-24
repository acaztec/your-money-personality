import React from 'react';
import Layout from '../components/Layout';
import { TrendingUp, PieChart, DollarSign, BarChart3 } from 'lucide-react';

const investingTopics = [
  {
    title: 'Investment Basics',
    icon: TrendingUp,
    description: 'Learn the fundamentals of investing and building wealth',
    lessons: 8,
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'Portfolio Diversification',
    icon: PieChart,
    description: 'Understand how to spread risk across different investments',
    lessons: 6,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Risk Management',
    icon: BarChart3,
    description: 'Learn to assess and manage investment risks',
    lessons: 5,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    title: 'Retirement Investing',
    icon: DollarSign,
    description: 'Strategies for long-term retirement wealth building',
    lessons: 7,
    color: 'bg-purple-50 text-purple-600'
  }
];

export default function Investing() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investing Classroom</h1>
          <p className="text-gray-600">
            Master the fundamentals of investing and build long-term wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {investingTopics.map((topic) => (
            <div
              key={topic.title}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className={`w-16 h-16 rounded-lg ${topic.color} flex items-center justify-center mb-6`}>
                <topic.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                {topic.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {topic.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{topic.lessons} lessons</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200">
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Start Investing?
            </h2>
            <p className="text-gray-600 mb-6">
              Take our investment risk assessment to get personalized recommendations 
              based on your financial goals and risk tolerance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Take Risk Assessment
              </button>
              <button className="btn-secondary">
                Browse All Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
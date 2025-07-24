import React from 'react';
import Layout from '../components/Layout';
import { BookOpen, TrendingUp, Shield, GraduationCap, Car, Home } from 'lucide-react';

const topics = [
  {
    title: 'Banking',
    icon: TrendingUp,
    description: 'Learn about banking services, accounts, and financial institutions',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Tech',
    icon: BookOpen,
    description: 'Explore financial technology and digital banking solutions',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Budgeting',
    icon: TrendingUp,
    description: 'Master the art of creating and maintaining a budget',
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'Retirement',
    icon: Shield,
    description: 'Plan for your future with retirement savings strategies',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    title: 'Behavioral Finance',
    icon: BookOpen,
    description: 'Understand the psychology behind financial decisions',
    color: 'bg-pink-50 text-pink-600'
  },
  {
    title: 'Consumer Protection',
    icon: Shield,
    description: 'Learn how to protect yourself from financial fraud and scams',
    color: 'bg-red-50 text-red-600'
  },
  {
    title: 'Spending Less',
    icon: TrendingUp,
    description: 'Discover strategies to reduce expenses and save money',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    title: 'Preparing for College',
    icon: GraduationCap,
    description: 'Financial planning for higher education expenses',
    color: 'bg-yellow-50 text-yellow-600'
  }
];

export default function Topics() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Topics</h1>
          <p className="text-gray-600">
            Explore comprehensive resources across key financial wellness areas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-lg ${topic.color} flex items-center justify-center mb-4`}>
                <topic.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                {topic.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
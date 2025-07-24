import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PersonalityCard from '../components/PersonalityCard';
import ToolCard from '../components/ToolCard';
import CourseCard from '../components/CourseCard';
import ChatPanel from '../components/ChatPanel';
import { Profile, Tool, Course } from '../types';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAllTools, setShowAllTools] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setProfile(JSON.parse(savedProfile));
  }, [navigate]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  const getRecommendedTools = (): Tool[] => {
    return toolsData.filter(tool => 
      tool.personalities.includes('all') || 
      tool.personalities.some(p => profile.personalities.includes(p))
    );
  };

  const getRecommendedCourses = (): Course[] => {
    return coursesData.filter(course => 
      course.personalities.some(p => profile.personalities.includes(p))
    );
  };

  const recommendedTools = getRecommendedTools();
  const recommendedCourses = getRecommendedCourses();
  const displayedTools = showAllTools ? toolsData : recommendedTools.slice(0, 6);
  const displayedCourses = showAllCourses ? coursesData : recommendedCourses.slice(0, 6);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">
            Based on your assessment, here's your personalized financial wellness dashboard.
          </p>
        </div>

        {/* Personality Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Money Personalities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <PersonalityCard
              title="Emotional Management"
              score={profile.emotions}
              type="emotions"
            />
            <PersonalityCard
              title="Future Outlook"
              score={profile.outlook}
              type="outlook"
            />
            <PersonalityCard
              title="Financial Focus"
              score={profile.focus}
              type="focus"
            />
            <PersonalityCard
              title="Decision Influence"
              score={profile.influence}
              type="influence"
            />
            <PersonalityCard
              title="Risk Tolerance"
              score={profile.riskTolerance}
              type="riskTolerance"
            />
          </div>
        </div>

        {/* Recommended Tools */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {showAllTools ? 'All Tools' : 'Recommended Tools'}
            </h2>
            <button
              onClick={() => setShowAllTools(!showAllTools)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              {showAllTools ? 'Show Recommended' : 'View All Tools'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {showAllCourses ? 'All Courses' : 'Recommended Courses'}
            </h2>
            <button
              onClick={() => setShowAllCourses(!showAllCourses)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              {showAllCourses ? 'Show Recommended' : 'View All Courses'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>

      <ChatPanel profile={profile} />
    </Layout>
  );
}
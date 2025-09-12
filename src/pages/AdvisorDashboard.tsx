import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AssessmentService } from '../services/assessmentService';
import { AdvisorAssessment } from '../types';
import { 
  Users, 
  Mail, 
  Clock, 
  CheckCircle, 
  Eye, 
  Plus, 
  BarChart3, 
  Calendar,
  ExternalLink,
  LogOut
} from 'lucide-react';

export default function AdvisorDashboard() {
  const { advisor, logout } = useAuth();
  const [assessments, setAssessments] = useState<AdvisorAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAssessments = () => {
    if (advisor) {
      const advisorAssessments = AssessmentService.getAssessmentsForAdvisor(advisor.email);
      setAssessments(advisorAssessments);
    }
  };

  useEffect(() => {
    loadAssessments();
    setIsLoading(false);
  }, [advisor]);

  useEffect(() => {
    // Listen for storage changes to refresh assessments
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'advisor_assessments') {
        loadAssessments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [advisor]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen professional-bg flex items-center justify-center">
        <div className="modern-card text-center space-y-6">
          <div className="w-20 h-20 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const pendingAssessments = assessments.filter(a => a.status === 'sent');

  return (
    <div className="min-h-screen professional-bg">
      {/* Header */}
      <div className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <img 
                src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
                alt="iGrad Enrich" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Welcome, {advisor?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-primary-100 hover:text-white transition-colors duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="modern-card mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {advisor?.name}!
              </h1>
              <p className="text-gray-600">
                Manage your client assessments and view results from your dashboard.
              </p>
            </div>
            <Link
              to="/advisor/share"
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Share New Assessment
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedAssessments.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingAssessments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assessments.length > 0 ? Math.round((completedAssessments.length / assessments.length) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Assessments Table */}
        <div className="modern-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Client Assessments</h2>
            {assessments.length === 0 && (
              <Link
                to="/advisor/share"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Share your first assessment →
              </Link>
            )}
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-600 mb-6">
                Start by sharing the Money Personality assessment with your clients.
              </p>
              <Link to="/advisor/share" className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Share Assessment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Sent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Completed</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {assessment.clientName || 'Anonymous Client'}
                          </div>
                          <div className="text-sm text-gray-600">{assessment.clientEmail}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assessment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {assessment.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(assessment.sentAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {assessment.completedAt ? (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(assessment.completedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {assessment.status === 'completed' ? (
                            <button
                              onClick={() => window.open(`/dashboard?advisor=${assessment.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="View Results"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(assessment.assessmentLink);
                                alert('Assessment link copied to clipboard!');
                              }}
                              className="text-gray-600 hover:text-gray-700 p-1"
                              title="Copy Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
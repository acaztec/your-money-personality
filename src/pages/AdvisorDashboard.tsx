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
  LogOut,
  Trash2
} from 'lucide-react';

export default function AdvisorDashboard() {
  const { advisor, logout } = useAuth();
  const [assessments, setAssessments] = useState<AdvisorAssessment[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; assessmentId: string; clientName?: string }>({
    isOpen: false,
    assessmentId: '',
    clientName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadAssessments = () => {
    // Keep the localStorage version for now, but we could switch to database version
    if (advisor) {
      const advisorAssessments = AssessmentService.getAssessmentsForAdvisor(advisor.email);
      setAssessments(advisorAssessments);
    }
  };

  const loadAssessmentResults = async () => {
    if (advisor) {
      const results = await AssessmentService.getAssessmentResultsForAdvisor(advisor.email);
      setAssessmentResults(results);
    }
  };
  useEffect(() => {
    loadAssessments();
    loadAssessmentResults();
    setIsLoading(false);
  }, [advisor]);

  useEffect(() => {
    // Listen for storage changes to refresh assessments
    const handleStorageChange = (e: StorageEvent) => {
      console.log('📡 Storage event detected:', e.key);
      if (e.key === 'advisor_assessments') {
        console.log('🔄 Refreshing assessments due to storage change');
        loadAssessments();
        loadAssessmentResults();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage events (for same-window updates)
    const handleCustomStorageChange = () => {
      console.log('🔄 Custom storage event - refreshing assessments');
      loadAssessments();
      loadAssessmentResults();
    };
    
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);
    
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [advisor]);

  const handleLogout = () => {
    logout();
  };

  const handleViewResults = (assessmentId: string) => {
    window.open(`/dashboard?advisor=${assessmentId}`, '_blank');
  };

  const handleDeleteClick = (assessmentId: string, clientName?: string) => {
    setDeleteConfirm({
      isOpen: true,
      assessmentId,
      clientName
    });
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.assessmentId) return;

    setIsDeleting(true);
    setDeleteError('');

    const result = await AssessmentService.deleteAssessment(deleteConfirm.assessmentId);
    
    setIsDeleting(false);
    
    if (result.success) {
      // Reload data after successful deletion
      loadAssessments();
      loadAssessmentResults();
      setDeleteConfirm({ isOpen: false, assessmentId: '', clientName: '' });
    } else {
      setDeleteError(result.error || 'Failed to delete assessment');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, assessmentId: '', clientName: '' });
    setDeleteError('');
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

  const completedAssessments = assessmentResults;
  const pendingAssessments = assessments.filter(a => a.status === 'sent');
  const totalAssessments = assessments.length;

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
                <p className="text-2xl font-bold text-gray-900">{totalAssessments}</p>
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
                  {totalAssessments > 0 ? Math.round((completedAssessments.length / totalAssessments) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Assessment Results Table */}
        <div className="modern-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Completed Assessments</h2>
            {completedAssessments.length === 0 && (
              <Link
                to="/advisor/share"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Share your first assessment →
              </Link>
            )}
          </div>

          {completedAssessments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed assessments yet</h3>
              <p className="text-gray-600 mb-6">
                Once clients complete their assessments, their results will appear here.
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Personality Types</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Completed</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedAssessments.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {result.client_name || 'Anonymous Client'}
                          </div>
                          <div className="text-sm text-gray-600">{result.client_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {result.profile?.personalities?.slice(0, 2).map((personality: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {personality}
                            </span>
                          ))}
                          {result.profile?.personalities?.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{result.profile.personalities.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(result.completed_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewResults(result.assessment_id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View Results"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(result.assessment_id, result.client_name)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete Assessment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Assessments Section */}
        {pendingAssessments.length > 0 && (
          <div className="modern-card mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Assessments</h2>
              <span className="text-sm text-gray-500">{pendingAssessments.length} waiting for completion</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Sent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingAssessments.map((assessment) => (
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(assessment.sentAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
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
                          <button
                            onClick={() => handleDeleteClick(assessment.id, assessment.clientName)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete Assessment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Assessment</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the assessment for{' '}
                <strong>{deleteConfirm.clientName || 'this client'}</strong>? This will permanently 
                remove all assessment data and results.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{deleteError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
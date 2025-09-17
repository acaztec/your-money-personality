import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AssessmentService,
  DatabaseAdvisorAssessment,
  DatabaseAssessmentResult,
} from '../services/assessmentService';
import { AdvisorAssessment } from '../types';
import {
  Users,
  Clock,
  CheckCircle,
  Eye,
  Plus,
  Calendar,
  ExternalLink,
  LogOut,
  Trash2,
  Lock,
  CreditCard,
  Loader2,
  AlertTriangle,
  Unlock,
  X
} from 'lucide-react';

export default function AdvisorDashboard() {
  const { advisor, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [assessments, setAssessments] = useState<DatabaseAdvisorAssessment[]>([]);
  const [unlockedResults, setUnlockedResults] = useState<Record<string, DatabaseAssessmentResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; assessmentId: string; clientName?: string }>({
    isOpen: false,
    assessmentId: '',
    clientName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const advisorEmail = advisor?.email ?? null;
  const advisorName = advisor?.name ?? '';

  const refreshData = useCallback(
    async (showSpinner = true) => {
      if (!advisorEmail) {
        if (showSpinner) {
          setIsLoading(false);
        }
        return;
      }

      if (showSpinner) {
        setIsLoading(true);
      }

      try {
        const [dbAssessments, dbResults] = await Promise.all([
          AssessmentService.getAssessmentsForAdvisorFromDatabase(advisorEmail),
          AssessmentService.getUnlockedAssessmentResultsForAdvisor(advisorEmail),
        ]);

        if (dbAssessments.length > 0) {
          setAssessments(dbAssessments);
        } else {
          const fallback = AssessmentService.getAssessmentsForAdvisor(advisorEmail);

          if (fallback.length > 0) {
            const normalized: DatabaseAdvisorAssessment[] = fallback.map((item: AdvisorAssessment) => ({
              id: item.id,
              advisor_email: advisorEmail,
              advisor_name: advisorName || item.advisorName,
              client_email: item.clientEmail,
              client_name: item.clientName,
              status: item.status === 'sent' ? 'sent' : 'completed',
              assessment_link: item.assessmentLink,
              sent_at:
                item.sentAt instanceof Date
                  ? item.sentAt.toISOString()
                  : item.sentAt
                    ? new Date(item.sentAt).toISOString()
                    : new Date().toISOString(),
              completed_at:
                item.completedAt instanceof Date
                  ? item.completedAt.toISOString()
                  : item.completedAt
                    ? new Date(item.completedAt).toISOString()
                    : undefined,
              is_paid: false,
              paid_at: null,
              last_checkout_session_id: null,
            }));

            setAssessments(normalized);
          } else {
            setAssessments([]);
          }
        }

        // Create a stable object reference to prevent infinite re-renders
        setUnlockedResults(prevResults => {
          const newResults: Record<string, DatabaseAssessmentResult> = {};
          dbResults.forEach(result => {
            newResults[result.assessment_id] = result;
          });
          
          // Check if the results have actually changed
          const currentKeys = Object.keys(prevResults);
          const newKeys = Object.keys(newResults);
          
          if (currentKeys.length !== newKeys.length) {
            return newResults;
          }
          
          for (const key of newKeys) {
            if (!prevResults[key] || prevResults[key].id !== newResults[key].id) {
              return newResults;
            }
          }
          
          // No changes, return previous state to maintain reference stability
          return prevResults;
        });
      } catch (error) {
        console.error('Failed to load advisor dashboard data:', error);
      } finally {
        if (showSpinner) {
          setIsLoading(false);
        }
      }
    },
    [advisorEmail, advisorName],
  );

  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'advisor_assessments') {
        refreshData(false);
      }
    };

    const handleCustomStorageChange = () => {
      refreshData(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
    };
  }, [refreshData]);

  useEffect(() => {
    const success = searchParams.get('checkoutSuccess');
    const cancelled = searchParams.get('checkoutCancelled');

    if (success === '1') {
      setBanner({ type: 'success', message: 'Payment received! Unlocking your report now.' });
      refreshData(false);
    } else if (cancelled === '1') {
      setBanner({ type: 'info', message: 'Checkout was cancelled. No payment was taken.' });
    }

    if (success || cancelled) {
      const next = new URLSearchParams(searchParams);
      next.delete('checkoutSuccess');
      next.delete('checkoutCancelled');
      next.delete('session_id');
      next.delete('assessment');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, refreshData]);

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
      await refreshData(false);
      setDeleteConfirm({ isOpen: false, assessmentId: '', clientName: '' });
    } else {
      setDeleteError(result.error || 'Failed to delete assessment');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, assessmentId: '', clientName: '' });
    setDeleteError('');
  };

  const handleUnlock = async (assessmentId: string) => {
    if (!advisorEmail) {
      setBanner({ type: 'error', message: 'You must be logged in to unlock a report.' });
      return;
    }

    setCheckoutLoadingId(assessmentId);
    setBanner(null);

    const successUrl = `${window.location.origin}/advisor/dashboard?checkoutSuccess=1&assessment=${assessmentId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/advisor/dashboard?checkoutCancelled=1&assessment=${assessmentId}`;

    const result = await AssessmentService.startCheckout(assessmentId, successUrl, cancelUrl);

    setCheckoutLoadingId(null);

    if (!result.success || !result.url) {
      setBanner({ type: 'error', message: result.error || 'Failed to start checkout. Please try again.' });
      return;
    }

    window.location.href = result.url;
  };

  const bannerTheme = useMemo(() => {
    if (!banner) {
      return null;
    }

    switch (banner.type) {
      case 'success':
        return {
          className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />,
        };
      case 'error':
        return {
          className: 'border-red-200 bg-red-50 text-red-700',
          icon: <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />,
        };
      default:
        return {
          className: 'border-blue-200 bg-blue-50 text-blue-700',
          icon: <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />,
        };
    }
  }, [banner]);

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

  const completedAssessments = useMemo(
    () => assessments.filter(assessment => assessment.status === 'completed'),
    [assessments],
  );
  
  const pendingAssessments = useMemo(
    () => assessments.filter(assessment => assessment.status !== 'completed'),
    [assessments],
  );
  
  // Memoize the unlocked count with stable dependencies
  const unlockedCount = useMemo(() => {
    return completedAssessments.filter(assessment => {
      const result = unlockedResults[assessment.id];
      return result && result.is_unlocked;
    }).length;
  }, [completedAssessments, unlockedResults]);
  
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

        {banner && bannerTheme && (
          <div className={`mb-6 rounded-xl border p-4 flex items-start justify-between ${bannerTheme.className}`}>
            <div className="flex items-start space-x-3">
              {bannerTheme.icon}
              <p className="text-sm leading-6">{banner.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="ml-4 text-sm opacity-60 hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
                <p className="text-sm font-medium text-gray-600">Unlocked Reports</p>
                <p className="text-2xl font-bold text-emerald-600">{unlockedCount}</p>
              </div>
              <Unlock className="w-8 h-8 text-emerald-600" />
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
                  {completedAssessments.map(assessment => {
                    const unlockedResult = unlockedResults[assessment.id];
                    const isUnlocked = Boolean(unlockedResult);
                    const isPaid = assessment.is_paid;
                    const isUnlocking = isPaid && !isUnlocked;

                    return (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {assessment.client_name || 'Anonymous Client'}
                            </div>
                            <div className="text-sm text-gray-600">{assessment.client_email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {isUnlocked ? (
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                const personalities = Array.isArray(unlockedResult?.profile?.personalities)
                                  ? (unlockedResult?.profile?.personalities as string[])
                                  : [];

                                return (
                                  <>
                                    {personalities.slice(0, 2).map((personality: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {personality}
                                      </span>
                                    ))}
                                    {personalities.length > 2 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        +{personalities.length - 2} more
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <Lock className="w-4 h-4 mr-2 text-gray-400" />
                              {isUnlocking ? 'Processing payment...' : 'Unlock to view the full report'}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {isUnlocked ? (
                              <button
                                onClick={() => handleViewResults(assessment.id)}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Results
                              </button>
                            ) : !isPaid ? (
                              <button
                                onClick={() => handleUnlock(assessment.id)}
                                disabled={checkoutLoadingId === assessment.id}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {checkoutLoadingId === assessment.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CreditCard className="w-4 h-4 mr-2" />
                                )}
                                {checkoutLoadingId === assessment.id ? 'Redirecting…' : 'Unlock report ($1)'}
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Unlocking...
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteClick(assessment.id, assessment.client_name)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  {pendingAssessments.map(assessment => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {assessment.client_name || 'Anonymous Client'}
                          </div>
                          <div className="text-sm text-gray-600">{assessment.client_email}</div>
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
                          {assessment.sent_at ? new Date(assessment.sent_at).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(assessment.assessment_link);
                              alert('Assessment link copied to clipboard!');
                            }}
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="Copy Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(assessment.id, assessment.client_name)}
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
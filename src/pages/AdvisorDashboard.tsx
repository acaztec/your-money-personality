import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AssessmentService,
  DatabaseAdvisorAssessment,
  DatabaseAssessmentResult,
} from '../services/assessmentService';
import { AdvisorAssessment } from '../types';

export default function AdvisorDashboard() {
  const { advisor, logout } = useAuth();
  const [assessments, setAssessments] = useState<DatabaseAdvisorAssessment[]>([]);
  const [unlockedResults, setUnlockedResults] = useState<DatabaseAssessmentResult[]>([]);
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
      const currentAdvisorEmail = advisor?.email;
      const currentAdvisorName = advisor?.name || '';

      if (!currentAdvisorEmail) {
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
          AssessmentService.getAssessmentsForAdvisorFromDatabase(currentAdvisorEmail, currentAdvisorName),
          AssessmentService.getUnlockedAssessmentResultsForAdvisor(currentAdvisorEmail),
        ]);

        if (dbAssessments.length > 0) {
          setAssessments(dbAssessments);
        } else {
          const fallback = AssessmentService.getAssessmentsForAdvisor(currentAdvisorEmail);

          if (fallback.length > 0) {
            const normalized: DatabaseAdvisorAssessment[] = fallback.map((item: AdvisorAssessment) => ({
              id: item.id,
              advisor_email: currentAdvisorEmail,
              advisor_name: currentAdvisorName || item.advisorName,
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
              is_trial: item.isTrial ?? false,
              confirmation_sent_at:
                item.confirmationSentAt instanceof Date
                  ? item.confirmationSentAt.toISOString()
                  : item.confirmationSentAt ?? null,
            }));

            setAssessments(normalized);
          } else {
            setAssessments([]);
          }
        }

        setUnlockedResults(dbResults);
      } catch (error) {
        console.error('Failed to load advisor dashboard data:', error);
      } finally {
        if (showSpinner) {
          setIsLoading(false);
        }
      }
    },
    [advisor?.email, advisor?.name],
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

    const result = await AssessmentService.unlockAssessment(assessmentId);

    setCheckoutLoadingId(null);

    if (!result.success) {
      setBanner({ type: 'error', message: result.error || 'Failed to unlock report. Please try again.' });
      return;
    }

    setBanner({ type: 'success', message: 'Report unlocked successfully for demo purposes.' });
    await refreshData(false);
  };

  const bannerTheme = useMemo(() => {
    if (!banner) {
      return null;
    }

    switch (banner.type) {
      case 'success':
        return {
          container: 'border border-accent-600/50 bg-white text-neutral-700',
          label: 'Success',
          accent: 'text-accent-600',
        };
      case 'error':
        return {
          container: 'border border-primary-700/40 bg-white text-neutral-700',
          label: 'Attention',
          accent: 'text-primary-700',
        };
      default:
        return {
          container: 'border border-primary-500/40 bg-white text-neutral-700',
          label: 'Notice',
          accent: 'text-primary-500',
        };
    }
  }, [banner]);

  const completedAssessments = useMemo(
    () => assessments.filter(assessment => assessment.status === 'completed'),
    [assessments],
  );

  const pendingAssessments = useMemo(
    () => assessments.filter(assessment => assessment.status !== 'completed'),
    [assessments],
  );

  const unlockedResultsMap = useMemo(() => {
    const map: Record<string, DatabaseAssessmentResult> = {};
    unlockedResults.forEach(result => {
      map[result.assessment_id] = result;
    });
    return map;
  }, [unlockedResults]);

  const unlockedCount = useMemo(() => {
    return completedAssessments.filter(assessment => {
      const result = unlockedResultsMap[assessment.id];
      return result && result.is_unlocked;
    }).length;
  }, [completedAssessments, unlockedResultsMap]);

  if (isLoading) {
    return (
      <div className="min-h-screen professional-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white px-8 py-10 text-center shadow-subtle">
          <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-primary-300 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Loading</p>
          <h2 className="mt-2 text-lg font-semibold text-primary-900">Preparing your advisor workspace…</h2>
        </div>
      </div>
    );
  }

  const totalAssessments = assessments.length;

  return (
    <div className="min-h-screen professional-bg">
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/">
            <img
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
              alt="Enrich"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <span className="hidden sm:inline">Welcome back, {advisorName || 'Advisor'}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-neutral-300 px-4 py-2 font-semibold text-neutral-700 transition hover:border-primary-500 hover:text-primary-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="modern-card mb-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Advisor workspace</p>
              <h1 className="mt-3 text-3xl font-semibold text-primary-900 sm:text-4xl">
                Welcome back, {advisorName || 'Advisor'}.
              </h1>
              <p className="mt-4 text-lg text-neutral-700">
                Monitor Money Personality invitations, unlock completed reports, and keep clients moving toward measurable financial wellness.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/advisor/share" className="btn-primary">
                  Share new assessment
                </Link>
                <a
                  href="https://www.enrich.org/financial-wellness-resources"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Advisor resource center
                </a>
              </div>
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white/80 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Current invitations</dt>
                  <dd className="mt-2 text-2xl font-semibold text-primary-900">{pendingAssessments.length}</dd>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white/80 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Reports unlocked</dt>
                  <dd className="mt-2 text-2xl font-semibold text-primary-900">{unlockedCount}</dd>
                </div>
              </dl>
            </div>
            <div className="hidden lg:block">
              <div className="placeholder-image flex h-full min-h-[240px] items-center justify-center rounded-[1.25rem]">
                Advisor team reviewing Money Personality results — photography placeholder
              </div>
            </div>
          </div>
        </section>

        {banner && bannerTheme && (
          <div className={`mb-10 flex items-start justify-between gap-6 rounded-xl px-6 py-5 shadow-sm ${bannerTheme.container}`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${bannerTheme.accent}`}>
                {bannerTheme.label}
              </p>
              <p className="mt-2 text-sm text-neutral-700">{banner.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{
            label: 'Clients engaged',
            value: totalAssessments,
          }, {
            label: 'Assessments completed',
            value: completedAssessments.length,
          }, {
            label: 'In progress',
            value: pendingAssessments.length,
          }, {
            label: 'Unlocked insights',
            value: unlockedCount,
          }].map(stat => (
            <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-primary-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="modern-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-primary-900">Completed assessments</h2>
              <p className="text-sm text-neutral-600">Unlock Money Personality profiles and share tailored coaching plans.</p>
            </div>
            <Link to="/advisor/share" className="btn-secondary">
              Send another invitation
            </Link>
          </div>

          {completedAssessments.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white/70 px-6 py-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">No results yet</p>
              <h3 className="mt-3 text-xl font-semibold text-primary-900">Invite a client to experience the assessment.</h3>
              <p className="mt-3 text-neutral-600">
                Once clients finish their Money Personality assessment, their full report appears in this workspace.
              </p>
              <Link to="/advisor/share" className="btn-primary mt-6">
                Share the assessment link
              </Link>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 pr-4">Personality focus</th>
                    <th className="py-3 pr-4">Completed</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm">
                  {completedAssessments.map(assessment => {
                    const unlockedResult = unlockedResultsMap[assessment.id];
                    const isUnlocked = Boolean(unlockedResult);
                    const isPaid = assessment.is_paid;
                    const isUnlocking = isPaid && !isUnlocked;

                    const personalities = isUnlocked && Array.isArray(unlockedResult?.profile?.personalities)
                      ? (unlockedResult?.profile?.personalities as string[])
                      : [];

                    return (
                      <tr key={assessment.id} className="align-top hover:bg-neutral-100/40">
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-primary-900">{assessment.client_name || 'Anonymous Client'}</p>
                          <p className="mt-1 text-xs text-neutral-500">{assessment.client_email}</p>
                        </td>
                        <td className="py-4 pr-4">
                          {isUnlocked ? (
                            <div className="flex flex-wrap gap-2">
                              {personalities.slice(0, 3).map((personality, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700"
                                >
                                  {personality}
                                </span>
                              ))}
                              {personalities.length > 3 && (
                                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                                  +{personalities.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-500">
                              {isUnlocking ? 'Processing payment…' : 'Unlock this report to view the full profile.'}
                            </p>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-neutral-600">
                          {assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 pr-0">
                          <div className="flex flex-wrap gap-2">
                            {isUnlocked ? (
                              <button
                                type="button"
                                onClick={() => handleViewResults(assessment.id)}
                                className="rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
                              >
                                View results
                              </button>
                            ) : !isPaid ? (
                              <button
                                type="button"
                                onClick={() => handleUnlock(assessment.id)}
                                disabled={checkoutLoadingId === assessment.id}
                                className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {checkoutLoadingId === assessment.id ? 'Unlocking…' : 'Unlock report'}
                              </button>
                            ) : (
                              <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-600">
                                {isUnlocking ? 'Unlocking…' : 'Payment received'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(assessment.id, assessment.client_name)}
                              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-primary-500 hover:text-primary-700"
                            >
                              Remove
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
        </section>

        <section className="modern-card mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-primary-900">Pending invitations</h2>
              <p className="text-sm text-neutral-600">Follow up with clients who have not yet completed the assessment.</p>
            </div>
            <Link to="/advisor/share" className="btn-secondary">
              Invite another client
            </Link>
          </div>

          {pendingAssessments.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white/70 px-6 py-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">All invitations completed</p>
              <h3 className="mt-3 text-xl font-semibold text-primary-900">Every client has submitted their Money Personality assessment.</h3>
              <p className="mt-3 text-neutral-600">
                Send a new invitation to expand your insights across your client base.
              </p>
              <Link to="/advisor/share" className="btn-primary mt-6">
                Share the assessment link
              </Link>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Sent</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm">
                  {pendingAssessments.map(assessment => (
                    <tr key={assessment.id} className="align-top hover:bg-neutral-100/40">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-primary-900">{assessment.client_name || 'Anonymous Client'}</p>
                        <p className="mt-1 text-xs text-neutral-500">{assessment.client_email}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                          Pending completion
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-neutral-600">
                        {assessment.sent_at ? new Date(assessment.sent_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 pr-0">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(assessment.assessment_link);
                              alert('Assessment link copied to clipboard!');
                            }}
                            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-primary-500 hover:text-primary-700"
                          >
                            Copy link
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(assessment.id, assessment.client_name)}
                            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-primary-500 hover:text-primary-700"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 shadow-subtle">
            <h3 className="text-2xl font-semibold text-primary-900">Delete assessment</h3>
            <p className="mt-3 text-sm text-neutral-600">
              Removing this invitation permanently deletes any associated progress or results for{' '}
              <strong className="font-semibold text-primary-900">{deleteConfirm.clientName || 'this client'}</strong>.
            </p>

            {deleteError && (
              <div className="mt-6 rounded-xl border border-primary-700/40 bg-white px-4 py-3 text-sm text-primary-700">
                {deleteError}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-primary-500 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Delete assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

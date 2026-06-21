'use client';

import React, { useEffect, useState } from 'react';
import { formService } from '@/services/formService';
import type { Submission, FormType, SubmissionStatus } from '@/types';
import { format } from 'date-fns';
import { Download, Edit2, Trash2, Loader2, AlertCircle, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown, X, Eye } from 'lucide-react';
import Link from 'next/link';
import FormViewModal from '@/components/forms/FormViewModal';

export default function SubmissionTable() {
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [formType, setFormType] = useState('');
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<'formName' | 'dateApplied' | 'employeeName' | 'status'>('dateApplied');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query a large limit to allow complete client-side search and sorting
      const data = await formService.getHistory({
        page: 1,
        limit: 1000,
      });
      setAllSubmissions(data.submissions || []);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load submission history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, formType, status, language]);

  const handleDeleteDraft = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await formService.deleteDraft(id);
      fetchSubmissions();
    } catch (err) {
      alert('Failed to delete draft');
    }
  };

  const handleDownloadPdf = async (id: string, type: FormType) => {
    setDownloadingId(id);
    try {
      const filename = `${type}_${id.slice(-6)}.pdf`;
      await formService.downloadPdf(id, filename);
    } catch (err) {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getFormName = (type: FormType) => {
    switch (type) {
      case 'casual_leave_nrsc':
        return 'Casual Leave — NRSC';
      case 'earned_leave':
        return 'Earned/Medical Leave';
      case 'casual_leave_rrsc':
        return 'CL/Spl CL/Comp Off — RRSC-W';
      case 'trainee_biodata':
        return 'Trainee Bio-Data';
      default:
        return type;
    }
  };

  const getEmployeeName = (sub: Submission) => {
    const data = sub.formData || {};
    return String(data.applicantName || data.studentName || 'N/A');
  };

  const getLanguageLabel = (lang: string) => {
    return lang === 'hi' ? 'Hindi / हिंदी' : 'English';
  };

  const getStatusPill = (status: SubmissionStatus) => {
    const classes: Record<SubmissionStatus, string> = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      returned: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${classes[status] || classes.draft}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleSort = (field: 'formName' | 'dateApplied' | 'employeeName' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field: 'formName' | 'dateApplied' | 'employeeName' | 'status') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 inline-block ml-1 align-text-bottom" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0B3C6D] inline-block ml-1 align-text-bottom font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0B3C6D] inline-block ml-1 align-text-bottom font-bold" />
    );
  };

  // Client-side filtering
  const filteredSubmissions = allSubmissions.filter((sub) => {
    if (formType && sub.formType !== formType) return false;
    if (status && sub.status !== status) return false;
    if (language && sub.language !== language) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fName = getFormName(sub.formType).toLowerCase();
      const eName = getEmployeeName(sub).toLowerCase();
      const eCode = String(sub.formData?.employeeCode || '').toLowerCase();
      if (!fName.includes(q) && !eName.includes(q) && !eCode.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Client-side sorting
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let valA: any = '';
    let valB: any = '';

    if (sortField === 'formName') {
      valA = getFormName(a.formType);
      valB = getFormName(b.formType);
    } else if (sortField === 'dateApplied') {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    } else if (sortField === 'employeeName') {
      valA = getEmployeeName(a);
      valB = getEmployeeName(b);
    } else if (sortField === 'status') {
      valA = a.status;
      valB = b.status;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Client-side pagination
  const totalItems = sortedSubmissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedSubmissions = sortedSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-[#D9E2EC] rounded-lg shadow-sm">
        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="search-query" className="text-xs font-bold text-[#486581]">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9FB3C8]" />
            <input
              id="search-query"
              type="text"
              placeholder="Search employee or form..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input py-1.5 pl-9 pr-3 text-sm w-full"
              style={{ height: '38px', borderRadius: '8px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Form Type Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-type" className="text-xs font-bold text-[#486581]">Form Type</label>
          <select
            id="filter-type"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="form-input py-1.5 text-sm w-full"
            style={{ height: '38px', borderRadius: '8px' }}
          >
            <option value="">All Form Types</option>
            <option value="casual_leave_nrsc">Casual Leave (NRSC)</option>
            <option value="earned_leave">Earned/Medical Leave</option>
            <option value="casual_leave_rrsc">CL/Spl CL/Comp Off (RRSC-W)</option>
            <option value="trainee_biodata">Trainee Bio-Data</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-status" className="text-xs font-bold text-[#486581]">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input py-1.5 text-sm w-full"
            style={{ height: '38px', borderRadius: '8px' }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-language" className="text-xs font-bold text-[#486581]">Language</label>
          <select
            id="filter-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-input py-1.5 text-sm w-full"
            style={{ height: '38px', borderRadius: '8px' }}
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F] rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-[#D9E2EC] rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-[#0B3C6D] animate-spin" />
            <span className="text-sm text-[#6B7280]">Loading submission history...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-[#9FB3C8] mx-auto mb-3" />
            <p className="text-[#486581] font-semibold">No submissions found</p>
            <p className="text-xs text-[#6B7280] mt-1">Try relaxing your filters or fill out a new application.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E4E7EB]">
                  <th
                    onClick={() => handleSort('formName')}
                    className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    Form Name {renderSortIndicator('formName')}
                  </th>
                  <th
                    onClick={() => handleSort('employeeName')}
                    className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    Employee Name {renderSortIndicator('employeeName')}
                  </th>
                  <th
                    onClick={() => handleSort('dateApplied')}
                    className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    Date Applied {renderSortIndicator('dateApplied')}
                  </th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider select-none">
                    Language
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    Status {renderSortIndicator('status')}
                  </th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider">
                    Notes / Comments
                  </th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB] text-sm">
                {paginatedSubmissions.map((sub) => {
                  const editUrl = `/forms/${sub.formType.replace(/_/g, '-')}/?edit=${sub._id}`;

                  return (
                    <tr key={sub._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-4 font-semibold text-[#1F2937]">
                        {getFormName(sub.formType)}
                      </td>
                      <td className="p-4 text-[#1F2937]">
                        {getEmployeeName(sub)}
                      </td>
                      <td className="p-4 text-[#486581]">
                        {format(new Date(sub.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="p-4 text-[#486581]">
                        {getLanguageLabel(sub.language)}
                      </td>
                      <td className="p-4">
                        {getStatusPill(sub.status)}
                      </td>
                      <td className="p-4 max-w-[250px] truncate text-[#6B7280]">
                        {sub.status === 'returned' && (
                          <div className="text-xs text-amber-800 font-semibold bg-amber-50 p-2 rounded border border-amber-100">
                            Returned: {sub.hrComment || 'Please correct details'}
                          </div>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="text-xs text-red-800 font-semibold">{sub.hrComment}</span>
                        )}
                        {sub.status === 'approved' && (
                          <span className="text-xs text-green-800">{sub.hrComment}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {sub.status === 'draft' ? (
                            <>
                              <Link
                                href={editUrl}
                                className="p-2 text-[#0B5ED7] hover:bg-blue-50 rounded"
                                title="Edit Draft"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteDraft(sub._id)}
                                className="p-2 text-[#D32F2F] hover:bg-red-50 rounded"
                                title="Delete Draft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : sub.status === 'returned' ? (
                            <>
                              <Link
                                href={editUrl}
                                className="btn btn-outline py-1 px-2.5 text-xs flex items-center gap-1.5"
                                title="Correct & Resubmit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Correct</span>
                              </Link>
                              <button
                                onClick={() => setViewingSubmission(sub)}
                                className="p-2 text-[#486581] hover:bg-gray-50 rounded"
                                title="View Submitted Form"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(sub._id, sub.formType)}
                                className="p-2 text-[#486581] hover:bg-gray-50 rounded"
                                disabled={downloadingId === sub._id}
                                title="Download PDF"
                              >
                                {downloadingId === sub._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-[#0B3C6D]" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setViewingSubmission(sub)}
                                className="btn btn-outline py-1 px-2.5 text-xs flex items-center gap-1.5"
                                title="View Submitted Form"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(sub._id, sub.formType)}
                                className="btn btn-outline py-1 px-2.5 text-xs flex items-center gap-1.5"
                                disabled={downloadingId === sub._id}
                              >
                                {downloadingId === sub._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B3C6D]" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>PDF</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#E4E7EB] bg-[#F8FAFC]">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline py-1 px-3 text-xs"
            >
              Previous
            </button>
            <span className="text-xs text-[#486581] font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline py-1 px-3 text-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Form Modal */}
      {viewingSubmission && (
        <FormViewModal
          submission={viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          onDownloadPdf={handleDownloadPdf}
          isDownloading={downloadingId === viewingSubmission._id}
        />
      )}
    </div>
  );
}

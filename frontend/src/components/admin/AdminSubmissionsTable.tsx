'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { formService } from '@/services/formService';
import type { Submission, FormType, SubmissionStatus } from '@/types';
import { format } from 'date-fns';
import { Search, Download, CheckSquare, Loader2, AlertCircle, FileText } from 'lucide-react';
import ApprovalModal from './ApprovalModal';

export default function AdminSubmissionsTable() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formType, setFormType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllSubmissions({
        page,
        limit,
        search: debouncedSearch || undefined,
        formType: formType || undefined,
        status: status || undefined,
      });
      setSubmissions(data.submissions || []);
      setTotalPages(data.pages || 1);
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, debouncedSearch, formType, status]);

  const handleDownloadPdf = async (id: string, type: FormType) => {
    setDownloadingId(id);
    try {
      const filename = `${type}_admin_${id.slice(-6)}.pdf`;
      await formService.downloadPdf(id, filename);
    } catch (err) {
      alert('Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const getApplicantName = (sub: Submission) => {
    if (typeof sub.userId === 'object' && sub.userId !== null) {
      return sub.userId.name;
    }
    return String(sub.formData.applicantName || sub.formData.studentName || 'Unknown');
  };

  const getEmployeeCode = (sub: Submission) => {
    if (typeof sub.userId === 'object' && sub.userId !== null && sub.userId.employeeCode) {
      return sub.userId.employeeCode;
    }
    return String(sub.formData.employeeCode || '—');
  };

  const getFormName = (type: FormType) => {
    switch (type) {
      case 'casual_leave_nrsc':
        return 'CL — NRSC';
      case 'earned_leave':
        return 'Earned/Medical';
      case 'casual_leave_rrsc':
        return 'CL — RRSC-W';
      case 'trainee_biodata':
        return 'Trainee Bio-Data';
      default:
        return type;
    }
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
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${classes[status] || classes.draft}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters Panel */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white border border-[#D9E2EC] rounded-lg shadow-sm">
        {/* Search */}
        <div className="flex flex-col gap-1.5 flex-grow min-w-[250px]">
          <label htmlFor="admin-search" className="text-xs font-bold text-[#486581]">Search Applicant</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[#829AB1]" />
            <input
              id="admin-search"
              type="text"
              placeholder="Search by name, email, employee code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10 py-1.5 text-sm"
            />
          </div>
        </div>

        {/* Form Type filter */}
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label htmlFor="admin-filter-type" className="text-xs font-bold text-[#486581]">Form Type</label>
          <select
            id="admin-filter-type"
            value={formType}
            onChange={(e) => { setFormType(e.target.value); setPage(1); }}
            className="form-input py-1.5 text-sm"
          >
            <option value="">All Form Types</option>
            <option value="casual_leave_nrsc">Casual Leave (NRSC)</option>
            <option value="earned_leave">Earned/Medical Leave</option>
            <option value="casual_leave_rrsc">CL/Spl CL/Comp Off (RRSC-W)</option>
            <option value="trainee_biodata">Trainee Bio-Data</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label htmlFor="admin-filter-status" className="text-xs font-bold text-[#486581]">Status</label>
          <select
            id="admin-filter-status"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="form-input py-1.5 text-sm"
          >
            <option value="">All Statuses (excluding Drafts)</option>
            <option value="submitted">Submitted (Pending)</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F] rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main Submissions Table */}
      <div className="bg-white border border-[#D9E2EC] rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#0B3C6D] animate-spin" />
            <span className="text-sm text-[#6B7280]">Fetching employee submissions...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-[#9FB3C8] mx-auto mb-3" />
            <p className="text-[#486581] font-semibold">No submissions found</p>
            <p className="text-xs text-[#6B7280] mt-1">There are no pending or reviewed applications matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E4E7EB]">
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider">Employee</th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider">Employee Code</th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider">Form Type</th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider">Date Submitted</th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-[#486581] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB] text-sm">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-[#1F2937]">
                        {getApplicantName(sub)}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {typeof sub.userId === 'object' && sub.userId !== null ? sub.userId.email : ''}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[#486581]">
                      {getEmployeeCode(sub)}
                    </td>
                    <td className="p-4 font-medium text-[#1F2937]">
                      {getFormName(sub.formType)}
                    </td>
                    <td className="p-4 text-[#486581]">
                      {format(new Date(sub.createdAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="p-4">
                      {getStatusPill(sub.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {sub.status === 'submitted' && (
                          <button
                            onClick={() => setActiveSubmission(sub)}
                            className="btn btn-primary py-1 px-2.5 text-xs flex items-center gap-1 hover:scale-102 transition-transform"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        )}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#E4E7EB] bg-[#F8FAFC]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline py-1 px-3 text-xs"
            >
              Previous
            </button>
            <span className="text-xs text-[#486581] font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline py-1 px-3 text-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeSubmission && (
        <ApprovalModal
          submission={activeSubmission}
          onClose={() => setActiveSubmission(null)}
          onSuccess={fetchSubmissions}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { adminService } from '@/services/adminService';
import type { Submission } from '@/types';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ApprovalModalProps {
  submission: Submission | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApprovalModal({ submission, onClose, onSuccess }: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'return'>('approve');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!submission) return null;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (action !== 'approve' && comment.trim().length < 5) {
      setErrorMsg('Comment must be at least 5 characters for Rejection or Return.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (action === 'approve') {
        await adminService.approveSubmission(submission._id, comment || undefined);
      } else if (action === 'reject') {
        await adminService.rejectSubmission(submission._id, comment);
      } else {
        await adminService.returnSubmission(submission._id, comment);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(`Failed to ${action} submission:`, err);
      setErrorMsg(err?.response?.data?.error || `Failed to perform action ${action}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const getApplicantName = () => {
    if (typeof submission.userId === 'object' && submission.userId !== null) {
      return submission.userId.name;
    }
    return String(submission.formData.applicantName || submission.formData.studentName || 'Unknown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D9E2EC]">
          <h3 className="text-lg font-bold text-[#0B3C6D]">
            Review Leave Application
          </h3>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1F2937] text-2xl font-bold leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAction}>
          <div className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs text-[#D32F2F] bg-[#FFEBEE] border border-[#FFCDD2] rounded">
                {errorMsg}
              </div>
            )}

            {/* Info Summary */}
            <div className="text-sm space-y-1 bg-[#F8FAFC] p-3 rounded border border-[#E4E7EB]">
              <div><strong>Applicant:</strong> {getApplicantName()}</div>
              <div><strong>Form:</strong> <span className="capitalize">{submission.formType.replace(/_/g, ' ')}</span></div>
              <div><strong>Status:</strong> <span className="uppercase font-semibold text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">{submission.status}</span></div>
            </div>

            {/* Action Select */}
            <div className="form-field-row">
              <label htmlFor="action-select" className="form-label">Select Action</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setAction('approve'); setErrorMsg(null); }}
                  className={`py-2 text-xs font-semibold rounded border transition-all ${
                    action === 'approve'
                      ? 'bg-green-50 border-green-600 text-green-700 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => { setAction('return'); setErrorMsg(null); }}
                  className={`py-2 text-xs font-semibold rounded border transition-all ${
                    action === 'return'
                      ? 'bg-amber-50 border-amber-600 text-amber-700 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Return
                </button>
                <button
                  type="button"
                  onClick={() => { setAction('reject'); setErrorMsg(null); }}
                  className={`py-2 text-xs font-semibold rounded border transition-all ${
                    action === 'reject'
                      ? 'bg-red-50 border-red-600 text-red-700 font-bold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Comments Textarea */}
            <div className="form-field-row">
              <label htmlFor="comment-text" className="form-label">
                Remarks / Comments {action !== 'approve' && <span className="text-[#D32F2F]">*</span>}
              </label>
              <textarea
                id="comment-text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-input text-sm resize-none mt-1"
                placeholder={
                  action === 'approve'
                    ? 'Enter approval notes (optional)...'
                    : 'Explain reason for return/rejection (min 5 characters)...'
                }
                rows={3}
                required={action !== 'approve'}
              />
            </div>

            {/* Warnings */}
            {action === 'reject' && (
              <div className="p-3 bg-[#FFF3CD] border border-[#FFEBAA] text-[#856404] text-xs rounded flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Warning:</strong> Rejecting this application is permanent and cannot be undone.</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-[#D9E2EC] bg-[#F8FAFC]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline text-xs py-1.5 px-3"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn text-xs py-1.5 px-4 flex items-center gap-1.5 ${
                action === 'approve'
                  ? 'btn-primary bg-green-600 hover:bg-green-700'
                  : action === 'reject'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span className="capitalize">{action} Application</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

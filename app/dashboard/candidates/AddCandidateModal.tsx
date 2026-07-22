'use client';

import React, { useActionState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText } from 'lucide-react';
import { createCandidateAction } from '@/actions';

interface AddCandidateModalProps {
    onClose: () => void;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose }) => {
    const [state, formAction, isPending] = useActionState(createCandidateAction, null);

    // Automatically close modal when candidate creation succeeds
    useEffect(() => {
        if (state?.success) {
            onClose();
        }
    }, [state, onClose]);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 md:p-6" id="add-candidate-modal-wrapper">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                id="add-candidate-modal-backdrop"
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col" id="add-candidate-modal">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50" id="add-candidate-modal-header">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Register Candidate</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Add candidate details to the global recruitment pool.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                        id="add-candidate-close-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form action={formAction} className="p-5 space-y-4" id="add-candidate-form">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Full Name *</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <User className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                name="full_name"
                                placeholder="e.g. Liam Gallagher"
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Email Address *</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g. liam@harborview.com"
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Phone Number</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone className="w-4 h-4" />
                            </span>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="e.g. (555) 012-4411"
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
                            />
                        </div>
                    </div>

                    {/* Resume notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Resume Summary & Notes</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-3.5 text-slate-400">
                                <FileText className="w-4 h-4" />
                            </span>
                            <textarea
                                name="resume_notes"
                                placeholder="Key skills, certifications, availability, salary requirements..."
                                rows={3}
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium resize-none"
                            />
                        </div>
                    </div>

                    {/* Error Feedback */}
                    {state?.error && (
                        <p className="text-xs text-rose-500 font-medium">{state.error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-lg shadow-sm shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? 'Adding...' : 'Add Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
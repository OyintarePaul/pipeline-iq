'use client';

import React, { useActionState, useEffect } from 'react';
import { X, Briefcase, Building, User } from 'lucide-react';
import { createJobOrderAction } from '@/actions';

interface AddJobModalProps {
    recruiters: { id: string; fullName: string; role: string }[];
    currentUser: { id: string; role: string };
    onClose: () => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ recruiters, currentUser, onClose }) => {
    const [state, formAction, isPending] = useActionState(createJobOrderAction, null);

    useEffect(() => {
        if (state?.success) {
            onClose();
        }
    }, [state, onClose]);

    const defaultRecruiterId = currentUser.role === 'recruiter' ? currentUser.id : '';

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 md:p-6" id="add-job-modal-wrapper">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col" id="add-job-modal">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Create Job Order</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Setup a new hiring position and assign a pipeline owner.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={formAction} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Job Title *</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Briefcase className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Lead React Architect"
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Client Company *</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Building className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                name="client_name"
                                placeholder="e.g. Harborview Tech Solutions"
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase">Assigned Recruiter *</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <User className="w-4 h-4" />
                            </span>
                            <select
                                name="recruiter_id"
                                defaultValue={defaultRecruiterId}
                                className="w-full text-sm border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-medium cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                                required
                                disabled={currentUser.role === 'recruiter'}
                            >
                                <option value="">Choose Recruiter...</option>
                                {recruiters.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.fullName} ({r.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {state?.error && (
                        <p className="text-xs text-rose-500 font-medium">{state.error}</p>
                    )}

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
                            {isPending ? 'Opening...' : 'Open Job Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
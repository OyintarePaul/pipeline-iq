'use client';

import { useActionState, useRef, useEffect, startTransition } from 'react';
import { MessageSquare, Calendar, CheckSquare, Square } from 'lucide-react';
import {
    updatePipelineStageAction,
    addCandidateNoteAction,
    addFollowUpAction,
    toggleFollowUpStatusAction
} from '@/actions';

type ActionResponse = {
    success: boolean;
    error?: string;
} | null;

export const StageSelect = ({ entryId, currentStage }: { entryId: string; currentStage: string }) => {
    const [state, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse, newStage: string) => {
            return await updatePipelineStageAction(entryId, newStage);
        },
        null
    );

    return (
        <div className="flex flex-col items-end gap-1">
            <select
                value={currentStage}
                disabled={isPending}
                onChange={(e) => {
                    const val = e.target.value;
                    startTransition(() => {
                        formAction(val);
                    });
                }}
                className="text-xs font-semibold bg-slate-100 border-0 rounded-md py-1 px-2.5 focus:ring-1 focus:ring-indigo-500 text-slate-700 cursor-pointer disabled:opacity-50"
                id={`stage-select-${entryId}`}
            >
                <option value="Sourced">Sourced</option>
                <option value="Contacted">Contacted</option>
                <option value="Submitted">Submitted</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Placed">Placed</option>
                <option value="Rejected">Rejected</option>
            </select>
            {state?.error && (
                <span className="text-[10px] text-rose-500 font-medium">{state.error}</span>
            )}
        </div>
    );
};

export const AddNoteForm = ({ entryId }: { entryId: string }) => {
    const formRef = useRef<HTMLFormElement>(null);

    const [state, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse, formData: FormData) => {
            const content = (formData.get('content') as string)?.trim();
            if (!content) {
                return { success: false, error: 'Note content cannot be empty.' };
            }
            return await addCandidateNoteAction(entryId, content);
        },
        null
    );

    // Clear input when the note is added successfully
    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <div className="space-y-2">
            <h5 className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Log Activity Note
            </h5>
            <form ref={formRef} action={formAction} className="flex flex-col gap-2">
                <textarea
                    name="content"
                    placeholder="Type recruiter notes here..."
                    rows={2}
                    className="text-xs border border-slate-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    required
                />
                {state?.error && (
                    <p className="text-[11px] text-rose-500 font-medium">{state.error}</p>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg self-end transition-all cursor-pointer disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Add Note'}
                </button>
            </form>
        </div>
    );
};

export const AddFollowUpForm = ({ entryId }: { entryId: string }) => {
    const formRef = useRef<HTMLFormElement>(null);

    const [state, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse, formData: FormData) => {
            const dueDate = formData.get('dueDate') as string;
            if (!dueDate) {
                return { success: false, error: 'Please select a valid date.' };
            }
            return await addFollowUpAction(entryId, dueDate);
        },
        null
    );

    // Clear input when the follow-up is scheduled successfully
    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <div className="space-y-2">
            <h5 className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Set Follow-up Reminder
            </h5>
            <form ref={formRef} action={formAction} className="flex flex-col gap-2">
                <input
                    type="date"
                    name="dueDate"
                    className="text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
                    required
                />
                {state?.error && (
                    <p className="text-[11px] text-rose-500 font-medium">{state.error}</p>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-slate-950 py-1.5 px-3 rounded-lg self-end transition-all cursor-pointer disabled:opacity-50"
                >
                    {isPending ? 'Scheduling...' : 'Schedule'}
                </button>
            </form>
        </div>
    );
};

export const FollowUpToggle = ({ followupId, isDone }: { followupId: string; isDone: boolean }) => {
    const [state, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse, nextStatus: boolean) => {
            return await toggleFollowUpStatusAction(followupId, nextStatus);
        },
        null
    );

    return (
        <div className="flex flex-col items-start">
            <button
                onClick={() => {
                    startTransition(() => {
                        formAction(!isDone);
                    });
                }}
                disabled={isPending}
                className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-50"
                id={`followup-checkbox-${followupId}`}
            >
                {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500 fill-emerald-50 text-slate-900" />
                ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                )}
            </button>
            {state?.error && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5">{state.error}</span>
            )}
        </div>
    );
};

import React from 'react';
import { ImprovementForm } from './ImprovementForm';
import { Helper } from './Helper';
import { Icon } from './Icon';
import { Question } from '../types';

interface ImprovementPanelProps {
    isMobileOpen: boolean;
    onClose: () => void;
    isGeneratingQuestions: boolean;
    questions: Question[];
    answers: string[];
    refinement: string;
    onAnswerChange: (index: number, value: string) => void;
    onRefinementChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    isLoading: boolean;
    questionError: string | null;
}

export const ImprovementPanel: React.FC<ImprovementPanelProps> = ({
    isMobileOpen,
    onClose,
    isGeneratingQuestions,
    questions,
    ...formProps
}) => {
    return (
        <>
            <aside className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-brand-bg p-6 lg:p-8 border-l border-brand-border transform transition-transform ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 lg:block`}>
                <button onClick={onClose} className="lg:hidden absolute top-4 left-4 p-2 text-brand-text-light hover:text-brand-text-dark">
                    <Icon name="x-mark" className="w-6 h-6" />
                </button>
                {isGeneratingQuestions || questions.length > 0 ? (
                    <ImprovementForm
                        isGeneratingQuestions={isGeneratingQuestions}
                        questions={questions}
                        {...formProps}
                    />
                ) : (
                    <Helper />
                )}
            </aside>
            {isMobileOpen && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-30 lg:hidden" />}
        </>
    );
};

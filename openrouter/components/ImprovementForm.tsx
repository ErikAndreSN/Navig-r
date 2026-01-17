
import React from 'react';
import { Icon } from './Icon';
import { Question } from '../types';
import { QuestionCard } from './QuestionCard';

interface ImprovementFormProps {
  questions: Question[];
  answers: string[];
  refinement: string;
  onAnswerChange: (index: number, value: string) => void;
  onRefinementChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isGeneratingQuestions: boolean;
  questionError: string | null;
}

const RefineCard: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> = ({ value, onChange }) => {
    return (
        <details className="group bg-brand-card rounded-2xl overflow-hidden border border-brand-border" open>
            <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-brand-text-dark">Finjuster din prompt</h3>
                </div>
                 <Icon name='chevron-up' className="w-5 h-5 text-brand-text-light transform transition-transform group-open:rotate-0 rotate-180" />
            </summary>
            <div className="px-4 pb-4">
                <p className="text-sm text-brand-text-light mb-3">Gjør raske endringer eller legg til manglende detaljer.</p>
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder="Begrens lengde, sett tone eller stil etc."
                    className="w-full h-24 p-3 bg-white border border-brand-border rounded-lg resize-none focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
                />
            </div>
        </details>
    )
}

export const ImprovementForm: React.FC<ImprovementFormProps> = ({
  questions,
  answers,
  refinement,
  onAnswerChange,
  onRefinementChange,
  onSubmit,
  isLoading,
  isGeneratingQuestions,
  questionError,
}) => {
  const renderContent = () => {
    if (isGeneratingQuestions) {
        return (
            <div className="flex justify-center items-center h-48">
                <Icon name="spinner" className="w-8 h-8 text-brand-primary" />
                 <p className="text-brand-text-light ml-4">Genererer spørsmål...</p>
            </div>
        )
    }
    if (questionError) {
        return <p className="text-red-500 text-center">{questionError}</p>;
    }
    if (questions.length === 0) {
         return null;
    }

    return (
        <div className="flex flex-col gap-4">
            {questions.map((q, index) => (
                <QuestionCard
                    key={q.id}
                    question={q}
                    value={answers[index]}
                    onChange={(value) => onAnswerChange(index, value)}
                    index={index}
                />
            ))}
            <RefineCard value={refinement} onChange={onRefinementChange} />
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-brand-text-dark">Forbedre din prompt</h2>
        <p className="text-brand-text-light text-sm">Svar på disse spørsmålene for å få bedre resultater!</p>
      </div>
      <div className="flex-grow min-h-[200px] overflow-y-auto pr-2 -mr-2">
        {renderContent()}
      </div>
      {questions.length > 0 && (
         <button
            onClick={onSubmit}
            disabled={isLoading}
            className="mt-6 w-full bg-brand-primary text-brand-button-bg font-semibold py-3 px-6 rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-dark transition-all disabled:opacity-50 disabled:cursor-wait"
        >
            {isLoading ? <Icon name="spinner" className="w-6 h-6 mx-auto" /> : 'Forbedre prompt'}
        </button>
      )}
    </div>
  );
};

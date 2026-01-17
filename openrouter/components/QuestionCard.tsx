
import React from 'react';
import { Question } from '../types';
import { Icon } from './Icon';

interface QuestionCardProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, value, onChange, index }) => {

  const handleExampleClick = (example: string) => {
    onChange(value ? `${value} ${example}` : example);
  };

  return (
    <details className="group bg-brand-card rounded-2xl overflow-hidden border border-brand-border" open>
        <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
            <div className="flex items-center gap-3">
                <div className="bg-brand-primary text-brand-text-dark w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">{index + 1}</div>
                <h3 className="font-semibold text-brand-text-dark">{question.title}</h3>
            </div>
            <Icon name='chevron-up' className="w-5 h-5 text-brand-text-light transform transition-transform group-open:rotate-0 rotate-180" />
        </summary>
        <div className="px-4 pb-4">
            <p className="text-sm text-brand-text-light mb-3">{question.description}</p>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Skriv svaret ditt her..."
                className="w-full h-24 p-3 bg-white border border-brand-border rounded-lg resize-none focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
            />
            {question.examples && question.examples.length > 0 && (
                 <div className="mt-3">
                    <h4 className="text-xs font-semibold text-brand-text-light mb-2 uppercase tracking-wider">Eksempler</h4>
                     <div className="flex flex-wrap gap-2">
                        {question.examples.map((example) => (
                          <button
                            key={example}
                            onClick={() => handleExampleClick(example)}
                            className="flex items-start text-left gap-2 bg-white hover:bg-gray-50 border border-brand-border text-brand-text-dark text-sm px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>{example}</span>
                            <Icon name="plus-circle" className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                          </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </details>
  );
};

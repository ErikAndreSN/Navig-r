
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { FeedbackData } from '../types';

interface FeedbackButtonProps {
    onClick: () => void;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 lg:left-6 lg:right-auto bg-brand-feedback-bg text-brand-text-dark font-semibold px-4 py-2 rounded-lg border-2 border-brand-text-dark transition-transform hover:scale-105 z-20"
            style={{ boxShadow: '4px 4px 0px #1F2937' }}
        >
            Hjelp oss å bli bedre
        </button>
    );
};


interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FeedbackData) => void;
}

const SENTIMENTS = ['😄', '🙂', '😐', '😕', '😢'];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [text, setText] = useState('');
    const [sentiment, setSentiment] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setText('');
            setSentiment(null);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!text.trim() && sentiment === null) return;
        onSubmit({ text, sentiment });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-feedback-bg rounded-lg p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-text-dark">Send tilbakemelding til teamet vårt</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </button>
                </div>

                <div className="border-b border-brand-feedback-border mb-6"></div>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Fortell oss hva du synes..."
                    className="w-full h-28 p-3 bg-white border border-brand-feedback-border rounded-lg resize-none focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 mb-6"
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-3">
                        {SENTIMENTS.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => setSentiment(index)}
                                className={`text-3xl transition-transform transform ${sentiment === index ? 'scale-125' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!text.trim() && sentiment === null}
                        className="bg-brand-button-bg text-brand-button-text px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
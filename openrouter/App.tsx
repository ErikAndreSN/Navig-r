
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ImprovementPanel } from './components/ImprovementPanel';
import { MobileHeader } from './components/MobileHeader';
import { FeedbackButton, FeedbackModal } from './components/Feedback';
import { generatePrompt, generateClarifyingQuestions } from './services/geminiService';
import { Question, PromptHistoryItem, FeedbackData } from './types';

const App: React.FC = () => {
  const [lazyPrompt, setLazyPrompt] = useState('');
  const [greatPrompt, setGreatPrompt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [refinement, setRefinement] = useState('');

  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [activePromptId, setActivePromptId] = useState<number | null>(null);

  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImprovementPanelOpen, setIsImprovementPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('promptHistory');
      if (storedHistory) {
        setPromptHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load prompt history from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    } catch (e) {
      console.error("Failed to save prompt history to localStorage", e);
    }
  }, [promptHistory]);

  const handleGenerate = useCallback(async () => {
    if (!lazyPrompt.trim()) return;
    setIsLoading(true);
    setIsGeneratingQuestions(true);
    setError(null);
    setQuestionError(null);
    setGreatPrompt('');
    setQuestions([]);
    setActivePromptId(null);

    try {
        const [promptResult, questionsResult] = await Promise.all([
            generatePrompt(lazyPrompt, [], [], ''),
            generateClarifyingQuestions(lazyPrompt)
        ]);
        
        setGreatPrompt(promptResult);
        setQuestions(questionsResult);
        setAnswers(Array(questionsResult.length).fill(''));

        const newHistoryItem: PromptHistoryItem = {
            id: Date.now(),
            lazyPrompt,
            greatPrompt: promptResult
        };
        setPromptHistory(prev => [newHistoryItem, ...prev]);
        setActivePromptId(newHistoryItem.id);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        setQuestionError(errorMessage);
    } finally {
        setIsLoading(false);
        setIsGeneratingQuestions(false);
    }
  }, [lazyPrompt]);

  const handleImprovePrompt = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generatePrompt(lazyPrompt, questions, answers, refinement);
      setGreatPrompt(result);

      if (activePromptId) {
        setPromptHistory(prev => prev.map(item => 
          item.id === activePromptId ? { ...item, greatPrompt: result } : item
        ));
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [lazyPrompt, questions, answers, refinement, activePromptId]);
  
  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };
  
  const handleNewPrompt = () => {
    setLazyPrompt('');
    setGreatPrompt('');
    setQuestions([]);
    setAnswers([]);
    setRefinement('');
    setError(null);
    setQuestionError(null);
    setActivePromptId(null);
    setIsSidebarOpen(false);
  }

  const handleSelectPrompt = useCallback((id: number) => {
    const selected = promptHistory.find(p => p.id === id);
    if (selected) {
        setLazyPrompt(selected.lazyPrompt);
        setGreatPrompt(selected.greatPrompt);
        setActivePromptId(id);
        setQuestions([]);
        setAnswers([]);
        setRefinement('');
        setError(null);
        setQuestionError(null);
        setIsSidebarOpen(false);
    }
  }, [promptHistory]);

  const handleDeletePrompt = useCallback((id: number) => {
    setPromptHistory(prev => prev.filter(p => p.id !== id));
    if (activePromptId === id) {
        handleNewPrompt();
    }
  }, [activePromptId]);

  const handleFeedbackSubmit = (data: FeedbackData) => {
    const { text, sentiment } = data;
    const subject = "Tilbakemelding fra Prompt-veilederen";
    const sentimentEmoji = sentiment !== null ? ['😄', '🙂', '😐', '😕', '😢'][sentiment] : "Ikke valgt";

    let body = `Hei,\n\nHer er tilbakemelding fra en bruker:\n\n`;
    body += `Følelse: ${sentimentEmoji}\n\n`;
    body += `Melding:\n${text}\n\n`;
    body += `\nMed vennlig hilsen,\nPrompt-veilederen`;

    const mailtoLink = `mailto:erik@nivotek.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
    setIsFeedbackModalOpen(false);
  };

  return (
    <div className="lg:flex min-h-screen relative">
      <Sidebar 
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewPrompt={handleNewPrompt} 
        promptHistory={promptHistory}
        onSelectPrompt={handleSelectPrompt}
        onDeletePrompt={handleDeletePrompt}
        activePromptId={activePromptId}
      />
      <div className="flex-grow flex flex-col min-w-0">
        <MobileHeader 
          onMenuClick={() => setIsSidebarOpen(true)}
          onToolsClick={() => setIsImprovementPanelOpen(true)}
        />
        <main className="flex-grow p-4 sm:p-8 md:p-12">
            <MainContent 
              lazyPrompt={lazyPrompt}
              onLazyPromptChange={(e) => setLazyPrompt(e.target.value)}
              onGenerate={handleGenerate}
              greatPrompt={greatPrompt}
              isLoading={isLoading}
              error={error}
            />
        </main>
      </div>
      <ImprovementPanel
        isMobileOpen={isImprovementPanelOpen}
        onClose={() => setIsImprovementPanelOpen(false)}
        isGeneratingQuestions={isGeneratingQuestions}
        questions={questions}
        answers={answers}
        onAnswerChange={updateAnswer}
        refinement={refinement}
        onRefinementChange={(e) => setRefinement(e.target.value)}
        onSubmit={handleImprovePrompt}
        isLoading={isLoading}
        questionError={questionError}
      />
      
      <FeedbackButton onClick={() => setIsFeedbackModalOpen(true)} />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default App;
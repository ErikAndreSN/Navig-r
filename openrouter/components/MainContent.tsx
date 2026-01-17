
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface MainContentProps {
    lazyPrompt: string;
    onLazyPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onGenerate: () => void;
    greatPrompt: string;
    isLoading: boolean;
    error: string | null;
}

const PromptInput: React.FC<Omit<MainContentProps, 'greatPrompt' | 'error'>> = ({
    lazyPrompt,
    onLazyPromptChange,
    onGenerate,
    isLoading
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && lazyPrompt.trim()) {
                onGenerate();
            }
        }
    };
    
    return (
        <div className="bg-brand-card p-6 rounded-2xl border border-brand-border relative transition-all duration-300 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10">
            <textarea 
                value={lazyPrompt}
                onChange={onLazyPromptChange}
                onKeyDown={handleKeyDown}
                placeholder="Hva vil du lage i dag?"
                className="w-full h-24 bg-transparent border-none focus:outline-none resize-none placeholder-gray-400 text-base"
            />
            <div className="flex justify-end">
                <button 
                    onClick={onGenerate}
                    disabled={isLoading || !lazyPrompt.trim()}
                    className="bg-brand-primary text-brand-button-bg px-6 py-2 rounded-lg font-semibold text-sm hover:bg-brand-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Icon name="spinner" className="w-5 h-5" /> : 'Generer'}
                </button>
            </div>
        </div>
    );
};

const parseMarkdown = (text: string): string => {
    const lines = text.split('\n');
    let html = '';
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) {
            html += '</ul>';
            inUl = false;
        }
        if (inOl) {
            html += '</ol>';
            inOl = false;
        }
    };

    const processInline = (content: string) => {
        return content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-brand-text-dark">$1</strong>');
    };

    for (const line of lines) {
        if (line.trim() === '') {
            closeLists();
            continue;
        }

        // Headings like **Situasjon**
        if (line.startsWith('**') && line.endsWith('**')) {
            closeLists();
            html += `<h3 class="font-bold text-brand-text-dark mt-4 mb-2">${line.substring(2, line.length - 2)}</h3>`;
            continue;
        }
        
        // Unordered list. Example: - **Konsept:** Beskrivelse...
        if (line.trim().startsWith('- ')) {
            if (inOl) { closeLists(); }
            if (!inUl) {
                html += '<ul class="list-disc space-y-2 text-brand-text-dark pl-5">';
                inUl = true;
            }
            html += `<li>${processInline(line.trim().substring(2))}</li>`;
            continue;
        }

        // Ordered list. Example: 1. En oversikt...
        if (/^\d+\.\s/.test(line.trim())) {
            if (inUl) { closeLists(); }
            if (!inOl) {
                html += '<ol class="list-decimal space-y-2 text-brand-text-dark pl-5">';
                inOl = true;
            }
            html += `<li>${processInline(line.trim().replace(/^\d+\.\s/, ''))}</li>`;
            continue;
        }
        
        // Regular paragraph.
        closeLists();
        html += `<p class="leading-relaxed text-brand-text-dark mt-2">${processInline(line)}</p>`;
    }

    closeLists();
    return html;
};


const GeneratedPrompt: React.FC<{prompt: string, isLoading: boolean, error: string | null}> = ({ prompt, isLoading, error }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState(prompt);
    const [copyStatus, setCopyStatus] = useState('Kopier');

    useEffect(() => {
        setEditedPrompt(prompt);
        if (isEditing) {
            setIsEditing(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prompt]);

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(editedPrompt).then(() => {
                setCopyStatus('Kopiert!');
                setTimeout(() => setCopyStatus('Kopier'), 2000);
            });
        }
    };

    const handleSave = () => {
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setEditedPrompt(prompt);
        setIsEditing(false);
    }

    const renderContent = () => {
        if (isLoading) {
          return (
             <div className="space-y-4 p-6">
                <div className="bg-gray-200 h-5 rounded w-1/4 animate-pulse"></div>
                <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 animate-pulse"></div>
             </div>
          );
        }
        if (error) {
          return <p className="text-red-500 p-6">Feil: {error}</p>;
        }
        if (!prompt) {
          return <p className="text-brand-text-light p-6">Din strukturerte prompt vises her...</p>;
        }
        
        if (isEditing) {
            return (
                 <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full h-full min-h-[250px] p-6 bg-transparent border-none focus:outline-none resize-none text-brand-text-dark"
                    autoFocus
                />
            )
        }
        return <div className="p-6" dangerouslySetInnerHTML={{ __html: parseMarkdown(editedPrompt) }} />;
    };

    const showActions = !isLoading && !error && prompt;

    return (
        <div className="bg-brand-card rounded-2xl border border-brand-border">
            <div className="flex justify-between items-center p-4 border-b border-brand-border min-h-[57px]">
                <h3 className="text-sm font-medium text-brand-text-light">Resultat</h3>
                 {showActions && (
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                             <>
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm text-brand-text-light hover:text-brand-text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
                                    <Icon name="edit" className="w-4 h-4" />
                                    Rediger
                                </button>
                                <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm text-brand-text-light hover:text-brand-text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
                                    <Icon name="copy" className="w-4 h-4" />
                                    {copyStatus}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleCancel} className="flex items-center gap-1.5 text-sm text-brand-text-light hover:text-brand-text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
                                    <Icon name="x-mark" className="w-4 h-4" />
                                    Avbryt
                                </button>
                                <button onClick={handleSave} className="flex items-center gap-1.5 text-sm text-brand-button-bg bg-brand-primary hover:bg-brand-primary-dark transition-colors px-3 py-1.5 rounded-md font-semibold">
                                    Lagre
                                </button>
                            </>
                        )}
                    </div>
                 )}
            </div>
            <div className="min-h-[300px]">
                {renderContent()}
            </div>
        </div>
    )
}

export const MainContent: React.FC<MainContentProps> = (props) => {
    return (
        <div className="max-w-3xl mx-auto">
            <header className="text-center mb-12">
                 <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-brand-text-dark leading-tight">
                    Styr AI-en i riktig retning
                    <span className="block font-script text-5xl sm:text-6xl lg:text-7xl text-brand-primary mt-1 sm:mt-2">
                        med prompt-veilederen
                    </span>
                </h1>
                <p className="text-base sm:text-lg text-brand-text-light max-w-xl mx-auto mt-6">Slutt å kaste bort tid på dårlige svar. Få profesjonelle resultater fra AI-en din, hver gang.</p>
            </header>
            
            <div className="space-y-10">
                <PromptInput {...props} />
                <GeneratedPrompt prompt={props.greatPrompt} isLoading={props.isLoading} error={props.error} />
            </div>
        </div>
    )
}
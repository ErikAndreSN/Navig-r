
import React from 'react';
import { Icon } from './Icon';
import { PromptHistoryItem } from '../types';

interface SidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
    onNewPrompt: () => void;
    promptHistory: PromptHistoryItem[];
    onSelectPrompt: (id: number) => void;
    onDeletePrompt: (id: number) => void;
    activePromptId: number | null;
}

const HistoryItem: React.FC<{item: PromptHistoryItem; isActive: boolean; onSelect: () => void; onDelete: () => void;}> = ({ item, isActive, onSelect, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div 
            onClick={onSelect}
            className={`group flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-brand-primary/20' : 'hover:bg-gray-100'}`}
        >
            <p className="text-sm text-brand-text-dark truncate pr-2">{item.lazyPrompt}</p>
            <button onClick={handleDelete} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0">
                <Icon name="trash" className="w-4 h-4" />
            </button>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose, onNewPrompt, promptHistory, onSelectPrompt, onDeletePrompt, activePromptId }) => {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 w-full max-w-xs bg-brand-bg p-6 border-r border-brand-border flex flex-col transform transition-transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-2 text-brand-text-light hover:text-brand-text-dark">
            <Icon name="x-mark" className="w-6 h-6" />
        </button>
        <button 
          onClick={onNewPrompt}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-8 rounded-lg bg-brand-button-bg text-brand-button-text hover:bg-gray-700 transition-colors"
        >
          <Icon name="plus" className="w-5 h-5" />
          <span className="font-semibold">Ny Prompt</span>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Icon name="grid" className="w-4 h-4 text-brand-text-light" />
          <h2 className="text-sm font-semibold text-brand-text-light uppercase tracking-wider">Bibliotek</h2>
        </div>
        <div className="flex-grow space-y-1 overflow-y-auto -mr-2 pr-2">
          {promptHistory.length > 0 ? (
              promptHistory.map(item => (
                  <HistoryItem 
                      key={item.id}
                      item={item}
                      isActive={item.id === activePromptId}
                      onSelect={() => onSelectPrompt(item.id)}
                      onDelete={() => onDeletePrompt(item.id)}
                  />
              ))
          ) : (
              <p className="text-sm text-brand-text-light text-center mt-4">Din historikk er tom.</p>
          )}
        </div>
      </aside>
      {isMobileOpen && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-30 lg:hidden" />}
    </>
  );
};
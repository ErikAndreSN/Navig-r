
import React from 'react';
import { Icon } from './Icon';

interface MobileHeaderProps {
    onMenuClick: () => void;
    onToolsClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, onToolsClick }) => {
    return (
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-brand-border sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10">
            <button onClick={onMenuClick} className="p-2 -ml-2 text-brand-text-dark">
                <Icon name="menu" className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-lg font-bold text-brand-primary">prompt-veilederen</h1>
            <button onClick={onToolsClick} className="p-2 -mr-2 text-brand-text-dark">
                <Icon name="sparkles" className="w-6 h-6" />
            </button>
        </header>
    );
};
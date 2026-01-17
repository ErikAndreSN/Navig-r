
import React from 'react';
import { Icon } from './Icon';

interface HelperProps {
}

export const Helper: React.FC<HelperProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 bg-brand-card border border-brand-border rounded-full flex items-center justify-center mb-4">
        <Icon name="sparkles" className="w-8 h-8 text-brand-primary" />
      </div>
      <h3 className="font-bold text-lg text-brand-text-dark mb-1">Klar til start</h3>
      <p className="text-brand-text-light text-sm max-w-xs">
        Skriv inn hva du vil lage i venstre, så dukker verktøyene dine opp her.
      </p>
    </div>
  );
};

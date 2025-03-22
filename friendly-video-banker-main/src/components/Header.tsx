
import React from 'react';
import { useApplication } from '@/contexts/ApplicationContext';

const Header: React.FC = () => {
  const { status, resetApplication } = useApplication();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20 py-4 px-6 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-finesse-500 to-finesse-300 flex items-center justify-center text-white font-bold">F</div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Finesse</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {status !== 'initial' && (
          <button
            onClick={resetApplication}
            className="text-sm text-finesse-600 hover:text-finesse-800 transition-colors"
          >
            Start Over
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-muted-foreground">AI Branch Manager</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

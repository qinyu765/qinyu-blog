'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import {
  reduceHomeEntryIntent,
  reduceHomeIntroKey,
  type HomeEntryContextValue,
  type HomeSection,
} from '@/lib/home-entry';

const HomeEntryContext = createContext<HomeEntryContextValue | null>(null);

export function HomeEntryProvider({ children }: { children: React.ReactNode }) {
  const [pendingHomeSection, dispatch] = useReducer(reduceHomeEntryIntent, null);
  const [homeIntroKey, replayHomeIntro] = useReducer(reduceHomeIntroKey, 0);

  const prepareHomeSection = useCallback((section: HomeSection) => {
    dispatch({ type: 'prepare-section', section });
  }, []);

  const clearHomeSection = useCallback(() => {
    dispatch({ type: 'clear-section' });
  }, []);

  const value = useMemo<HomeEntryContextValue>(() => ({
    pendingHomeSection,
    homeIntroKey,
    prepareHomeSection,
    clearHomeSection,
    replayHomeIntro,
  }), [clearHomeSection, homeIntroKey, pendingHomeSection, prepareHomeSection]);

  return (
    <HomeEntryContext.Provider value={value}>
      {children}
    </HomeEntryContext.Provider>
  );
}

export function useHomeEntry(): HomeEntryContextValue {
  const context = useContext(HomeEntryContext);

  if (context === null) {
    throw new Error('useHomeEntry must be used within HomeEntryProvider');
  }

  return context;
}

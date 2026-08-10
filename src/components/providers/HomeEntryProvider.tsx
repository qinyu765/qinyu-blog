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
  reduceHomeIntroRequest,
  type HomeEntryContextValue,
  type HomeIntroMode,
  type HomeIntroRequest,
  type HomeSection,
} from '@/lib/home-entry';

const HomeEntryContext = createContext<HomeEntryContextValue | null>(null);

export function HomeEntryProvider({ children }: { children: React.ReactNode }) {
  const [pendingHomeSection, dispatch] = useReducer(reduceHomeEntryIntent, null);
  const [homeIntroRequest, requestHomeIntro] = useReducer(
    (state: HomeIntroRequest, mode: HomeIntroMode) => reduceHomeIntroRequest(state, mode),
    { key: 0, mode: 'fresh' },
  );
  const [consumedHomeIntroKey, setConsumedHomeIntroKey] = useReducer(
    (state: number, key: number) => Math.max(state, key),
    0,
  );

  const prepareHomeSection = useCallback((section: HomeSection) => {
    dispatch({ type: 'prepare-section', section });
  }, []);

  const clearHomeSection = useCallback(() => {
    dispatch({ type: 'clear-section' });
  }, []);

  const consumeHomeIntro = useCallback((key: number) => {
    setConsumedHomeIntroKey(key);
  }, []);

  const value = useMemo<HomeEntryContextValue>(() => ({
    pendingHomeSection,
    homeIntroRequest,
    consumedHomeIntroKey,
    prepareHomeSection,
    clearHomeSection,
    requestHomeIntro,
    consumeHomeIntro,
  }), [
    clearHomeSection,
    consumeHomeIntro,
    consumedHomeIntroKey,
    homeIntroRequest,
    pendingHomeSection,
    prepareHomeSection,
  ]);

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

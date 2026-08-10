import { shouldAnimateOrb } from './orb-motion';

export type HomeSection = 'about' | 'favorites';

export type OrbEntryMode = 'intro' | 'anchor' | 'resting';

export interface HomeEntryContextValue {
  pendingHomeSection: HomeSection | null;
  homeIntroKey: number;
  prepareHomeSection(section: HomeSection): void;
  clearHomeSection(): void;
  replayHomeIntro(): void;
}

export interface OrbEntryContext {
  pathname: string;
  pendingHomeSection: HomeSection | null;
  hash: string;
  viewportWidth: number;
  reducedMotion: boolean;
}

export type HomeEntryAction =
  | { type: 'prepare-section'; section: HomeSection }
  | { type: 'clear-section' };

export interface NavigationActivation {
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

interface HomeNavigationContext {
  pathname: string;
  href: string;
  activation: NavigationActivation;
}

export type HomeNavigationIntent = HomeSection | 'intro' | null;

export function isPlainNavigationActivation(
  activation: NavigationActivation,
): boolean {
  return activation.button === 0
    && !activation.altKey
    && !activation.ctrlKey
    && !activation.metaKey
    && !activation.shiftKey;
}

export function reduceHomeEntryIntent(
  _state: HomeSection | null,
  action: HomeEntryAction,
): HomeSection | null {
  if (action.type === 'prepare-section') {
    return action.section;
  }

  return null;
}

export function reduceHomeIntroKey(state: number): number {
  return state + 1;
}

export function getHomeSectionFromHash(hash: string): HomeSection | null {
  const section = hash.replace(/^#/, '');
  return section === 'about' || section === 'favorites' ? section : null;
}

export function getHomeNavigationIntent({
  pathname,
  href,
  activation,
}: HomeNavigationContext): HomeNavigationIntent {
  if (!isPlainNavigationActivation(activation)) {
    return null;
  }

  if (href === '/') {
    return 'intro';
  }

  if (pathname === '/') {
    return null;
  }

  const [, hash = ''] = href.split('#');
  return getHomeSectionFromHash(hash);
}

export function resolveOrbEntryMode(_context: OrbEntryContext): OrbEntryMode {
  const {
    pathname,
    pendingHomeSection,
    hash,
    viewportWidth,
    reducedMotion,
  } = _context;

  if (!shouldAnimateOrb({ pathname, viewportWidth, reducedMotion })) {
    return 'resting';
  }

  if (
    pendingHomeSection !== null
    || getHomeSectionFromHash(hash) !== null
  ) {
    return 'anchor';
  }

  return 'intro';
}

import { shouldAnimateOrb } from './orb-motion';

export type HomeSection = 'about' | 'favorites';

export type HomeIntroMode = 'fresh' | 'returning';

export interface HomeIntroRequest {
  key: number;
  mode: HomeIntroMode;
}

export type OrbEntryMode = 'intro' | 'returning' | 'anchor' | 'resting';

export interface HomeEntryContextValue {
  pendingHomeSection: HomeSection | null;
  homeIntroRequest: HomeIntroRequest;
  consumedHomeIntroKey: number;
  prepareHomeSection(section: HomeSection): void;
  clearHomeSection(): void;
  requestHomeIntro(mode: HomeIntroMode): void;
  consumeHomeIntro(key: number): void;
}

export interface OrbEntryContext {
  pathname: string;
  pendingHomeSection: HomeSection | null;
  hash: string;
  viewportWidth: number;
  reducedMotion: boolean;
  homeIntroRequest: HomeIntroRequest;
  consumedHomeIntroKey: number;
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

export type HomeNavigationIntent = HomeSection | HomeIntroMode | null;

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

export function reduceHomeIntroRequest(
  state: HomeIntroRequest,
  mode: HomeIntroMode,
): HomeIntroRequest {
  return {
    key: state.key + 1,
    mode,
  };
}

export function getHomeSectionFromHash(hash: string): HomeSection | null {
  const section = hash.replace(/^#/, '');
  return section === 'about' || section === 'favorites' ? section : null;
}

export function shouldClearHomeAnchor(
  pendingHomeSection: HomeSection | null,
  hash: string,
): boolean {
  return pendingHomeSection !== null
    && getHomeSectionFromHash(hash) === pendingHomeSection;
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
    return pathname === '/' ? 'fresh' : 'returning';
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
    homeIntroRequest,
    consumedHomeIntroKey,
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

  if (
    homeIntroRequest.mode === 'returning'
    && homeIntroRequest.key > consumedHomeIntroKey
  ) {
    return 'returning';
  }

  return 'intro';
}

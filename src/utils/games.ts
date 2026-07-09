import { assetPath } from './i18n';

export type GameColor = 'cyan' | 'purple' | 'pink';
export type GameAspectRatio = '16/9' | '4/3';

export interface Game {
  slug: string;
  title: string;
  gameUrl: string;
  description: string;
  tags: string[];
  color: GameColor;
  aspectRatio: GameAspectRatio;
  // Backend data for the 3D-flip back face
  controls?: string[];
  tech?: string[];
  year?: number;
  author?: string;
  repoUrl?: string;
}

export const games: Game[] = [
  {
    slug: 'demo',
    title: 'DEMO',
    gameUrl: assetPath('/games/demo.html'),
    description: 'Partículas interactivas con Canvas',
    tags: ['canvas', 'arcade'],
    color: 'cyan',
    aspectRatio: '16/9',
    controls: ['Mouse', 'Click'],
    tech: ['HTML5 Canvas', 'Vanilla JS', 'CSS'],
    year: 2024,
    author: 'Anonymous',
  },
];

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

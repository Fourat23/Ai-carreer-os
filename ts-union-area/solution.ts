import { Shape } from './shapes';

export function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      return Math.PI * s.radius * s.radius;
    case 'rect':
      return s.width * s.height;
  }
}

import { User } from './types';

export function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null
    && typeof (v as Record<string, unknown>).id === 'number'
    && typeof (v as Record<string, unknown>).name === 'string';
}

export function userName(v: unknown): string {
  return isUser(v) ? v.name : 'inconnu';
}

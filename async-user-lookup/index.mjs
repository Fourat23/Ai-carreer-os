import { USERS } from './data.mjs';
export async function fetchUserName(id){ await Promise.resolve(); return USERS[id] ?? null; }
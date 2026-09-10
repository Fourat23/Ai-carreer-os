import { fetchUser } from './store';

export async function userName(id: number): Promise<string> {
  const user = await fetchUser(id);
  return user ? user.name : 'inconnu';
}

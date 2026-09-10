// Faux magasin de données asynchrone — lecture seule.
export interface User {
  id: number;
  name: string;
}

const USERS: User[] = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Alan' },
];

export function fetchUser(id: number): Promise<User | undefined> {
  return Promise.resolve(USERS.find((u) => u.id === id));
}

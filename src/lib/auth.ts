import { User, UserRole } from '@/types';
import { generateId } from '@/lib/utils';

const USERS_KEY = 'aero_users';
const CURRENT_KEY = 'aero_current_user';
const INITIALIZED_KEY = 'aero_initialized_v2';

// Default demo accounts — always available to anyone who opens the app
const DEFAULT_USERS: User[] = [
  {
    id: 'default-admin-001',
    name: 'System Admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-manager-001',
    name: 'Ahmed Hassan',
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-employee-001',
    name: 'Sara Mohamed',
    username: 'employee',
    password: 'employee123',
    role: 'employee',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export function getStoredUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * initializeAdmin: ensures DEFAULT_USERS always exist in localStorage.
 * This fixes the sharing problem — any device that opens the app gets
 * the default accounts merged in automatically.
 */
export function initializeAdmin() {
  const alreadyInit = localStorage.getItem(INITIALIZED_KEY);
  const existing = getStoredUsers();

  // Merge default users into existing list (don't overwrite custom users)
  let updated = [...existing];
  let changed = false;

  for (const def of DEFAULT_USERS) {
    const exists = updated.some(u => u.id === def.id || u.username === def.username);
    if (!exists) {
      updated.push(def);
      changed = true;
    }
  }

  if (changed || !alreadyInit) {
    saveUsers(updated);
    localStorage.setItem(INITIALIZED_KEY, '1');
  }
}

export function login(username: string, password: string): User | null {
  const user = getStoredUsers().find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(CURRENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function createUser(name: string, username: string, password: string, role: UserRole): { user: User | null; error: string | null } {
  const users = getStoredUsers();
  if (users.some(u => u.username === username)) {
    return { user: null, error: 'Username already exists' };
  }
  const newUser: User = { id: generateId(), name, username, password, role, createdAt: new Date().toISOString() };
  saveUsers([...users, newUser]);
  return { user: newUser, error: null };
}

export function deleteUser(userId: string) {
  // Prevent deleting default users
  if (DEFAULT_USERS.some(u => u.id === userId)) return;
  saveUsers(getStoredUsers().filter(u => u.id !== userId));
}

export function updateUserPassword(userId: string, newPassword: string) {
  const users = getStoredUsers().map(u => u.id === userId ? { ...u, password: newPassword } : u);
  saveUsers(users);
}

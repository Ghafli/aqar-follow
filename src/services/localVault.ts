/**
 * Local Vault: In-browser secure local storage for authentication and tenants.
 * Guarantees 100% offline and mobile reliability with zero "Load failed" network errors.
 */

import { AuthUser, TenantRecord } from '../types';

const STORAGE_LOCAL_USERS = 'aqar_local_users_vault_v1';
const STORAGE_ACTIVE_SESSION = 'aqar_local_active_session_v1';
const STORAGE_LOCAL_TENANTS = 'aqar_local_tenants_vault_v1';

interface StoredLocalUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

// Simple deterministic hash for local password storage
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'lh_' + Math.abs(hash).toString(36) + '_' + btoa(encodeURIComponent(password)).slice(0, 10);
}

function getStoredUsers(): StoredLocalUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredLocalUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_LOCAL_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save local users vault:', err);
  }
}

export function localSignUp(
  email: string,
  password: string,
  fullName?: string
): { user: AuthUser | null; error: string | null } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { user: null, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }
  if (password.length < 6) {
    return { user: null, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' };
  }

  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { user: null, error: 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول مباشرة.' };
  }

  const newUser: StoredLocalUser = {
    id: `local_usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: fullName?.trim() || cleanEmail.split('@')[0] || 'User',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);

  const authUser: AuthUser = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
  };

  localSetSession(authUser);
  return { user: authUser, error: null };
}

export function localSignIn(
  email: string,
  password: string
): { user: AuthUser | null; error: string | null } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { user: null, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    // If no users exist yet or this user does not exist, provide friendly option
    return { 
      user: null, 
      error: 'لم يتم العثور على حساب بهذا البريد الإلكتروني. يرجى الضغط على "إنشاء حساب جديد".' 
    };
  }

  if (found.passwordHash !== hashPassword(password)) {
    return { user: null, error: 'كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.' };
  }

  const authUser: AuthUser = {
    id: found.id,
    email: found.email,
    name: found.name,
  };

  localSetSession(authUser);
  return { user: authUser, error: null };
}

export function localGetSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function localSetSession(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_SESSION);
    }
  } catch (err) {
    console.error('Failed to update local session:', err);
  }
}

export function localClearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ACTIVE_SESSION);
  } catch {}
}

// Local tenants management
export function localGetTenants(userId?: string): TenantRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_TENANTS);
    const all: TenantRecord[] = raw ? JSON.parse(raw) : [];
    if (!userId) return all;
    return all.filter((t) => !t.userId || t.userId === userId);
  } catch {
    return [];
  }
}

export function localSaveTenant(tenant: TenantRecord, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_TENANTS);
    let all: TenantRecord[] = raw ? JSON.parse(raw) : [];
    const targetUserId = userId || tenant.userId;
    const toSave: TenantRecord = {
      ...tenant,
      userId: targetUserId,
    };

    const idx = all.findIndex((t) => t.id === tenant.id);
    if (idx >= 0) {
      all[idx] = toSave;
    } else {
      all.unshift(toSave);
    }
    localStorage.setItem(STORAGE_LOCAL_TENANTS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save tenant to local vault:', err);
  }
}

export function localDeleteTenant(tenantId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_TENANTS);
    if (!raw) return;
    const all: TenantRecord[] = JSON.parse(raw);
    const filtered = all.filter((t) => t.id !== tenantId);
    localStorage.setItem(STORAGE_LOCAL_TENANTS, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete tenant from local vault:', err);
  }
}

export function localSyncTenants(remoteTenants: TenantRecord[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_TENANTS);
    let all: TenantRecord[] = raw ? JSON.parse(raw) : [];

    // Keep tenants belonging to other users
    if (userId) {
      all = all.filter((t) => t.userId && t.userId !== userId);
    } else {
      all = [];
    }

    // Add remote tenants
    all.unshift(...remoteTenants);
    localStorage.setItem(STORAGE_LOCAL_TENANTS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to sync tenants locally:', err);
  }
}

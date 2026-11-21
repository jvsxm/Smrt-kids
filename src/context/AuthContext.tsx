import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { apiRequest } from '../lib/api';
import { ChildProfile, ParentUser } from '../types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  parentUser: ParentUser | null;
  token: string | null;
  loading: boolean;
  authError: string | null;
  childrenList: ChildProfile[];
  activeChildId: string | null;
  activeChild: ChildProfile | null;
  setActiveChildId: (id: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshChildren: () => Promise<ChildProfile[]>;
  getFreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [parentUser, setParentUser] = useState<ParentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const loadParentData = useCallback(async (idToken: string) => {
    const [meRes, childrenRes] = await Promise.all([
      apiRequest<{ user: ParentUser }>('/api/auth/me', {}, idToken),
      apiRequest<{ children: ChildProfile[] }>('/api/children', {}, idToken),
    ]);
    setParentUser(meRes.user);
    setChildrenList(childrenRes.children);
    setActiveChildId((prev) => {
      if (prev && childrenRes.children.some((c) => c.id === prev)) {
        return prev;
      }
      return childrenRes.children[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError(null);
      if (!user) {
        setFirebaseUser(null);
        setParentUser(null);
        setToken(null);
        setChildrenList([]);
        setActiveChildId(null);
        setLoading(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        setFirebaseUser(user);
        setToken(idToken);
        await loadParentData(idToken);
      } catch (err) {
        console.error('Failed to sync authenticated parent session:', err);
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Unable to verify parent session.'
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadParentData]);

  const getFreshToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    const fresh = await auth.currentUser.getIdToken();
    setToken(fresh);
    return fresh;
  }, []);

  const refreshChildren = useCallback(async () => {
    const idToken = await getFreshToken();
    if (!idToken) return [];
    const res = await apiRequest<{ children: ChildProfile[] }>(
      '/api/children',
      {},
      idToken
    );
    setChildrenList(res.children);
    setActiveChildId((prev) => {
      if (prev && res.children.some((c) => c.id === prev)) {
        return prev;
      }
      return res.children[0]?.id ?? null;
    });
    return res.children;
  }, [getFreshToken]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await credential.user.getIdToken();
      setToken(idToken);
      await loadParentData(idToken);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google sign-in was cancelled.';
      setAuthError(message);
      throw err;
    }
  }, [loadParentData]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setParentUser(null);
    setToken(null);
    setChildrenList([]);
    setActiveChildId(null);
  }, []);

  const activeChild =
    childrenList.find((c) => c.id === activeChildId) ?? childrenList[0] ?? null;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        parentUser,
        token,
        loading,
        authError,
        childrenList,
        activeChildId,
        activeChild,
        setActiveChildId,
        signInWithGoogle,
        signOut,
        refreshChildren,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

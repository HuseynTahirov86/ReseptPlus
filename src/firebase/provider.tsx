'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { Doctor, Admin, UserProfile, SystemAdmin, Pharmacist, Hospital, Pharmacy, Patient } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';


interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Custom user data including role
export type AppUser = User & {
    profile?: Partial<UserProfile>;
};

type AuthState = "LOADING" | "UNAUTHENTICATED" | "AWAITING_EMAIL_VERIFICATION" | "AUTHENTICATED";

// Internal state for user authentication and profile data
interface UserAuthState {
  user: AppUser | null;
  authState: AuthState;
  userError: Error | null;
  generatedOtp: string | null;
}


// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  
  // User authentication state
  user: AppUser | null;
  authState: AuthState;
  userError: Error | null;
  generatedOtp: string | null;

  isUserLoading: boolean; // Derived from authState for easier use in components

  verifyUserSession: () => void;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: AppUser | null;
  authState: AuthState;
  userError: Error | null;
  generatedOtp: string | null;
  isUserLoading: boolean;
  verifyUserSession: () => void;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

const RedirectHandler = () => {
  const { user, authState, isUserLoading } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until auth state is fully determined
    }

    const isAdminPage = pathname.startsWith('/admin');
    const isDashboardPage = pathname.startsWith('/dashboard');
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/admin/login');
    const isVerifyPage = pathname === '/login/verify-otp';

    if (authState === "AUTHENTICATED") {
      const role = user?.profile?.role;
      // If user is authenticated and on an auth or verification page, redirect away
      if (isAuthPage || isVerifyPage) {
        if (role === 'admin' || role === 'system_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }
      
      // If user is not on the correct page for their role, redirect them
      if ((role === 'admin' || role === 'system_admin') && !isAdminPage) {
         router.push('/admin/dashboard');
      } else if (role && ['doctor', 'head_doctor', 'pharmacist', 'head_pharmacist', 'employee', 'patient'].includes(role) && !isDashboardPage) {
         router.push('/dashboard');
      }
    } else if (authState === "AWAITING_EMAIL_VERIFICATION") {
        // If user is waiting for verification, they MUST be on the verify page
        if (!isVerifyPage) {
            router.push('/login/verify-otp');
        }
    } else if (authState === "UNAUTHENTICATED") {
        // If no user is logged in, and they are trying to access a protected route, redirect to login
        if (isAdminPage && pathname !== '/admin/login') {
            router.push('/admin/login');
        } else if (isDashboardPage) {
            router.push('/login');
        }
    }

  }, [user, authState, isUserLoading, pathname, router]);

  return null; // This component does not render anything
};


/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    authState: "LOADING",
    userError: null,
    generatedOtp: null
  });

  const verifyUserSession = () => {
    setUserAuthState(prev => ({ ...prev, authState: "AUTHENTICATED", generatedOtp: null }));
  }

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, authState: "UNAUTHENTICATED", userError: new Error("Auth or Firestore service not provided."), generatedOtp: null });
      return;
    }

    setUserAuthState({ user: null, authState: "LOADING", userError: null, generatedOtp: null });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
            let userProfile: Partial<UserProfile> | undefined = undefined;
            
            try {
                const profilePaths = ['systemAdmins', 'admins', 'doctors', 'pharmacists', 'patients'];
                
                for (const path of profilePaths) {
                    const docRef = doc(firestore, path, firebaseUser.uid);
                    const userDoc = await getDoc(docRef);
                    if (userDoc.exists()) {
                        userProfile = userDoc.data() as UserProfile;
                        break;
                    }
                }
                
                if (!userProfile) {
                    console.warn(`No profile found for user ${firebaseUser.uid} in any collection. Signing out.`);
                    await auth.signOut();
                    setUserAuthState({ user: null, authState: "UNAUTHENTICATED", userError: null, generatedOtp: null });
                    return;
                }

                const appUser: AppUser = { ...firebaseUser, profile: userProfile };
                const rolesNeedingOtp = ['doctor', 'head_doctor', 'employee', 'head_pharmacist'];

                if (userProfile.role && rolesNeedingOtp.includes(userProfile.role)) {
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setUserAuthState({ user: appUser, authState: "AWAITING_EMAIL_VERIFICATION", userError: null, generatedOtp: newOtp });
                } else {
                    setUserAuthState({ user: appUser, authState: "AUTHENTICATED", userError: null, generatedOtp: null });
                }

            } catch (e) {
               console.error("FirebaseProvider: Failed to fetch/create user profile:", e);
               setUserAuthState({ user: firebaseUser, authState: "UNAUTHENTICATED", userError: e instanceof Error ? e : new Error('Failed to fetch user profile'), generatedOtp: null });
            }
        } else {
             setUserAuthState({ user: null, authState: "UNAUTHENTICATED", userError: null, generatedOtp: null });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, authState: "UNAUTHENTICATED", userError: error, generatedOtp: null });
      }
    );
    return () => unsubscribe();
  }, [auth, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      authState: userAuthState.authState,
      userError: userAuthState.userError,
      generatedOtp: userAuthState.generatedOtp,
      isUserLoading: userAuthState.authState === "LOADING",
      verifyUserSession: verifyUserSession
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      <RedirectHandler />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    authState: context.authState,
    userError: context.userError,
    generatedOtp: context.generatedOtp,
    isUserLoading: context.isUserLoading,
    verifyUserSession: context.verifyUserSession,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = (): UserHookResult => { 
  const { user, isUserLoading, userError, authState } = useFirebase(); 
  
  // Return user as null if they are not fully authenticated
  const finalUser = authState === "AUTHENTICATED" ? user : null;

  return { user: finalUser, isUserLoading, userError };
};


'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { Doctor, Admin, UserProfile } from '@/lib/types';
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

// Internal state for user authentication and profile data
interface UserAuthState {
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}


// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: AppUser | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// Special email for the first admin
const SUPER_ADMIN_EMAIL = 'admin@sagliknet.az';

const RedirectHandler = () => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect until auth state is determined
    if (isUserLoading) {
      return;
    }

    const isAdminPage = pathname.startsWith('/admin');
    const isDashboardPage = pathname.startsWith('/dashboard');

    if (user) {
      if (user.profile?.role === 'admin' || user.profile?.role === 'system_admin') {
        // If user is admin and not already in admin section, redirect to admin dashboard
        if (!isAdminPage) {
          router.push('/admin/dashboard');
        }
      } else {
        // If user is a doctor/head_doctor and not already in doctor dashboard, redirect there
        if (!isDashboardPage) {
          router.push('/dashboard');
        }
      }
    } else {
      // If no user is logged in, and they are trying to access a protected route, redirect to login
      if (isAdminPage || isDashboardPage) {
        router.push('/login');
      }
    }

  }, [user, isUserLoading, pathname, router]);

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
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null }); // Reset on auth instance change

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => { // Auth state determined
        if (firebaseUser) {
            let userProfile: Partial<UserProfile> | undefined = undefined;
            
            try {
                // IMPORTANT: The order of checking collections is crucial.
                // A user could be both a doctor and an admin in some systems,
                // so we define a clear priority.
                const profilePaths = ['systemAdmins', 'admins', 'doctors', 'pharmacists', 'patients'];
                let profileFound = false;

                for (const path of profilePaths) {
                    const docRef = doc(firestore, path, firebaseUser.uid);
                    const userDoc = await getDoc(docRef);
                    if (userDoc.exists()) {
                        userProfile = userDoc.data() as UserProfile;
                        profileFound = true;
                        break; // Stop after finding the first matching profile
                    }
                }

                // Super Admin check: If it's the super admin's first login, create their admin profile.
                if (!profileFound && firebaseUser.email === SUPER_ADMIN_EMAIL) {
                    const adminDocRef = doc(firestore, 'admins', firebaseUser.uid);
                    const newAdminProfile: Admin = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        role: 'admin',
                    };
                    await setDoc(adminDocRef, newAdminProfile);
                    console.log('Super admin document created for:', firebaseUser.email);
                    userProfile = newAdminProfile;
                }

                if (!userProfile) {
                    // If no profile is found after checking all collections, the user is unauthorized.
                    console.warn(`No profile found for user ${firebaseUser.uid} in any collection. This user is unauthorized.`);
                    // We can either sign them out or leave them with a basic user object without a profile.
                    // For this system, we'll let them be authenticated but without a profile,
                    // and access control will be handled by UI and security rules.
                }

                const appUser: AppUser = { ...firebaseUser, profile: userProfile };
                setUserAuthState({ user: appUser, isUserLoading: false, userError: null });

            } catch (e) {
               console.error("FirebaseProvider: Failed to fetch user profile:", e);
               // Still provide the basic auth user even if profile fetching fails
               setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: e instanceof Error ? e : new Error('Failed to fetch user profile') });
            }
        } else {
             setUserAuthState({ user: null, isUserLoading: false, userError: null });
        }
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth, firestore]); // Depends on the auth and firestore instance

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
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

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
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
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
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

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { 
  const { user, isUserLoading, userError } = useFirebase(); 
  return { user, isUserLoading, userError };
};

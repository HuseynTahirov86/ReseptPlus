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

// Special emails for admin/test roles
const SPECIAL_ACCOUNTS: Record<string, Partial<UserProfile>> = {
    'admin@sagliknet.az': { role: 'admin' },
    'superadmin@reseptplus.az': { role: 'system_admin' },
    'aysel.quliyeva@reseptplus.az': { role: 'head_doctor', firstName: 'Aysel', lastName: 'Quliyeva', specialization: 'Baş Həkim' },
    'elvin.agayev@reseptplus.az': { role: 'doctor', firstName: 'Elvin', lastName: 'Ağayev', specialization: 'Kardioloq' },
    'leyla.hesenova@reseptplus.az': { role: 'head_pharmacist', firstName: 'Leyla', lastName: 'Həsənova' },
    'anar.memmedov@reseptplus.az': { role: 'employee', firstName: 'Anar', lastName: 'Məmmədov' },
    'orxan.veliyev@reseptplus.az': { role: 'patient', firstName: 'Orxan', lastName: 'Vəliyev', dateOfBirth: '1988-05-15', gender: 'Kişi', contactNumber: '+994501234567', finCode: '1A2B3C4' }
};


const getCollectionForRole = (role: string) => {
    switch (role) {
        case 'system_admin': return 'systemAdmins';
        case 'admin': return 'admins';
        case 'head_doctor':
        case 'doctor': return 'doctors';
        case 'head_pharmacist':
        case 'employee': return 'pharmacists';
        case 'patient': return 'patients';
        default: return null;
    }
};

/**
 * Ensures all demo accounts and related entities exist in Firestore.
 * This is triggered only once when the superadmin logs in for the first time.
 */
async function ensureDemoAccounts(db: Firestore, superAdminUid: string) {
    const setupFlagDoc = doc(db, 'systemAdmins', superAdminUid);
    const setupFlagSnap = await getDoc(setupFlagDoc);

    // Check if setup has already been run for this admin
    if (setupFlagSnap.exists() && setupFlagSnap.data()?.demoSetupCompleted) {
        return;
    }
    
    console.log("İlk superadmin girişi. Nümunə hesablar və məlumatlar yaradılır...");

    try {
        // Create Hospital
        const hospitalRef = doc(db, 'hospitals', 'ndmc_hospital_01');
        await setDoc(hospitalRef, {
            id: 'ndmc_hospital_01',
            name: 'Naxçıvan Diaqnostika Müalicə Mərkəzi',
            address: 'Naxçıvan şəh., Heydər Əliyev pr.',
            contactNumber: '(036) 545-01-01',
            email: 'info@ndmc.az'
        } as Hospital);

        // Create Pharmacy
        const pharmacyRef = doc(db, 'pharmacies', 'zeytun_pharmacy_05');
        await setDoc(pharmacyRef, {
            id: 'zeytun_pharmacy_05',
            name: 'Zeytun Aptek №5',
            address: 'Bakı şəh., Nizami küç. 12',
            contactNumber: '(012) 498-76-54',
            email: 'info@zeytunpharma.az',
            latitude: 40.375,
            longitude: 49.845
        } as Pharmacy);
        
        // This is a simplified client-side creation for demo purposes.
        // It does not create Auth users, only Firestore profiles.
        // The SPECIAL_ACCOUNTS login logic handles the Auth part.
        
        // Setup Doctor and Head Doctor profiles
        const ayselProfile = SPECIAL_ACCOUNTS['aysel.quliyeva@reseptplus.az'] as Doctor;
        const elvinProfile = SPECIAL_ACCOUNTS['elvin.agayev@reseptplus.az'] as Doctor;
        await setDoc(doc(db, 'doctors', 'demo_head_doctor_id'), { ...ayselProfile, hospitalId: 'ndmc_hospital_01', id: 'demo_head_doctor_id' });
        await setDoc(doc(db, 'doctors', 'demo_doctor_id'), { ...elvinProfile, hospitalId: 'ndmc_hospital_01', id: 'demo_doctor_id' });
        
        // Setup Pharmacist and Head Pharmacist profiles
        const leylaProfile = SPECIAL_ACCOUNTS['leyla.hesenova@reseptplus.az'] as Pharmacist;
        const anarProfile = SPECIAL_ACCOUNTS['anar.memmedov@reseptplus.az'] as Pharmacist;
        await setDoc(doc(db, 'pharmacists', 'demo_head_pharmacist_id'), { ...leylaProfile, pharmacyId: 'zeytun_pharmacy_05', id: 'demo_head_pharmacist_id' });
        await setDoc(doc(db, 'pharmacists', 'demo_pharmacist_id'), { ...anarProfile, pharmacyId: 'zeytun_pharmacy_05', id: 'demo_pharmacist_id' });
        
        // Setup Patient profile
        const orxanProfile = SPECIAL_ACCOUNTS['orxan.veliyev@reseptplus.az'] as Patient;
        await setDoc(doc(db, 'patients', 'demo_patient_id'), { ...orxanProfile, id: 'demo_patient_id' });

        // Mark setup as complete
        await setDoc(setupFlagDoc, { demoSetupCompleted: true }, { merge: true });
        
        console.log("Nümunə məlumatlar uğurla yaradıldı.");

    } catch (error) {
        console.error("Nümunə məlumatların yaradılması zamanı xəta:", error);
    }
}


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
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/admin/login');

    if (user) {
      const role = user.profile?.role;
      // If user is on an auth page, redirect them away
      if (isAuthPage) {
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

    } else {
      // If no user is logged in, and they are trying to access a protected route, redirect to login
      if (isAdminPage) {
        router.push('/admin/login');
      } else if (isDashboardPage) {
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
                const profilePaths = ['systemAdmins', 'admins', 'doctors', 'pharmacists', 'patients'];
                let profileFound = false;
                let foundPath = '';

                for (const path of profilePaths) {
                    const docRef = doc(firestore, path, firebaseUser.uid);
                    const userDoc = await getDoc(docRef);
                    if (userDoc.exists()) {
                        userProfile = userDoc.data() as UserProfile;
                        profileFound = true;
                        foundPath = path;
                        break; // Stop after finding the first matching profile
                    }
                }
                
                // If no profile found, check if it's a special test/admin email for first-time setup.
                if (!profileFound && firebaseUser.email && SPECIAL_ACCOUNTS[firebaseUser.email]) {
                    const specialProfile = SPECIAL_ACCOUNTS[firebaseUser.email];
                    const role = specialProfile.role;
                    const collectionName = role ? getCollectionForRole(role) : null;
                    
                    if (collectionName) {
                        const uid = (role === 'patient') ? 'demo_patient_id' 
                                  : (role === 'doctor') ? 'demo_doctor_id'
                                  : (role === 'head_doctor') ? 'demo_head_doctor_id'
                                  : (role === 'pharmacist' || role === 'employee') ? 'demo_pharmacist_id'
                                  : (role === 'head_pharmacist') ? 'demo_head_pharmacist_id'
                                  : firebaseUser.uid;
                                  
                        const docRef = doc(firestore, collectionName, uid);

                        const docSnap = await getDoc(docRef);
                        if (!docSnap.exists()) {
                           await setDoc(docRef, { ...specialProfile, id: uid, email: firebaseUser.email });
                           userProfile = { ...specialProfile, id: uid, email: firebaseUser.email };
                        } else {
                           userProfile = docSnap.data() as UserProfile;
                        }

                         if (role === 'system_admin') {
                            await ensureDemoAccounts(firestore, firebaseUser.uid);
                        }
                    }
                }

                if (!userProfile) {
                    console.warn(`No profile found for user ${firebaseUser.uid} in any collection.`);
                }

                const appUser: AppUser = { ...firebaseUser, profile: userProfile };
                setUserAuthState({ user: appUser, isUserLoading: false, userError: null });

            } catch (e) {
               console.error("FirebaseProvider: Failed to fetch/create user profile:", e);
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

    
import {
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  photoUrl?: string;
  phone?: string;
  provider?: 'google' | 'email' | 'guest';
  createdAt?: any;

  // Doctor Verification & Credentials
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  medicalLicenseNumber?: string;
  medicalCouncil?: string;
  specialty?: string;
  experienceYears?: number;
  hospital?: string;
  verificationDocumentName?: string;
  verificationDocumentUrl?: string;
  verificationSubmittedAt?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

export interface DoctorSignupDetails {
  medicalLicenseNumber?: string;
  medicalCouncil?: string;
  specialty?: string;
  experienceYears?: number;
  hospital?: string;
  documentName?: string;
}

const CURRENT_USER_STORAGE_KEY = 'medicare_current_user_profile';

export const getPersistedUser = async (): Promise<UserProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const persistUser = async (profile: UserProfile | null): Promise<void> => {
  try {
    if (profile) {
      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('persistUser warning:', e);
  }
};

/**
 * Sign in using Google ID Token / Access Token with Firebase Auth
 * Saves and synchronizes user profile in Firestore
 */
export const signInWithGoogleCredential = async (
  idToken: string,
  accessToken?: string,
  role: 'patient' | 'doctor' = 'patient',
  profileDetails?: { name?: string; photoUrl?: string; email?: string }
): Promise<{ user: User; profile: UserProfile }> => {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;

  let profile: UserProfile;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      profile = snap.data() as UserProfile;
      if (role && profile.role !== role) {
        profile.role = role;
        await setDoc(userRef, { role, updatedAt: serverTimestamp() }, { merge: true });
      }
    } else {
      profile = {
        uid: user.uid,
        email: user.email || profileDetails?.email || '',
        name: user.displayName || profileDetails?.name || (role === 'doctor' ? 'Healthcare Provider' : 'OPD Patient'),
        role,
        photoUrl: user.photoURL || profileDetails?.photoUrl || '',
        phone: user.phoneNumber || '',
        provider: 'google',
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, profile);
    }
  } catch (err) {
    console.warn('Could not sync Google user profile with Firestore:', err);
    profile = {
      uid: user.uid,
      email: user.email || profileDetails?.email || '',
      name: user.displayName || profileDetails?.name || (role === 'doctor' ? 'Healthcare Provider' : 'OPD Patient'),
      role,
      photoUrl: user.photoURL || profileDetails?.photoUrl || '',
      provider: 'google',
    };
  }

  await persistUser(profile);
  return { user, profile };
};

/**
 * Web Platform Google Auth popup
 */
export const signInWithGoogleWeb = async (
  role: 'patient' | 'doctor' = 'patient'
): Promise<{ user: User; profile: UserProfile }> => {
  if (Platform.OS !== 'web') {
    throw new Error('signInWithGoogleWeb is intended for web browsers');
  }

  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  let profile: UserProfile;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      profile = snap.data() as UserProfile;
      if (role && profile.role !== role) {
        profile.role = role;
        await setDoc(userRef, { role, updatedAt: serverTimestamp() }, { merge: true });
      }
    } else {
      profile = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || (role === 'doctor' ? 'Healthcare Provider' : 'OPD Patient'),
        role,
        photoUrl: user.photoURL || '',
        phone: user.phoneNumber || '',
        provider: 'google',
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, profile);
    }
  } catch {
    profile = {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || (role === 'doctor' ? 'Healthcare Provider' : 'OPD Patient'),
      role,
      photoUrl: user.photoURL || '',
      provider: 'google',
    };
  }

  await persistUser(profile);
  return { user, profile };
};

/**
 * Quick Sign-In / Demo
 */
export const signInWithGoogleDemo = async (
  role: 'patient' | 'doctor' = 'patient',
  customInfo?: { name?: string; email?: string }
): Promise<{ profile: UserProfile }> => {
  const isDoctor = role === 'doctor';
  const customEmail = customInfo?.email?.trim();
  const derivedName = customEmail
    ? customEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : undefined;

  let userName = customInfo?.name?.trim() || derivedName;
  if (!userName) {
    userName = isDoctor ? 'Dr. Practicing Physician' : 'OPD Patient';
  } else if (isDoctor && !userName.toLowerCase().startsWith('dr.')) {
    userName = `Dr. ${userName}`;
  }

  const userEmail = customEmail || (isDoctor ? 'doctor@medicare.com' : 'patient@medicare.com');
  const uid = customEmail
    ? `usr-${customEmail.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : isDoctor
    ? 'doc-usr-default'
    : `pat-usr-${Date.now().toString().slice(-6)}`;

  const profile: UserProfile = {
    uid,
    email: userEmail,
    name: userName,
    role,
    photoUrl: isDoctor
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    phone: isDoctor ? '+92 300 8472910' : '+92 300 1234567',
    provider: 'google',
    createdAt: new Date().toISOString(),
    ...(isDoctor
      ? {
          verificationStatus: 'verified' as const,
          medicalLicenseNumber: 'PMC-84920-M',
          medicalCouncil: 'Pakistan Medical Commission (PMC)',
          specialty: 'Cardiology',
          experienceYears: 12,
          hospital: 'MediCare Central Clinic',
          verificationDocumentName: 'PMC_License_Certificate_Official.pdf',
          verifiedAt: '2025-01-10T10:00:00.000Z',
        }
      : {}),
  };

  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (err) {
    console.warn('Demo profile firestore notice:', err);
  }

  await persistUser(profile);
  return { profile };
};

/**
 * Fetch user profile from Firestore by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not fetch user profile:', err);
  }
  return null;
};

/**
 * Log out current user and clear local persistence
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out notice:', e);
  }
  await persistUser(null);
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const loginUser = async (
  email: string,
  pass: string,
  expectedRole: 'patient' | 'doctor' = 'patient'
): Promise<{ user: User; profile: UserProfile }> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  let profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    const rawName = email
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const finalName =
      expectedRole === 'doctor' && !rawName.toLowerCase().startsWith('dr.')
        ? `Dr. ${rawName}`
        : rawName;
    profile = {
      uid: credential.user.uid,
      email: credential.user.email || email.trim(),
      name: credential.user.displayName || finalName,
      role: expectedRole,
      provider: 'email',
    };
    try {
      await setDoc(doc(db, 'users', credential.user.uid), profile);
    } catch (e) {
      console.warn('Firestore doc creation notice:', e);
    }
  } else if (expectedRole && profile.role !== expectedRole) {
    profile.role = expectedRole;
    try {
      await setDoc(doc(db, 'users', credential.user.uid), { role: expectedRole }, { merge: true });
    } catch {}
  }
  await persistUser(profile);
  return { user: credential.user, profile };
};

export const resetUserPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email.trim());
};

export const registerUser = async (
  email: string,
  pass: string,
  fullName: string,
  role: 'patient' | 'doctor' = 'patient',
  phone?: string,
  doctorDetails?: DoctorSignupDetails
): Promise<{ user: User; profile: UserProfile }> => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const isDoctor = role === 'doctor';
  const profile: UserProfile = {
    uid: credential.user.uid,
    email: email.trim(),
    name: fullName.trim(),
    role,
    phone: phone?.trim(),
    provider: 'email',
    createdAt: serverTimestamp(),
    ...(isDoctor
      ? {
          verificationStatus: doctorDetails?.medicalLicenseNumber ? 'pending' : 'unverified',
          medicalLicenseNumber: doctorDetails?.medicalLicenseNumber?.trim(),
          medicalCouncil: doctorDetails?.medicalCouncil?.trim() || 'Pakistan Medical Commission (PMC)',
          specialty: doctorDetails?.specialty || 'General',
          experienceYears: doctorDetails?.experienceYears || 5,
          hospital: doctorDetails?.hospital?.trim() || 'MediCare Hospital',
          verificationDocumentName: doctorDetails?.documentName || 'License_Verification_Certificate.pdf',
          verificationSubmittedAt: new Date().toISOString(),
        }
      : {}),
  };

  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (e) {
    console.warn('Register Firestore user doc notice:', e);
  }

  await persistUser(profile);
  return { user: credential.user, profile };
};

/**
 * Update Doctor Verification details in Firestore & AsyncStorage
 */
export const updateDoctorVerification = async (
  uid: string,
  verification: {
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
    medicalLicenseNumber?: string;
    medicalCouncil?: string;
    specialty?: string;
    experienceYears?: number;
    hospital?: string;
    verificationDocumentName?: string;
    verificationDocumentUrl?: string;
    verificationNotes?: string;
  }
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const updates: Partial<UserProfile> = {
      verificationStatus: verification.status,
      ...(verification.medicalLicenseNumber ? { medicalLicenseNumber: verification.medicalLicenseNumber } : {}),
      ...(verification.medicalCouncil ? { medicalCouncil: verification.medicalCouncil } : {}),
      ...(verification.specialty ? { specialty: verification.specialty } : {}),
      ...(verification.experienceYears !== undefined ? { experienceYears: verification.experienceYears } : {}),
      ...(verification.hospital ? { hospital: verification.hospital } : {}),
      ...(verification.verificationDocumentName ? { verificationDocumentName: verification.verificationDocumentName } : {}),
      ...(verification.verificationDocumentUrl ? { verificationDocumentUrl: verification.verificationDocumentUrl } : {}),
      ...(verification.verificationNotes ? { verificationNotes: verification.verificationNotes } : {}),
      ...(verification.status === 'verified' ? { verifiedAt: new Date().toISOString() } : {}),
      ...(verification.status === 'pending' ? { verificationSubmittedAt: new Date().toISOString() } : {}),
    };

    try {
      await setDoc(userRef, updates, { merge: true });
    } catch (e) {
      console.warn('Firestore updateDoctorVerification notice:', e);
    }

    const current = await getPersistedUser();
    if (current && current.uid === uid) {
      const merged: UserProfile = { ...current, ...updates };
      await persistUser(merged);
      return merged;
    }

    const fetched = await getUserProfile(uid);
    if (fetched) {
      await persistUser(fetched);
      return fetched;
    }
    return null;
  } catch (err) {
    console.warn('updateDoctorVerification error:', err);
    return null;
  }
};

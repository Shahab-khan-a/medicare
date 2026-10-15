import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Appointment,
  AppointmentStatus,
  Doctor,
  FamilyMember,
  MedicalReport,
  Prescription,
  NotificationItem,
  Review,
  Chat,
  Message,
} from '../types';
import { doctors as defaultDoctorCatalog, reviews as defaultReviewsCatalog } from '../data';

const STORAGE_KEYS = {
  DOCTORS: 'medicare_doctors',
  APPOINTMENTS: (uid: string) => `medicare_user_appointments_${uid}`,
  FAMILY: (uid: string) => `medicare_family_${uid}`,
  REPORTS: (uid: string) => `medicare_reports_${uid}`,
  PRESCRIPTIONS: (uid: string) => `medicare_user_prescriptions_${uid}`,
  NOTIFICATIONS: (uid: string) => `medicare_notifications_${uid}`,
  CHATS: (uid: string) => `medicare_chats_${uid}`,
  MESSAGES: (chatId: string) => `medicare_messages_${chatId}`,
  REVIEWS: 'medicare_reviews',
};

// ==========================================
// 1. DOCTORS DIRECTORY & REAL CLOUD CATALOG
// ==========================================

export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    // 1. Try local cache first for instant UI response
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.DOCTORS);
    let cachedDoctors: Doctor[] = cached ? JSON.parse(cached) : [];

    // 2. Fetch from Firestore
    try {
      const snap = await getDocs(collection(db, 'doctors'));
      if (!snap.empty) {
        const cloudDocs: Doctor[] = [];
        snap.forEach((d) => cloudDocs.push(d.data() as Doctor));
        await AsyncStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(cloudDocs));
        return cloudDocs;
      } else {
        // First run on clean Firebase: seed realistic authentic doctors catalog to Firestore
        for (const docItem of defaultDoctorCatalog) {
          await setDoc(doc(db, 'doctors', docItem.id), {
            ...docItem,
            createdAt: serverTimestamp(),
          });
        }
        await AsyncStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(defaultDoctorCatalog));
        return defaultDoctorCatalog;
      }
    } catch (fireErr) {
      console.warn('Firestore doctors fetch notice (using cache/catalog):', fireErr);
    }

    if (cachedDoctors.length > 0) {
      const hasMissingCityOrCount =
        cachedDoctors.some((d) => !d.city) ||
        cachedDoctors.length < defaultDoctorCatalog.length;
      if (hasMissingCityOrCount) {
        const mergedMap = new Map<string, Doctor>();
        defaultDoctorCatalog.forEach((d) => mergedMap.set(d.id, d));
        cachedDoctors.forEach((d) => {
          const fallback = defaultDoctorCatalog.find((cat) => cat.id === d.id);
          mergedMap.set(d.id, {
            ...d,
            city: d.city || fallback?.city || 'Lahore',
            hospital: d.hospital || fallback?.hospital || 'MediCare Hospital',
          });
        });
        const updatedList = Array.from(mergedMap.values());
        await AsyncStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(updatedList));
        return updatedList;
      }
      return cachedDoctors;
    }
    return defaultDoctorCatalog;
  } catch (err) {
    console.warn('getDoctors error:', err);
    return defaultDoctorCatalog;
  }
};

// ==========================================
// 2. APPOINTMENTS (REAL USER BOOKINGS)
// ==========================================

export const getAppointments = async (
  userId?: string,
  userRole?: 'patient' | 'doctor',
  userEmail?: string,
  userName?: string
): Promise<Appointment[]> => {
  if (!userId) return [];
  try {
    const userStorageKey = STORAGE_KEYS.APPOINTMENTS(userId);
    const cached = await AsyncStorage.getItem(userStorageKey);
    const localAppointments: Appointment[] = cached ? JSON.parse(cached) : [];

    // Filter helper to ensure ONLY this user's appointments are ever returned
    const isUserAppointment = (item: Appointment) => {
      if (userRole === 'doctor') {
        return (
          item.doctorId === userId ||
          Boolean(userName && item.doctorName.toLowerCase().includes(userName.toLowerCase()))
        );
      }
      const matchesUid = (item as any).patientId === userId;
      const matchesEmail =
        userEmail &&
        (item as any).patientEmail &&
        (item as any).patientEmail.toLowerCase() === userEmail.toLowerCase();
      return Boolean(matchesUid || matchesEmail);
    };

    try {
      let q = query(collection(db, 'appointments'));
      if (userRole === 'doctor') {
        q = query(collection(db, 'appointments'), where('doctorId', '==', userId));
      } else {
        q = query(collection(db, 'appointments'), where('patientId', '==', userId));
      }

      const snap = await getDocs(q);
      const cloudAppointments: Appointment[] = [];
      if (!snap.empty) {
        snap.forEach((d) => {
          const item = d.data() as Appointment;
          if (isUserAppointment(item)) {
            cloudAppointments.push(item);
          }
        });
      }

      const map = new Map<string, Appointment>();
      localAppointments.filter(isUserAppointment).forEach((a) => map.set(a.id, a));
      cloudAppointments.forEach((a) => map.set(a.id, a));

      const merged = Array.from(map.values()).sort(
        (a, b) => (Number(b.id.replace(/\D/g, '')) || 0) - (Number(a.id.replace(/\D/g, '')) || 0)
      );

      await AsyncStorage.setItem(userStorageKey, JSON.stringify(merged));
      return merged;
    } catch (fireErr) {
      console.warn('Firestore appointments fetch note:', fireErr);
      return localAppointments.filter(isUserAppointment);
    }
  } catch (err) {
    console.warn('getAppointments error:', err);
    return [];
  }
};

export const saveAppointment = async (appointment: Appointment): Promise<void> => {
  try {
    const patientUid = (appointment as any).patientId;
    if (patientUid) {
      const userKey = STORAGE_KEYS.APPOINTMENTS(patientUid);
      const cached = await AsyncStorage.getItem(userKey);
      const list: Appointment[] = cached ? JSON.parse(cached) : [];
      const updated = [appointment, ...list.filter((a) => a.id !== appointment.id)];
      await AsyncStorage.setItem(userKey, JSON.stringify(updated));
    }

    if (appointment.doctorId) {
      const docKey = STORAGE_KEYS.APPOINTMENTS(appointment.doctorId);
      const docCached = await AsyncStorage.getItem(docKey);
      const docList: Appointment[] = docCached ? JSON.parse(docCached) : [];
      const docUpdated = [appointment, ...docList.filter((a) => a.id !== appointment.id)];
      await AsyncStorage.setItem(docKey, JSON.stringify(docUpdated));
    }

    // Save to Firestore
    try {
      await setDoc(doc(db, 'appointments', appointment.id), {
        ...appointment,
        syncedAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore save appointment note:', fireErr);
    }
  } catch (err) {
    console.warn('saveAppointment error:', err);
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  extra: Record<string, any> = {}
): Promise<void> => {
  try {
    const uid = extra.patientId || extra.userId;
    if (uid) {
      const userKey = STORAGE_KEYS.APPOINTMENTS(uid);
      const cached = await AsyncStorage.getItem(userKey);
      if (cached) {
        const list: Appointment[] = JSON.parse(cached);
        const updated = list.map((a) => (a.id === appointmentId ? { ...a, status, ...extra } : a));
        await AsyncStorage.setItem(userKey, JSON.stringify(updated));
      }
    }

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        ...extra,
        updatedAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore update appointment note:', fireErr);
    }
  } catch (err) {
    console.warn('updateAppointmentStatus error:', err);
  }
};

// ==========================================
// 3. FAMILY MEMBERS (PER USER PROFILE)
// ==========================================

export const getFamilyMembers = async (userId: string): Promise<FamilyMember[]> => {
  if (!userId) return [];
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY(userId));
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const snap = await getDocs(collection(db, 'users', userId, 'family_members'));
      if (!snap.empty) {
        const members: FamilyMember[] = [];
        snap.forEach((d) => members.push(d.data() as FamilyMember));
        await AsyncStorage.setItem(STORAGE_KEYS.FAMILY(userId), JSON.stringify(members));
        return members;
      }
    } catch (fireErr) {
      console.warn('Firestore family members note:', fireErr);
    }

    return [];
  } catch (err) {
    console.warn('getFamilyMembers error:', err);
    return [];
  }
};

export const addFamilyMember = async (
  userId: string,
  member: FamilyMember
): Promise<void> => {
  if (!userId) return;
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY(userId));
    const list: FamilyMember[] = cached ? JSON.parse(cached) : [];
    const updated = [...list.filter((m) => m.id !== member.id), member];
    await AsyncStorage.setItem(STORAGE_KEYS.FAMILY(userId), JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', userId, 'family_members', member.id), {
        ...member,
        createdAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore add family member note:', fireErr);
    }
  } catch (err) {
    console.warn('addFamilyMember error:', err);
  }
};

export const deleteFamilyMember = async (userId: string, memberId: string): Promise<void> => {
  if (!userId) return;
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY(userId));
    if (cached) {
      const list: FamilyMember[] = JSON.parse(cached);
      const updated = list.filter((m) => m.id !== memberId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY(userId), JSON.stringify(updated));
    }

    try {
      await deleteDoc(doc(db, 'users', userId, 'family_members', memberId));
    } catch (fireErr) {
      console.warn('Firestore delete family note:', fireErr);
    }
  } catch (err) {
    console.warn('deleteFamilyMember error:', err);
  }
};

// ==========================================
// 4. MEDICAL REPORTS (PER USER)
// ==========================================

export const getMedicalReports = async (userId: string): Promise<MedicalReport[]> => {
  if (!userId) return [];
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS(userId));
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const snap = await getDocs(collection(db, 'users', userId, 'medical_reports'));
      if (!snap.empty) {
        const reports: MedicalReport[] = [];
        snap.forEach((d) => reports.push(d.data() as MedicalReport));
        await AsyncStorage.setItem(STORAGE_KEYS.REPORTS(userId), JSON.stringify(reports));
        return reports;
      }
    } catch (fireErr) {
      console.warn('Firestore reports note:', fireErr);
    }

    return [];
  } catch (err) {
    console.warn('getMedicalReports error:', err);
    return [];
  }
};

export const addMedicalReport = async (
  userId: string,
  report: MedicalReport
): Promise<void> => {
  if (!userId) return;
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS(userId));
    const list: MedicalReport[] = cached ? JSON.parse(cached) : [];
    const updated = [report, ...list.filter((r) => r.id !== report.id)];
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS(userId), JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', userId, 'medical_reports', report.id), {
        ...report,
        uploadedAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore add report note:', fireErr);
    }
  } catch (err) {
    console.warn('addMedicalReport error:', err);
  }
};

// ==========================================
// 5. PRESCRIPTIONS (CLINICAL RECORDS)
// ==========================================

export const getPrescriptions = async (
  userId?: string,
  userRole?: 'patient' | 'doctor',
  patientName?: string
): Promise<Prescription[]> => {
  if (!userId) return [];
  try {
    const userKey = STORAGE_KEYS.PRESCRIPTIONS(userId);
    const cached = await AsyncStorage.getItem(userKey);
    const localRx: Prescription[] = cached ? JSON.parse(cached) : [];

    const isMatch = (item: Prescription) => {
      if (userRole === 'doctor') {
        return (
          item.doctorId === userId ||
          Boolean(patientName && item.doctorName.toLowerCase().includes(patientName.toLowerCase()))
        );
      }
      return (
        (item as any).patientId === userId ||
        Boolean(
          patientName &&
            item.patientName.toLowerCase().trim() === patientName.toLowerCase().trim()
        )
      );
    };

    try {
      let q = query(collection(db, 'prescriptions'));
      if (userRole === 'doctor') {
        q = query(collection(db, 'prescriptions'), where('doctorId', '==', userId));
      } else {
        q = query(collection(db, 'prescriptions'), where('patientId', '==', userId));
      }

      const snap = await getDocs(q);
      const cloudRx: Prescription[] = [];
      if (!snap.empty) {
        snap.forEach((d) => {
          const item = d.data() as Prescription;
          if (isMatch(item)) {
            cloudRx.push(item);
          }
        });
      }

      const map = new Map<string, Prescription>();
      localRx.filter(isMatch).forEach((p) => map.set(p.id, p));
      cloudRx.forEach((p) => map.set(p.id, p));
      const merged = Array.from(map.values());
      await AsyncStorage.setItem(userKey, JSON.stringify(merged));
      return merged;
    } catch (fireErr) {
      console.warn('Firestore prescriptions note:', fireErr);
      return localRx.filter(isMatch);
    }
  } catch (err) {
    console.warn('getPrescriptions error:', err);
    return [];
  }
};

export const savePrescription = async (prescription: Prescription): Promise<void> => {
  try {
    const patId = (prescription as any).patientId;
    if (patId) {
      const userKey = STORAGE_KEYS.PRESCRIPTIONS(patId);
      const cached = await AsyncStorage.getItem(userKey);
      const list: Prescription[] = cached ? JSON.parse(cached) : [];
      await AsyncStorage.setItem(
        userKey,
        JSON.stringify([prescription, ...list.filter((p) => p.id !== prescription.id)])
      );
    }
    if (prescription.doctorId) {
      const docKey = STORAGE_KEYS.PRESCRIPTIONS(prescription.doctorId);
      const docCached = await AsyncStorage.getItem(docKey);
      const docList: Prescription[] = docCached ? JSON.parse(docCached) : [];
      await AsyncStorage.setItem(
        docKey,
        JSON.stringify([prescription, ...docList.filter((p) => p.id !== prescription.id)])
      );
    }

    try {
      await setDoc(doc(db, 'prescriptions', prescription.id), {
        ...prescription,
        createdAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore save prescription note:', fireErr);
    }
  } catch (err) {
    console.warn('savePrescription error:', err);
  }
};

// ==========================================
// 6. NOTIFICATIONS
// ==========================================

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
  if (!userId) return [];
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS(userId));
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const snap = await getDocs(
        query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc'))
      );
      if (!snap.empty) {
        const notifs: NotificationItem[] = [];
        snap.forEach((d) => notifs.push(d.data() as NotificationItem));
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS(userId), JSON.stringify(notifs));
        return notifs;
      }
    } catch (fireErr) {
      console.warn('Firestore notifications note:', fireErr);
    }

    return [];
  } catch (err) {
    console.warn('getNotifications error:', err);
    return [];
  }
};

export const saveNotification = async (
  userId: string,
  notification: NotificationItem
): Promise<void> => {
  if (!userId) return;
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS(userId));
    const list: NotificationItem[] = cached ? JSON.parse(cached) : [];
    const updated = [notification, ...list.filter((n) => n.id !== notification.id)];
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS(userId), JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', userId, 'notifications', notification.id), {
        ...notification,
        createdAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore notification note:', fireErr);
    }
  } catch (err) {
    console.warn('saveNotification error:', err);
  }
};

// ==========================================
// 7. REAL CHATS & CONVERSATIONS
// ==========================================

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES(chatId));
    let localMsgs: Message[] = cached ? JSON.parse(cached) : [];

    try {
      const snap = await getDocs(
        query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))
      );
      if (!snap.empty) {
        const cloudMsgs: Message[] = [];
        snap.forEach((d) => cloudMsgs.push(d.data() as Message));
        await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES(chatId), JSON.stringify(cloudMsgs));
        return cloudMsgs;
      }
    } catch (fireErr) {
      console.warn('Firestore chat messages note:', fireErr);
    }

    return localMsgs;
  } catch (err) {
    console.warn('getChatMessages error:', err);
    return [];
  }
};

export const sendChatMessage = async (
  chatId: string,
  message: Message,
  chatMetadata?: Partial<Chat>
): Promise<void> => {
  try {
    // 1. Cache message
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES(chatId));
    const list: Message[] = cached ? JSON.parse(cached) : [];
    const updated = [...list, message];
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES(chatId), JSON.stringify(updated));

    // 2. Sync to Firestore
    try {
      await setDoc(doc(db, 'chats', chatId, 'messages', message.id), {
        ...message,
        timestamp: serverTimestamp(),
      });

      if (chatMetadata) {
        await setDoc(
          doc(db, 'chats', chatId),
          {
            ...chatMetadata,
            id: chatId,
            lastMessage: message.text,
            lastMessageTime: message.time,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (fireErr) {
      console.warn('Firestore send message note:', fireErr);
    }
  } catch (err) {
    console.warn('sendChatMessage error:', err);
  }
};

// ==========================================
// 8. DOCTOR REVIEWS
// ==========================================

export const getDoctorReviews = async (doctorId?: string): Promise<Review[]> => {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    let list: Review[] = cached ? JSON.parse(cached) : [];

    try {
      const snap = await getDocs(collection(db, 'reviews'));
      if (!snap.empty) {
        const cloudReviews: Review[] = [];
        snap.forEach((d) => cloudReviews.push(d.data() as Review));
        await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
        list = cloudReviews;
      } else {
        // Seed default authentic reviews into Firestore
        for (const rev of defaultReviewsCatalog) {
          await setDoc(doc(db, 'reviews', rev.id), {
            ...rev,
            createdAt: serverTimestamp(),
          });
        }
        await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(defaultReviewsCatalog));
        list = defaultReviewsCatalog;
      }
    } catch (fireErr) {
      console.warn('Firestore reviews fetch note:', fireErr);
    }

    if (list.length === 0) list = defaultReviewsCatalog;
    if (doctorId) {
      return list.filter((r) => r.doctorId === doctorId);
    }
    return list;
  } catch (err) {
    console.warn('getDoctorReviews error:', err);
    return defaultReviewsCatalog;
  }
};

export const saveDoctorReview = async (review: Review): Promise<void> => {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
    const list: Review[] = cached ? JSON.parse(cached) : [];
    const updated = [review, ...list.filter((r) => r.id !== review.id)];
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'reviews', review.id), {
        ...review,
        createdAt: serverTimestamp(),
      });
    } catch (fireErr) {
      console.warn('Firestore save review note:', fireErr);
    }
  } catch (err) {
    console.warn('saveDoctorReview error:', err);
  }
};

/**
 * Update Doctor verification status and info in doctors catalog
 */
export const updateDoctorVerificationInCatalog = async (
  doctorId: string,
  isVerified: boolean,
  details?: Partial<Doctor>
): Promise<Doctor[]> => {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.DOCTORS);
    let list: Doctor[] = cached ? JSON.parse(cached) : [...defaultDoctorCatalog];

    let found = false;
    list = list.map((docItem) => {
      if (docItem.id === doctorId || docItem.name === details?.name) {
        found = true;
        return {
          ...docItem,
          isVerified,
          verificationStatus: isVerified ? ('verified' as const) : ('pending' as const),
          ...details,
        };
      }
      return docItem;
    });

    if (!found && details && details.name) {
      const newDoc: Doctor = {
        id: doctorId,
        name: details.name,
        specialty: details.specialty || 'General Physician',
        specialtyId: details.specialtyId || 'general',
        photo: details.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
        rating: 5.0,
        reviewsCount: 1,
        patientsCount: 0,
        experience: details.experience || 5,
        fees: details.fees || 2000,
        hospital: details.hospital || 'MediCare Health Center',
        location: details.location || 'Central Clinic, OPD',
        distance: '1.2 km',
        bio: details.bio || 'Consultant Physician registered with the Medical Board.',
        qualifications: details.qualifications || ['MBBS', 'FCPS'],
        languages: details.languages || ['English', 'Urdu'],
        isVerified,
        verificationStatus: isVerified ? ('verified' as const) : ('pending' as const),
        medicalLicenseNumber: details.medicalLicenseNumber,
        medicalCouncil: details.medicalCouncil,
      };
      list.push(newDoc);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(list));

    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        isVerified,
        verificationStatus: isVerified ? 'verified' : 'pending',
        ...(details || {}),
        updatedAt: serverTimestamp(),
      });
    } catch {
      // If doc does not exist yet, set it
      try {
        const item = list.find((d) => d.id === doctorId);
        if (item) {
          await setDoc(doc(db, 'doctors', doctorId), item, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore doctor sync notice:', e);
      }
    }

    return list;
  } catch (err) {
    console.warn('updateDoctorVerificationInCatalog error:', err);
    return defaultDoctorCatalog;
  }
};


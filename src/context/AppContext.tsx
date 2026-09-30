import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Appointment,
  CheckInStatus,
  Doctor,
  DoctorAvailabilityConfig,
  DoctorDelayType,
  FamilyMember,
  MedicalReport,
  NotificationItem,
  Prescription,
  QueueItem,
  QueueStatus,
  Review,
} from '../types';
import {
  syncQueueStatusToCloud,
  subscribeToQueueStatus,
} from '../services/queueSyncService';
import {
  getDoctors,
  getAppointments,
  saveAppointment as persistAppointment,
  updateAppointmentStatus as persistAppointmentStatus,
  getFamilyMembers,
  addFamilyMember as persistFamilyMember,
  deleteFamilyMember as persistDeleteFamilyMember,
  getMedicalReports,
  addMedicalReport as persistMedicalReport,
  getPrescriptions,
  savePrescription as persistPrescription,
  getNotifications,
  saveNotification as persistNotification,
  getDoctorReviews,
  saveDoctorReview as persistDoctorReview,
  updateDoctorVerificationInCatalog,
} from '../services/dataService';
import {
  UserProfile,
  getPersistedUser,
  onAuthStateChange,
  getUserProfile,
  updateDoctorVerification,
} from '../services/authService';
import { doctors as fallbackDoctors } from '../data';

interface AppContextType {
  // Data
  appointments: Appointment[];
  doctors: Doctor[];
  queueStatus: QueueStatus;
  familyMembers: FamilyMember[];
  medicalReports: MedicalReport[];
  prescriptions: Prescription[];
  notifications: NotificationItem[];
  doctorAvailability: DoctorAvailabilityConfig;
  setDoctorAvailability: React.Dispatch<React.SetStateAction<DoctorAvailabilityConfig>>;
  reviews: Review[];
  unreadNotificationsCount: number;
  doctorEarnings: {
    today: number;
    weekly: number;
    monthly: number;
    completedCount: number;
    withdrawable: number;
    pendingCount: number;
  };

  // Auth User
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;

  // Actions - Appointments & Booking
  bookAppointment: (details: {
    doctor: Doctor;
    date: string;
    time: string;
    type: 'in_clinic' | 'video_call';
    patientName: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    familyMemberId?: string;
    familyMemberRelation?: string;
    symptoms?: string;
    shift: 'Morning OPD' | 'Evening OPD';
    opdRoom?: string;
    uploadedReports?: MedicalReport[];
    fees: number;
  }) => Appointment;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  cancelAppointment: (appointmentId: string, reason: string) => void;
  checkInPatient: (appointmentId: string) => void;

  // Actions - Queue Control Center
  callNextPatient: () => void;
  skipPatient: () => void;
  markNoShow: () => void;
  recallSkippedPatient: (tokenNumber: number) => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  setDoctorDelay: (delayType: DoctorDelayType, minutes: number, customMessage?: string) => void;

  // Actions - Clinical & Consultation
  startConsultation: (appointmentId: string) => void;
  savePrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>) => Prescription;
  submitReview: (review: {
    doctorId: string;
    appointmentId: string;
    rating: number;
    comment: string;
    doctorRating?: number;
    consultationRating?: number;
    waitingRating?: number;
  }) => void;

  // Actions - Profile & Records
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => FamilyMember;
  deleteFamilyMember: (memberId: string) => void;
  uploadMedicalReport: (report: Omit<MedicalReport, 'id' | 'uploadDate'>) => MedicalReport;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => Promise<void>;

  // Doctor Verification
  isCurrentDoctorVerified: boolean;
  submitDoctorVerification: (data: {
    licenseNumber: string;
    medicalCouncil: string;
    specialty: string;
    experienceYears: number;
    hospital: string;
    documentName?: string;
  }) => Promise<boolean>;
  verifyDoctorStatus: (status: 'verified' | 'pending' | 'rejected') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state (starts with local persisted user or null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Core entities
  const [doctors, setDoctors] = useState<Doctor[]>(fallbackDoctors);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Queue state for OPD Room
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    doctorId: 'doc-1',
    doctorName: 'OPD Specialist',
    hospital: 'MediCare Central Clinic',
    room: 'Room #204',
    shift: 'Morning OPD',
    currentServing: 1,
    totalTokensToday: 0,
    userToken: 0,
    estimatedWaitMinutes: 0,
    isPaused: false,
    delayStatus: {
      status: 'on_time',
      delayMinutes: 0,
      message: 'Running on schedule',
      updatedAt: 'Just now',
    },
    queue: [],
    skippedTokens: [],
  });

  // Doctor Availability Configuration
  const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailabilityConfig>({
    doctorId: '2',
    shifts: [
      {
        shiftName: 'Morning OPD',
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        maxTokens: 30,
        consultationDurationMinutes: 7,
        roomNumber: 'Room #204',
        isActive: true,
      },
      {
        shiftName: 'Evening OPD',
        startTime: '05:00 PM',
        endTime: '09:00 PM',
        maxTokens: 25,
        consultationDurationMinutes: 7,
        roomNumber: 'Room #204',
        isActive: true,
      },
    ],
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysOff: ['Sun'],
    holidays: ['23 Mar', '14 Aug'],
    isEmergencyClosure: false,
    isTemporaryBreak: false,
    consultationFee: 2500,
  });

  // 1. Initial Load: Doctors, Persisted User & Auth Listener
  useEffect(() => {
    let isMounted = true;

    // Load doctors from Firestore / cache
    getDoctors().then((docs) => {
      if (isMounted && docs && docs.length > 0) {
        setDoctors(docs);
      }
    });

    // Load persisted user from AsyncStorage
    getPersistedUser().then((persisted) => {
      if (isMounted && persisted) {
        setCurrentUser(persisted);
      }
    });

    // Listen to Firebase Auth state
    const unsub = onAuthStateChange(async (firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (!isMounted) return;
        if (profile) {
          setCurrentUser(profile);
        } else {
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Patient',
            role: 'patient',
            photoUrl: firebaseUser.photoURL || undefined,
            provider: 'google',
          });
        }
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // 2. Load User Specific Data whenever currentUser changes
  const loadUserData = useCallback(async () => {
    try {
      const uid = currentUser?.uid;
      const role = currentUser?.role || 'patient';
      const name = currentUser?.name;
      const email = currentUser?.email;

      // Load appointments
      const userApts = await getAppointments(uid, role, email, name);
      setAppointments(userApts);

      if (role === 'doctor') {
        const docName = name || 'Doctor';
        setQueueStatus((prev) => ({
          ...prev,
          doctorId: uid || prev.doctorId,
          doctorName: docName,
        }));
      } else {
        const activeApt = userApts.find(
          (a) =>
            a.status === 'upcoming' ||
            a.status === 'Pending' ||
            a.status === 'Waiting' ||
            a.status === 'In Queue' ||
            a.status === 'Your Turn' ||
            a.status === 'In Consultation' ||
            a.checkInStatus === 'Checked In'
        );
        if (activeApt) {
          setQueueStatus((prev) => ({
            ...prev,
            doctorId: activeApt.doctorId,
            doctorName: activeApt.doctorName,
            room: activeApt.opdRoom || prev.room,
            shift: activeApt.shift || prev.shift,
            userToken: activeApt.tokenNumber || 0,
            currentServing: activeApt.currentServingNumber || prev.currentServing,
            estimatedWaitMinutes: activeApt.estimatedWaitMinutes || 0,
          }));
        } else {
          setQueueStatus((prev) => ({
            ...prev,
            userToken: 0,
            estimatedWaitMinutes: 0,
          }));
        }
      }

      // Load reviews
      const cloudReviews = await getDoctorReviews();
      setReviews(cloudReviews);

      if (uid) {
        const [members, reports, rxList, notifList] = await Promise.all([
          getFamilyMembers(uid),
          getMedicalReports(uid),
          getPrescriptions(uid, role, name),
          getNotifications(uid),
        ]);

        setFamilyMembers(members);
        setMedicalReports(reports);
        setPrescriptions(rxList);
        setNotifications(notifList);
      } else {
        setFamilyMembers([]);
        setMedicalReports([]);
        setPrescriptions([]);
        setNotifications([]);
      }
    } catch (e) {
      console.warn('Error loading user data:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // 3. Real-time synchronization for active OPD Queue
  const activeQueueDoctorId =
    currentUser?.role === 'doctor'
      ? currentUser.uid
      : queueStatus.doctorId || 'doc-1';

  useEffect(() => {
    if (!activeQueueDoctorId) return;
    const unsub = subscribeToQueueStatus(activeQueueDoctorId, (cloudData) => {
      if (cloudData && typeof cloudData === 'object') {
        setQueueStatus((prev) => ({
          ...prev,
          ...cloudData,
          delayStatus: cloudData.delayStatus
            ? { ...prev.delayStatus, ...cloudData.delayStatus }
            : prev.delayStatus,
        }));
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [activeQueueDoctorId]);

  // 4. Synchronize Queue state to Cloud when doctor updates status
  useEffect(() => {
    if (currentUser?.role === 'doctor' && currentUser.uid) {
      syncQueueStatusToCloud(currentUser.uid, queueStatus);
    }
  }, [
    currentUser?.role,
    currentUser?.uid,
    queueStatus.currentServing,
    queueStatus.isPaused,
    queueStatus.delayStatus.status,
    queueStatus.delayStatus.delayMinutes,
    queueStatus.skippedTokens,
  ]);

  // Synchronize queue from live appointments for today
  useEffect(() => {
    if (appointments.length > 0) {
      const activeApts = appointments.filter((a) => {
        if (a.status === 'Cancelled' || a.status === 'cancelled') return false;
        if (currentUser?.role === 'doctor') {
          return (
            a.doctorId === currentUser.uid ||
            (!!currentUser.name && a.doctorName.toLowerCase().includes(currentUser.name.toLowerCase()))
          );
        }
        return true;
      });

      if (activeApts.length > 0) {
        const queueItems: QueueItem[] = activeApts.map((a, idx) => ({
          tokenNumber: a.tokenNumber || idx + 1,
          appointmentId: a.id,
          patientName: a.patientName,
          patientAge: a.patientAge,
          patientGender: a.patientGender,
          symptoms: a.symptoms,
          appointmentTime: a.time,
          status:
            a.status === 'Completed' || a.status === 'completed'
              ? 'completed'
              : a.status === 'In Consultation'
              ? 'in_consultation'
              : idx === 0
              ? 'serving'
              : idx === 1
              ? 'next'
              : 'waiting',
          checkInStatus: a.checkInStatus || 'Not Checked In',
          estimatedTime: a.time,
        }));

        setQueueStatus((prev) => {
          const highestToken = Math.max(...queueItems.map((q) => q.tokenNumber), prev.totalTokensToday);
          const userApt = activeApts.find(
            (a) =>
              a.patientName.toLowerCase() === (currentUser?.name || '').toLowerCase() ||
              (a as any).patientId === currentUser?.uid
          );
          return {
            ...prev,
            totalTokensToday: highestToken,
            userToken: userApt?.tokenNumber || (currentUser?.role === 'doctor' ? 0 : prev.userToken),
            queue: queueItems,
          };
        });
      }
    }
  }, [appointments, currentUser]);

  // Helper: calculate wait minutes
  const calculateWaitMinutes = (
    serving: number,
    targetToken: number,
    delayMins: number,
    avgDuration = 6
  ) => {
    const patientsAhead = Math.max(0, targetToken - serving);
    return Math.max(0, patientsAhead * avgDuration + delayMins);
  };

  // Helper: add notification
  const addNotification = async (
    title: string,
    description: string,
    type: NotificationItem['type'] = 'queue'
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      time: 'Just now',
      isUnread: true,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (currentUser?.uid) {
      await persistNotification(currentUser.uid, newNotif);
    }
  };

  // 1. Book Appointment
  const bookAppointment = (details: {
    doctor: Doctor;
    date: string;
    time: string;
    type: 'in_clinic' | 'video_call';
    patientName: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    familyMemberId?: string;
    familyMemberRelation?: string;
    symptoms?: string;
    shift: 'Morning OPD' | 'Evening OPD';
    opdRoom?: string;
    uploadedReports?: MedicalReport[];
    fees: number;
  }): Appointment => {
    const nextToken = (queueStatus.totalTokensToday || 0) + 1;
    const estWait = calculateWaitMinutes(
      queueStatus.currentServing,
      nextToken,
      queueStatus.delayStatus.delayMinutes
    );

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      doctorId: details.doctor.id,
      doctorName: details.doctor.name,
      doctorSpecialty: details.doctor.specialty,
      doctorPhoto: details.doctor.photo,
      patientName: details.patientName,
      patientAge: details.patientAge,
      patientGender: details.patientGender,
      familyMemberId: details.familyMemberId,
      familyMemberRelation: details.familyMemberRelation,
      date: details.date,
      time: details.time,
      status: 'Confirmed',
      type: details.type,
      fees: details.fees,
      symptoms: details.symptoms,
      tokenNumber: nextToken,
      currentServingNumber: queueStatus.currentServing,
      estimatedWaitMinutes: estWait,
      shift: details.shift,
      opdRoom: details.opdRoom || 'Room #204',
      checkInStatus: 'Not Checked In',
      uploadedReports: details.uploadedReports || [],
      ...((currentUser?.uid ? { patientId: currentUser.uid, patientEmail: currentUser.email } : {}) as any),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Also add to Queue
    const newQueueItem: QueueItem = {
      tokenNumber: nextToken,
      appointmentId: newAppointment.id,
      patientName: details.patientName,
      patientAge: details.patientAge,
      patientGender: details.patientGender,
      symptoms: details.symptoms,
      appointmentTime: details.time,
      status: 'waiting',
      checkInStatus: 'Not Checked In',
      estimatedTime: details.time,
    };

    setQueueStatus((prev) => ({
      ...prev,
      doctorId: details.doctor.id,
      doctorName: details.doctor.name,
      room: details.opdRoom || details.doctor.roomNumber || 'Room #204',
      shift: details.shift,
      totalTokensToday: nextToken,
      userToken:
        details.patientName.toLowerCase() === (currentUser?.name || '').toLowerCase()
          ? nextToken
          : prev.userToken || nextToken,
      estimatedWaitMinutes: estWait,
      queue: [...prev.queue, newQueueItem],
    }));

    addNotification(
      'OPD Appointment Confirmed! 🎉',
      `Your token #${nextToken} with ${details.doctor.name} is confirmed for ${details.date}. Check-in opens 45 mins before your shift.`,
      'appointment'
    );

    // Persist to Cloud & Local Storage
    persistAppointment(newAppointment);

    return newAppointment;
  };

  // 2. Check In Patient
  const checkInPatient = (appointmentId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              checkInStatus: 'Checked In',
              checkInTime: nowTime,
              status: apt.status === 'Confirmed' ? 'Waiting' : apt.status,
            }
          : apt
      )
    );

    persistAppointmentStatus(appointmentId, 'Waiting', {
      checkInStatus: 'Checked In',
      checkInTime: nowTime,
    });

    setQueueStatus((prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.appointmentId === appointmentId ||
        (item.patientName.toLowerCase() === (currentUser?.name || '').toLowerCase() &&
          item.tokenNumber === prev.userToken)
          ? { ...item, checkInStatus: 'Checked In' }
          : item
      ),
    }));

    addNotification(
      'Digital Check-In Successful ✓',
      'You are checked in for Room #204. Please take a seat in the OPD waiting lobby.',
      'queue'
    );
  };

  // 3. Reschedule Appointment
  const rescheduleAppointment = (appointmentId: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              date: newDate,
              time: newTime,
              status: 'Rescheduled',
            }
          : apt
      )
    );

    persistAppointmentStatus(appointmentId, 'Rescheduled', {
      date: newDate,
      time: newTime,
    });

    addNotification(
      'Appointment Rescheduled',
      `Your appointment has been shifted to ${newDate} at ${newTime}. Your token has been re-indexed.`,
      'appointment'
    );
  };

  // 4. Cancel Appointment
  const cancelAppointment = (appointmentId: string, reason: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              status: 'Cancelled',
              cancellationReason: reason,
              refundStatus: 'Processing',
            }
          : apt
      )
    );

    persistAppointmentStatus(appointmentId, 'Cancelled', {
      cancellationReason: reason,
      refundStatus: 'Processing',
    });

    addNotification(
      'Appointment Cancelled',
      `Appointment was cancelled (${reason}). Refund of fee is initiated and will credit in 2-3 business days.`,
      'appointment'
    );
  };

  // 5. Doctor Calls Next Patient
  const callNextPatient = () => {
    if (queueStatus.isPaused) {
      Alert.alert('Queue is Paused', 'Please resume the queue before calling the next patient.');
      return;
    }

    const nextServing = queueStatus.currentServing + 1;
    const targetUserToken = queueStatus.userToken;
    const remaining = targetUserToken - nextServing;

    const updatedQueue = queueStatus.queue.map((item) => {
      if (item.tokenNumber === queueStatus.currentServing) {
        return { ...item, status: 'completed' as const };
      }
      if (item.tokenNumber === nextServing) {
        return { ...item, status: 'serving' as const };
      }
      if (item.tokenNumber === nextServing + 1) {
        return { ...item, status: 'next' as const };
      }
      return item;
    });

    const newWait = calculateWaitMinutes(
      nextServing,
      targetUserToken,
      queueStatus.delayStatus.delayMinutes
    );

    setQueueStatus((prev) => ({
      ...prev,
      currentServing: nextServing,
      estimatedWaitMinutes: newWait,
      queue: updatedQueue,
    }));

    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.tokenNumber === queueStatus.currentServing) {
          return { ...apt, status: 'Completed' };
        }
        if (apt.tokenNumber === nextServing) {
          return {
            ...apt,
            status: 'Your Turn',
            currentServingNumber: nextServing,
            estimatedWaitMinutes: 0,
          };
        }
        if (apt.tokenNumber && apt.tokenNumber > nextServing) {
          return {
            ...apt,
            currentServingNumber: nextServing,
            estimatedWaitMinutes: calculateWaitMinutes(
              nextServing,
              apt.tokenNumber,
              queueStatus.delayStatus.delayMinutes
            ),
          };
        }
        return apt;
      })
    );

    if (remaining === 0) {
      addNotification(
        '🔔 IT IS YOUR TURN NOW!',
        `Token #${targetUserToken}: Please proceed immediately to Clinic Room #204.`,
        'queue'
      );
    } else if (remaining === 1) {
      addNotification(
        '⚡ Your Turn Is Next!',
        `Now serving #${nextServing}. You are next in line. Please be right outside Room #204.`,
        'queue'
      );
    } else if (remaining === 2) {
      addNotification(
        '⏱ 2 Patients Remaining',
        `Now serving #${nextServing}. Only 2 patients ahead of you (~10-12 mins remaining).`,
        'queue'
      );
    } else {
      addNotification('OPD Queue Updated', `Now calling Token #${nextServing} to Room #204.`, 'queue');
    }
  };

  // 6. Skip Patient
  const skipPatient = () => {
    const skippedToken = queueStatus.currentServing;
    const nextServing = skippedToken + 1;

    setQueueStatus((prev) => ({
      ...prev,
      currentServing: nextServing,
      skippedTokens: [...prev.skippedTokens, skippedToken],
      queue: prev.queue.map((item) =>
        item.tokenNumber === skippedToken
          ? { ...item, status: 'skipped' as const }
          : item.tokenNumber === nextServing
          ? { ...item, status: 'serving' as const }
          : item
      ),
    }));

    addNotification(
      'Patient Skipped',
      `Token #${skippedToken} did not respond and was placed on the skipped roster. Now serving #${nextServing}.`,
      'queue'
    );
  };

  // 7. Mark Absent / No-Show
  const markNoShow = () => {
    const targetToken = queueStatus.currentServing;
    const nextServing = targetToken + 1;

    setQueueStatus((prev) => ({
      ...prev,
      currentServing: nextServing,
      queue: prev.queue.map((item) =>
        item.tokenNumber === targetToken
          ? { ...item, status: 'no_show' as const }
          : item.tokenNumber === nextServing
          ? { ...item, status: 'serving' as const }
          : item
      ),
    }));

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.tokenNumber === targetToken
          ? { ...apt, status: 'No Show', checkInStatus: 'Not Checked In' }
          : apt
      )
    );

    addNotification(
      'Marked as No-Show',
      `Token #${targetToken} was marked absent (No-Show). Queue advanced to #${nextServing}.`,
      'queue'
    );
  };

  // 8. Recall Skipped Patient
  const recallSkippedPatient = (tokenNumber: number) => {
    setQueueStatus((prev) => ({
      ...prev,
      skippedTokens: prev.skippedTokens.filter((t) => t !== tokenNumber),
      queue: prev.queue.map((item) =>
        item.tokenNumber === tokenNumber
          ? { ...item, status: 'waiting' as const, isRecalled: true }
          : item
      ),
    }));

    addNotification(
      'Skipped Token Recalled',
      `Token #${tokenNumber} has been recalled and restored to the active queue.`,
      'queue'
    );
  };

  // 9. Pause Queue
  const pauseQueue = () => {
    setQueueStatus((prev) => ({ ...prev, isPaused: true }));
    addNotification(
      'OPD Queue Paused',
      'The doctor has temporarily paused token calling for an emergency round.',
      'queue'
    );
  };

  // 10. Resume Queue
  const resumeQueue = () => {
    setQueueStatus((prev) => ({ ...prev, isPaused: false }));
    addNotification('OPD Queue Resumed', 'The doctor has resumed live OPD consultations.', 'queue');
  };

  // 11. Doctor Delay Management
  const setDoctorDelay = (delayType: DoctorDelayType, minutes: number, customMessage?: string) => {
    let msg = customMessage;
    if (!msg) {
      if (delayType === 'on_time') {
        msg = 'Doctor is back on schedule.';
      } else if (delayType === 'emergency_delay') {
        msg = 'Emergency procedure in progress. Consultation delayed ~45 mins.';
      } else {
        msg = `Doctor is currently running approximately ${minutes} minutes late.`;
      }
    }

    const newWait = calculateWaitMinutes(queueStatus.currentServing, queueStatus.userToken, minutes);

    setQueueStatus((prev) => ({
      ...prev,
      estimatedWaitMinutes: newWait,
      delayStatus: {
        status: delayType,
        delayMinutes: minutes,
        message: msg!,
        updatedAt: 'Just now',
      },
    }));

    addNotification(delayType === 'on_time' ? 'Doctor Back On Schedule' : 'OPD Schedule Update', msg!, 'queue');
  };

  // 12. Start Consultation
  const startConsultation = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'In Consultation' } : apt))
    );
  };

  // 13. Save Digital Prescription
  const savePrescription = (data: Omit<Prescription, 'id' | 'createdAt'>): Prescription => {
    const newPrescription: Prescription = {
      ...data,
      id: `rx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);
    persistPrescription(newPrescription);

    // Complete the linked appointment
    if (data.appointmentId) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === data.appointmentId
            ? {
                ...apt,
                status: 'Completed',
                prescriptionId: newPrescription.id,
              }
            : apt
        )
      );

      persistAppointmentStatus(data.appointmentId, 'Completed', {
        prescriptionId: newPrescription.id,
      });
    }

    addNotification(
      'Digital Prescription Issued 📋',
      `Dr. ${data.doctorName} has issued your e-prescription for ${data.diagnosis}. Tap to view medicines.`,
      'prescription'
    );

    return newPrescription;
  };

  // 14. Submit Review
  const submitReview = (reviewData: {
    doctorId: string;
    appointmentId: string;
    rating: number;
    comment: string;
    doctorRating?: number;
    consultationRating?: number;
    waitingRating?: number;
  }) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      doctorId: reviewData.doctorId,
      appointmentId: reviewData.appointmentId,
      patientName: currentUser?.name || 'Verified Patient',
      patientPhoto: currentUser?.photoUrl,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: 'Today',
      doctorRating: reviewData.doctorRating || reviewData.rating,
      consultationExperienceRating: reviewData.consultationRating || reviewData.rating,
      waitingExperienceRating: reviewData.waitingRating || reviewData.rating,
    };

    setReviews((prev) => [newReview, ...prev]);
    persistDoctorReview(newReview);

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === reviewData.appointmentId ? { ...apt, ratingSubmitted: true } : apt
      )
    );

    Alert.alert('Review Submitted', 'Thank you for your feedback! It helps improve OPD quality.');
  };

  // 15. Family Members & Medical Reports
  const addFamilyMember = (member: Omit<FamilyMember, 'id'>): FamilyMember => {
    const newMember: FamilyMember = {
      ...member,
      id: `fm-${Date.now()}`,
    };
    setFamilyMembers((prev) => [...prev, newMember]);
    if (currentUser?.uid) {
      persistFamilyMember(currentUser.uid, newMember);
    }
    return newMember;
  };

  const deleteFamilyMember = (memberId: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (currentUser?.uid) {
      persistDeleteFamilyMember(currentUser.uid, memberId);
    }
  };

  const uploadMedicalReport = (report: Omit<MedicalReport, 'id' | 'uploadDate'>): MedicalReport => {
    const newReport: MedicalReport = {
      ...report,
      id: `rep-${Date.now()}`,
      uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setMedicalReports((prev) => [newReport, ...prev]);
    if (currentUser?.uid) {
      persistMedicalReport(currentUser.uid, newReport);
    }
    return newReport;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => n.isUnread).length,
    [notifications]
  );

  // Doctor earnings computation: dynamic from appointments
  const doctorEarnings = useMemo(() => {
    const docId = currentUser?.uid;
    const docName = currentUser?.name;
    const doctorApts = appointments.filter(
      (a) =>
        (docId && a.doctorId === docId) ||
        (docName && a.doctorName.toLowerCase().includes(docName.toLowerCase()))
    );
    const completed = doctorApts.filter(
      (a) => a.status === 'Completed' || a.status === 'completed'
    );
    const completedCount = completed.length;
    const earnedAmount = completed.reduce((sum, a) => sum + (a.fees || 2500), 0);
    const pendingCount = doctorApts.filter((a) => a.status === 'Pending' || a.status === 'Confirmed').length;

    return {
      today: earnedAmount,
      weekly: Math.round(earnedAmount * 1.5),
      monthly: Math.round(earnedAmount * 3.2),
      completedCount,
      withdrawable: earnedAmount,
      pendingCount,
    };
  }, [appointments, currentUser]);

  // Doctor verification status for logged-in physician
  const isCurrentDoctorVerified = useMemo(() => {
    if (currentUser?.role !== 'doctor') return false;
    return (
      currentUser.verificationStatus === 'verified' ||
      Boolean(doctors.find((d) => d.id === currentUser.uid || d.name === currentUser.name)?.isVerified)
    );
  }, [currentUser, doctors]);

  const submitDoctorVerification = async (data: {
    licenseNumber: string;
    medicalCouncil: string;
    specialty: string;
    experienceYears: number;
    hospital: string;
    documentName?: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const updated = await updateDoctorVerification(currentUser.uid, {
        status: 'pending',
        medicalLicenseNumber: data.licenseNumber,
        medicalCouncil: data.medicalCouncil,
        specialty: data.specialty,
        experienceYears: data.experienceYears,
        hospital: data.hospital,
        verificationDocumentName: data.documentName,
      });
      if (updated) {
        setCurrentUser(updated);
      }
      const updatedCatalog = await updateDoctorVerificationInCatalog(currentUser.uid, false, {
        name: currentUser.name,
        specialty: data.specialty,
        experience: data.experienceYears,
        hospital: data.hospital,
        medicalLicenseNumber: data.licenseNumber,
        medicalCouncil: data.medicalCouncil,
      });
      setDoctors(updatedCatalog);
      return true;
    } catch (e) {
      console.warn('submitDoctorVerification error:', e);
      return false;
    }
  };

  const verifyDoctorStatus = async (status: 'verified' | 'pending' | 'rejected') => {
    if (!currentUser) return;
    try {
      const isVerified = status === 'verified';
      const updated = await updateDoctorVerification(currentUser.uid, {
        status,
      });
      if (updated) {
        setCurrentUser(updated);
      }
      const updatedCatalog = await updateDoctorVerificationInCatalog(currentUser.uid, isVerified, {
        name: currentUser.name,
      });
      setDoctors(updatedCatalog);
    } catch (e) {
      console.warn('verifyDoctorStatus error:', e);
    }
  };

  const value: AppContextType = {
    appointments,
    doctors,
    queueStatus,
    familyMembers,
    medicalReports,
    prescriptions,
    notifications,
    doctorAvailability,
    setDoctorAvailability,
    reviews,
    unreadNotificationsCount,
    doctorEarnings,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    checkInPatient,
    callNextPatient,
    skipPatient,
    markNoShow,
    recallSkippedPatient,
    pauseQueue,
    resumeQueue,
    setDoctorDelay,
    startConsultation,
    savePrescription,
    submitReview,
    addFamilyMember,
    deleteFamilyMember,
    uploadMedicalReport,
    markNotificationRead,
    markAllNotificationsRead,
    currentUser,
    setCurrentUser,
    refreshData: loadUserData,
    isCurrentDoctorVerified,
    submitDoctorVerification,
    verifyDoctorStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

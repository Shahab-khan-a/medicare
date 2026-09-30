import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, realtimeDb } from './firebase';
import { Appointment, QueueStatus } from '../types';

/**
 * Sync Queue status to Firestore & Realtime Database
 */
export const syncQueueStatusToCloud = async (doctorId: string, queueStatus: QueueStatus) => {
  try {
    // 1. Sync to Cloud Firestore for persistence
    const queueDocRef = doc(db, 'opd_queues', doctorId);
    await setDoc(
      queueDocRef,
      {
        ...queueStatus,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore queue sync failed (check rules):', error);
  }

  try {
    // 2. Sync to Realtime Database for ultra-low latency websocket updates
    const rtdbRef = ref(realtimeDb, `opd_queues/${doctorId}`);
    await set(rtdbRef, {
      currentServing: queueStatus.currentServing,
      userToken: queueStatus.userToken,
      estimatedWaitMinutes: queueStatus.estimatedWaitMinutes,
      isPaused: queueStatus.isPaused,
      delayMinutes: queueStatus.delayStatus.delayMinutes,
      delayType: queueStatus.delayStatus.status,
      delayMessage: queueStatus.delayStatus.message,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Realtime Database queue sync failed:', error);
  }
};

/**
 * Subscribe to real-time OPD Queue updates from Firestore
 */
export const subscribeToQueueStatus = (
  doctorId: string,
  onUpdate: (queue: Partial<QueueStatus>) => void
) => {
  try {
    const queueDocRef = doc(db, 'opd_queues', doctorId);
    const unsubscribe = onSnapshot(
      queueDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as QueueStatus;
          onUpdate(data);
        }
      },
      (error) => {
        console.warn('Realtime queue listener notice:', error.message);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Could not attach queue listener:', e);
    return () => {};
  }
};

/**
 * Sync new appointment to Firestore
 */
export const saveAppointmentToCloud = async (appointment: Appointment) => {
  try {
    const aptRef = doc(db, 'appointments', appointment.id);
    await setDoc(aptRef, {
      ...appointment,
      syncedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Cloud appointment sync warning:', error);
  }
};

/**
 * Update appointment status in Cloud
 */
export const updateCloudAppointmentStatus = async (
  appointmentId: string,
  status: string,
  extra: Record<string, any> = {}
) => {
  try {
    const aptRef = doc(db, 'appointments', appointmentId);
    await updateDoc(aptRef, {
      status,
      ...extra,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Could not update cloud appointment status:', error);
  }
};

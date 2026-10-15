import { Appointment, DoctorAvailabilityConfig, QueueItem, QueueStatus } from '../types';
import { visitDateTime } from './booking';

export interface DoctorIdentity { uid: string; name: string; role: string; hospital?: string }
export function belongsToDoctor(appointment: Appointment, doctor: DoctorIdentity | null): boolean {
  if (!doctor || doctor.role !== 'doctor') return false;
  return appointment.doctorId === doctor.uid || (!!doctor.name.trim() && appointment.doctorName.trim().toLowerCase() === doctor.name.trim().toLowerCase());
}
export function isVisitToday(date: string, now = new Date()): boolean {
  return date === 'Today' || visitDateTime(date, '12:00 PM').toDateString() === now.toDateString();
}
export function doctorAppointments(appointments: Appointment[], doctor: DoctorIdentity | null) {
  return appointments.filter(appointment => belongsToDoctor(appointment, doctor));
}
export function nextQueuePatient(queue: QueueItem[]): QueueItem | undefined {
  return queue.filter(item => (item.status === 'waiting' || item.status === 'next') && (item.checkInStatus === 'Checked In' || item.checkInStatus === 'Waiting'))
    .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
}
export function queueFingerprint(queue: QueueStatus): string {
  return JSON.stringify({ doctorId: queue.doctorId, doctorName: queue.doctorName, hospital: queue.hospital, room: queue.room, shift: queue.shift, currentServing: queue.currentServing, totalTokensToday: queue.totalTokensToday, userToken: queue.userToken, estimatedWaitMinutes: queue.estimatedWaitMinutes, isPaused: queue.isPaused, delay: [queue.delayStatus.status, queue.delayStatus.delayMinutes, queue.delayStatus.message], queue: queue.queue, skippedTokens: queue.skippedTokens });
}
export function buildDoctorQueue(appointments: Appointment[], doctor: DoctorIdentity, previous: QueueStatus, now = new Date()): QueueStatus {
  const ownQueue = previous.doctorId === doctor.uid;
  const skippedTokens = ownQueue ? previous.skippedTokens : [];
  const visits = doctorAppointments(appointments, doctor).filter(appointment => isVisitToday(appointment.date, now) && appointment.shift === previous.shift && !!appointment.tokenNumber && !['cancelled', 'pending'].includes(appointment.status.toLowerCase()));
  const queue: QueueItem[] = visits.map<QueueItem>(appointment => {
    const status = appointment.status.toLowerCase();
    return {
      tokenNumber: appointment.tokenNumber!, appointmentId: appointment.id, patientName: appointment.patientName,
      patientAge: appointment.patientAge, patientGender: appointment.patientGender, symptoms: appointment.symptoms,
      appointmentTime: appointment.time, estimatedTime: appointment.time, checkInStatus: appointment.checkInStatus || 'Not Checked In',
      status: status === 'completed' ? 'completed' : status === 'no show' ? 'no_show' : status === 'in consultation' ? 'in_consultation' : status === 'your turn' ? 'serving' : skippedTokens.includes(appointment.tokenNumber!) ? 'skipped' : 'waiting',
    };
  }).sort((a, b) => a.tokenNumber - b.tokenNumber);
  const serving = queue.find(item => item.status === 'serving' || item.status === 'in_consultation');
  const next = nextQueuePatient(queue);
  return { ...previous, doctorId: doctor.uid, doctorName: doctor.name, userToken: 0,
    hospital: doctor.hospital || (ownQueue ? previous.hospital : 'Your clinic'),
    room: visits.find(visit => !!visit.opdRoom)?.opdRoom || (ownQueue ? previous.room : 'Clinic room'),
    isPaused: ownQueue ? previous.isPaused : false,
    delayStatus: ownQueue ? previous.delayStatus : { status: 'on_time', delayMinutes: 0, message: 'Running on schedule', updatedAt: 'Just now' },
    queue: queue.map(item => item.appointmentId === next?.appointmentId ? { ...item, status: 'next' } : item),
    currentServing: serving?.tokenNumber || 0,
    totalTokensToday: Math.max(0, ...queue.map(item => item.tokenNumber)),
    skippedTokens: skippedTokens.filter(token => queue.some(item => item.tokenNumber === token && item.status === 'skipped')),
  };
}
export function availabilityErrors(config: DoctorAvailabilityConfig): string[] {
  const errors: string[] = [];
  if (!config.workingDays.length) errors.push('Choose at least one working day.');
  if (!Number.isFinite(config.consultationFee) || config.consultationFee < 0) errors.push('Enter a consultation fee of 0 or more.');
  if (!config.shifts.some(shift => shift.isActive)) errors.push('Enable at least one clinic shift.');
  config.shifts.filter(shift => shift.isActive).forEach(shift => {
    const start = visitDateTime('14 Oct 2026', shift.startTime);
    const end = visitDateTime('14 Oct 2026', shift.endTime);
    if (!(end > start)) errors.push(shift.shiftName + ': use valid times with the end after the start.');
    if (!Number.isInteger(shift.maxTokens) || shift.maxTokens < 1 || shift.maxTokens > 500) errors.push(shift.shiftName + ': patient limit must be 1–500.');
    if (!Number.isInteger(shift.consultationDurationMinutes) || shift.consultationDurationMinutes < 1 || shift.consultationDurationMinutes > 120) errors.push(shift.shiftName + ': visit length must be 1–120 minutes.');
    if (!shift.roomNumber.trim()) errors.push(shift.shiftName + ': enter a clinic room.');
  });
  const enabled = config.shifts.filter(shift => shift.isActive);
  if (enabled.length > 1) {
    const sorted = [...enabled].sort((a, b) => visitDateTime('14 Oct 2026', a.startTime).getTime() - visitDateTime('14 Oct 2026', b.startTime).getTime());
    if (visitDateTime('14 Oct 2026', sorted[0].endTime) > visitDateTime('14 Oct 2026', sorted[1].startTime)) errors.push('Clinic shifts must not overlap.');
  }
  return errors;
}

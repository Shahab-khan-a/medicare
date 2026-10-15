export type SpecialtyType =
  | 'General'
  | 'Cardiology'
  | 'Dentistry'
  | 'Dermatology'
  | 'Ophthalmology'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Neurology';

export interface Category {
  id: string;
  name: string;
  icon: string;
  doctorsCount: number;
  color?: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  reviewsCount?: number;
  phone?: string;
  image?: string;
  emergencyAvailable?: boolean;
  opdAvailable?: boolean;
  departments?: string[];
  timings?: string;
  doctorCount?: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialtyId: string;
  photo: string;
  rating: number;
  reviewsCount: number;
  patientsCount: number;
  experience: number; // in years
  fees: number;
  hospital: string;
  hospitalId?: string;
  city?: string;
  location: string;
  distance: string;
  bio: string;
  qualifications: string[];
  languages: string[];
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  medicalLicenseNumber?: string;
  medicalCouncil?: string;
  verificationDocumentUrl?: string;
  isOnline?: boolean;
  roomNumber?: string;
  availableDays?: string[];
  gender?: 'Male' | 'Female';
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface DoctorVerificationData {
  status: VerificationStatus;
  licenseNumber: string;
  medicalCouncil: string;
  specialty: string;
  experienceYears: number;
  hospital: string;
  documentName?: string;
  documentUrl?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Waiting'
  | 'In Queue'
  | 'Your Turn'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'
  | 'Rescheduled'
  // Backward compatibility with lowercase legacy strings:
  | 'pending'
  | 'upcoming'
  | 'completed'
  | 'cancelled';

export type CheckInStatus = 'Not Checked In' | 'Checked In' | 'Waiting';

export type ConsultationType = 'in_clinic' | 'video_call';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Myself' | 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Spouse' | 'Child' | 'Other';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  bloodGroup?: string;
}

export interface MedicalReport {
  id: string;
  patientId?: string;
  patientName: string;
  title: string;
  type: 'Lab Report' | 'X-Ray / MRI' | 'Previous Prescription' | 'Document';
  fileFormat: 'PDF' | 'JPG' | 'PNG';
  fileSize: string;
  uploadDate: string;
  url?: string;
  doctorNotes?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhoto: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone?: string;
  patientPhoto?: string;
  familyMemberId?: string;
  familyMemberRelation?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: ConsultationType;
  fees: number;
  symptoms?: string;
  prescriptionId?: string;
  tokenNumber?: number;
  currentServingNumber?: number;
  estimatedWaitMinutes?: number;
  shift?: 'Morning OPD' | 'Evening OPD';
  opdRoom?: string;
  checkInStatus?: CheckInStatus;
  checkInTime?: string;
  notes?: string;
  uploadedReports?: MedicalReport[];
  cancellationReason?: string;
  refundStatus?: 'Pending' | 'Processing' | 'Refunded' | 'Not Applicable';
  ratingSubmitted?: boolean;
}

export interface QueueItem {
  tokenNumber: number;
  appointmentId?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  symptoms?: string;
  appointmentTime?: string;
  status: 'serving' | 'next' | 'waiting' | 'in_consultation' | 'completed' | 'skipped' | 'no_show';
  checkInStatus?: CheckInStatus;
  estimatedTime: string;
  isRecalled?: boolean;
}

export type DoctorDelayType =
  | 'on_time'
  | 'delayed_10'
  | 'delayed_20'
  | 'delayed_30'
  | 'emergency_delay';

export interface DoctorDelayStatus {
  status: DoctorDelayType;
  delayMinutes: number;
  message: string;
  updatedAt: string;
}

export interface QueueStatus {
  doctorId: string;
  doctorName: string;
  hospital: string;
  room: string;
  shift: 'Morning OPD' | 'Evening OPD';
  currentServing: number;
  totalTokensToday: number;
  userToken: number;
  estimatedWaitMinutes: number;
  isPaused: boolean;
  delayStatus: DoctorDelayStatus;
  queue: QueueItem[];
  skippedTokens: number[];
}



export interface OPDShiftConfig {
  shiftName: 'Morning OPD' | 'Evening OPD';
  startTime: string;
  endTime: string;
  maxTokens: number;
  consultationDurationMinutes: number;
  roomNumber: string;
  isActive: boolean;
}

export interface DoctorAvailabilityConfig {
  doctorId: string;
  shifts: OPDShiftConfig[];
  workingDays: string[];
  daysOff: string[];
  holidays: string[];
  isEmergencyClosure: boolean;
  isTemporaryBreak: boolean;
  breakDurationMinutes?: number;
  consultationFee: number;
}

export interface Review {
  id: string;
  doctorId: string;
  patientName: string;
  patientPhoto?: string;
  rating: number;
  comment: string;
  date: string;
  appointmentId?: string;
  doctorRating?: number;
  consultationExperienceRating?: number;
  waitingExperienceRating?: number;
}

export interface Chat {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto: string;
  doctorSpecialty: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'patient' | 'doctor';
  text: string;
  time: string;
  isImage?: boolean;
  imageUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  type: 'appointment' | 'queue' | 'chat' | 'payment' | 'prescription' | 'system';
  targetScreen?: string;
  params?: Record<string, any>;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency?: string;
  duration: string;
  mealTiming?: 'Before meal' | 'After meal' | 'With meal' | 'Anytime';
  instruction?: string;
}


export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId?: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorHospital: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advice: string[];
  followUpDate: string;
  doctorSignature: string;
  createdAt?: string;
}


export interface PaymentReceipt {
  transactionId: string;
  appointmentId: string;
  doctorName: string;
  patientName: string;
  amount: number;
  consultationFee: number;
  serviceFee: number;
  discount: number;
  method: 'Credit/Debit Card' | 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  status: 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Refunded';
  paidAt: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface DayAvailability {
  day: string;
  date: string;
  dayNumber: string;
  slots: TimeSlot[];
}


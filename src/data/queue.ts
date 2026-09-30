import { QueueStatus } from '../types';

export const liveQueueData: QueueStatus = {
  doctorId: '',
  doctorName: '',
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
  skippedTokens: [],
  queue: [],
};

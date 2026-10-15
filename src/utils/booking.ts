import { Doctor } from '../types';

export const SERVICE_FEE = 150;
export const VISIT_SHIFTS = [
  { name: 'Morning OPD', label: 'Morning', hours: '9:00 am – 1:00 pm', icon: 'sunny-outline', times: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'] },
  { name: 'Evening OPD', label: 'Evening', hours: '4:00 pm – 8:00 pm', icon: 'moon-outline', times: ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'] },
] as const;

export function visitDateTime(date: string, time: string): Date {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const dateMatch = /^(\d{1,2}) ([A-Za-z]{3}),? (\d{4})$/.exec(date);
  const result = dateMatch
    ? new Date(Number(dateMatch[3]), months.indexOf(dateMatch[2].toLowerCase()), Number(dateMatch[1]))
    : new Date(date);
  if (dateMatch && (result.getDate() !== Number(dateMatch[1]) || result.getMonth() !== months.indexOf(dateMatch[2].toLowerCase()))) return new Date(NaN);
  const match = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 12 || Number(match[2]) > 59) return new Date(NaN);
  result.setHours((Number(match[1]) % 12) + (match[3] === 'PM' ? 12 : 0), Number(match[2]), 0, 0);
  return result;
}

export function isDoctorDay(doctor: Doctor, date: Date): boolean {
  if (!doctor.availableDays?.length) return true;
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return doctor.availableDays.some(day => day.toLowerCase().slice(0, 3) === weekday.slice(0, 3));
}

export function bookingDates(doctor: Doctor, now = new Date()) {
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    return {
      day: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      number: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      available: isDoctorDay(doctor, date) && visitDateTime(date.toDateString(), '07:30 PM') > now,
    };
  });
}

export function patientErrors(name: string, age: string) {
  return {
    name: name.trim().length < 2 ? 'Enter the patient’s full name.' : undefined,
    age: !/^\d{1,3}$/.test(age) || Number(age) > 120 ? 'Enter an age from 0 to 120.' : undefined,
  };
}

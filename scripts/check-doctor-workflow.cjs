const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
// Load the pure TypeScript rules; no native app, login or cloud writes.
Module._extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { belongsToDoctor, buildDoctorQueue, nextQueuePatient, availabilityErrors, queueFingerprint } = require('../src/utils/doctorWorkflow.ts');
const doctor = { uid: 'doctor-a', name: 'Dr. Demo', role: 'doctor' };
const appointment = (id, token, changes = {}) => ({ id, tokenNumber: token, doctorId: doctor.uid, doctorName: doctor.name, date: '14 Oct 2026', time: '10:00 AM', shift: 'Morning OPD', patientName: 'Test Patient', patientAge: 0, patientGender: 'Other', status: 'Confirmed', checkInStatus: 'Checked In', ...changes });
const previous = { doctorId: doctor.uid, doctorName: doctor.name, hospital: 'Test Clinic', room: '102', shift: 'Morning OPD', currentServing: 1, totalTokensToday: 0, userToken: 0, estimatedWaitMinutes: 0, isPaused: false, queue: [], skippedTokens: [4], delayStatus: { status: 'on_time', delayMinutes: 0, message: 'On time', updatedAt: 'Just now' } };
const visits = [
  appointment('pending', 1, { status: 'Pending' }),
  appointment('complete', 2, { status: 'Completed' }),
  appointment('skipped', 4),
  appointment('ready', 7),
  appointment('away', 3, { checkInStatus: 'Not Checked In' }),
  appointment('later', 12, { date: '15 Oct 2026' }),
  appointment('evening', 15, { shift: 'Evening OPD' }),
  appointment('other-doctor', 7, { doctorId: 'doctor-b', doctorName: 'Dr. Demo Junior' }),
  appointment('cancelled', 16, { status: 'Cancelled' }),
];
assert.equal(belongsToDoctor(visits[7], doctor), false, 'Similar names must not match another doctor');
assert.equal(belongsToDoctor(visits[0], { ...doctor, role: 'patient' }), false);
const queue = buildDoctorQueue(visits, doctor, previous, new Date(2026, 9, 14, 9));
assert.deepEqual(queue.queue.map(item => item.appointmentId), ['complete', 'away', 'skipped', 'ready']);
assert.equal(queue.currentServing, 0, 'No patient is called just because their row is first');
assert.equal(nextQueuePatient(queue.queue).appointmentId, 'ready', 'Choose the actual checked-in patient across gaps in queue numbers');
assert.equal(nextQueuePatient([]), undefined, 'An empty queue must never produce a phantom patient');
const evening = buildDoctorQueue(visits, doctor, { ...previous, shift: 'Evening OPD', skippedTokens: [] }, new Date(2026, 9, 14, 17));
assert.deepEqual(evening.queue.map(item => item.appointmentId), ['evening'], 'Switching shifts must only show that shift’s patients');
assert.equal(nextQueuePatient(evening.queue).tokenNumber, 15);
assert.equal(buildDoctorQueue([], doctor, previous).queue.length, 0, 'Removing all visits clears the queue');
const switchedDoctor = buildDoctorQueue(visits, doctor, { ...previous, doctorId: 'doctor-b', isPaused: true }, new Date(2026, 9, 14, 9));
assert.equal(switchedDoctor.isPaused, false, 'Another doctor’s pause must not carry over');
assert.deepEqual(switchedDoctor.skippedTokens, [], 'Another doctor’s skipped queue numbers must not carry over');
const recalled = buildDoctorQueue(visits, doctor, { ...previous, skippedTokens: [] }, new Date(2026, 9, 14, 9));
assert.equal(nextQueuePatient(recalled.queue).appointmentId, 'skipped');
const consulting = buildDoctorQueue([appointment('consulting', 7, { status: 'In Consultation' }), ...visits.filter(visit => visit.id !== 'ready')], doctor, previous, new Date(2026, 9, 14, 9));
assert.equal(consulting.currentServing, 7);
assert.equal(consulting.queue.find(item => item.appointmentId === 'consulting').status, 'in_consultation');
assert.equal(queueFingerprint(queue), queueFingerprint({ ...queue, lastUpdated: 'server timestamp' }), 'Cloud metadata must not trigger an echo write');
assert.notEqual(queueFingerprint(queue), queueFingerprint({ ...queue, isPaused: true }));
const config = { doctorId: doctor.uid, workingDays: ['Mon'], daysOff: [], holidays: [], isEmergencyClosure: false, isTemporaryBreak: false, consultationFee: 0, shifts: [{ shiftName: 'Morning OPD', startTime: '09:00 AM', endTime: '01:00 PM', maxTokens: 20, consultationDurationMinutes: 10, roomNumber: '102', isActive: true }] };
assert.deepEqual(availabilityErrors(config), []);
assert(availabilityErrors({ ...config, workingDays: [] }).length);
assert(availabilityErrors({ ...config, consultationFee: NaN }).length);
assert(availabilityErrors({ ...config, shifts: [{ ...config.shifts[0], startTime: '02:00 PM' }] }).length);
assert(availabilityErrors({ ...config, shifts: [{ ...config.shifts[0], maxTokens: 0 }] }).length);
assert(availabilityErrors({ ...config, shifts: [{ ...config.shifts[0], consultationDurationMinutes: 0 }] }).length);
assert(availabilityErrors({ ...config, shifts: [{ ...config.shifts[0], roomNumber: '' }] }).length);
assert(availabilityErrors({ ...config, shifts: [config.shifts[0], { ...config.shifts[0], shiftName: 'Evening OPD', startTime: '12:00 PM', endTime: '05:00 PM' }] }).length);
console.log('Doctor workflow checks passed: ownership, queue gaps, check-in, recalls, sync and clinic hours.');

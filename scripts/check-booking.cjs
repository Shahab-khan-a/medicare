// Verify the booking rules without a device or any cloud writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const filename = path.resolve(__dirname, '../src/utils/booking.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const bookingModule = new Module(filename, module);
bookingModule._compile(compiled, filename);
const { visitDateTime, patientErrors, bookingDates, isDoctorDay, VISIT_SHIFTS } = bookingModule.exports;

assert.equal(visitDateTime('14 Oct 2026', '12:00 AM').getHours(), 0);
assert.equal(visitDateTime('14 Oct 2026', '12:00 PM').getHours(), 12);
assert.equal(visitDateTime('14 Oct, 2026', '04:30 PM').getHours(), 16);
assert.equal(visitDateTime('14 Oct 2026', '04:30 PM').getMinutes(), 30);
assert(Number.isNaN(visitDateTime('31 Feb 2026', '10:00 AM').getTime()));
assert(Number.isNaN(visitDateTime('14 Oct 2026', '13:00 AM').getTime()));
assert(Number.isNaN(visitDateTime('14 Oct 2026', '10:99 AM').getTime()));
assert(Number.isNaN(visitDateTime('invalid', '10:00 AM').getTime()));

for (const time of VISIT_SHIFTS[0].times) {
  const hour = visitDateTime('14 Oct 2026', time).getHours();
  assert(hour >= 9 && hour < 13, 'Morning time must be within the morning shift');
}
for (const time of VISIT_SHIFTS[1].times) {
  const hour = visitDateTime('14 Oct 2026', time).getHours();
  assert(hour >= 16 && hour < 20, 'Evening time must be within the evening shift');
}

assert(patientErrors(' ', '30').name);
assert.equal(patientErrors('Demo Patient', '0').age, undefined);
assert.equal(patientErrors('Demo Patient', '120').age, undefined);
for (const age of ['', '-1', '121', '30.5', 'abc']) assert(patientErrors('Demo Patient', age).age);
const doctor = { availableDays: ['Monday', 'Wed'] };
assert(isDoctorDay(doctor, new Date(2026, 9, 14)));
assert(!isDoctorDay(doctor, new Date(2026, 9, 15)));
const yearEnd = bookingDates({}, new Date(2026, 11, 31, 20));
assert.equal(yearEnd[0].available, false, 'Today must close after the last arrival time');
assert.equal(yearEnd[1].full, '1 Jan 2027');
const leapYear = bookingDates({}, new Date(2028, 1, 28, 8));
assert.equal(leapYear[1].full, '29 Feb 2028');
assert.equal(leapYear[2].full, '1 Mar 2028');
console.log('Booking checks passed: dates, shifts, past times and patient validation.');

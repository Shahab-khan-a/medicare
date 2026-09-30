# 🏥 MediCare - Doctor Appointment Mobile App (UI & UX)

A complete, production-grade Doctor Appointment mobile application UI built in **React Native** with **TypeScript**, **React Navigation v6/v7**, **React Native Reanimated**, **Expo Linear Gradient**, and a unified medical design system.

---

## 📱 Features & Highlights

- **100% Complete UI Flow**: Includes **28 fully designed screens** across Authentication, Patient Portal, Healthcare Provider Portal, and Online Queue Number Tracking.
- **Live Online OPD Token & Number System**: Book clinic numbers online (`Token #14`), view currently serving turn (`Now Serving: #8`), track estimated wait times, and inspect the real-time clinic OPD queue from home.
- **Pure Dummy & Mock Data**: Zero API or backend dependencies. All data is structured with TypeScript interfaces in `src/data/` and `src/types/`.
- **Modern Medical Aesthetic**: Clean light palette with Medical Blue (`#136BC6`), Teal Accent (`#0FA58B`), the Inter typeface, soft card elevations, and rounded badges. Text/background pairs meet WCAG AA contrast.
- **Dynamic Interactions**: Working text inputs, password visibility toggles, interactive chip selectors, animated OTP fields, real-time message sending with simulated doctor typing responses, and role toggling between Patient and Doctor modes.
- **Cross-Platform**: Tested with TypeScript strict mode (`npx tsc --noEmit` passes with 0 errors).

---

## 📂 Project Architecture

```
MediCare/
├── App.tsx
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── App.tsx                    # Root provider & entry point
    ├── navigation/
    │   ├── RootNavigator.tsx      # Master navigation container & stack
    │   ├── AuthStack.tsx          # Auth onboarding & authentication stack
    │   ├── PatientTabs.tsx        # Patient bottom tabs (Home, Appointments, Messages, Profile)
    │   ├── DoctorTabs.tsx         # Doctor bottom tabs (Dashboard, Schedule, Earnings, Profile)
    │   └── index.ts
    ├── screens/
    │   ├── auth/
    │   │   ├── SplashScreen.tsx
    │   │   ├── OnboardingScreen.tsx
    │   │   ├── LoginScreen.tsx
    │   │   ├── SignupScreen.tsx
    │   │   ├── OTPScreen.tsx
    │   │   └── ForgotPasswordScreen.tsx
    │   ├── patient/
    │   │   ├── HomeScreen.tsx
    │   │   ├── DoctorListScreen.tsx
    │   │   ├── DoctorDetailScreen.tsx
    │   │   ├── BookAppointmentScreen.tsx
    │   │   ├── PaymentScreen.tsx
    │   │   ├── AppointmentSuccessScreen.tsx
    │   │   ├── MyAppointmentsScreen.tsx
    │   │   ├── ChatListScreen.tsx
    │   │   ├── ChatScreen.tsx
    │   │   ├── WaitingRoomScreen.tsx
    │   │   ├── VideoCallScreen.tsx
    │   │   ├── PrescriptionScreen.tsx
    │   │   ├── NotificationsScreen.tsx
    │   │   ├── ProfileScreen.tsx
    │   │   └── LiveQueueTrackerScreen.tsx  # Online OPD Token & Turn Tracker
    │   └── doctor/
    │       ├── DoctorDashboardScreen.tsx   # Live Queue Number Controller
    │       ├── DoctorAppointmentsScreen.tsx
    │       ├── DoctorAvailabilityScreen.tsx
    │       ├── DoctorVideoCallScreen.tsx
    │       ├── WritePrescriptionScreen.tsx
    │       ├── DoctorEarningsScreen.tsx
    │       └── DoctorProfileScreen.tsx
    ├── components/
    │   ├── Button.tsx             # Primary, secondary, outline, ghost, danger variants
    │   ├── InputField.tsx         # Icons, password reveal, validation error state
    │   ├── Header.tsx             # Custom back button, actions, title
    │   ├── DoctorCard.tsx         # Horizontal carousel and vertical list variants
    │   ├── AppointmentCard.tsx    # Multi-status badges, patient & doctor views
    │   ├── CategoryChip.tsx       # Horizontal and vertical specialty chips
    │   ├── ReviewCard.tsx         # Patient ratings, avatars, and comments
    │   ├── TimeSlotChip.tsx       # Available, booked, and selected states
    │   ├── ChatBubble.tsx         # Sent/received message bubble with image support
    │   ├── EmptyState.tsx         # Illustrated empty placeholder with CTA
    │   ├── Loader.tsx             # Skeleton animated loading placeholder
    │   ├── BottomSheet.tsx        # Modal sheet overlay
    │   ├── Icon.tsx               # Unified vector icon wrapper
    │   └── LinearGradient.tsx     # Gradient hero section wrapper
    ├── theme/
    │   ├── colors.ts              # Medical color palette tokens
    │   ├── typography.ts          # Hierarchy: H1, H2, H3, Body, Caption, Tiny
    │   ├── spacing.ts             # Spacing, border radius, and elevation shadows
    │   └── index.ts
    ├── types/
    │   └── index.ts               # Doctor, Appointment, Review, Chat, Prescription types
    └── data/
        ├── categories.ts          # Medical specialties (Cardio, Derma, Dentist, etc.)
        ├── doctors.ts             # 11 comprehensive mock doctor profiles
        ├── appointments.ts        # 10 realistic appointment records across statuses
        ├── chats.ts               # Doctor conversations list
        ├── messages.ts            # Realistic doctor-patient dialogue trees
        ├── reviews.ts             # 16 detailed patient testimonials
        ├── prescriptions.ts       # Structured digital prescription records
        └── notifications.ts       # Appointment and system alerts
```

---

## 🎨 Design System Specifications

### Colors
| Name | Hex Code | Purpose |
|------|----------|---------|
| Primary | `#136BC6` | Buttons, links, active tabs (white text passes AA) |
| Primary Dark | `#0F589F` | Pressed/active states, gradient end |
| Primary Light | `#EAF3FD` | Tinted badges, selected chips, tab indicator |
| Accent | `#0FA58B` | Teal highlights (use `accentText` `#0B7D6B` for text) |
| Background | `#F4F7FB` | Canvas background |
| Card | `#FFFFFF` | Elevated surfaces |
| Text Primary | `#0F172A` | Main headers and labels |
| Text Secondary| `#5B6475` | Subtitles, doctor metadata |
| Success | `#16A34A` / text `#15803D` | Completed bookings, online presence |
| Warning | `#F59E0B` / text `#B45309` | Ratings, pending requests |
| Error | `#DC2626` / text `#B91C1C` | Cancellations, validation errors |

Use the `*Text` tokens (e.g. `colors.successText`) for text on the matching `*Light` badge background.

### Typography
- **Typeface**: Inter (400 / 500 / 600 / 700 / 800), loaded in `src/App.tsx` while the splash screen is visible.
- Each weight is its own font family — use the `typography` tokens or `fonts.bold` etc. instead of a bare `fontWeight`.

### Spacing & Borders
- **Spacing Units**: `4, 8, 12, 16, 20, 24, 32, 48`
- **Border Radius**: `4, 8, 12, 16, 20, 24, Round (9999)`
- **Touch targets**: 44–48 px minimum (`touchTarget`, `hitSlop` in `src/theme`).
- **Shadows**: `subtle`, `card`, `medium`, `large`, `primary` — soft slate-tinted elevation.

### Interaction
- `PressableScale` adds a spring press animation and haptic feedback (`expo-haptics`), and respects the OS "reduce motion" setting. All shared components use it; prefer it over `TouchableOpacity` in screens.
- Forms: `InputField` (label, hint, inline error, required mark, `ref` for focus chaining), `FormScrollView` (keeps inputs above the keyboard), and validators in `src/utils/validation.ts`.
- Loading & empty states: `Loader` / `Skeleton` (`card`, `list`, `carousel` variants) and `EmptyState`.

---

## 🚀 Running the App

### 1. Prerequisites
Ensure Node.js (v18+) is installed.

### 2. Start Dev Server
```bash
# Start dev server
npx expo start

# Run on Android emulator / connected device
npx expo start --android

# Run on iOS simulator (macOS required)
npx expo start --ios

# Run on Web browser
npx expo start --web
```

### 3. Verify Types & Code Health
```bash
# TypeScript type check (strict mode)
npx tsc --noEmit
```

---

## 🧑⚕️ Switching Between Portals
- **Patient Portal**: Includes doctor discovery, filtering, booking calendar, payment simulation, virtual waiting room, video consultation, and prescription records.
- **Doctor Portal**: Includes provider dashboard, patient appointment requests (Accept/Reject), weekly availability schedule manager, live consultation video call with in-call Rx pad, and revenue/earnings bar chart analytics.
- **Instant Switch**: Use the role selector on the Login screen, or toggle the portal directly from the **Profile** screen.

# OTP Verification Screen

A reusable OTP (one-time password) screen built with Expo, React Native and TypeScript.

The task was simple on paper, so I used the extra effort to make the code easy to read, easy to test, and easy to reuse. The same screen can confirm a login, a payment or a passcode change without copying any code.

## What it does

- Takes a 4-digit code (digits only, you can paste it or use SMS autofill)
- **Verify** button logs the full code to the console and fakes a short network delay
- **Resend** button stays disabled for 60 seconds and shows the time left, like `Resend in 0:45`
- Shows a loading spinner while verifying, and a clear error or success message afterwards
- Shakes and vibrates when the code is wrong
- Locks after 3 wrong attempts and tells you how many tries are left
- Works in dark mode and with screen readers

## How to run it

```bash
npm install
npx expo install --fix
npm start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with Expo Go.

`npx expo install --fix` makes sure all the Expo packages match your Expo version. Run it once after `npm install`.

To run the tests and the type check:

```bash
npm test
npm run typecheck
```

**If `npm test` fails with a Watchman error** (something about `libboost`), it is a problem with Watchman on your computer, not with this project. Either run `npm test -- --no-watchman`, or fix it with `brew reinstall watchman`.

## How the code is organised

I kept the screen thin. It only connects the pieces. Each piece does one job.

```
App.tsx                          Shows the screen with a demo email
src/
  theme/theme.ts                 Colours, spacing and font sizes (light + dark)
  components/ui/PrimaryButton    The Verify button (normal, disabled, loading)
  features/otp/
    screens/                     The screen that puts everything together
    components/OtpInput          The 4 boxes
    components/ResendTimer       "Didn't receive the code? Resend in 0:45"
    hooks/useOtpVerification     Code, status, attempts and submit logic
    hooks/useCountdown           The 60 second timer
    services/otpService          The (fake) server calls
    utils/                       Small helpers
    constants.ts, types.ts       Defaults, messages and shared types
```

The rule I followed: **components draw things, hooks hold the logic, the service talks to the server.** Because of that, I can test the logic without drawing anything on screen.

## Using it for other flows

Only the text and a few options change. The behaviour stays the same.

To try a different flow, replace the screen in `App.tsx` with one of these. They run as they are, with no extra setup.

```tsx
// Confirm a payment: hidden digits, hidden email, verify on the last digit
<OtpVerificationScreen
  purpose="payment"
  contact="+919876543210"
  secure
  shouldMaskContact
  autoSubmit
  onVerified={() => Alert.alert('Payment confirmed')}
/>

// Change a passcode with a 6 digit code and a 30 second wait
<OtpVerificationScreen
  purpose="passcode"
  contact="me@example.com"
  length={6}
  resendSeconds={30}
  onVerified={() => Alert.alert('Passcode can now be changed')}
/>
```

This project has no navigation, so `onVerified` just shows an alert. In a real app, this is where you would move to the next screen, for example `navigation.navigate('PaymentSuccess')` with React Navigation or `router.push('/payment-success')` with Expo Router.

### Connecting a real server

The screen only knows about a small `OtpService` interface with two functions: `verify` and `resend`. To use a real API, write those two functions and pass them in. Nothing else changes.

```ts
const apiOtpService: OtpService = {
  verify: (code) => api.post('/otp/verify', { code }).then(() => undefined),
  resend: (contact) => api.post('/otp/resend', { contact }).then(() => undefined),
};

<OtpVerificationScreen contact={email} service={apiOtpService} />
```

If the server rejects the code, throw an `OtpError` (`INVALID_CODE`, `EXPIRED_CODE` or `UNKNOWN`) and the screen will show a matching message.

## Why I built it this way

**One hidden text input behind the 4 boxes.**
The easy way is four separate inputs, but then you have to move focus by hand and it breaks when you paste a code, use SMS autofill, or press backspace. With one real input, the keyboard handles all of that. The boxes are just a picture of what was typed.

**The timer uses the clock, not a counter.**
If you count down with `setInterval`, the timer drifts and slows down when the app is in the background. I save the time the countdown should end and work out the seconds left from the current time. So if you leave the app for 30 seconds, the timer is still right when you come back.

**One status instead of many true/false flags.**
The screen is always in exactly one state: `idle`, `verifying`, `success`, `error` or `locked`. This avoids odd combinations like "loading and failed at the same time". A guard also stops the code from being submitted twice while a request is running.

**The server is hidden behind an interface.**
That is why the tests and the demo can use a fake server, and a real app can use a real one.

**No hard-coded colours or sizes in components.**
Everything comes from `theme.ts`, which also gives us dark mode.

## About the fake server

The fake server has "magic" codes, so you can see every message on screen without a real backend.

| Message                                                | How to see it                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `Code verified.`                                       | Type any code that is not listed below, for example `1234`, then press Verify              |
| `That code is incorrect.`                              | Type `0000` and press Verify                                                               |
| `That code has expired. Request a new one.`            | Type `1111` and press Verify                                                               |
| `Something went wrong. Please try again.`              | Type `2222` and press Verify                                                               |
| `Too many incorrect attempts. Please try again later.` | Verify with `0000` three times in a row                                                    |
| `We couldn’t send a new code. Please try again.`       | Change `contact` in `App.tsx` to `fail@example.com`, wait for the timer, then press Resend |

Tips:

- The wrong-code messages also say how many attempts are left, for example `That code is incorrect. 2 attempts left.`
- Waiting 60 seconds to test Resend is slow. While testing, pass `resendSeconds={5}` to the screen in `App.tsx`.
- Every Verify takes about 1.5 seconds. That is the fake network delay.

The console log is only there because the task asks for it. In a real app you should never log an OTP, because it works like a password.

## Tests

Run them with `npm test`. They cover:

- Helpers: cleaning the code, formatting the time, hiding part of an email or phone number
- The timer: counting down, stopping at zero, restarting, and staying correct after time passes in the background
- The verification logic: success, failure, attempt limit, and no double submit
- The fake server: the console log, the delay and the rejection
- The input: number of boxes, shown digits, hidden digits, pasting and the disabled state
- The full screen: texts, when Verify is enabled, submitting, errors, auto-submit, and how Resend works

## What I would do next

- Keep the lock-out after the app restarts, and let the server say when to try again
- Move the texts into a translation library
- Add an end-to-end test on a real device (Maestro or Detox)
- Add Storybook examples for the input and resend states

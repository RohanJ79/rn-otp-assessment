import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { OtpError, OtpService } from '../../services/otpService';
import { OtpVerificationScreen } from '../OtpVerificationScreen';

const createService = (overrides: Partial<OtpService> = {}): OtpService => ({
  verify: jest.fn().mockResolvedValue(undefined),
  resend: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const typeCode = (code: string) =>
  fireEvent.changeText(screen.getByTestId('otp-input-field'), code);

const press = async (testID: string) => {
  await act(async () => {
    fireEvent.press(screen.getByTestId(testID));
  });
};

describe('OtpVerificationScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the copy from the design and the contact', () => {
    render(
      <OtpVerificationScreen
        contact="example@gmail.com"
        service={createService()}
      />,
    );

    expect(screen.getByText('OTP Verification')).toBeTruthy();
    expect(
      screen.getByText('Enter the verification code we just sent you on'),
    ).toBeTruthy();
    expect(screen.getByText('example@gmail.com')).toBeTruthy();
  });

  it('switches copy based on purpose', () => {
    render(
      <OtpVerificationScreen
        contact="x@y.com"
        purpose="payment"
        service={createService()}
      />,
    );

    expect(screen.getByText('Confirm Payment')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('can mask the contact', () => {
    render(
      <OtpVerificationScreen
        contact="example@gmail.com"
        shouldMaskContact
        service={createService()}
      />,
    );

    expect(screen.getByText('e*****e@gmail.com')).toBeTruthy();
  });

  it('keeps Verify disabled until all 4 digits are entered', () => {
    render(
      <OtpVerificationScreen contact="a@b.com" service={createService()} />,
    );

    expect(screen.getByTestId('verify-button')).toBeDisabled();
    typeCode('123');
    expect(screen.getByTestId('verify-button')).toBeDisabled();
    typeCode('1234');
    expect(screen.getByTestId('verify-button')).toBeEnabled();
  });

  it('verifies the full code when Verify is pressed', async () => {
    const service = createService();
    const onVerified = jest.fn();
    render(
      <OtpVerificationScreen
        contact="a@b.com"
        service={service}
        onVerified={onVerified}
      />,
    );

    typeCode('1234');
    await press('verify-button');

    expect(service.verify).toHaveBeenCalledWith('1234');
    expect(onVerified).toHaveBeenCalledWith('1234');
    expect(screen.getByText('Code verified.')).toBeTruthy();
  });

  it('shows an error and the remaining attempts for a wrong code', async () => {
    const service = createService({
      verify: jest.fn().mockRejectedValue(new OtpError('INVALID_CODE', 'nope')),
    });
    render(<OtpVerificationScreen contact="a@b.com" service={service} />);

    typeCode('0000');
    await press('verify-button');

    expect(screen.getByText(/incorrect/i)).toBeTruthy();
    expect(screen.getByText(/2 attempts left/i)).toBeTruthy();
  });

  it('auto-submits when enabled', async () => {
    const service = createService();
    render(
      <OtpVerificationScreen contact="a@b.com" service={service} autoSubmit />,
    );

    await act(async () => {
      typeCode('1234');
    });

    expect(service.verify).toHaveBeenCalledWith('1234');
  });

  describe('resend', () => {
    it('is disabled and shows the remaining time while the timer runs', () => {
      render(
        <OtpVerificationScreen contact="a@b.com" service={createService()} />,
      );

      expect(screen.getByText('Resend in 1:00')).toBeTruthy();
      expect(screen.getByTestId('resend-button')).toBeDisabled();

      act(() => {
        jest.advanceTimersByTime(59_000);
      });
      expect(screen.getByText('Resend in 0:01')).toBeTruthy();
      expect(screen.getByTestId('resend-button')).toBeDisabled();
    });

    it('becomes available after 60 seconds', () => {
      render(
        <OtpVerificationScreen contact="a@b.com" service={createService()} />,
      );

      act(() => {
        jest.advanceTimersByTime(60_000);
      });

      expect(screen.getByText('Resend')).toBeTruthy();
      expect(screen.getByTestId('resend-button')).toBeEnabled();
    });

    it('requests a new code, clears the input and restarts the timer', async () => {
      const service = createService();
      render(<OtpVerificationScreen contact="a@b.com" service={service} />);

      typeCode('12');
      act(() => {
        jest.advanceTimersByTime(60_000);
      });
      await press('resend-button');

      expect(service.resend).toHaveBeenCalledWith('a@b.com');
      expect(screen.getByTestId('otp-input-field').props.value).toBe('');
      expect(screen.getByText('Resend in 1:00')).toBeTruthy();
    });
  });
});

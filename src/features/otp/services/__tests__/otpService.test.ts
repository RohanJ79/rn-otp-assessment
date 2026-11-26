import { createMockOtpService, OtpError } from '../otpService';

describe('mock OTP service', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('logs the full OTP and resolves only after the simulated network delay', async () => {
    const service = createMockOtpService({ delayMs: 500 });
    let settled = false;

    const promise = service.verify('1234').then(() => {
      settled = true;
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('1234'));

    await jest.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await promise;
    expect(settled).toBe(true);
  });

  it('rejects the configured invalid code with an OtpError', async () => {
    const service = createMockOtpService({ delayMs: 10, invalidCode: '0000' });

    const assertion = expect(service.verify('0000')).rejects.toBeInstanceOf(
      OtpError,
    );
    await jest.advanceTimersByTimeAsync(10);

    await assertion;
  });

  it('resolves resend after the delay', async () => {
    const service = createMockOtpService({ delayMs: 10 });

    const promise = service.resend('example@gmail.com');
    await jest.advanceTimersByTimeAsync(10);

    await expect(promise).resolves.toBeUndefined();
  });
});

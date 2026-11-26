import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';

import { OtpInput } from '../OtpInput';

// The visual boxes are hidden from the accessibility tree on purpose.
const hidden = { includeHiddenElements: true };

describe('OtpInput', () => {
  it('renders one box per digit', () => {
    render(<OtpInput value="" onChange={jest.fn()} length={4} />);

    expect(screen.getAllByTestId(/^otp-input-box-/, hidden)).toHaveLength(4);
  });

  it('renders a different number of boxes when length changes', () => {
    render(<OtpInput value="" onChange={jest.fn()} length={6} />);

    expect(screen.getAllByTestId(/^otp-input-box-/, hidden)).toHaveLength(6);
  });

  it('shows the entered digits in order', () => {
    render(<OtpInput value="12" onChange={jest.fn()} />);

    const first = screen.getByTestId('otp-input-box-0', hidden);
    const second = screen.getByTestId('otp-input-box-1', hidden);
    expect(within(first).getByText('1', hidden)).toBeTruthy();
    expect(within(second).getByText('2', hidden)).toBeTruthy();
  });

  it('masks digits when secure', () => {
    render(<OtpInput value="12" secure onChange={jest.fn()} />);

    const first = screen.getByTestId('otp-input-box-0', hidden);
    expect(within(first).getByText('•', hidden)).toBeTruthy();
    expect(within(first).queryByText('1', hidden)).toBeNull();
  });

  it('strips non-digits before calling onChange', () => {
    const onChange = jest.fn();
    render(<OtpInput value="" onChange={onChange} />);

    fireEvent.changeText(screen.getByTestId('otp-input-field'), '1a2b3');

    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('truncates pasted text to the configured length', () => {
    const onChange = jest.fn();
    render(<OtpInput value="" onChange={onChange} length={4} />);

    fireEvent.changeText(screen.getByTestId('otp-input-field'), '123456');

    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('is not editable when disabled', () => {
    render(<OtpInput value="" onChange={jest.fn()} disabled />);

    expect(screen.getByTestId('otp-input-field').props.editable).toBe(false);
  });
});

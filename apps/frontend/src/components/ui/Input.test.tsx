/**
 * Input Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept user input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'Hello');

    expect(input.value).toBe('Hello');
  });

  it('should apply placeholder', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should show error message when error prop is provided', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('should apply error styles when error exists', () => {
    render(<Input error="Error message" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
    expect(input).toHaveClass('focus-visible:ring-destructive');
  });

  it('should handle type attribute', () => {
    render(<Input type="password" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should handle email type', () => {
    render(<Input type="email" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('should handle onChange events', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test');

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should handle defaultValue', () => {
    render(<Input defaultValue="Initial value" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Initial value');
  });

  it('should handle controlled value', () => {
    const { rerender } = render(<Input value="Controlled" onChange={() => {}} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Controlled');

    rerender(<Input value="Updated" onChange={() => {}} />);
    expect(input.value).toBe('Updated');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>;
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle required attribute', () => {
    render(<Input required />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeRequired();
  });

  it('should handle maxLength attribute', () => {
    render(<Input maxLength={10} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.maxLength).toBe(10);
  });

  it('should handle readOnly attribute', () => {
    render(<Input readOnly value="Read only" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toHaveAttribute('readOnly');
    expect(input.value).toBe('Read only');
  });

  it('should not show error message when error is undefined', () => {
    const { container } = render(<Input />);

    const errorMessage = container.querySelector('.text-destructive');
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('should handle onBlur events', async () => {
    const handleBlur = jest.fn();
    const user = userEvent.setup();

    render(<Input onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle onFocus events', async () => {
    const handleFocus = jest.fn();
    const user = userEvent.setup();

    render(<Input onFocus={handleFocus} />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfileSettings } from './user-profile-settings';

describe('UserProfileSettings Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders header, labels, and default fields cleanly', () => {
    render(<UserProfileSettings />);

    expect(screen.getByRole('heading', { name: /Profile Settings/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payout Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio Description/i)).toBeInTheDocument();
  });

  it('validates invalid username and displays accessible error', () => {
    render(<UserProfileSettings />);

    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.blur(usernameInput);

    expect(screen.getByText(/Username must be at least 3 characters/i)).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates invalid email format', () => {
    render(<UserProfileSettings />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates payout email with subaddress alias without error', () => {
    render(<UserProfileSettings />);

    const payoutInput = screen.getByLabelText(/Payout Email/i);
    fireEvent.change(payoutInput, { target: { value: 'creator+alias@gmail.com' } });
    fireEvent.blur(payoutInput);

    expect(screen.queryByText(/Payout email format is invalid/i)).not.toBeInTheDocument();
    expect(payoutInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('handles bio length tracking', () => {
    render(<UserProfileSettings />);

    const bioInput = screen.getByLabelText(/Bio Description/i);
    fireEvent.change(bioInput, { target: { value: 'A'.repeat(50) } });

    expect(screen.getByText('50 / 150')).toBeInTheDocument();
  });

  it('submits valid form successfully and saves to localStorage', () => {
    render(<UserProfileSettings />);

    const submitBtn = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Settings saved successfully!/i)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('creator-profile-settings') || '{}');
    expect(stored.username).toBe('tayabunn');
  });
});

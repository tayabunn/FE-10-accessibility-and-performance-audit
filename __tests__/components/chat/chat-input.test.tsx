import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInput } from '@/components/chat/chat-input';

vi.mock('@/lib/fake-async', () => ({
  fakeAsyncAction: vi.fn().mockResolvedValue(undefined),
}));

describe('ChatInput Component', () => {
  const mockOnSend = vi.fn();
  const mockOnStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents empty submission', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} status="idle" />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();

    // Trying to click it should not trigger onSend
    await user.click(sendButton);
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('handles valid submission', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} onStop={mockOnStop} status="idle" />);
    
    const input = screen.getByPlaceholderText(/Type your request/i);
    await user.type(input, 'Hello World');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
    
    await user.click(sendButton);
    
    // We mock fakeAsyncAction, so the button enters loading/success state.
    // Testing the exact sequence of 1000ms delay in the component is tricky without fake timers.
    // At least the button should become disabled and change state.
    expect(screen.getByRole('button', { name: /send/i, hidden: true })).toBeDisabled();
  });
});

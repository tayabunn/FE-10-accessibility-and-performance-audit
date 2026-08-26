import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageItem } from '@/components/chat/message-item';
import { Message } from '@/hooks/use-chat-stream';

// Mock child components that might have complex rendering or animations we don't want to test here
vi.mock('@/components/chat/markdown-renderer', () => ({
  StreamingMarkdownRenderer: ({ content, isStreaming }: { content: string, isStreaming: boolean }) => (
    <div data-testid="markdown-renderer">
      {content}
      {isStreaming && <span data-testid="streaming-cursor">|</span>}
    </div>
  ),
}));

vi.mock('@/components/tools/weather-card', () => ({
  WeatherCard: ({ city }: { city: string }) => (
    <div data-testid="weather-card">Weather in {city}</div>
  ),
}));

vi.mock('@/components/tools/tool-part-renderer', () => ({
  ToolPartRenderer: ({ toolPart }: { toolPart: any }) => (
    <div data-testid="tool-renderer">Tool: {toolPart.toolName}</div>
  ),
}));

vi.mock('@/components/tools/rate-limit-card', () => ({
  RateLimitCard: ({ provider }: { provider?: string }) => (
    <div data-testid="rate-limit-card">Rate limited: {provider}</div>
  ),
}));

describe('MessageItem', () => {
  const mockPersona = {
    id: 'test-persona',
    name: 'Test Persona',
    avatar: '🤖',
    prompt: 'You are a test persona',
  };

  it('renders normal text content correctly', () => {
    const message: Message = {
      id: '1',
      role: 'assistant',
      content: 'Hello, I am a test message',
      parts: [{ type: 'text', text: 'Hello, I am a test message' }],
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('Hello, I am a test message');
    expect(screen.getByText('Test Persona')).toBeInTheDocument();
  });

  it('renders pending (thinking) state correctly', () => {
    const message: Message = {
      id: '2',
      role: 'assistant',
      content: '',
      parts: [],
      createdAt: new Date().toISOString(),
      status: 'thinking'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    expect(screen.getByText('Thinking & selecting tool schema...')).toBeInTheDocument();
  });

  it('renders streaming state correctly', () => {
    const message: Message = {
      id: '3',
      role: 'assistant',
      content: 'Partial message',
      parts: [{ type: 'text', text: 'Partial message' }],
      createdAt: new Date().toISOString(),
      status: 'streaming'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('Partial message');
  });

  it('renders error state correctly', () => {
    const message: Message = {
      id: '4',
      role: 'assistant',
      content: 'An error occurred',
      parts: [{ type: 'text', text: 'An error occurred' }],
      createdAt: new Date().toISOString(),
      status: 'error'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    // ChatErrorCard should render this text or something containing it
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('renders data-weather parts correctly', () => {
    const message: Message = {
      id: '5',
      role: 'assistant',
      content: '',
      parts: [
        { type: 'text', text: 'Here is the weather:' },
        { type: 'data-weather', data: { city: 'London', status: 'success' } }
      ],
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    expect(screen.getByTestId('weather-card')).toHaveTextContent('Weather in London');
  });

  it('renders tool-invocation parts correctly', () => {
    const message: Message = {
      id: '6',
      role: 'assistant',
      content: '',
      parts: [
        { 
          type: 'tool-invocation', 
          toolCallId: 'call_1', 
          toolName: 'myTool', 
          state: 'output-available' 
        }
      ],
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    expect(screen.getByTestId('tool-renderer')).toHaveTextContent('Tool: myTool');
  });

  it('renders step-start part correctly', () => {
    const message: Message = {
      id: '7',
      role: 'assistant',
      content: '',
      parts: [
        { type: 'step-start' }, // first step-start is ignored per code logic (index > 0)
        { type: 'step-start' }  // second one will be rendered
      ],
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    render(<MessageItem message={message} persona={mockPersona} />);
    
    expect(screen.getByText('Multi-Step Iteration #1')).toBeInTheDocument();
  });
});

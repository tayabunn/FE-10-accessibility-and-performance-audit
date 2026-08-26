import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeatherCard } from '@/components/tools/weather-card';

describe('WeatherCard', () => {
  it('renders loading state correctly', () => {
    render(<WeatherCard city="New York" status="loading" />);
    
    // Check loading text
    expect(screen.getByText('Connecting to weather API...')).toBeInTheDocument();
    
    // Check badge status
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders successful result correctly with custom data', () => {
    render(
      <WeatherCard 
        city="Seattle" 
        status="success" 
        temperature="65°F"
        humidity="70%"
        windSpeed="15 mph"
        weather="Rainy"
      />
    );
    
    // Check city and weather summary
    expect(screen.getByText('Seattle Weather')).toBeInTheDocument();
    expect(screen.getByText('Rainy conditions')).toBeInTheDocument();
    
    // Check output available badge
    expect(screen.getByText('output-available')).toBeInTheDocument();
    
    // Check metrics
    expect(screen.getByText('65°F')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('15 mph')).toBeInTheDocument();
  });
});

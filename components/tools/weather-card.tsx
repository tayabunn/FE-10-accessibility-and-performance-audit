'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer, Droplets } from 'lucide-react';

interface WeatherCardProps {
  city: string;
  weather?: string;
  temperature?: string;
  humidity?: string;
  windSpeed?: string;
  status?: 'loading' | 'success';
}

export function WeatherCard({
  city,
  weather = 'sunny',
  temperature = '72°F',
  humidity = '48%',
  windSpeed = '10 mph',
  status = 'success',
}: WeatherCardProps) {
  const getWeatherIcon = () => {
    switch (weather.toLowerCase()) {
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-400 animate-bounce" />;
      case 'snowy':
        return <Snowflake className="w-8 h-8 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'windy':
        return <Wind className="w-8 h-8 text-teal-300" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-slate-300" />;
      default:
        return <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950/80 border border-purple-800/40 p-4 shadow-xl backdrop-blur-md space-y-3 text-slate-100"
    >
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-900/50 border border-purple-700/50 flex items-center justify-center">
            {getWeatherIcon()}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{city} Weather</h4>
            <p className="text-[11px] text-slate-400 capitalize">
              {status === 'loading' ? 'Fetching live telemetry...' : `${weather} conditions`}
            </p>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
          status === 'loading' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
        }`}>
          {status === 'loading' ? 'loading' : 'output-available'}
        </span>
      </div>

      {status === 'loading' ? (
        <div className="py-4 text-center text-xs text-purple-300 animate-pulse font-mono">
          Connecting to weather API...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs text-center">
          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/40">
            <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 block">Temp</span>
            <span className="font-bold text-white">{temperature}</span>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/40">
            <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 block">Humidity</span>
            <span className="font-bold text-white">{humidity}</span>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/40">
            <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 block">Wind</span>
            <span className="font-bold text-white">{windSpeed}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

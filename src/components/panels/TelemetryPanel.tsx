import React, { useEffect, useState, useRef } from 'react';
import { TelemetryData } from '../../types';
import { Activity, Zap, Radio, Thermometer, Gauge, Compass, ShieldAlert, Sun, Flame, Snowflake, Cpu } from 'lucide-react';

interface TelemetryPanelProps {
  initialTelemetry: TelemetryData;
  assetId: string;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  initialTelemetry,
  assetId,
}) => {
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);
  const [sunshieldTemp, setSunshieldTemp] = useState<number>(initialTelemetry.sunshieldTempC ?? 85.0);

  const isJwst = assetId === 'jwst';

  const historyRef = useRef<{ vel: number[]; pwr: number[]; temp: number[] }>({
    vel: Array(24).fill(initialTelemetry.velocityKmS),
    pwr: Array(24).fill(initialTelemetry.powerLevelPercent),
    temp: Array(24).fill(initialTelemetry.temperatureC),
  });

  const [history, setHistory] = useState(historyRef.current);

  // Sync telemetry when asset changes
  useEffect(() => {
    setTelemetry(initialTelemetry);
    setSunshieldTemp(initialTelemetry.sunshieldTempC ?? 85.0);
    historyRef.current = {
      vel: Array(24).fill(initialTelemetry.velocityKmS),
      pwr: Array(24).fill(initialTelemetry.powerLevelPercent),
      temp: Array(24).fill(initialTelemetry.temperatureC),
    };
    setHistory({ ...historyRef.current });
  }, [initialTelemetry, assetId]);

  // Live telemetry pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev: TelemetryData) => {
        // High-precision jitter centered on scientific nominal values
        const velJitter = isJwst ? (Math.random() - 0.5) * 0.002 : (Math.random() - 0.5) * 0.05;
        const pwrJitter = (Math.random() - 0.5) * 0.2;
        const tempJitter = (Math.random() - 0.5) * 0.1;
        const signalJitter = isJwst ? (Math.random() - 0.5) * 0.1 : (Math.random() - 0.5) * 0.4;

        const baseVel = isJwst ? 0.202 : prev.velocityKmS;
        const nextVel = Math.round((baseVel + velJitter) * 1000) / 1000;
        const nextPwr = Math.round(Math.min(100, Math.max(80, prev.powerLevelPercent + pwrJitter)) * 10) / 10;
        
        const baseTemp = isJwst ? -233.0 : prev.temperatureC;
        const nextTemp = Math.round((baseTemp + tempJitter) * 10) / 10;

        const baseSignal = isJwst ? 99.4 : prev.signalQualityPercent;
        const nextSignal = Math.round((baseSignal + signalJitter) * 10) / 10;

        // Push into history
        const h = historyRef.current;
        h.vel = [...h.vel.slice(1), nextVel];
        h.pwr = [...h.pwr.slice(1), nextPwr];
        h.temp = [...h.temp.slice(1), nextTemp];
        setHistory({ ...h });

        if (isJwst) {
          const sunJitter = (Math.random() - 0.5) * 0.15;
          setSunshieldTemp(Math.round((85.0 + sunJitter) * 10) / 10);
        }

        return {
          ...prev,
          velocityKmS: nextVel,
          powerLevelPercent: nextPwr,
          temperatureC: nextTemp,
          signalQualityPercent: nextSignal,
          downlinkDataRateMbps: Math.round((prev.downlinkDataRateMbps + (Math.random() - 0.5) * 0.2) * 10) / 10,
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [assetId, isJwst]);

  // SVG Sparkline Renderer
  const renderSparkline = (data: number[], strokeColor: string) => {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 110;
    const h = 20;

    const points = data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((val - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div id="panel-live-telemetry" className="space-y-2.5">
      {/* Telemetry Header with DSN Station Lock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono-sci font-bold text-slate-200 tracking-wider">
            DSN TELEMETRY FEED
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[9px] font-mono-sci px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            LOCK: GOLDSTONE 70M
          </span>
        </div>
      </div>

      {/* Primary Telemetry Metrics Bento */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono-sci">
        {/* Metric 1: Orbit / Location */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] text-slate-400">ORBIT / POSITION</span>
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mb-0.5">
            {isJwst ? 'L2 Orbit' : telemetry.orbitType}
          </div>
          <div className="text-[10px] text-cyan-400 truncate">
            {telemetry.altitudeKm.toLocaleString()} km from Earth
          </div>
        </div>

        {/* Metric 2: Velocity */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] text-slate-400">VELOCITY</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mb-0.5">
            {telemetry.velocityKmS.toFixed(3)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">km/s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 font-normal">
              {(telemetry.velocityKmS * 3600).toFixed(1)} km/h
            </span>
            <div className="opacity-80">
              {renderSparkline(history.vel, '#38bdf8')}
            </div>
          </div>
        </div>

        {/* Metric 3: Signal Quality (99.4%) */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] text-slate-400">DSN SIGNAL LINK</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 mb-0.5">
            {telemetry.signalQualityPercent.toFixed(1)}%
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="text-slate-300 font-mono-sci">{telemetry.commStatus}</span>
            <span className="text-cyan-300 font-bold">{telemetry.downlinkDataRateMbps} Mbps</span>
          </div>
        </div>

        {/* Metric 4: Power Efficiency */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] text-slate-400">POWER HARVEST</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mb-0.5">
            {telemetry.powerLevelPercent.toFixed(1)}%
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-emerald-400 font-mono-sci">SOLAR NOMINAL</span>
            <div className="opacity-80">
              {renderSparkline(history.pwr, '#f59e0b')}
            </div>
          </div>
        </div>
      </div>

      {/* DUAL-SIDE THERMAL GRADIENT BAR & TEMPERATURE METRICS */}
      <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/20 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono-sci font-bold text-slate-200">
              THERMAL BARRIER MONITOR
            </span>
          </div>
          {isJwst && (
            <span className="text-[9px] font-mono-sci text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
              Δ 318°C DELTA
            </span>
          )}
        </div>

        {/* Hot Side vs Cold Side Visual */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono-sci text-xs">
          {/* Cold / Cryogenic Side */}
          <div className="p-2 rounded bg-sky-950/30 border border-sky-500/20">
            <div className="flex items-center gap-1 text-[10px] text-sky-400 font-semibold mb-0.5">
              <Snowflake className="w-3 h-3 text-cyan-400" />
              <span>CRYOGENIC TEMP</span>
            </div>
            <div className="text-base font-bold text-cyan-300">
              {telemetry.temperatureC.toFixed(1)}°C
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {(telemetry.temperatureC + 273.15).toFixed(1)} K (Instruments)
            </div>
          </div>

          {/* Warm / Sunshield Side */}
          <div className="p-2 rounded bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold mb-0.5">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>SUNSHIELD TEMP</span>
            </div>
            <div className="text-base font-bold text-amber-300">
              +{sunshieldTemp.toFixed(1)}°C
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              {(sunshieldTemp + 273.15).toFixed(1)} K (Sun-Facing)
            </div>
          </div>
        </div>

        {/* 5-Layer Kapton Membrane Gradient Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[9px] font-mono-sci text-slate-400">
            <span className="text-sky-400">COLD SIDE: -233°C</span>
            <span className="text-slate-400">5-LAYER KAPTON SHIELD</span>
            <span className="text-amber-400">HOT SIDE: +85°C</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-slate-900 border border-slate-700 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-600 via-purple-600 to-amber-500 opacity-90" />
            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-sm left-[22%]" title="Instruments Operating Range" />
          </div>
        </div>
      </div>

      {/* Secondary Environment & Health Diagnostics */}
      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] font-mono-sci text-slate-400 grid grid-cols-2 gap-2">
        <div>
          <span>SOLAR EXPOSURE: </span>
          <span className="text-amber-300 font-bold">{telemetry.sunExposurePercent}%</span>
        </div>
        <div>
          <span>RADIATION: </span>
          <span className="text-slate-200 font-bold">{telemetry.radiationRadHr} rad/h</span>
        </div>
        <div>
          <span>CRYOGENIC LOOP: </span>
          <span className="text-emerald-400 font-bold">NOMINAL 6.4 K</span>
        </div>
        <div>
          <span>DATA BUFFER: </span>
          <span className="text-cyan-300 font-bold">68.2 GB / 60%</span>
        </div>
      </div>
    </div>
  );
};

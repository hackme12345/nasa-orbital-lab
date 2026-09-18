import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Activity,
  Wifi,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  BookOpen,
  Database,
  Eye,
} from 'lucide-react';
import { NasaAsset } from '../../types';
import { soundManager } from '../../utils/sound';

interface MissionTopNavProps {
  currentAsset: NasaAsset;
  onSelectAsset: (assetId: string) => void;
  allAssets: NasaAsset[];
  fps: number;
  drawCalls: number;
  triangles: number;
  onOpenApod: () => void;
  onOpenProjectOverview: () => void;
  activeMainTab: 'CONTROL' | 'RESEARCH' | 'EDUCATION';
  onChangeMainTab: (tab: 'CONTROL' | 'RESEARCH' | 'EDUCATION') => void;
}

export const MissionTopNav: React.FC<MissionTopNavProps> = ({
  currentAsset,
  onSelectAsset,
  allAssets,
  fps,
  drawCalls,
  triangles,
  onOpenApod,
  onOpenProjectOverview,
  activeMainTab,
  onChangeMainTab,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [showPerfDetails, setShowPerfDetails] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  return (
    <header
      id="mission-control-top-header"
      className="relative z-30 h-14 w-full px-4 glass-panel border-b border-cyan-500/20 flex items-center justify-between gap-2"
    >
      {/* Left: NASA Meatball inspired badge & Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/40 shadow-inner">
            <span className="font-display-sci font-bold text-xs tracking-wider text-red-500">
              NASA
            </span>
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5">
            <h1 className="font-display-sci font-bold text-sm tracking-widest text-slate-100">
              ORBITAL LAB
            </h1>
            <span className="text-[10px] font-mono-sci px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-semibold">
              v2.6
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-800 hidden md:block" />

        {/* Mission Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono-sci">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">MISSION STATUS:</span>
          <span className="text-emerald-400 font-semibold">{currentAsset.operationalStatus}</span>
        </div>

        {/* Active Spacecraft quick switcher dropdown */}
        <div className="relative">
          <select
            id="select-active-spacecraft"
            value={currentAsset.id}
            onChange={(e) => {
              onSelectAsset(e.target.value);
              soundManager.playClick();
            }}
            className="bg-slate-900/90 text-cyan-300 border border-cyan-500/30 rounded px-2.5 py-1 text-xs font-mono-sci focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {allAssets.map((asset) => (
              <option key={asset.id} value={asset.id} className="bg-slate-900 text-slate-200">
                {asset.codeName} — {asset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Main Mode Tabs */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-slate-950/80 border border-slate-800/80">
        <button
          id="tab-btn-mission-control"
          onClick={() => {
            onChangeMainTab('CONTROL');
            soundManager.playClick();
          }}
          className={`px-3 py-1 rounded text-xs font-mono-sci transition-all flex items-center gap-1.5 ${
            activeMainTab === 'CONTROL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>MISSION CONTROL</span>
        </button>

        <button
          id="tab-btn-research-lab"
          onClick={() => {
            onChangeMainTab('RESEARCH');
            soundManager.playClick();
          }}
          className={`px-3 py-1 rounded text-xs font-mono-sci transition-all flex items-center gap-1.5 ${
            activeMainTab === 'RESEARCH'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>DATA & RESEARCH</span>
        </button>

        <button
          id="tab-btn-education-mode"
          onClick={() => {
            onChangeMainTab('EDUCATION');
            soundManager.playClick();
          }}
          className={`px-3 py-1 rounded text-xs font-mono-sci transition-all flex items-center gap-1.5 ${
            activeMainTab === 'EDUCATION'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>EDUCATION LAB</span>
        </button>
      </div>

      {/* Right: Telemetry metrics, UTC clock, APOD, Audio */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* UTC Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/50 border border-slate-800 text-xs font-mono-sci text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{utcTime || '12:00:00 UTC'}</span>
        </div>

        {/* Data Stream Connection */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/50 border border-slate-800 text-[11px] font-mono-sci text-slate-300">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-400">DATA:</span>
          <span className="text-cyan-300">CONNECTED</span>
        </div>

        {/* FPS & Performance Indicator */}
        <div className="relative">
          <button
            id="btn-perf-toggle"
            onClick={() => setShowPerfDetails(!showPerfDetails)}
            className="px-2 py-1 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono-sci text-slate-300 hover:border-cyan-500/40 flex items-center gap-1"
            title="Toggle Engine Diagnostics"
          >
            <span className={fps < 30 ? 'text-amber-400' : 'text-emerald-400 font-semibold'}>
              {fps || 60}
            </span>
            <span className="text-slate-500">FPS</span>
          </button>

          {showPerfDetails && (
            <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-lg glass-panel-accent border border-cyan-500/30 text-xs font-mono-sci z-50 shadow-2xl">
              <div className="text-slate-400 mb-1 border-b border-slate-800 pb-1">
                GRAPHICS ENGINE
              </div>
              <div className="flex justify-between py-0.5 text-slate-300">
                <span>FPS:</span>
                <span className="text-emerald-400">{fps}</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-300">
                <span>DRAW CALLS:</span>
                <span className="text-cyan-400">{drawCalls || 18}</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-300">
                <span>TRIANGLES:</span>
                <span className="text-cyan-400">{(triangles || 14200).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 text-slate-300">
                <span>RENDERER:</span>
                <span className="text-slate-400">WebGL 2.0</span>
              </div>
            </div>
          )}
        </div>

        {/* APOD Experience Button */}
        <button
          id="btn-open-apod"
          onClick={() => {
            onOpenApod();
            soundManager.playClick();
          }}
          className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-mono-sci transition-all flex items-center gap-1.5 shadow-sm"
          title="Astronomy Picture of the Day"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">NASA APOD</span>
        </button>

        {/* NASA Project Overview Modal button */}
        <button
          id="btn-open-project-overview"
          onClick={() => {
            onOpenProjectOverview();
            soundManager.playClick();
          }}
          className="p-1.5 rounded glass-panel-subtle hover:glass-panel-accent border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
          title="Project Proposal & Architecture Information"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          id="btn-toggle-audio"
          onClick={handleAudioToggle}
          className="p-1.5 rounded glass-panel-subtle hover:glass-panel-accent border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
          title={isMuted ? 'Unmute Telemetry Sounds' : 'Mute Telemetry Sounds'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </header>
  );
};

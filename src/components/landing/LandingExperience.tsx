import React from 'react';
import { Rocket, Satellite, ArrowRight, ShieldCheck, Layers, Sparkles } from 'lucide-react';
import { NasaAsset } from '../../types';
import { soundManager } from '../../utils/sound';

interface LandingExperienceProps {
  assets: NasaAsset[];
  selectedAsset: NasaAsset;
  onSelectAsset: (assetId: string) => void;
  onEnterMissionControl: () => void;
  onOpenProjectOverview: () => void;
}

export const LandingExperience: React.FC<LandingExperienceProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onEnterMissionControl,
  onOpenProjectOverview,
}) => {
  return (
    <div
      id="landing-experience-overlay"
      className="absolute inset-x-0 top-14 bottom-0 z-20 flex flex-col justify-between p-6 md:p-10 pointer-events-none"
    >
      {/* Center Cinematic Hero Content */}
      <div className="max-w-2xl space-y-4 my-auto pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-accent border border-cyan-500/40 text-xs font-mono-sci text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>NEXT-GENERATION SPACE EXPLORATION & 3D SCIENTIFIC LAB</span>
        </div>

        <h1 className="font-display-sci font-black text-4xl sm:text-6xl md:text-7xl text-slate-100 tracking-tight leading-none drop-shadow-lg">
          NASA <span className="text-cyan-400">ORBITAL</span> LAB
        </h1>

        <p className="font-display-sci text-lg sm:text-xl text-cyan-200/90 font-medium tracking-wide">
          "Explore. Visualize. Understand."
        </p>

        <p className="text-sm font-mono-sci text-slate-300 max-w-xl leading-relaxed">
          Step into a real-time spatial computing environment. Inspect authentic NASA spacecraft assemblies, switch into specialized thermal and X-ray artifact shaders, explode components, and analyze telemetry.
        </p>

        {/* Spacecraft Selector Pills */}
        <div className="pt-2">
          <span className="text-[11px] font-mono-sci text-slate-400 mb-2 block">
            SELECT INITIAL EXPLORATION TARGET:
          </span>
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => {
              const isSelected = asset.id === selectedAsset.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset.id);
                    soundManager.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-sci transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-lg shadow-cyan-950/40 font-bold'
                      : 'glass-panel-subtle text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Satellite className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{asset.codeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <button
            id="btn-enter-mission-control"
            onClick={() => {
              onEnterMissionControl();
              soundManager.playClick();
            }}
            className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display-sci font-bold text-sm tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
          >
            <Rocket className="w-4 h-4" />
            <span>ENTER MISSION CONTROL</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-landing-project-briefing"
            onClick={() => {
              onOpenProjectOverview();
              soundManager.playClick();
            }}
            className="px-4 py-3 rounded-lg glass-panel-subtle hover:glass-panel-accent text-xs font-mono-sci text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PROJECT BRIEFING</span>
          </button>

          <div className="text-xs font-mono-sci text-slate-400 px-3 py-2 rounded glass-panel-subtle border border-slate-800">
            TARGET: <span className="text-cyan-300 font-bold">{selectedAsset.name}</span>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Ticker */}
      <div className="pointer-events-auto grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-cyan-500/20 text-xs font-mono-sci">
        <div className="glass-panel-subtle p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[10px] block">SPACECRAFT FLEET</span>
          <span className="text-cyan-300 font-bold text-sm">5 NASA ASSETS</span>
        </div>

        <div className="glass-panel-subtle p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[10px] block">ARTIFACT LAB</span>
          <span className="text-cyan-300 font-bold text-sm">6 SHADER MODES</span>
        </div>

        <div className="glass-panel-subtle p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[10px] block">EXPLODED VIEW</span>
          <span className="text-cyan-300 font-bold text-sm">0 - 100% CONTINUOUS</span>
        </div>

        <div className="glass-panel-subtle p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 text-[10px] block">AI SPECIALIST</span>
          <span className="text-emerald-400 font-bold text-sm">GEMINI 3.8 FLASH</span>
        </div>
      </div>
    </div>
  );
};

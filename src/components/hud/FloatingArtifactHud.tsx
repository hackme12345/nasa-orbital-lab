import React, { useState } from 'react';
import { VisualizationMode, SpacecraftComponent } from '../../types';
import { Sparkles, Grid, Eye, Thermometer, Layers, ChevronDown, ChevronUp, Sliders, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface FloatingArtifactHudProps {
  visualizationMode: VisualizationMode;
  onSelectMode: (mode: VisualizationMode) => void;
  explodedRatio: number;
  onChangeExploded: (ratio: number) => void;
  selectedComponent: SpacecraftComponent | null;
  onSelectComponent: (comp: SpacecraftComponent | null) => void;
  isLanding?: boolean;
}

export const FloatingArtifactHud: React.FC<FloatingArtifactHudProps> = ({
  visualizationMode,
  onSelectMode,
  explodedRatio,
  onChangeExploded,
  selectedComponent,
  onSelectComponent,
  isLanding = false,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (isLanding) return null;

  const handleModeClick = (mode: VisualizationMode) => {
    soundManager.playClick();
    onSelectMode(mode);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChangeExploded(val);
  };

  const handlePresetExplode = (ratio: number) => {
    soundManager.playClick();
    onChangeExploded(ratio);
  };

  const percentage = Math.round(explodedRatio * 100);

  return (
    <div
      id="floating-artifact-hud"
      className="absolute top-16 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 pointer-events-auto select-none w-[92vw] sm:w-auto max-w-xl"
    >
      <div className="backdrop-blur-xl bg-slate-950/85 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/30 px-3.5 py-2.5 flex flex-col gap-2.5 w-full">
        {/* HUD Top Bar: Title, Active Status, and Minimize */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono-sci font-bold tracking-wider text-slate-200 flex items-center gap-1.5">
              <span>ARTIFACT LAB CONTROLS</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-normal">
                INTERACTIVE PBR
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {percentage > 0 && (
              <span className="text-[10px] font-mono-sci px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-semibold animate-pulse">
                EXPLODED: {percentage}%
              </span>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={isMinimized ? 'Expand HUD' : 'Collapse HUD'}
            >
              {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Control 1: Visualization Mode Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Mode: Realistic PBR */}
              <button
                id="btn-mode-pbr"
                onClick={() => handleModeClick('REALISTIC')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-sci font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  visualizationMode === 'REALISTIC'
                    ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
                title="Physically Based Rendering with gold mirror speculars and Kapton materials"
              >
                <Sparkles className={`w-3.5 h-3.5 ${visualizationMode === 'REALISTIC' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>REALISTIC PBR</span>
              </button>

              {/* Mode: Wireframe */}
              <button
                id="btn-mode-wireframe"
                onClick={() => handleModeClick('WIREFRAME')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-sci font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  visualizationMode === 'WIREFRAME'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
                title="Structural wireframe mesh geometry"
              >
                <Grid className={`w-3.5 h-3.5 ${visualizationMode === 'WIREFRAME' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>WIREFRAME</span>
              </button>

              {/* Mode: Infrared Spectral */}
              <button
                id="btn-mode-infrared"
                onClick={() => handleModeClick('INFRARED')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-sci font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  visualizationMode === 'INFRARED'
                    ? 'bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-400/60 shadow-lg shadow-fuchsia-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
                title="Infrared false-color spectrum shader"
              >
                <Eye className={`w-3.5 h-3.5 ${visualizationMode === 'INFRARED' ? 'text-fuchsia-400' : 'text-slate-400'}`} />
                <span>INFRARED</span>
              </button>

              {/* Mode: Thermal False-Color */}
              <button
                id="btn-mode-thermal"
                onClick={() => handleModeClick('THERMAL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-sci font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  visualizationMode === 'THERMAL'
                    ? 'bg-gradient-to-r from-red-500/25 to-amber-500/25 text-red-300 border border-red-400/60 shadow-lg shadow-red-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
                title="Thermal false-color heat map"
              >
                <Thermometer className={`w-3.5 h-3.5 ${visualizationMode === 'THERMAL' ? 'text-red-400' : 'text-slate-400'}`} />
                <span>THERMAL MAP</span>
              </button>
            </div>

            {/* Control 2: Exploded View Slider (0% to 100%) */}
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono-sci">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">EXPLODED VIEW:</span>
                  <span className="text-cyan-300 font-bold">{percentage}%</span>
                  <span className="text-[10px] text-slate-500">
                    {percentage === 0 ? '(ASSEMBLED FLIGHT)' : percentage === 100 ? '(FULLY SEPARATED)' : '(SUB-ASSEMBLIES SEPARATED)'}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePresetExplode(0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                      percentage === 0
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    0%
                  </button>
                  <button
                    onClick={() => handlePresetExplode(0.5)}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                      percentage === 50
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handlePresetExplode(1.0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                      percentage === 100
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Slider Track */}
              <div className="relative flex items-center">
                <input
                  id="slider-exploded-view"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedRatio}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                />
              </div>

              {/* Exploded View Guide Indicator */}
              <div className="flex items-center justify-between text-[9px] font-mono-sci text-slate-400 px-0.5">
                <span>PRIMARY MIRROR</span>
                <span>•</span>
                <span>INSTRUMENT MODULE</span>
                <span>•</span>
                <span>5-LAYER SUNSHIELD</span>
                <span>•</span>
                <span>BUS</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

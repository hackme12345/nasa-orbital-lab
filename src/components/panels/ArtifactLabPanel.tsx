import React from 'react';
import {
  VisualizationMode,
  SpatialView,
  SpacecraftComponent,
} from '../../types';
import {
  Box,
  Eye,
  Activity,
  Flame,
  Layers,
  Sparkles,
  Camera,
  Globe,
  Compass,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ArtifactLabPanelProps {
  visualizationMode: VisualizationMode;
  onSelectMode: (mode: VisualizationMode) => void;
  explodedRatio: number;
  onChangeExploded: (ratio: number) => void;
  spatialView: SpatialView;
  onChangeSpatialView: (view: SpatialView) => void;
  components: SpacecraftComponent[];
  selectedComponent: SpacecraftComponent | null;
  onSelectComponent: (comp: SpacecraftComponent | null) => void;
}

export const ArtifactLabPanel: React.FC<ArtifactLabPanelProps> = ({
  visualizationMode,
  onSelectMode,
  explodedRatio,
  onChangeExploded,
  spatialView,
  onChangeSpatialView,
  components,
  selectedComponent,
  onSelectComponent,
}) => {
  const modes: { id: VisualizationMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'REALISTIC',
      label: 'REALISTIC',
      desc: 'PBR metallic-roughness reflection & foil shaders',
      icon: <Box className="w-3.5 h-3.5" />,
    },
    {
      id: 'WIREFRAME',
      label: 'WIREFRAME',
      desc: 'Geometric structural topology mesh grid',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'XRAY',
      label: 'X-RAY',
      desc: 'Fresnel edge transparency revealing internal modules',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      id: 'INFRARED',
      label: 'INFRARED',
      desc: 'Analytical false-color spectral emissivity shader',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'THERMAL',
      label: 'THERMAL',
      desc: 'Kelvin gradient heat dissipation map (-250°C to +150°C)',
      icon: <Flame className="w-3.5 h-3.5" />,
    },
    {
      id: 'ANALYTICAL',
      label: 'ANALYTICAL',
      desc: 'Color-coded subsystem separation (Optics, Power, Avionics)',
      icon: <Activity className="w-3.5 h-3.5" />,
    },
  ];

  const spatialViews: { id: SpatialView; label: string; icon: React.ReactNode }[] = [
    { id: 'EARTH', label: 'EARTH VIEW', icon: <Globe className="w-3 h-3" /> },
    { id: 'ORBIT', label: 'ORBIT VIEW', icon: <Compass className="w-3 h-3" /> },
    { id: 'MISSION', label: 'MISSION VIEW', icon: <Camera className="w-3 h-3" /> },
    { id: 'SPACECRAFT', label: 'SPACECRAFT', icon: <Box className="w-3 h-3" /> },
    { id: 'COMPONENT', label: 'COMPONENT', icon: <Layers className="w-3 h-3" /> },
  ];

  return (
    <div id="panel-artifact-lab" className="space-y-4">
      {/* Visual Modes Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono-sci text-cyan-400 font-semibold tracking-wider">
            ARTIFACT LAB MODES
          </span>
          <span className="text-[10px] font-mono-sci text-slate-500">
            SHADERS ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((m) => {
            const isActive = visualizationMode === m.id;
            return (
              <button
                key={m.id}
                id={`btn-mode-${m.id.toLowerCase()}`}
                onClick={() => {
                  onSelectMode(m.id);
                  soundManager.playClick();
                }}
                className={`px-2 py-2 rounded text-left transition-all border flex flex-col gap-1 ${
                  isActive
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-900/30'
                    : 'glass-panel-subtle border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={m.desc}
              >
                <div className="flex items-center gap-1 text-[11px] font-mono-sci font-bold">
                  <span className={isActive ? 'text-cyan-300' : 'text-slate-500'}>
                    {m.icon}
                  </span>
                  <span>{m.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exploded View Slider */}
      <div className="p-3 rounded-lg glass-panel-subtle border border-slate-800/90">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono-sci text-slate-200">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">EXPLODED VIEW</span>
          </div>
          <span className="text-xs font-mono-sci text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/30">
            {Math.round(explodedRatio * 100)}%
          </span>
        </div>

        <input
          type="range"
          id="slider-exploded-view"
          min="0"
          max="100"
          value={Math.round(explodedRatio * 100)}
          onChange={(e) => onChangeExploded(Number(e.target.value) / 100)}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[9px] font-mono-sci text-slate-500 mt-1">
          <span>0% (ASSEMBLED)</span>
          <span>50% (EXPANDED)</span>
          <span>100% (ARCHITECTURE)</span>
        </div>
      </div>

      {/* Spatial Navigation View Modes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono-sci text-cyan-400 font-semibold tracking-wider">
            SPATIAL CAMERA ORIENTATION
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 text-[10px] font-mono-sci">
          {spatialViews.map((sv) => {
            const isActive = spatialView === sv.id;
            return (
              <button
                key={sv.id}
                id={`btn-spatial-view-${sv.id.toLowerCase()}`}
                onClick={() => {
                  onChangeSpatialView(sv.id);
                  soundManager.playClick();
                }}
                className={`py-1.5 px-1 rounded text-center transition-all border flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                    : 'glass-panel-subtle border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {sv.icon}
                <span className="text-[9px] truncate w-full">{sv.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Component Selection Pills */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono-sci text-slate-400 tracking-wider">
            SELECT SUBSYSTEM COMPONENT
          </span>
          {selectedComponent && (
            <button
              onClick={() => onSelectComponent(null)}
              className="text-[10px] font-mono-sci text-cyan-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {components.map((c) => {
            const isSel = selectedComponent?.id === c.id;
            return (
              <button
                key={c.id}
                id={`btn-comp-${c.id}`}
                onClick={() => {
                  onSelectComponent(c);
                  soundManager.playClick();
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono-sci transition-all border ${
                  isSel
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {c.name.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

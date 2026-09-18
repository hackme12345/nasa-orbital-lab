import React from 'react';
import { SpacecraftComponent } from '../../types';
import { ShieldCheck, Thermometer, Cpu, X, Sparkles, Activity } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ComponentInspectorProps {
  component: SpacecraftComponent | null;
  onClose: () => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  component,
  onClose,
}) => {
  if (!component) return null;

  return (
    <div
      id="card-component-inspector"
      className="p-3.5 rounded-lg glass-panel-accent border border-cyan-500/40 relative animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Close button */}
      <button
        onClick={() => {
          onClose();
          soundManager.playClick();
        }}
        className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title="Deselect Component"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-2 mb-2 pr-6">
        <div
          className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm"
          style={{ backgroundColor: component.analyticalColor }}
        />
        <div>
          <span className="text-[10px] font-mono-sci px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider font-semibold">
            {component.subsystem}
          </span>
          <h4 className="font-display-sci font-bold text-sm text-slate-100 mt-1">
            {component.name}
          </h4>
        </div>
      </div>

      {/* Scientific Function */}
      <p className="text-xs font-mono-sci text-slate-300 mb-3 leading-relaxed border-l-2 border-cyan-500/40 pl-2.5 py-0.5">
        {component.function}
      </p>

      {/* Technical Specifications Grid */}
      <div className="space-y-1.5 text-xs font-mono-sci bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
        <div className="flex items-start gap-2 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">MATERIAL: </span>
            <span className="text-slate-200">{component.material}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-300">
          <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">OPERATING TEMP: </span>
            <span className="text-amber-300 font-semibold">
              {component.temperatureC}°C ({component.temperatureC + 273.15} K)
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">SCIENTIFIC ROLE: </span>
            <span className="text-slate-200">{component.scientificRole}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">STATUS: </span>
            <span className="text-emerald-400 font-semibold">{component.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

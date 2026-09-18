import React from 'react';
import { X, Award, CheckCircle2, Shield, Rocket, Cpu, Layers, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ProjectOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectOverviewModal: React.FC<ProjectOverviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-project-overview"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] glass-panel border border-cyan-500/40 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display-sci font-bold text-base text-slate-100 tracking-wide">
                NASA ORBITAL LAB // MISSION SPECIFICATION
              </h2>
              <p className="text-[11px] font-mono-sci text-cyan-400">
                OFFICIAL SUBMISSION BRIEFING & TECHNICAL ARCHITECTURE
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              soundManager.playClick();
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 text-xs font-mono-sci">
          {/* Concept Banner */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              PROJECT IDENTITY
            </span>
            <h3 className="font-display-sci font-bold text-xl text-slate-100 mt-1 mb-1">
              NASA ORBITAL LAB
            </h3>
            <p className="text-cyan-300 font-mono-sci text-xs font-semibold mb-2">
              "Explore. Visualize. Understand."
            </p>
            <p className="text-slate-300 leading-relaxed">
              An interactive 3D spatial computing environment where students, educators, researchers, and space enthusiasts explore real NASA spacecraft, planetary assets, mission information, scientific datasets, and simulated telemetry in an immersive, scientific mission-control cockpit.
            </p>
          </div>

          {/* Section: Key Achievements */}
          <div>
            <h4 className="font-display-sci font-bold text-sm text-cyan-300 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              KEY TECHNICAL ACHIEVEMENTS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-100 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Procedural High-Fidelity PBR 3D Models
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Geometrically authentic assemblies for JWST (18 hex mirrors, 5-layer Kapton sunshields), ISS (109m truss, 8 solar arrays, Cupola), and Mars Perseverance (MMRTG, Rocker-Bogie, SuperCam).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-100 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Artifact Lab Shader Engine
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Instant multi-mode shader swaps: Realistic PBR, Topology Wireframe, Fresnel X-Ray, Analytical Infrared Emissivity, Kelvin Thermal Heatmap, and Subsystem Color-Coding.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-100 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Continuous Exploded Engineering View
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Dynamic 0% to 100% mechanical separation along mathematically tuned normal vectors, allowing component isolation and inspection of internal avionics.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-100 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  DSN Telemetry Stream & Gemini AI Lab
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Simulated real-time Deep Space Network telemetry feeds combined with an integrated Gemini 3.8 Flash science specialist answering mission inquiries.
                </p>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold">OFFICIAL DATA ARCHIVES & SOURCES:</span>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-cyan-300">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">NASA APOD API</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">NASA JPL Horizons / SSD</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Goddard Space Flight Center</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">ESA Science Data Center</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

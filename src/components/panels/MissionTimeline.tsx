import React, { useState } from 'react';
import { MissionEvent, NasaAsset } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Calendar,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface MissionTimelineProps {
  currentAsset: NasaAsset;
  selectedEventId: string | null;
  onSelectEvent: (event: MissionEvent) => void;
  simulationPlaying: boolean;
  onTogglePlay: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({
  currentAsset,
  selectedEventId,
  onSelectEvent,
  simulationPlaying,
  onTogglePlay,
  simulationSpeed,
  onChangeSpeed,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeEvent = currentAsset.timeline.find((e) => e.id === selectedEventId) || currentAsset.timeline[0];

  return (
    <div
      id="panel-mission-timeline"
      className="absolute bottom-0 left-0 right-0 z-20 glass-panel border-t border-cyan-500/20 px-4 py-2 flex flex-col gap-2 transition-all duration-300"
    >
      {/* Top row: Orbit Propagation Bar + Event Summary */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Simulation Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-toggle-simulation-play"
            onClick={() => {
              onTogglePlay();
              soundManager.playClick();
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono-sci font-bold flex items-center gap-1.5 transition-all ${
              simulationPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {simulationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simulationPlaying ? 'PAUSE ORBIT' : 'PROPAGATE'}</span>
          </button>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded border border-slate-800 text-[10px] font-mono-sci">
            {[1, 10, 100, 1000].map((spd) => (
              <button
                key={spd}
                id={`btn-speed-${spd}x`}
                onClick={() => {
                  onChangeSpeed(spd);
                  soundManager.playClick();
                }}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}X
              </button>
            ))}
          </div>
        </div>

        {/* Center: Active Mission Event Callout */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono-sci overflow-hidden">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400 shrink-0">EVENT:</span>
          <span className="text-cyan-200 font-bold truncate">
            {activeEvent?.title}
          </span>
          <span className="text-slate-500">({activeEvent?.date})</span>
        </div>

        {/* Right: Expand Timeline toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-toggle-expand-timeline"
            onClick={() => {
              setIsExpanded(!isExpanded);
              soundManager.playClick();
            }}
            className="px-2.5 py-1 rounded glass-panel-subtle hover:glass-panel-accent text-xs font-mono-sci text-slate-300 hover:text-cyan-300 border border-slate-700/60 flex items-center gap-1 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">TIMELINE SEQUENCE</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Multi-Phase Milestone Tracks */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {currentAsset.timeline.map((evt, idx) => {
              const isSelected = evt.id === activeEvent?.id;

              return (
                <div
                  key={evt.id}
                  id={`milestone-event-${evt.id}`}
                  onClick={() => {
                    onSelectEvent(evt);
                    soundManager.playClick();
                  }}
                  className={`shrink-0 w-60 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                      : 'glass-panel-subtle border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-sci mb-1">
                    <span className="text-cyan-400 font-bold">PHASE 0{idx + 1}</span>
                    <span className="text-slate-400">{evt.date}</span>
                  </div>

                  <h5 className="font-display-sci font-semibold text-xs text-slate-100 truncate mb-1">
                    {evt.title}
                  </h5>

                  <p className="text-[10px] font-mono-sci text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/70 text-[9px] font-mono-sci text-emerald-400 truncate flex justify-between">
                    <span>{evt.phase}</span>
                    {evt.telemetrySnapshot?.status && <span>{evt.telemetrySnapshot.status}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

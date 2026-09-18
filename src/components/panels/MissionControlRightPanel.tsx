import React, { useState } from 'react';
import {
  NasaAsset,
  VisualizationMode,
  SpatialView,
  SpacecraftComponent,
} from '../../types';
import { ArtifactLabPanel } from './ArtifactLabPanel';
import { ComponentInspector } from './ComponentInspector';
import { TelemetryPanel } from './TelemetryPanel';
import { AiScienceAssistant } from './AiScienceAssistant';
import { Layers, Activity, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface MissionControlRightPanelProps {
  currentAsset: NasaAsset;
  visualizationMode: VisualizationMode;
  onSelectMode: (mode: VisualizationMode) => void;
  explodedRatio: number;
  onChangeExploded: (ratio: number) => void;
  spatialView: SpatialView;
  onChangeSpatialView: (view: SpatialView) => void;
  selectedComponent: SpacecraftComponent | null;
  onSelectComponent: (comp: SpacecraftComponent | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MissionControlRightPanel: React.FC<MissionControlRightPanelProps> = ({
  currentAsset,
  visualizationMode,
  onSelectMode,
  explodedRatio,
  onChangeExploded,
  spatialView,
  onChangeSpatialView,
  selectedComponent,
  onSelectComponent,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'LAB' | 'TELEMETRY' | 'AI'>('LAB');

  return (
    <div
      id="panel-mission-control-right"
      className={`absolute right-0 top-14 bottom-14 z-20 transition-all duration-300 flex ${
        isOpen ? 'w-80 md:w-96' : 'w-0'
      }`}
    >
      {/* Toggle Tab Button */}
      <button
        id="btn-toggle-right-panel"
        onClick={() => {
          onToggle();
          soundManager.playClick();
        }}
        className="self-center -mr-px w-6 h-14 rounded-l-md glass-panel border-y border-l border-cyan-500/30 flex items-center justify-center text-slate-400 hover:text-cyan-300 transition-colors z-30"
        title={isOpen ? 'Collapse Tools Panel' : 'Expand Tools Panel'}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Main Glass Panel */}
      <div
        className={`w-full h-full glass-panel border-l border-cyan-500/20 flex flex-col overflow-hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-slate-800/90 bg-slate-950/50 p-1.5 gap-1 shrink-0">
          <button
            id="tab-btn-artifact-lab"
            onClick={() => {
              setActiveTab('LAB');
              soundManager.playClick();
            }}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-mono-sci transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LAB'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ARTIFACT LAB</span>
          </button>

          <button
            id="tab-btn-telemetry"
            onClick={() => {
              setActiveTab('TELEMETRY');
              soundManager.playClick();
            }}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-mono-sci transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'TELEMETRY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>TELEMETRY</span>
          </button>

          <button
            id="tab-btn-ai-specialist"
            onClick={() => {
              setActiveTab('AI');
              soundManager.playClick();
            }}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-mono-sci transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'AI'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI LAB</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {activeTab === 'LAB' && (
            <>
              {selectedComponent && (
                <ComponentInspector
                  component={selectedComponent}
                  onClose={() => onSelectComponent(null)}
                />
              )}

              <ArtifactLabPanel
                visualizationMode={visualizationMode}
                onSelectMode={onSelectMode}
                explodedRatio={explodedRatio}
                onChangeExploded={onChangeExploded}
                spatialView={spatialView}
                onChangeSpatialView={onChangeSpatialView}
                components={currentAsset.components}
                selectedComponent={selectedComponent}
                onSelectComponent={onSelectComponent}
              />
            </>
          )}

          {activeTab === 'TELEMETRY' && (
            <TelemetryPanel
              initialTelemetry={currentAsset.initialTelemetry}
              assetId={currentAsset.id}
            />
          )}

          {activeTab === 'AI' && (
            <AiScienceAssistant
              currentAsset={currentAsset}
              selectedComponent={selectedComponent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { nasaAssets } from './data/nasaAssets';
import {
  NasaAsset,
  VisualizationMode,
  SpatialView,
  SpacecraftComponent,
  MissionEvent,
} from './types';
import { ThreeSpaceport } from './components/viewport/ThreeSpaceport';
import { MissionTopNav } from './components/layout/MissionTopNav';
import { LandingExperience } from './components/landing/LandingExperience';
import { ObjectExplorer } from './components/panels/ObjectExplorer';
import { MissionControlRightPanel } from './components/panels/MissionControlRightPanel';
import { MissionTimeline } from './components/panels/MissionTimeline';
import { ApodViewerModal } from './components/modals/ApodViewerModal';
import { ProjectOverviewModal } from './components/modals/ProjectOverviewModal';
import { FloatingArtifactHud } from './components/hud/FloatingArtifactHud';
import { ResearchLabView } from './components/views/ResearchLabView';
import { EducationLabView } from './components/views/EducationLabView';
import { soundManager } from './utils/sound';

export default function App() {
  // Navigation & Screen States
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [activeMainTab, setActiveMainTab] = useState<'CONTROL' | 'RESEARCH' | 'EDUCATION'>('CONTROL');

  // Spacecraft Selection
  const [currentAssetId, setCurrentAssetId] = useState<string>('jwst');
  const currentAsset = nasaAssets.find((a: NasaAsset) => a.id === currentAssetId) || nasaAssets[0];

  // 3D Viewport Controls
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('REALISTIC');
  const [spatialView, setSpatialView] = useState<SpatialView>('SPACECRAFT');
  const [explodedRatio, setExplodedRatio] = useState<number>(0.0);
  const [selectedComponent, setSelectedComponent] = useState<SpacecraftComponent | null>(null);

  // Simulation & Timeline
  const [simulationPlaying, setSimulationPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Panel Visibility
  const [leftDrawerOpen, setLeftDrawerOpen] = useState<boolean>(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState<boolean>(true);

  // Modals
  const [isApodOpen, setIsApodOpen] = useState<boolean>(false);
  const [isProjectOverviewOpen, setIsProjectOverviewOpen] = useState<boolean>(false);

  // Graphics Engine Diagnostics
  const [fps, setFps] = useState<number>(60);
  const [drawCalls, setDrawCalls] = useState<number>(18);
  const [triangles, setTriangles] = useState<number>(14200);

  // Responsive defaults
  useEffect(() => {
    if (window.innerWidth < 768) {
      setLeftDrawerOpen(false);
      setRightDrawerOpen(false);
    }
  }, []);

  const handleSelectAsset = (assetId: string) => {
    setCurrentAssetId(assetId);
    setSelectedComponent(null);
    setSelectedEventId(null);
    setExplodedRatio(0);
  };

  const handleSelectComponent = (comp: SpacecraftComponent | null) => {
    setSelectedComponent(comp);
    if (comp) {
      setSpatialView('COMPONENT');
      if (!rightDrawerOpen) setRightDrawerOpen(true);
    }
  };

  const handleSelectEvent = (event: MissionEvent) => {
    setSelectedEventId(event.id);
  };

  return (
    <div id="nasa-orbital-lab-app" className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none text-slate-100 font-mono-sci">
      {/* 3D WebGL Spaceport Viewport (Persistent Background & Interactive Stage) */}
      <div className="absolute inset-0 z-0">
        <ThreeSpaceport
          currentAsset={currentAsset}
          visualizationMode={visualizationMode}
          spatialView={spatialView}
          explodedRatio={explodedRatio}
          selectedComponentId={selectedComponent?.id || null}
          onSelectComponent={handleSelectComponent}
          simulationPlaying={simulationPlaying}
          simulationSpeed={simulationSpeed}
          onFpsUpdate={(newFps, newCalls, newTris) => {
            setFps(newFps);
            setDrawCalls(newCalls);
            setTriangles(newTris);
          }}
          isLanding={isLanding}
        />
      </div>

      {/* Grid Pattern Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-15 z-10" />

      {/* Top Mission Navigation Bar */}
      <MissionTopNav
        currentAsset={currentAsset}
        onSelectAsset={handleSelectAsset}
        allAssets={nasaAssets}
        fps={fps}
        drawCalls={drawCalls}
        triangles={triangles}
        onOpenApod={() => setIsApodOpen(true)}
        onOpenProjectOverview={() => setIsProjectOverviewOpen(true)}
        activeMainTab={activeMainTab}
        onChangeMainTab={(tab) => {
          setActiveMainTab(tab);
          if (isLanding) setIsLanding(false);
        }}
      />

      {/* MAIN CONTENT ROUTING */}
      {isLanding ? (
        <LandingExperience
          assets={nasaAssets}
          selectedAsset={currentAsset}
          onSelectAsset={handleSelectAsset}
          onEnterMissionControl={() => setIsLanding(false)}
          onOpenProjectOverview={() => setIsProjectOverviewOpen(true)}
        />
      ) : (
        <>
          {activeMainTab === 'CONTROL' && (
            <>
              {/* Left: Object Library Drawer */}
              <ObjectExplorer
                assets={nasaAssets}
                selectedAssetId={currentAsset.id}
                onSelectAsset={(asset) => handleSelectAsset(asset.id)}
                isOpen={leftDrawerOpen}
                onToggle={() => setLeftDrawerOpen(!leftDrawerOpen)}
              />

              {/* Right: Artifact Lab, Telemetry & Gemini AI Specialist */}
              <MissionControlRightPanel
                currentAsset={currentAsset}
                visualizationMode={visualizationMode}
                onSelectMode={setVisualizationMode}
                explodedRatio={explodedRatio}
                onChangeExploded={setExplodedRatio}
                spatialView={spatialView}
                onChangeSpatialView={setSpatialView}
                selectedComponent={selectedComponent}
                onSelectComponent={handleSelectComponent}
                isOpen={rightDrawerOpen}
                onToggle={() => setRightDrawerOpen(!rightDrawerOpen)}
              />

              {/* Center Floating: Artifact Lab Controls & Exploded View Slider */}
              <FloatingArtifactHud
                visualizationMode={visualizationMode}
                onSelectMode={setVisualizationMode}
                explodedRatio={explodedRatio}
                onChangeExploded={setExplodedRatio}
                selectedComponent={selectedComponent}
                onSelectComponent={handleSelectComponent}
                isLanding={isLanding}
              />

              {/* Bottom: Sequence Timeline & Orbit Propagation */}
              <MissionTimeline
                currentAsset={currentAsset}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                simulationPlaying={simulationPlaying}
                onTogglePlay={() => setSimulationPlaying(!simulationPlaying)}
                simulationSpeed={simulationSpeed}
                onChangeSpeed={setSimulationSpeed}
              />
            </>
          )}

          {activeMainTab === 'RESEARCH' && (
            <ResearchLabView
              currentAsset={currentAsset}
              allAssets={nasaAssets}
              onSelectAsset={handleSelectAsset}
              onReturnToViewport={() => setActiveMainTab('CONTROL')}
            />
          )}

          {activeMainTab === 'EDUCATION' && (
            <EducationLabView
              onSelectComponent={(compId) => {
                const found = currentAsset.components.find((c: SpacecraftComponent) => c.id === compId);
                if (found) setSelectedComponent(found);
                setActiveMainTab('CONTROL');
              }}
              onReturnToViewport={() => setActiveMainTab('CONTROL')}
            />
          )}
        </>
      )}

      {/* NASA APOD Experience Modal */}
      <ApodViewerModal
        isOpen={isApodOpen}
        onClose={() => setIsApodOpen(false)}
      />

      {/* Official Project Overview / Submission Briefing Modal */}
      <ProjectOverviewModal
        isOpen={isProjectOverviewOpen}
        onClose={() => setIsProjectOverviewOpen(false)}
      />
    </div>
  );
}

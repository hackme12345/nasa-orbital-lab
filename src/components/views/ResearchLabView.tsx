import React, { useState } from 'react';
import { NasaAsset } from '../../types';
import { Database, Download, Check, Sparkles, Cpu, Layers, ArrowLeftRight, FileText } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ResearchLabViewProps {
  currentAsset: NasaAsset;
  allAssets: NasaAsset[];
  onSelectAsset: (assetId: string) => void;
  onReturnToViewport: () => void;
}

export const ResearchLabView: React.FC<ResearchLabViewProps> = ({
  currentAsset,
  allAssets,
  onSelectAsset,
  onReturnToViewport,
}) => {
  const [compareAssetId, setCompareAssetId] = useState<string>(
    allAssets.find((a) => a.id !== currentAsset.id)?.id || allAssets[0].id
  );
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const compareAsset = allAssets.find((a) => a.id === compareAssetId) || allAssets[0];

  const handleExportJson = () => {
    soundManager.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentAsset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentAsset.id}-scientific-dataset.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div id="view-research-lab" className="absolute inset-0 top-14 z-20 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950/90 backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-sci text-cyan-400 mb-1">
            <Database className="w-4 h-4" />
            <span>NASA SCIENTIFIC DATA ARCHIVE & COMPARATIVE ANALYSIS</span>
          </div>
          <h2 className="font-display-sci font-bold text-2xl text-slate-100">
            RESEARCH LAB // {currentAsset.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-lg glass-panel-accent text-xs font-mono-sci text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 flex items-center gap-1.5 transition-all"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'EXPORTED JSON' : 'EXPORT DATASET (JSON)'}</span>
          </button>

          <button
            onClick={() => {
              onReturnToViewport();
              soundManager.playClick();
            }}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono-sci transition-all"
          >
            RETURN TO 3D COCKPIT
          </button>
        </div>
      </div>

      {/* Comparative Mission Engineering Grid */}
      <div className="p-5 rounded-xl glass-panel border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            <span className="font-display-sci font-bold text-sm text-slate-200">
              CROSS-MISSION ARCHITECTURE COMPARISON
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-sci text-slate-400">
            <span>COMPARE WITH:</span>
            <select
              value={compareAssetId}
              onChange={(e) => setCompareAssetId(e.target.value)}
              className="bg-slate-900 text-cyan-300 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono-sci focus:outline-none"
            >
              {allAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.codeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Asset Card */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-cyan-500/40 space-y-2.5 text-xs font-mono-sci">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-bold text-sm">{currentAsset.name}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                PRIMARY TARGET
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><span className="text-slate-500">CATEGORY:</span> {currentAsset.category}</div>
              <div><span className="text-slate-500">LAUNCH:</span> {currentAsset.launchDate}</div>
              <div><span className="text-slate-500">MASS:</span> {currentAsset.massKg}</div>
              <div><span className="text-slate-500">DESTINATION:</span> {currentAsset.destination.split('—')[0]}</div>
              <div><span className="text-slate-500">STATUS:</span> <span className="text-emerald-400">{currentAsset.operationalStatus}</span></div>
              <div><span className="text-slate-500">POWER:</span> {currentAsset.initialTelemetry.powerLevelPercent}%</div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-slate-400">
              <span className="text-slate-500 block mb-1">SCIENTIFIC PURPOSE:</span>
              <p className="leading-relaxed">{currentAsset.scientificPurpose}</p>
            </div>
          </div>

          {/* Comparison Asset Card */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs font-mono-sci">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-200 font-bold text-sm">{compareAsset.name}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                COMPARISON TARGET
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><span className="text-slate-500">CATEGORY:</span> {compareAsset.category}</div>
              <div><span className="text-slate-500">LAUNCH:</span> {compareAsset.launchDate}</div>
              <div><span className="text-slate-500">MASS:</span> {compareAsset.massKg}</div>
              <div><span className="text-slate-500">DESTINATION:</span> {compareAsset.destination.split('—')[0]}</div>
              <div><span className="text-slate-500">STATUS:</span> <span className="text-emerald-400">{compareAsset.operationalStatus}</span></div>
              <div><span className="text-slate-500">POWER:</span> {compareAsset.initialTelemetry.powerLevelPercent}%</div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-slate-400">
              <span className="text-slate-500 block mb-1">SCIENTIFIC PURPOSE:</span>
              <p className="leading-relaxed">{compareAsset.scientificPurpose}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystem Hardware Breakdown Table */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-display-sci font-bold text-sm text-slate-200">
            ENGINEERING SPECIFICATION // HARDWARE BREAKDOWN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-sci">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">SUBSYSTEM</th>
                <th className="py-2 px-3">COMPONENT</th>
                <th className="py-2 px-3">MATERIAL</th>
                <th className="py-2 px-3">OPERATING TEMP</th>
                <th className="py-2 px-3">FUNCTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {currentAsset.components.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${c.analyticalColor}22`,
                        color: c.analyticalColor,
                        border: `1px solid ${c.analyticalColor}44`,
                      }}
                    >
                      {c.subsystem}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{c.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{c.material}</td>
                  <td className="py-2.5 px-3 text-amber-300">{c.temperatureC}°C</td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{c.function}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

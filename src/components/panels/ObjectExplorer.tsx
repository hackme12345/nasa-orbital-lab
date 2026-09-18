import React, { useState } from 'react';
import { Search, Compass, ShieldCheck, Calendar, MapPin, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { NasaAsset } from '../../types';
import { soundManager } from '../../utils/sound';

interface ObjectExplorerProps {
  assets: NasaAsset[];
  selectedAssetId: string;
  onSelectAsset: (asset: NasaAsset) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ObjectExplorer: React.FC<ObjectExplorerProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'DEEP_SPACE' | 'MARS_EXPLORATION' | 'LEO_ORBIT' | 'LUNAR_HISTORIC'>('ALL');

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = activeCategory === 'ALL' || asset.category === activeCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.mission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      id="panel-object-explorer"
      className={`absolute left-0 top-14 bottom-14 z-20 transition-all duration-300 flex ${
        isOpen ? 'w-80 md:w-96' : 'w-0'
      }`}
    >
      {/* Sliding Glass Drawer */}
      <div
        className={`w-full h-full glass-panel border-r border-cyan-500/20 flex flex-col overflow-hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-display-sci font-bold text-xs tracking-wider text-slate-200">
                NASA OBJECT LIBRARY
              </span>
            </div>
            <span className="text-[10px] font-mono-sci px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {filteredAssets.length} ASSETS
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              id="input-search-objects"
              placeholder="Search missions, spacecraft, targets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 text-xs font-mono-sci text-slate-200 placeholder-slate-500 pl-8 pr-3 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono-sci">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'DEEP_SPACE', label: 'DEEP SPACE' },
              { id: 'MARS_EXPLORATION', label: 'MARS' },
              { id: 'LEO_ORBIT', label: 'LEO' },
              { id: 'LUNAR_HISTORIC', label: 'LUNAR' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  soundManager.playClick();
                }}
                className={`px-2 py-0.5 rounded whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list of NASA assets */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredAssets.map((asset) => {
            const isSelected = asset.id === selectedAssetId;

            return (
              <div
                key={asset.id}
                id={`card-asset-${asset.id}`}
                onClick={() => {
                  onSelectAsset(asset);
                  soundManager.playClick();
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'glass-panel-subtle border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-[10px] font-mono-sci font-bold tracking-widest text-cyan-400">
                      [{asset.codeName}]
                    </span>
                    <h3 className="font-display-sci font-semibold text-sm text-slate-100">
                      {asset.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[9px] font-mono-sci px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      asset.operationalStatus.includes('ACTIVE')
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : asset.operationalStatus.includes('PERMANENT')
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {asset.operationalStatus}
                  </span>
                </div>

                <p className="text-xs font-mono-sci text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                  {asset.scientificPurpose}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono-sci border-t border-slate-800/80 pt-2 text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-500/80 shrink-0" />
                    <span className="truncate">{asset.destination.split('—')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-500/80 shrink-0" />
                    <span className="truncate">{asset.launchDate.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer Toggle Handle */}
      <button
        id="btn-toggle-object-explorer"
        onClick={() => {
          onToggle();
          soundManager.playClick();
        }}
        className="self-center -ml-px w-6 h-14 rounded-r-md glass-panel border-y border-r border-cyan-500/30 flex items-center justify-center text-slate-400 hover:text-cyan-300 transition-colors z-30"
        title={isOpen ? 'Collapse Object Library' : 'Expand Object Library'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
};

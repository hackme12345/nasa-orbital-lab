import React, { useState, useEffect } from 'react';
import { ApodData } from '../../types';
import {
  X,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ApodViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApodViewerModal: React.FC<ApodViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchApod = async (dateStr?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = dateStr ? `/api/nasa/apod?date=${dateStr}` : '/api/nasa/apod';
      const res = await fetch(url);
      const data = await res.json();
      setApod(data);
      if (!selectedDate && data.date) {
        setSelectedDate(data.date);
      }
    } catch (err: any) {
      setError('Unable to fetch imagery from NASA APOD feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchApod();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDateShift = (daysOffset: number) => {
    if (!apod?.date) return;
    const curr = new Date(apod.date);
    curr.setDate(curr.getDate() + daysOffset);
    const newDateStr = curr.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    fetchApod(newDateStr);
    soundManager.playClick();
  };

  return (
    <div
      id="modal-nasa-apod"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel border border-cyan-500/40 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display-sci font-bold text-base text-slate-100 tracking-wide">
                ASTRONOMY PICTURE OF THE DAY
              </h2>
              <p className="text-[11px] font-mono-sci text-cyan-400">
                NASA APOD SCIENTIFIC ARCHIVE FEED
              </p>
            </div>
          </div>

          {/* Date Controls & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-1.5 rounded glass-panel-subtle hover:glass-panel-accent text-slate-300 hover:text-cyan-300 border border-slate-700"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono-sci text-slate-300 px-2">
              {apod?.date || selectedDate || 'TODAY'}
            </span>

            <button
              onClick={() => handleDateShift(1)}
              className="p-1.5 rounded glass-panel-subtle hover:glass-panel-accent text-slate-300 hover:text-cyan-300 border border-slate-700"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                soundManager.playClick();
              }}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-cyan-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-sm font-mono-sci">Receiving high-resolution telemetry from NASA...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono-sci">
              {error}
            </div>
          ) : apod ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Image viewer */}
              <div className="lg:col-span-7 flex flex-col gap-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-[460px]">
                  {apod.media_type === 'video' ? (
                    <iframe
                      src={apod.url}
                      title={apod.title}
                      className="w-full aspect-video rounded"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={apod.hdurl || apod.url}
                      alt={apod.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain max-h-[440px]"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-sci text-slate-400">
                  {apod.copyright && <span>Credit: {apod.copyright}</span>}
                  <a
                    href={apod.hdurl || apod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Full High-Res</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right Column: Title & Explanation */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display-sci font-bold text-lg text-slate-100 mb-2">
                    {apod.title}
                  </h3>
                  <div className="text-xs font-mono-sci text-cyan-400 mb-4 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>OBSERVATION DATE: {apod.date}</span>
                  </div>

                  <p className="text-xs font-mono-sci text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
                    {apod.explanation}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono-sci text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    NASA APOD is curated by professional astronomers to feature the cosmos alongside brief explanations written by astrophysicists.
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

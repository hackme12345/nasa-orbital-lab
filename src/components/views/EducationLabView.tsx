import React, { useState } from 'react';
import { LearningMission } from '../../types';
import { learningMissions } from '../../data/nasaAssets';
import { BookOpen, CheckCircle, ChevronRight, ChevronLeft, Award, HelpCircle } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface EducationLabViewProps {
  onSelectComponent: (componentId: string) => void;
  onReturnToViewport: () => void;
}

export const EducationLabView: React.FC<EducationLabViewProps> = ({
  onSelectComponent,
  onReturnToViewport,
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(learningMissions[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const activeMission = learningMissions.find((m: LearningMission) => m.id === selectedMissionId) || learningMissions[0];
  const activeStep = activeMission.steps[currentStepIndex] || activeMission.steps[0];
  const activeQuiz = activeMission.quiz?.[0];

  const handleNextStep = () => {
    if (currentStepIndex < activeMission.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      const nextComp = activeMission.steps[currentStepIndex + 1].targetComponentId;
      if (nextComp) onSelectComponent(nextComp);
      soundManager.playClick();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      const prevComp = activeMission.steps[currentStepIndex - 1].targetComponentId;
      if (prevComp) onSelectComponent(prevComp);
      soundManager.playClick();
    }
  };

  return (
    <div id="view-education-lab" className="absolute inset-0 top-14 z-20 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950/90 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-sci text-cyan-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>NASA STEM & EDUCATIONAL EXPLORATION MODULE</span>
          </div>
          <h2 className="font-display-sci font-bold text-2xl text-slate-100">
            EDUCATION LAB // GUIDED MISSIONS
          </h2>
        </div>

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

      {/* Guided Mission Track Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {learningMissions.map((m: LearningMission) => {
          const isSelected = m.id === activeMission.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                setSelectedMissionId(m.id);
                setCurrentStepIndex(0);
                soundManager.playClick();
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'glass-panel-subtle border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono-sci mb-1">
                <span className="text-cyan-400 font-semibold">{m.level}</span>
                <span className="text-slate-500">{m.steps.length} STEPS</span>
              </div>
              <h4 className="font-display-sci font-bold text-sm text-slate-100 mb-1">
                {m.title}
              </h4>
              <p className="text-xs font-mono-sci text-slate-400 line-clamp-2 leading-relaxed">
                {m.overview}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Step Walkthrough Container */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/30 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono-sci text-cyan-400 font-bold">
              STEP {currentStepIndex + 1} OF {activeMission.steps.length}
            </span>
            <h3 className="font-display-sci font-bold text-xl text-slate-100 mt-0.5">
              {activeStep.title}
            </h3>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded glass-panel-subtle text-slate-300 disabled:opacity-30 hover:border-cyan-500/40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === activeMission.steps.length - 1}
              className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono-sci disabled:opacity-30 transition-all flex items-center gap-1"
            >
              <span>NEXT STEP</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Explanation Text */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-4">
            <div className="text-xs font-mono-sci text-cyan-300 bg-cyan-950/40 p-3 rounded border border-cyan-500/30">
              <span className="font-bold block text-[10px] text-cyan-400 uppercase mb-1">
                INTERACTIVE ACTION:
              </span>
              {activeStep.instruction}
            </div>

            <p className="text-sm font-mono-sci text-slate-300 leading-relaxed">
              {activeStep.explanation}
            </p>
          </div>

          {/* Interactive Knowledge Check Quiz */}
          {activeQuiz && (
            <div className="md:col-span-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3 text-xs font-mono-sci">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>STEM KNOWLEDGE CHECK</span>
              </div>

              <p className="text-slate-200">
                {activeQuiz.question}
              </p>

              <div className="space-y-1.5 pt-1">
                {activeQuiz.options.map((opt: string, optIdx: number) => {
                  const hasAnswered = quizAnswers[activeQuiz.id] !== undefined;
                  const isSelected = quizAnswers[activeQuiz.id] === optIdx;
                  const isCorrect = optIdx === activeQuiz.correctIndex;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => {
                        setQuizAnswers((prev) => ({ ...prev, [activeQuiz.id]: optIdx }));
                        soundManager.playClick();
                      }}
                      className={`w-full text-left p-2 rounded text-xs transition-all border ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-semibold'
                            : 'bg-red-950/60 border-red-400 text-red-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizAnswers[activeQuiz.id] !== undefined && (
                <div
                  className={`p-2 rounded text-[11px] font-mono-sci ${
                    quizAnswers[activeQuiz.id] === activeQuiz.correctIndex
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                      : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                  }`}
                >
                  {activeQuiz.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

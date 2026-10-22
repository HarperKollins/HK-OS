import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSystemStore } from '../store/systemStore';
import { useActivityStore } from '../store/activityStore';

const EXAM_QUESTIONS = [
  {
    id: 'q1',
    question: 'A projectile is launched at 45° with initial velocity 50 m/s on Earth (g = 9.81 m/s²). What is the maximum range?',
    options: ['254.8 m', '127.4 m', '509.7 m', '180.2 m'],
    correct: 0,
  },
  {
    id: 'q2',
    question: 'Which launch angle produces the maximum range for a projectile on a flat surface?',
    options: ['30°', '45°', '60°', '90°'],
    correct: 1,
  },
  {
    id: 'q3',
    question: 'If gravity on Mars is 3.72 m/s², how does the range of a projectile compare to Earth?',
    options: ['Shorter', 'Same', 'About 2.6× longer', 'About 0.4× shorter'],
    correct: 2,
  },
];

export const ExamOverlay: React.FC = () => {
  const { endExam } = useSystemStore();
  const { addEvent } = useActivityStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? EXAM_QUESTIONS.filter(q => answers[q.id] === q.correct).length
    : 0;

  const handleSubmit = () => {
    setSubmitted(true);
    addEvent('EXAM_SUBMITTED', 'exam', { score, total: EXAM_QUESTIONS.length, answers });
  };

  return (
    <div className="fixed inset-0 z-40 bg-hk-bg/95 backdrop-blur-sm flex flex-col">
      {/* Exam header */}
      <div className="bg-hk-red/10 border-b border-hk-red/30 px-6 py-3 flex items-center gap-3">
        <Shield size={16} className="text-hk-red" />
        <div>
          <p className="text-hk-red font-semibold text-sm">Exam Mode — Projectile Motion Assessment</p>
          <p className="text-hk-muted text-xs">UI-level restriction. Navigate responsibly during assessment.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        {!submitted ? (
          <div className="space-y-6">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-yellow-400 text-xs">This is a demonstration assessment. Complete all questions then submit.</p>
            </div>

            {EXAM_QUESTIONS.map((q, qi) => (
              <div key={q.id} className="bg-hk-surface border border-hk-border rounded-xl p-5">
                <p className="text-white text-sm font-medium mb-4">{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        answers[q.id] === oi
                          ? 'border-hk-blue bg-hk-blue/10 text-white'
                          : 'border-hk-border text-hk-muted hover:border-hk-border/80 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-xs mr-2 text-hk-muted">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < EXAM_QUESTIONS.length}
                className="flex-1 py-3 rounded-xl bg-hk-blue text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hk-blue/90 transition-colors"
              >
                Submit Assessment
              </button>
              <button
                onClick={endExam}
                className="px-5 py-3 rounded-xl border border-hk-border text-hk-muted hover:text-white text-sm transition-colors"
              >
                Exit Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 animate-fadeIn">
            <CheckCircle size={48} className="text-hk-emerald mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Submitted</h2>
            <p className="text-hk-muted mb-6">Score: {score}/{EXAM_QUESTIONS.length} ({Math.round(score/EXAM_QUESTIONS.length*100)}%)</p>
            <div className="space-y-3 text-left max-w-md mx-auto mb-8">
              {EXAM_QUESTIONS.map((q, qi) => (
                <div key={q.id} className={`p-3 rounded-lg border text-sm ${
                  answers[q.id] === q.correct ? 'border-hk-emerald/30 bg-hk-emerald/5' : 'border-hk-red/30 bg-hk-red/5'
                }`}>
                  <p className="text-hk-muted text-xs mb-1">Q{qi+1}: {q.question.slice(0, 60)}...</p>
                  <p className={answers[q.id] === q.correct ? 'text-hk-emerald' : 'text-hk-red'}>
                    Your answer: {q.options[answers[q.id]] ?? 'Not answered'}
                  </p>
                  {answers[q.id] !== q.correct && (
                    <p className="text-hk-emerald">Correct: {q.options[q.correct]}</p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={endExam}
              className="px-8 py-3 rounded-xl bg-hk-emerald text-black font-semibold text-sm hover:bg-hk-emerald/90 transition-colors"
            >
              Return to HK OS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, Pause, Square, SkipForward, SkipBack, CheckCircle, Clock, Trophy, Trash2 } from 'lucide-react';
import { Training, Team, Match, TeamColor } from '../types';

interface Props {
  training: Training;
  onUpdate: (updated: Training) => void;
}

const colorStyles: Record<TeamColor, string> = {
  [TeamColor.Black]: 'bg-slate-900',
  [TeamColor.Blue]: 'bg-blue-600',
  [TeamColor.Red]: 'bg-red-600',
  [TeamColor.Yellow]: 'bg-yellow-400',
  [TeamColor.White]: 'bg-white border border-slate-200',
};

const MatchesSubmodule: React.FC<Props> = ({ training, onUpdate }) => {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  // Replaced NodeJS.Timeout with any to avoid namespace errors in browser environment
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startNewMatch = () => {
    if (!teamAId || !teamBId || teamAId === teamBId) return;

    const newMatch: Match = {
      id: crypto.randomUUID(),
      teamAId,
      teamBId,
      scoreA: 0,
      scoreB: 0,
      timestamp: Date.now(),
      isFinished: false,
      matchLength: training.matchLength * 60,
    };

    setActiveMatch(newMatch);
    setTimeLeft(training.matchLength * 60);
    setIsActive(false);
    setIsCreating(false);
  };

  const updateActiveScore = (side: 'A' | 'B', delta: number) => {
    if (!activeMatch) return;
    const key = side === 'A' ? 'scoreA' : 'scoreB';
    setActiveMatch({
      ...activeMatch,
      [key]: Math.max(0, activeMatch[key] + delta)
    });
  };

  const finishMatch = () => {
    if (!activeMatch) return;
    const finalMatch = { ...activeMatch, isFinished: true };
    onUpdate({
      ...training,
      matches: [finalMatch, ...training.matches]
    });
    setActiveMatch(null);
    setIsActive(false);
  };

  const deleteMatch = (id: string) => {
    if (window.confirm('Remove this match record?')) {
      onUpdate({
        ...training,
        matches: training.matches.filter(m => m.id !== id)
      });
    }
  };

  const getTeamInfo = (id: string) => training.teams.find(t => t.id === id);

  if (activeMatch) {
    const teamA = getTeamInfo(activeMatch.teamAId);
    const teamB = getTeamInfo(activeMatch.teamBId);

    return (
      <div className="space-y-8 max-w-2xl mx-auto py-4">
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
          {/* Subtle Background Icon */}
          <Clock className="absolute -bottom-10 -right-10 text-slate-800 w-48 h-48 -rotate-12" />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums flex items-center gap-4">
              {formatTime(timeLeft)}
              {timeLeft === 0 && <span className="text-xl bg-red-600 px-3 py-1 rounded-lg uppercase tracking-widest animate-pulse">Full Time</span>}
            </div>

            <div className="w-full flex justify-around items-center gap-4">
              <div className="flex flex-col items-center gap-4 flex-1">
                <div className={`w-20 h-20 rounded-2xl shadow-lg border-4 border-slate-700 flex items-center justify-center ${colorStyles[teamA?.color || TeamColor.White]}`}>
                  <span className="font-black text-2xl uppercase">{teamA?.color.charAt(0)}</span>
                </div>
                <div className="text-6xl font-black">{activeMatch.scoreA}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateActiveScore('A', -1)} 
                    className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >-</button>
                  <button 
                    onClick={() => updateActiveScore('A', 1)} 
                    className="px-6 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors"
                  >GOAL</button>
                </div>
              </div>

              <div className="text-slate-500 font-black italic text-4xl">VS</div>

              <div className="flex flex-col items-center gap-4 flex-1">
                <div className={`w-20 h-20 rounded-2xl shadow-lg border-4 border-slate-700 flex items-center justify-center ${colorStyles[teamB?.color || TeamColor.White]}`}>
                  <span className="font-black text-2xl uppercase">{teamB?.color.charAt(0)}</span>
                </div>
                <div className="text-6xl font-black">{activeMatch.scoreB}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateActiveScore('B', -1)} 
                    className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >-</button>
                  <button 
                    onClick={() => updateActiveScore('B', 1)} 
                    className="px-6 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors"
                  >GOAL</button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button onClick={() => setTimeLeft(prev => Math.max(0, prev - 10))} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700"><SkipBack size={24} /></button>
              <button onClick={() => setTimeLeft(prev => prev + 10)} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700"><SkipForward size={24} /></button>
              <button onClick={() => { setTimeLeft(0); setIsActive(false); }} className="p-4 bg-red-600/20 text-red-500 rounded-2xl hover:bg-red-600/30"><Square size={24} fill="currentColor" /></button>
            </div>
          </div>
        </div>

        <button
          onClick={finishMatch}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
        >
          <CheckCircle size={24} />
          Save & Finish Match
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Match History</h3>
        <button
          disabled={training.teams.length < 2}
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={18} />
          New Match
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
          <h4 className="font-bold text-slate-700">Select Teams</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Home Team</label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl"
              >
                <option value="">Select Home Team</option>
                {training.teams.map(t => (
                  <option key={t.id} value={t.id}>Team {t.color} ({t.memberIds.length} players)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Away Team</label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl"
              >
                <option value="">Select Away Team</option>
                {training.teams.map(t => (
                  <option key={t.id} value={t.id}>Team {t.color} ({t.memberIds.length} players)</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600">Cancel</button>
            <button
              disabled={!teamAId || !teamBId || teamAId === teamBId}
              onClick={startNewMatch}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              Kick Off
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {training.matches.map(match => {
          const tA = getTeamInfo(match.teamAId);
          const tB = getTeamInfo(match.teamBId);
          return (
            <div key={match.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex flex-col items-center gap-1 w-20">
                  <div className={`w-8 h-8 rounded-lg shadow-sm border border-slate-200 ${colorStyles[tA?.color || TeamColor.White]}`} />
                  <span className="text-[10px] font-bold uppercase text-slate-500">Home</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center gap-6">
                  <span className={`text-2xl font-black ${match.scoreA > match.scoreB ? 'text-blue-600' : 'text-slate-800'}`}>
                    {match.scoreA}
                  </span>
                  <span className="text-slate-300 font-bold">VS</span>
                  <span className={`text-2xl font-black ${match.scoreB > match.scoreA ? 'text-blue-600' : 'text-slate-800'}`}>
                    {match.scoreB}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 w-20">
                  <div className={`w-8 h-8 rounded-lg shadow-sm border border-slate-200 ${colorStyles[tB?.color || TeamColor.White]}`} />
                  <span className="text-[10px] font-bold uppercase text-slate-500">Away</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1 ml-6 pl-6 border-l border-slate-100">
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button onClick={() => deleteMatch(match.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {training.matches.length === 0 && (
          <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p>No matches recorded for this session yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesSubmodule;

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, Pause, Square, SkipForward, SkipBack, CheckCircle, Clock, Trophy, Trash2, Check, Shield } from 'lucide-react';
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
    setTeamAId('');
    setTeamBId('');
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
          <Clock className="absolute -bottom-10 -right-10 text-slate-800 w-48 h-48 -rotate-12" />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums flex items-center gap-4">
              {formatTime(timeLeft)}
              {timeLeft === 0 && <span className="text-xl bg-red-600 px-3 py-1 rounded-lg uppercase tracking-widest animate-pulse">Full Time</span>}
            </div>

            <div className="w-full flex justify-around items-center gap-4">
              <div className="flex flex-col items-center gap-4 flex-1">
                <div className={`w-20 h-20 rounded-2xl shadow-lg border-4 border-slate-700 flex items-center justify-center ${colorStyles[teamA?.color || TeamColor.White]}`}>
                  <span className={`font-black text-2xl uppercase ${teamA?.color === TeamColor.White ? 'text-slate-900' : 'text-white'}`}>{teamA?.color.charAt(0)}</span>
                </div>
                <div className="text-6xl font-black">{activeMatch.scoreA}</div>
                <div className="flex gap-2">
                  <button onClick={() => updateActiveScore('A', -1)} className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">-</button>
                  <button onClick={() => updateActiveScore('A', 1)} className="px-6 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors">GOAL</button>
                </div>
              </div>

              <div className="text-slate-500 font-black italic text-4xl">VS</div>

              <div className="flex flex-col items-center gap-4 flex-1">
                <div className={`w-20 h-20 rounded-2xl shadow-lg border-4 border-slate-700 flex items-center justify-center ${colorStyles[teamB?.color || TeamColor.White]}`}>
                  <span className={`font-black text-2xl uppercase ${teamB?.color === TeamColor.White ? 'text-slate-900' : 'text-white'}`}>{teamB?.color.charAt(0)}</span>
                </div>
                <div className="text-6xl font-black">{activeMatch.scoreB}</div>
                <div className="flex gap-2">
                  <button onClick={() => updateActiveScore('B', -1)} className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">-</button>
                  <button onClick={() => updateActiveScore('B', 1)} className="px-6 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors">GOAL</button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setIsActive(!isActive)} className={`p-4 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button onClick={() => setTimeLeft(prev => Math.max(0, prev - 10))} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700"><SkipBack size={24} /></button>
              <button onClick={() => setTimeLeft(prev => prev + 10)} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700"><SkipForward size={24} /></button>
              <button onClick={() => { setTimeLeft(0); setIsActive(false); }} className="p-4 bg-red-600/20 text-red-500 rounded-2xl hover:bg-red-600/30"><Square size={24} fill="currentColor" /></button>
            </div>
          </div>
        </div>

        <button onClick={finishMatch} className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
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
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 space-y-10 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* HOME TEAM SELECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Home Team</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                {training.teams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTeamAId(t.id);
                      if (t.id === teamBId) setTeamBId('');
                    }}
                    className={`group relative flex flex-col items-center gap-2 transition-all ${teamAId === t.id ? 'scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all ${colorStyles[t.color]} ${teamAId === t.id ? 'ring-4 ring-blue-500 border-white' : 'border-transparent'}`}>
                      {teamAId === t.id && <Check size={24} className={t.color === TeamColor.White ? 'text-blue-600' : 'text-white'} />}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Team {t.color}</span>
                      <span className="text-[9px] font-bold text-slate-400">{t.memberIds.length} players</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AWAY TEAM SELECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-red-600 rounded-full" />
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Away Team</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                {training.teams.filter(t => t.id !== teamAId).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTeamBId(t.id)}
                    className={`group relative flex flex-col items-center gap-2 transition-all ${teamBId === t.id ? 'scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all ${colorStyles[t.color]} ${teamBId === t.id ? 'ring-4 ring-blue-500 border-white' : 'border-transparent'}`}>
                      {teamBId === t.id && <Check size={24} className={t.color === TeamColor.White ? 'text-blue-600' : 'text-white'} />}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Team {t.color}</span>
                      <span className="text-[9px] font-bold text-slate-400">{t.memberIds.length} players</span>
                    </div>
                  </button>
                ))}
                {training.teams.filter(t => t.id !== teamAId).length === 0 && (
                  <div className="flex items-center gap-2 py-4 text-slate-400 italic text-sm">
                    <Shield size={16} />
                    <span>Select a home team first...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button onClick={() => { setIsCreating(false); setTeamAId(''); setTeamBId(''); }} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">Cancel</button>
            <button
              disabled={!teamAId || !teamBId}
              onClick={startNewMatch}
              className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center gap-2"
            >
              <Play size={18} fill="currentColor" />
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
                  <span className={`text-2xl font-black ${match.scoreA > match.scoreB ? 'text-blue-600' : 'text-slate-800'}`}>{match.scoreA}</span>
                  <span className="text-slate-300 font-bold">VS</span>
                  <span className={`text-2xl font-black ${match.scoreB > match.scoreA ? 'text-blue-600' : 'text-slate-800'}`}>{match.scoreB}</span>
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
        {training.matches.length === 0 && !isCreating && (
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

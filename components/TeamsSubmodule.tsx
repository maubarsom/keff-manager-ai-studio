
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Shield, UserX, XCircle } from 'lucide-react';
import { Training, Team, TeamColor, Participant } from '../types';
import { storageService } from '../services/storageService';

interface Props {
  training: Training;
  onUpdate: (updated: Training) => void;
}

const colorMap: Record<TeamColor, string> = {
  [TeamColor.Black]: 'bg-slate-900 text-white',
  [TeamColor.Blue]: 'bg-blue-600 text-white',
  [TeamColor.Red]: 'bg-red-600 text-white',
  [TeamColor.Yellow]: 'bg-yellow-400 text-slate-900',
  [TeamColor.White]: 'bg-white text-slate-900 border border-slate-200',
};

const TeamsSubmodule: React.FC<Props> = ({ training, onUpdate }) => {
  const [selectedColor, setSelectedColor] = useState<TeamColor | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activePlayerIds, setActivePlayerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const players = storageService.getPlayers();
    setActivePlayerIds(new Set(players.filter(p => !p.isArchived).map(p => p.id)));
  }, []);

  // Identify all participants already assigned to a team in this training
  const assignedPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    training.teams.forEach(team => {
      team.memberIds.forEach(id => ids.add(id));
    });
    return ids;
  }, [training.teams]);

  // Identify colors already used in this training
  const usedColors = useMemo(() => {
    return new Set(training.teams.map(t => t.color));
  }, [training.teams]);

  // Available colors
  const availableColors = useMemo(() => {
    return Object.values(TeamColor).filter(c => !usedColors.has(c));
  }, [usedColors]);

  // Sort participants: unassigned first, then alphabetical
  const sortedParticipants = useMemo(() => {
    return [...training.participants].sort((a, b) => {
      const isAssignedA = assignedPlayerIds.has(a.id);
      const isAssignedB = assignedPlayerIds.has(b.id);

      if (isAssignedA !== isAssignedB) {
        return isAssignedA ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [training.participants, assignedPlayerIds]);

  const availableParticipantsCount = training.participants.filter(p => !assignedPlayerIds.has(p.id)).length;

  const handleStartAdding = () => {
    if (availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
      setIsAdding(true);
    }
  };

  const toggleMemberSelection = (id: string, isAssigned: boolean) => {
    if (isAssigned) return;
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleAddTeam = () => {
    if (selectedMemberIds.length === 0 || !selectedColor) return;

    const newTeam: Team = {
      id: crypto.randomUUID(),
      color: selectedColor,
      memberIds: [...selectedMemberIds]
    };

    onUpdate({
      ...training,
      teams: [...training.teams, newTeam]
    });

    setIsAdding(false);
    setSelectedMemberIds([]);
    setSelectedColor(null);
  };

  const deleteTeam = (id: string) => {
    onUpdate({
      ...training,
      teams: training.teams.filter(t => t.id !== id)
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Training Teams</h3>
          <p className="text-sm text-slate-500">
            {availableParticipantsCount} players available | {availableColors.length} colors left
          </p>
        </div>
        <button
          disabled={availableParticipantsCount === 0 || availableColors.length === 0}
          onClick={handleStartAdding}
          className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-90"
          aria-label="Create Team"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">1. Select Team Color (Unique)</label>
              <div className="flex flex-wrap gap-3">
                {Object.values(TeamColor).map(color => {
                  const isTaken = usedColors.has(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${colorMap[color]} ${
                        selectedColor === color 
                          ? 'ring-4 ring-blue-300 scale-110 shadow-lg z-10' 
                          : isTaken 
                          ? 'opacity-20 cursor-not-allowed grayscale border-slate-200' 
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                      title={isTaken ? `${color} is already taken` : color}
                    >
                      {selectedColor === color && <CheckCircle2 size={24} />}
                      {isTaken && <XCircle size={20} className="text-slate-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="block text-sm font-bold text-slate-700">2. Select Players ({selectedMemberIds.length})</label>
                <span className="text-xs text-slate-400 font-medium">{availableParticipantsCount} available</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar bg-white rounded-xl border border-slate-200 p-2">
                {sortedParticipants.map(p => {
                  const isArchived = !p.isGuest && !activePlayerIds.has(p.id);
                  const isAssigned = assignedPlayerIds.has(p.id);
                  
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isAssigned}
                      onClick={() => toggleMemberSelection(p.id, isAssigned)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                        isAssigned
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed grayscale'
                          : selectedMemberIds.includes(p.id)
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={isArchived ? 'opacity-50' : ''}>
                          {p.name}
                        </span>
                        {isArchived && <span className="text-[10px] bg-slate-100 text-slate-400 px-1 rounded">Archived</span>}
                        {isAssigned && (
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <UserX size={10} /> TAKEN
                          </span>
                        )}
                      </div>
                      {selectedMemberIds.includes(p.id) && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
                {sortedParticipants.length === 0 && (
                  <p className="text-slate-400 italic text-sm p-2 text-center">No participants available in this training.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setSelectedColor(null); }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedMemberIds.length === 0 || !selectedColor}
              onClick={handleAddTeam}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Save Team
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {training.teams.map(team => (
          <div key={team.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className={`p-4 flex items-center justify-between ${colorMap[team.color]}`}>
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <Shield size={20} />
                Team {team.color}
              </div>
              <button
                type="button"
                onClick={() => deleteTeam(team.id)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
                title="Remove Team"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2 flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Members ({team.memberIds.length})</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.memberIds.map(mid => {
                  const p = training.participants.find(part => part.id === mid);
                  const isArchived = !p?.isGuest && !activePlayerIds.has(mid);
                  return (
                    <span key={mid} className={`px-3 py-1 text-xs rounded-full font-semibold border ${
                      isArchived 
                        ? 'bg-slate-50 text-slate-400 border-slate-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {p?.name || 'Unknown'} {isArchived && '(Archived)'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {training.teams.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Shield className="mx-auto mb-3 opacity-20" size={48} />
            <p className="font-medium">No teams created yet.</p>
            <p className="text-sm">Start by creating at least two teams for matches.</p>
          </div>
        )}
        {availableColors.length === 0 && training.teams.length > 0 && !isAdding && (
          <div className="col-span-full p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-sm flex items-center gap-2">
            <UserX size={16} />
            All team colors for this training have been used.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsSubmodule;

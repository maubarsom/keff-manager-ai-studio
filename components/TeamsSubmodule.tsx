
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Shield, UserX, XCircle, Trash, Pencil, X } from 'lucide-react';
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
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [activePlayerIds, setActivePlayerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const players = storageService.getPlayers();
    setActivePlayerIds(new Set(players.filter(p => !p.isArchived).map(p => p.id)));
  }, []);

  // Identify colors already used by OTHER teams (to allow keeping current color while editing)
  const colorsInUseByOthers = useMemo(() => {
    return new Set(
      training.teams
        .filter(t => t.id !== editingTeamId)
        .map(t => t.color)
    );
  }, [training.teams, editingTeamId]);

  // Available colors for the current selection
  const availableColors = useMemo(() => {
    return Object.values(TeamColor).filter(c => !colorsInUseByOthers.has(c));
  }, [colorsInUseByOthers]);

  // Identify participants already assigned to OTHER teams
  const assignedToOtherTeams = useMemo(() => {
    const ids = new Set<string>();
    training.teams.forEach(team => {
      if (team.id !== editingTeamId) {
        team.memberIds.forEach(id => ids.add(id));
      }
    });
    return ids;
  }, [training.teams, editingTeamId]);

  // Sort participants: unassigned (or currently in edited team) first, then alphabetical
  const sortedParticipants = useMemo(() => {
    return [...training.participants].sort((a, b) => {
      const isAssignedA = assignedToOtherTeams.has(a.id);
      const isAssignedB = assignedToOtherTeams.has(b.id);

      if (isAssignedA !== isAssignedB) {
        return isAssignedA ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [training.participants, assignedToOtherTeams]);

  const availableParticipantsCount = training.participants.filter(p => !assignedToOtherTeams.has(p.id)).length;

  const handleStartAdding = () => {
    setEditingTeamId(null);
    setSelectedMemberIds([]);
    if (availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
      setIsAdding(true);
    }
  };

  const handleStartEditing = (team: Team) => {
    setEditingTeamId(team.id);
    setSelectedColor(team.color);
    setSelectedMemberIds([...team.memberIds]);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMemberSelection = (id: string, isAssigned: boolean) => {
    if (isAssigned) return;
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSaveTeam = () => {
    if (selectedMemberIds.length === 0 || !selectedColor) return;

    if (editingTeamId) {
      // Update existing team
      const updatedTeams = training.teams.map(t => 
        t.id === editingTeamId 
          ? { ...t, color: selectedColor, memberIds: [...selectedMemberIds] }
          : t
      );
      onUpdate({ ...training, teams: updatedTeams });
    } else {
      // Create new team
      const newTeam: Team = {
        id: crypto.randomUUID(),
        color: selectedColor,
        memberIds: [...selectedMemberIds]
      };
      onUpdate({ ...training, teams: [...training.teams, newTeam] });
    }

    setIsAdding(false);
    setEditingTeamId(null);
    setSelectedMemberIds([]);
    setSelectedColor(null);
  };

  const deleteTeam = (id: string) => {
    if (window.confirm('Are you sure you want to remove this team?')) {
      onUpdate({
        ...training,
        teams: training.teams.filter(t => t.id !== id)
      });
      if (editingTeamId === id) {
        setIsAdding(false);
        setEditingTeamId(null);
      }
    }
  };

  const clearAllTeams = () => {
    if (training.teams.length === 0) return;
    if (window.confirm('Are you sure you want to remove all teams? This will unassign all players currently in teams for this training.')) {
      onUpdate({
        ...training,
        teams: []
      });
      setIsAdding(false);
      setEditingTeamId(null);
      setSelectedMemberIds([]);
      setSelectedColor(null);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTeamId(null);
    setSelectedColor(null);
    setSelectedMemberIds([]);
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
        <div className="flex items-center gap-3">
          {training.teams.length > 0 && !isAdding && (
            <button
              onClick={clearAllTeams}
              className="flex items-center justify-center gap-2 px-4 h-12 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm"
              title="Clear all teams"
            >
              <Trash size={18} />
              <span className="hidden sm:inline">Clear Teams</span>
            </button>
          )}
          {!isAdding && (
            <button
              disabled={availableParticipantsCount === 0 || availableColors.length === 0}
              onClick={handleStartAdding}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-90"
              aria-label="Create Team"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-blue-100 space-y-6 animate-in slide-in-from-top-4 duration-300 shadow-sm relative">
          <button 
            onClick={handleCancel}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-8 bg-blue-600 rounded-full" />
             <h4 className="text-lg font-black text-slate-800 uppercase tracking-wider">
               {editingTeamId ? 'Edit Team' : 'Add New Team'}
             </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter">1. Select Team Color</label>
              <div className="flex flex-wrap gap-3">
                {Object.values(TeamColor).map(color => {
                  const isTaken = colorsInUseByOthers.has(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${colorMap[color]} ${
                        selectedColor === color 
                          ? 'ring-4 ring-blue-400 scale-110 shadow-lg z-10' 
                          : isTaken 
                          ? 'opacity-20 cursor-not-allowed grayscale border-slate-200' 
                          : 'opacity-60 hover:opacity-100 hover:scale-105 border border-slate-200'
                      }`}
                      title={isTaken ? `${color} is already taken by another team` : color}
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
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter">2. Select Players ({selectedMemberIds.length})</label>
                <span className="text-xs text-slate-400 font-medium">{availableParticipantsCount} available</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar bg-white rounded-xl border border-slate-200 p-2 shadow-inner">
                {sortedParticipants.map(p => {
                  const isArchived = !p.isGuest && !activePlayerIds.has(p.id);
                  const isAssignedToOther = assignedToOtherTeams.has(p.id);
                  const isCurrentlySelected = selectedMemberIds.includes(p.id);
                  
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isAssignedToOther}
                      onClick={() => toggleMemberSelection(p.id, isAssignedToOther)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all ${
                        isAssignedToOther
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed grayscale'
                          : isCurrentlySelected
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={isArchived ? 'opacity-50' : ''}>
                          {p.name}
                        </span>
                        {isArchived && <span className="text-[10px] bg-slate-100 text-slate-400 px-1 rounded">Archived</span>}
                        {isAssignedToOther && (
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <UserX size={10} /> BUSY
                          </span>
                        )}
                      </div>
                      {isCurrentlySelected && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
                {sortedParticipants.length === 0 && (
                  <p className="text-slate-400 italic text-sm p-4 text-center">No participants checked-in yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-slate-600 hover:text-slate-800 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedMemberIds.length === 0 || !selectedColor}
              onClick={handleSaveTeam}
              className="px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              {editingTeamId ? 'Update Team' : 'Save Team'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {training.teams.map(team => (
          <div 
            key={team.id} 
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all ${editingTeamId === team.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'}`}
          >
            <div className={`p-4 flex items-center justify-between ${colorMap[team.color]}`}>
              <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
                <Shield size={18} />
                Team {team.color}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStartEditing(team)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Edit Team"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTeam(team.id)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Remove Team"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Squad Members ({team.memberIds.length})</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {team.memberIds.map(mid => {
                  const p = training.participants.find(part => part.id === mid);
                  const isArchived = !p?.isGuest && !activePlayerIds.has(mid);
                  return (
                    <span key={mid} className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border transition-colors ${
                      isArchived 
                        ? 'bg-slate-50 text-slate-400 border-slate-100' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 group-hover:border-blue-100 group-hover:bg-blue-50/50'
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
            <p className="font-bold text-slate-600">No teams created yet.</p>
            <p className="text-sm">Add teams to start tracking matches for this training.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsSubmodule;


import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { Training, Team, TeamColor, Participant } from '../types';

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
  const [selectedColor, setSelectedColor] = useState<TeamColor>(TeamColor.Blue);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleAddTeam = () => {
    if (selectedMemberIds.length === 0) return;

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
        <h3 className="text-lg font-bold text-slate-800">Training Teams</h3>
        <button
          disabled={training.participants.length === 0}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">1. Select Team Color</label>
              <div className="flex flex-wrap gap-3">
                {Object.values(TeamColor).map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${colorMap[color]} ${
                      selectedColor === color ? 'ring-4 ring-blue-300 scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === color && <CheckCircle2 size={24} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">2. Select Players ({selectedMemberIds.length})</label>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {training.participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => toggleMemberSelection(p.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                      selectedMemberIds.includes(p.id)
                        ? 'bg-blue-100 text-blue-700 font-bold'
                        : 'hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{p.name}</span>
                    {selectedMemberIds.includes(p.id) && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTeam}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm"
            >
              Save Team
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {training.teams.map(team => (
          <div key={team.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
            <div className={`p-4 flex items-center justify-between ${colorMap[team.color]}`}>
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <Shield size={20} />
                Team {team.color}
              </div>
              <button
                onClick={() => deleteTeam(team.id)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Members</p>
              <div className="flex flex-wrap gap-2">
                {team.memberIds.map(mid => {
                  const p = training.participants.find(part => part.id === mid);
                  return (
                    <span key={mid} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                      {p?.name || 'Unknown'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {training.teams.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            No teams created yet. Start by creating at least two teams.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsSubmodule;

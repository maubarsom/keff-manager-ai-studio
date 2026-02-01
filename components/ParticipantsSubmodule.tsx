
import React, { useState, useEffect, useMemo } from 'react';
import { Check, Plus, Trash2, UserCircle, Users, UserPlus, ArrowRight } from 'lucide-react';
import { Training, Player, Participant } from '../types';
import { storageService } from '../services/storageService';

interface Props {
  training: Training;
  onUpdate: (updated: Training) => void;
}

const ParticipantsSubmodule: React.FC<Props> = ({ training, onUpdate }) => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    setAllPlayers(storageService.getPlayers());
  }, []);

  // Roster: Players who are NOT currently participating in this training.
  // Sorted: Non-archived first, then archived, and alphabetically within each group.
  const roster = useMemo(() => 
    allPlayers
      .filter(p => !training.participants.some(participant => participant.id === p.id))
      .sort((a, b) => {
        // First sort by archive status (unarchived first)
        if (a.isArchived !== b.isArchived) {
          return a.isArchived ? 1 : -1;
        }
        // Then sort alphabetically
        return a.displayName.localeCompare(b.displayName);
      }), 
  [allPlayers, training.participants]);

  const addPlayer = (player: Player) => {
    const updatedParticipants = [
      ...training.participants,
      { id: player.id, name: player.displayName, isGuest: false }
    ];
    onUpdate({ ...training, participants: updatedParticipants });
  };

  const addGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newGuest: Participant = {
      id: `guest-${crypto.randomUUID()}`,
      name: guestName.trim(),
      isGuest: true
    };

    onUpdate({
      ...training,
      participants: [...training.participants, newGuest]
    });
    setGuestName('');
  };

  const removeParticipant = (id: string) => {
    onUpdate({
      ...training,
      participants: training.participants.filter(p => p.id !== id)
    });
  };

  const regularsInAttendance = training.participants.filter(p => !p.isGuest);
  const guestsInAttendance = training.participants.filter(p => p.isGuest);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: ROSTER */}
        <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Available Roster</h3>
              <p className="text-xs text-slate-500">{roster.length} players not checked in</p>
            </div>
            <Users size={20} className="text-slate-400" />
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto max-h-[500px] space-y-2 custom-scrollbar">
            {roster.map(player => (
              <button
                key={player.id}
                onClick={() => addPlayer(player)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border border-white bg-white hover:border-blue-300 hover:bg-blue-50/30 text-slate-600 transition-all text-left group ${player.isArchived ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${player.isArchived ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm block">{player.displayName}</span>
                      {player.isArchived && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Archived</span>}
                    </div>
                    {player.fullName && <span className="text-[10px] opacity-60 truncate block max-w-[150px]">{player.fullName}</span>}
                  </div>
                </div>
                <ArrowRight size={16} className={`transition-all transform group-hover:translate-x-1 ${player.isArchived ? 'text-slate-200' : 'text-slate-300 group-hover:text-blue-500'}`} />
              </button>
            ))}
            {roster.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm italic">All active players are checked in.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PARTICIPANTS & GUESTS */}
        <div className="flex flex-col space-y-4">
          
          {/* GUEST ADDITION FORM */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Add Guest Player</h3>
            <form onSubmit={addGuest} className="flex gap-2">
              <div className="relative flex-1">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter guest name..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!guestName.trim()}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="text-sm font-bold">Add</span>
              </button>
            </form>
          </div>

          {/* ATTENDANCE LIST */}
          <div className="flex flex-col flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">In Attendance</h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{regularsInAttendance.length} Regulars</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">{guestsInAttendance.length} Guests</span>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[380px] space-y-2 custom-scrollbar">
              {training.participants.length > 0 ? (
                training.participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${participant.isGuest ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        <UserCircle size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{participant.name}</span>
                        {participant.isGuest && <span className="ml-2 text-[10px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-1 rounded">Guest</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                      title="Remove participant and return to roster"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <UserCircle className="mx-auto mb-3 text-slate-200" size={48} />
                  <p className="text-slate-400 text-sm italic font-medium">Attendance list is empty.</p>
                  <p className="text-slate-300 text-xs mt-1">Select players from the roster or add a guest.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Present</span>
                <span className="text-xl font-black text-slate-800">{training.participants.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsSubmodule;

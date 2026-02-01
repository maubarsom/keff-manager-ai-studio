
import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, UserCircle } from 'lucide-react';
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
    setAllPlayers(storageService.getPlayers().filter(p => !p.isArchived));
  }, []);

  const togglePlayer = (player: Player) => {
    const isAlreadyIn = training.participants.some(p => p.id === player.id);
    let updatedParticipants: Participant[];

    if (isAlreadyIn) {
      updatedParticipants = training.participants.filter(p => p.id !== player.id);
    } else {
      updatedParticipants = [
        ...training.participants,
        { id: player.id, name: player.displayName, isGuest: false }
      ];
    }

    onUpdate({ ...training, participants: updatedParticipants });
  };

  const addGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newGuest: Participant = {
      id: `guest-${crypto.randomUUID()}`,
      name: `${guestName.trim()} (Guest)`,
      isGuest: true
    };

    onUpdate({
      ...training,
      participants: [...training.participants, newGuest]
    });
    setGuestName('');
  };

  const removeGuest = (id: string) => {
    onUpdate({
      ...training,
      participants: training.participants.filter(p => p.id !== id)
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Role Call (Regular Players)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allPlayers.map(player => {
              const isActive = training.participants.some(p => p.id === player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    isActive 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-slate-200 hover:border-blue-300 text-slate-600'
                  }`}
                >
                  <span className="font-medium truncate">{player.displayName}</span>
                  {isActive ? <Check size={18} /> : <div className="w-[18px] h-[18px]" />}
                </button>
              );
            })}
          </div>
          {allPlayers.length === 0 && (
            <p className="text-slate-500 italic">No regular players available. Add them in the Players module.</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Guest Players</h3>
            <form onSubmit={addGuest} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {training.participants.filter(p => p.isGuest).map(guest => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <UserCircle size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700">{guest.name}</span>
                </div>
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-slate-500">
        <span className="font-bold">{training.participants.length} Total Participants</span>
        <span className="text-sm">
          {training.participants.filter(p => !p.isGuest).length} Regulars | {training.participants.filter(p => p.isGuest).length} Guests
        </span>
      </div>
    </div>
  );
};

export default ParticipantsSubmodule;

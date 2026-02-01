
import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Archive, ArchiveRestore, Trash2, Search, Eye, EyeOff, Users, Upload, FileText } from 'lucide-react';
import { Player } from '../types';
import { storageService } from '../services/storageService';

const PlayersModule: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlayers(storageService.getPlayers());
  }, []);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newDisplayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (players.some(p => p.displayName.toLowerCase() === newDisplayName.trim().toLowerCase())) {
      setError('Display name must be unique');
      return;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      displayName: newDisplayName.trim(),
      fullName: newFullName.trim(),
      isArchived: false,
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    storageService.savePlayers(updatedPlayers);
    setIsAdding(false);
    setNewDisplayName('');
    setNewFullName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      const newPlayers: Player[] = [];
      const existingNames = new Set(players.map(p => p.displayName.toLowerCase()));
      const currentNewNames = new Set<string>();

      lines.forEach(line => {
        const parts = line.split(",").map(p => p.trim());
        const displayName = parts[0];
        const fullName = parts[1] || "";

        if (displayName && !existingNames.has(displayName.toLowerCase()) && !currentNewNames.has(displayName.toLowerCase())) {
          newPlayers.push({
            id: crypto.randomUUID(),
            displayName,
            fullName,
            isArchived: false,
          });
          currentNewNames.add(displayName.toLowerCase());
        }
      });

      if (newPlayers.length > 0) {
        const updatedPlayers = [...players, ...newPlayers];
        setPlayers(updatedPlayers);
        storageService.savePlayers(updatedPlayers);
        alert(`Successfully imported ${newPlayers.length} players!`);
      } else {
        alert("No new unique players found in the file. Ensure the format is: DisplayName, FullName");
      }
      
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const toggleArchive = (id: string) => {
    const updatedPlayers = players.map(p => 
      p.id === id ? { ...p, isArchived: !p.isArchived } : p
    );
    setPlayers(updatedPlayers);
    storageService.savePlayers(updatedPlayers);
  };

  const deletePlayer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      const updatedPlayers = players.filter(p => p.id !== id);
      setPlayers(updatedPlayers);
      storageService.savePlayers(updatedPlayers);
    }
  };

  const filteredPlayers = players
    .filter(p => showArchived || !p.isArchived)
    .filter(p => p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || p.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Players Management</h2>
          <p className="text-slate-500">Add and manage your team roster</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
          >
            {showArchived ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="whitespace-nowrap">{showArchived ? 'Hide Archived' : 'Show Archived'}</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            title="Upload CSV (Format: DisplayName, FullName)"
          >
            <Upload size={18} />
            <span className="whitespace-nowrap">Import CSV</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={18} />
            <span className="whitespace-nowrap">Add Player</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddPlayer} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name (Unique)</label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Messi10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Lionel Messi"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Player
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <div
              key={player.id}
              className={`p-4 bg-white rounded-xl border ${player.isArchived ? 'border-slate-100 bg-slate-50' : 'border-slate-200'} shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group`}
            >
              <div className="min-w-0 flex-1 mr-2">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold truncate ${player.isArchived ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {player.displayName}
                  </h3>
                </div>
                {player.fullName && (
                  <p className={`text-sm truncate ${player.isArchived ? 'text-slate-400' : 'text-slate-500'}`}>
                    {player.fullName}
                  </p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => toggleArchive(player.id)}
                  title={player.isArchived ? 'Restore' : 'Archive'}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {player.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                </button>
                <button
                  onClick={() => deletePlayer(player.id)}
                  title="Delete"
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
            {searchTerm ? (
              <>
                <Search className="mx-auto mb-3 text-slate-300" size={48} />
                <p>No players match your search "{searchTerm}"</p>
              </>
            ) : (
              <>
                <Users className="mx-auto mb-3 text-slate-300" size={48} />
                <p>No players found. Add or import players to get started!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersModule;

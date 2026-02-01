
import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Archive, ArchiveRestore, Trash2, Search, Eye, EyeOff, Users, Upload, Plus, Pencil, Check, X } from 'lucide-react';
import { Player } from '../types';
import { storageService } from '../services/storageService';

const PlayersModule: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // New Player Form State
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newFullName, setNewFullName] = useState('');
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editFullName, setEditFullName] = useState('');
  
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Load players on mount
  useEffect(() => {
    const loadedPlayers = storageService.getPlayers();
    setPlayers(loadedPlayers);
  }, []);

  // Save players whenever the state changes (excluding initial empty load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    storageService.savePlayers(players);
  }, [players]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedDisplayName = newDisplayName.trim();
    if (!trimmedDisplayName) {
      setError('Display name is required');
      return;
    }

    if (players.some(p => p.displayName.toLowerCase() === trimmedDisplayName.toLowerCase())) {
      setError('Display name must be unique');
      return;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      displayName: trimmedDisplayName,
      fullName: newFullName.trim(),
      isArchived: false,
    };

    setPlayers(prev => [...prev, newPlayer]);
    setIsAdding(false);
    setNewDisplayName('');
    setNewFullName('');
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditDisplayName(player.displayName);
    setEditFullName(player.fullName);
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDisplayName('');
    setEditFullName('');
    setError('');
  };

  const handleUpdatePlayer = (id: string) => {
    setError('');
    const trimmedDisplayName = editDisplayName.trim();
    
    if (!trimmedDisplayName) {
      setError('Display name is required');
      return;
    }

    if (players.some(p => p.id !== id && p.displayName.toLowerCase() === trimmedDisplayName.toLowerCase())) {
      setError('Display name must be unique');
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, displayName: trimmedDisplayName, fullName: editFullName.trim() } : p
    ));
    setEditingId(null);
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
        setPlayers(prev => [...prev, ...newPlayers]);
        alert(`Successfully imported ${newPlayers.length} players!`);
      } else {
        alert("No new unique players found in the file. Ensure the format is: DisplayName, FullName");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const toggleArchive = (id: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, isArchived: !p.isArchived } : p
    ));
  };

  const deletePlayer = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this player?')) {
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredPlayers = players
    .filter(p => showArchived || !p.isArchived)
    .filter(p => 
      p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Players Management</h2>
          <p className="text-slate-500">Add and manage your team roster</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-90 shrink-0"
          aria-label="Add Player"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-xl transition-all text-sm font-medium ${showArchived ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {showArchived ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="hidden md:inline">{showArchived ? 'Hide Archived' : 'Show Archived'}</span>
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
            className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-sm font-medium"
            title="Import CSV"
          >
            <Upload size={18} />
            <span className="hidden md:inline">Import</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form
            onSubmit={handleAddPlayer}
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Add New Player</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Display Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Messi10"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Full Name (Optional)</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Lionel Messi"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setError(''); }}
                className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md shadow-blue-200"
              >
                Create Player
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <div
              key={player.id}
              className={`p-4 bg-white rounded-2xl border ${player.isArchived ? 'border-slate-100 bg-slate-50' : 'border-slate-200'} shadow-sm flex flex-col justify-between hover:shadow-md transition-all group min-h-[100px]`}
            >
              {editingId === player.id ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="space-y-2">
                    <input
                      type="text"
                      autoFocus
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-bold border border-blue-300 rounded-lg outline-none ring-2 ring-blue-50 focus:ring-blue-100"
                      placeholder="Display Name"
                    />
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none"
                      placeholder="Full Name (Optional)"
                    />
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={() => handleUpdatePlayer(player.id)}
                      className="p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
                      title="Save Changes"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-black text-lg truncate ${player.isArchived ? 'text-slate-400' : 'text-slate-800'}`}>
                        {player.displayName}
                      </h3>
                      {player.fullName && (
                        <p className={`text-xs truncate font-medium ${player.isArchived ? 'text-slate-300' : 'text-slate-500'}`}>
                          {player.fullName}
                        </p>
                      )}
                      {player.isArchived && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-tighter rounded">Archived</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => startEditing(player)}
                      title="Edit Player"
                      className={`p-2 transition-colors rounded-lg ${player.isArchived ? 'text-slate-200' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                      disabled={player.isArchived}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => toggleArchive(player.id)}
                      title={player.isArchived ? 'Restore' : 'Archive'}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-lg"
                    >
                      {player.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                    </button>
                    <button
                      onClick={() => deletePlayer(player.id)}
                      title="Delete Permanently"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            {searchTerm ? (
              <>
                <Search className="mx-auto mb-3 text-slate-300" size={48} />
                <p className="font-bold">No players match your search</p>
                <button onClick={() => setSearchTerm('')} className="text-blue-600 text-sm font-bold mt-2 hover:underline">Clear Search</button>
              </>
            ) : (
              <>
                <Users className="mx-auto mb-3 text-slate-300" size={48} />
                <h3 className="text-lg font-bold text-slate-700">No players found</h3>
                <p className="max-w-xs mx-auto text-sm mt-1">Start by adding players manually or importing a CSV file.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersModule;

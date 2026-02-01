
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Search } from 'lucide-react';
import { Pitch } from '../types';
import { storageService } from '../services/storageService';

const PitchesModule: React.FC = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPitches(storageService.getPitches());
  }, []);

  const handleAddPitch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('Pitch name is required');
      return;
    }

    if (pitches.some(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      setError('Pitch name must be unique');
      return;
    }

    const newPitch: Pitch = {
      id: crypto.randomUUID(),
      name: newName.trim(),
    };

    const updated = [...pitches, newPitch];
    setPitches(updated);
    storageService.savePitches(updated);
    setIsAdding(false);
    setNewName('');
  };

  const deletePitch = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pitch?')) {
      const updated = pitches.filter(p => p.id !== id);
      setPitches(updated);
      storageService.savePitches(updated);
    }
  };

  const filteredPitches = pitches
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pitches Management</h2>
          <p className="text-slate-500">Manage available locations for trainings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search pitches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Pitch</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddPitch} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pitch Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Anfield Road, Pitch 1"
              autoFocus
            />
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
              Save Pitch
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPitches.length > 0 ? (
          filteredPitches.map(pitch => (
            <div
              key={pitch.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{pitch.name}</h3>
              </div>
              <button
                onClick={() => deletePitch(pitch.id)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
            <MapPin className="mx-auto mb-3 text-slate-300" size={48} />
            <p>{searchTerm ? 'No pitches match your search' : 'No pitches added yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchesModule;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar as CalendarIcon, Clock, Trash2, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { Training, Pitch } from '../types';
import { storageService } from '../services/storageService';

const TrainingsModule: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('');
  const [newMatchLength, setNewMatchLength] = useState('4');
  const [error, setError] = useState('');
  
  // Searchable dropdown state
  const [showPitchOptions, setShowPitchOptions] = useState(false);
  const [pitchSearch, setPitchSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setTrainings(storageService.getTrainings());
    setPitches(storageService.getPitches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPitchOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newLocation || !newMatchLength) {
      setError('All fields are required');
      return;
    }

    const newTraining: Training = {
      id: crypto.randomUUID(),
      date: newDate,
      location: newLocation,
      matchLength: parseInt(newMatchLength),
      participants: [],
      teams: [],
      matches: [],
    };

    const updated = [newTraining, ...trainings];
    setTrainings(updated);
    storageService.saveTrainings(updated);
    setIsCreating(false);
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewLocation('');
    setPitchSearch('');
    setNewMatchLength('4');
    navigate(`/trainings/${newTraining.id}`);
  };

  const deleteTraining = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this training session? All match history will be lost.')) {
      const updated = trainings.filter(t => t.id !== id);
      setTrainings(updated);
      storageService.saveTrainings(updated);
    }
  };

  const filteredPitches = pitches.filter(p => 
    p.name.toLowerCase().includes(pitchSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Training Sessions</h2>
          <p className="text-slate-500">Manage matches and teams for each session</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Training
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTraining}
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Setup New Training</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location (Pitch)</label>
              <div 
                className="relative group cursor-text"
                onClick={() => setShowPitchOptions(true)}
              >
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Search or type location..."
                  value={newLocation}
                  onChange={(e) => {
                    setNewLocation(e.target.value);
                    setPitchSearch(e.target.value);
                    setShowPitchOptions(true);
                  }}
                  className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none">
                  {showPitchOptions ? <Search size={16} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {showPitchOptions && (
                <div className="absolute z-[70] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {filteredPitches.length > 0 ? (
                    filteredPitches.map(pitch => (
                      <button
                        key={pitch.id}
                        type="button"
                        onClick={() => {
                          setNewLocation(pitch.name);
                          setShowPitchOptions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-700 flex items-center gap-2 border-b border-slate-50 last:border-0"
                      >
                        <MapPin size={14} className="opacity-50" />
                        <span className="font-medium">{pitch.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-400 text-sm italic">
                      {pitchSearch ? 'No matching pitch found. Type custom name or create a pitch in Pitches module.' : 'No pitches added. Type a location below.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Match Length (mins)</label>
              <input
                type="number"
                required
                min="1"
                value={newMatchLength}
                onChange={(e) => setNewMatchLength(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md shadow-blue-200"
              >
                Start Training
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainings.length > 0 ? (
          trainings.map(training => (
            <div
              key={training.id}
              onClick={() => navigate(`/trainings/${training.id}`)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex justify-between items-start"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <CalendarIcon size={18} />
                  <span>{new Date(training.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{training.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={16} />
                    <span className="text-sm font-medium">{training.matchLength} min matches</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                    {training.participants.length} Participants
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                    {training.matches.length} Matches
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between h-full">
                <button
                  onClick={(e) => deleteTraining(training.id, e)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            <CalendarIcon className="mx-auto mb-4 text-slate-300" size={64} />
            <h3 className="text-lg font-bold text-slate-700">No training sessions yet</h3>
            <p className="max-w-xs mx-auto">Create your first training to start organizing matches and tracking scores.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingsModule;
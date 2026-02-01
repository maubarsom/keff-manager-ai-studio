
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar as CalendarIcon, Clock, Trash2, ChevronRight } from 'lucide-react';
import { Training } from '../types';
import { storageService } from '../services/storageService';

const TrainingsModule: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMatchLength, setNewMatchLength] = useState('10');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setTrainings(storageService.getTrainings());
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                placeholder="Stadium A, Pitch 3"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
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
                  <span>{new Date(training.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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


import React, { useState, useEffect, useRef } from 'react';
import { Save, MapPin, Search, ChevronDown, Calendar, Clock } from 'lucide-react';
import { Training, Pitch } from '../types';
import { storageService } from '../services/storageService';

interface Props {
  training: Training;
  onUpdate: (updated: Training) => void;
}

const GeneralSubmodule: React.FC<Props> = ({ training, onUpdate }) => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [date, setDate] = useState(training.date);
  const [location, setLocation] = useState(training.location);
  const [matchLength, setMatchLength] = useState(training.matchLength.toString());
  const [success, setSuccess] = useState(false);

  // Searchable dropdown state
  const [showPitchOptions, setShowPitchOptions] = useState(false);
  const [pitchSearch, setPitchSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !location || !matchLength) return;

    onUpdate({
      ...training,
      date,
      location,
      matchLength: parseInt(matchLength),
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const filteredPitches = pitches.filter(p =>
    p.name.toLowerCase().includes(pitchSearch.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">General Information</h3>
        <p className="text-slate-500">Edit the basic details for this training session.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Calendar size={16} className="text-slate-400" />
              Training Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Clock size={16} className="text-slate-400" />
              Match Length (minutes)
            </label>
            <input
              type="number"
              required
              min="1"
              value={matchLength}
              onChange={(e) => setMatchLength(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <MapPin size={16} className="text-slate-400" />
            Location (Pitch)
          </label>
          <div
            className="relative group cursor-text"
            onClick={() => setShowPitchOptions(true)}
          >
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="Search or type location..."
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPitchSearch(e.target.value);
                setShowPitchOptions(true);
              }}
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none">
              {showPitchOptions ? <Search size={16} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {showPitchOptions && (
            <div className="absolute z-[70] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {filteredPitches.length > 0 ? (
                filteredPitches.map(pitch => (
                  <button
                    key={pitch.id}
                    type="button"
                    onClick={() => {
                      setLocation(pitch.name);
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
                  {pitchSearch ? 'No matching pitch found. Type custom name or select one above.' : 'No pitches added in Pitches module.'}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {success && (
              <span className="text-green-600 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                Changes saved successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSubmodule;

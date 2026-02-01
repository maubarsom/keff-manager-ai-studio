
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Shield, Trophy, Settings } from 'lucide-react';
import { Training } from '../types';
import { storageService } from '../services/storageService';
import ParticipantsSubmodule from './ParticipantsSubmodule';
import TeamsSubmodule from './TeamsSubmodule';
import MatchesSubmodule from './MatchesSubmodule';
import GeneralSubmodule from './GeneralSubmodule';

type Tab = 'general' | 'participants' | 'teams' | 'matches';

const TrainingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [training, setTraining] = useState<Training | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('participants');

  useEffect(() => {
    if (id) {
      const data = storageService.getTrainingById(id);
      if (data) {
        setTraining(data);
      } else {
        navigate('/trainings');
      }
    }
  }, [id, navigate]);

  const handleUpdate = (updated: Training) => {
    setTraining(updated);
    storageService.updateTraining(updated);
  };

  if (!training) return <div className="p-8 text-center text-slate-500 font-medium">Loading session data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trainings')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0"
            aria-label="Back to trainings"
          >
            <ChevronLeft />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 truncate">{training.location}</h2>
            <p className="text-slate-500 text-sm">{new Date(training.date).toDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 md:px-6 py-3 md:py-4 text-[10px] md:text-sm font-black md:font-bold border-b-2 transition-all uppercase md:normal-case tracking-tighter md:tracking-normal ${
            activeTab === 'general' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Settings size={18} className="md:w-5 md:h-5" />
          General
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 md:px-6 py-3 md:py-4 text-[10px] md:text-sm font-black md:font-bold border-b-2 transition-all uppercase md:normal-case tracking-tighter md:tracking-normal ${
            activeTab === 'participants' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Users size={18} className="md:w-5 md:h-5" />
          Check-in
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 md:px-6 py-3 md:py-4 text-[10px] md:text-sm font-black md:font-bold border-b-2 transition-all uppercase md:normal-case tracking-tighter md:tracking-normal ${
            activeTab === 'teams' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Shield size={18} className="md:w-5 md:h-5" />
          Teams
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 md:px-6 py-3 md:py-4 text-[10px] md:text-sm font-black md:font-bold border-b-2 transition-all uppercase md:normal-case tracking-tighter md:tracking-normal ${
            activeTab === 'matches' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Trophy size={18} className="md:w-5 md:h-5" />
          Matches
        </button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-b-xl shadow-sm border border-t-0 border-slate-200 min-h-[400px]">
        {activeTab === 'general' && (
          <GeneralSubmodule training={training} onUpdate={handleUpdate} />
        )}
        {activeTab === 'participants' && (
          <ParticipantsSubmodule training={training} onUpdate={handleUpdate} />
        )}
        {activeTab === 'teams' && (
          <TeamsSubmodule training={training} onUpdate={handleUpdate} />
        )}
        {activeTab === 'matches' && (
          <MatchesSubmodule training={training} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
};

export default TrainingDetail;

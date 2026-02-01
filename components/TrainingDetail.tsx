
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Removed SwatchesCursor because it is not exported by lucide-react and is not used in the component
import { ChevronLeft, Users, Shield, Trophy } from 'lucide-react';
import { Training } from '../types';
import { storageService } from '../services/storageService';
import ParticipantsSubmodule from './ParticipantsSubmodule';
import TeamsSubmodule from './TeamsSubmodule';
import MatchesSubmodule from './MatchesSubmodule';

type Tab = 'participants' | 'teams' | 'matches';

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

  if (!training) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trainings')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ChevronLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{training.location}</h2>
            <p className="text-slate-500">{new Date(training.date).toDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-white rounded-t-xl">
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'participants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Users size={18} />
          Participants
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'teams' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Shield size={18} />
          Teams
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'matches' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Trophy size={18} />
          Matches
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-sm border border-t-0 border-slate-200 min-h-[400px]">
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

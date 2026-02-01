
import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Users, Calendar, Trophy, MapPin } from 'lucide-react';
import PlayersModule from './components/PlayersModule';
import TrainingsModule from './components/TrainingsModule';
import TrainingDetail from './components/TrainingDetail';
import PitchesModule from './components/PitchesModule';

const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center md:top-0 md:bottom-auto md:border-t-0 md:border-b md:justify-start md:gap-8 z-50">
      <Link to="/players" className="flex flex-col md:flex-row items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors">
        <Users size={20} />
        <span className="text-xs md:text-sm font-medium">Players</span>
      </Link>
      <Link to="/pitches" className="flex flex-col md:flex-row items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors">
        <MapPin size={20} />
        <span className="text-xs md:text-sm font-medium">Pitches</span>
      </Link>
      <Link to="/trainings" className="flex flex-col md:flex-row items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors">
        <Calendar size={20} />
        <span className="text-xs md:text-sm font-medium">Trainings</span>
      </Link>
    </nav>
  );
};

const Header = () => (
  <header className="bg-blue-600 text-white p-4 sticky top-0 md:static z-40">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Trophy size={24} />
        <h1 className="text-xl font-bold tracking-tight">Soccer Tracker</h1>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col pb-20 md:pb-0 md:pt-16 bg-slate-50">
        <Header />
        <Navigation />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/players" element={<PlayersModule />} />
            <Route path="/pitches" element={<PitchesModule />} />
            <Route path="/trainings" element={<TrainingsModule />} />
            <Route path="/trainings/:id" element={<TrainingDetail />} />
            <Route path="/" element={<Navigate to="/trainings" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
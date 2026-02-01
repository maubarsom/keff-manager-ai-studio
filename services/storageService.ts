
import { Player, Training } from '../types';

const PLAYERS_KEY = 'stt_players';
const TRAININGS_KEY = 'stt_trainings';

export const storageService = {
  getPlayers: (): Player[] => {
    const data = localStorage.getItem(PLAYERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePlayers: (players: Player[]) => {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  },
  getTrainings: (): Training[] => {
    const data = localStorage.getItem(TRAININGS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTrainings: (trainings: Training[]) => {
    localStorage.setItem(TRAININGS_KEY, JSON.stringify(trainings));
  },
  getTrainingById: (id: string): Training | undefined => {
    const trainings = storageService.getTrainings();
    return trainings.find(t => t.id === id);
  },
  updateTraining: (updatedTraining: Training) => {
    const trainings = storageService.getTrainings();
    const index = trainings.findIndex(t => t.id === updatedTraining.id);
    if (index !== -1) {
      trainings[index] = updatedTraining;
      storageService.saveTrainings(trainings);
    }
  }
};

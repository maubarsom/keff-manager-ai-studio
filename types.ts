
export interface Player {
  id: string;
  displayName: string;
  fullName: string;
  isArchived: boolean;
}

export interface Participant {
  id: string; // Either player.id or a generated ID for guests
  name: string;
  isGuest: boolean;
}

export enum TeamColor {
  Black = 'black',
  Blue = 'blue',
  Red = 'red',
  Yellow = 'yellow',
  White = 'white'
}

export interface Team {
  id: string;
  color: TeamColor;
  memberIds: string[]; // IDs from the Participant interface
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  timestamp: number;
  isFinished: boolean;
  matchLength: number; // in seconds
}

export interface Training {
  id: string;
  date: string;
  location: string;
  matchLength: number; // in minutes
  participants: Participant[];
  teams: Team[];
  matches: Match[];
}

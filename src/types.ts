export type Winner = 'home' | 'away' | 'draw';

export type Profile = {
  id: string;
  display_name: string;
  is_admin: boolean;
};

export type MatchItem = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  stage: string;
  status: 'scheduled' | 'finished';
  home_score: number | null;
  away_score: number | null;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  predicted_winner: Winner | null;
  points_awarded: number;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  total_points: number;
  exact_hits: number;
  winner_hits: number;
};

export type Pool = {
  id: string;
  name: string;
  code: string;
  is_private: boolean;
  created_by: string;
};

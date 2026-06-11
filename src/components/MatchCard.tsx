import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';
import { MatchItem, Prediction, Winner } from '../types';
import { AppButton } from './AppButton';

type Props = {
  match: MatchItem;
  prediction?: Prediction;
  draftHome: string;
  draftAway: string;
  draftWinner: Winner | null;
  editable: boolean;
  onChangeHome: (value: string) => void;
  onChangeAway: (value: string) => void;
  onChangeWinner: (winner: Winner) => void;
  onSave: () => void;
};

export function MatchCard({
  match,
  prediction,
  draftHome,
  draftAway,
  draftWinner,
  editable,
  onChangeHome,
  onChangeAway,
  onChangeWinner,
  onSave,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.stage}>{match.stage}</Text>
      <Text style={styles.teams}>
        {match.home_team} x {match.away_team}
      </Text>
      <Text style={styles.kickoff}>{new Date(match.kickoff_at).toLocaleString('pt-BR')}</Text>

      {match.status === 'finished' && (
        <Text style={styles.resultText}>
          Resultado oficial: {match.home_score} x {match.away_score}
        </Text>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={draftHome}
          onChangeText={onChangeHome}
          placeholder="Casa"
          keyboardType="number-pad"
          editable={editable}
          style={[styles.input, !editable && styles.inputDisabled]}
          placeholderTextColor={theme.colors.muted}
        />
        <Text style={styles.separator}>x</Text>
        <TextInput
          value={draftAway}
          onChangeText={onChangeAway}
          placeholder="Fora"
          keyboardType="number-pad"
          editable={editable}
          style={[styles.input, !editable && styles.inputDisabled]}
          placeholderTextColor={theme.colors.muted}
        />
      </View>

      <View style={styles.winnerRow}>
        <AppButton title="Casa" onPress={() => onChangeWinner('home')} variant={draftWinner === 'home' ? 'primary' : 'secondary'} />
        <AppButton title="Empate" onPress={() => onChangeWinner('draw')} variant={draftWinner === 'draw' ? 'primary' : 'secondary'} />
        <AppButton title="Fora" onPress={() => onChangeWinner('away')} variant={draftWinner === 'away' ? 'primary' : 'secondary'} />
      </View>

      {prediction && match.status === 'finished' && (
        <Text style={styles.points}>Pontos desta partida: {prediction.points_awarded}</Text>
      )}

      {editable ? <AppButton title="Salvar palpite" onPress={onSave} /> : <Text style={styles.locked}>Partida iniciada. Palpite bloqueado.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stage: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  teams: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  kickoff: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputDisabled: {
    opacity: 0.65,
  },
  separator: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  resultText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  points: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  locked: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  winnerRow: {
    flexDirection: 'row',
    gap: 8,
  },
});

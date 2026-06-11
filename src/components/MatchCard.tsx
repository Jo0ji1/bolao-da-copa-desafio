import { MaterialCommunityIcons } from '@expo/vector-icons';
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
}: Readonly<Props>) {
  const statusLabel = match.status === 'finished' ? 'Encerrada' : 'Aberta para palpite';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.stagePill}>
          <MaterialCommunityIcons name="stadium" size={14} color={theme.colors.primary} />
          <Text style={styles.stage}>{match.stage}</Text>
        </View>
        <View style={[styles.statusPill, match.status === 'finished' ? styles.statusFinished : styles.statusOpen]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.matchLine}>
        <Text style={styles.teams}>
          {match.home_team}
        </Text>
        <View style={styles.vsChip}>
          <Text style={styles.vsText}>x</Text>
        </View>
        <Text style={styles.teams}>
          {match.away_team}
        </Text>
      </View>

      <Text style={styles.kickoff}>{new Date(match.kickoff_at).toLocaleString('pt-BR')}</Text>

      {match.status === 'finished' && (
        <View style={styles.resultBox}>
          <MaterialCommunityIcons name="trophy-outline" size={16} color={theme.colors.success} />
          <Text style={styles.resultText}>
          Resultado oficial: {match.home_score} x {match.away_score}
          </Text>
        </View>
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
        <View style={styles.pointsBox}>
          <MaterialCommunityIcons name="star-four-points" size={16} color={theme.colors.primary} />
          <Text style={styles.points}>Pontos desta partida: {prediction.points_awarded}</Text>
        </View>
      )}

      {editable ? <AppButton title="Salvar palpite" onPress={onSave} /> : <Text style={styles.locked}>Partida iniciada. Palpite bloqueado.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stage: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusOpen: {
    backgroundColor: theme.colors.accentSoft,
  },
  statusFinished: {
    backgroundColor: theme.colors.successSoft,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  matchLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teams: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  kickoff: {
    color: theme.colors.textSoft,
    fontSize: 12,
  },
  vsChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.cardStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: theme.colors.primary,
    fontWeight: '900',
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
    fontWeight: '800',
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
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.successSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});

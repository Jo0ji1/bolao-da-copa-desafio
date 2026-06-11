import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { MatchItem, Prediction, Winner } from '../types';
import { supabase } from '../lib/supabase';
import { AppButton } from '../components/AppButton';
import { MatchCard } from '../components/MatchCard';

type DraftMap = Record<string, { home: string; away: string; winner: Winner | null }>;

export function PredictionsScreen() {
  const { session } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [draft, setDraft] = useState<DraftMap>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    setLoading(true);

    const [{ data: matchesData, error: matchesError }, { data: predictionsData, error: predictionsError }] =
      await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .order('kickoff_at', { ascending: true }),
        supabase
          .from('predictions')
          .select('*')
          .eq('user_id', session.user.id),
      ]);

    if (matchesError || predictionsError) {
      Alert.alert('Erro', matchesError?.message ?? predictionsError?.message ?? 'Falha ao carregar dados.');
      setLoading(false);
      return;
    }

    const newPredictions: Record<string, Prediction> = {};
    const nextDraft: DraftMap = {};

    (predictionsData as Prediction[]).forEach((prediction) => {
      newPredictions[prediction.match_id] = prediction;
      nextDraft[prediction.match_id] = {
        home: prediction.predicted_home_score?.toString() ?? '',
        away: prediction.predicted_away_score?.toString() ?? '',
        winner: prediction.predicted_winner,
      };
    });

    (matchesData as MatchItem[]).forEach((match) => {
      if (!nextDraft[match.id]) {
        nextDraft[match.id] = { home: '', away: '', winner: null };
      }
    });

    setPredictions(newPredictions);
    setDraft(nextDraft);
    setMatches(matchesData as MatchItem[]);
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const savePrediction = async (match: MatchItem) => {
    if (!session?.user.id) {
      return;
    }

    const currentDraft = draft[match.id];
    const home = currentDraft.home ? Number(currentDraft.home) : null;
    const away = currentDraft.away ? Number(currentDraft.away) : null;

    if (home !== null && Number.isNaN(home)) {
      Alert.alert('Valor invalido', 'Placar da casa invalido.');
      return;
    }

    if (away !== null && Number.isNaN(away)) {
      Alert.alert('Valor invalido', 'Placar visitante invalido.');
      return;
    }

    if (home === null && away === null && !currentDraft.winner) {
      Alert.alert('Atenção', 'Informe placar exato ou ao menos vencedor.');
      return;
    }

    const { error } = await supabase.from('predictions').upsert(
      {
        user_id: session.user.id,
        match_id: match.id,
        predicted_home_score: home,
        predicted_away_score: away,
        predicted_winner: currentDraft.winner,
      },
      {
        onConflict: 'user_id,match_id',
      },
    );

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Palpite salvo.');
    await fetchData();
  };

  const scheduleAllReminders = async () => {
    Alert.alert('Lembretes indisponiveis', 'No Expo Go, notificacoes push nao funcionam. Use um development build para habilitar esse recurso.');
  };

  const upcomingCount = useMemo(
    () => matches.filter((match) => match.status === 'scheduled' && new Date(match.kickoff_at) > new Date()).length,
    [matches],
  );

  const finishedCount = useMemo(() => matches.filter((match) => match.status === 'finished').length, [matches]);

  const scoredCount = Object.values(predictions).filter((prediction) => prediction.points_awarded > 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="soccer" size={16} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Palpites ao vivo</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{matches.length} jogos</Text>
          </View>
        </View>
        <Text style={styles.header}>Palpites</Text>
        <Text style={styles.subtitle}>Monte seus palpites antes do kickoff. O sistema bloqueia o jogo quando a partida comeca.</Text>
        <Text style={styles.summary}>{finishedCount}/{matches.length} partidas com resultado oficial</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{upcomingCount}</Text>
            <Text style={styles.metricLabel}>Abertas agora</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{scoredCount}</Text>
            <Text style={styles.metricLabel}>Palpites pontuados</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{matches.length}</Text>
            <Text style={styles.metricLabel}>Total de jogos</Text>
          </View>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.noticeText}>
          Para simplificar o teste no Expo Go, os lembretes push estao desativados nesta versao. O app segue funcional.
        </Text>
      </View>

      <View style={styles.howCard}>
        <Text style={styles.howTitle}>Como apostar</Text>
        <Text style={styles.howText}>1. Preencha placar exato ou apenas o vencedor.</Text>
        <Text style={styles.howText}>2. Salve antes do inicio do jogo.</Text>
        <Text style={styles.howText}>3. Quando o admin publica o resultado, a pontuacao atualiza automaticamente.</Text>
      </View>

      <AppButton title="Ativar lembretes" onPress={scheduleAllReminders} variant="secondary" />

      <FlatList
        style={styles.list}
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} />}
        ListEmptyComponent={
          loading ? <Text style={styles.empty}>Carregando partidas...</Text> : <Text style={styles.empty}>Nenhuma partida cadastrada.</Text>
        }
        renderItem={({ item }) => {
          const itemDraft = draft[item.id] ?? { home: '', away: '', winner: null };
          const isEditable = item.status === 'scheduled' && new Date(item.kickoff_at) > new Date();

          return (
            <MatchCard
              match={item}
              prediction={predictions[item.id]}
              draftHome={itemDraft.home}
              draftAway={itemDraft.away}
              draftWinner={itemDraft.winner}
              editable={isEditable}
              onChangeHome={(value) => setDraft((prev) => ({ ...prev, [item.id]: { ...itemDraft, home: value } }))}
              onChangeAway={(value) => setDraft((prev) => ({ ...prev, [item.id]: { ...itemDraft, away: value } }))}
              onChangeWinner={(winner) => setDraft((prev) => ({ ...prev, [item.id]: { ...itemDraft, winner } }))}
              onSave={() => savePrediction(item)}
            />
          );
        }}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 14,
    gap: 12,
  },
  hero: {
    backgroundColor: theme.colors.card,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: theme.colors.textSoft,
    fontWeight: '700',
    fontSize: 12,
  },
  header: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  subtitle: {
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
  summary: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    color: theme.colors.textSoft,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.cardStrong,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noticeText: {
    color: theme.colors.textSoft,
    flex: 1,
    lineHeight: 19,
  },
  howCard: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 20,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  howTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 2,
  },
  howText: {
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
  notice: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  list: {
    marginTop: 8,
  },
  content: {
    gap: 10,
    paddingBottom: 20,
  },
  empty: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
});

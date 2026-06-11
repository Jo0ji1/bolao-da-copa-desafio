import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { MatchItem, Prediction, Winner } from '../types';
import { supabase } from '../lib/supabase';
import { AppButton } from '../components/AppButton';
import { MatchCard } from '../components/MatchCard';
import { enableLocalNotifications, isExpoGoPushUnsupportedMessage, scheduleMatchReminder } from '../lib/notifications';

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
    const enabled = await enableLocalNotifications();
    if (!enabled) {
      Alert.alert('Aviso', 'Permissao de notificacoes negada.');
      return;
    }

    const upcoming = matches.filter((match) => new Date(match.kickoff_at) > new Date() && match.status === 'scheduled');
    for (const match of upcoming) {
      await scheduleMatchReminder(match.home_team, match.away_team, match.kickoff_at);
    }

    Alert.alert('Lembretes ativos', 'Lembretes locais configurados para as proximas partidas.');
  };

  const title = useMemo(() => {
    const finished = matches.filter((match) => match.status === 'finished').length;
    return `${finished}/${matches.length} partidas com resultado oficial`;
  }, [matches]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Palpites</Text>
      <Text style={styles.subtitle}>{title}</Text>
      <Text style={styles.notice}>{isExpoGoPushUnsupportedMessage()}</Text>
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
    gap: 10,
  },
  header: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
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

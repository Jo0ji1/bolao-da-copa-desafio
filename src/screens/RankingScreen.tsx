import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { LeaderboardRow, Pool } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/AppButton';

export function RankingScreen() {
  const { session } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    const poolMembersQuery = await supabase
      .from('pool_members')
      .select('pool_id, pools(id, name, code, is_private, created_by)')
      .eq('user_id', session.user.id);

    if (poolMembersQuery.error) {
      Alert.alert('Erro', poolMembersQuery.error.message);
      return;
    }

    const myPools = (poolMembersQuery.data ?? [])
      .map((item: any) => item.pools)
      .filter(Boolean) as Pool[];

    setPools(myPools);

    const rankingQuery = selectedPoolId
      ? await supabase.from('leaderboard_by_pool').select('*').eq('pool_id', selectedPoolId).order('total_points', { ascending: false })
      : await supabase.from('leaderboard_overall').select('*').order('total_points', { ascending: false });

    if (rankingQuery.error) {
      Alert.alert('Erro', rankingQuery.error.message);
      return;
    }

    setRows(rankingQuery.data as LeaderboardRow[]);
  }, [selectedPoolId, session?.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ranking</Text>
      <Text style={styles.subtitle}>{selectedPoolId ? 'Ranking do grupo selecionado' : 'Ranking geral da competicao'}</Text>

      <View style={styles.filterRow}>
        <AppButton title="Geral" onPress={() => setSelectedPoolId(null)} variant={selectedPoolId ? 'secondary' : 'primary'} />
        {pools.map((pool) => (
          <AppButton
            key={pool.id}
            title={pool.name}
            onPress={() => setSelectedPoolId(pool.id)}
            variant={selectedPoolId === pool.id ? 'primary' : 'secondary'}
          />
        ))}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.user_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} />}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.position}>{index + 1}o</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.stats}>
                Exatos: {item.exact_hits} | Vencedor: {item.winner_hits}
              </Text>
            </View>
            <Text style={styles.points}>{item.total_points} pts</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sem participantes no ranking.</Text>}
        contentContainerStyle={styles.list}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  row: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  position: {
    color: theme.colors.primary,
    width: 32,
    fontWeight: '800',
  },
  name: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  stats: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  points: {
    color: theme.colors.success,
    fontWeight: '800',
  },
  list: {
    gap: 8,
    paddingBottom: 20,
  },
  empty: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 30,
  },
});

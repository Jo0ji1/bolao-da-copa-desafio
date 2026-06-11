import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="podium" size={16} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Classificacao</Text>
          </View>
          <Text style={styles.heroNote}>{selectedPoolId ? 'Grupo ativo' : 'Visao geral'}</Text>
        </View>
        <Text style={styles.header}>Ranking</Text>
        <Text style={styles.subtitle}>{selectedPoolId ? 'Ranking do grupo selecionado' : 'Ranking geral da competicao'}</Text>
      </View>

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
          <View style={[styles.row, index === 0 && styles.rowLeader]}>
            <View style={styles.positionBox}>
              <Text style={styles.position}>{index + 1}o</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.stats}>
                Exatos: {item.exact_hits} | Vencedor: {item.winner_hits}
              </Text>
            </View>
            <View style={styles.pointsBox}>
              <Text style={styles.points}>{item.total_points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
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
  hero: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  heroNote: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textSoft,
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
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLeader: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardAlt,
  },
  positionBox: {
    minWidth: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  position: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  name: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  stats: {
    color: theme.colors.textSoft,
    fontSize: 12,
  },
  pointsBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  points: {
    color: theme.colors.success,
    fontWeight: '900',
    fontSize: 18,
  },
  pointsLabel: {
    color: theme.colors.textSoft,
    fontSize: 11,
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

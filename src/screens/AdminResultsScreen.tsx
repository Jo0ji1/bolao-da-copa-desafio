import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { MatchItem } from '../types';
import { supabase } from '../lib/supabase';
import { AppButton } from '../components/AppButton';

export function AdminResultsScreen() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [draft, setDraft] = useState<Record<string, { home: string; away: string }>>({});

  const load = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true });

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    setMatches(data as MatchItem[]);

    const initialDraft: Record<string, { home: string; away: string }> = {};
    (data as MatchItem[]).forEach((match) => {
      initialDraft[match.id] = {
        home: match.home_score?.toString() ?? '',
        away: match.away_score?.toString() ?? '',
      };
    });
    setDraft(initialDraft);
  };

  useEffect(() => {
    load();
  }, []);

  const saveResult = async (match: MatchItem) => {
    const d = draft[match.id];
    const home = Number(d.home);
    const away = Number(d.away);

    if (Number.isNaN(home) || Number.isNaN(away)) {
      Alert.alert('Atenção', 'Informe placares válidos.');
      return;
    }

    const { error } = await supabase
      .from('matches')
      .update({ home_score: home, away_score: away, status: 'finished' })
      .eq('id', match.id);

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Resultado oficial atualizado.');
    await load();
  };

  if (!profile?.is_admin) {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="shield-lock-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Acesso restrito</Text>
          </View>
          <Text style={styles.header}>Resultados oficiais</Text>
          <Text style={styles.warning}>
            Somente administradores podem editar resultados. O admin é definido no Supabase com{' '}
            <Text style={styles.code}>profiles.is_admin</Text>.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="clipboard-check-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.badgeText}>Painel do admin</Text>
        </View>
        <Text style={styles.header}>Resultados oficiais</Text>
        <Text style={styles.warning}>
          Atualize os placares aqui. Assim que salvar, a pontuação das apostas é recalculada automaticamente.
        </Text>
      </View>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const d = draft[item.id] ?? { home: '', away: '' };
          return (
            <View style={styles.card}>
              <Text style={styles.teams}>
                {item.home_team} x {item.away_team}
              </Text>
              <Text style={styles.stage}>{item.stage}</Text>
              <View style={styles.row}>
                <TextInput
                  value={d.home}
                  onChangeText={(value) => setDraft((prev) => ({ ...prev, [item.id]: { ...d, home: value } }))}
                  keyboardType="number-pad"
                  placeholder="Casa"
                  placeholderTextColor={theme.colors.muted}
                  style={styles.input}
                />
                <Text style={styles.separator}>x</Text>
                <TextInput
                  value={d.away}
                  onChangeText={(value) => setDraft((prev) => ({ ...prev, [item.id]: { ...d, away: value } }))}
                  keyboardType="number-pad"
                  placeholder="Fora"
                  placeholderTextColor={theme.colors.muted}
                  style={styles.input}
                />
              </View>
              <AppButton title="Salvar resultado" onPress={() => saveResult(item)} />
            </View>
          );
        }}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
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
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  header: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  warning: {
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
  code: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    gap: 8,
  },
  teams: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  stage: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: theme.colors.text,
    paddingVertical: 8,
    textAlign: 'center',
  },
  separator: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});

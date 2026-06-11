import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Pool } from '../types';
import { theme } from '../constants/theme';
import { AppButton } from '../components/AppButton';

export function GroupsScreen() {
  const { session } = useAuth();
  const [myPools, setMyPools] = useState<Pool[]>([]);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const loadPools = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    const { data, error } = await supabase
      .from('pool_members')
      .select('pool_id, pools(id, name, code, is_private, created_by)')
      .eq('user_id', session.user.id);

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    const pools = (data ?? []).map((item: any) => item.pools).filter(Boolean) as Pool[];
    setMyPools(pools);
  }, [session?.user.id]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const createGroup = async () => {
    if (!session?.user.id || !groupName.trim()) {
      Alert.alert('Atenção', 'Informe um nome para o grupo.');
      return;
    }

    const code = Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('pools')
      .insert({
        name: groupName.trim(),
        code,
        is_private: true,
        created_by: session.user.id,
      })
      .select('*')
      .single();

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    await supabase.from('pool_members').insert({ pool_id: data.id, user_id: session.user.id });

    setGroupName('');
    Alert.alert('Grupo criado', `Código do grupo: ${data.code}`);
    await loadPools();
  };

  const joinGroup = async () => {
    if (!session?.user.id || !joinCode.trim()) {
      Alert.alert('Atenção', 'Informe o código do grupo.');
      return;
    }

    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('code', joinCode.trim().toUpperCase())
      .single();

    if (poolError || !pool) {
      Alert.alert('Erro', 'Grupo não encontrado para esse código.');
      return;
    }

    const { error } = await supabase.from('pool_members').upsert({
      pool_id: pool.id,
      user_id: session.user.id,
    });

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    setJoinCode('');
    Alert.alert('Sucesso', `Você entrou no grupo ${pool.name}.`);
    await loadPools();
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="account-group-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Bolao privado</Text>
          </View>
          <Text style={styles.heroNote}>convide amigos com o código</Text>
        </View>
        <Text style={styles.header}>Grupos</Text>
        <Text style={styles.subtitle}>
          Crie bolões privados e acompanhe a disputa somente com as pessoas do seu grupo.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MaterialCommunityIcons name="plus-circle-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>Criar grupo privado</Text>
        </View>
        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Nome do grupo"
          placeholderTextColor={theme.colors.muted}
        />
        <AppButton title="Criar grupo" onPress={createGroup} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MaterialCommunityIcons name="key-variant" size={18} color={theme.colors.accent} />
          <Text style={styles.cardTitle}>Entrar por código</Text>
        </View>
        <TextInput
          style={styles.input}
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="Ex.: ABC123"
          placeholderTextColor={theme.colors.muted}
          autoCapitalize="characters"
        />
        <AppButton title="Entrar" onPress={joinGroup} variant="secondary" />
      </View>

      <View style={styles.sectionRow}>
        <MaterialCommunityIcons name="bookmark-multiple-outline" size={16} color={theme.colors.textSoft} />
        <Text style={styles.section}>Meus grupos</Text>
      </View>
      <FlatList
        data={myPools}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupRow}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupCode}>Código: {item.code}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não participa de grupos.</Text>}
        contentContainerStyle={{ paddingBottom: 24, gap: 8 }}
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
  heroNote: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  header: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  input: {
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  section: {
    color: theme.colors.textSoft,
    fontWeight: '700',
  },
  groupRow: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  groupName: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  groupCode: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  empty: {
    color: theme.colors.textSoft,
    textAlign: 'center',
    marginTop: 20,
  },
});

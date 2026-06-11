import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
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
    Alert.alert('Grupo criado', `Codigo do grupo: ${data.code}`);
    await loadPools();
  };

  const joinGroup = async () => {
    if (!session?.user.id || !joinCode.trim()) {
      Alert.alert('Atenção', 'Informe o codigo do grupo.');
      return;
    }

    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('code', joinCode.trim().toUpperCase())
      .single();

    if (poolError || !pool) {
      Alert.alert('Erro', 'Grupo nao encontrado para esse codigo.');
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
    Alert.alert('Sucesso', `Voce entrou no grupo ${pool.name}.`);
    await loadPools();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grupos</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Criar grupo privado</Text>
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
        <Text style={styles.cardTitle}>Entrar por codigo</Text>
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

      <Text style={styles.section}>Meus grupos</Text>
      <FlatList
        data={myPools}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupRow}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupCode}>Codigo: {item.code}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Voce ainda nao participa de grupos.</Text>}
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
  header: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
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
  section: {
    color: theme.colors.muted,
    marginTop: 4,
  },
  groupRow: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  groupName: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  groupCode: {
    color: theme.colors.primary,
  },
  empty: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 20,
  },
});

import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';
import { AppButton } from '../components/AppButton';

export function ProfileScreen() {
  const { profile, session, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    if (!session?.user.id || !displayName.trim()) {
      Alert.alert('Atenção', 'Informe um nome de exibicao.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      display_name: displayName.trim(),
    });

    if (error) {
      setLoading(false);
      Alert.alert('Erro', error.message);
      return;
    }

    await refreshProfile();
    setLoading(false);
    Alert.alert('Sucesso', 'Perfil atualizado.');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Perfil</Text>
      <Text style={styles.label}>E-mail</Text>
      <Text style={styles.value}>{session?.user.email}</Text>
      <Text style={styles.label}>Nome de exibicao</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Seu nome"
        placeholderTextColor={theme.colors.muted}
      />
      <AppButton title="Salvar perfil" onPress={saveProfile} loading={loading} />
      <AppButton title="Sair" onPress={logout} variant="danger" />
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
  label: {
    color: theme.colors.muted,
    marginTop: 6,
  },
  value: {
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
});

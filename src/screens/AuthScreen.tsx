import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';
import { AppButton } from '../components/AppButton';

type Mode = 'login' | 'register';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        Alert.alert('Erro no login', error.message);
      }
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert('Erro no cadastro', error.message);
      return;
    }

    if (data.user?.id && displayName.trim()) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName.trim(),
      });
    }

    setLoading(false);
    Alert.alert('Conta criada', 'Cadastro realizado. Faça login para entrar.');
    setMode('login');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="trophy-variant" size={18} color={theme.colors.primary} />
            <Text style={styles.heroBadgeText}>Bolao da Copa</Text>
          </View>
          <Text style={styles.title}>Palpite, pontue e dispute com estilo.</Text>
          <Text style={styles.subtitle}>
            Crie sua conta, registre palpites antes do jogo e acompanhe o ranking em tempo real.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-lock-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.cardHeaderText}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
          </View>

          {mode === 'register' && (
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nome de exibicao"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor={theme.colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
            style={styles.input}
          />

          <AppButton
            title={mode === 'login' ? 'Entrar' : 'Criar conta'}
            onPress={handleAuth}
            loading={loading}
          />

          <AppButton
            title={mode === 'login' ? 'Nao tem conta? Cadastre-se' : 'Ja tem conta? Entrar'}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            variant="secondary"
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="scoreboard-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>5 pontos para placar exato</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="target" size={18} color={theme.colors.accent} />
            <Text style={styles.infoText}>3 pontos para acertar o vencedor</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 12,
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: theme.colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: theme.colors.textSoft,
    lineHeight: 21,
  },
  card: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderText: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: theme.colors.textSoft,
    fontWeight: '600',
  },
});

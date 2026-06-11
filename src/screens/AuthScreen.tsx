import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
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
      <View style={styles.container}>
        <Text style={styles.title}>Bolao da Copa</Text>
        <Text style={styles.subtitle}>Palpites, ranking e grupos privados em um so app.</Text>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    marginBottom: 12,
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

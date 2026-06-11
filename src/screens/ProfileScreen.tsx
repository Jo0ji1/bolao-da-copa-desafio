import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';
import { AppButton } from '../components/AppButton';

export function ProfileScreen() {
  const { profile, session, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [loading, setLoading] = useState(false);
  const [showAdminGuide, setShowAdminGuide] = useState(false);

  const saveProfile = async () => {
    if (!session?.user.id || !displayName.trim()) {
      Alert.alert('Atenção', 'Informe um nome de exibição.');
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
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={22} color={theme.colors.primary} />
          </View>
          <View style={[styles.roleBadge, profile?.is_admin ? styles.roleAdmin : styles.roleUser]}>
            <Text style={styles.roleText}>{profile?.is_admin ? 'Administrador' : 'Participante'}</Text>
          </View>
        </View>
        <Text style={styles.header}>Perfil</Text>
        <Text style={styles.subtitle}>
          {profile?.is_admin
            ? 'Você controla os resultados oficiais e o ranking do bolão.'
            : 'Você participa dos palpites e acompanha a pontuação atualizada.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{session?.user.email}</Text>
        <Text style={styles.label}>Nome de exibição</Text>
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

      <View style={styles.tipCard}>
        <MaterialCommunityIcons name="shield-crown-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.tipText}>
          O administrador do sistema é um usuário normal cujo campo <Text style={styles.code}>profiles.is_admin</Text> foi ativado no Supabase.
        </Text>
      </View>

      <View style={styles.adminCard}>
        <View style={styles.adminTop}>
          <Text style={styles.adminTitle}>Como ativar acesso admin</Text>
          <View style={[styles.adminStatus, profile?.is_admin ? styles.adminStatusOn : styles.adminStatusOff]}>
            <Text style={styles.adminStatusText}>{profile?.is_admin ? 'Ativo' : 'Inativo'}</Text>
          </View>
        </View>

        <Text style={styles.adminDescription}>
          O controle é feito no Supabase. Não existe senha separada para admin dentro do app.
        </Text>

        <AppButton
          title={showAdminGuide ? 'Ocultar passo a passo' : 'Ver passo a passo'}
          compact
          variant="secondary"
          onPress={() => setShowAdminGuide((prev) => !prev)}
        />

        {showAdminGuide && (
          <View style={styles.adminGuideBox}>
            <Text style={styles.adminStep}>1. Abra o Supabase SQL Editor.</Text>
            <Text style={styles.adminStep}>2. Rode o comando abaixo para o e-mail do usuário:</Text>
            <Text style={styles.sqlBlock}>
              update public.profiles set is_admin = true where id = (select id from auth.users where email = '{session?.user.email}');
            </Text>
            <Text style={styles.adminStep}>3. Faça logout e login novamente no app.</Text>
            <Text style={styles.adminStep}>4. A aba Resultados oficiais será exibida automaticamente.</Text>
          </View>
        )}
      </View>
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
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleAdmin: {
    backgroundColor: theme.colors.primarySoft,
  },
  roleUser: {
    backgroundColor: theme.colors.accentSoft,
  },
  roleText: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 12,
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
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  label: {
    color: theme.colors.textSoft,
    marginTop: 6,
  },
  value: {
    color: theme.colors.text,
    fontWeight: '700',
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    color: theme.colors.textSoft,
    lineHeight: 19,
  },
  code: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  adminCard: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 10,
  },
  adminTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  adminStatus: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  adminStatusOn: {
    backgroundColor: theme.colors.successSoft,
  },
  adminStatusOff: {
    backgroundColor: theme.colors.dangerSoft,
  },
  adminStatusText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 11,
  },
  adminDescription: {
    color: theme.colors.textSoft,
    lineHeight: 18,
  },
  adminGuideBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    gap: 6,
  },
  adminStep: {
    color: theme.colors.textSoft,
    lineHeight: 18,
  },
  sqlBlock: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 10,
    padding: 8,
    fontWeight: '700',
  },
});

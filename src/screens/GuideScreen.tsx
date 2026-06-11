import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

const steps = [
  {
    icon: 'clock-time-four-outline' as const,
    title: 'Antes do jogo',
    text: 'O participante registra o placar exato ou marca apenas o vencedor da partida.',
  },
  {
    icon: 'trophy-outline' as const,
    title: 'Pontuação',
    text: 'Acerto exato vale 5 pontos. Acertar o vencedor ou o empate vale 3 pontos.',
  },
  {
    icon: 'shield-crown-outline' as const,
    title: 'Controle do admin',
    text: 'Somente o usuario marcado como administrador no Supabase publica resultados oficiais.',
  },
  {
    icon: 'account-group-outline' as const,
    title: 'Grupos privados',
    text: 'Voce pode criar grupos, compartilhar o codigo e disputar com amigos no mesmo bolao.',
  },
];

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'clock-time-four-outline': 'clock-time-four-outline',
  'trophy-outline': 'trophy-outline',
  'shield-crown-outline': 'shield-crown-outline',
  'account-group-outline': 'account-group-outline',
};

export function GuideScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons name="soccer" size={18} color={theme.colors.primary} />
          <Text style={styles.heroBadgeText}>Guia rapido</Text>
        </View>
        <Text style={styles.title}>Como o bolao funciona</Text>
        <Text style={styles.subtitle}>
          O fluxo foi desenhado para deixar claro quem joga, quem administra e como a pontuacao evolui.
        </Text>
      </View>

      <View style={styles.noticeCard}>
        <MaterialCommunityIcons name="shield-crown-outline" size={18} color={theme.colors.accent} />
        <Text style={styles.noticeText}>
          O admin e apenas um usuario comum com permissao especial no Supabase. Se voce nao for admin, esta aba resume tudo que precisa saber.
        </Text>
      </View>

      <View style={styles.grid}>
        {steps.map((step) => (
          <View key={step.title} style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name={iconMap[step.icon] ?? 'help-circle-outline'} size={22} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardText}>{step.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.callout}>
        <MaterialCommunityIcons name="information-outline" size={22} color={theme.colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.calloutTitle}>Admin definido no banco</Text>
          <Text style={styles.calloutText}>
            O administrador é um usuário comum cuja coluna <Text style={styles.code}>profiles.is_admin</Text> foi ativada no Supabase.
            Assim o app não precisa de um login separado para o controle oficial.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 14,
    gap: 14,
  },
  hero: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  heroBadgeText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  subtitle: {
    color: theme.colors.textSoft,
    lineHeight: 21,
  },
  grid: {
    gap: 10,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    color: theme.colors.textSoft,
    lineHeight: 19,
  },
  card: {
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cardText: {
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
  callout: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.cardStrong,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  calloutTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  calloutText: {
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
  code: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});

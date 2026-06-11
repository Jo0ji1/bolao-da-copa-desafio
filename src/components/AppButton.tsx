import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function AppButton({ title, onPress, loading = false, variant = 'primary' }: Props) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={[styles.button, variantStyles[variant], loading && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={theme.colors.text} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
});

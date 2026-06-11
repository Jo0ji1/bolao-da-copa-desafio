import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  compact?: boolean;
};

export function AppButton({ title, onPress, loading = false, variant = 'primary', style, textStyle, compact = false }: Props) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={[styles.button, compact && styles.compact, variantStyles[variant], loading && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={theme.colors.text} /> : <Text style={[styles.text, compact && styles.compactText, textStyle]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  text: {
    color: theme.colors.text,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  compact: {
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  compactText: {
    fontSize: 13,
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

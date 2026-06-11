import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { AuthScreen } from '../screens/AuthScreen';
import { PredictionsScreen } from '../screens/PredictionsScreen';
import { RankingScreen } from '../screens/RankingScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { AdminResultsScreen } from '../screens/AdminResultsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!session ? (
        <AuthScreen />
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.muted,
          }}
        >
          <Tab.Screen name="Palpites" component={PredictionsScreen} />
          <Tab.Screen name="Ranking" component={RankingScreen} />
          <Tab.Screen name="Grupos" component={GroupsScreen} />
          <Tab.Screen name="Resultados" component={AdminResultsScreen} />
          <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

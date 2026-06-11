import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { AuthScreen } from '../screens/AuthScreen';
import { PredictionsScreen } from '../screens/PredictionsScreen';
import { RankingScreen } from '../screens/RankingScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { AdminResultsScreen } from '../screens/AdminResultsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GuideScreen } from '../screens/GuideScreen';

const Tab = createBottomTabNavigator();

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Palpites: 'soccer',
  Ranking: 'podium',
  Grupos: 'account-group',
  Resultados: 'clipboard-check',
  Guia: 'help-circle-outline',
  Perfil: 'account-circle',
};

function renderTabBarIcon(routeName: string) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
    const iconSize = focused ? size + 1 : size;
    return <MaterialCommunityIcons name={iconMap[routeName] ?? 'circle-outline'} size={iconSize} color={color} />;
  };
}

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
  const { session, profile, loading } = useAuth();
  const isAdmin = profile?.is_admin === true;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {session ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
            },
            tabBarItemStyle: {
              paddingVertical: 4,
            },
            tabBarStyle: {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
              height: 64,
              paddingTop: 6,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.muted,
            tabBarIcon: renderTabBarIcon(route.name),
          })}
        >
          <Tab.Screen name="Palpites" component={PredictionsScreen} />
          <Tab.Screen name="Ranking" component={RankingScreen} />
          <Tab.Screen name="Grupos" component={GroupsScreen} />
          {isAdmin ? <Tab.Screen name="Resultados" component={AdminResultsScreen} /> : <Tab.Screen name="Guia" component={GuideScreen} />}
          <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
      ) : (
        <AuthScreen />
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

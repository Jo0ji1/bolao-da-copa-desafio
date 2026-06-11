import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function isExpoGoPushUnsupportedMessage() {
  return 'Este app usa apenas lembretes locais no Expo Go. Para push remoto, use development build.';
}

export async function enableLocalNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function scheduleMatchReminder(homeTeam: string, awayTeam: string, kickoffAt: string) {
  const kickoffDate = new Date(kickoffAt);
  const triggerDate = new Date(kickoffDate.getTime() - 60 * 60 * 1000);

  if (triggerDate <= new Date()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lembrete de palpite',
      body: `${homeTeam} x ${awayTeam} comeca em 1 hora. Registre seu palpite!`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

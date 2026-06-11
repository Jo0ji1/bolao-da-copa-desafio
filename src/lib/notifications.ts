export function isNotificationsAvailableMessage() {
  return 'Notificacoes remotas nao ficam disponiveis no Expo Go. O app permanece funcional sem esse recurso.';
}

export async function enableLocalNotifications() {
  return false;
}

export async function scheduleMatchReminder() {
  return false;
}

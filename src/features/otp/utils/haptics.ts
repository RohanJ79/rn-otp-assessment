import * as Haptics from 'expo-haptics';

function notify(type: Haptics.NotificationFeedbackType) {
  try {
    Haptics.notificationAsync(type).catch(() => undefined);
  } catch {
    // Haptics are a nicety; never let them break the flow (e.g. unsupported device).
  }
}

export const haptics = {
  success: () => notify(Haptics.NotificationFeedbackType.Success),
  error: () => notify(Haptics.NotificationFeedbackType.Error),
};

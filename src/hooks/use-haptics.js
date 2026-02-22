import * as Haptics from 'expo-haptics'
import { FEEDBACK_TYPES } from '@/constants'

const VIBRATION_TYPES = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
}

export function useHaptics() {
    const vibrate = (feedbackType = FEEDBACK_TYPES.ERROR) => {
        Haptics.notificationAsync(VIBRATION_TYPES[feedbackType])
    }

    return { vibrate }
}

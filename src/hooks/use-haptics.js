import * as Haptics from 'expo-haptics'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'
import { VIBRATION_TYPES } from '@/constants/haptics'

export function useHaptics() {
    const vibrate = (feedbackType = FEEDBACK_TYPES.ERROR) => {
        Haptics.notificationAsync(VIBRATION_TYPES[feedbackType])
    }

    return { vibrate }
}

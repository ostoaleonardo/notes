import * as Haptics from 'expo-haptics'

import { FEEDBACK_TYPES } from '@/shared/constants/feedback-types'
import { VIBRATION_TYPES } from '@/shared/constants/haptics'

export function useHaptics() {
    const vibrate = (feedbackType = FEEDBACK_TYPES.ERROR) => {
        Haptics.notificationAsync(VIBRATION_TYPES[feedbackType])
    }

    return { vibrate }
}

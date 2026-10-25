import { memo, useCallback } from 'react'
import { useTheme } from 'react-native-paper'
import { FadeInUp } from 'react-native-reanimated'

import { Option } from '@/screens/settings/option'
import { AnimatedView } from '@/components/animated/animated-view'
import { Checkbox } from '@/components/checkbox'

export const TagOption = memo(function TagOption({ id, tag, onToggle, isSelected }) {
    const { colors } = useTheme()
    const onPress = useCallback(() => onToggle(id), [onToggle, id])

    return (
        <AnimatedView entering={FadeInUp}>
            <Option
                uppercase={false}
                title={tag}
                background={colors.surfaceVariant}
                onPress={onPress}
                rightContent={<Checkbox checked={isSelected} />}
            />
        </AnimatedView>
    )
})

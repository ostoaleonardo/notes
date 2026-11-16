import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { AnimatedView } from '@/ui/animated/animated-view'
import { Touchable } from '@/ui/touchable'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'
import { useGroupPosition } from '@/ui/hooks/use-group-position'
import { getStackedRadiusStyle } from '@/ui/utils/group-position'

import { useLanguage } from '@/hooks/use-language'
import { getFormattedDate } from '@/utils/formatted-date'

import { OPACITY, SPACING } from '@/constants/theme'

export const VersionItem = memo(({ version, onSelect }) => {
    const { colors } = useTheme()
    const { currentLanguage } = useLanguage()
    const position = useGroupPosition()

    const onPress = useCallback(() => onSelect(version), [onSelect, version])

    return (
        <AnimatedView>
            <Touchable
                onPress={onPress}
                accessibilityRole='button'
            >
                <View
                    style={{
                        ...styles.item,
                        backgroundColor: colors.surface,
                        ...getStackedRadiusStyle(position)
                    }}
                >
                    <Typography
                        bold={true}
                        numberOfLines={1}
                    >
                        {version.title}
                    </Typography>
                    <Typography
                        variant='bodySmall'
                        opacity={OPACITY.muted}
                    >
                        {getFormattedDate(version.createdAt, currentLanguage)}
                    </Typography>
                </View>
            </Touchable>
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    item: {
        minWidth: '100%',
        padding: SPACING.xl
    }
})

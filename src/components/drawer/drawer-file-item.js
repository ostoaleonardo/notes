import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { AnimatedView } from '@/ui/animated/animated-view'
import { TreeRow } from '@/ui/tree-row'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { RADIUS, SPACING, OPACITY } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export const DrawerFileItem = memo(({ file, onOpenFile }) => {
    const { colors } = useTheme()

    const onPress = useCallback(() => onOpenFile(file), [onOpenFile, file])

    return (
        <AnimatedView>
            <TreeRow
                label={file.name}
                caption={file.folder}
                expandable={false}
                showSlot={false}
                onPress={onPress}
                trailing={(
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: colors.onBackground + TRANSPARENT[10] }
                        ]}
                    >
                        <Typography
                            variant='bodySmall'
                            opacity={OPACITY.pressed}
                        >
                            {file.extension}
                        </Typography>
                    </View>
                )}
            />
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xxxs,
        borderRadius: RADIUS.sm
    }
})

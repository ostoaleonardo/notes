import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '../typography'

import { RADIUS } from '@/constants/radius'
import { SPACING } from '@/constants/spacing'
import { TRANSPARENT } from '@/constants/themes'

export const DrawerFileItem = memo(function DrawerFileItem({ file, onOpenFile }) {
    const { colors } = useTheme()

    return (
        <AnimatedView>
            <Pressable
                accessibilityRole='button'
                onPress={() => onOpenFile(file)}
                style={styles.container}
            >
                <View style={styles.text}>
                    <Typography numberOfLines={1}>
                        {file.name}
                    </Typography>
                    {!!file.folder && (
                        <Typography
                            variant='caption'
                            opacity={0.5}
                            numberOfLines={1}
                        >
                            {file.folder}
                        </Typography>
                    )}
                </View>
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: colors.onBackground + TRANSPARENT[10] }
                    ]}
                >
                    <Typography
                        variant='caption'
                        opacity={0.7}
                    >
                        {file.extension}
                    </Typography>
                </View>
            </Pressable>
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    container: {
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingLeft: SPACING.sm
    },
    text: {
        flex: 1
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.segment
    }
})

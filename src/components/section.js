import { StyleSheet, View } from 'react-native'

import { PositionGroup } from './position-group'
import { Typography } from './typography'
import { SPACING, OPACITY } from '@/constants/theme'

export function Section({
    title,
    children,
    containerStyle,
    contentStyle,
    visible = true
}) {
    if (!visible) return null

    return (
        <View
            style={{
                ...styles.container,
                ...containerStyle
            }}
        >
            {title && (
                <View style={styles.title}>
                    <Typography
                        uppercase={true}
                        variant='bodySmall'
                        opacity={OPACITY.secondary}
                    >
                        {title}
                    </Typography>
                </View>
            )}

            <View
                style={{
                    ...styles.content,
                    ...contentStyle
                }}
            >
                <PositionGroup>
                    {children}
                </PositionGroup>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.lg
    },
    title: {
        width: '100%',
        paddingHorizontal: SPACING.lg
    },
    content: {
        width: '100%'
    }
})

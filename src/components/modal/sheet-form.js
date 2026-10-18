import { StyleSheet, View } from 'react-native'

import { FilledInput } from '@/components/input/filled-input'
import { Typography } from '@/components/typography'

import { FONTS, SPACING } from '@/constants/theme'

export function SheetForm({ title, children }) {
    return (
        <View style={styles.container}>
            {title && (
                <Typography
                    variant='titleLarge'
                    styleProps={styles.title}
                >
                    {title}
                </Typography>
            )}

            {children}
        </View>
    )
}

export function SheetInput(props) {
    return (
        <View style={styles.field}>
            <FilledInput {...props} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.xl,
        paddingBottom: SPACING.xxl
    },
    title: {
        paddingHorizontal: SPACING.lg,
        fontFamily: FONTS.geistMedium
    },
    field: {
        paddingHorizontal: SPACING.lg
    }
})

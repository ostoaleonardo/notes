import { StyleSheet, View } from 'react-native'

import { FilledTextField } from '@/components/input/filled-text-field'
import { Typography } from '@/components/typography'

import { SPACING } from '@/constants/theme'

export function SheetForm({ title, children }) {
    return (
        <View style={styles.container}>
            {title && (
                <Typography
                    heading
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
            <FilledTextField {...props} />
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
        paddingHorizontal: SPACING.lg
    },
    field: {
        paddingHorizontal: SPACING.lg
    }
})

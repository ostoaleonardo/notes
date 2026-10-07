import { StyleSheet, View } from 'react-native'

import { Section } from '@/components/section'

import { SPACING } from '@/constants/theme'

export function SheetForm({ children }) {
    return <View style={styles.container}>{children}</View>
}

export function SheetField({ title, children }) {
    return (
        <Section
            title={title}
            contentStyle={styles.field}
        >
            {children}
        </Section>
    )
}

export const SHEET_FIELD_STYLE = { paddingHorizontal: SPACING.lg }

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.xxl,
        paddingVertical: SPACING.xxl
    },
    field: SHEET_FIELD_STYLE
})

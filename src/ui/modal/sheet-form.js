import { StyleSheet, View } from 'react-native'

import { FilledTextField } from '@/ui/input/filled-text-field'
import { SheetTitle } from './sheet-title'

import { SPACING } from '@/ui/tokens/theme'

export function SheetForm({ title, children }) {
    return (
        <View style={styles.container}>
            {title && <SheetTitle>{title}</SheetTitle>}

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
        gap: SPACING.md,
        paddingBottom: SPACING.xxl
    },
    field: {
        paddingHorizontal: SPACING.lg
    }
})

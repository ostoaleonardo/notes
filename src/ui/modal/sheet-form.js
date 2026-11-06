import { StyleSheet, View } from 'react-native'

import { FilledTextField } from '@/ui/input/filled-text-field'
import { SheetTitle } from './sheet-title'

import { SPACING } from '@/ui/tokens/theme'

export function SheetForm({ title, footer, children }) {
    return (
        <View style={styles.container}>
            {title && <SheetTitle>{title}</SheetTitle>}

            <View style={styles.body}>
                {children}
            </View>

            {footer}
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
        width: '100%'
    },
    body: {
        gap: SPACING.md
    },
    field: {
        paddingHorizontal: SPACING.lg
    }
})

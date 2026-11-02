import { StyleSheet, View } from 'react-native'

import { FilledTextField } from '@/ui/input/filled-text-field'
import { SheetTitle } from './sheet-title'

import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'

import { SPACING } from '@/ui/tokens/theme'

export function SheetForm({ title, children }) {
    const bottom = useSheetBottomSpacing()

    return (
        <View style={[styles.container, { paddingBottom: bottom }]}>
            {title && <SheetTitle>{title}</SheetTitle>}

            <View style={styles.body}>
                {children}
            </View>
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

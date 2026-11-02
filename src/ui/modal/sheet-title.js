import { StyleSheet } from 'react-native'

import { Typography } from '@/ui/typography'

import { SPACING } from '@/ui/tokens/theme'

export function SheetTitle({ children }) {
    return (
        <Typography
            heading
            variant='titleLarge'
            styleProps={styles.title}
        >
            {children}
        </Typography>
    )
}

const styles = StyleSheet.create({
    title: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md
    }
})

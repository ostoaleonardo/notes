import { StyleSheet } from 'react-native'

import { Typography } from '@/components/typography'

import { SPACING } from '@/constants/theme'

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
        paddingBottom: SPACING.lg
    }
})

import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Typography } from '@/ui/typography'

import { OPACITY, SPACING } from '@/constants/theme'

export const DrawerEmpty = ({ messageKey }) => {
    const { t } = useTranslation()

    return (
        <View style={styles.empty}>
            <Typography opacity={OPACITY.muted}>
                {t(messageKey)}
            </Typography>
        </View>
    )
}

export const DrawerNotesEmpty = () => {
    return <DrawerEmpty messageKey='drawer.empty.notes' />
}

export const DrawerTemplatesEmpty = () => {
    return <DrawerEmpty messageKey='drawer.empty.templates' />
}

export const DrawerTagsEmpty = () => {
    return <DrawerEmpty messageKey='drawer.empty.tags' />
}

export const DrawerFilesEmpty = () => {
    return <DrawerEmpty messageKey='drawer.empty.files' />
}

const styles = StyleSheet.create({
    empty: {
        paddingVertical: SPACING.lg,
        paddingStart: SPACING.sm
    }
})

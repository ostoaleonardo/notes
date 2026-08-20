import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { SwipeableCard, Typography } from '@/components'
import { getGroupedRadius, getPreviewNote } from '@/utils'

export function TemplateItem({ template, onPress, isOpen, onOpen, onDelete, isFirst, isLast }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={onDelete}
        >
            <Pressable
                onPress={onPress}
                style={{
                    ...styles.container,
                    backgroundColor: colors.surface,
                    ...getGroupedRadius(isFirst, isLast)
                }}
            >
                <Typography
                    bold
                    uppercase
                >
                    {t(`templates.${template.name}`, template.name)}
                </Typography>
                <Typography
                    variant='caption'
                    opacity={0.5}
                    numberOfLines={2}
                >
                    {getPreviewNote(template.content) || t('placeholder.note')}
                </Typography>
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: '100%',
        padding: 20,
        gap: 4
    }
})

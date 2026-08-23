import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { AnimatedView, Chip, CloseChipButton, Scroll } from '@/components'
import { useTags, useIconProps } from '@/hooks'
import { Plus } from '@/icons'

export function TagCarousel({ tags, onTags, onTagsModal }) {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const { tags: allTags } = useTags()

    const filteredTags = useMemo(() => allTags.filter((item) =>
        tags.includes(item.id)
    ), [tags, allTags])

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            contentContainerStyle={styles.content}
        >
            {filteredTags.map(({ id, name }) =>
                <Chip
                    key={id}
                    label={name}
                    closeIcon={<CloseChipButton onPress={() => onTags(id)} />}
                >
                    {name}
                </Chip>
            )}

            <AnimatedView>
                <IconButton
                    size={12}
                    mode='outlined'
                    onPress={onTagsModal}
                    icon={() => <Plus {...iconProps} />}
                    accessibilityLabel={t('tags.add')}
                />
            </AnimatedView>
        </Scroll>
    )
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        gap: 8,
        alignItems: 'center',
        paddingHorizontal: 16
    }
})

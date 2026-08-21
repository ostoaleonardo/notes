import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { IconButton } from 'react-native-paper'
import { AnimatedView, Chip, CloseChipButton, Scroll } from '@/components'
import { useCategories, useIconProps } from '@/hooks'
import { Plus } from '@/icons'

export function CategoryCarousel({ categories, onCategories, onCategoriesModal }) {
    const iconProps = useIconProps()
    const { categories: allCategories } = useCategories()

    const filteredCategories = useMemo(() => allCategories.filter((item) =>
        categories.includes(item.id)
    ), [categories, allCategories])

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            contentContainerStyle={styles.content}
        >
            {filteredCategories.map(({ id, name }) =>
                <Chip
                    key={id}
                    label={name}
                    closeIcon={<CloseChipButton onPress={() => onCategories(id)} />}
                >
                    {name}
                </Chip>
            )}

            <AnimatedView>
                <IconButton
                    size={12}
                    mode='outlined'
                    onPress={onCategoriesModal}
                    icon={() => <Plus {...iconProps} />}
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

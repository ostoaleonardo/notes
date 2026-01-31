import { StyleSheet } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { AnimatedView, Chip, CloseChipButton, Scroll } from '@/components'
import { useCategories } from '@/hooks'
import { Plus } from '@/icons'
import { DEFAULT_CATEGORIES } from '@/constants'

export function CategoryCarousel({ selectedCategories, onCategories, onCategoriesModal }) {
    const { colors } = useTheme()
    const { categories } = useCategories()
    const { onBackground } = colors

    const filteredCategories =
        categories.filter(({ id }) => selectedCategories.includes(id) &&
            !DEFAULT_CATEGORIES.map(({ id }) => id).includes(id))

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
                    closeIcon={
                        <CloseChipButton
                            onPress={() => onCategories(id)}
                        />
                    }
                >
                    {name}
                </Chip>
            )}

            <AnimatedView>
                <IconButton
                    size={12}
                    mode='outlined'
                    onPress={onCategoriesModal}
                    icon={() => <Plus color={onBackground} />}
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

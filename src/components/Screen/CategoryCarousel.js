import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Scroll } from '../Scroll'
import { Chip, ChipContent, RemoveChipButton } from '../Chip'
import { useCategories } from '@/hooks'

export function CategoryCarousel({ categoryIds, onAddCategory, onCategoriesModal }) {
    const { t } = useTranslation()
    const { categories } = useCategories()

    return (
        <Scroll
            horizontal
            contentStyle={styles.container}
        >
            {categories.slice(1).map(({ id, name }) =>
                categoryIds.includes(id) && (
                    <Chip
                        key={id}
                        label={name}
                        variant='solid'
                        endContent={
                            <RemoveChipButton
                                onPress={() => onAddCategory(id)}
                            />
                        }
                    />
                )
            )}
            <Chip
                variant='bordered'
                label={t('categories.add')}
                endContent={<ChipContent />}
                onPress={onCategoriesModal}
            />
        </Scroll>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
        flexDirection: 'row',
        paddingHorizontal: 24,
    },
})

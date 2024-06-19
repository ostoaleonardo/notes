import { useTranslation } from 'react-i18next'
import { Chip, ChipContent, RemoveChipButton, Scroll } from '@/components'
import { useCategories } from '@/hooks'
import { DEFAULT_CATEGORIES } from '@/constants'

export function CategoryCarousel({ categoryIds, onAddCategory, onCategoriesModal, disabled = false }) {
    const { t } = useTranslation()
    const { categories } = useCategories()

    const filteredCategories =
        categories.filter(({ id }) => categoryIds.includes(id) &&
            !DEFAULT_CATEGORIES.map(({ id }) => id).includes(id))

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            contentContainerStyle={{
                flexGrow: 1,
                gap: 8,
                paddingHorizontal: 24,
            }}
        >
            {filteredCategories.map(({ id, name }) =>
                <Chip
                    key={id}
                    label={name}
                    variant='flat'
                    endContent={
                        !disabled && (
                            <RemoveChipButton
                                onPress={() => onAddCategory(id)}
                            />
                        )
                    }
                />
            )}

            {!disabled && categories.length && (
                <Chip
                    variant='bordered'
                    label={t('categories.add')}
                    endContent={<ChipContent />}
                    onPress={onCategoriesModal}
                />
            )}
        </Scroll>
    )
}

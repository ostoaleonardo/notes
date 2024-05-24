import { useTranslation } from 'react-i18next'
import { Chip, ChipContent, RemoveChipButton, Scroll } from '@/components'
import { useCategories } from '@/hooks'

export function CategoryCarousel({ categoryIds, onAddCategory, onCategoriesModal, disabled }) {
    const { t } = useTranslation()
    const { categories } = useCategories()

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
            {categories.slice(1).map(({ id, name }) =>
                categoryIds.includes(id) && (
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
                )
            )}

            {!disabled && categories.length > 1 && (
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

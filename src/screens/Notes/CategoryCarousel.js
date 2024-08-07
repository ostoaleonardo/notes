import { useTranslation } from 'react-i18next'
import { Chip, ChipContent, RemoveChipButton, Scroll } from '@/components'
import { useCategories } from '@/hooks'
import { DEFAULT_CATEGORIES } from '@/constants'

export function CategoryCarousel({ selectedCategories, onCategories, onCategoriesModal, disabled = false }) {
    const { t } = useTranslation()
    const { categories } = useCategories()

    const filteredCategories =
        categories.filter(({ id }) => selectedCategories.includes(id) &&
            !DEFAULT_CATEGORIES.map(({ id }) => id).includes(id))

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            contentContainerStyle={{
                flexGrow: 1,
                gap: 8,
                paddingHorizontal: 24
            }}
        >
            {filteredCategories.map(({ id, name }) =>
                <Chip
                    key={id}
                    label={name}
                    endContent={
                        !disabled && (
                            <RemoveChipButton
                                onPress={() => onCategories(id)}
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

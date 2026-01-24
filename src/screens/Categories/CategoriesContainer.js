import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatedList, SwipeableCategory } from '@/components'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export function CategoriesContainer({ onPress }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { categories, deleteCategory } = useCategories()

    const [isOpen, setIsOpen] = useState(null)

    const onDelete = (id) => {
        deleteCategory(id)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <AnimatedList
            gap={2}
            data={categories.slice(1)}
            keyExtractor={({ id }) => id}
            emptyLabel={t('message.noCategories')}
            renderItem={({ item, index }) => {
                const isFirst = index === 0
                const isLast = index === categories.slice(1).length - 1

                return (
                    <SwipeableCategory
                        category={item.name}
                        isOpen={isOpen === item.id}
                        onPress={() => onPress(item.id)}
                        onOpen={() => setIsOpen(item.id)}
                        onDelete={() => onDelete(item.id)}
                        isFirst={isFirst}
                        isLast={isLast}
                    />
                )
            }}
        />
    )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatedList, SwipeableTag } from '@/components'
import { useTags, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export function TagsContainer({ onPress }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { tags, deleteTag } = useTags()

    const [isOpen, setIsOpen] = useState(null)

    const onDelete = (id) => {
        deleteTag(id)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <AnimatedList
            gap={2}
            data={tags}
            keyExtractor={({ id }) => id}
            emptyLabel={t('message.tags.empty')}
            renderItem={({ item, index }) => (
                <SwipeableTag
                    tag={item.name}
                    isOpen={isOpen === item.id}
                    onPress={() => onPress(item.id)}
                    onOpen={() => setIsOpen(item.id)}
                    onDelete={() => onDelete(item.id)}
                    isFirst={index === 0}
                    isLast={index === tags.length - 1}
                />
            )}
        />
    )
}

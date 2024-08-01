import { useTranslation } from 'react-i18next'
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist'
import { BulletedListItem, Button, CheckListItem, NumberedListItem } from '@/components'
import { Cross } from '@/icons'

export function List({ list, setList, onAddItem }) {
    const { t } = useTranslation()
    const { items, type } = list

    const onListChange = (newItem) => {
        setList((prev) => {
            const items = prev.items.map((item) => {
                if (item.id === newItem.id) {
                    return newItem
                }

                return item
            })

            return { ...prev, items }
        })
    }

    const onDeleteItem = (id) => {
        setList((prev) => {
            const items = prev.items.filter((item) => item.id !== id)

            return { ...prev, items }
        })
    }

    return (
        <>
            <NestableDraggableFlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item, isActive, drag, getIndex }) => {
                    const props = {
                        item,
                        isActive,
                        onDrag: drag,
                        onChange: onListChange,
                        onDelete: onDeleteItem,
                        index: getIndex() + 1
                    }

                    switch (type) {
                        case 'bulleted':
                            return <BulletedListItem {...props} />
                        case 'numbered':
                            return <NumberedListItem {...props} />
                        default:
                            return <CheckListItem {...props} />
                    }
                }}
                onDragEnd={({ data }) => setList({ ...list, items: data })}
            />

            <Animated.View
                entering={FadeInUp}
                exiting={FadeOutUp}
                layout={CurvedTransition}
                style={{
                    paddingTop: 16,
                    paddingHorizontal: 24
                }}
            >
                <Button
                    variant='flat'
                    label={t('list.add')}
                    onPress={() => onAddItem(type)}
                    startContent={<Cross />}
                />
            </Animated.View>
        </>
    )
}

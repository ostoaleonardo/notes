import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { AnimatedView, BulletedListItem, CheckListItem, NumberedListItem, Pressable } from '@/components'
import { Plus } from '@/icons'

export function List({ list, setList, onAddItem }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
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

            return {
                items,
                type: items.length > 0 ? prev.type : ''
            }
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

            <AnimatedView
                entering={FadeInUp}
                exiting={FadeOutUp}
                style={{
                    paddingTop: 16,
                    paddingHorizontal: 24
                }}
            >
                <Pressable
                    mode='contained-tonal'
                    onPress={() => onAddItem(type)}
                    icon={() => <Plus color={colors.onBackground} />}
                >
                    {t('list.add')}
                </Pressable>
            </AnimatedView>
        </>
    )
}

import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist'
import { AnimatedView, BulletedListItem, CheckListItem, NumberedListItem, Pressable } from '@/components'
import { Plus } from '@/icons'
import { useList } from '@/hooks/useList'

export function List({ list, setList }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { items, type } = list

    const { onAddItem, onDeleteItem, onListChange } = useList(list, setList)

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
                        onDelete: () => onDeleteItem(item.id),
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
                style={{ paddingTop: 16, paddingHorizontal: 16 }}
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

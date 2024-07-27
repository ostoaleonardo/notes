import { useTranslation } from 'react-i18next'
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { NestableDraggableFlatList } from 'react-native-draggable-flatlist'
import { Button, CheckBoxItem } from '@/components'
import { Cross } from '@/icons'

export function CheckBoxList({ list, setList, onAddItem }) {
    const { t } = useTranslation()

    const onListChange = (newItem) => {
        setList(list.map((item) => {
            if (item.id === newItem.id) {
                return newItem
            }

            return item
        }))
    }

    const onDeleteItem = (id) => {
        setList(list.filter((item) => item.id !== id))
    }

    return (
        <>
            <NestableDraggableFlatList
                data={list}
                keyExtractor={(item) => item.id}
                renderItem={({ item, isActive, drag }) => (
                    <CheckBoxItem
                        item={item}
                        onDrag={drag}
                        isActive={isActive}
                        onChange={onListChange}
                        onDelete={onDeleteItem}
                    />
                )}
                onDragEnd={({ data }) => setList(data)}
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
                    label={t('button.addItem')}
                    onPress={onAddItem}
                    startContent={<Cross />}
                />
            </Animated.View>
        </>
    )
}

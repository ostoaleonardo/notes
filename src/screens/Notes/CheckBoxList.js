import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { Button, CheckBoxItem } from '@/components'
import { Cross } from '@/icons'

export function CheckBoxList({ list, setList, onAddItem }) {
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
            {list.map((item) => (
                <CheckBoxItem
                    key={item.id}
                    item={item}
                    onChange={onListChange}
                    onDelete={onDeleteItem}
                />
            ))}

            <Animated.View
                layout={CurvedTransition}
                entering={FadeInUp}
                exiting={FadeOutUp}
                style={{
                    paddingTop: 16,
                    alignItems: 'flex-start'
                }}
            >
                <Button
                    variant='flat'
                    label='Add item to list'
                    onPress={onAddItem}
                    startContent={<Cross />}
                />
            </Animated.View>
        </>
    )
}

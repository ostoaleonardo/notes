import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { ListContainer } from './list-container'

export function BulletedItem({ item, onDrag, onChange, onDelete, isActive }) {
    const { colors } = useTheme()
    const { onBackground } = colors

    return (
        <ListContainer
            item={item}
            onDrag={onDrag}
            onChange={onChange}
            onDelete={onDelete}
            isActive={isActive}
        >
            <View
                style={{
                    ...styles.bullet,
                    backgroundColor: onBackground
                }}
            />
        </ListContainer>
    )
}

const styles = StyleSheet.create({
    bullet: {
        width: 8,
        height: 8,
        marginRight: 8,
        borderRadius: 4
    }
})

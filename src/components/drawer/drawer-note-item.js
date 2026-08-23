import { Pressable, StyleSheet } from 'react-native'
import { Typography } from '../typography'

export function DrawerNoteItem({ note, depth, active, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                ...styles.container,
                paddingLeft: 16 + depth * 16
            }}
        >
            <Typography
                bold={active}
                numberOfLines={1}
            >
                {note.title}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 6,
        paddingRight: 16
    }
})

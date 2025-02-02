import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SwipeableCard } from '../SwipeableCard'
import { Typography } from '../../Typography'

export function SwipeableCategory({ category, onPress, isOpen, onOpen, onDelete }) {
    const { colors } = useTheme()

    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={onDelete}
        >
            <Pressable
                onPress={onPress}
                style={{
                    ...styles.container,
                    backgroundColor: colors.surface
                }}
            >
                <Typography>
                    {category}
                </Typography>
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: '100%',
        padding: 20,
        borderRadius: 16
    }
})

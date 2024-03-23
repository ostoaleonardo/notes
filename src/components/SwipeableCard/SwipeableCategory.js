import { Pressable, StyleSheet } from 'react-native'
import { SwipeableCard } from './SwipeableCard'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function SwipeableCategory({ category, onPress, isOpen, onOpen, onDelete }) {
    return (
        <SwipeableCard
            isOpen={isOpen}
            onOpen={onOpen}
            onDelete={onDelete}
        >
            <Pressable
                onPress={onPress}
                style={styles.pressableContainer}
            >
                <Typography>
                    {category}
                </Typography>
            </Pressable>
        </SwipeableCard>
    )
}

const styles = StyleSheet.create({
    pressableContainer: {
        minWidth: '100%',
        padding: 20,
        borderRadius: 16,
        backgroundColor: colors.foreground,
    },
})

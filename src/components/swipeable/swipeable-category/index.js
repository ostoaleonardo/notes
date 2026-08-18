import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { SwipeableCard } from '../swipeable-card'
import { Typography } from '../../typography'
import { COMMONS } from '@/constants'

export function SwipeableCategory({ category, onPress, isOpen, onOpen, onDelete, isFirst, isLast }) {
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
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: isFirst ? COMMONS.radius : 0,
                    borderTopRightRadius: isFirst ? COMMONS.radius : 0,
                    borderBottomLeftRadius: isLast ? COMMONS.radius : 0,
                    borderBottomRightRadius: isLast ? COMMONS.radius : 0
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
        padding: 20
    }
})

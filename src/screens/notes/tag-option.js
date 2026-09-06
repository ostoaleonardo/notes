import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FadeInUp } from 'react-native-reanimated'

import { AnimatedView } from '@/components/animated/animated-view'
import { Checkbox } from '@/components/checkbox'
import { Typography } from '@/components/typography'

import { TRANSPARENT } from '@/constants/themes'

export function TagOption({ tag, onPress, isSelected }) {
    const { colors } = useTheme()
    const { onBackground } = colors

    return (
        <AnimatedView
            entering={FadeInUp}
        >
            <Pressable
                onPress={onPress}
                style={styles.container}
                android_ripple={{ color: onBackground + TRANSPARENT[10] }}
            >
                <Typography>
                    {tag}
                </Typography>
                <Checkbox checked={isSelected} />
            </Pressable>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})

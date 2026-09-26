import { memo } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FadeInUp } from 'react-native-reanimated'

import { AnimatedView } from '@/components/animated/animated-view'
import { Checkbox } from '@/components/checkbox'
import { Typography } from '@/components/typography'

import { TRANSPARENT } from '@/constants/themes'

export const TagOption = memo(function TagOption({ id, tag, onToggle, isSelected }) {
    const { colors } = useTheme()

    return (
        <AnimatedView
            entering={FadeInUp}
        >
            <Pressable
                onPress={() => onToggle(id)}
                style={styles.container}
                android_ripple={{ color: colors.onBackground + TRANSPARENT[10] }}
            >
                <Typography>
                    {tag}
                </Typography>
                <Checkbox checked={isSelected} />
            </Pressable>
        </AnimatedView>
    )
})

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

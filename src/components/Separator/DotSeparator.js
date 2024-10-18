import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FadeInUp } from 'react-native-reanimated'
import { AnimatedView } from '../AnimatedView'

export function DotSeparator() {
    const { colors } = useTheme()
    const { onBackground } = colors

    return (
        <AnimatedView
            entering={FadeInUp}
        >
            <View
                style={{
                    ...styles.base,
                    backgroundColor: onBackground
                }}
            />
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    base: {
        width: 6,
        height: 6,
        borderRadius: 8
    }
})

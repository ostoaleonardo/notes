import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Typography } from '@/ui/typography'

import { SIZE, SPACING } from '@/ui/tokens/theme'

export function AppBarHeader({ leading, title = '', trailing }) {
    const { colors } = useTheme()
    const { top } = useSafeAreaInsets()

    return (
        <View
            style={[
                styles.container,
                { paddingTop: top, height: SIZE.xxl + top, backgroundColor: colors.background }
            ]}
        >
            {leading}

            <Typography
                heading
                numberOfLines={1}
                variant='titleLarge'
                styleProps={styles.title}
            >
                {title}
            </Typography>

            {trailing}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xxs
    },
    title: {
        flex: 1
    }
})

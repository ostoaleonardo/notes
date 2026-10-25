import { StyleSheet, View } from 'react-native'

import { Typography } from '@/components/typography'

import { OPACITY } from '@/constants/theme'

export function EmptyMessage({ children, style }) {
    return (
        <View style={[styles.container, style]}>
            <Typography
                opacity={OPACITY.muted}
                textAlign='center'
            >
                {children}
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})

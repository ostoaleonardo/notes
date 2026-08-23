import { StyleSheet, View } from 'react-native'
import { Typography } from '../typography'

export function Section({ title, children, containerStyle, contentStyle, visible = true }) {
    if (!visible) return null

    return (
        <View
            style={{
                ...styles.container,
                ...containerStyle
            }}
        >
            {title && (
                <View style={styles.title}>
                    <Typography
                        opacity={0.6}
                        uppercase={true}
                        variant='caption'
                    >
                        {title}
                    </Typography>
                </View>
            )}

            <View
                style={{
                    ...styles.content,
                    ...contentStyle
                }}
            >
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16
    },
    title: {
        width: '100%',
        paddingHorizontal: 16
    },
    content: {
        width: '100%'
    }
})

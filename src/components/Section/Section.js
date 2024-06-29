import { StyleSheet, View } from 'react-native'
import { Typography } from '../Text'

export function Section({ title, children, paddingVertical = 0, paddingHorizontal = 0, containerStyle, contentStyle }) {
    return (
        <View style={[
            styles.container,
            { paddingVertical, paddingHorizontal },
            containerStyle
        ]}>
            {title &&
                <View style={styles.titleContainer}>
                    <Typography
                        bold
                        uppercase
                        opacity={0.6}
                        variant='caption'
                    >
                        {title}
                    </Typography>
                </View>
            }

            <View style={[
                styles.contentContainer,
                contentStyle
            ]}>
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
    titleContainer: {
        width: '100%',
        paddingHorizontal: 24
    },
    contentContainer: {
        width: '100%'
    }
})

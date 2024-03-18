import { StyleSheet, View } from 'react-native'
import { Typography } from '../Text'

export function Section({ title, children, paddingVertical = 0, paddingHorizontal = 0, contentStyle }) {
    return (
        <View style={[
            styles.container,
            { paddingVertical, paddingHorizontal }
        ]}>
            {title &&
                <View style={styles.titleContainer}>
                    <Typography
                        opacity={0.5}
                        variant='subtitle'
                    >
                        {title}
                    </Typography>
                </View>
            }

            <View style={[
                styles.contentContainer,
                contentStyle,
            ]}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
    },
    titleContainer: {
        width: '100%',
        paddingHorizontal: 24,
    },
    contentContainer: {
        width: '100%',
    },
})

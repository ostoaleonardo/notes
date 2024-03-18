import { ScrollView, StyleSheet, View } from 'react-native'

export function Scroll({ children, contentStyle, ...props }) {
    return (
        <ScrollView
            {...props}
            overScrollMode='never'
            style={styles.container}
        >
            <View style={contentStyle}>
                {children}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

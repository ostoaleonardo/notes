import { StyleSheet, View } from 'react-native'

export function ContainerFooter({ children }) {
    return (
        <View style={styles.container}>
            <View style={{ position: 'relative' }}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        zIndex: 10,
        bottom: 0
    }
})

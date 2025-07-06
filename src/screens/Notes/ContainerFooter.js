import { StyleSheet, View } from 'react-native'

export function ContainerFooter({ children, footer }) {
    return (
        <View style={styles.container}>
            <View style={{ position: 'relative' }}>
                {children}
            </View>
            {footer}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        bottom: 0
    }
})

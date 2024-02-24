import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { FloatingButton, NotesContainer } from '../src/components'
import { colors } from '../src/constants'
import 'react-native-gesture-handler'
import { Providers } from './providers'

export default function App() {
    return (
        <Providers>
            <View style={styles.container}>
                <NotesContainer />
                <FloatingButton />
                <StatusBar style='inverted' />
            </View>
        </Providers>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
})

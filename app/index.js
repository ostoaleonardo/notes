import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { Categories, FloatingButton, NotesContainer } from '../src/components'
import { colors } from '../src/constants'
import 'react-native-gesture-handler'

export default function App() {
    return (
        <View style={styles.container}>
            <Categories />
            <NotesContainer />
            <FloatingButton />
            <StatusBar style='inverted' />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
})

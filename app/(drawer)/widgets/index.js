import { StyleSheet, View } from 'react-native'
import { WidgetPreview } from 'react-native-android-widget'
import { NoteWidget } from '@/widgets'
import { COLORS } from '@/constants'

export default function Widgets() {
    return (
        <View style={styles.container}>
            <WidgetPreview
                renderWidget={() => <NoteWidget />}
                width={320}
                height={100}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
})

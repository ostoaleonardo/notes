import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { ListMenu } from '@/components'
import { ArrowBack } from '@/icons'

export function BottomListBar({ onShowEditor, onListType }) {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: colors.background
            }}
        >
            <IconButton
                onPress={onShowEditor}
                icon={() => <ArrowBack color={colors.onBackground} />}
            />

            <ListMenu onListType={onListType} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})

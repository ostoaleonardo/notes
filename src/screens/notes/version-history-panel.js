import { useTheme } from 'react-native-paper'
import { Drawer } from 'react-native-drawer-layout'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function VersionHistoryPanel({ visible, onOpen, onClose, swipeEnabled, panelContent, children }) {
    const { colors } = useTheme()
    const { top } = useSafeAreaInsets()
    const { width } = useWindowDimensions()

    return (
        <Drawer
            open={visible}
            onOpen={onOpen}
            onClose={onClose}
            swipeEnabled={swipeEnabled}
            drawerPosition='right'
            drawerStyle={{ width, backgroundColor: colors.background }}
            renderDrawerContent={() => (
                <View style={{ ...styles.panel, paddingTop: top }}>
                    {panelContent}
                </View>
            )}
        >
            {children}
        </Drawer>
    )
}

const styles = StyleSheet.create({
    panel: {
        flex: 1
    }
})

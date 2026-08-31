import { Drawer } from 'react-native-drawer-layout'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Typography } from '@/components'
import { useIconProps } from '@/hooks'
import { Close } from '@/icons'

export function VersionHistoryPanel({ visible, onOpen, onClose, swipeEnabled, panelContent, children }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { top } = useSafeAreaInsets()
    const iconProps = useIconProps()

    return (
        <Drawer
            open={visible}
            onOpen={onOpen}
            onClose={onClose}
            swipeEnabled={swipeEnabled}
            drawerPosition='right'
            drawerStyle={{ backgroundColor: colors.background }}
            renderDrawerContent={() => (
                <View style={{ ...styles.panel, paddingTop: top + 16 }}>
                    <View style={styles.header}>
                        <Typography bold variant='title'>
                            {t('title.version_history')}
                        </Typography>
                        <IconButton
                            onPress={onClose}
                            icon={() => <Close {...iconProps} />}
                            accessibilityLabel={t('button.close')}
                        />
                    </View>

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
        flex: 1,
        paddingHorizontal: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    }
})

import { useTranslation } from 'react-i18next'
import { useNavigation } from 'expo-router'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import * as DocumentPicker from 'expo-document-picker'
import { MenuContainer } from './menu-container'
import { MenuItem } from './menu-item'
import { useImportMarkdown } from '@/hooks'
import { MoreVert, Settings, UploadFile } from '@/icons'
import { ROUTES } from '@/constants'

export function MoreMenu({ visible, onOpen, onClose }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const navigation = useNavigation()
    const { importFile } = useImportMarkdown()

    const iconProps = { color: colors.onBackground }

    const onSettings = () => {
        onClose()
        navigation.navigate(ROUTES.SETTINGS)
    }

    const onImport = async () => {
        onClose()

        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        importFile(result.assets[0].uri, result.assets[0].name)
    }

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={
                <Tooltip title={t('button.more')}>
                    <Appbar.Action
                        animated={false}
                        onPress={onOpen}
                        icon={() => <MoreVert {...iconProps} />}
                    />
                </Tooltip>
            }
        >
            <MenuItem
                title={t('title.settings')}
                leadingIcon={() => <Settings {...iconProps} />}
                onPress={onSettings}
            />
            <MenuItem
                title={t('title.import')}
                leadingIcon={() => <UploadFile {...iconProps} />}
                onPress={onImport}
            />
        </MenuContainer>
    )
}

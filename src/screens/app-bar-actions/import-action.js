import { useTranslation } from 'react-i18next'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import * as DocumentPicker from 'expo-document-picker'
import { useImportMarkdown } from '@/hooks'
import { UploadFile } from '@/icons'

export function ImportAction() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { premium, importFile } = useImportMarkdown()

    if (!premium) return null

    const onPress = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        importFile(result.assets[0].uri, result.assets[0].name)
    }

    return (
        <Tooltip title={t('title.import')}>
            <Appbar.Action
                animated={false}
                onPress={onPress}
                icon={() => <UploadFile color={colors.onBackground} />}
            />
        </Tooltip>
    )
}

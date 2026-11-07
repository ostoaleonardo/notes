import { useTranslation } from 'react-i18next'
import * as DocumentPicker from 'expo-document-picker'

import { TextButton } from '@/ui/button/text-button'

import { NameDialog } from '@/components/name-dialog'

import { useHaptics } from '@/hooks/use-haptics'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { useTemplates } from '@/hooks/use-templates'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'
import { ROUTES } from '@/constants/routes'
import { pushOnce } from '@/utils/navigation'

export const AddTemplate = ({
    visible,
    onDismiss,
    folder = ''
}) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addTemplate, importTemplate } = useTemplates()

    const onSubmit = async (name) => {
        const filename = await addTemplate(name, '', folder)
        pushOnce(ROUTES.EDIT_TEMPLATE + encodeURIComponent(filename))
    }

    const [onImport, importing] = useSingleFlight(async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        await importTemplate(
            result.assets[0].uri,
            result.assets[0].name,
            folder
        )
        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    })

    const importAction = (
        <TextButton
            loading={importing}
            onPress={onImport}
        >
            {t('templates.import')}
        </TextButton>
    )

    return (
        <NameDialog
            title={t('templates.new')}
            visible={visible}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
            busy={importing}
            secondaryAction={importAction}
        />
    )
}

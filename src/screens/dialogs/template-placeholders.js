import { useTranslation } from 'react-i18next'
import { Column } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { Dialog } from '@/ui/dialog'
import { DialogText } from '@/ui/dialog-text'
import { TextButton } from '@/ui/button/text-button'

import { renderTemplate } from '@/utils/render-template'

import { TEMPLATE_PLACEHOLDERS } from '@/constants/template-placeholders'
import { SPACING } from '@/constants/theme'

const LIST_MODIFIERS = [fillMaxWidth()]
const LIST_ARRANGEMENT = { spacedBy: SPACING.md }

export const TemplatePlaceholders = ({ visible, onDismiss }) => {
    const { t } = useTranslation()

    const examples = {
        date: renderTemplate('{{date}}'),
        time: renderTemplate('{{time}}'),
        title: t('templates.placeholders.title_example')
    }

    return (
        <Dialog
            title={t('templates.placeholders.heading')}
            visible={visible}
            onDismiss={onDismiss}
            dismiss={(
                <TextButton onPress={onDismiss}>
                    {t('button.back')}
                </TextButton>
            )}
        >
            <Column
                modifiers={LIST_MODIFIERS}
                verticalArrangement={LIST_ARRANGEMENT}
            >
                {TEMPLATE_PLACEHOLDERS.map((key) => (
                    <Column key={key}>
                        <DialogText bold>
                            {`{{${key}}}`}
                        </DialogText>
                        <DialogText tone='secondary' small>
                            {t(`templates.placeholders.${key}`)}
                        </DialogText>
                        <DialogText tone='tertiary' small>
                            {t('templates.placeholders.example', { value: examples[key] })}
                        </DialogText>
                    </Column>
                ))}
            </Column>
        </Dialog>
    )
}

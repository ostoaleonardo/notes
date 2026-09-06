import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { Typography } from '@/components/typography'

import { renderTemplate } from '@/utils/render-template'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { TEMPLATE_PLACEHOLDERS } from '@/constants/template-placeholders'

export function TemplatePlaceholders({ visible, onDismiss }) {
    const { t } = useTranslation()

    const examples = {
        date: renderTemplate('{{date}}'),
        time: renderTemplate('{{time}}'),
        title: t('templates.placeholder_title_example')
    }

    return (
        <DialogModal
            title={t('templates.placeholders_title')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    onPress={onDismiss}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.back')}
                </Button>
            }
        >
            <View style={styles.list}>
                {TEMPLATE_PLACEHOLDERS.map((key) => (
                    <View key={key}>
                        <Typography bold>
                            {`{{${key}}}`}
                        </Typography>
                        <Typography
                            opacity={0.6}
                            variant='caption'
                        >
                            {t(`templates.placeholder_${key}`)}
                        </Typography>
                        <Typography
                            opacity={0.4}
                            variant='caption'
                        >
                            {t('templates.placeholder_example', { value: examples[key] })}
                        </Typography>
                    </View>
                ))}
            </View>
        </DialogModal>
    )
}

const styles = StyleSheet.create({
    list: {
        gap: 12
    }
})

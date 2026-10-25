import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { Typography } from '@/components/typography'

import { renderTemplate } from '@/utils/render-template'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { TEMPLATE_PLACEHOLDERS } from '@/constants/template-placeholders'
import { SPACING, OPACITY } from '@/constants/theme'

export function TemplatePlaceholders({ visible, onDismiss }) {
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
                            opacity={OPACITY.secondary}
                            variant='bodySmall'
                        >
                            {t(`templates.placeholders.${key}`)}
                        </Typography>
                        <Typography
                            opacity={OPACITY.disabled}
                            variant='bodySmall'
                        >
                            {t('templates.placeholders.example', { value: examples[key] })}
                        </Typography>
                    </View>
                ))}
            </View>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    list: {
        gap: SPACING.md
    }
})

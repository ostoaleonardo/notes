import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DialogButton, DialogModal, Typography } from '@/components'
import { TEMPLATE_PLACEHOLDERS } from '@/constants'
import { renderTemplate } from '@/utils'

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
                <DialogButton onPress={onDismiss}>
                    {t('button.back')}
                </DialogButton>
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

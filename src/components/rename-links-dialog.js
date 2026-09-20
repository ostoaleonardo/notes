import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-native-paper'

import { DialogModal } from './dialog'
import { Typography } from './typography'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'

export function RenameLinksDialog({ visible, linksCount, onDismiss, onConfirmOnce, onConfirmAlways }) {
    const { t } = useTranslation()

    return (
        <DialogModal
            title={t('message.wiki_links.rename_title')}
            visible={visible}
            onDismiss={onDismiss}
            actions={[
                <View
                    key='actions'
                    style={{
                        width: '100%',
                        gap: 8
                    }}
                >
                    <Button
                        mode='outlined'
                        onPress={onDismiss}
                        labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                    >
                        {t('button.dont_update')}
                    </Button>
                    <Button
                        mode='outlined'
                        onPress={onConfirmOnce}
                        labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                    >
                        {t('button.update_once')}
                    </Button>
                    <Button
                        mode='contained'
                        onPress={onConfirmAlways}
                        labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                    >
                        {t('button.update_always')}
                    </Button>
                </View>
            ]}
        >
            <Typography opacity={0.6}>
                {t('message.wiki_links.rename_message', { count: linksCount })}
            </Typography>
        </DialogModal>
    )
}

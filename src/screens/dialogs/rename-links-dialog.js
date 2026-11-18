import { useTranslation } from 'react-i18next'
import { Row } from '@expo/ui/jetpack-compose'

import { Dialog } from '@/ui/dialog'
import { DialogText } from '@/ui/dialog-text'
import { FilledButton } from '@/ui/button/filled-button'
import { OutlinedButton } from '@/ui/button/outlined-button'
import { TextButton } from '@/ui/button/text-button'

import { SPACING } from '@/shared/constants/theme'

export const RenameLinksDialog = ({
    visible,
    busy = false,
    linksCount,
    onDismiss,
    onConfirmOnce,
    onConfirmAlways
}) => {
    const { t } = useTranslation()

    return (
        <Dialog
            locked={busy}
            visible={visible}
            onDismiss={onDismiss}
            title={t('message.wiki_links.rename.title')}
            dismiss={(
                <TextButton
                    disabled={busy}
                    onPress={onDismiss}
                >
                    {t('button.dont_update')}
                </TextButton>
            )}
            confirm={(
                <Row horizontalArrangement={{ spacedBy: SPACING.sm }}>
                    <OutlinedButton
                        disabled={busy}
                        onPress={onConfirmOnce}
                    >
                        {t('button.update_once')}
                    </OutlinedButton>
                    <FilledButton
                        loading={busy}
                        onPress={onConfirmAlways}
                    >
                        {t('button.update_always')}
                    </FilledButton>
                </Row>
            )}
        >
            <DialogText tone='secondary'>
                {t('message.wiki_links.rename.message', { count: linksCount })}
            </DialogText>
        </Dialog>
    )
}

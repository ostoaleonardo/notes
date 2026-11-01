import { useTranslation } from 'react-i18next'
import { Column } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { Dialog } from '@/ui/dialog'
import { DialogText } from '@/ui/dialog-text'
import { FilledButton } from '@/ui/button/filled-button'
import { OutlinedButton } from '@/ui/button/outlined-button'

import { SPACING } from '@/constants/theme'

const COLUMN_MODIFIERS = [fillMaxWidth()]
const COLUMN_ARRANGEMENT = { spacedBy: SPACING.sm }

export function RenameLinksDialog({ visible, linksCount, onDismiss, onConfirmOnce, onConfirmAlways }) {
    const { t } = useTranslation()

    return (
        <Dialog
            title={t('message.wiki_links.rename.title')}
            visible={visible}
            onDismiss={onDismiss}
        >
            <Column
                modifiers={COLUMN_MODIFIERS}
                verticalArrangement={COLUMN_ARRANGEMENT}
            >
                <DialogText tone='secondary'>
                    {t('message.wiki_links.rename.message', { count: linksCount })}
                </DialogText>
                <OutlinedButton onPress={onDismiss}>
                    {t('button.dont_update')}
                </OutlinedButton>
                <OutlinedButton onPress={onConfirmOnce}>
                    {t('button.update_once')}
                </OutlinedButton>
                <FilledButton onPress={onConfirmAlways}>
                    {t('button.update_always')}
                </FilledButton>
            </Column>
        </Dialog>
    )
}

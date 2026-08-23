import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '../modal'
import { UnlockNote } from '@/screens/modals/unlock-note'
import { useBottomSheet, useTabs } from '@/hooks'

export function UnlockNoteGate() {
    const { t } = useTranslation()
    const { pendingUnlockId, cancelUnlock } = useTabs()
    const { ref, onOpen, onClose } = useBottomSheet()

    useEffect(() => {
        if (pendingUnlockId) onOpen()
        else onClose()
    }, [pendingUnlockId])

    return (
        <ModalSheet
            enableDynamicSizing
            ref={ref}
            onClose={cancelUnlock}
            title={t('title.unlock')}
        >
            <UnlockNote />
        </ModalSheet>
    )
}

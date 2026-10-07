import { useState } from 'react'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { FilterToggleGroup } from '@/components/button/filter-toggle-group'

import { usePro } from '@/hooks/use-pro'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { EXPORT_FORMATS } from '@/constants/export'

export function ExportFormat({ title, visible, onDismiss, onExport, onShare }) {
    const { t } = useTranslation()
    const { pro } = usePro()

    const [format, setFormat] = useState(EXPORT_FORMATS.MARKDOWN)

    const onPress = (action) => {
        action(format)
        onDismiss()
    }

    return (
        <DialogModal
            title={title}
            visible={visible}
            onDismiss={onDismiss}
            actions={[
                <Button
                    key='cancel'
                    compact={true}
                    onPress={onDismiss}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.cancel')}
                </Button>,
                <Button
                    key='export'
                    compact={true}
                    onPress={() => onPress(onExport)}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.export')}
                </Button>,
                <Button
                    key='share'
                    compact={true}
                    mode='contained'
                    onPress={() => onPress(onShare)}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.share')}
                </Button>
            ]}
        >
            <FilterToggleGroup
                pill
                equalWidth
                buttons={[
                    {
                        label: t('export.html'),
                        selected: format === EXPORT_FORMATS.HTML,
                        disabled: !pro,
                        onPress: () => setFormat(EXPORT_FORMATS.HTML)
                    },
                    {
                        label: t('export.markdown'),
                        selected: format === EXPORT_FORMATS.MARKDOWN,
                        onPress: () => setFormat(EXPORT_FORMATS.MARKDOWN)
                    },
                    {
                        label: t('export.pdf'),
                        selected: format === EXPORT_FORMATS.PDF,
                        disabled: !pro,
                        onPress: () => setFormat(EXPORT_FORMATS.PDF)
                    }
                ]}
            />
        </DialogModal>
    )
}

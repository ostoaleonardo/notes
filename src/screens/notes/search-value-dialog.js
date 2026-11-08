import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/ui/dialog'
import { FilledButton } from '@/ui/button/filled-button'
import { TextButton } from '@/ui/button/text-button'
import { FilledTextField } from '@/ui/input/filled-text-field'

import { SEARCH_FILTER_KINDS } from '@/constants/search-filters'

export const SearchValueDialog = ({ option, onDismiss, onSubmit }) => {
    const { t } = useTranslation()
    const [value, setValue] = useState('')

    useEffect(() => {
        if (option) setValue('')
    }, [option])

    const disabled = !value.trim()
    const isProperty = option?.kind === SEARCH_FILTER_KINDS.PROPERTY

    const onConfirm = () => {
        if (disabled) return

        onSubmit(option, value.trim())
        onDismiss()
    }

    return (
        <Dialog
            visible={!!option}
            title={option ? t(option.label) : ''}
            onDismiss={onDismiss}
            dismiss={(
                <TextButton onPress={onDismiss}>
                    {t('button.cancel')}
                </TextButton>
            )}
            confirm={(
                <FilledButton
                    disabled={disabled}
                    onPress={onConfirm}
                >
                    {t('search.add')}
                </FilledButton>
            )}
        >
            <FilledTextField
                autoFocus
                multiline={false}
                value={value}
                placeholder={t(isProperty ? 'search.property_placeholder' : 'search.value_placeholder')}
                onChangeText={setValue}
            />
        </Dialog>
    )
}

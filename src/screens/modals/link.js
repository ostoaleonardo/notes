import { forwardRef } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '@/components'
import { Button, Column, Host, Row, Text, TextButton, useNativeState } from '@expo/ui/jetpack-compose'
import { AndroidOutlinedTextField } from '@/ui/outlined-text-field'

export const LinkModal = forwardRef(({ onClose, onInsert }, ref) => {
    const { t } = useTranslation()

    const title = useNativeState('')
    const url = useNativeState('')

    const read = (state) => {
        try {
            return state?.value ?? state ?? ''
        } catch (e) {
            return ''
        }
    }

    const reset = (state) => {
        try {
            if (state && typeof state.setValue === 'function') state.setValue('')
        } catch (e) { }
    }

    const onAdd = () => {
        const titleVal = read(title)
        const urlVal = read(url)

        if (!urlVal || urlVal.trim() === '') return

        onInsert({ title: titleVal, url: urlVal })

        reset(title)
        reset(url)
        onClose()
    }

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            enableDynamicSizing
            contentContainerStyle={styles.container}
        >
            <Host matchContents>
                <Column verticalArrangement={{ spacedBy: 16 }}>
                    <AndroidOutlinedTextField
                        value={title}
                        label={t('markdown.link_title')}
                        placeholder='YouTube'
                    />
                    <AndroidOutlinedTextField
                        value={url}
                        label={t('markdown.link_url')}
                        placeholder='www.youtube.com'
                    />

                    <Row horizontalArrangement='spaceEvenly'>
                        <Button onClick={onAdd}>
                            <Text>{t('insert')}</Text>
                        </Button>
                        <TextButton variant='text' onClick={onClose}>
                            <Text>{t('cancel')}</Text>
                        </TextButton>
                    </Row>
                </Column>
            </Host>
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        padding: 24
    }
})

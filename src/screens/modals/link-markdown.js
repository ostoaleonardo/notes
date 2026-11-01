import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { TonalButton } from '@/ui/button/tonal-button'
import { SheetForm, SheetInput } from '@/ui/modal/sheet-form'
import { INPUT_EXAMPLES } from '@/constants/input-examples'

export function LinkMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()

    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')

    const onAdd = () => {
        if (!url.trim()) return

        onInsert({ title, url })

        setTitle('')
        setUrl('')
        onClose()
    }

    return (
        <SheetForm title={t('markdown_action.link')}>
            <SheetInput
                label={t('markdown.link.title')}
                value={title}
                onChangeText={setTitle}
                placeholder={INPUT_EXAMPLES.LINK_TITLE}
            />

            <SheetInput
                label={t('markdown.link.url')}
                value={url}
                onChangeText={setUrl}
                placeholder={INPUT_EXAMPLES.LINK_URL}
            />

            <View style={styles.buttons}>
                <TonalButton onPress={onAdd}>
                    {t('button.insert')}
                </TonalButton>
            </View>
        </SheetForm>
    )
}

const styles = StyleSheet.create({
    buttons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
    }
})

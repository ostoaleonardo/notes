import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Button } from '@/components/button/button'
import { SheetForm, SheetInput } from '@/components/modal/sheet-form'
import { INPUT_EXAMPLES } from '@/constants/input-examples'

export function LinkMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

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
                <Button
                    mode='contained'
                    buttonColor={colors.surfaceVariant}
                    textColor={colors.onBackground}
                    onPress={onAdd}
                >
                    {t('button.insert')}
                </Button>
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

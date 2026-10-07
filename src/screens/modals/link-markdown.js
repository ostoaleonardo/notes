import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { LargeInput } from '@/components/input/large-input'
import { Pressable } from '@/components/button/pressable'
import { SheetField, SheetForm } from '@/components/modal/sheet-form'
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
        <SheetForm>
            <SheetField title={t('markdown.link_title')}>
                <LargeInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={INPUT_EXAMPLES.LINK_TITLE}
                />
            </SheetField>

            <SheetField title={t('markdown.link_url')}>
                <LargeInput
                    value={url}
                    onChangeText={setUrl}
                    placeholder={INPUT_EXAMPLES.LINK_URL}
                />
            </SheetField>

            <View style={styles.buttons}>
                <Pressable
                    mode='contained'
                    buttonColor={colors.surfaceVariant}
                    textColor={colors.onBackground}
                    onPress={onAdd}
                >
                    {t('button.insert')}
                </Pressable>
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

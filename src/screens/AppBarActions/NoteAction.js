import { StyleSheet, View } from 'react-native'
import { Appbar, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Delete, Keep, Markdown, MarkdownFilled } from '@/icons'
import { useMarkdown } from '@/hooks'
import { useRouter } from 'expo-router'
import { useState } from 'react'

export function NoteAction() {
    const { colors } = useTheme()
    const { t } = useTranslation()
    const { setParams } = useRouter()

    const { markdown: active } = useMarkdown()
    const [markdown, setMarkdown] = useState(active)

    const toggleMarkdown = () => {
        setParams({ md: !markdown })
        setMarkdown(!markdown)
    }

    const { onBackground } = colors
    const iconProps = { color: onBackground }

    return (
        <View style={styles.container}>
            <Tooltip title={t('appbar.markdown')}>
                <Appbar.Action
                    animated={false}
                    onPress={toggleMarkdown}
                    icon={() => (
                        markdown
                            ? <MarkdownFilled {...iconProps} />
                            : <Markdown {...iconProps} />
                    )}
                />
            </Tooltip>
            <Tooltip title={t('appbar.keep')}>
                <Appbar.Action
                    animated={false}
                    onPress={() => { }}
                    icon={() => <Keep {...iconProps} />}
                />
            </Tooltip>
            <Tooltip title={t('appbar.delete')}>
                <Appbar.Action
                    animated={false}
                    onPress={() => { }}
                    icon={() => <Delete {...iconProps} />}
                />
            </Tooltip>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row'
    }
})

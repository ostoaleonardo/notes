import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'
import { MarkdownContainer } from './MarkdownContainer'
import { Typography } from '../Typography'
import { Eye, Markdown } from '@/icons'

export function MarkdownPreview({ value, height }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    const [showMarkdown, setShowMarkdown] = useState(false)

    const iconProps = {
        width: 16,
        height: 16,
        color: onBackground
    }

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: height || 'auto',
            padding: 8,
            borderRadius: 16,
            paddingHorizontal: 16,
            justifyContent: 'center',
            backgroundColor: background
        },
        toggle: {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.toggle}>
                <IconButton
                    size={12}
                    mode='contained'
                    onPress={() => setShowMarkdown(!showMarkdown)}
                    icon={() => showMarkdown
                        ? <Markdown {...iconProps} />
                        : <Eye {...iconProps} />
                    }
                />
            </View>
            {showMarkdown ? (
                <MarkdownContainer>
                    {value}
                </MarkdownContainer>
            ) : (
                <Typography>
                    {value}
                </Typography>
            )}
        </View>
    )
}

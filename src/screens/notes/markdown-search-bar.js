import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { BasicTextField } from '@/ui/input/basic-text-field'
import { ButtonGroup } from '@/ui/button/button-group'

import { Close } from '@/icons/close'
import { DoneAll } from '@/icons/done-all'
import { FindReplace } from '@/icons/find-replace'
import { KeyboardArrowDown } from '@/ui/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/ui/icons/keyboard-arrow-up'

import { FONTS, RADIUS, SPACING } from '@/constants/theme'
import { TINT } from '@/ui/tokens/transparent'
import { MARKDOWN_ACTIONS } from '@/constants/markdown-actions'

export function MarkdownSearchBar({ search, action }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const {
        visible,
        replaceVisible,
        searchQuery,
        setSearchQuery,
        replaceText,
        setReplaceText,
        onClose
    } = search

    const textStyle = useMemo(() => ({
        color: colors.onBackground,
        fontFamily: FONTS.azeretLight
    }), [colors.onBackground])

    const selectionColors = useMemo(() => ({
        handleColor: colors.accentText,
        backgroundColor: colors.tertiary + TINT.highlight
    }), [colors.accentText, colors.tertiary])

    const placeholderColor = colors.onBackground + TINT.placeholder

    if (!visible) return null

    const onPrevious = () => action.run(MARKDOWN_ACTIONS.SEARCH_PREVIOUS)
    const onNext = () => action.run(MARKDOWN_ACTIONS.SEARCH_NEXT)
    const onReplaceOne = () => action.run(MARKDOWN_ACTIONS.SEARCH_REPLACE)
    const onReplaceAll = () => action.run(MARKDOWN_ACTIONS.SEARCH_REPLACE_ALL)

    const searchBottomRadius = replaceVisible ? RADIUS.md : RADIUS.lg

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.row,
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: RADIUS.lg,
                    borderTopRightRadius: RADIUS.lg,
                    borderBottomLeftRadius: searchBottomRadius,
                    borderBottomRightRadius: searchBottomRadius
                }}
            >
                <View style={styles.input}>
                    <BasicTextField
                        autoFocus
                        value={searchQuery}
                        textStyle={textStyle}
                        cursorColor={colors.accentText}
                        selectionColors={selectionColors}
                        placeholderColor={placeholderColor}
                        placeholder={t('button.find')}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <ButtonGroup
                    buttons={[
                        {
                            icon: KeyboardArrowUp,
                            label: t('button.previous'),
                            onPress: onPrevious
                        },
                        {
                            icon: KeyboardArrowDown,
                            label: t('button.next'),
                            onPress: onNext
                        },
                        {
                            icon: Close,
                            label: t('button.close'),
                            onPress: onClose
                        }
                    ]}
                />
            </View>

            {replaceVisible && (
                <View
                    style={{
                        ...styles.row,
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: RADIUS.md,
                        borderTopRightRadius: RADIUS.md,
                        borderBottomLeftRadius: RADIUS.lg,
                        borderBottomRightRadius: RADIUS.lg
                    }}
                >
                    <View style={styles.input}>
                        <BasicTextField
                            value={replaceText}
                            textStyle={textStyle}
                            cursorColor={colors.accentText}
                            selectionColors={selectionColors}
                            placeholderColor={placeholderColor}
                            placeholder={t('button.replace')}
                            onChangeText={setReplaceText}
                        />
                    </View>
                    <ButtonGroup
                        buttons={[
                            {
                                icon: FindReplace,
                                label: t('button.replace'),
                                onPress: onReplaceOne
                            },
                            {
                                icon: DoneAll,
                                label: t('button.replace_all'),
                                onPress: onReplaceAll
                            }
                        ]}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
        gap: SPACING.xxxs
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        gap: SPACING.xxs
    },
    input: {
        flex: 1
    }
})

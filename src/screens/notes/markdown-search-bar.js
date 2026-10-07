import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { SmallInput } from '@/components/input/small-input'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'

import { Close } from '@/icons/close'
import { DoneAll } from '@/icons/done-all'
import { FindReplace } from '@/icons/find-replace'
import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

import { RADIUS, SPACING } from '@/constants/theme'
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
                <SmallInput
                    autoFocus
                    background={colors.surface}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('button.find')}
                />
                <IconToggleGroup
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
                    <SmallInput
                        value={replaceText}
                        background={colors.surface}
                        onChangeText={setReplaceText}
                        placeholder={t('button.replace')}
                    />
                    <IconToggleGroup
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
        paddingRight: SPACING.xxs,
        gap: SPACING.xxs
    }
})

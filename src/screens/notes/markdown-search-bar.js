import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, useTheme } from 'react-native-paper'

import { SmallInput } from '@/components/input/small-input'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'

import { Close } from '@/icons/close'
import { DoneAll } from '@/icons/done-all'
import { FindReplace } from '@/icons/find-replace'
import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

import { RADIUS } from '@/constants/themes'

export function MarkdownSearchBar({
    visible,
    replaceVisible,
    query,
    onQueryChange,
    replacement,
    onReplacementChange,
    onPrevious,
    onNext,
    onReplaceOne,
    onReplaceAll,
    onClose
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    if (!visible) return null

    const searchBottomRadius = replaceVisible ? RADIUS.inner : RADIUS.outer

    return (
        <View style={styles.container}>
            <View
                style={{
                    ...styles.row,
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: RADIUS.outer,
                    borderTopRightRadius: RADIUS.outer,
                    borderBottomLeftRadius: searchBottomRadius,
                    borderBottomRightRadius: searchBottomRadius
                }}
            >
                <SmallInput
                    autoFocus
                    background={colors.surface}
                    value={query}
                    onChangeText={onQueryChange}
                    placeholder={t('button.find')}
                />
                <View style={{ flexDirection: 'row' }}>
                    <IconButton
                        size={18}
                        onPress={onPrevious}
                        icon={(props) => <KeyboardArrowUp {...props} />}
                        accessibilityLabel={t('button.previous')}
                    />
                    <IconButton
                        size={18}
                        onPress={onNext}
                        icon={(props) => <KeyboardArrowDown {...props} />}
                        accessibilityLabel={t('button.next')}
                    />
                    <IconButton
                        size={18}
                        onPress={onClose}
                        icon={(props) => <Close {...props} />}
                        accessibilityLabel={t('button.close')}
                    />
                </View>
            </View>

            {replaceVisible && (
                <View
                    style={{
                        ...styles.row,
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: RADIUS.inner,
                        borderTopRightRadius: RADIUS.inner,
                        borderBottomLeftRadius: RADIUS.outer,
                        borderBottomRightRadius: RADIUS.outer
                    }}
                >
                    <SmallInput
                        value={replacement}
                        background={colors.surface}
                        onChangeText={onReplacementChange}
                        placeholder={t('button.replace')}
                    />
                    <IconToggleGroup
                        buttons={[
                            { icon: FindReplace, label: t('button.replace'), onPress: onReplaceOne },
                            { icon: DoneAll, label: t('button.replace_all'), onPress: onReplaceAll }
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
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 2
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingRight: 4,
        gap: 4
    }
})

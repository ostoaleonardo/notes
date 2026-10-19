import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { TextInput, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { Close } from '@/icons/close'
import { Search } from '@/icons/search'

import { FONTS, SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

const renderSearch = ({ size, color }) => <Search width={size} height={size} color={color} />
const renderClear = ({ size, color }) => <Close width={size} height={size} color={color} />

export function SearchInput({ label, value, onChangeText, ...props }) {
    const { t } = useTranslation()
    const { colors, fonts } = useTheme()

    const fontTheme = useMemo(() => ({
        fonts: {
            bodyLarge: {
                ...fonts.bodyLarge,
                fontFamily: FONTS.azeretLight
            }
        }
    }), [fonts])

    const onClear = useCallback(() => onChangeText(''), [onChangeText])

    return (
        <View style={styles.container}>
            <TextInput
                mode='flat'
                label={label ?? t('drawer.search')}
                value={value}
                onChangeText={onChangeText}
                theme={fontTheme}
                style={{ backgroundColor: colors.surfaceVariant }}
                textColor={colors.onBackground}
                cursorColor={colors.accentText}
                selectionColor={colors.accentText + TRANSPARENT[30]}
                underlineColor={colors.onBackground + TRANSPARENT[50]}
                activeUnderlineColor={colors.accentText}
                left={<TextInput.Icon icon={renderSearch} />}
                right={value ? <TextInput.Icon icon={renderClear} onPress={onClear} /> : undefined}
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg
    }
})

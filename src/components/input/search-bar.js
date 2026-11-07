import { useCallback, useRef } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { FilledTextField } from '@/ui/input/filled-text-field'
import { useTheme } from '@/ui/hooks/use-theme'

import { Close } from '@/icons/close'
import { Search } from '@/icons/search'

import { ICON_SIZE, SPACING } from '@/constants/theme'

export const SearchBar = ({
    label,
    value,
    onChangeText
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const fieldRef = useRef(null)

    const onClear = useCallback(() => {
        fieldRef.current?.clear()
        onChangeText('')
    }, [onChangeText])

    return (
        <View style={styles.container}>
            <FilledTextField
                ref={fieldRef}
                multiline={false}
                label={label ?? t('drawer.search')}
                value={value}
                onChangeText={onChangeText}
                startAdornment={(
                    <View style={styles.icon}>
                        <Search width={ICON_SIZE.xxl} height={ICON_SIZE.xxl} color={colors.onSurfaceVariant} />
                    </View>
                )}
                endAdornment={value ? (
                    <Pressable style={styles.icon} onPress={onClear} accessibilityRole='button'>
                        <Close width={ICON_SIZE.xxl} height={ICON_SIZE.xxl} color={colors.onSurfaceVariant} />
                    </Pressable>
                ) : undefined}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg
    },
    icon: {
        padding: SPACING.sm
    }
})

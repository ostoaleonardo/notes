import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { SmallInput } from './small-input'

import { Search } from '@/icons/search'

import { RADIUS, SPACING, ICON_SIZE } from '@/constants/theme'
import { SEARCH_INPUT } from '@/constants/components'

export function SearchInput({
    value,
    onChangeText,
    ...props
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <View style={styles.container}>
            <SmallInput
                value={value}
                onChangeText={onChangeText}
                placeholder={t('drawer.search')}
                background={colors.surfaceVariant}
                {...props}
            />

            <View style={styles.icon}>
                <Search
                    width={ICON_SIZE.xxl}
                    height={ICON_SIZE.xxl}
                    color={colors.onSurfaceVariant}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: SPACING.lg,
        flexDirection: 'row',
        borderRadius: RADIUS.lg
    },
    icon: {
        width: SEARCH_INPUT.actionSize,
        height: SEARCH_INPUT.actionSize,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

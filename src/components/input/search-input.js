import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { SmallInput } from './small-input'

import { Search } from '@/icons/search'

import { RADIUS } from '@/constants/themes'

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
                    width={24}
                    height={24}
                    color={colors.onSurfaceVariant}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 16,
        flexDirection: 'row',
        borderRadius: RADIUS.outer
    },
    icon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Divider, TouchableRipple, useTheme } from 'react-native-paper'

import { Section } from '@/components/section'
import { Typography } from '@/components/typography'

import { History } from '@/icons/history'

export function RecentSearches({ recent, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    if (recent.length === 0) return null

    return (
        <View style={styles.container}>
            <Divider />

            <Section title={t('search.recent')}>
                {recent.map((term) => (
                    <TouchableRipple
                        key={term}
                        onPress={() => onSelect(term)}
                    >
                        <View style={styles.item}>
                            <History
                                width={16}
                                height={16}
                                color={colors.onBackground}
                                opacity={0.5}
                            />
                            <Typography numberOfLines={1}>
                                {term}
                            </Typography>
                        </View>
                    </TouchableRipple>
                ))}
            </Section>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16
    },
    item: {
        gap: 12,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center'
    }
})

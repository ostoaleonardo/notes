import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Divider, TouchableRipple } from 'react-native-paper'
import { Section, Typography } from '@/components'
import { useIconProps } from '@/hooks'
import { History } from '@/icons'

export function RecentSearches({ recent, onSelect }) {
    const { t } = useTranslation()
    const iconProps = useIconProps(16, 0.5)

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
                            <History {...iconProps} />
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

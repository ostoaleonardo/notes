import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Divider, IconButton, TouchableRipple, useTheme } from 'react-native-paper'

import { Section } from '@/components/section'
import { Typography } from '@/components/typography'

import { Close } from '@/icons/close'
import { Search } from '@/icons/search'

export function SavedSearches({ saved, onSelect, onDelete }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    if (saved.length === 0) return null

    return (
        <View style={styles.container}>
            <Divider />

            <Section title={t('search.saved')}>
                {saved.map((entry) => (
                    <TouchableRipple
                        key={entry.id}
                        onPress={() => onSelect(entry.query)}
                    >
                        <View style={styles.item}>
                            <Search
                                width={16}
                                height={16}
                                color={colors.onBackground}
                                opacity={0.5}
                            />
                            <Typography numberOfLines={1} styleProps={styles.label}>
                                {entry.query}
                            </Typography>
                            <IconButton
                                size={16}
                                onPress={() => onDelete(entry.id)}
                                icon={(props) => <Close {...props} />}
                                accessibilityLabel={t('button.delete')}
                            />
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
        paddingLeft: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        flex: 1
    }
})

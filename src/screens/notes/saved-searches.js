import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Divider, IconButton, TouchableRipple } from 'react-native-paper'

import { Section } from '@/components/section'
import { Typography } from '@/components/typography'

import { useIconProps } from '@/hooks/use-icon-props'

import { Delete } from '@/icons/delete'
import { Search } from '@/icons/search'

export function SavedSearches({ saved, onSelect, onDelete }) {
    const { t } = useTranslation()
    const iconProps = useIconProps(16, 0.5)

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
                            <Search {...iconProps} />
                            <Typography numberOfLines={1} styleProps={styles.label}>
                                {entry.query}
                            </Typography>
                            <IconButton
                                size={16}
                                onPress={() => onDelete(entry.id)}
                                icon={(props) => <Delete {...props} />}
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

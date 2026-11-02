import { StyleSheet, View } from 'react-native'

import { Section } from '@/ui/section'
import { ListItem } from '@/ui/list-item'
import { useTheme } from '@/ui/hooks/use-theme'

import { ICON_SIZE, SPACING } from '@/constants/theme'

export function SearchListSection({
    title,
    items,
    keyExtractor,
    icon: Icon,
    getLabel,
    onSelect,
    renderTrailing
}) {
    const { colors } = useTheme()

    if (items.length === 0) return null

    return (
        <Section
            title={title}
            contentStyle={styles.items}
        >
            {items.map((item) => (
                <View key={keyExtractor(item)} style={styles.row}>
                    <ListItem
                        uppercase={false}
                        title={getLabel(item)}
                        background={colors.surfaceVariant}
                        onPress={() => onSelect(item)}
                        rightContent={renderTrailing?.(item) ?? (
                            <Icon
                                width={ICON_SIZE.lg}
                                height={ICON_SIZE.lg}
                                color={colors.onBackground}
                            />
                        )}
                    />
                </View>
            ))}
        </Section>
    )
}

const styles = StyleSheet.create({
    items: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg
    },
    row: {
        width: '100%'
    }
})

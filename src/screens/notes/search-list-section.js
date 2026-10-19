import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Section } from '@/components/section'
import { Option } from '@/screens/settings/option'

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
                    <Option
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

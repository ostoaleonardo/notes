import { StyleSheet, View } from 'react-native'
import { Divider, TouchableRipple, useTheme } from 'react-native-paper'

import { Section } from '@/components/section'
import { Typography } from '@/components/typography'

export function SearchListSection({
    title,
    items,
    keyExtractor,
    icon: Icon,
    getLabel,
    onSelect,
    renderTrailing,
    itemStyle,
    labelStyle
}) {
    const { colors } = useTheme()

    if (items.length === 0) return null

    return (
        <View style={styles.container}>
            <Divider />

            <Section title={title}>
                {items.map((item) => (
                    <TouchableRipple
                        key={keyExtractor(item)}
                        onPress={() => onSelect(item)}
                    >
                        <View style={[styles.item, itemStyle]}>
                            <Icon
                                width={16}
                                height={16}
                                color={colors.onBackground}
                                opacity={0.5}
                            />
                            <Typography numberOfLines={1} styleProps={labelStyle}>
                                {getLabel(item)}
                            </Typography>
                            {renderTrailing?.(item)}
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
        flexDirection: 'row',
        alignItems: 'center'
    }
})

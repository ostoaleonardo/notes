import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Section } from '@/components/section'
import { Typography } from '@/components/typography'
import { SPACING } from '@/constants/spacing'

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
        <Section
            title={title}
            containerStyle={styles.container}
        >
            {items.map((item) => (
                <TouchableRipple
                    accessibilityRole='button'
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
                        <Typography
                            numberOfLines={1}
                            styleProps={labelStyle}
                        >
                            {getLabel(item)}
                        </Typography>
                        {renderTrailing?.(item)}
                    </View>
                </TouchableRipple>
            ))}
        </Section>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    item: {
        gap: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center'
    }
})

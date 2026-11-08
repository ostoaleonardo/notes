import { Pressable, StyleSheet, View } from 'react-native'

import { useGridItemStyle } from './use-grid-item-style'
import { Typography } from '@/ui/typography'

import { GRID_ITEM } from '@/ui/tokens/components'

export const GridItem = ({
    title,
    icon: Icon,
    active = false,
    testID,
    onPress
}) => {
    const { container, fill, ripple, contentColor } = useGridItemStyle(active)

    return (
        <View style={[styles.container, container]}>
            <Pressable
                testID={testID}
                android_ripple={ripple}
                accessibilityRole='button'
                accessibilityState={{ selected: active }}
                style={[styles.item, fill]}
                onPress={onPress}
            >
                {!!Icon && (
                    <Icon
                        width={GRID_ITEM.iconSize}
                        height={GRID_ITEM.iconSize}
                        color={contentColor}
                    />
                )}

                <Typography
                    numberOfLines={1}
                    color={contentColor}
                    styleProps={styles.title}
                >
                    {title}
                </Typography>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden'
    },
    item: {
        alignItems: 'center',
        flexDirection: 'row',
        height: GRID_ITEM.height,
        paddingHorizontal: GRID_ITEM.padding,
        gap: GRID_ITEM.gap
    },
    title: {
        flex: 1
    }
})

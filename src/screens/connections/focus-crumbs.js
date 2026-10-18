import { Fragment, memo, useCallback, useRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { EntityIcon } from './entity-icon'
import { Typography } from '@/components/typography'

import { ChevronRight } from '@/icons/chevron-right'

import { FOCUS } from '@/constants/connections'
import { ICON_SIZE, OPACITY, SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

const Crumb = memo(function Crumb({ entity, title, index, active, onJump }) {
    const { colors } = useTheme()

    const color = active ? colors.tertiary : colors.onBackground
    const onPress = useCallback(() => onJump(index), [onJump, index])

    return (
        <View
            style={[
                styles.crumb,
                {
                    backgroundColor: active
                        ? colors.tertiary + TRANSPARENT[20]
                        : colors.surfaceVariant
                }
            ]}
        >
            <TouchableRipple
                accessibilityRole='button'
                accessibilityLabel={title}
                disabled={active}
                onPress={onPress}
                style={styles.touch}
            >
                <>
                    <EntityIcon
                        entity={entity}
                        title={title}
                        width={ICON_SIZE.md}
                        height={ICON_SIZE.md}
                        color={color}
                    />
                    <Typography
                        uppercase
                        numberOfLines={1}
                        fontSize={FOCUS.crumbFontSize}
                        color={color}
                        opacity={active ? 1 : OPACITY.emphasized}
                        styleProps={styles.title}
                    >
                        {title}
                    </Typography>
                </>
            </TouchableRipple>
        </View>
    )
})

export const FocusCrumbs = memo(function FocusCrumbs({ trail, getTitle, onJump }) {
    const { colors } = useTheme()
    const scroll = useRef(null)

    const scrollToEnd = useCallback(() => {
        scroll.current?.scrollToEnd({ animated: true })
    }, [])

    return (
        <ScrollView
            horizontal
            ref={scroll}
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
            contentContainerStyle={styles.crumbs}
        >
            {trail.map((entity, index) => (
                <Fragment key={`${entity.type}:${entity.id}`}>
                    {index > 0 && (
                        <ChevronRight
                            width={ICON_SIZE.lg}
                            height={ICON_SIZE.lg}
                            color={colors.onBackground + TRANSPARENT[60]}
                        />
                    )}

                    <Crumb
                        entity={entity}
                        title={getTitle(entity)}
                        index={index}
                        active={index === trail.length - 1}
                        onJump={onJump}
                    />
                </Fragment>
            ))}
        </ScrollView>
    )
})

const styles = StyleSheet.create({
    crumbs: {
        gap: FOCUS.crumbGap,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center'
    },
    crumb: {
        overflow: 'hidden',
        maxWidth: FOCUS.crumbMaxWidth,
        height: FOCUS.crumbHeight,
        borderRadius: FOCUS.crumbHeight / 2
    },
    touch: {
        gap: SPACING.xs,
        height: FOCUS.crumbHeight,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        flexShrink: 1
    }
})

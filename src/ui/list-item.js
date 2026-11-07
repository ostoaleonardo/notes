import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Column, ListItem as ComposeListItem, RNHostView, Text } from '@expo/ui/jetpack-compose'
import { Shapes, clickable, clip, padding } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { ComposeIcon } from '@/ui/compose-icon'
import { useTheme } from '@/ui/hooks/use-theme'
import { useGroupPosition } from '@/ui/hooks/use-group-position'
import { getCornerRadii } from '@/ui/utils/group-position'

import { COMPOSE_LIST_ITEM } from '@/ui/tokens/components'
import { GROUP_AXES } from '@/ui/tokens/group-position'
import { FONTS, ICON_SIZE, SPACING, TYPOGRAPHY_SIZE_VARIANTS } from '@/ui/tokens/theme'
import { TINT, TRANSPARENT } from '@/ui/tokens/transparent'

export const ListItem = ({
    title,
    description,
    leftContent,
    leadingIcon,
    rightContent,
    children,
    onPress,
    background,
    uppercase = true
}) => {
    const { colors } = useTheme()
    const position = useGroupPosition()
    const radii = getCornerRadii(position, GROUP_AXES.STACKED)

    const container = background ?? colors.surface
    const stacked = !!children

    const modifiers = useMemo(() => [
        ...(stacked ? [] : [clip(Shapes.RoundedCorner({
            topStart: radii.topLeft,
            topEnd: radii.topRight,
            bottomStart: radii.bottomLeft,
            bottomEnd: radii.bottomRight
        }))]),
        ...(onPress ? [clickable(onPress)] : [])
    ], [
        stacked,
        radii.topLeft,
        radii.topRight,
        radii.bottomLeft,
        radii.bottomRight,
        onPress
    ])

    const listColors = useMemo(() => ({
        containerColor: stacked ? TRANSPARENT.color : container,
        contentColor: colors.onBackground,
        supportingContentColor: colors.onBackground + TINT.placeholder
    }), [stacked, container, colors])

    const textModifiers = useMemo(() => (
        description
            ? [padding(0, COMPOSE_LIST_ITEM.textPadding, 0, COMPOSE_LIST_ITEM.textPadding)]
            : []
    ), [description])

    const titleStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodyMedium
    }), [])

    const descriptionStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall
    }), [])

    const stackedStyle = useMemo(() => ({
        backgroundColor: container,
        borderTopLeftRadius: radii.topLeft,
        borderTopRightRadius: radii.topRight,
        borderBottomLeftRadius: radii.bottomLeft,
        borderBottomRightRadius: radii.bottomRight
    }), [
        container,
        radii.topLeft,
        radii.topRight,
        radii.bottomLeft,
        radii.bottomRight
    ])

    const row = (
        <ComposeHost
            matchContents={COMPOSE_LIST_ITEM.matchContents}
            style={COMPOSE_LIST_ITEM.hostStyle}
        >
            <ComposeListItem
                colors={listColors}
                modifiers={modifiers}
            >
                <ComposeListItem.HeadlineContent>
                    <Column modifiers={textModifiers}>
                        <Text style={titleStyle}>
                            {uppercase ? title.toLocaleUpperCase() : title}
                        </Text>
                        {!!description && (
                            <Text
                                color={listColors.supportingContentColor}
                                style={descriptionStyle}
                            >
                                {description}
                            </Text>
                        )}
                    </Column>
                </ComposeListItem.HeadlineContent>
                {!!leadingIcon && (
                    <ComposeListItem.LeadingContent>
                        <ComposeIcon
                            icon={leadingIcon}
                            size={ICON_SIZE.lg}
                            color={colors.onBackground}
                        />
                    </ComposeListItem.LeadingContent>
                )}
                {!!leftContent && (
                    <ComposeListItem.LeadingContent>
                        <RNHostView matchContents>
                            {leftContent}
                        </RNHostView>
                    </ComposeListItem.LeadingContent>
                )}
                {!!rightContent && (
                    <ComposeListItem.TrailingContent>
                        <RNHostView matchContents>
                            {rightContent}
                        </RNHostView>
                    </ComposeListItem.TrailingContent>
                )}
            </ComposeListItem>
        </ComposeHost>
    )

    if (!stacked) return row

    return (
        <View style={[styles.stacked, stackedStyle]}>
            {row}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    stacked: {
        overflow: 'hidden'
    },
    content: {
        padding: SPACING.lg,
        paddingTop: 0
    }
})

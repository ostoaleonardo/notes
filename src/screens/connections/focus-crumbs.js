import { Fragment, memo, useCallback, useMemo, useRef } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { EntityIcon } from './entity-icon'
import { Chip } from '@/ui/chip'
import { useTheme } from '@/ui/hooks/use-theme'

import { ChevronRight } from '@/ui/icons/chevron-right'

import { FOCUS } from '@/constants/connections'
import { ICON_SIZE, SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

const Crumb = memo(({
    entity,
    title,
    index,
    active,
    onJump
}) => {
    const { colors } = useTheme()

    const onPress = useCallback(() => {
        if (!active) onJump(index)
    }, [active, onJump, index])
    const chipColors = useMemo(() => ({
        selectedContainerColor: colors.tertiary + TRANSPARENT[20],
        selectedLabelColor: colors.accentText
    }), [colors.tertiary, colors.accentText])

    return (
        <Chip
            selected={active}
            colors={chipColors}
            onPress={onPress}
            leading={(
                <EntityIcon
                    entity={entity}
                    title={title}
                    width={ICON_SIZE.md}
                    height={ICON_SIZE.md}
                    color={active ? colors.accentText : colors.onBackground}
                />
            )}
        >
            {title.toLocaleUpperCase()}
        </Chip>
    )
})

export const FocusCrumbs = memo(({
    trail,
    getTitle,
    onJump
}) => {
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
    }
})

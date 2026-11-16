import { memo, useCallback } from 'react'
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'

import { EntityIcon } from './entity-icon'
import { EntityShape } from './entity-shape'
import { getShapeKind } from './entity-badge'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { ORIGIN_TILE } from '@/constants/connections'
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '@/constants/connections'
import { ICON_SIZE, OPACITY, RADIUS, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const TILE_COLUMNS = ORIGIN_TILE.columns

const Tile = memo(({
    type,
    count,
    selected,
    width,
    onPress
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const isSquare = type === CONNECTION_TYPES.NOTE || type === CONNECTION_TYPES.TAG
    const isFolder = type === CONNECTION_TYPES.FOLDER
    const height = isFolder ? ORIGIN_TILE.folderHeight : ORIGIN_TILE.height
    const label = t(CONNECTION_TYPE_LABELS[type])
    const color = selected ? colors.onTertiary : colors.onBackground
    const handlePress = useCallback(() => onPress(type), [onPress, type])

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={label}
            testID={TEST_IDS.ORIGIN_TILE_PREFIX + type}
            onPress={handlePress}
        >
            <EntityShape
                width={width}
                height={height}
                stroke='transparent'
                kind={getShapeKind({ type })}
                fill={selected ? colors.tertiary : colors.surfaceVariant}
                radius={isSquare ? { borderRadius: RADIUS.xl } : undefined}
                style={styles.tile}
            >
                <EntityIcon
                    entity={{ type }}
                    width={ICON_SIZE.xxl}
                    height={ICON_SIZE.xxl}
                    color={color}
                />
                <View>
                    <Typography
                        color={color}
                        uppercase={true}
                        numberOfLines={1}
                        fontSize={ORIGIN_TILE.labelSize}
                    >
                        {label}
                    </Typography>
                    <Typography
                        color={color}
                        opacity={OPACITY.secondary}
                        fontSize={ORIGIN_TILE.countSize}
                    >
                        {count}
                    </Typography>
                </View>
            </EntityShape>
        </Pressable>
    )
})

export const OriginTiles = memo(({
    types,
    counts,
    selected,
    onSelect
}) => {
    const { width } = useWindowDimensions()

    const tileWidth = (width - SPACING.lg * 2 - SPACING.sm * (TILE_COLUMNS - 1)) / TILE_COLUMNS

    return (
        <View style={styles.row}>
            {types.map((type) => (
                <Tile
                    key={type}
                    type={type}
                    count={counts[type]}
                    selected={type === selected}
                    width={tileWidth}
                    onPress={onSelect}
                />
            ))}
        </View>
    )
})

const styles = StyleSheet.create({
    row: {
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    tile: {
        padding: SPACING.md,
        justifyContent: 'space-between'
    }
})

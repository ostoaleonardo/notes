import { memo, useCallback } from 'react'
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { EntityIcon } from './entity-icon'
import { EntityShape } from './entity-shape'
import { getShapeKind } from './entity-badge'
import { Typography } from '@/components/typography'

import { ORIGIN_TILE } from '@/constants/components'
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '@/constants/connections'
import { ICON_SIZE, OPACITY, SPACING } from '@/constants/theme'

const TILE_COLUMNS = ORIGIN_TILE.columns

const Tile = memo(function Tile({ type, count, selected, width, onPress }) {
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
            onPress={handlePress}
        >
            <EntityShape
                kind={getShapeKind({ type })}
                width={width}
                height={height}
                fill={selected ? colors.tertiary : colors.surfaceVariant}
                stroke='transparent'
                radius={isSquare ? { borderRadius: ORIGIN_TILE.radius } : undefined}
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
                        uppercase
                        fontSize={ORIGIN_TILE.labelSize}
                        color={color}
                        numberOfLines={1}
                    >
                        {label}
                    </Typography>
                    <Typography
                        fontSize={ORIGIN_TILE.countSize}
                        color={color}
                        opacity={OPACITY.secondary}
                    >
                        {count}
                    </Typography>
                </View>
            </EntityShape>
        </Pressable>
    )
})

export const OriginTiles = memo(function OriginTiles({ types, counts, selected, onSelect }) {
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
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    tile: {
        padding: SPACING.md,
        justifyContent: 'space-between'
    }
})

import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { Pressable } from '@/components/button/pressable'
import { Typography } from '@/components/typography'

import { MAX_TABLE_COLS, MAX_TABLE_ROWS, TABLE_CELL_SIZE, TABLE_CELL_GAP } from '@/constants/table'
import { SPACING, RADIUS } from '@/constants/theme'

const ROW_INDEXES = Array.from({ length: MAX_TABLE_ROWS }, (_, index) => index)
const COL_INDEXES = Array.from({ length: MAX_TABLE_COLS }, (_, index) => index)

const claimResponder = () => true

const TableRow = memo(function TableRow({ activeCols, activeStyle, inactiveStyle }) {
    return (
        <View style={styles.row}>
            {COL_INDEXES.map((col) => (
                <View
                    key={col}
                    style={col < activeCols ? activeStyle : inactiveStyle}
                />
            ))}
        </View>
    )
})

export function TableMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const gridRef = useRef(null)
    const origin = useRef({ x: 0, y: 0 })

    const [selected, setSelected] = useState({ rows: 1, cols: 1 })

    const cellStyles = useMemo(() => ({
        active: { ...styles.cell, backgroundColor: colors.primary },
        inactive: { ...styles.cell, backgroundColor: colors.surfaceVariant }
    }), [colors.primary, colors.surfaceVariant])

    const onLayout = useCallback(() => {
        gridRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
            origin.current = { x: pageX, y: pageY }
        })
    }, [])

    const onTouch = useCallback((event) => {
        const { pageX, pageY } = event.nativeEvent
        const relativeX = pageX - origin.current.x
        const relativeY = pageY - origin.current.y
        const step = TABLE_CELL_SIZE + TABLE_CELL_GAP
        const cols = Math.min(MAX_TABLE_COLS, Math.max(1, Math.ceil(relativeX / step)))
        const rows = Math.min(MAX_TABLE_ROWS, Math.max(1, Math.ceil(relativeY / step)))

        setSelected((prev) => (
            prev.cols === cols && prev.rows === rows ? prev : { rows, cols }
        ))
    }, [])

    const onRelease = useCallback(() => {
        onInsert(selected)
        setSelected({ rows: 1, cols: 1 })
        onClose()
    }, [onInsert, onClose, selected])

    return (
        <View style={styles.container}>
            <Typography
                bold
                variant='subtitle'
                textAlign='center'
            >
                {selected.cols} x {selected.rows}
            </Typography>

            <View
                ref={gridRef}
                onLayout={onLayout}
                onStartShouldSetResponder={claimResponder}
                onMoveShouldSetResponder={claimResponder}
                onResponderGrant={onTouch}
                onResponderMove={onTouch}
                onResponderRelease={onRelease}
            >
                {ROW_INDEXES.map((row) => (
                    <TableRow
                        key={row}
                        activeCols={row < selected.rows ? selected.cols : 0}
                        activeStyle={cellStyles.active}
                        inactiveStyle={cellStyles.inactive}
                    />
                ))}
            </View>

            <Pressable
                mode='contained'
                buttonColor={colors.surfaceVariant}
                textColor={colors.onBackground}
                onPress={onClose}
            >
                {t('button.cancel')}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.lg,
        padding: SPACING.xxl,
        alignItems: 'center'
    },
    row: {
        flexDirection: 'row',
        gap: TABLE_CELL_GAP,
        marginTop: TABLE_CELL_GAP
    },
    cell: {
        width: TABLE_CELL_SIZE,
        height: TABLE_CELL_SIZE,
        borderRadius: RADIUS.xs
    }
})

import { useRef, useState } from 'react'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Pressable, Typography } from '@/components'
import { MAX_TABLE_COLS, MAX_TABLE_ROWS, TABLE_CELL_SIZE, TABLE_CELL_GAP } from '@/constants'

export function TableMarkdown({ onClose, onInsert }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const gridRef = useRef(null)
    const origin = useRef({ x: 0, y: 0 })

    const [selected, setSelected] = useState({ rows: 1, cols: 1 })

    const onLayout = () => {
        gridRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
            origin.current = { x: pageX, y: pageY }
        })
    }

    const updateSelection = (pageX, pageY) => {
        const relativeX = pageX - origin.current.x
        const relativeY = pageY - origin.current.y
        const step = TABLE_CELL_SIZE + TABLE_CELL_GAP

        setSelected({
            cols: Math.min(MAX_TABLE_COLS, Math.max(1, Math.ceil(relativeX / step))),
            rows: Math.min(MAX_TABLE_ROWS, Math.max(1, Math.ceil(relativeY / step)))
        })
    }

    const onRelease = () => {
        onInsert(selected)
        setSelected({ rows: 1, cols: 1 })
        onClose()
    }

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
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(e) => updateSelection(e.nativeEvent.pageX, e.nativeEvent.pageY)}
                onResponderMove={(e) => updateSelection(e.nativeEvent.pageX, e.nativeEvent.pageY)}
                onResponderRelease={onRelease}
            >
                {Array.from({ length: MAX_TABLE_ROWS }, (_, row) => (
                    <View key={row} style={styles.row}>
                        {Array.from({ length: MAX_TABLE_COLS }, (_, col) => (
                            <View
                                key={col}
                                style={{
                                    ...styles.cell,
                                    backgroundColor: row < selected.rows && col < selected.cols
                                        ? colors.primary
                                        : colors.surfaceVariant
                                }}
                            />
                        ))}
                    </View>
                ))}
            </View>

            <Pressable
                compact
                mode='outlined'
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
        gap: 16,
        padding: 24,
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
        borderRadius: 4
    }
})

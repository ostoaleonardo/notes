import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { IconToggle } from './icon-toggle'

import { expandSelected as expandButtons, getMinWidth, getPosition } from '@/utils/toggle-group'

import { BUTTON } from '@/constants/components'

export function IconToggleGroup({ buttons, background, expandSelected = false }) {
    const { colors } = useTheme()
    const [widths, setWidths] = useState({})

    const onWidth = useCallback((label, width) => {
        setWidths((current) => (
            current[label] === width ? current : { ...current, [label]: width }
        ))
    }, [])

    const items = useMemo(() => (
        expandSelected ? expandButtons(buttons) : buttons
    ), [buttons, expandSelected])

    const minWidth = getMinWidth(items, widths)

    return (
        <View style={styles.group}>
            {items.map((button, index) => (
                <IconToggle
                    key={button.label}
                    position={getPosition(index, items.length)}
                    background={background ?? colors.surfaceVariant}
                    color={colors.onBackground}
                    minWidth={minWidth}
                    onWidth={onWidth}
                    {...button}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: BUTTON.groupGap,
        flexDirection: 'row'
    }
})

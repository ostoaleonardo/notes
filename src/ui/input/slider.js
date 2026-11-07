import { useMemo } from 'react'
import { Host, Slider as ComposeSlider } from '@expo/ui/jetpack-compose'

import { getSliderColors } from '@/ui/utils/compose-colors'
import { useTheme } from '@/ui/hooks/use-theme'

import { SLIDER } from '@/ui/tokens/components'

export const Slider = ({
    value,
    min,
    max,
    steps,
    onValueChange,
    onValueChangeFinished
}) => {
    const { colors, dark } = useTheme()
    const sliderColors = useMemo(() => getSliderColors(colors), [colors])

    return (
        <Host
            colorScheme={dark ? 'dark' : 'light'}
            matchContents={SLIDER.matchContents}
            style={SLIDER.hostStyle}
        >
            <ComposeSlider
                value={value}
                min={min}
                max={max}
                steps={steps}
                colors={sliderColors}
                onValueChange={onValueChange}
                onValueChangeFinished={onValueChangeFinished}
            />
        </Host>
    )
}

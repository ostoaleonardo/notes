import { Path, Svg } from 'react-native-svg'

import { KEYBOARD_ARROW_DOWN_ICON_PATH } from '@/constants/icon-paths'

export const KeyboardArrowDown = (props) => (
    <Svg width='24' height='24' viewBox='0 -960 960 960' fill='currentColor' {...props}>
        <Path d={KEYBOARD_ARROW_DOWN_ICON_PATH} />
    </Svg>
)

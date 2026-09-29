import { Path, Svg } from 'react-native-svg'

import { CLOSE_ICON_PATH } from '@/constants/icon-paths'

export const Close = (props) => (
    <Svg width='24' height='24' viewBox='0 -960 960 960' fill='currentColor' {...props}>
        <Path d={CLOSE_ICON_PATH} />
    </Svg>
)

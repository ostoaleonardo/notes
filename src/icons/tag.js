import { Path, Svg } from 'react-native-svg'

import { TAG_ICON_PATH } from '@/constants/icon-paths'

export const Tag = (props) => (
    <Svg width='24' height='24' viewBox='0 -960 960 960' fill='currentColor' {...props}>
        <Path d={TAG_ICON_PATH} />
    </Svg>
)

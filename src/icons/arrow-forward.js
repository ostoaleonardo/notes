import { Path } from 'react-native-svg'

import { ARROW_FORWARD_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from './icon-svg'

export const ArrowForward = (props) => (
    <IconSvg {...props}>
        <Path d={ARROW_FORWARD_ICON_PATH} />
    </IconSvg>
)

import { Path } from 'react-native-svg'

import { ARROW_BACK_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from './icon-svg'

export const ArrowBack = (props) => (
    <IconSvg {...props}>
        <Path d={ARROW_BACK_ICON_PATH} />
    </IconSvg>
)

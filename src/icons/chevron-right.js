import { Path } from 'react-native-svg'

import { CHEVRON_RIGHT_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from './icon-svg'

export const ChevronRight = (props) => (
    <IconSvg {...props}>
        <Path d={CHEVRON_RIGHT_ICON_PATH} />
    </IconSvg>
)

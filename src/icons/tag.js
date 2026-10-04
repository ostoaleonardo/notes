import { Path } from 'react-native-svg'

import { TAG_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from './icon-svg'

export const Tag = (props) => (
    <IconSvg {...props}>
        <Path d={TAG_ICON_PATH} />
    </IconSvg>
)

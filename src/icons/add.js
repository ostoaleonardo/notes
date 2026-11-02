import { Path } from 'react-native-svg'

import { ADD_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Add = (props) => (
    <IconSvg {...props}>
        <Path d={ADD_ICON_PATH} />
    </IconSvg>
)

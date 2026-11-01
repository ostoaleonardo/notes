import { Path } from 'react-native-svg'

import { CLOSE_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Close = (props) => (
    <IconSvg {...props}>
        <Path d={CLOSE_ICON_PATH} />
    </IconSvg>
)

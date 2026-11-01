import { Path } from 'react-native-svg'

import { PLUS_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Plus = (props) => (
    <IconSvg {...props}>
        <Path d={PLUS_ICON_PATH} />
    </IconSvg>
)

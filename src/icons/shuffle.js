import { Path } from 'react-native-svg'

import { SHUFFLE_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Shuffle = (props) => (
    <IconSvg {...props}>
        <Path d={SHUFFLE_ICON_PATH} />
    </IconSvg>
)

Shuffle.source = require('./xml/shuffle_sharp_wght100.xml')

import { Path } from 'react-native-svg'

import { TAG_ICON_PATH } from '@/constants/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Tag = (props) => (
    <IconSvg {...props}>
        <Path d={TAG_ICON_PATH} />
    </IconSvg>
)

Tag.source = require('./xml/tag_sharp_wght100.xml')

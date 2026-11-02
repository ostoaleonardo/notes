import { Path } from 'react-native-svg'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Folder = (props) => (
    <IconSvg {...props}>
        <Path d='M120-200v-560h263.85l80 80H840v480H120Zm40-40h640v-400H447.77l-80-80H160v480Zm0 0v-480 480Z' />
    </IconSvg>
)

Folder.source = require('./xml/folder_sharp_wght100.xml')

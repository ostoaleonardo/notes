import { Path } from 'react-native-svg'

import { IconSvg } from '@/ui/icons/icon-svg'

import { ATTACH_FILE_ICON_PATH } from '@/constants/icon-paths'

export const AttachFile = (props) => (
    <IconSvg {...props}>
        <Path d={ATTACH_FILE_ICON_PATH} />
    </IconSvg>
)

AttachFile.source = require('./xml/attach_file_sharp_wght100.xml')

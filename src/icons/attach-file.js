import { Path } from 'react-native-svg'

import { IconSvg } from './icon-svg'

import { ATTACH_FILE_ICON_PATH } from '@/constants/icon-paths'

export const AttachFile = (props) => (
    <IconSvg {...props}>
        <Path d={ATTACH_FILE_ICON_PATH} />
    </IconSvg>
)

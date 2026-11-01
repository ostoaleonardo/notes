import { Path } from 'react-native-svg'

import { KEYBOARD_ARROW_DOWN_ICON_PATH } from '@/ui/tokens/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const KeyboardArrowDown = (props) => (
    <IconSvg {...props}>
        <Path d={KEYBOARD_ARROW_DOWN_ICON_PATH} />
    </IconSvg>
)

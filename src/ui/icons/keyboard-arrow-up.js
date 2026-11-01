import { Path } from 'react-native-svg'

import { KEYBOARD_ARROW_UP_ICON_PATH } from '@/ui/tokens/icon-paths'

import { IconSvg } from '@/ui/icons/icon-svg'

export const KeyboardArrowUp = (props) => (
    <IconSvg {...props}>
        <Path d={KEYBOARD_ARROW_UP_ICON_PATH} />
    </IconSvg>
)

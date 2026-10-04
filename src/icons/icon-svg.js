import { Svg } from 'react-native-svg'

import { ICON_FILL, ICON_SIZE, ICON_VIEW_BOX } from '@/constants/icon-size'

export const IconSvg = (props) => (
    <Svg
        width={ICON_SIZE.default}
        height={ICON_SIZE.default}
        viewBox={ICON_VIEW_BOX}
        fill={ICON_FILL}
        {...props}
    />
)

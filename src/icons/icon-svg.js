import { Svg } from 'react-native-svg'

import { ICON_FILL, ICON_SIZE, ICON_VIEW_BOX } from '@/constants/theme'

export const IconSvg = (props) => (
    <Svg
        width={ICON_SIZE.xxl}
        height={ICON_SIZE.xxl}
        viewBox={ICON_VIEW_BOX}
        fill={ICON_FILL}
        {...props}
    />
)

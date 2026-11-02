import { Path } from 'react-native-svg'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Check = (props) => (
    <IconSvg {...props}>
        <Path d='M382-276 192-466l20-20 170 170 366-366 20 20-386 386Z' />
    </IconSvg>
)

Check.source = require('./xml/check_sharp_wght100.xml')

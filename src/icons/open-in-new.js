import { Path } from 'react-native-svg'

import { IconSvg } from '@/ui/icons/icon-svg'

export const OpenInNew = (props) => (
    <IconSvg {...props}>
        <Path d='M172-172v-616h268v28H200v560h560v-240h28v268H172Zm218-198-20-20 370-370H560v-28h228v228h-28v-180L390-370Z' />
    </IconSvg>
)

OpenInNew.source = require('./xml/open_in_new_sharp_wght100.xml')

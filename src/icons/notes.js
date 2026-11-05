import { Path } from 'react-native-svg'

import { IconSvg } from '@/ui/icons/icon-svg'

export const Notes = (props) => (
    <IconSvg {...props}>
        <Path d='M172 -278L172 -306L548 -306L548 -278L172 -278ZM172 -466L172 -494L788 -494L788 -466L172 -466ZM172 -654L172 -682L788 -682L788 -654L172 -654Z' />
    </IconSvg>
)

Notes.source = require('./xml/notes_sharp_wght100.xml')

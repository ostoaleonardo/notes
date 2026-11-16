import { useContext } from 'react'

import { PropertyIcon } from './dom-icon'
import { ThemeContext } from '@/features/editor/components/markdown/markdown-dom-theme-context'
import { buildPropertyMenuItemStyle } from '@/features/editor/components/markdown/markdown-dom-panel-theme'

import { keepFocus } from '@/features/editor/utils/keep-focus'

export const PropertyMenuItem = ({
    iconPath,
    label,
    onSelect
}) => {
    const theme = useContext(ThemeContext)

    return (
        <div
            onMouseDown={keepFocus}
            onClick={onSelect}
            style={buildPropertyMenuItemStyle(theme)}
        >
            <PropertyIcon path={iconPath} />
            {label}
        </div>
    )
}

import { createContext, useContext } from 'react'
import { Host } from '@expo/ui/jetpack-compose'

import { useTheme } from '@/ui/hooks/use-theme'

export const ComposeContext = createContext(false)

export const ComposeHost = ({ children, ...props }) => {
    const inCompose = useContext(ComposeContext)
    const { dark } = useTheme()

    if (inCompose) return children

    return (
        <Host
            matchContents
            colorScheme={dark ? 'dark' : 'light'}
            {...props}
        >
            {children}
        </Host>
    )
}

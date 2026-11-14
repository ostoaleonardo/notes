import { useState } from 'react'

import { useOnForeground } from './use-on-foreground'
import { hasDirectAccess, requestDirectAccess } from '@/utils/direct-access'

export function useDirectAccess() {
    const [granted, setGranted] = useState(hasDirectAccess)

    useOnForeground(() => setGranted(hasDirectAccess()))

    return { granted, request: requestDirectAccess }
}

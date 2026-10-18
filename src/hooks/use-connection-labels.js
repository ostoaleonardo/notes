import { useCallback } from 'react'

import { entityTitle } from '@/utils/connection-model'

export function useConnectionLabels(model) {
    return useCallback((entity) => entityTitle(entity, model), [model])
}

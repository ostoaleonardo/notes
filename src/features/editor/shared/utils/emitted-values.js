import { DOM_EMITTED_VALUES_LIMIT } from '@/features/editor/dom/constants/editor-sync'

export const rememberEmittedValue = (emitted, value) => {
    emitted.delete(value)
    emitted.add(value)
    if (emitted.size > DOM_EMITTED_VALUES_LIMIT) emitted.delete(emitted.values().next().value)
}

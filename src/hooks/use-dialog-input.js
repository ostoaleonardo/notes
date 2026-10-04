import { useEffect, useRef, useState } from 'react'

export function useCreateDialogInput(visible) {
    const [value, setValue] = useState('')

    useEffect(() => {
        if (visible) setValue('')
    }, [visible])

    const disabled = !value || !value.trim()

    return [value, setValue, disabled]
}

export function useEditDialogInput(key, getInitialValue) {
    const [value, setValue] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const getInitialValueRef = useRef(getInitialValue)
    getInitialValueRef.current = getInitialValue

    useEffect(() => {
        const initial = getInitialValueRef.current(key) || ''
        setValue(initial)
        setPlaceholder(initial)
    }, [key])

    const disabled = !value || !value.trim() || value.trim() === placeholder

    return [value, setValue, placeholder, disabled]
}

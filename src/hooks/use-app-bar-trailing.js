import { useEffect } from 'react'
import { useNavigation } from 'expo-router'

export function useAppBarTrailing(trailing, deps = []) {
    const navigation = useNavigation()

    useEffect(() => {
        navigation.setOptions({ trailing })
    }, deps)
}

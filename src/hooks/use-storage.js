import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/constants'

export function useStorage() {
    const setItem = async (key, value) => {
        await AsyncStorage.setItem(key, value)
    }

    const getItem = async (key) => {
        const value = await AsyncStorage.getItem(key)
        return value
    }

    const clear = async () => {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS))
    }

    return { setItem, getItem, clear }
}

import AsyncStorage from '@react-native-async-storage/async-storage'

export function useStorage() {
    const setItem = async (key, value) => {
        await AsyncStorage.setItem(key, value)
    }

    const getItem = async (key) => {
        const value = await AsyncStorage.getItem(key)
        return value
    }

    return { setItem, getItem }
}

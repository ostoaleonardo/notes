import AsyncStorage from '@react-native-async-storage/async-storage'

export function useStorage() {
    const setItem = async (key, value) => {
        await AsyncStorage.setItem(key, value)
    }

    const getItem = async (key) => {
        const value = await AsyncStorage.getItem(key)
        return value
    }

    const removeItem = async (key) => {
        await AsyncStorage.removeItem(key)
    }

    const getAllKeys = async () => {
        return await AsyncStorage.getAllKeys()
    }

    const multiGet = async (keys) => {
        return await AsyncStorage.multiGet(keys)
    }

    const multiSet = async (entries) => {
        await AsyncStorage.multiSet(entries)
    }

    const multiRemove = async (keys) => {
        await AsyncStorage.multiRemove(keys)
    }

    const clear = async () => {
        const keys = await AsyncStorage.getAllKeys()
        await AsyncStorage.multiRemove(keys)
    }

    return {
        setItem,
        getItem,
        removeItem,
        getAllKeys,
        multiGet,
        multiSet,
        multiRemove,
        clear
    }
}

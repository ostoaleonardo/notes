import AsyncStorage from '@react-native-async-storage/async-storage'

export const storage = {
    setItem: async (key, value) => { await AsyncStorage.setItem(key, value) },
    getItem: async (key) => await AsyncStorage.getItem(key),
    removeItem: async (key) => { await AsyncStorage.removeItem(key) },
    getAllKeys: async () => await AsyncStorage.getAllKeys(),
    multiGet: async (keys) => await AsyncStorage.multiGet(keys),
    multiSet: async (entries) => { await AsyncStorage.multiSet(entries) },
    multiRemove: async (keys) => { await AsyncStorage.multiRemove(keys) }
}

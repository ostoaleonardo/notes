import { NativeModules } from 'react-native'

const SHARED_STORAGE = {
    NOTES: 'notes'
}

const { SharedStorage, Widget } = NativeModules

export function useNativeModules() {
    const setStorage = (value) => {
        SharedStorage.setItem(SHARED_STORAGE.NOTES, value)
    }

    const updateWidget = (id) => {
        Widget.updateWidget(id)
    }

    const deleteWidget = (id) => {
        Widget.deleteWidget(id)
    }

    return {
        setStorage,
        updateWidget,
        deleteWidget
    }
}

import {
    getCameraPermissionsAsync,
    launchCameraAsync,
    launchImageLibraryAsync,
    requestCameraPermissionsAsync
} from 'expo-image-picker'

import { IMAGE_PICKER_OPTIONS, IMAGE_SOURCES } from '@/constants/image'

export const getCameraPermission = () => getCameraPermissionsAsync()
export const requestCameraPermission = () => requestCameraPermissionsAsync()

export const openImagePicker = async (type) => {
    let result = null

    if (type === IMAGE_SOURCES.CAMERA) {
        result = await launchCameraAsync(IMAGE_PICKER_OPTIONS)
    } else if (type === IMAGE_SOURCES.GALLERY) {
        result = await launchImageLibraryAsync(IMAGE_PICKER_OPTIONS)
    }

    return result && !result.canceled ? result.assets[0] : null
}

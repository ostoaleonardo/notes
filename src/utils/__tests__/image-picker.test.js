import * as ImagePicker from 'expo-image-picker'

import {
    getCameraPermission,
    openImagePicker,
    requestCameraPermission
} from '../image-picker'
import { IMAGE_PICKER_OPTIONS, IMAGE_SOURCES } from '@/constants/image'

jest.mock('expo-image-picker', () => ({
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn()
}))

const asset = { uri: 'file:///photo.jpg' }

describe('image picker', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ImagePicker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [asset] })
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({
            canceled: false,
            assets: [asset]
        })
    })

    test('opens the camera and returns the first asset', async () => {
        const result = await openImagePicker(IMAGE_SOURCES.CAMERA)

        expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(IMAGE_PICKER_OPTIONS)
        expect(result).toBe(asset)
    })

    test('opens the gallery and returns the first asset', async () => {
        const result = await openImagePicker(IMAGE_SOURCES.GALLERY)

        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(IMAGE_PICKER_OPTIONS)
        expect(result).toBe(asset)
    })

    test('returns null when the user cancels', async () => {
        ImagePicker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null })

        expect(await openImagePicker(IMAGE_SOURCES.CAMERA)).toBeNull()
    })

    test('returns null for an unknown source', async () => {
        expect(await openImagePicker('unknown')).toBeNull()
        expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled()
        expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled()
    })

    test('delegates camera permission checks and requests', async () => {
        ImagePicker.getCameraPermissionsAsync.mockResolvedValue({ granted: true })
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false })

        expect(await getCameraPermission()).toEqual({ granted: true })
        expect(await requestCameraPermission()).toEqual({ granted: false })
    })
})

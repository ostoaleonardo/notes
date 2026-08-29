import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

const ignoreRejection = (promise) => promise.catch(() => {})

export const useAllowLandscape = () => {
    useEffect(() => {
        ignoreRejection(ScreenOrientation.unlockAsync())

        return () => {
            ignoreRejection(ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP))
        }
    }, [])
}

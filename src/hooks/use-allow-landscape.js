import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

export const useAllowLandscape = () => {
    useEffect(() => {
        ScreenOrientation.unlockAsync()

        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        }
    }, [])
}

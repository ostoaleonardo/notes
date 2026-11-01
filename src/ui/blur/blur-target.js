import { createContext, useContext, useRef } from 'react'
import { View } from 'react-native'
import { BlurTargetView } from 'expo-blur'

const BlurTargetContext = createContext(null)

export const useBlurTarget = () => useContext(BlurTargetContext)

export function BlurTargetProvider({ children, style }) {
    const targetRef = useRef(null)

    return (
        <BlurTargetContext.Provider value={targetRef}>
            <View style={style}>
                {children}
            </View>
        </BlurTargetContext.Provider>
    )
}

export function BlurTarget({ children, style }) {
    const targetRef = useBlurTarget()

    return (
        <BlurTargetView ref={targetRef} style={style}>
            {children}
        </BlurTargetView>
    )
}

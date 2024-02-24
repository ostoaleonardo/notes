import { GestureHandlerRootView } from 'react-native-gesture-handler'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {children}
        </GestureHandlerRootView>
    )
}

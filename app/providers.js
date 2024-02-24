import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NoteProvider } from '../src/context/NoteContext'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NoteProvider>
                {children}
            </NoteProvider>
        </GestureHandlerRootView>
    )
}

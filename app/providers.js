import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, NoteProvider } from '@/context'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <NoteProvider>
                    {children}
                </NoteProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

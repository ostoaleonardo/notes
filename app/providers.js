import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, NoteProvider, SyncProvider } from '@/context'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <SyncProvider>
                    <NoteProvider>
                        {children}
                    </NoteProvider>
                </SyncProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

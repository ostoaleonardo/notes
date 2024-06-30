import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider, SyncProvider } from '@/context'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <SyncProvider>
                    <NoteProvider>
                        <BottomSheetModalProvider>
                            {children}
                        </BottomSheetModalProvider>
                    </NoteProvider>
                </SyncProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

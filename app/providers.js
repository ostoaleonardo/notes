import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider } from '@/context'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <NoteProvider>
                    <BottomSheetModalProvider>
                        {children}
                    </BottomSheetModalProvider>
                </NoteProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

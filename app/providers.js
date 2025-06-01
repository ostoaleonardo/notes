import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider, UtilsProvider } from '@/context'

export default function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <UtilsProvider>
                    <NoteProvider>
                        <BottomSheetModalProvider>
                            {children}
                        </BottomSheetModalProvider>
                    </NoteProvider>
                </UtilsProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

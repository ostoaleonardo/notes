import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider, UtilsProvider } from '@/context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
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

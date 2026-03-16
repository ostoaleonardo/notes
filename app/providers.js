import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider, UtilsProvider } from '@/context'
import { SyncProvider } from '@/context/sync-context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <AuthProvider>
                <UtilsProvider>
                    <NoteProvider>
                        <SyncProvider>
                            <KeyboardProvider>
                                <BottomSheetModalProvider>
                                    {children}
                                </BottomSheetModalProvider>
                            </KeyboardProvider>
                        </SyncProvider>
                    </NoteProvider>
                </UtilsProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

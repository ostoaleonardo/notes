import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
    AuthProvider,
    ImportProvider,
    NoteProvider,
    UtilsProvider
} from '@/context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <AuthProvider>
                <UtilsProvider>
                    <NoteProvider>
                        <ImportProvider>
                            <KeyboardProvider>
                                <BottomSheetModalProvider>
                                    {children}
                                </BottomSheetModalProvider>
                            </KeyboardProvider>
                        </ImportProvider>
                    </NoteProvider>
                </UtilsProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
    AuthProvider,
    NoteProvider,
    SyncProvider,
    SyncUtilsProvider,
    UtilsProvider
} from '@/context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <AuthProvider>
                <UtilsProvider>
                    <NoteProvider>
                        <SyncProvider>
                            <SyncUtilsProvider>
                                <KeyboardProvider>
                                    <BottomSheetModalProvider>
                                        {children}
                                    </BottomSheetModalProvider>
                                </KeyboardProvider>
                            </SyncUtilsProvider>
                        </SyncProvider>
                    </NoteProvider>
                </UtilsProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

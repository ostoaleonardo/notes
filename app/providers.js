import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
    CurrentNoteProvider,
    ImportProvider,
    NoteProvider,
    RepositoryProvider,
    UtilsProvider
} from '@/context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <UtilsProvider>
                <RepositoryProvider>
                    <NoteProvider>
                        <CurrentNoteProvider>
                            <ImportProvider>
                                <KeyboardProvider>
                                    <BottomSheetModalProvider>
                                        {children}
                                    </BottomSheetModalProvider>
                                </KeyboardProvider>
                            </ImportProvider>
                        </CurrentNoteProvider>
                    </NoteProvider>
                </RepositoryProvider>
            </UtilsProvider>
        </GestureHandlerRootView>
    )
}

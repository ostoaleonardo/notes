import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { RepositoryGate } from '@/components'
import { useDevMenu } from '@/hooks'
import {
    AuthProvider,
    ImportProvider,
    NoteProvider,
    RepositoryProvider,
    UtilsProvider
} from '@/context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    useDevMenu()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <AuthProvider>
                <UtilsProvider>
                    <RepositoryProvider>
                        <RepositoryGate>
                            <NoteProvider>
                                <ImportProvider>
                                    <KeyboardProvider>
                                        <BottomSheetModalProvider>
                                            {children}
                                        </BottomSheetModalProvider>
                                    </KeyboardProvider>
                                </ImportProvider>
                            </NoteProvider>
                        </RepositoryGate>
                    </RepositoryProvider>
                </UtilsProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

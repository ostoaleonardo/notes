import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import {
    ImportProvider,
    NoteProvider,
    RepositoryProvider,
    TabsProvider,
    UtilsProvider
} from '@/context'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <UtilsProvider>
                <RepositoryProvider>
                    <NoteProvider>
                        <TabsProvider>
                            <ImportProvider>
                                <KeyboardProvider>
                                    <BottomSheetModalProvider>
                                        {children}
                                    </BottomSheetModalProvider>
                                </KeyboardProvider>
                            </ImportProvider>
                        </TabsProvider>
                    </NoteProvider>
                </RepositoryProvider>
            </UtilsProvider>
        </GestureHandlerRootView>
    )
}

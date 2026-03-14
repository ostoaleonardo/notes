import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider, UtilsProvider } from '@/context'
import { PremiumProvider } from '@/hooks/use-premium'

export default function Providers({ children }) {
    const { bottom } = useSafeAreaInsets()

    return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: bottom }}>
            <AuthProvider>
                <PremiumProvider>
                    <UtilsProvider>
                        <NoteProvider>
                            <KeyboardProvider>
                                <BottomSheetModalProvider>
                                    {children}
                                </BottomSheetModalProvider>
                            </KeyboardProvider>
                        </NoteProvider>
                    </UtilsProvider>
                </PremiumProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    )
}

import { useEffect, useState } from 'react'
import { PaperProvider } from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { AuthProvider, NoteProvider, ThemeProvider } from '@/context'
import { THEMES } from '@/constants'

export function Providers({ userTheme, children }) {
    const [theme, setTheme] = useState('')

    useEffect(() => {
        setTheme(THEMES[userTheme])
    }, [userTheme])

    return (
        <ThemeProvider setTheme={setTheme}>
            <PaperProvider theme={theme}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <AuthProvider>
                        <NoteProvider>
                            <BottomSheetModalProvider>
                                {children}
                            </BottomSheetModalProvider>
                        </NoteProvider>
                    </AuthProvider>
                </GestureHandlerRootView>
            </PaperProvider>
        </ThemeProvider>
    )
}

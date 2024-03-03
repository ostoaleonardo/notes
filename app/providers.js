import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NoteProvider } from '../src/context/NoteContext'
import { ThemeProvider } from '../src/context/ThemeContext'

export function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NoteProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </NoteProvider>
        </GestureHandlerRootView>
    )
}

import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

import { CurrentNoteProvider } from '@/context/current-note-context'
import { ImportProvider } from '@/context/import-context'
import { NoteProvider } from '@/context/note-context'
import { NotesApiProvider } from '@/context/notes-api-context'
import { RecentNotesProvider } from '@/context/recent-notes-context'
import { RepositoryProvider } from '@/context/repository-context'
import { UtilsProvider } from '@/context/utils-context'
import { WidgetsProvider } from '@/context/widgets-provider'
import { GlobalSnackbarHost } from '@/ui/snackbar/snackbar-host'

export default function Providers({ children }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <UtilsProvider>
                <RepositoryProvider>
                    <RecentNotesProvider>
                        <NoteProvider>
                            <NotesApiProvider>
                                <CurrentNoteProvider>
                                    <WidgetsProvider>
                                        <ImportProvider>
                                            <KeyboardProvider>
                                                <BottomSheetModalProvider>
                                                    {children}
                                                </BottomSheetModalProvider>
                                            </KeyboardProvider>
                                        </ImportProvider>
                                    </WidgetsProvider>
                                </CurrentNoteProvider>
                            </NotesApiProvider>
                        </NoteProvider>
                    </RecentNotesProvider>
                </RepositoryProvider>
            </UtilsProvider>
            <GlobalSnackbarHost />
        </GestureHandlerRootView>
    )
}

import { KeyboardProvider } from 'react-native-keyboard-controller'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

import { CurrentNoteProvider } from '@/shared/context/current-note-context'
import { ImportProvider } from '@/shared/context/import-context'
import { NoteProvider } from '@/shared/context/note-context'
import { NotesApiProvider } from '@/shared/context/notes-api-context'
import { RecentNotesProvider } from '@/shared/context/recent-notes-context'
import { RepositoryProvider } from '@/shared/context/repository-context'
import { UtilsProvider } from '@/shared/context/utils-context'
import { WidgetsProvider } from '@/shared/context/widgets-provider'
import { ShareIntentHandler } from '@/features/share/screens/share/share-intent-handler'
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
                                                    <ShareIntentHandler />
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

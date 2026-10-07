import { useTranslation } from 'react-i18next'

import { Pressable } from '@/components/button/pressable'
import { MessageScreen } from '@/components/message-screen'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'

import { REPOSITORY_RESULTS } from '@/constants/repository-results'

export default function RepositoryGate() {
    const { t } = useTranslation()
    const { loading } = useNotes()
    const { activeRepository, addRepository } = useRepositories()

    const onAddRepository = async () => {
        const result = await addRepository()
        if (result === REPOSITORY_RESULTS.ERROR) showSnackbar(t('repositories.add_failed'))
    }

    return (
        <MessageScreen
            title={t('repositories.choose_title')}
            message={t('repositories.choose_message')}
        >
            <Pressable
                compact={true}
                onPress={onAddRepository}
                loading={activeRepository && loading}
                disabled={activeRepository && loading}
            >
                {t('repositories.choose_button')}
            </Pressable>
        </MessageScreen>
    )
}

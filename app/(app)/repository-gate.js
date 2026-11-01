import { useTranslation } from 'react-i18next'

import { Button } from '@/ui/button/button'
import { MessageScreen } from '@/ui/message-screen'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'

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
            title={t('repositories.choose.title')}
            message={t('repositories.choose.message')}
        >
            <Button
                compact={true}
                onPress={onAddRepository}
                loading={activeRepository && loading}
                disabled={activeRepository && loading}
            >
                {t('repositories.choose.button')}
            </Button>
        </MessageScreen>
    )
}

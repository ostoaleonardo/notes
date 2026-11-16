import { useTranslation } from 'react-i18next'

import { FilledButton } from '@/ui/button/filled-button'
import { MessageScreen } from '@/ui/message-screen'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'

import { useNotes } from '@/shared/hooks/use-notes'
import { useRepositories } from '@/shared/hooks/use-repositories'
import { useSingleFlight } from '@/shared/hooks/use-single-flight'
import { setIndexingStatus } from '@/shared/utils/indexing-status'

import { INDEXING_STARTED } from '@/shared/constants/indexing'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'

export default function RepositoryGate() {
    const { t } = useTranslation()
    const { loading } = useNotes()
    const { activeRepository, addRepository } = useRepositories()

    const [onAddRepository, adding] = useSingleFlight(async () => {
        const result = await addRepository(() => setIndexingStatus(INDEXING_STARTED))

        if (!result?.id) setIndexingStatus(null)
        if (result === REPOSITORY_RESULTS.ERROR) showSnackbar(t('repositories.add_failed'))
    })

    return (
        <MessageScreen
            title={t('repositories.choose.title')}
            message={t('repositories.choose.message')}
        >
            <FilledButton
                onPress={onAddRepository}
                loading={adding || (!!activeRepository && loading)}
            >
                {t('repositories.choose.button')}
            </FilledButton>
        </MessageScreen>
    )
}

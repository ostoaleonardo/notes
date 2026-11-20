import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { NameDialog } from '@/features/drawer/components/name-dialog'

import { useFolders } from '@/shared/hooks/use-folders'

import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'

export const AddSubfolder = ({
    visible,
    onDismiss,
    parentId
}) => {
    const { t } = useTranslation()
    const { addSubfolder } = useFolders()

    const onSubmit = async (name) => {
        const result = await addSubfolder(parentId, name)

        if (result === REPOSITORY_RESULTS.PRO_REQUIRED) {
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return false
        }
    }

    return (
        <NameDialog
            title={t('repositories.add_subfolder')}
            visible={visible}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
        />
    )
}

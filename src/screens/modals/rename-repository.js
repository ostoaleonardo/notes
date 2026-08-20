import { StyleSheet, ToastAndroid } from 'react-native'
import { useEffect, useState } from 'react'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES, FONTS } from '@/constants'

export function RenameRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { repositories, renameRepository } = useRepositories()

    const [alias, setAlias] = useState('')
    const [placeholder, setPlaceholder] = useState('')
    const [isDisabled, setIsDisabled] = useState(true)

    const isFolder = !!repositories.find((repository) => repository.id === repositoryId)?.parentId

    useEffect(() => {
        const repository = repositories.find((repository) => repository.id === repositoryId)
        const name = repository?.alias || ''
        setAlias(name)
        setPlaceholder(name)
    }, [repositoryId])

    useEffect(() => {
        const isDisabled = !alias || !alias.trim() || alias.trim() === placeholder
        setIsDisabled(isDisabled)
    }, [alias])

    const onUpdate = async () => {
        if (isDisabled) return

        const result = await renameRepository(repositoryId, alias.trim())
        onDismiss()

        if (result === 'error') {
            ToastAndroid.show(t('repositories.rename_failed'), ToastAndroid.SHORT)
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t(isFolder ? 'repositories.edit_folder' : 'repositories.rename')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    mode='contained'
                    onPress={onUpdate}
                    disabled={isDisabled}
                    labelStyle={styles.label}
                >
                    {t('button.update')}
                </Button>
            }
        >
            <LargeInput
                autoFocus
                value={alias}
                placeholder={placeholder}
                onChangeText={setAlias}
            />
        </DialogModal>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})

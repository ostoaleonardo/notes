import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal, Typography } from '@/components'
import { FONTS } from '@/constants'
import { useFiles } from '@/hooks'

export function ExportBackup({ visible, onDismiss }) {
    const { t } = useTranslation()
    const { exportFile } = useFiles()

    const [code, setCode] = useState('canceled')

    const exportNotes = async (type) => {
        const code = await exportFile(type)
        setCode(code)
    }

    const renderActions = () => {
        switch (code) {
            case 'ok':
                return (
                    <Button
                        mode='contained'
                        onPress={onDismiss}
                        labelStyle={styles.label}
                    >
                        {t('button.ok')}
                    </Button>
                )
            case 'canceled':
                return (
                    <View style={styles.buttons}>
                        <Button
                            mode='contained'
                            onPress={() => exportNotes('json')}
                            labelStyle={styles.label}
                        >
                            JSON
                        </Button>
                        <Button
                            mode='contained'
                            onPress={() => exportNotes('txt')}
                            labelStyle={styles.label}
                        >
                            TXT
                        </Button>
                    </View>
                )
        }
    }

    return (
        <DialogModal
            title={t('title.backup')}
            visible={visible}
            onDismiss={onDismiss}
            actions={renderActions()}
        >
            <Typography
                variant='caption'
            >
                {t(code === 'ok' ? 'backup.export' : 'backup.format')}
            </Typography>
        </DialogModal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        gap: 8
    },
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})

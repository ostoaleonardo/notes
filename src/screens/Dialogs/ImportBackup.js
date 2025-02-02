import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal, MarkdownDisplay, Typography } from '@/components'
import { FONTS, ROUTES } from '@/constants'

export function ImportBackup({ visible, onDismiss, code }) {
    const { t } = useTranslation()

    const renderError = () => {
        switch (code) {
            case 'errorTitle':
                return (
                    <MarkdownDisplay>
                        {`\`\`\` \n"title": "🌎 Hello World"`}
                    </MarkdownDisplay>
                )
            case 'errorNote':
                return (
                    <MarkdownDisplay>
                        {`\`\`\` \n"note": "notes @ monospace"`}
                    </MarkdownDisplay>
                )
            case 'errorCreatedAt':
                return (
                    <MarkdownDisplay>
                        {`\`\`\` \n"createdAt": 1729990313670`}
                    </MarkdownDisplay>
                )
            case 'errorBiometrics':
                return (
                    <MarkdownDisplay>
                        {`\`\`\` \n"biometrics": true`}
                    </MarkdownDisplay>
                )
        }
    }

    return (
        <DialogModal
            title={t('title.backup')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    mode='contained'
                    onPress={() => router.navigate(ROUTES.HOME)}
                    labelStyle={styles.label}
                >
                    {t('button.ok')}
                </Button>
            }
        >
            <Typography
                variant='caption'
            >
                {t('backup.import.messages.' + code)}
            </Typography>

            {code !== 'ok' && (
                <View style={styles.markdown}>
                    {renderError()}
                </View>
            )}
        </DialogModal>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    },
    markdown: {
        marginTop: 16
    }
})

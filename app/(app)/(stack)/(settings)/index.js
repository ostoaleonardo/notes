import { Linking } from 'react-native'
import { router } from 'expo-router'
import { Switch, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Section, Separator, Scroll } from '@/components'
import { AppVersionCard, ExportBackup, ImportBackup, Languages, Option } from '@/screens'
import { useBottomSheet, useFiles, useMarkdown } from '@/hooks'
import { ArrowForward, OpenInNew } from '@/icons'
import { LINKS, ROUTES } from '@/constants'
import { useState } from 'react'

export default function Settings() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { importFile } = useFiles()
    const { markdown, toggleMarkdown } = useMarkdown()
    const { ref, onOpen, onClose } = useBottomSheet()

    const [code, setCode] = useState('')
    const [importVisible, setImportVisible] = useState(false)
    const [exportVisible, setExportVisible] = useState(false)

    const showImportDialog = () => setImportVisible(true)
    const hideImportDialog = () => setImportVisible(false)

    const showExportDialog = () => setExportVisible(true)
    const hideExportDialog = () => setExportVisible(false)

    const importBackup = async () => {
        const code = await importFile()

        if (code !== 'canceled') {
            setCode(code)
            showImportDialog()
        }
    }

    const onToggleMarkdown = () => toggleMarkdown(!markdown)

    const iconProps = {
        color: colors.onBackground
    }

    return (
        <>
            <Scroll
                contentContainerStyle={{
                    gap: 24,
                    paddingBottom: 24
                }}
            >
                <Section>
                    <Option
                        title={t('settings.language')}
                        description={t('language')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={onOpen}
                    />
                    <Option
                        title={t('settings.theme')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={() => router.push(ROUTES.THEME)}
                    />
                    <Option
                        title={t('settings.markdown')}
                        description={t('settings.mdOptions')}
                        rightContent={
                            <Switch
                                value={markdown}
                                onValueChange={onToggleMarkdown}
                            />
                        }
                    />
                </Section>

                <Separator style={{ marginHorizontal: 24 }} />

                {/* <Section
                    title={t('title.backup')}
                >
                    <Option
                        title={t('backup.import.title')}
                        description={t('backup.fromFile')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={importBackup}
                    />
                    <Option
                        title={t('backup.export.title')}
                        description={t('backup.toFile')}
                        rightContent={<ArrowForward {...iconProps} />}
                        onPress={showExportDialog}
                    />
                </Section>

                <Separator style={{ marginHorizontal: 24 }} /> */}

                <Section
                    title={t('title.about')}
                >
                    <Option
                        title={t('settings.github')}
                        description={t('settings.features')}
                        rightContent={<OpenInNew {...iconProps} />}
                        onPress={() => Linking.openURL(LINKS.GITHUB)}
                    />
                    <Option
                        title={t('settings.contribute')}
                        description={t('settings.translate')}
                        rightContent={<OpenInNew {...iconProps} />}
                        onPress={() => Linking.openURL(LINKS.TRANSLATIONS)}
                    />
                    <AppVersionCard />
                </Section>

                <Languages
                    ref={ref}
                    onClose={onClose}
                />
            </Scroll>

            <ImportBackup
                visible={importVisible}
                onDismiss={hideImportDialog}
                code={code}
            />
            <ExportBackup
                visible={exportVisible}
                onDismiss={hideExportDialog}
            />
        </>
    )
}

import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AnimatedList, FloatingButton } from '@/components'
import { TemplateItem } from '@/screens/templates'
import { AddTemplate } from '@/screens/modals'
import { useTemplates } from '@/hooks'
import { ROUTES } from '@/constants'
import { Plus } from '@/icons'

export default function Templates() {
    const { t } = useTranslation()
    const { listTemplates, deleteTemplate } = useTemplates()

    const [templates, setTemplates] = useState([])
    const [isOpen, setIsOpen] = useState(null)
    const [addVisible, setAddVisible] = useState(false)

    const refresh = useCallback(() => {
        listTemplates().then(setTemplates)
    }, [])

    useFocusEffect(refresh)

    const onDelete = async (filename) => {
        await deleteTemplate(filename)
        refresh()
    }

    return (
        <View style={{ flex: 1 }}>
            <AnimatedList
                gap={2}
                data={templates}
                keyExtractor={(template) => template.filename}
                emptyLabel={t('message.notes.empty')}
                renderItem={({ item, index }) => (
                    <TemplateItem
                        template={item}
                        isOpen={isOpen === item.filename}
                        onOpen={() => setIsOpen(item.filename)}
                        onPress={() => router.push(ROUTES.EDIT_TEMPLATE + encodeURIComponent(item.filename))}
                        onDelete={() => onDelete(item.filename)}
                        isFirst={index === 0}
                        isLast={index === templates.length - 1}
                    />
                )}
            />

            <FloatingButton
                icon={<Plus />}
                onPress={() => setAddVisible(true)}
            />

            <AddTemplate
                visible={addVisible}
                onDismiss={() => {
                    setAddVisible(false)
                    refresh()
                }}
            />
        </View>
    )
}

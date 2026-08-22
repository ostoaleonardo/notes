import { useCallback, useState } from 'react'
import { View, useWindowDimensions } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AnimatedList, FloatingButton } from '@/components'
import { TemplateItem } from '@/screens/templates'
import { AddTemplate } from '@/screens/modals'
import { useTemplates } from '@/hooks'
import { GRID_BREAKPOINT_WIDTH, ROUTES } from '@/constants'
import { Plus } from '@/icons'

export default function Templates() {
    const { t } = useTranslation()
    const { listTemplates } = useTemplates()
    const { width } = useWindowDimensions()

    const [templates, setTemplates] = useState([])
    const [addVisible, setAddVisible] = useState(false)

    const numColumns = width >= GRID_BREAKPOINT_WIDTH ? 2 : 1

    const refresh = useCallback(() => {
        listTemplates().then(setTemplates)
    }, [])

    useFocusEffect(refresh)

    return (
        <View style={{ flex: 1 }}>
            <AnimatedList
                key={numColumns}
                gap={12}
                numColumns={numColumns}
                data={templates}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                columnWrapperStyle={numColumns > 1 ? { gap: 12 } : undefined}
                keyExtractor={(template) => template.filename}
                emptyLabel={t('message.notes.empty')}
                renderItem={({ item }) => (
                    <TemplateItem
                        template={item}
                        onPress={() => router.push(ROUTES.EDIT_TEMPLATE + encodeURIComponent(item.filename))}
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

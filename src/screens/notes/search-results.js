import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'

import { EntityRow } from '@/screens/connections/entity-row'
import { AnimatedList } from '@/ui/animated/animated-list'
import { AnimatedView } from '@/ui/animated/animated-view'
import { GroupedList } from '@/ui/grouped-list'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'
import { useTheme } from '@/ui/hooks/use-theme'

import { makeEntity } from '@/utils/connection-model'

import { CONNECTION_TYPES } from '@/constants/connections'
import { SPACING } from '@/constants/theme'

const getNotePath = (note) => note.path

export function SearchResults({ results, aliasById, onOpenResult }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const bottom = useSheetBottomSpacing()

    const onPress = (entity) => onOpenResult(entity.id)

    return (
        <View style={styles.container}>
            <GroupedList
                component={AnimatedList}
                gap={SPACING.xxxs}
                data={results}
                keyExtractor={getNotePath}
                emptyLabel={t('message.notes.empty')}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={[styles.list, { paddingBottom: bottom }]}
                renderItem={({ item }) => (
                    <AnimatedView
                        entering={FadeInUp}
                        exiting={FadeOutUp}
                    >
                        <EntityRow
                            entity={makeEntity(CONNECTION_TYPES.NOTE, item.path)}
                            title={item.title || t('notes.untitled')}
                            caption={aliasById.get(item.repositoryId)}
                            background={colors.surfaceVariant}
                            onPress={onPress}
                        />
                    </AnimatedView>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    list: {
        paddingHorizontal: SPACING.lg
    }
})

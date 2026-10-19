import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'

import { EntityRow } from '@/screens/connections/entity-row'
import { AnimatedList } from '@/components/animated/animated-list'
import { AnimatedView } from '@/components/animated/animated-view'

import { makeEntity } from '@/utils/connection-model'

import { CONNECTION_TYPES } from '@/constants/connections'
import { SPACING } from '@/constants/theme'

const getNotePath = (note) => note.path

export function SearchResults({ results, aliasById, onOpenResult }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const onPress = (entity) => onOpenResult(entity.id)

    return (
        <View style={styles.container}>
            <AnimatedList
                gap={SPACING.xxxs}
                data={results}
                keyExtractor={getNotePath}
                emptyLabel={t('message.notes.empty')}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                    <AnimatedView
                        entering={FadeInUp}
                        exiting={FadeOutUp}
                    >
                        <EntityRow
                            entity={makeEntity(CONNECTION_TYPES.NOTE, item.path)}
                            title={item.title || t('notes.untitled')}
                            caption={aliasById.get(item.repositoryId)}
                            isFirst={index === 0}
                            isLast={index === results.length - 1}
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
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg
    }
})

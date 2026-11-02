import { memo, useCallback } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ListSheet } from '@/ui/modal/list-sheet'
import { ListItem } from '@/ui/list-item'
import { useTheme } from '@/ui/hooks/use-theme'

import { useRepositories } from '@/hooks/use-repositories'

import { Check } from '@/ui/icons/check'
import { Folder } from '@/icons/folder'

import { SPACING, ICON_SIZE } from '@/constants/theme'

const MoveNoteItem = memo(function MoveNoteItem({ item, current, onPress }) {
    const { colors } = useTheme()

    return (
        <ListItem
            uppercase={false}
            background={colors.surfaceVariant}
            title={item.alias}
            onPress={current ? undefined : () => onPress(item.id)}
            leftContent={(
                <View style={{ marginLeft: item.depth * SPACING.lg }}>
                    <Folder
                        width={ICON_SIZE.xxl}
                        height={ICON_SIZE.xxl}
                        color={colors.onBackground}
                    />
                </View>
            )}
            rightContent={current ? (
                <Check
                    width={ICON_SIZE.xxl}
                    height={ICON_SIZE.xxl}
                    color={colors.onBackground}
                />
            ) : undefined}
        />
    )
})

export const MoveNoteSheet = memo(function MoveNoteSheet({ sheet, repositoryId, onSelect }) {
    const { t } = useTranslation()
    const { activeRepositoryTree } = useRepositories()

    const renderItem = useCallback(({ item }) => (
        <MoveNoteItem
            item={item}
            current={item.id === repositoryId}
            onPress={onSelect}
        />
    ), [repositoryId, onSelect])

    return (
        <ListSheet
            sheet={sheet}
            title={t('button.move')}
            data={activeRepositoryTree}
            renderItem={renderItem}
            keyExtractor={getFolderKey}
        />
    )
})

const getFolderKey = (item) => item.id

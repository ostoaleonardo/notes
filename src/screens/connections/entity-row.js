import { memo, useCallback } from 'react'
import { useTheme } from 'react-native-paper'

import { Option } from '@/screens/settings/option'

import { EntityIcon } from './entity-icon'

import { ICON_SIZE } from '@/constants/theme'

export const EntityRow = memo(function EntityRow({
    entity,
    title,
    caption,
    background,
    onPress
}) {
    const { colors } = useTheme()
    const handlePress = useCallback(() => onPress(entity), [onPress, entity])

    return (
        <Option
            title={title}
            description={caption}
            background={background}
            onPress={handlePress}
            rightContent={(
                <EntityIcon
                    entity={entity}
                    title={title}
                    width={ICON_SIZE.lg}
                    height={ICON_SIZE.lg}
                    color={colors.onBackground}
                />
            )}
        />
    )
})

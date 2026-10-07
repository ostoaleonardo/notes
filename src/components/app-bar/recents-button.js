import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Badge, IconButton, Tooltip, useTheme } from 'react-native-paper'

import { NoteStack } from '@/icons/note-stack'

import { BADGE } from '@/constants/components'

export function RecentsButton({ onPress, testID, count = 0 }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const label = t('search.recent')

    return (
        <Tooltip title={label}>
            <View>
                <IconButton
                    onPress={onPress}
                    testID={testID}
                    icon={(props) => <NoteStack {...props} />}
                    accessibilityLabel={label}
                />

                {count > 0 && (
                    <Badge
                        size={BADGE.size}
                        style={{
                            position: 'absolute',
                            color: colors.onTertiary,
                            backgroundColor: colors.tertiary,
                            top: BADGE.top
                        }}
                    >
                        {count}
                    </Badge>
                )}
            </View>
        </Tooltip>
    )
}

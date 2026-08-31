import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Badge, IconButton, Tooltip, useTheme } from 'react-native-paper'
import { NoteStack } from '@/icons'

export function RecentsButton({ onPress, count = 0 }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const label = t('search.recent')

    return (
        <Tooltip title={label}>
            <View>
                <IconButton
                    onPress={onPress}
                    icon={(props) => <NoteStack {...props} />}
                    accessibilityLabel={label}
                />

                {count > 0 && (
                    <Badge
                        size={16}
                        style={{
                            position: 'absolute',
                            backgroundColor: colors.primary,
                            top: 6
                        }}
                    >
                        {count}
                    </Badge>
                )}
            </View>
        </Tooltip>
    )
}

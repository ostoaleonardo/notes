import { View } from 'react-native'
import { Badge, IconButton, Tooltip } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { useIconProps } from '@/hooks'
import { NoteStack } from '@/icons'

export function RecentsButton({ onPress, count = 0 }) {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const label = t('search.recent')

    return (
        <Tooltip title={label}>
            <View>
                <IconButton
                    onPress={onPress}
                    icon={() => <NoteStack {...iconProps} />}
                    accessibilityLabel={label}
                />

                {count > 0 && (
                    <Badge
                        size={16}
                        style={{ position: 'absolute', top: 6, right: 6 }}
                    >
                        {count}
                    </Badge>
                )}
            </View>
        </Tooltip>
    )
}

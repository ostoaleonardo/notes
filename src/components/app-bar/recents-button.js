import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip } from 'react-native-paper'

import { Badge } from '@/ui/badge'

import { NoteStack } from '@/icons/note-stack'

import { BADGE } from '@/constants/components'

export function RecentsButton({ onPress, testID, buttonStyle, count = 0 }) {
    const { t } = useTranslation()
    const label = t('search.recent')

    return (
        <Tooltip title={label}>
            <View>
                <IconButton
                    style={buttonStyle}
                    onPress={onPress}
                    testID={testID}
                    icon={(props) => <NoteStack {...props} />}
                    accessibilityLabel={label}
                />

                {count > 0 && (
                    <Badge style={styles.badge}>
                        {count}
                    </Badge>
                )}
            </View>
        </Tooltip>
    )
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: BADGE.top,
        right: BADGE.right
    }
})

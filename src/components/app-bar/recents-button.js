import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/ui/badge'
import { IconButton } from '@/ui/button/icon-button'

import { NoteStack } from '@/icons/note-stack'

import { BADGE } from '@/constants/components'

export const RecentsButton = ({
    onPress,
    testID,
    buttonStyle,
    count = 0
}) => {
    const { t } = useTranslation()
    const label = t('search.recent')

    return (
        <View>
                <IconButton
                    style={buttonStyle}
                    icon={NoteStack}
                    label={label}
                    testID={testID}
                    onPress={onPress}
                />

                {count > 0 && (
                    <Badge style={styles.badge}>
                        {count}
                    </Badge>
                )}
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: BADGE.top,
        right: BADGE.right
    }
})

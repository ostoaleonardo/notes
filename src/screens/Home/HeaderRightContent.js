import { router } from 'expo-router'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { IconButton } from '@/components'
import { Settings } from '@/icons'
import { ROUTES } from '@/constants'

export function HeaderRightContent() {
    const { colors } = useTheme()

    return (
        <View style={{ gap: 8, flexDirection: 'row' }}>
            <IconButton
                variant='light'
                onPress={() => router.push(ROUTES.SETTINGS)}
                icon={
                    <Settings
                        width={28}
                        height={28}
                        fill={colors.onBackground}
                    />
                }
            />
        </View>
    )
}

import { router } from 'expo-router'
import { View } from 'react-native'
import { IconButton } from '@/components'
import { Settings } from '@/icons'
import { COLORS, ROUTES } from '@/constants'

export function HeaderRightContent() {
    return (
        <View style={{ gap: 8, flexDirection: 'row' }}>
            <IconButton
                variant='light'
                onPress={() => router.push(ROUTES.SETTINGS)}
                icon={
                    <Settings
                        width={28}
                        height={28}
                        fill={COLORS.white}
                    />
                }
            />
        </View>
    )
}

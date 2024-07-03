import { useContext } from 'react'
import { router } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { IconButton } from '@/components'
import { Settings } from '@/icons'
import { SyncContext } from '@/context'
import { COLORS } from '@/constants'

export function HeaderRightContent() {
    const { isSyncing } = useContext(SyncContext)

    return (
        <View style={{ gap: 8, flexDirection: 'row' }}>
            {isSyncing && <ActivityIndicator color={COLORS.white} />}

            <IconButton
                variant='light'
                onPress={() => router.push('settings')}
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

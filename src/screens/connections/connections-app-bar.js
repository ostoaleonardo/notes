import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Tooltip } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/ui/badge'
import { AppBar } from '@/components/app-bar/app-bar'

import { LinkOff } from '@/icons/link-off'
import { Search } from '@/icons/search'

import { BADGE } from '@/constants/components'
import { TEST_IDS } from '@/constants/test-ids'

export const ConnectionsAppBar = memo(function ConnectionsAppBar({
    pendingCount,
    onPending,
    onSearch
}) {
    const { t } = useTranslation()
    const pendingLabel = t('connections.pending.title')
    const searchLabel = t('connections.origin.change')

    return (
        <AppBar
            title={t('connections.title')}
            trailing={(
                <>
                    <Tooltip title={pendingLabel}>
                        <View>
                            <Appbar.Action
                                animated={false}
                                onPress={onPending}
                                testID={TEST_IDS.CONNECTIONS_PENDING}
                                icon={(props) => <LinkOff {...props} />}
                                accessibilityLabel={pendingLabel}
                            />

                            {pendingCount > 0 && (
                                <Badge style={styles.badge}>
                                    {pendingCount}
                                </Badge>
                            )}
                        </View>
                    </Tooltip>

                    <Tooltip title={searchLabel}>
                        <Appbar.Action
                            animated={false}
                            onPress={onSearch}
                            testID={TEST_IDS.CONNECTIONS_SEARCH}
                            icon={(props) => <Search {...props} />}
                            accessibilityLabel={searchLabel}
                        />
                    </Tooltip>
                </>
            )}
        />
    )
})

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: BADGE.top,
        right: BADGE.right
    }
})

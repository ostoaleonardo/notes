import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/ui/badge'
import { IconButton } from '@/ui/button/icon-button'

import { ICON_BUTTON } from '@/ui/tokens/components'

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
                    <View>
                        <IconButton
                            appearance={ICON_BUTTON.appBar}
                            icon={LinkOff}
                            label={pendingLabel}
                            testID={TEST_IDS.CONNECTIONS_PENDING}
                            onPress={onPending}
                        />

                        {pendingCount > 0 && (
                            <Badge style={styles.badge}>
                                {pendingCount}
                            </Badge>
                        )}
                    </View>

                    <IconButton
                        appearance={ICON_BUTTON.appBar}
                        icon={Search}
                        label={searchLabel}
                        testID={TEST_IDS.CONNECTIONS_SEARCH}
                        onPress={onSearch}
                    />
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

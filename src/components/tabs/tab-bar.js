import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, IconButton, Tooltip } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Scroll } from '../animated'
import { TabItem } from './tab-item'
import { useIconProps, useNotes, useTabs, useUtils } from '@/hooks'
import { Home, Menu } from '@/icons'
import { HOME_TAB_KEY, ROUTES } from '@/constants'

export function TabBar() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { top } = useSafeAreaInsets()
    const { notes } = useNotes()
    const { pinned } = useUtils()

    const {
        tabs,
        activeTabId,
        tabBarActions,
        templateTitles,
        setActiveTab,
        closeTab
    } = useTabs()

    const iconProps = useIconProps()
    const homeIconProps = useIconProps(18)

    const pathname = usePathname()
    const isHome = pathname === ROUTES.HOME
    const focusedKey = isHome ? HOME_TAB_KEY : activeTabId

    const scrollRef = useRef(null)
    const tabOffsets = useRef({})

    const onTabLayout = (key) => (event) => {
        tabOffsets.current[key] = event.nativeEvent.layout.x
    }

    useEffect(() => {
        const x = tabOffsets.current[focusedKey]
        if (x === undefined) return
        scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true })
    }, [focusedKey])

    const onPressHome = () => {
        if (!isHome) router.push(ROUTES.HOME)
    }

    const onPressTab = (id) => {
        if (!isHome && id === activeTabId) return
        setActiveTab(id)
    }

    return (
        <View
            style={{
                ...styles.container,
                paddingTop: top,
                backgroundColor: colors.background,
                borderBottomColor: colors.onBackground + '1a'
            }}
        >
            <Tooltip title={t('drawer.open')}>
                <IconButton
                    onPress={() => tabBarActions?.onOpenDrawer?.()}
                    icon={() => <Menu {...iconProps} />}
                />
            </Tooltip>

            <Scroll
                horizontal
                overScrollMode='never'
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <TabItem
                    pinned
                    active={isHome}
                    icon={<Home {...homeIconProps} />}
                    accessibilityLabel={t('title.notes')}
                    onLayout={onTabLayout(HOME_TAB_KEY)}
                    onPress={onPressHome}
                />

                {tabs.map((id) => (
                    <TabItem
                        key={id}
                        title={notes.find((note) => note.id === id)?.title || templateTitles[id] || t('notes.untitled')}
                        active={!isHome && id === activeTabId}
                        pinned={pinned.has(id)}
                        onLayout={onTabLayout(id)}
                        onPress={() => onPressTab(id)}
                        onClose={() => closeTab(id)}
                    />
                ))}
            </Scroll>

            {tabBarActions?.menu}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1
    },
    scroll: {
        flex: 1
    },
    content: {
        gap: 4,
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 4
    }
})

import { StyleSheet } from 'react-native'
import { router, usePathname } from 'expo-router'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { DrawerHeader } from './DrawerHeader'
import { Category, Pencil, Settings } from '@/icons'
import { colors, fonts } from '@/constants'

export function DrawerScreen({ label, icon, path }) {
    const pathname = usePathname()

    return (
        <DrawerItem
            label={label}
            style={styles.item}
            labelStyle={styles.label}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.text}
            activeBackgroundColor={colors.primary15}
            focused={pathname === path}
            onPress={() => {
                router.push(path)
            }}
            icon={({ color, size }) => (
                icon({
                    width: size,
                    height: size,
                    color
                })
            )}
        />
    )
}

export function DrawerItems() {
    return (
        <DrawerContentScrollView style={styles.container}>
            <DrawerHeader />
            <DrawerScreen
                label='Notes'
                path='/home'
                icon={Pencil}
            />
            <DrawerScreen
                label='Categories'
                path='/categories'
                icon={Category}
            />
            <DrawerScreen
                label='Settings'
                path='/settings'
                icon={Settings}
            />
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    item: {
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    label: {
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
})

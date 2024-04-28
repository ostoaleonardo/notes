import { StyleSheet } from 'react-native'
import { router, usePathname } from 'expo-router'
import { DrawerItem } from '@react-navigation/drawer'
import { COLORS, FONTS } from '@/constants'

export function DrawerScreen({ label, icon, path }) {
    const pathname = usePathname()
    const labelStyle = pathname === path ? styles.activeLabel : styles.label

    return (
        <DrawerItem
            label={label}
            style={styles.item}
            labelStyle={labelStyle}
            pressColor={COLORS.transparent}
            activeTintColor={COLORS.primary}
            inactiveTintColor={COLORS.text}
            activeBackgroundColor={COLORS.primary15}
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

const styles = StyleSheet.create({
    item: {
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    label: {
        fontFamily: FONTS.mono,
        textTransform: 'uppercase',
    },
    activeLabel: {
        fontFamily: FONTS.monoBold,
        textTransform: 'uppercase',
    },
})

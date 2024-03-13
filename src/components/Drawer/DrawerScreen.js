import { StyleSheet } from 'react-native'
import { router, usePathname } from 'expo-router'
import { DrawerItem } from '@react-navigation/drawer'
import { colors, fonts } from '@/constants'

export function DrawerScreen({ label, icon, path }) {
    const pathname = usePathname()

    return (
        <DrawerItem
            label={label}
            style={styles.item}
            labelStyle={styles.label}
            pressColor={colors.transparent}
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

const styles = StyleSheet.create({
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
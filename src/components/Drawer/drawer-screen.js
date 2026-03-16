import { Pressable } from 'react-native'
import { router } from 'expo-router'
import { Typography } from '../typography'

export function DrawerScreen({ label, path, indicator }) {
    return (
        <Pressable
            style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            onPress={() => router.push(path)}
        >
            <Typography uppercase>
                {label}
            </Typography>
            <Typography
                variant='caption'
                opacity={0.5}
            >
                {indicator}
            </Typography>
        </Pressable>
    )
}

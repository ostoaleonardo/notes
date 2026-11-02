import { StyleSheet, View } from 'react-native'

import { Progress } from '@/ui/progress'

export function DrawerLoading() {
    return (
        <View style={styles.loading}>
            <Progress />
        </View>
    )
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

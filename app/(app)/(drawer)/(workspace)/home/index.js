import { useNavigation } from 'expo-router'
import { Intro } from '@/screens/notes'
import { useTabBarActions } from '@/hooks'

export default function App() {
    const navigation = useNavigation()

    useTabBarActions({
        onOpenDrawer: () => navigation.dispatch({ type: 'OPEN_DRAWER' })
    }, [])

    return <Intro />
}

import { Redirect } from 'expo-router'
import { useLocalAuthentication } from '@/hooks'

export default function App() {
    useLocalAuthentication()

    return <Redirect href='(app)' />
}

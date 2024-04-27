import { Redirect } from 'expo-router'
import { ROUTES } from '@/constants'

export default function App() {
    return <Redirect href={ROUTES.HOME} />
}

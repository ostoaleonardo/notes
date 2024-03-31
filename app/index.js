import { Redirect } from 'expo-router'
import { widgetTaskHandler } from '@/widgets/widgetTaskHandler'
import { registerWidgetTaskHandler } from 'react-native-android-widget'

registerWidgetTaskHandler(widgetTaskHandler)

export default function App() {
    return <Redirect href='/(drawer)/(stack)/home' />
}

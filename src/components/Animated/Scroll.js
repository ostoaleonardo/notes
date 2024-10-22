import { ScrollView } from 'react-native'

export function Scroll({ children, ...props }) {
    return (
        <ScrollView
            {...props}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    )
}

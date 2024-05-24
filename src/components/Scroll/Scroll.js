import { ScrollView } from 'react-native'

export function Scroll({ children, containerStyle, contentStyle, ...props }) {
    return (
        <ScrollView
            {...props}
            style={containerStyle}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    )
}

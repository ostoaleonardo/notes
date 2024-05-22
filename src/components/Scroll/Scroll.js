import { ScrollView, View } from 'react-native'

export function Scroll({ children, containerStyle, contentStyle, ...props }) {
    return (
        <ScrollView
            {...props}
            bounces={true}
            style={containerStyle}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            <View style={contentStyle}>
                {children}
            </View>
        </ScrollView>
    )
}

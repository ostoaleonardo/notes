import { forwardRef } from 'react'
import { ScrollView } from 'react-native-gesture-handler'


export const Scroll = forwardRef(({ children, ...props }, ref) => (
    <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        {...props}
    >
        {children}
    </ScrollView>
))

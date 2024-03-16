import { G, Path, Svg } from 'react-native-svg'

export const Eye = (props) => (
    <Svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
        <G fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5'>
            <Path d='M3 13c3.6-8 14.4-8 18 0' />
            <Path d='M12 17a3 3 0 1 1 0-6a3 3 0 0 1 0 6Z' />
        </G>
    </Svg>
)
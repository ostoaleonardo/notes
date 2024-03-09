import { Path, Svg } from 'react-native-svg'

export const Picture = (props) => (
    <Svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24' {...props}>
        <Path fill='currentColor' d='M5.23 20q-.666 0-1.14-.475q-.475-.474-.475-1.14V5.615q0-.666.475-1.14Q4.564 4 5.23 4h8.385v1H5.231q-.27 0-.443.173t-.173.442v12.77q0 .269.173.442q.174.173.443.173H18q.27 0 .442-.173t.173-.442V10h1v8.385q0 .666-.474 1.14Q18.666 20 18 20H5.23ZM17.386 8.23v-2h-2v-1h2v-2h1v2h2v1h-2v2h-1ZM7.115 16.5h9.154l-2.827-3.77l-2.615 3.308l-1.75-2.115L7.115 16.5ZM4.615 5v14V5Z' />
    </Svg>
)

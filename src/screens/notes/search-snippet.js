import { Text } from 'react-native'

import { Typography } from '@/ui/typography'

import { splitByRanges } from '@/utils/search-context'

import { FONTS } from '@/constants/theme'

export const SearchSnippet = ({ snippet, color, background }) => {
    const parts = splitByRanges(snippet.text, snippet.ranges)

    const matchStyle = {
        color,
        backgroundColor: background,
        fontFamily: FONTS.azeretMedium
    }

    return (
        <Typography
            variant='bodySmall'
            numberOfLines={1}
        >
            {parts.map((part, index) => (
                <Text
                    key={index}
                    style={part.match ? matchStyle : undefined}
                >
                    {part.text}
                </Text>
            ))}
        </Typography>
    )
}

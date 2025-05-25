const HEADINGS = 'You can create headings by using the \`#\` symbol. The number of \`#\` symbols you use will determine the size of the heading. For example:'
const HEADING_MARKDOWN = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`

const EMPHASIS = 'You can create emphasis by using the following symbols:'
const EMPHASIS_MARKDOWN = `
**This is bold text**
__This is bold text__
*This is italic text*
_This is italic text_
~~Strikethrough~~
`

const HORIZONTAL_RULES = 'You can create a horizontal rule by using three or more dashes, asterisks, or underscores. For example:'
const HORIZONTAL_RULES_MARKDOWN = `
Some text above
___
`

const BLOCKQUOTE = 'You can create blockquotes by using the \`>\` symbol. For example:'
const BLOCKQUOTE_MARKDOWN = `
> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
`

const LIST = 'You can create lists by using the following symbols:'
const LIST_MARKDOWN = `
Unordered
+ Create a list by starting a line with \'+ \', \'-\', or \'*\'
+ Sub-lists are made by indenting 2 spaces:
- Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet. This is a very long list item that will surely wrap onto the next line.
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered
1. Lorem ipsum dolor sit amet
2. This is a very long list item that will surely wrap onto the next line.
3. Integer molestie lorem at massa
`

const LINKS = 'You can create links by using the following syntax:'
const LINKS_MARKDOWN = `
[Notes @ monospace](https://play.google.com/store/apps/details?id=com.monospace.notes)
`

const IMAGES = 'You can add images by using the following syntax:'
const IMAGES_MARKDOWN = `
![Minion](https://github.githubassets.com/assets/mona-loading-default-c3c7aad1282f.gif)
`

const TABLE = 'You can create tables by using the following syntax:'
const TABLE_MARKDOWN = `
| Tables        | Are           |
| ------------- |:-------------:|
| col 3 is      | right-aligned |
| col 2 is      | centered      |
| zebra stripes | are neat      |
`

const CODE = 'You can create code blocks by using the following syntax:'
const CODE_MARKDOWN = `
Inline \`code\`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\` js
var foo = function (bar) {
return bar++;
};

console.log(foo(5));
\`\`\`
`

export const MARKDOWN = [
    {
        id: 'headings',
        descrption: HEADINGS,
        example: HEADING_MARKDOWN,
        height: 170
    },
    {
        id: 'emphasis',
        descrption: EMPHASIS,
        example: EMPHASIS_MARKDOWN,
        height: 130
    },
    {
        id: 'horizontal-rules',
        descrption: HORIZONTAL_RULES,
        example: HORIZONTAL_RULES_MARKDOWN,
        height: 80
    },
    {
        id: 'blockquote',
        descrption: BLOCKQUOTE,
        example: BLOCKQUOTE_MARKDOWN,
        height: 160
    },
    {
        id: 'list',
        descrption: LIST,
        example: LIST_MARKDOWN,
        height: 490
    },
    {
        id: 'links',
        descrption: LINKS,
        example: LINKS_MARKDOWN,
        height: 100
    },
    {
        id: 'images',
        descrption: IMAGES,
        example: IMAGES_MARKDOWN,
        height: 'auto'
    },
    {
        id: 'table',
        descrption: TABLE,
        example: TABLE_MARKDOWN,
        height: 160
    },
    {
        id: 'code',
        descrption: CODE,
        example: CODE_MARKDOWN,
        height: 'auto'
    }
]

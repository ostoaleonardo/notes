import katex from 'katex'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'

const md = new MarkdownIt({ html: true, linkify: true })
    .use(taskLists, { enabled: true })
    .use(texmath, { engine: katex, delimiters: 'dollars' })
    .use(footnote)

export const renderMarkdownRaw = (text) => md.render(text || '')

export const renderMarkdownHtml = (text) => DOMPurify.sanitize(renderMarkdownRaw(text))

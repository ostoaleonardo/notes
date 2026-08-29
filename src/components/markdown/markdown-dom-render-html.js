import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: true, linkify: true }).use(taskLists, { enabled: true })

export const renderMarkdownHtml = (text) => DOMPurify.sanitize(md.render(text || ''))

import i18n from '@/i18n/i18next'

const getBulletList = (items) => (
    items.map(({ title, body }) => `* **${title}**: ${body}`).join('\n')
)

export const getWelcomeNote = () => {
    const t = (key) => i18n.t(key)

    const toolsItems = [
        { title: t('welcome.tools.tags.title'), body: t('welcome.tools.tags.body') },
        { title: t('welcome.tools.templates.title'), body: t('welcome.tools.templates.body') },
        { title: t('welcome.tools.history.title'), body: t('welcome.tools.history.body') },
        { title: t('welcome.tools.export.title'), body: t('welcome.tools.export.body') },
        { title: t('welcome.tools.share.title'), body: t('welcome.tools.share.body') },
        { title: t('welcome.tools.daily.title'), body: t('welcome.tools.daily.body') }
    ]

    const proItems = [
        { title: t('welcome.pro.versions.title'), body: t('welcome.pro.versions.body') },
        { title: t('welcome.pro.subfolders.title'), body: t('welcome.pro.subfolders.body') },
        { title: t('welcome.pro.accents.title'), body: t('welcome.pro.accents.body') }
    ]

    const content = `## ${t('welcome.style.heading')}\n` +
        `* ${t('welcome.style.bold')}\n` +
        `* ${t('welcome.style.italic')}\n` +
        `* ${t('welcome.style.strike')}\n` +
        `* ${t('welcome.style.code')}\n` +
        `* ${t('welcome.organize.quote')}\n\n` +
        `> ${t('welcome.organize.quote_example')}\n\n` +
        `* ${t('welcome.organize.task')}\n\n` +
        `- [ ] ${t('welcome.organize.task_example')}\n\n` +
        `* ${t('welcome.organize.table.bullet')}\n\n` +
        `<div style="width:100%;display:flex;justify-content:center">\n\n` +
        `| ${t('welcome.organize.table.col1')} | ${t('welcome.organize.table.col2')} |\n` +
        `| --- | --- |\n` +
        `| ${t('welcome.organize.table.row1_1')} | \`${t('welcome.organize.table.row1_2')}\` |\n` +
        `| ${t('welcome.organize.table.row2_1')} | \`${t('welcome.organize.table.row2_2')}\` |\n` +
        `| ${t('welcome.organize.table.row3_1')} | \`${t('welcome.organize.table.row3_2')}\` |\n\n` +
        `</div>\n\n` +
        `${t('welcome.style.footer')}\n\n---\n\n` +
        `## ${t('welcome.attachments.heading')}\n` +
        `* ${t('welcome.attachments.image')}\n` +
        `* ${t('welcome.attachments.link')}\n\n` +
        `${t('welcome.attachments.footer')}\n\n---\n\n` +
        `## ${t('welcome.tools.heading')}\n` +
        `${getBulletList(toolsItems)}\n\n---\n\n` +
        `## ${t('welcome.pro.heading')}\n${t('welcome.pro.intro')}\n\n` +
        `${getBulletList(proItems)}\n\n` +
        `> ${t('welcome.pro.cta')}\n`

    return {
        title: t('welcome.title'),
        content: `${t('welcome.intro')}\n\n${content}`
    }
}

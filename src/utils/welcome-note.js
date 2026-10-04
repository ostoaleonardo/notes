import i18n from '../i18n/i18next'

const getBulletList = (items) => (
    items.map(({ title, body }) => `* **${title}**: ${body}`).join('\n')
)

export const getWelcomeNote = () => {
    const t = (key) => i18n.t(key)

    const toolsItems = [
        { title: t('welcome.tools_tags_title'), body: t('welcome.tools_tags_body') },
        { title: t('welcome.tools_templates_title'), body: t('welcome.tools_templates_body') },
        { title: t('welcome.tools_history_title'), body: t('welcome.tools_history_body') },
        { title: t('welcome.tools_export_title'), body: t('welcome.tools_export_body') },
        { title: t('welcome.tools_share_title'), body: t('welcome.tools_share_body') },
        { title: t('welcome.tools_daily_title'), body: t('welcome.tools_daily_body') }
    ]

    const proItems = [
        { title: t('welcome.pro_versions_title'), body: t('welcome.pro_versions_body') },
        { title: t('welcome.pro_subfolders_title'), body: t('welcome.pro_subfolders_body') },
        { title: t('welcome.pro_accents_title'), body: t('welcome.pro_accents_body') }
    ]

    const content = `## ${t('welcome.style_heading')}\n` +
        `* ${t('welcome.style_bullet_bold')}\n` +
        `* ${t('welcome.style_bullet_italic')}\n` +
        `* ${t('welcome.style_bullet_strike')}\n` +
        `* ${t('welcome.style_bullet_code')}\n` +
        `* ${t('welcome.organize_bullet_quote')}\n\n` +
        `> ${t('welcome.organize_quote_example')}\n\n` +
        `* ${t('welcome.organize_bullet_task')}\n\n` +
        `- [ ] ${t('welcome.organize_task_example')}\n\n` +
        `* ${t('welcome.organize_bullet_table')}\n\n` +
        `<div style="width:100%;display:flex;justify-content:center">\n\n` +
        `| ${t('welcome.organize_table_col1')} | ${t('welcome.organize_table_col2')} |\n` +
        `| --- | --- |\n` +
        `| ${t('welcome.organize_table_row1_1')} | \`${t('welcome.organize_table_row1_2')}\` |\n` +
        `| ${t('welcome.organize_table_row2_1')} | \`${t('welcome.organize_table_row2_2')}\` |\n` +
        `| ${t('welcome.organize_table_row3_1')} | \`${t('welcome.organize_table_row3_2')}\` |\n\n` +
        `</div>\n\n` +
        `${t('welcome.style_footer')}\n\n---\n\n` +
        `## ${t('welcome.attachments_heading')}\n` +
        `* ${t('welcome.attachments_bullet_image')}\n` +
        `* ${t('welcome.attachments_bullet_link')}\n\n` +
        `${t('welcome.attachments_footer')}\n\n---\n\n` +
        `## ${t('welcome.tools_heading')}\n` +
        `${getBulletList(toolsItems)}\n\n---\n\n` +
        `## ${t('welcome.pro_heading')}\n${t('welcome.pro_intro')}\n\n` +
        `${getBulletList(proItems)}\n\n` +
        `> ${t('welcome.pro_cta')}\n`

    return {
        title: t('welcome.title'),
        content: `${t('welcome.intro')}\n\n${content}`
    }
}

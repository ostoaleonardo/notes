import i18n from '../i18n/i18next'

import { RADIUS, TRANSPARENT } from '@/constants/themes'

const getFeatureCard = (colors, items) => {
    const border = colors.onBackground + TRANSPARENT[5]
    const divider = colors.onBackground + TRANSPARENT[10]
    const row = ({ title, body }, isLast) => (
        `<div style="padding:14px 16px;${isLast ? '' : `border-bottom:1px solid ${divider};`}"><strong>${title}</strong>: ${body}</div>`
    )

    return (
        `<div style="border:1px solid ${border};border-radius:${RADIUS.outer}px;overflow:hidden;background:${colors.surface}">` +
        items.map((item, index) => row(item, index === items.length - 1)).join('') +
        `</div>`
    )
}

export const getWelcomeNote = (colors) => {
    const t = (key) => i18n.t(key)

    const toolsItems = [
        { title: t('welcome.tools_tags_title'), body: t('welcome.tools_tags_body') },
        { title: t('welcome.tools_templates_title'), body: t('welcome.tools_templates_body') },
        { title: t('welcome.tools_history_title'), body: t('welcome.tools_history_body') },
        { title: t('welcome.tools_export_title'), body: t('welcome.tools_export_body') },
        { title: t('welcome.tools_share_title'), body: t('welcome.tools_share_body') }
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
        `## ${t('welcome.tools_heading')}\n\n` +
        `${getFeatureCard(colors, toolsItems)}\n\n---\n\n` +
        `## ${t('welcome.pro_heading')}\n${t('welcome.pro_intro')}\n\n` +
        `${getFeatureCard(colors, proItems)}\n\n` +
        `<div style="height:12px"></div>\n\n` +
        `> ${t('welcome.pro_cta')}\n`

    return {
        title: t('welcome.title'),
        content: `${t('welcome.intro')}\n\n${content}`
    }
}

import i18n from '../i18n/i18next'

export const getWelcomeNote = () => {
    const t = (key) => i18n.t(key)

    const content = `## ${t('welcome.search_heading')}\n${t('welcome.search_body')}\n\n` +
        `## ${t('welcome.menu_heading')}\n${t('welcome.menu_body')}\n\n` +
        `## ${t('welcome.counter_heading')}\n${t('welcome.counter_body')}\n\n` +
        `## ${t('welcome.pro_heading')}\n${t('welcome.pro_intro')}\n` +
        `- ${t('welcome.pro_versions')}\n` +
        `- ${t('welcome.pro_subfolders')}\n` +
        `- ${t('welcome.pro_accents')}\n\n` +
        `${t('welcome.pro_cta')}\n`

    return {
        title: t('welcome.title'),
        content: `${t('welcome.intro')}\n\n${content}`
    }
}

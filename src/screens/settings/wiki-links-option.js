import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Option } from './option'
import { Switch } from '@/components/button/switch'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { WIKI_LINK_FORMATS } from '@/constants/wiki-links'

export function WikiLinksOption() {
    const { t } = useTranslation()
    const { setItem } = useStorage()

    const [autoUpdateLinks, setAutoUpdateLinks] = useState(false)
    const [useWikilinks, setUseWikilinks] = useState(true)

    useStorageEffect(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS, (value) => setAutoUpdateLinks(value === 'true'))
    useStorageEffect(STORAGE_KEYS.LINK_FORMAT, (value) => setUseWikilinks(value !== WIKI_LINK_FORMATS.MARKDOWN))

    const onToggleAutoUpdate = (value) => {
        setAutoUpdateLinks(value)
        setItem(STORAGE_KEYS.ALWAYS_UPDATE_WIKI_LINKS, value ? 'true' : 'false')
    }

    const onToggleFormat = (value) => {
        setUseWikilinks(value)
        setItem(STORAGE_KEYS.LINK_FORMAT, value ? WIKI_LINK_FORMATS.WIKILINK : WIKI_LINK_FORMATS.MARKDOWN)
    }

    return (
        <>
            <Option
                isFirst={true}
                title={t('settings.use_wikilinks')}
                description={t('settings.use_wikilinks_description')}
                rightContent={(
                    <Switch
                        value={useWikilinks}
                        onValueChange={onToggleFormat}
                        accessibilityLabel={t('settings.use_wikilinks')}
                    />
                )}
            />
            <Option
                isLast={true}
                title={t('settings.auto_update_links')}
                description={t('settings.auto_update_links_description')}
                rightContent={(
                    <Switch
                        value={autoUpdateLinks}
                        onValueChange={onToggleAutoUpdate}
                        accessibilityLabel={t('settings.auto_update_links')}
                    />
                )}
            />
        </>
    )
}

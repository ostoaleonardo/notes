import { useTranslation } from 'react-i18next'
import { LargeInput, Section } from '@/components'
import { DateNote } from '../notes/date-note'

export function Header({ title, setTitle, createdAt, updatedAt }) {
    const { t } = useTranslation()

    return (
        <>
            <Section
                containerStyle={{ padding: 16, paddingBottom: 0 }}
            >
                <LargeInput
                    bold
                    multiline
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('placeholder.title')}
                />
            </Section>

            {(createdAt || updatedAt) && (
                <DateNote
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                />
            )}
        </>
    )
}

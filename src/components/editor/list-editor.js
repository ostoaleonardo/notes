import { useTranslation } from 'react-i18next'
import { Section, Typography } from '@/components'
import { List } from '@/screens'

export function ListEditor({ list, setList }) {
    const { t } = useTranslation()

    const hasList = list && list.items.length > 0

    return (
        <Section
            containerStyle={{
                flexGrow: 1,
                justifyContent: hasList ? 'stretch' : 'center'
            }}
            contentStyle={{
                paddingVertical: 16,
                alignItems: hasList ? 'stretch' : 'center'
            }}
        >
            {hasList ? (
                <List list={list} setList={setList} />
            ) : (
                <Typography
                    opacity={0.5}
                    variant='caption'
                >
                    {t('message.list.empty')}
                </Typography>
            )}
        </Section>
    )
}

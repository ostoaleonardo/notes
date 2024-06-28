import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '@/components'
import { AddPassword, Categories, DeleteNote, Languages, UpdateCategory, UpdatePassword } from '@/screens'

const MODALS = {
    settings: {
        language: {
            title: 'title.language',
            children: <Languages />
        }
    },
    notes: {
        delete: {
            title: 'header.removeNote',
            children: <DeleteNote />
        }
    },
    categories: {
        select: {
            title: 'title.yourCategories',
            children: <Categories />
        },
        update: {
            title: 'categories.update',
            children: <UpdateCategory />
        }
    },
    password: {
        add: {
            title: 'password.add',
            children: <AddPassword />
        },
        update: {
            title: 'password.update',
            children: <UpdatePassword />
        },
    }
}

export default function Modal() {
    const { t } = useTranslation()
    const { section, modal } = useLocalSearchParams()
    const { title, children } = MODALS[section][modal]

    return (
        <ModalSheet
            title={t(title)}
            onClose={() => router.back()}
        >
            {children}
        </ModalSheet>
    )
}

import { useEffect, useState } from 'react'
import { AppState, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { DrawerContentScrollView } from 'expo-router/drawer'
import { useTranslation } from 'react-i18next'
import { DrawerScreen } from './drawer-screen'
import { Separator } from '../separator'
import { Typography } from '../typography'
import { ROUTES } from '@/constants'
import { useCategories, useFileStorage, useIconProps, useRepositories, useTrash } from '@/hooks'
import { ArrowForward } from '@/icons'

export function DrawerItems() {
    const { t } = useTranslation()
    const iconProps = useIconProps(16)
    const { trash } = useTrash()
    const { categories } = useCategories()
    const { repositories, activeRepositoryId } = useRepositories()
    const { listMarkdownFiles } = useFileStorage()

    const [activeCount, setActiveCount] = useState(0)

    const activeRepository = repositories.find((repository) => repository.id === activeRepositoryId)

    useEffect(() => {
        const refreshCount = () => {
            if (activeRepository) setActiveCount(listMarkdownFiles(activeRepository.uri).length)
        }

        refreshCount()

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refreshCount()
        })

        return () => subscription.remove()
    }, [activeRepository])

    return (
        <DrawerContentScrollView>
            <View>
                <Pressable
                    onPress={() => router.push(ROUTES.REPOSITORIES)}
                    style={styles.header}
                >
                    <View style={styles.headerTitleRow}>
                        <Typography
                            bold
                            uppercase
                            opacity={0.6}
                            variant='caption'
                        >
                            {t('drawer.repositories')}
                        </Typography>
                        <ArrowForward
                            {...iconProps}
                            opacity={0.6}
                        />
                    </View>

                    {activeRepository && (
                        <>
                            <Typography uppercase>
                                {activeRepository.alias}
                            </Typography>
                            <Typography
                                variant='caption'
                                opacity={0.5}
                            >
                                {t('count.notes', { count: activeCount })}
                            </Typography>
                        </>
                    )}
                </Pressable>

                <Separator style={styles.separator} />

                <View>
                    <DrawerScreen
                        path={ROUTES.CATEGORIES}
                        label={t('drawer.categories')}
                        indicator={t('count.categories', { count: categories?.length - 1 || 0 })}
                    />
                    <DrawerScreen
                        path={ROUTES.TRASH}
                        label={t('drawer.trash')}
                        indicator={t('count.notes', { count: trash?.size || 0 })}
                    />
                </View>
            </View>
        </DrawerContentScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 4
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    separator: {
        marginHorizontal: 16
    }
})

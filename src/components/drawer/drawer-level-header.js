import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { TreeRow } from '@/ui/tree-row'

import { ArrowBack } from '@/icons/arrow-back'

import { SPACING } from '@/constants/theme'

export const DrawerLevelHeader = memo(({
    repository,
    onBack
}) => (
    <View style={styles.container}>
        <TreeRow
            bold
            variant='titleSmall'
            icon={ArrowBack}
            expandable={false}
            label={repository.alias}
            onPress={onBack}
        />
    </View>
))

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.sm
    }
})

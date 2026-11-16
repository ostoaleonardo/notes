import { fillTemplate } from './fill-template'

import { BORDER_TEMPLATE } from '@/shared/constants/css-templates'

export const buildBorder = (color) => fillTemplate(BORDER_TEMPLATE, { color })

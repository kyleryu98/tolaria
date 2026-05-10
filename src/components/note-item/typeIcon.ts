import type { ComponentType, SVGAttributes } from 'react'
import { ArrowsClockwise } from '@phosphor-icons/react/ArrowsClockwise'
import { CalendarBlank } from '@phosphor-icons/react/CalendarBlank'
import { FileText } from '@phosphor-icons/react/FileText'
import { Flask } from '@phosphor-icons/react/Flask'
import { StackSimple } from '@phosphor-icons/react/StackSimple'
import { Tag } from '@phosphor-icons/react/Tag'
import { Target } from '@phosphor-icons/react/Target'
import { Users } from '@phosphor-icons/react/Users'
import { Wrench } from '@phosphor-icons/react/Wrench'
import { resolveIcon } from '../../utils/iconResolver'

const TYPE_ICON_MAP: Record<string, ComponentType<SVGAttributes<SVGSVGElement>>> = {
  Project: Wrench,
  project: Wrench,
  Experiment: Flask,
  experiment: Flask,
  Responsibility: Target,
  responsibility: Target,
  Procedure: ArrowsClockwise,
  procedure: ArrowsClockwise,
  Person: Users,
  person: Users,
  Event: CalendarBlank,
  event: CalendarBlank,
  Topic: Tag,
  topic: Tag,
  Type: StackSimple,
  type: StackSimple,
}

export function getTypeIcon(isA: string | null, customIcon?: string | null): ComponentType<SVGAttributes<SVGSVGElement>> {
  if (customIcon) return resolveIcon(customIcon)
  return (isA && (Reflect.get(TYPE_ICON_MAP, isA) as ComponentType<SVGAttributes<SVGSVGElement>> | undefined)) || FileText
}

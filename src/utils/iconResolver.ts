import type { ComponentType } from 'react'
import { ArrowsClockwise } from '@phosphor-icons/react/ArrowsClockwise'
import { CalendarBlank } from '@phosphor-icons/react/CalendarBlank'
import { CookingPot } from '@phosphor-icons/react/CookingPot'
import { FileText } from '@phosphor-icons/react/FileText'
import { Flask } from '@phosphor-icons/react/Flask'
import { GearSix } from '@phosphor-icons/react/GearSix'
import { Rocket } from '@phosphor-icons/react/Rocket'
import { StackSimple } from '@phosphor-icons/react/StackSimple'
import { Tag } from '@phosphor-icons/react/Tag'
import { Target } from '@phosphor-icons/react/Target'
import { Users } from '@phosphor-icons/react/Users'
import { Wrench } from '@phosphor-icons/react/Wrench'
import type { IconProps } from '@phosphor-icons/react'

export type { IconProps }

const COMMON_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  'arrows-clockwise': ArrowsClockwise,
  'calendar-blank': CalendarBlank,
  'cooking-pot': CookingPot,
  'file-text': FileText,
  flask: Flask,
  'gear-six': GearSix,
  rocket: Rocket,
  'stack-simple': StackSimple,
  tag: Tag,
  target: Target,
  users: Users,
  wrench: Wrench,
}

function normalizeIconName(name: string): string {
  return name.trim().toLowerCase().replace(/[_\s]+/g, '-')
}

export function findIcon(name: string | null | undefined): ComponentType<IconProps> | null {
  if (!name) return null
  return COMMON_ICON_MAP[normalizeIconName(name)] ?? null
}

export function resolveIcon(name: string | null): ComponentType<IconProps> {
  return findIcon(name) ?? FileText
}

import type { ComponentType } from 'react'
import { Archive } from '@phosphor-icons/react/Archive'
import { ArrowsClockwise } from '@phosphor-icons/react/ArrowsClockwise'
import { Article } from '@phosphor-icons/react/Article'
import { Book } from '@phosphor-icons/react/Book'
import { BookOpen } from '@phosphor-icons/react/BookOpen'
import { Books } from '@phosphor-icons/react/Books'
import { Brain } from '@phosphor-icons/react/Brain'
import { Briefcase } from '@phosphor-icons/react/Briefcase'
import { CalendarBlank } from '@phosphor-icons/react/CalendarBlank'
import { ChartBar } from '@phosphor-icons/react/ChartBar'
import { CheckCircle } from '@phosphor-icons/react/CheckCircle'
import { Code } from '@phosphor-icons/react/Code'
import { CookingPot } from '@phosphor-icons/react/CookingPot'
import { Database } from '@phosphor-icons/react/Database'
import { Eye } from '@phosphor-icons/react/Eye'
import { File } from '@phosphor-icons/react/File'
import { FileText } from '@phosphor-icons/react/FileText'
import { Flask } from '@phosphor-icons/react/Flask'
import { Folder } from '@phosphor-icons/react/Folder'
import { FolderOpen } from '@phosphor-icons/react/FolderOpen'
import { GearSix } from '@phosphor-icons/react/GearSix'
import { GitBranch } from '@phosphor-icons/react/GitBranch'
import { Globe } from '@phosphor-icons/react/Globe'
import { Heart } from '@phosphor-icons/react/Heart'
import { House } from '@phosphor-icons/react/House'
import { ImageSquare } from '@phosphor-icons/react/ImageSquare'
import { Kanban } from '@phosphor-icons/react/Kanban'
import { Lightbulb } from '@phosphor-icons/react/Lightbulb'
import { Link } from '@phosphor-icons/react/Link'
import { ListBullets } from '@phosphor-icons/react/ListBullets'
import { ListChecks } from '@phosphor-icons/react/ListChecks'
import { Lock } from '@phosphor-icons/react/Lock'
import { MagnifyingGlass } from '@phosphor-icons/react/MagnifyingGlass'
import { MapPin } from '@phosphor-icons/react/MapPin'
import { Megaphone } from '@phosphor-icons/react/Megaphone'
import { NotePencil } from '@phosphor-icons/react/NotePencil'
import { Palette } from '@phosphor-icons/react/Palette'
import { PencilSimple } from '@phosphor-icons/react/PencilSimple'
import { Rocket } from '@phosphor-icons/react/Rocket'
import { ShieldCheck } from '@phosphor-icons/react/ShieldCheck'
import { Sparkle } from '@phosphor-icons/react/Sparkle'
import { StackSimple } from '@phosphor-icons/react/StackSimple'
import { Star } from '@phosphor-icons/react/Star'
import { Tag } from '@phosphor-icons/react/Tag'
import { Target } from '@phosphor-icons/react/Target'
import { Terminal } from '@phosphor-icons/react/Terminal'
import { Toolbox } from '@phosphor-icons/react/Toolbox'
import { TreeStructure } from '@phosphor-icons/react/TreeStructure'
import { Users } from '@phosphor-icons/react/Users'
import { Warning } from '@phosphor-icons/react/Warning'
import { Wrench } from '@phosphor-icons/react/Wrench'
import type { IconProps } from '@phosphor-icons/react'

export type { IconProps }
export type IconEntry = { name: string; Icon: ComponentType<IconProps> }

/**
 * Startup-safe icon picker set.
 *
 * The original list imported hundreds of Phosphor components up front. That
 * made production builds and cold starts pay for icons that are only used when
 * a user customizes a type or icon property.
 */
export const ICON_OPTIONS: IconEntry[] = [
  { name: 'archive', Icon: Archive },
  { name: 'arrows-clockwise', Icon: ArrowsClockwise },
  { name: 'article', Icon: Article },
  { name: 'book', Icon: Book },
  { name: 'book-open', Icon: BookOpen },
  { name: 'books', Icon: Books },
  { name: 'brain', Icon: Brain },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'calendar-blank', Icon: CalendarBlank },
  { name: 'chart-bar', Icon: ChartBar },
  { name: 'check-circle', Icon: CheckCircle },
  { name: 'code', Icon: Code },
  { name: 'cooking-pot', Icon: CookingPot },
  { name: 'database', Icon: Database },
  { name: 'eye', Icon: Eye },
  { name: 'file', Icon: File },
  { name: 'file-text', Icon: FileText },
  { name: 'flask', Icon: Flask },
  { name: 'folder', Icon: Folder },
  { name: 'folder-open', Icon: FolderOpen },
  { name: 'gear-six', Icon: GearSix },
  { name: 'git-branch', Icon: GitBranch },
  { name: 'globe', Icon: Globe },
  { name: 'heart', Icon: Heart },
  { name: 'house', Icon: House },
  { name: 'image-square', Icon: ImageSquare },
  { name: 'kanban', Icon: Kanban },
  { name: 'lightbulb', Icon: Lightbulb },
  { name: 'link', Icon: Link },
  { name: 'list-bullets', Icon: ListBullets },
  { name: 'list-checks', Icon: ListChecks },
  { name: 'lock', Icon: Lock },
  { name: 'magnifying-glass', Icon: MagnifyingGlass },
  { name: 'map-pin', Icon: MapPin },
  { name: 'megaphone', Icon: Megaphone },
  { name: 'note-pencil', Icon: NotePencil },
  { name: 'palette', Icon: Palette },
  { name: 'pencil-simple', Icon: PencilSimple },
  { name: 'rocket', Icon: Rocket },
  { name: 'shield-check', Icon: ShieldCheck },
  { name: 'sparkle', Icon: Sparkle },
  { name: 'stack-simple', Icon: StackSimple },
  { name: 'star', Icon: Star },
  { name: 'tag', Icon: Tag },
  { name: 'target', Icon: Target },
  { name: 'terminal', Icon: Terminal },
  { name: 'toolbox', Icon: Toolbox },
  { name: 'tree-structure', Icon: TreeStructure },
  { name: 'users', Icon: Users },
  { name: 'warning', Icon: Warning },
  { name: 'wrench', Icon: Wrench },
]

const ICON_MAP: Record<string, ComponentType<IconProps>> = Object.fromEntries(
  ICON_OPTIONS.map((option) => [option.name, option.Icon]),
)

function normalizeIconName(name: string): string {
  return name.trim().toLowerCase().replace(/[_\s]+/g, '-')
}

/** Resolves a Phosphor icon name to its component, without a fallback. */
export function findIcon(name: string | null | undefined): ComponentType<IconProps> | null {
  if (!name) return null
  return ICON_MAP[normalizeIconName(name)] ?? null
}

/** Resolves a Phosphor icon name to its component, with fallback to FileText. */
export function resolveIcon(name: string | null): ComponentType<IconProps> {
  return findIcon(name) ?? FileText
}

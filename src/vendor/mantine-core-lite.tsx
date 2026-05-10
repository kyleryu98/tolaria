/* eslint-disable react-refresh/only-export-components -- vendor compatibility shim exports compound components and context. */
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'

export const MantineContext = createContext<Record<string, unknown> | null>(null)

export function MantineProvider({ children }: { children?: ReactNode }) {
  return (
    <MantineContext.Provider value={{}}>
      {children}
    </MantineContext.Provider>
  )
}

function spacing(value: unknown): CSSProperties | undefined {
  if (value === undefined || value === null) return undefined
  return { gap: typeof value === 'number' ? `${value}px` : String(value) }
}

function joinClassName(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' ') || undefined
}

function sectionedChildren(leftSection: ReactNode, children: ReactNode, rightSection: ReactNode) {
  return (
    <>
      {leftSection && <span className="mantine-lite__section" data-position="left">{leftSection}</span>}
      {children}
      {rightSection && <span className="mantine-lite__section" data-position="right">{rightSection}</span>}
    </>
  )
}

type ButtonLikeProps = HTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
  disabled?: boolean
  leftSection?: ReactNode
  rightSection?: ReactNode
  variant?: string
  size?: string | number
}

export const Button = forwardRef<HTMLButtonElement, ButtonLikeProps>((props, ref) => {
  const { children, className, disabled, leftSection, rightSection, variant, size, ...rest } = props
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={joinClassName('mantine-lite-button', className)}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
    >
      {sectionedChildren(leftSection, children, rightSection)}
    </button>
  )
})
Button.displayName = 'MantineLiteButton'

export const ActionIcon = forwardRef<HTMLButtonElement, ButtonLikeProps>((props, ref) => {
  const { children, className, disabled, variant, size, ...rest } = props
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={joinClassName('mantine-lite-action-icon', className)}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
    >
      {children}
    </button>
  )
})
ActionIcon.displayName = 'MantineLiteActionIcon'

type BoxProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  gap?: string | number
}

export const Group = forwardRef<HTMLDivElement, BoxProps>(({ children, className, gap, style, ...rest }, ref) => (
  <div
    {...rest}
    ref={ref}
    className={joinClassName('mantine-lite-group', className)}
    style={{ display: 'flex', alignItems: 'center', ...spacing(gap), ...style }}
  >
    {children}
  </div>
))
Group.displayName = 'MantineLiteGroup'

export const Stack = forwardRef<HTMLDivElement, BoxProps>(({ children, className, gap, style, ...rest }, ref) => (
  <div
    {...rest}
    ref={ref}
    className={joinClassName('mantine-lite-stack', className)}
    style={{ display: 'flex', flexDirection: 'column', ...spacing(gap), ...style }}
  >
    {children}
  </div>
))
Stack.displayName = 'MantineLiteStack'

export const Flex = forwardRef<HTMLDivElement, BoxProps>(({ children, className, gap, style, ...rest }, ref) => (
  <div
    {...rest}
    ref={ref}
    className={joinClassName('mantine-lite-flex', className)}
    style={{ display: 'flex', alignItems: 'center', ...spacing(gap), ...style }}
  >
    {children}
  </div>
))
Flex.displayName = 'MantineLiteFlex'

type TextProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode
  lineClamp?: number
  size?: string
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(({ children, className, lineClamp, size, style, ...rest }, ref) => (
  <span
    {...rest}
    ref={ref}
    className={joinClassName('mantine-lite-text', className)}
    data-size={size}
    style={{
      ...(lineClamp
        ? {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: lineClamp,
            overflow: 'hidden',
          }
        : null),
      ...style,
    }}
  >
    {children}
  </span>
))
Text.displayName = 'MantineLiteText'

export const Badge = forwardRef<HTMLSpanElement, TextProps & { size?: string }>(({ children, className, size, ...rest }, ref) => (
  <span {...rest} ref={ref} className={joinClassName('mantine-lite-badge', className)} data-size={size}>
    {children}
  </span>
))
Badge.displayName = 'MantineLiteBadge'

type TooltipProps = {
  children: ReactNode
  disabled?: boolean
  label?: ReactNode
}

export function Tooltip({ children, disabled, label }: TooltipProps) {
  if (disabled || !isValidElement(children)) return <>{children}</>
  const title = typeof label === 'string' ? label : undefined
  return cloneElement(children as ReactElement<Record<string, unknown>>, { title })
}

type ChipProps = {
  children?: ReactNode
  checked?: boolean
  className?: string
  wrapperProps?: HTMLAttributes<HTMLLabelElement>
}

export const Chip = forwardRef<HTMLInputElement, ChipProps>(({ children, checked, className, wrapperProps }, ref) => (
  <label {...wrapperProps} className={joinClassName('mantine-lite-chip', className)} data-checked={checked || undefined}>
    <input ref={ref} type="checkbox" checked={Boolean(checked)} readOnly hidden />
    {children}
  </label>
))
Chip.displayName = 'MantineLiteChip'

type MenuState = {
  disabled?: boolean
  opened: boolean
  setOpened: (open: boolean) => void
}

const MenuContext = createContext<MenuState | null>(null)

function cloneMenuTrigger(children: ReactNode, onClick: () => void) {
  const child = Children.only(children)
  if (!isValidElement(child)) return child
  const element = child as ReactElement<Record<string, unknown>>
  const previousClick = element.props.onClick as ((event: unknown) => void) | undefined
  return cloneElement(element, {
    onClick: (event: unknown) => {
      previousClick?.(event)
      onClick()
    },
  })
}

function MenuRoot({ children, disabled, onChange }: { children?: ReactNode; disabled?: boolean; onChange?: (open: boolean) => void }) {
  const [opened, setOpenedState] = useState(false)
  const value = useMemo<MenuState>(() => ({
    disabled,
    opened,
    setOpened: (open) => {
      if (disabled) return
      setOpenedState(open)
      onChange?.(open)
    },
  }), [disabled, onChange, opened])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

const MenuTarget = ({ children }: { children?: ReactNode }) => {
  const menu = useContext(MenuContext)
  return <>{cloneMenuTrigger(children, () => menu?.setOpened(!menu.opened))}</>
}

const MenuDropdown = forwardRef<HTMLDivElement, BoxProps>(({ children, className, style, ...rest }, ref) => {
  const menu = useContext(MenuContext)
  if (menu && !menu.opened) return null
  return (
    <div {...rest} ref={ref} className={joinClassName('mantine-lite-menu-dropdown', className)} style={style}>
      {children}
    </div>
  )
})
MenuDropdown.displayName = 'MantineLiteMenuDropdown'

const MenuItem = forwardRef<HTMLButtonElement, ButtonLikeProps>(({ children, className, leftSection, rightSection, disabled, onClick, ...rest }, ref) => {
  const menu = useContext(MenuContext)
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={joinClassName('mantine-lite-menu-item', className)}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)
        menu?.setOpened(false)
      }}
    >
      {sectionedChildren(leftSection, children, rightSection)}
    </button>
  )
})
MenuItem.displayName = 'MantineLiteMenuItem'

const MenuDivider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-menu-divider', className)} role="separator" />
))
MenuDivider.displayName = 'MantineLiteMenuDivider'

const MenuLabel = forwardRef<HTMLDivElement, BoxProps>(({ children, className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-menu-label', className)}>
    {children}
  </div>
))
MenuLabel.displayName = 'MantineLiteMenuLabel'

export const Menu = Object.assign(MenuRoot, {
  Target: MenuTarget,
  Dropdown: MenuDropdown,
  Item: MenuItem,
  Divider: MenuDivider,
  Label: MenuLabel,
  Sub: Object.assign(MenuRoot, {
    Target: MenuTarget,
    Dropdown: MenuDropdown,
    Item: MenuItem,
  }),
})

type PopoverState = {
  opened?: boolean
  setOpened?: (open: boolean) => void
}

const PopoverContext = createContext<PopoverState | null>(null)

function PopoverRoot({ children, opened, onChange }: { children?: ReactNode; opened?: boolean; onChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const actualOpen = opened ?? internalOpen
  const value = useMemo(() => ({
    opened: actualOpen,
    setOpened: (open: boolean) => {
      setInternalOpen(open)
      onChange?.(open)
    },
  }), [actualOpen, onChange])

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
}

function PopoverTarget({ children }: { children?: ReactNode }) {
  const popover = useContext(PopoverContext)
  return <>{cloneMenuTrigger(children, () => popover?.setOpened?.(!popover.opened))}</>
}

const PopoverDropdown = forwardRef<HTMLDivElement, BoxProps>(({ children, className, ...rest }, ref) => {
  const popover = useContext(PopoverContext)
  if (popover && !popover.opened) return null
  return (
    <div {...rest} ref={ref} className={joinClassName('mantine-lite-popover-dropdown', className)}>
      {children}
    </div>
  )
})
PopoverDropdown.displayName = 'MantineLitePopoverDropdown'

export const Popover = PopoverRoot
export { PopoverDropdown, PopoverTarget }

type TabsState = {
  value?: string
  setValue?: (value: string) => void
}

const TabsContext = createContext<TabsState | null>(null)

function TabsRoot({ children, defaultValue, value, onChange }: { children?: ReactNode; defaultValue?: string; value?: string; onChange?: (value: string | null) => void }) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const actualValue = value ?? internalValue
  const state = useMemo<TabsState>(() => ({
    value: actualValue,
    setValue: (next) => {
      setInternalValue(next)
      onChange?.(next)
    },
  }), [actualValue, onChange])

  return <TabsContext.Provider value={state}>{children}</TabsContext.Provider>
}

const TabsList = forwardRef<HTMLDivElement, BoxProps>(({ children, className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-tabs-list', className)} role="tablist">
    {children}
  </div>
))
TabsList.displayName = 'MantineLiteTabsList'

const TabsTab = forwardRef<HTMLButtonElement, ButtonLikeProps & { value: string }>(({ children, value, className, ...rest }, ref) => {
  const tabs = useContext(TabsContext)
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={joinClassName('mantine-lite-tabs-tab', className)}
      role="tab"
      aria-selected={tabs?.value === value || undefined}
      onClick={() => tabs?.setValue?.(value)}
    >
      {children}
    </button>
  )
})
TabsTab.displayName = 'MantineLiteTabsTab'

const TabsPanel = forwardRef<HTMLDivElement, BoxProps & { value: string }>(({ children, value, className, ...rest }, ref) => {
  const tabs = useContext(TabsContext)
  if (tabs?.value !== value) return null
  return (
    <div {...rest} ref={ref} className={joinClassName('mantine-lite-tabs-panel', className)} role="tabpanel">
      {children}
    </div>
  )
})
TabsPanel.displayName = 'MantineLiteTabsPanel'

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
})

export const LoadingOverlay = ({ visible }: { visible?: boolean }) => (
  visible ? <div className="mantine-lite-loading-overlay">Loading...</div> : null
)

export const Loader = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(({ className, ...rest }, ref) => (
  <span {...rest} ref={ref} className={joinClassName('mantine-lite-loader', className)} aria-busy="true" />
))
Loader.displayName = 'MantineLiteLoader'

type TextInputProps = Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  autoComplete?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { className, ...rest } = props
  return <input {...rest} ref={ref} className={joinClassName('mantine-lite-text-input', className)} />
})
TextInput.displayName = 'MantineLiteTextInput'

type FileInputProps = {
  accept?: string
  className?: string
  onChange?: (file: File | null) => void
  placeholder?: string
  value?: File | null
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(({ accept, className, onChange }, ref) => (
  <input
    ref={ref}
    className={joinClassName('mantine-lite-file-input', className)}
    type="file"
    accept={accept}
    onChange={(event) => onChange?.(event.currentTarget.files?.[0] ?? null)}
  />
))
FileInput.displayName = 'MantineLiteFileInput'

export const Card = forwardRef<HTMLDivElement, BoxProps & { withBorder?: boolean }>(({ children, className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-card', className)}>
    {children}
  </div>
))
Card.displayName = 'MantineLiteCard'

export const Divider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-divider', className)} role="separator" />
))
Divider.displayName = 'MantineLiteDivider'

export const Avatar = forwardRef<HTMLDivElement, BoxProps>(({ children, className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-avatar', className)}>
    {children}
  </div>
))
Avatar.displayName = 'MantineLiteAvatar'

export const Skeleton = forwardRef<HTMLDivElement, BoxProps>(({ className, ...rest }, ref) => (
  <div {...rest} ref={ref} className={joinClassName('mantine-lite-skeleton', className)} />
))
Skeleton.displayName = 'MantineLiteSkeleton'

export const CheckIcon = ({ size = 12, className }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6.2 11.2 2.8 7.8l1.1-1.1 2.3 2.3 5.9-5.9 1.1 1.1z" fill="currentColor" />
  </svg>
)

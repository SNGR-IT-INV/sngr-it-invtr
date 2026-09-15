"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Icon } from "@/components/icon"

import { cn } from "@/lib/utils"

// base-ui's <Select.Value> only shows a resolved label when it can look one
// up — unlike Radix, it does not scrape rendered <Select.Item> children to
// derive one. The documented mechanism is a Select.Root `items` map, but in
// this installed version (1.7.0) that map never reliably reaches the store
// the trigger reads from (confirmed by inspecting the live store directly:
// it stayed undefined despite a correct map being passed to Root) — a bug,
// or a requirement this version's docs don't spell out. Its `children`
// render-function on Select.Value *does* work, but only via plain props —
// piping the derived label map through React Context to reach it produced
// a real, reproducible SSR/hydration mismatch (server resolved labels
// correctly, client hydrated with the raw value and stuck there), so this
// clones the label map directly onto each Select.Value element the tree
// contains instead. Callers still just author
// <SelectItem value=...>{label}</SelectItem> declaratively — nothing about
// call sites changes.
function collectSelectItemLabels(
  node: React.ReactNode,
  out: Record<string, React.ReactNode>
) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as {
      value?: unknown
      label?: React.ReactNode
      children?: React.ReactNode
    }
    if (child.type === SelectItem) {
      if (typeof props.value === "string") {
        out[props.value] = props.label ?? props.children
      }
      return
    }
    if (props.children) collectSelectItemLabels(props.children, out)
  })
}

function injectSelectItems(
  node: React.ReactNode,
  items: Record<string, React.ReactNode>
): React.ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child
    if (child.type === SelectValue) {
      return React.cloneElement(child as React.ReactElement<SelectValueProps>, {
        items,
      })
    }
    const props = child.props as { children?: React.ReactNode }
    if (!props.children) return child
    return React.cloneElement(
      child as React.ReactElement<{ children?: React.ReactNode }>,
      {},
      injectSelectItems(props.children, items)
    )
  })
}

function Select<Value, Multiple extends boolean | undefined = false>({
  children,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  const derivedItems = React.useMemo(() => {
    const collected: Record<string, React.ReactNode> = {}
    collectSelectItemLabels(children, collected)
    return collected
  }, [children])

  return (
    <SelectPrimitive.Root {...props}>
      {injectSelectItems(children, derivedItems)}
    </SelectPrimitive.Root>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

type SelectValueProps = SelectPrimitive.Value.Props & {
  items?: Record<string, React.ReactNode>
}

function SelectValue({
  className,
  children,
  placeholder,
  items = {},
  ...props
}: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      placeholder={placeholder}
      {...props}
    >
      {children ??
        ((value: unknown) => {
          if (value == null || value === "") return placeholder
          if (typeof value === "string" && value in items) return items[value]
          return String(value)
        })}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex w-fit cursor-pointer items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <Icon
            icon="tabler:chevron-down"
            className="text-muted-foreground pointer-events-none size-4"
          />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "glass-panel text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg shadow-md ring-1 duration-100 data-[align-trigger=true]:animate-none",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("text-muted-foreground px-1.5 py-1 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  label,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      // base-ui resolves the trigger's displayed label from this `label`
      // prop (or a declarative `items` array on Select.Root) — it doesn't
      // scrape rendered children the way Radix did. Every item here renders
      // a plain string child, so derive it automatically instead of making
      // every call site pass label={...} explicitly; falls back to
      // whatever's passed in for the rare non-string case.
      label={label ?? (typeof children === "string" ? children : undefined)}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <Icon icon="tabler:check" className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "glass-panel top-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <Icon icon="tabler:chevron-up" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "glass-panel bottom-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <Icon icon="tabler:chevron-down" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

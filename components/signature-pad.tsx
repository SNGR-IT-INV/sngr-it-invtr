"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SignaturePad({
  label,
  onChange,
  className,
}: {
  label?: string
  onChange: (dataUrl: string | null) => void
  className?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawingRef = React.useRef(false)
  const [hasStroke, setHasStroke] = React.useState(false)

  const getContext = () => canvasRef.current?.getContext("2d") ?? null

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const ctx = getContext()
    if (!ctx) return
    drawingRef.current = true
    const { x, y } = pointFromEvent(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const ctx = getContext()
    if (!ctx) return
    const { x, y } = pointFromEvent(e)
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.strokeStyle = "#111827"
    ctx.lineTo(x, y)
    ctx.stroke()
    if (!hasStroke) setHasStroke(true)
  }

  const commit = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(hasStroke ? canvas.toDataURL("image/png") : null)
  }, [hasStroke, onChange])

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false
    canvasRef.current?.releasePointerCapture(e.pointerId)
    commit()
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStroke(false)
    onChange(null)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <div className="text-sm text-muted-foreground">{label}</div>
      ) : null}
      <div className="rounded-lg border border-input bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          role="img"
          aria-label={label ? `Signature area — ${label}` : "Signature area"}
          className="h-[160px] w-full touch-none rounded-lg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={(e) => {
            if (drawingRef.current) handlePointerUp(e)
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Sign above with your finger or a stylus.
        </span>
        <Button type="button" variant="outline" className="h-11" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  )
}

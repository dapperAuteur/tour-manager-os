'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Drum,
  Guitar,
  Mic,
  Piano,
  Save,
  Speaker,
  Square,
  Trash2,
} from 'lucide-react'
import {
  deleteStagePlot,
  updateStagePlotElements,
  type StagePlotElement,
} from '@/lib/production/actions'

interface PaletteItem {
  type: string
  label: string
  width: number
  height: number
  icon: React.ComponentType<{ className?: string }>
}

/* All coords are in percent of the stage canvas (0–100) so the layout
   is resolution-independent. */
const PALETTE: PaletteItem[] = [
  { type: 'drums', label: 'Drum kit', width: 22, height: 18, icon: Drum },
  { type: 'guitar_amp', label: 'Guitar amp', width: 8, height: 10, icon: Guitar },
  { type: 'bass_amp', label: 'Bass amp', width: 8, height: 10, icon: Guitar },
  { type: 'keys', label: 'Keys', width: 18, height: 8, icon: Piano },
  { type: 'monitor', label: 'Monitor', width: 8, height: 6, icon: Speaker },
  { type: 'mic', label: 'Mic stand', width: 5, height: 5, icon: Mic },
  { type: 'di_box', label: 'DI box', width: 5, height: 4, icon: Square },
  { type: 'riser', label: 'Riser', width: 24, height: 14, icon: Square },
  { type: 'other', label: 'Other', width: 8, height: 6, icon: Square },
]

const COLOR_BY_TYPE: Record<string, string> = {
  drums: 'bg-primary-500/40 border-primary-600/60',
  guitar_amp: 'bg-warning-500/30 border-warning-600/60',
  bass_amp: 'bg-warning-500/40 border-warning-700/60',
  keys: 'bg-success-500/30 border-success-600/60',
  monitor: 'bg-text-muted/20 border-text-muted/40',
  mic: 'bg-error-500/30 border-error-600/60',
  di_box: 'bg-primary-500/20 border-primary-500/50',
  riser: 'bg-surface-alt border-border-default',
  other: 'bg-surface-alt border-border-default',
}

function randomId(): string {
  return 'el_' + Math.random().toString(36).slice(2, 10)
}

export function StagePlotEditor({
  plotId,
  initialElements,
  initialMeta,
}: {
  plotId: string
  initialElements: StagePlotElement[]
  initialMeta: {
    name: string
    description: string | null
    stage_width: number | null
    stage_depth: number | null
  }
}) {
  const router = useRouter()
  const [elements, setElements] = useState<StagePlotElement[]>(initialElements)
  const [meta, setMeta] = useState(initialMeta)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef<{
    id: string
    pointerOffsetX: number
    pointerOffsetY: number
  } | null>(null)

  // Pull selected element handle for the inspector panel.
  const selected = useMemo(
    () => elements.find((e) => e.id === selectedId) || null,
    [elements, selectedId],
  )

  function markDirty() {
    setDirty(true)
    setSavedAt(null)
  }

  function patchElement(id: string, patch: Partial<StagePlotElement>) {
    setElements((els) =>
      els.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )
    markDirty()
  }

  function removeElement(id: string) {
    setElements((els) => els.filter((e) => e.id !== id))
    setSelectedId(null)
    markDirty()
  }

  function addFromPalette(item: PaletteItem) {
    const newEl: StagePlotElement = {
      id: randomId(),
      type: item.type,
      label: item.label,
      x: 50 - item.width / 2,
      y: 50 - item.height / 2,
      width: item.width,
      height: item.height,
      rotation: 0,
    }
    setElements((prev) => [...prev, newEl])
    setSelectedId(newEl.id)
    markDirty()
  }

  // Canvas drag: capture starting pointer offset relative to the
  // element so the cursor "sticks" to the same spot on the element.
  function onElementPointerDown(
    e: React.PointerEvent<HTMLDivElement>,
    el: StagePlotElement,
  ) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedId(el.id)
    const canvas = canvasRef.current
    if (!canvas) return
    const canvasRect = canvas.getBoundingClientRect()
    const elementCenterX = (el.x + el.width / 2) * (canvasRect.width / 100)
    const elementCenterY = (el.y + el.height / 2) * (canvasRect.height / 100)
    const pointerOffsetX =
      e.clientX - canvasRect.left - elementCenterX
    const pointerOffsetY =
      e.clientY - canvasRect.top - elementCenterY
    draggingRef.current = { id: el.id, pointerOffsetX, pointerOffsetY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onElementPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = draggingRef.current
    if (!d) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const newCenterX = e.clientX - rect.left - d.pointerOffsetX
    const newCenterY = e.clientY - rect.top - d.pointerOffsetY
    const target = elements.find((el) => el.id === d.id)
    if (!target) return
    const newX = (newCenterX / rect.width) * 100 - target.width / 2
    const newY = (newCenterY / rect.height) * 100 - target.height / 2
    const clampedX = Math.max(0, Math.min(100 - target.width, newX))
    const clampedY = Math.max(0, Math.min(100 - target.height, newY))
    patchElement(d.id, { x: clampedX, y: clampedY })
  }

  function onElementPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingRef.current) {
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
    draggingRef.current = null
  }

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    const result = await updateStagePlotElements(plotId, elements, {
      name: meta.name,
      description: meta.description,
      stage_width: meta.stage_width,
      stage_depth: meta.stage_depth,
    })
    setSaving(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setDirty(false)
    setSavedAt(Date.now())
  }, [plotId, elements, meta])

  // Ctrl/Cmd+S to save while editing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void save()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          removeElement(selectedId)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save, selectedId])

  async function onDelete() {
    if (!window.confirm(`Delete the entire "${meta.name}" stage plot?`)) return
    const result = await deleteStagePlot(plotId)
    if ('error' in result) {
      setError(result.error)
      return
    }
    router.push('/production/stage-plots')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{meta.name || 'Stage plot'}</h1>
          <p className="text-xs text-text-muted">
            Drag pieces from the palette onto the stage. Click a piece to
            rename or remove. Use{' '}
            <kbd className="rounded border border-border-default bg-surface-alt px-1 text-[10px]">
              ⌘S
            </kbd>{' '}
            to save.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {dirty ? 'Unsaved changes' : savedAt ? 'Saved' : 'No changes'}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="size-3.5" aria-hidden /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-error-500/40 px-3 py-1.5 text-xs font-medium text-error-700 hover:bg-error-500/10 dark:text-error-400"
          >
            <Trash2 className="size-3" aria-hidden /> Delete plot
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Plot name</span>
          <input
            value={meta.name}
            onChange={(e) => {
              setMeta((m) => ({ ...m, name: e.target.value }))
              markDirty()
            }}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Description</span>
          <input
            value={meta.description ?? ''}
            onChange={(e) => {
              setMeta((m) => ({ ...m, description: e.target.value || null }))
              markDirty()
            }}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Stage width (ft)</span>
          <input
            type="number"
            value={meta.stage_width ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setMeta((m) => ({
                ...m,
                stage_width: v === '' ? null : Number(v),
              }))
              markDirty()
            }}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Stage depth (ft)</span>
          <input
            type="number"
            value={meta.stage_depth ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setMeta((m) => ({
                ...m,
                stage_depth: v === '' ? null : Number(v),
              }))
              markDirty()
            }}
            className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </section>

      <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
        {/* Palette */}
        <aside className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Add to stage
          </h2>
          <ul className="grid grid-cols-3 gap-1.5 lg:grid-cols-2">
            {PALETTE.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.type}>
                  <button
                    type="button"
                    onClick={() => addFromPalette(item)}
                    className="flex w-full flex-col items-center gap-1 rounded-md border border-border-default bg-surface-raised p-2 text-xs hover:border-primary-500/40 hover:bg-surface-alt"
                  >
                    <Icon className="size-4 text-text-secondary" aria-hidden />
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {selected && (
            <div className="mt-3 space-y-2 rounded-md border border-primary-500/30 bg-primary-500/5 p-3 text-xs">
              <p className="font-semibold uppercase tracking-wider text-text-muted">
                Selected
              </p>
              <label className="block">
                <span className="mb-1 block">Label</span>
                <input
                  value={selected.label}
                  onChange={(e) =>
                    patchElement(selected.id, { label: e.target.value })
                  }
                  className="w-full rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block">Width</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={selected.width}
                    onChange={(e) =>
                      patchElement(selected.id, {
                        width: Math.max(1, Math.min(100, Number(e.target.value))),
                      })
                    }
                    className="w-full rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block">Height</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={selected.height}
                    onChange={(e) =>
                      patchElement(selected.id, {
                        height: Math.max(1, Math.min(100, Number(e.target.value))),
                      })
                    }
                    className="w-full rounded-md border border-border-default bg-surface px-2 py-1 text-xs"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeElement(selected.id)}
                className="inline-flex items-center gap-1 rounded-md border border-error-500/40 px-2 py-1 text-[10px] font-medium text-error-700 hover:bg-error-500/10 dark:text-error-400"
              >
                <Trash2 className="size-3" aria-hidden /> Remove piece
              </button>
            </div>
          )}
        </aside>

        {/* Stage canvas */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-muted">
            <span>Upstage (back of stage)</span>
            <span>
              {meta.stage_width ?? '—'} ft wide ·{' '}
              {meta.stage_depth ?? '—'} ft deep
            </span>
          </div>
          <div
            ref={canvasRef}
            onPointerDown={() => setSelectedId(null)}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border-2 border-dashed border-border-default bg-surface-alt"
          >
            {elements.map((el) => (
              <div
                key={el.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedId === el.id}
                onPointerDown={(e) => onElementPointerDown(e, el)}
                onPointerMove={onElementPointerMove}
                onPointerUp={onElementPointerUp}
                onPointerCancel={onElementPointerUp}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                }}
                className={`absolute flex cursor-grab select-none items-center justify-center rounded-md border-2 text-center text-[10px] font-medium leading-tight shadow-sm active:cursor-grabbing ${
                  COLOR_BY_TYPE[el.type] || COLOR_BY_TYPE.other
                } ${selectedId === el.id ? 'ring-2 ring-primary-500' : ''}`}
              >
                {el.label}
              </div>
            ))}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-text-muted">
                Click a piece on the left to drop it here. Drag to place.
              </div>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">
            Downstage (audience)
          </p>
        </div>
      </div>
    </div>
  )
}

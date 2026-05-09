'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Keyboard,
  RefreshCw,
  XCircle,
} from 'lucide-react'

type ScanResult =
  | 'ok'
  | 'already_used'
  | 'invalid_sig'
  | 'wrong_show'
  | 'refunded'
  | 'void'
  | 'not_found'

interface ScanRecord {
  result: ScanResult
  ticket_id: string | null
  at: number
}

interface ScannerClientProps {
  showId: string
}

const RESULT_STYLES: Record<ScanResult, { label: string; bg: string; text: string }> = {
  ok: { label: 'Admitted', bg: 'bg-green-600', text: 'text-white' },
  already_used: { label: 'Already used', bg: 'bg-orange-500', text: 'text-white' },
  invalid_sig: { label: 'Forged code', bg: 'bg-red-600', text: 'text-white' },
  wrong_show: { label: 'Wrong show', bg: 'bg-red-600', text: 'text-white' },
  refunded: { label: 'Refunded', bg: 'bg-red-600', text: 'text-white' },
  void: { label: 'Voided', bg: 'bg-red-600', text: 'text-white' },
  not_found: { label: 'Not found', bg: 'bg-red-600', text: 'text-white' },
}

const SAME_QR_DEDUPE_MS = 3000

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  const KEY = 'tmos.scanner.device_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

export function ScannerClient({ showId }: ScannerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const inflightRef = useRef<Set<string>>(new Set())
  const lastScanRef = useRef<{ qr: string; at: number } | null>(null)
  const deviceId = useMemo(getDeviceId, [])

  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const [latest, setLatest] = useState<ScanRecord | null>(null)
  const [history, setHistory] = useState<ScanRecord[]>([])

  const tally = useMemo(() => {
    let ok = 0
    let warn = 0
    let bad = 0
    for (const r of history) {
      if (r.result === 'ok') ok++
      else if (r.result === 'already_used') warn++
      else bad++
    }
    return { ok, warn, bad }
  }, [history])

  const submitScan = useCallback(
    async (qrText: string) => {
      // Dedupe: skip if same QR seen within window or in-flight.
      const now = Date.now()
      if (
        lastScanRef.current &&
        lastScanRef.current.qr === qrText &&
        now - lastScanRef.current.at < SAME_QR_DEDUPE_MS
      ) {
        return
      }
      if (inflightRef.current.has(qrText)) return
      inflightRef.current.add(qrText)
      lastScanRef.current = { qr: qrText, at: now }

      try {
        const res = await fetch('/api/tickets/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr: qrText, show_id: showId, device_id: deviceId }),
        })
        const json = (await res.json().catch(() => ({}))) as {
          result?: ScanResult
          ticket_id?: string
          error?: string
        }
        if (!res.ok || !json.result) {
          setError(json.error || `scan failed (${res.status})`)
          return
        }
        const record: ScanRecord = {
          result: json.result,
          ticket_id: json.ticket_id ?? null,
          at: now,
        }
        setLatest(record)
        setHistory((prev) => [record, ...prev].slice(0, 50))
        if (navigator.vibrate) {
          navigator.vibrate(json.result === 'ok' ? 80 : [80, 60, 80])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'network error')
      } finally {
        inflightRef.current.delete(qrText)
      }
    },
    [showId, deviceId],
  )

  const startCamera = useCallback(async () => {
    if (!videoRef.current || running) return
    setError(null)
    try {
      const reader = new BrowserMultiFormatReader()
      const controls = await reader.decodeFromVideoDevice(
        undefined, // default device — usually rear camera on mobile
        videoRef.current,
        (result, _err, _ctrl) => {
          if (result) {
            void submitScan(result.getText())
          }
        },
      )
      controlsRef.current = controls
      setRunning(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'camera unavailable — use manual entry',
      )
    }
  }, [running, submitScan])

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setRunning(false)
  }, [])

  useEffect(() => {
    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [])

  const onManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const v = manualValue.trim()
      if (!v) return
      await submitScan(v)
      setManualValue('')
    },
    [manualValue, submitScan],
  )

  const latestStyle = latest ? RESULT_STYLES[latest.result] : null

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-default bg-surface-raised p-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          {!running && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 font-semibold shadow hover:bg-blue-700"
              >
                <Camera className="size-5" aria-hidden /> Start camera
              </button>
            </div>
          )}
          {latestStyle && (
            <div
              role="status"
              className={`pointer-events-none absolute inset-0 flex items-center justify-center ${latestStyle.bg} ${latestStyle.text} transition-opacity`}
              style={{ animation: 'tmos-flash 800ms ease-out' }}
              key={latest!.at}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                {latest!.result === 'ok' ? (
                  <CheckCircle2 className="size-16" aria-hidden />
                ) : (
                  <XCircle className="size-16" aria-hidden />
                )}
                <div className="text-2xl font-bold">{latestStyle.label}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {running ? (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm hover:bg-surface-hover"
              >
                <CameraOff className="size-4" aria-hidden /> Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Camera className="size-4" aria-hidden /> Resume
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm hover:bg-surface-hover"
            >
              <Keyboard className="size-4" aria-hidden /> Manual
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
              {tally.ok} ✓
            </span>
            <span className="rounded-full bg-orange-100 px-2 py-1 font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
              {tally.warn} ↻
            </span>
            <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {tally.bad} ✕
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          >
            {error}
          </div>
        )}
      </div>

      {showManual && (
        <form
          onSubmit={onManualSubmit}
          className="rounded-2xl border border-border-default bg-surface-raised p-4"
        >
          <label className="block text-sm font-medium">
            Manual entry
            <span className="block text-xs font-normal text-text-muted">
              Paste the QR JSON or just the ticket id (8-4-4-4-12 UUID).
            </span>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-2 font-mono text-sm"
                placeholder='{"v":"v1","id":"…","sig":"…"}'
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Scan
              </button>
            </div>
          </label>
        </form>
      )}

      <section
        aria-label="Recent scans"
        className="rounded-2xl border border-border-default bg-surface-raised"
      >
        <header className="flex items-center justify-between border-b border-border-default px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            <RefreshCw className="size-4" aria-hidden /> Recent
          </h2>
          <span className="text-xs text-text-muted">
            last {history.length} of 50
          </span>
        </header>
        {history.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            No scans yet.
          </div>
        ) : (
          <ol className="divide-y divide-border-default">
            {history.map((r) => (
              <li
                key={`${r.at}-${r.ticket_id ?? 'unknown'}`}
                className="flex items-center justify-between gap-4 px-4 py-2 text-sm"
              >
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${RESULT_STYLES[r.result].bg} ${RESULT_STYLES[r.result].text}`}
                >
                  {RESULT_STYLES[r.result].label}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {r.ticket_id
                    ? `${r.ticket_id.slice(0, 8)}…`
                    : '—'}
                </span>
                <time className="text-xs text-text-muted">
                  {new Date(r.at).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>

      <style>{`
        @keyframes tmos-flash {
          0% { opacity: 0.95; }
          80% { opacity: 0.6; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  )
}

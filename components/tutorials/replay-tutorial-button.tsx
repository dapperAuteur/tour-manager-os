'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { TutorialOverlay, type TutorialStep } from './tutorial-overlay'

interface ReplayTutorialButtonProps {
  moduleId: string
  moduleName: string
  steps: TutorialStep[]
}

export function ReplayTutorialButton({
  moduleId,
  moduleName,
  steps,
}: ReplayTutorialButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-border-default px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-alt"
        aria-label={`Replay ${moduleName} walkthrough`}
      >
        <HelpCircle className="size-3" aria-hidden /> Walkthrough
      </button>
      {open && (
        <TutorialOverlay
          moduleId={moduleId}
          moduleName={moduleName}
          steps={steps}
          autoOpen
        />
      )}
    </>
  )
}

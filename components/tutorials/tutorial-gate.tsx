import { getTutorialState } from '@/lib/tutorials/queries'
import { TutorialOverlay } from './tutorial-overlay'
import { ReplayTutorialButton } from './replay-tutorial-button'

interface TutorialGateProps {
  moduleId: string
  moduleName: string
}

/**
 * Server component that:
 *   1. Fetches the user's progress for `moduleId`.
 *   2. If pending (never seen), renders the overlay auto-opened.
 *   3. If completed or skipped, renders only a small "Replay walkthrough"
 *      button so users can re-trigger the overlay on demand.
 *
 * Drop this into a module's landing page once and forget it.
 */
export async function TutorialGate({ moduleId, moduleName }: TutorialGateProps) {
  const state = await getTutorialState(moduleId)
  if (!state) return null

  if (state.status === 'pending') {
    return (
      <TutorialOverlay
        moduleId={moduleId}
        moduleName={moduleName}
        steps={state.steps}
        initialStep={state.lastStep}
        autoOpen
      />
    )
  }

  return (
    <ReplayTutorialButton
      moduleId={moduleId}
      moduleName={moduleName}
      steps={state.steps}
    />
  )
}

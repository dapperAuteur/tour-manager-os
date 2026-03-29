'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { markLessonComplete } from '@/lib/academy/actions'

interface Quiz {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string | null
}

export function QuizSection({ quizzes, lessonId, courseId }: { quizzes: Quiz[]; lessonId: string; courseId: string }) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const totalCorrect = quizzes.filter((q) => answers[q.id] === q.correct_answer).length
  const score = Math.round((totalCorrect / quizzes.length) * 100)

  async function handleSubmit() {
    setSubmitted(true)
    setLoading(true)
    await markLessonComplete(lessonId, courseId, score)
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-6">
      <h2 className="mb-4 text-lg font-semibold">Quick Quiz</h2>

      <div className="space-y-6">
        {quizzes.map((quiz, qIdx) => {
          const options = Array.isArray(quiz.options) ? quiz.options : JSON.parse(quiz.options as unknown as string)
          const selected = answers[quiz.id]

          return (
            <div key={quiz.id}>
              <p className="mb-3 text-sm font-medium">{qIdx + 1}. {quiz.question}</p>
              <div className="space-y-2">
                {options.map((opt: string, idx: number) => {
                  const isSelected = selected === idx
                  const showCorrect = submitted && idx === quiz.correct_answer
                  const showWrong = submitted && isSelected && idx !== quiz.correct_answer

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !submitted && setAnswers({ ...answers, [quiz.id]: idx })}
                      disabled={submitted}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                        showCorrect ? 'border-success-500 bg-success-500/10' :
                        showWrong ? 'border-error-500 bg-error-500/10' :
                        isSelected ? 'border-primary-500 bg-primary-500/10' :
                        'border-border-default hover:bg-surface-alt'
                      }`}
                    >
                      {showCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />}
                      {showWrong && <XCircle className="h-4 w-4 shrink-0 text-error-500" aria-hidden="true" />}
                      {!showCorrect && !showWrong && (
                        <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-border-default'}`} />
                      )}
                      {opt}
                    </button>
                  )
                })}
              </div>
              {submitted && quiz.explanation && (
                <p className="mt-2 text-xs text-text-muted">{quiz.explanation}</p>
              )}
            </div>
          )
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || Object.keys(answers).length < quizzes.length}
          className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Answers'}
        </button>
      ) : (
        <div className="mt-6 rounded-lg bg-surface-alt p-4 text-center">
          <p className="text-lg font-bold">{score}%</p>
          <p className="text-sm text-text-secondary">{totalCorrect} of {quizzes.length} correct — lesson marked complete!</p>
        </div>
      )}
    </div>
  )
}

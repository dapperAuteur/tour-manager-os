export function LessonContent({ content }: { content: string }) {
  const sections = content.split('\n\n').map((block: string, i: number) => {
    if (block.startsWith('## ')) {
      return <h2 key={i} className="mb-3 mt-6 text-lg font-semibold">{block.replace('## ', '')}</h2>
    }
    if (block.match(/^\d+\.\s/)) {
      const items = block.split('\n').filter((l) => l.match(/^\d+\.\s/))
      return (
        <ol key={i} className="mb-4 list-decimal space-y-1 pl-6 text-sm text-text-secondary">
          {items.map((item, j) => <li key={j}>{item.replace(/^\d+\.\s/, '')}</li>)}
        </ol>
      )
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="mb-4 list-disc space-y-1 pl-6 text-sm text-text-secondary">
          {items.map((item, j) => <li key={j}>{item.replace('- ', '')}</li>)}
        </ul>
      )
    }
    // Bold text within paragraphs
    const parts = block.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      return part
    })
    return <p key={i} className="mb-4 text-sm text-text-secondary">{parts}</p>
  })

  return <div>{sections}</div>
}

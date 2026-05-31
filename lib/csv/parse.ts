/**
 * Minimal CSV parser. Handles:
 *   - quoted fields with embedded commas and double-quote escaping
 *   - CRLF + LF line endings
 *   - blank lines (skipped)
 *
 * Returns rows as string[]. First row is assumed to be the header
 * by the caller — this function makes no header assumption.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = input.length

  while (i < len) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
      i++
      continue
    }
    if (ch === '\n') {
      row.push(field)
      // Skip pure-blank rows.
      if (row.length > 1 || row[0].trim() !== '') rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += ch
    i++
  }
  // Flush final field/row if file doesn't end in newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.length > 1 || row[0].trim() !== '') rows.push(row)
  }
  return rows
}

/**
 * Convert parsed rows + header into an array of plain objects keyed
 * by header. Trims each cell. Returns null if input is empty.
 */
export function rowsToObjects(
  parsed: string[][],
): { headers: string[]; rows: Record<string, string>[] } | null {
  if (parsed.length === 0) return null
  const headers = parsed[0].map((h) => h.trim())
  const rows = parsed.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? '').trim()
    })
    return obj
  })
  return { headers, rows }
}

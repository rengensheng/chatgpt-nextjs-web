import { CodeExplainRow } from "@/utils/explain"
import { useEffect, useState } from "react"

interface CodeExplainRowPosition extends CodeExplainRow {
  top: number
  height: number
}

interface ExplainBlockProps {
  rows: CodeExplainRow[]
}

export default function ExplainBlock(props: ExplainBlockProps) {
  const [ rows, setRows ] = useState<CodeExplainRowPosition[]>([])
  useEffect(() => {
    const explainRows: CodeExplainRowPosition[] = []
    const lineNumbers = document.getElementsByClassName('linenumber')
    for (let i = 0; i < lineNumbers.length; i++) {
      lineNumbers[i].setAttribute("id", `line-number-${i + 1}`)
    }
    let top = 0;
    props.rows.forEach(row => {
      for (let i = 0; i < lineNumbers.length; i++) {
        if (lineNumbers[i].innerHTML === '1') {
          top = (lineNumbers[i] as HTMLElement).offsetTop
        }
        if (parseInt(lineNumbers[i].innerHTML) == row.start) {
          const explainRow: CodeExplainRowPosition = {
            ...row,
            height: lineNumbers[i].clientHeight,
            top: (lineNumbers[i] as HTMLElement).offsetTop - top + 16
          }
          explainRows.push(explainRow)
          break
        }
      }
    })
    setRows(explainRows)
  }, [props.rows])

  function explainBlockOver(row: CodeExplainRowPosition) {
    for (let i = row.start; i <= row.end; i++) {
      document.getElementById(`line-number-${i}`)?.parentElement?.classList.add('hover-line')
    }
  }

  function explainBlockLeave(row: CodeExplainRowPosition) {
    for (let i = row.start; i <= row.end; i++) {
      document.getElementById(`line-number-${i}`)?.parentElement?.classList.remove('hover-line')
    }
  }

  return <div className="relative h-full px-3 pt-2">
    {rows.map(row => {
      return <div onMouseOver={() => explainBlockOver(row)} onMouseLeave={() => explainBlockLeave(row)} className="absolute px-2 py-1 text-xs text-white bg-blue-500 border-white border-solid cursor-pointer border-y-4 hover:bg-blue-400 group" key={row.start} style={{ top: row.top + 2 + 'px' }}>
        {row.text}
        <div className="absolute w-2 h-2 rotate-45 bg-blue-500 top-1 -left-1 group-hover:bg-blue-400"></div>
      </div>
    })}
  </div>
}
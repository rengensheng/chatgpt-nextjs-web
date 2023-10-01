import { useEffect, useState } from "react"
import Messaage from "./Message"

export function MessageLoading() {
  const [statusText, setSatatusText] = useState<string>('思考中...')
  useEffect(() => {
    const intervaler = setInterval(() => {
      setSatatusText(statusText => {
        if (statusText.endsWith('...')) {
          return '思考中'
        }
        return statusText + '.'
      })
    }, 500)
    return () => {
      clearInterval(intervaler)
    }
  }, [])
  return (
    <Messaage content={statusText} role="assistant"/>
  )
}
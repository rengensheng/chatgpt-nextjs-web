import { streamPost } from "./request"
import { MessageProps } from "@/components/Message"

export interface CodeExplainRow {
  start: number
  end: number
  text: string
}

export interface CodeExplain {
  language: string
  description?: string
  rows: CodeExplainRow[]
}

export function chatCompletion(messageList: MessageProps[], setCallBack: (message: string, isComplete: boolean) => void): AbortController {
  const controller = new AbortController()
  const signal = controller.signal
  streamPost('/api/explain', {
    History: messageList
  }, signal).then(response => response.body).then(body => {
    if (!body) {
      setCallBack("", true)
      return
    }
    let message = "";
    const reader = body.getReader()
    function readStream(): any {
      return reader.read().then(({ done, value }) => {
        if (done) {
          setCallBack(message, true)
          return;
        }
        message += new TextDecoder("utf-8").decode(value)
        setCallBack(message, false)
        return readStream();
      });
    }
    return readStream()
  })
  return controller
}

export function parseMessage(message: string): CodeExplain {
  message = message.replaceAll("\\n", "\n")
  const lines = message.split("\n")
  // 读取编程语言类型
  const description = lines[0].split(']')
  let language = "javascript"
  let explainTitle = ""
  try {
    language = description[0].replace('[', '').toLowerCase()
    if (description.length > 0) {
      explainTitle = description[1]
    }
  } catch(e) {
    console.log('获取程序信息出错', e)
  }
  const explainRowList: CodeExplainRow[] = []
  const rowReg = /\[(\d+)\]\[(\d+)\]\s*(.*)$/
  const rowReg2 = /\[(\d+)\]\s*(.*)$/
  for (let i = 1; i < lines.length; i++) {
    const result = lines[i].match(rowReg)
    if (result && result.length > 3) {
      const res: CodeExplainRow = {
        start: parseInt(result[1]),
        end: parseInt(result[2]),
        text: result[3]
      }
      explainRowList.push(res)
    } else {
      const result = lines[i].match(rowReg2)
      if (result && result.length > 2) {
        const res: CodeExplainRow = {
          start: parseInt(result[1]),
          end: parseInt(result[1]),
          text: result[2]
        }
        explainRowList.push(res)
      }
    }
  }
  const codeExplain: CodeExplain = {
    language,
    description: explainTitle,
    rows: explainRowList
  }
  return codeExplain
}
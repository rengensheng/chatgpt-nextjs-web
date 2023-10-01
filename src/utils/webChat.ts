import { streamPost } from "./request"
import { MessageProps } from "@/components/Message"

export function chatCompletion(messageList: MessageProps[], Url: string, SessionId: string, setCallBack: (message: string, isComplete: boolean) => void): AbortController {
  const controller = new AbortController()
  const signal = controller.signal
  streamPost('/api/web', {
    History: messageList,
    Url,
    SessionId,
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
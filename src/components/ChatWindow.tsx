import ChatContainer from "./ChatContainer";
import ChatList from "./ChatList";
import AppList from "./AppList";
import { useRef, useState } from "react";

export default function ChatWindow() {
  const [activeSessionId, setActiceSessionId] = useState<string>('')
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  
  const chatListRef = useRef<any>(null)
  function changeSession(sessionId: string) {
    setActiceSessionId(sessionId)
  }
  function refreshSession() {
    chatListRef.current?.getList()
  }
  function toggleScreen() {
    setFullScreen(!fullScreen)
  }

  function showList() {
    chatListRef.current?.showList()
  }

  return <div className={"w-full h-full mx-auto my-auto bg-white chat-window " + (!fullScreen?"md:w-3/4 md:h-3/4" : "")}>
    <div className="flex w-full h-full border-2 border-gray-200 border-none rounded shadow-lg flew-row">
      <AppList />
      <ChatList ref={chatListRef} onChange={(sessionId: string) => changeSession(sessionId)} />
      <ChatContainer fullScreen={fullScreen} toggleScreen={toggleScreen} showList={showList} onChange={refreshSession} id={activeSessionId} />
    </div>
  </div>
}
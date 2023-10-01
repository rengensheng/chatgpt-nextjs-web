"use client"
import ChatContainer from "@/components/ChatContainer"
import ChatList from "@/components/ChatList"
import { useContext, useRef, useState } from "react"
import { fullScreenContext } from "@/components/ChatWindowView"

export default function ChatApplication() {
  const [activeSessionId, setActiceSessionId] = useState<string>('')
  const {fullScreen, setFullScreen} = useContext(fullScreenContext)

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
  return (<><ChatList ref={chatListRef} onChange={(sessionId: string) => changeSession(sessionId)} />
    <ChatContainer fullScreen={fullScreen} toggleScreen={toggleScreen} showList={showList} onChange={refreshSession} id={activeSessionId} /></>)
}
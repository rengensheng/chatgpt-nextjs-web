"use client"
import WebChatContainer from "@/components/WebChatContainer"
import WebChatList from "@/components/WebChatList"
import { useContext, useRef, useState } from "react"
import { fullScreenContext } from "@/components/ChatWindowView"
import { InlineIcon } from "@iconify/react"
import { post } from "@/utils/request"

export default function ChatApplication() {
  const [activeSessionId, setActiceSessionId] = useState<string>('')
  const { fullScreen, setFullScreen } = useContext(fullScreenContext)
  const [url, setUrl] = useState<string>('')

  const chatListRef = useRef<any>(null)
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false)

  function changeSession(sessionId: string) {
    setActiceSessionId(sessionId)
    setShowSearchBar(false)
  }
  function refreshSession() {
    chatListRef.current?.getList()
  }
  function toggleScreen() {
    setFullScreen(!fullScreen)
  }

  function showList() {
    setShowSearchBar(true)
    chatListRef.current?.showList()
  }

  function handleAnalysis() {
    post('/api/session', {
      type: 'add',
      session_name: '未命名会话',
      history: 4,
      session_type: "web",
      params: url,
    }).then((res) => {
      if (res.result) {
        if (chatListRef.current) {
          chatListRef.current.getList()
        }
        setUrl('')
      }
    }).catch(e => {
      alert('分析失败')
    })
  }

  return (<div className="flex flex-col flex-grow w-1/2 h-full">
    <div className={"flex w-full px-2 py-2 " + (showSearchBar ? "flex" : "hidden md:flex")}>
      <input onInput={(e) => {
        setUrl(e.currentTarget.value)
      }} placeholder="请输入网址进行分析" className="flex-grow w-1/2 h-10 px-2 border border-gray-300 border-solid rounded first-letter:px-2" />
      <button className="flex items-center px-2 py-1 text-white bg-blue-500 rounded" onClick={() => handleAnalysis()}>
        <InlineIcon icon="icon-park-solid:analysis" className="mr-2" />
        开始分析</button>
    </div>
    <div className="flex flex-row flex-grow h-10">
      <WebChatList ref={chatListRef} onChange={(sessionId: string) => changeSession(sessionId)} />
      {activeSessionId && <WebChatContainer fullScreen={fullScreen} toggleScreen={toggleScreen} showList={showList} onChange={refreshSession} id={activeSessionId} />}
    </div>

  </div>)
}
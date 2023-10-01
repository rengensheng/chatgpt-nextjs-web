"use client"
import { useRouter } from "next/navigation";
import AppList from "./AppList";
import { useState, createContext, useEffect, useLayoutEffect } from "react";

interface ChatWindowViewProps {
  children: React.ReactNode
}

export const fullScreenContext = createContext<any>({})
export const applicationContext = createContext<any>({})

export default function ChatWindow(props: ChatWindowViewProps) {
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  const [showApplication, setShowApplication] = useState<boolean>(false)
  const router = useRouter()
  // 检查是否已经登陆
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push('/login')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useLayoutEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      const styleLabel = document.createElement("style")
      styleLabel.innerHTML = `
        @supports(-webkit-touch-callout:none) {
          /* iOS设备的样式 */
          .h-screen {
              height: calc(100vh - 100px);
          }
        }`
      document.body.append(styleLabel)
  }
  }, [])
  return <div id="chat-window" className={"w-full h-full mx-auto my-auto bg-white chat-window " + (!fullScreen ? "md:w-3/4 md:h-3/4" : "")}>
    <div className="flex w-full h-full border-2 border-gray-200 border-none rounded shadow-lg flew-row">
      <fullScreenContext.Provider value={{
        fullScreen, setFullScreen
      }}>
        <applicationContext.Provider value={{
          showApplication,
          setShowApplication,
        }}>
          <AppList />
          {props.children}
        </applicationContext.Provider>
      </fullScreenContext.Provider>
    </div>
  </div>
}
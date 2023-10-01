/* eslint-disable @next/next/no-img-element */
"use client"
import { Icon, InlineIcon } from "@iconify/react"
import { useContext, useState } from "react"
import { fullScreenContext } from "@/components/ChatWindowView"
import { post } from "@/utils/request"
import NavigatorBar from "@/components/NavigatorBar"

export default function ImageApplication() {
  const [sending, setSending] = useState<boolean>(false)
  const [filename, setFilename] = useState<string>('')
  const { fullScreen, setFullScreen } = useContext(fullScreenContext)
  const [text, setText] = useState<string>('')

  function handleSendMessage() {
    if (sending) return;
    if (!text) {
      alert('请输入内容')
      return
    }
    setSending(true)
    post("/api/image", {
      input: text,
      size: "512x512"
    }).then(res => {
      if (!(res.result && res.result.filename)) {
        alert('生成失败')
        return
      }
      setFilename(res.result.filename)
    }).finally(() => {
      setSending(false)
    })
  }
  return <div className="flex flex-col flex-grow px-3">
    <NavigatorBar />
    <div className="flex flex-row pt-3">
      <div className="text-xl">图片生成<span className="text-sm font-normal text-gray-400">（基于openAI DALL-E 2 模型）</span></div>
      <div className="flex items-center justify-end flex-grow w-1/5">
        {!fullScreen && <button onClick={() => {
          setFullScreen(!fullScreen)
        }} className="hidden px-3 text-2xl text-gray-500 py2 hover:text-blue-400 md:block">
          <Icon icon="icon-park-outline:full-screen-one" />
        </button>}
        {fullScreen && <button onClick={() => {
          setFullScreen(!fullScreen)
        }} className="hidden px-3 text-2xl text-gray-500 py2 hover:text-blue-400 md:block">
          <Icon icon="icon-park-outline:off-screen" />
        </button>}
      </div>
    </div>
    <div className={"w-full px-2 pb-3 my-2 mt-4 border border-gray-300 border-solid relative " + (sending ? "loading-container" : "")}>
      <textarea
        onChange={(e) => setText(e.target.value)}
        className="flex-grow w-full h-auto p-2 text-sm text-gray-500 border-none outline-none resize-none user-scroller"
        placeholder="请描述需要生成的图片..."
      ></textarea>
      <div className="flex items-end justify-end w-full">
        <button disabled={sending} className="flex items-center px-2 py-1 text-white bg-blue-500 rounded" onClick={() => handleSendMessage()}>
          <InlineIcon icon="teenyicons:send-solid" className="mr-2" />
          生成</button>
      </div>
    </div>
    {filename && <div className="container flex items-center justify-center flex-grow w-full pt-6 overflow-y-auto h-30">
      <div className="max-w-full p-5 border border-gray-300 border-solid rounded">
        <img width="100%" height="100%" alt="生成图片" src={"/api/upload?filename=" + filename} />
      </div>
    </div>}
  </div>
}
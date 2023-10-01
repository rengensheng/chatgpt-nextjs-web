"use client"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"

export default function Home() {
  const router = useRouter()
  function HandleJumpToChat() {
    router.push('/application/chat')
  }
  return (
    <main className="flex flex-col items-center justify-between pt-24 pb-15">
      <div className='mb-10 text-2xl'>欢迎访问智能无语机器对话系统.</div>
      <div className="pt-2">
        <button className="flex px-5 py-4 text-white bg-blue-500 rounded hover:bg-blue-400" onClick={() => HandleJumpToChat()}>
          <Icon icon="material-symbols:text-select-jump-to-end" className="mr-3 text-2xl" />
          跳转到ChatGPT
        </button>
      </div>
    </main>
  )
}

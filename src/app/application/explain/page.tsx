"use client"
import { MessageProps } from "@/components/Message";
import { Icon, InlineIcon } from "@iconify/react";
import { useContext, useRef, useState } from "react";
import { chatCompletion, CodeExplain, CodeExplainRow, parseMessage } from "@/utils/explain"
import CodeBlock from "@/components/CodeBlock";
import ExplainBlock from "@/components/ExplainBlock"
import { fullScreenContext } from "@/components/ChatWindowView";
import { post } from "@/utils/request";
import Dialog from "@/components/Dialog";
import ChatSessionItem, { SessionProps } from "@/components/ChatSessionItem";
import UserForm from "@/components/UserForm";
import type { FormItem, UserFormHandle } from "@/components/UserForm"
import NavigatorBar from "@/components/NavigatorBar";

const sessionForms: FormItem[] = [{
  label: '会话标题',
  type: 'input',
  value: 'session_name',
}]

export default function Explain() {
  const currentMessageInput = useRef<HTMLTextAreaElement>(null)
  const [chatting, setChatting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [currentCode, setCurrentCode] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [codeExplainResult, setCodeExplainResult] = useState<CodeExplainRow[]>([])
  const { fullScreen, setFullScreen } = useContext(fullScreenContext)
  const [visible, setVisible] = useState<boolean>(false)
  const [sessionList, setSessionList] = useState<SessionProps[]>([])
  const [hoverSession, setHoverSession] = useState<string>('')
  const [session, setSession] = useState<any>({})
  const currentSessionEditForm = useRef<UserFormHandle>(null)
  const [formVisible, setFormVisible] = useState<boolean>(false)

  function setTextAreaHeight() {
    if (currentMessageInput.current) {
      currentMessageInput.current.style.height = 'auto'
      const parentHeight = document.getElementById("text-area-container")?.clientHeight || 0
      if (currentMessageInput.current.scrollHeight < (parentHeight - 60)) {
        currentMessageInput.current.style.height = currentMessageInput.current.scrollHeight + 'px'
      } else {
        currentMessageInput.current.style.height = (parentHeight - 60) + 'px'
      }
      currentMessageInput.current.style.maxHeight = parentHeight + 'px'
    }
  }

  function handleSendMessage() {
    if (!currentMessageInput.current?.value || chatting) {
      return
    }
    setChatting(true)
    setLoading(true)
    const message: string = currentMessageInput.current?.value
    post('/api/session', {
      type: 'add',
      session_name: message.slice(0, 30).replaceAll("\n", " "),
      history: 0,
      session_type: "code",
    }).then((res) => {
      if (res.result) {
        setSession(res.result)
        setCurrentCode(message)
        const list: MessageProps[] = [{
          session_id: res.result.id,
          content: currentMessageInput.current?.value || '',
          role: "user"
        }]
        setChatting(true)
        chatCompletion(list, (message, isComplete) => {
          const { description } = handleParseMessage(message)
          setLoading(false)
          if (isComplete) {
            setChatting(false)
            if (description && description != res.result.session_name) {
              editSessionInfo({
                ...res.result,
                session_name: description
              })
              res.result.session_name = description
            }
          }
        })
        if (currentMessageInput.current) {
          currentMessageInput.current.value = ''
        }
        setTextAreaHeight()
      }
    }).catch(() => {
      setLoading(false)
    }).finally(() => {
      setChatting(false)
    })
  }

  function handleParseMessage(message: string): CodeExplain {
    const result = parseMessage(message)
    setLanguage(result.language)
    setCodeExplainResult(result.rows)
    return result
  }

  function showHistory() {
    getSessionList().then(() => {
      setVisible(true)
    })
  }

  function goBack() {
    setLanguage('')
    setCurrentCode('')
    setSession({})
  }

  function handleChangeSession(session: SessionProps) {
    setHoverSession(session.id)
    post('/api/interface', {
      name: 'message',
      type: 'list',
      pageSize: 2,
      sortType: 'desc',
      query: {
        session_i_d: session.id
      }
    }).then(res => {
      // 修改messageList最后两条数据的Id
      if (res.result && res.result.items) {
        const list = res.result.items
        handleParseMessage(list[0].content)
        setCurrentCode(list[1].content)
        setSession(session)
        setVisible(false)
      }
    })
  }

  function getSessionList(name?: string) {
    const query: any = {}
    query['session_type'] = 'code'
    if (name) {
      query['session_name'] = `*${name}*`
    }
    return post('/api/session', {
      type: 'list',
      pageSize: 1000000,
      query,
    }).then(res => {
      const sessionListTmp: any[] = []
      if (res.result && res.result.items) {
        res.result.items.forEach((session: Record<string, any>) => {
          sessionListTmp.push({
            name: session.session_name,
            history: session.histroy,
            id: session.id,
            lastMessageTime: session.updated_time,
            messageCount: 0,
            ...session,
          })
        })
        setSessionList(sessionListTmp)
      } else {
        setSessionList([])
      }
    })
  }

  function deleteSession(id: string) {
    post('/api/session', {
      type: 'delete/' + id
    }).then(() => {
      getSessionList()
    })
  }

  function editSessionInfo(sessionInfo: Record<string, any>) {
    post('/api/interface', {
      type: 'update',
      ...session,
      ...sessionInfo,
      name: 'session',
    }).then(res => {
      if (res.result) {
        setSession(res.result)
        setFormVisible(false)
      }
    })
  }

  function handleSetting() {
    currentSessionEditForm.current?.setDefaultValue(session)
    setFormVisible(true)
  }

  return <div className={"relative flex flex-col flex-grow w-full h-full chat-container "  + (loading ? "loading-container" : "")}>
    <div className="flex w-full px-2 py-3 bg-white border-t border-gray-200 border-solid md:bg-gray-100">
      <div className="flex items-center flex-grow">
        <span className="border-gray-600 border-solid cursor-pointer hover:border-b-2">{session?.session_name}</span>
      </div>
      <div className="flex flex-row">
        <NavigatorBar />
        {language && currentCode && <button onClick={() => goBack()} className="px-3 text-3xl text-gray-500 py2 hover:text-blue-400">
          <Icon icon="icon-park-solid:back" />
        </button>}
        <button onClick={() => showHistory()} className="px-3 text-3xl text-gray-500 py2 hover:text-blue-400">
          <Icon icon="ic:sharp-history" />
        </button>
        {session.session_name && <button onClick={() => {
          handleSetting()
        }} className="px-3 text-3xl text-gray-500 py2 hover:text-blue-400">
          <Icon icon="ant-design:setting-outlined" />
        </button>}
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
    <div id="text-area-container" className={"w-full overflow-hidden flex-grow pb-3 bg-white border-t border-gray-200 border-solid " + (language && currentCode ? "hidden" : "")}>
      <textarea
        ref={currentMessageInput}
        className="flex-grow w-full h-auto p-2 text-sm text-gray-500 border-none outline-none resize-none user-scroller"
        placeholder="请粘贴代码至此处..."
        onInput={() => setTextAreaHeight()}
      ></textarea>
      <div className="flex items-end justify-end w-full pr-5">
        <button disabled={chatting} className="flex items-center px-2 py-1 text-white bg-blue-500 rounded" onClick={() => handleSendMessage()}>
          <InlineIcon icon="teenyicons:send-solid" className="mr-2" />
          分析代码</button>
      </div>
    </div>
    <div className={"flex flex-grow px-2 flex-row w-full h-full overflow-x-hidden overflow-y-auto " + (language && currentCode ? "flex" : "hidden")}>
      <div className="flex-grow w-1/5 h-full">
        {language && currentCode && <CodeBlock language={language} value={currentCode} />}
      </div>
      <div className="flex-grow w-1/5 h-full">
        <ExplainBlock rows={codeExplainResult} />
      </div>
    </div>
    <Dialog title="分析历史" visible={visible} onOk={() => setVisible(false)} onCancel={() => setVisible(false)} width="380px">
      <div className="flex flex-col">
        <div className="flex-grow overflow-x-hidden overflow-y-auto h-80 deep-scroller">
          {sessionList.map(item => {
            return <ChatSessionItem onDelete={deleteSession} key={item.id} {...item} isSelect={hoverSession === item.id} onClick={() => handleChangeSession(item)} />
          })}
        </div>
      </div>
    </Dialog>
    <Dialog title="会话设置" visible={formVisible} onOk={function (): void {
      const formValues = currentSessionEditForm.current?.getValues()
      if (!(formValues && formValues.session_name)) {
        alert('输入错误')
        return
      }
      editSessionInfo({
        session_name: formValues.session_name
      })
    }} onCancel={function (): void {
      setFormVisible(false)
    }} width="380px">
      <div className="flex flex-col">
        <UserForm ref={currentSessionEditForm} forms={sessionForms} />
      </div>
    </Dialog>
  </div>
}
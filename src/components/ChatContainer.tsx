import { useCallback, useEffect, useRef, useState } from "react"
import type { MessageProps } from "./Message"
import Message from "./Message"
import { Icon, InlineIcon } from "@iconify/react"
import { chatCompletion } from "@/utils/chat"
import { MessageLoading } from "./MessageLoading"
import { post } from "@/utils/request"
import Dialog from "./Dialog"
import UserForm from "./UserForm"
import type { FormItem, UserFormHandle } from "./UserForm"
interface ChatProps {
  id: string
  fullScreen?: boolean
  toggleScreen?: () => void
  onChange?: () => void
  showList?: () => void
}

const topTip = `您好！欢迎使用人工智能助手。我可以帮您回答各种问题，但很抱歉，我无法回答有关政治的问题。请告诉我您需要什么样的帮助，我将尽力为您提供准确的答案。`
const sessionForms: FormItem[] = [{
  label: '历史会话',
  type: 'number',
  value: 'history',
}, {
  label: '会话标题',
  type: 'input',
  value: 'session_name',
},]
export default function ChatContainer(props: ChatProps) {
  const [messageList, setMessageList] = useState<MessageProps[]>([])
  const [session, setSession] = useState<any>()
  const currentMessageInput = useRef<HTMLTextAreaElement>(null)
  const messageListContainer = useRef<HTMLDivElement>(null)
  const [waiting, setWaiting] = useState<boolean>(false)
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [chatting, setChatting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [visible, setVisible] = useState<boolean>(false)
  const currentSessionEditForm = useRef<UserFormHandle>(null)

  function loadLasetMessage(newList: MessageProps[]) {
    post('/api/interface', {
      name: 'message',
      type: 'list',
      pageSize: 2,
      sortType: 'desc',
      query: {
        session_i_d: props.id
      }
    }).then(res => {
      // 修改messageList最后两条数据的Id
      if (res.result && res.result.items) {
        const list = res.result.items
        if (list.length === 2 && newList[newList.length - 2].content === list[1].content) {
          newList[newList.length - 2] = list[1]
          newList[newList.length - 1] = list[0]
          setMessageList(newList)
        }
      }
    })
  }

  function loadMessageList() {
    post('/api/interface', {
      name: 'message',
      pageSize: 100000,
      type: 'list',
      SortType: 'asc',
      query: {
        session_i_d: props.id
      }
    }).then(res => {
      if (res.result && res.result.items) {
        setMessageList(res.result.items)
      } else {
        setMessageList([])
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  function loadSessionInfo() {
    post('/api/interface', {
      name: 'session',
      type: 'get/' + props.id
    }).then(res => {
      setSession(res.result)
    })
  }

  function updateSessionInfo(list: MessageProps[], isNessary: boolean = false) {
    if (session.session_name && session.session_name.startsWith('未命名会话')) {
      let lastMessage = list[list.length - 1]
      if (lastMessage.content.length < 20 && !isNessary) {
        return;
      }
      if (isNessary) {
        // 最后一次机会，找出最长的一段消息提取摘要
        let maxLength = 0
        let maxIndex = lastMessage.content.length
        for (let i = 0; i < list.length; i++) {
          const message = list[i]
          if (message.content.length > maxLength) {
            maxLength = message.content.length
            maxIndex = i
          }
        }
        lastMessage = list[maxIndex]
      }
      const titlePrompt: MessageProps = {
        content: `"${lastMessage.content}  请从以上内容中提出一个15字以内的主题，只需要输出主题，不要输出其他任何文字。`,
        role: 'user'
      }
      chatCompletion([titlePrompt], (message, isComplete) => {
        if (isComplete) {
          let name = message
          session.session_name = name
          post('/api/interface', {
            name: 'session',
            type: 'update',
            ...session
          }).then(res => {
            if (res.result) {
              setSession(res.result)
              props.onChange && props.onChange()
            }
          })
        }
      })
    }
  }

  function handleSetting() {
    currentSessionEditForm.current?.setDefaultValue(session)
    setVisible(true)
  }

  function editSessionInfo(sessionInfo: Record<string, any>) {
    post('/api/interface', {
      name: 'session',
      type: 'update',
      ...session,
      ...sessionInfo
    }).then(res => {
      if (res.result) {
        setSession(res.result)
        props.onChange && props.onChange()
        setVisible(false)
      }
    })
  }

  useEffect(() => {
    if (!props.id) return;
    setLoading(true)
    loadMessageList();
    loadSessionInfo();
    setVisible(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id])

  useEffect(() => {
    handleScrollBottom()
  }, [messageList])

  function setTextAreaHeight() {
    if (currentMessageInput.current) {
      currentMessageInput.current.style.height = 'auto'
      currentMessageInput.current.style.height = currentMessageInput.current.scrollHeight + 'px'
    }
  }

  function handleScrollBottom() {
    if (messageListContainer.current) {
      messageListContainer.current.scrollTop = messageListContainer.current.scrollHeight
    }
  }

  function handleSendMessage() {
    debugger
    if (!currentMessageInput.current?.value || chatting) {
      return
    }
    const list: MessageProps[] = [...messageList, {
      session_id: props.id,
      content: currentMessageInput.current?.value || '',
      role: "user"
    }]
    setMessageList(list)
    // 发送messageList到后端
    setWaiting(true)
    setChatting(true)
    // 通过携带历史消息数量过滤列表
    let sendList = list
    if (session.history || session.history === 0) {
      let sendCount = list.length - session.history - 1
      if (sendCount < 0) {
        sendCount = 0
      }
      sendList = list.slice(sendCount, list.length)
    }
    chatCompletion(sendList, (message, isComplete) => {
      setWaiting(false)
      setCurrentMessage(message)
      handleScrollBottom()
      if (isComplete) {
        setCurrentMessage('')
        setMessageList([...list, {
          content: message || '',
          role: "assistant"
        }])
        list.push({
          content: message || '',
          role: "assistant"
        })
        if (list.length > 1 && list.length < 6) {
          updateSessionInfo(list, list.length === 5)
        }
        loadLasetMessage(list)
        handleScrollBottom()
        setChatting(false)
      }
    })
    if (currentMessageInput.current) {
      currentMessageInput.current.value = ''
    }
    setTextAreaHeight()
    setTimeout(() => {
      handleScrollBottom()
    }, 100)
  }

  function showSessionList() {
    props.showList && props.showList()
  }

  const handleListenKeyboard = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      // 快捷键按下
      handleSendMessage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageList, session, chatting, waiting, currentMessage]) 

  useEffect(() => {
    document.removeEventListener('keydown', handleListenKeyboard)
    document.addEventListener('keydown', handleListenKeyboard)
    return () => {
      document.removeEventListener('keydown', handleListenKeyboard)
    }
  }, [handleListenKeyboard])

  return <div
    className={"flex flex-col flex-grow w-full md:w-1/5 h-full bg-white border-l border-gray-200 border-solid rounded-sm relative chat-container " + (loading ? "loading-container" : "")}
  >
    <div className="flex w-full px-2 py-3 bg-gray-100 border-t border-gray-200 border-solid">
      <div className="flex items-center flex-grow line-hie">
        <span className="border-gray-600 border-solid cursor-pointer hover:border-b-2">{session?.session_name}</span>
      </div>
      <div className="flex flex-row">
        <button onClick={() => showSessionList()} className="px-3 text-3xl text-gray-500 py2 hover:text-blue-400 md:hidden">
          <Icon icon="icon-park-solid:back" />
        </button>
        <button onClick={() => {
          handleSetting()
        }} className="px-3 text-3xl text-gray-500 py2 hover:text-blue-400">
          <Icon icon="ant-design:setting-outlined" />
        </button>
        {!props.fullScreen && <button onClick={() => {
          props.toggleScreen?.()
        }} className="hidden px-3 text-2xl text-gray-500 py2 hover:text-blue-400 md:block">
          <Icon icon="icon-park-outline:full-screen-one" />
        </button>}
        {props.fullScreen && <button onClick={() => {
          props.toggleScreen?.()
        }} className="hidden px-3 text-2xl text-gray-500 py2 hover:text-blue-400 md:block">
          <Icon icon="icon-park-outline:off-screen" />
        </button>}
      </div>
    </div>
    <div className="flex-grow h-full px-6 py-2 overflow-x-hidden overflow-y-auto bg-white h-15 user-scroller" ref={messageListContainer}>
      {props.id && <Message content={topTip} role="assistant" />}
      {messageList.map(item => <Message key={item.id || item.content} {...item} />)}
      {waiting && <MessageLoading />}
      {currentMessage && <Message content={currentMessage} role="assistant" />}
    </div>
    <div className="flex flex-row pb-3 bg-white border-t border-gray-200 border-solid">
      <textarea
        ref={currentMessageInput}
        className="flex-grow w-full h-auto p-2 text-sm text-gray-500 border-none outline-none resize-none max-h-40 user-scroller"
        placeholder="请输入提问内容..."
        onInput={() => setTextAreaHeight()}
      ></textarea>
      <div className="flex items-end justify-center w-32">
        <button disabled={chatting} className="flex items-center px-2 py-1 text-white bg-blue-500 rounded" onClick={() => handleSendMessage()}>
          <InlineIcon icon="teenyicons:send-solid" className="mr-2" />
          发送</button>
      </div>
    </div>
    <Dialog title="会话设置" visible={visible} onOk={function (): void {
      const formValues = currentSessionEditForm.current?.getValues()
      if (!(formValues && formValues.session_name && formValues.history >= 0)) {
        alert('输入错误')
        return
      }
      formValues.history = parseInt(formValues.history)
      editSessionInfo(formValues)
    }} onCancel={function (): void {
      setVisible(false)
    }} width="380px">
      <div className="flex flex-col">
        <UserForm ref={currentSessionEditForm} forms={sessionForms} />
      </div>
    </Dialog>
  </div>
}
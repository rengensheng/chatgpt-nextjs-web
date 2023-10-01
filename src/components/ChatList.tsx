import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import ChatSessionItem from "./ChatSessionItem"
import NavigatorBar from "./NavigatorBar"
import type { SessionProps } from "./ChatSessionItem"
import { InlineIcon } from "@iconify/react"
import { post } from "@/utils/request"

interface ChatListProps {
  onChange: (sessionId: string) => void
}

interface ChatListHandle {
  getList: () => void
  showList: () => void
}

function ChatList(props: ChatListProps, ref: any) {
  const [sessionList, setSessionList] = useState<SessionProps[]>([])
  let sessionListGlobal: SessionProps[] = []
  const [hoverSession, setHoverSession] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [filterName, setFilterName] = useState<string>('')
  const [listVisible, setListVisible] = useState<boolean>(false)

  function loadDefaultSession() {
    if (sessionListGlobal.length === 0) {
      // 没有对话，创建默认对话
      createNewSession()
    } else if (!hoverSession) {
      handleChangeSession({
        id: sessionListGlobal[0].id,
        history: 4,
        name: '',
        lastMessageTime: '',
        messageCount: 0
      })
    } else {
      const isHas = sessionListGlobal.filter(session => session.id === hoverSession)
      if (isHas.length === 0) {
        handleChangeSession({
          id: sessionListGlobal[0].id,
          history: 4,
          name: '',
          lastMessageTime: '',
          messageCount: 0
        })
      }
    }
  }

  function getSessionList(name?: string) {
    const query: any = {}
    query['session_type'] = 'normal'
    if (name) {
      query['session_name'] = `*${name}*`
    }
    post('/api/session', {
      type: 'list',
      pageSize: 1000000,
      query,
    }).then(res => {
      const sessionListTmp: SessionProps[] = []
      if (res.result && res.result.items) {
        res.result.items.forEach((session: Record<string, any>) => {
          sessionListTmp.push({
            name: session.session_name,
            history: session.histroy,
            id: session.id,
            lastMessageTime: session.updated_time,
            messageCount: 0,
          })
        })
        sessionListGlobal = sessionListTmp
        setSessionList(sessionListTmp)
      } else {
        setSessionList([])
      }
      !name && loadDefaultSession()
    })
  }

  function handleChangeSession(session: SessionProps) {
    setHoverSession(session.id)
    props.onChange(session.id)
    setListVisible(false)
  }

  function createNewSession() {
    if (loading) return;
    setLoading(true)
    post('/api/session', {
      type: 'add',
      session_name: '未命名会话',
      history: 4,
      session_type: "normal",
    }).then((res) => {
      if (res.result) {
        const newSession = {
          name: res.result.session_name,
          id: res.result.id,
          lastMessageTime: res.result.updated_time,
          messageCount: 0,
          history: res.result.history
        }
        setSessionList((oldSession) => {
          return [newSession, ...oldSession]
        })
        handleChangeSession(newSession)
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  function deleteSession(id: string) {
    if (loading) return;
    setLoading(true)
    post('/api/session', {
      type: 'delete/' + id
    }).then(() => {
      getSessionList()
    }).finally(() => {
      setLoading(false)
    })
  }

  useImperativeHandle(ref, () => {
    return {
      getList() {
        getSessionList()
      },
      showList() {
        setListVisible(true)
      }
    }
  })

  useEffect(() => {
    getSessionList(filterName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterName])

  return <div className={"fixed flex flex-col w-full h-screen px-2 py-1 bg-white chat-list md:w-1/4 md:static md:!h-full md:left-0 " + (listVisible ? "left-0 z-10" : "left-full")}>
    <NavigatorBar />
    <div className="flex flex-row w-full">
      <input onInput={(e) => {
        setFilterName(e.currentTarget.value)
      }} placeholder="请输出关键字过滤" className="flex-grow w-full px-2 py-2 mt-2 mb-3 border border-gray-300 border-solid rounded first-letter:px-2" />
    </div>
    <div className="flex-grow h-10 overflow-x-hidden overflow-y-auto deep-scroller">
      {sessionList.map(item => {
        return <ChatSessionItem onDelete={deleteSession} key={item.id} {...item} isSelect={hoverSession === item.id} onClick={() => handleChangeSession(item)} />
      })}
    </div>
    <div className="w-full h-18">
      <button disabled={loading} onClick={() => createNewSession()} className="flex flex-row items-center justify-center w-full py-2 mt-2 mb-2 text-center text-gray-500 border border-gray-300 border-solid rounded-sm hover:bg-gray-200">
        <InlineIcon icon="ri:chat-new-line" className="mr-2" />
        新建会话</button>
    </div>
  </div>
}

export default forwardRef<ChatListHandle, ChatListProps>(ChatList)
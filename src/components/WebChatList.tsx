import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import ChatSessionItem from "./ChatSessionItem"
import type { SessionProps } from "./ChatSessionItem"
import NavigatorBar from "./NavigatorBar"
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
  // const [filterName, setFilterName] = useState<string>('')
  const [listVisible, setListVisible] = useState<boolean>(false)

  function loadDefaultSession() {
    if (sessionListGlobal.length === 0) return;
    handleChangeSession({
      id: sessionListGlobal[0].id,
      history: 4,
      name: '',
      lastMessageTime: '',
      messageCount: 0
    })
  }

  function getSessionList(name?: string) {
    const query: any = {}
    query['session_type'] = 'web'
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
            params: session.params,
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
      },
    }
  })

  useEffect(() => {
    getSessionList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   getSessionList(filterName)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [filterName])

  return <div className={"fixed flex flex-col w-full h-screen px-2 py-1 pb-16 md:pb-1 bg-white chat-list md:w-1/4 md:static md:!h-full md:left-0 " + (listVisible ? "left-0 z-10" : "left-full")}>
    {/* <div className="flex flex-row w-full">
      <input onInput={(e) => {
        setFilterName(e.currentTarget.value)
      }} placeholder="请输出关键字过滤" className="flex-grow w-full px-2 py-2 mt-2 mb-3 border border-gray-300 border-solid rounded first-letter:px-2" />
    </div> */}
    <NavigatorBar />
    <div className="flex-grow w-full h-10 overflow-x-hidden overflow-y-auto deep-scroller">
      {sessionList.map(item => {
        return <ChatSessionItem onDelete={deleteSession} key={item.id} {...item} isSelect={hoverSession === item.id} onClick={() => handleChangeSession(item)} />
      })}
    </div>
  </div>
}

export default forwardRef<ChatListHandle, ChatListProps>(ChatList)
import { Icon } from '@iconify/react';
import { useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { applicationContext } from './ChatWindowView';

interface AppInfo {
  icon: string,
  name: string,
  path: string,
  isSelect?: boolean,
  onClick?: () => void
}

function AppItem(props: AppInfo) {
  return <div
    className={"flex flex-col hover:text-blue-500 hover:bg-slate-100 rounded justify-center items-center p-3 mb-3 cursor-pointer  " +
      (props.isSelect ? "text-blue-600 bg-slate-100" : "text-gray-500")}
    onClick={() => props.onClick && props.onClick()}>
    <div className='w-8 h-8'>
      <Icon className='w-full h-full' icon={props.icon}></Icon>
    </div>
    <div className='text-sm'>
      {props.name}
    </div>
  </div>
}

export default function AppList() {
  const router = useRouter()
  const pathname = usePathname()
  const [apps] = useState<AppInfo[]>([{
    icon: "ic:sharp-chat",
    name: "ChatGPT",
    path: "/application/chat"
  }, {
    icon: "mdi:web",
    name: "ChatWEB",
    path: "/application/web"
  }, {
    icon: "majesticons:image",
    name: "图片生成",
    path: "/application/image"
  }, {
    icon: "ph:code-fill",
    name: "代码解析",
    path: "/application/explain"
  }])

  const [hoverApp, setHoverApp] = useState<string>('/application/chat')
  const { showApplication, setShowApplication } = useContext(applicationContext)

  function handleChangeApp(app: AppInfo) {
    setHoverApp(app.path)
    setShowApplication(false)
    router.push(app.path)
  }

  useEffect(() => {
    console.log(pathname)
    setShowApplication(false)
    setHoverApp(pathname)
    console.log('show application', showApplication)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div className={"fixed flex flex-col w-full px-3 pt-2 bg-white border-r border-gray-200 border-solid md:w-28 -left-full md:left-0 md:static " +
    (showApplication ? "left-0 top-0 absolute w-28 h-screen z-20 md:static md:!h-full" : "")}>
    {apps.map(app => <AppItem key={app.name} {...app} isSelect={app.path === hoverApp} onClick={() => handleChangeApp(app)} />)}
    <div className="flex flex-col items-center justify-end flex-grow pb-10 md:hidden">
      <button onClick={() => {
        setShowApplication(false)
      }}>
        <Icon icon="material-symbols:close" className="text-2xl" />
      </button>
    </div>
  </div>
}
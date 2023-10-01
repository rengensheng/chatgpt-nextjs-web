import { Icon } from "@iconify/react"

interface DialogProps {
  title: string
  visible: boolean
  width?: number | string
  height?: number | string
  children: React.ReactNode,
  onOk: () => void
  onCancel: () => void
}

function getActualValue(value: number | string | undefined): string {
  if (typeof value === 'number') {
    return `${value}%`
  } else if (typeof value === 'string' && value.endsWith('px')) {
    return value
  }
  return 'auto'
}

export default function Dialog(props: DialogProps) {
  return <div style={{ width: getActualValue(props.width), height: getActualValue(props.height), overflow: "hidden auto", display: props.visible ? "block" : "none" }} className="absolute px-5 py-5 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
    <div className="flex flex-col w-full bg-white border rounded shadow-md">
      <div className="flex px-1 py-1 text-gray-700 bg-gray-100">
        <div>{props.title}</div>
        <div className="flex justify-end flex-grow w-1/2">
          <button onClick={() => props.onCancel()}>
            <Icon icon="ic:baseline-close" className="text-2xl text-gray-700 cursor-pointer hover:text-red-500" />
          </button>
        </div>
      </div>
      <div className="flex-grow h-full px-1 py-1">
        {props.children}
      </div>
      <div className="flex flex-row items-center justify-end w-full py-3">
        <button onClick={() => props.onCancel()} className="flex items-center px-2 py-1 mr-4 text-gray-700 bg-white border border-gray-300 border-solid rounded hover:bg-gray-200">取消</button>
        <button onClick={() => props.onOk()} className="flex items-center px-2 py-1 mr-6 text-white bg-blue-500 rounded hover:bg-blue-400">确定</button>
      </div>
    </div>
  </div>
}
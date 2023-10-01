import { Icon } from "@iconify/react";

export interface SessionProps {
  id: string,
  name: string;
  params?: string;
  history: number;
  lastMessageTime: string;
  messageCount: number;
  isSelect?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}
export default function ChatSessionItem(props: SessionProps) {

  function handleDeleteSession(id: string) {
    if (props.onDelete) {
      props.onDelete(id)
    }
  }

  return <div className={"relative w-full rounded px-3 py-4 border-b border-gray-200 border-solid group hover:bg-gray-200 break-all whitespace-pre-wrap cursor-pointer " +
    (props.isSelect ? "bg-gradient-to-r from-blue-500 to-blue-300" : "")}
    onClick={() => props.onClick && props.onClick()}
  >
    <div className="absolute hidden top-2 right-2 group-hover:block ">
      <button onClick={() => handleDeleteSession(props.id)}>
        <Icon icon="carbon:close-filled" className="text-xl text-red-500 hover:text-red-300" />
        </button>
    </div>
    <div className={"font-bold text-gray-700 text-base " + (props.isSelect ? "text-white" : "")}>
      {props.name}
    </div>
    {props.params && <div className={"font-bold text-gray-700 text-sm my-2 " + (props.isSelect ? "text-white" : "")}>
      {props.params}
    </div>}
    <div className={"flex flex-row text-gray-500 text-sm " + (props.isSelect ? "text-white" : "")}>
      {/* <div className="flex-grow w-1/2">消息 {props.messageCount} 条</div> */}
      <div className="flex-grow w-1/2 text-left">{props.lastMessageTime}</div>
    </div>
  </div>
}
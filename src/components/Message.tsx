import { Icon } from "@iconify/react"
import MarkdownRender from "./MarkdownRender"

export interface MessageProps {
  id?: string,
  content: string,
  time?: string,
  session_id?: string,
  role: "user" | "assistant"
}

function AssistantMessage(props: MessageProps) {
  return <div className="flex flex-row items-start">
    <div className="w-auto h-auto">
      <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-yellow-500 rounded-full">
        <Icon icon="file-icons:imgbot" className="w-6 h-6" />
      </div>
    </div>
    <div className="justify-start flex-grow w-5/6 mr-12">
      <div className="max-w-full p-2 ml-3 text-left text-gray-600 break-all bg-gray-100 rounded-lg w-fit">
        <MarkdownRender value={props.content} />
      </div>
    </div>
  </div>
}

function UserMessage(props: MessageProps) {
  return <div className="flex flex-row">
    <div className="flex justify-end flex-grow w-5/6 ml-12">
      <div className="w-auto max-w-full p-2 mr-3 text-left text-gray-100 break-all bg-blue-500 rounded-lg">
        <MarkdownRender value={props.content} />
      </div>
    </div>
    <div className="w-auto">
      <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-full">
        <Icon icon="mdi:human-greeting" className="w-6 h-6" />
      </div>
    </div>
  </div>
}

export default function Messaage(props: MessageProps) {
  return <div className="w-full my-4">
    {props.role === "user" ? <UserMessage {...props} /> : <AssistantMessage {...props} />}
  </div>
}
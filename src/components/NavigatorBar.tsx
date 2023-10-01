import { Icon } from "@iconify/react";
import { useContext } from "react";
import { applicationContext } from "./ChatWindowView";

export default function NavigatorBar() {

  const { setShowApplication } = useContext(applicationContext)

  return <div className="flex flex-row py-3 bg-white border-b border-gray-200 border-solid md:hidden">
    <button onClick={() => {
      setShowApplication(true)
    }}>
      <Icon icon="icon-park-outline:all-application" className="text-3xl text-gray-600 hover:text-blue-500" />
    </button>
  </div>
}
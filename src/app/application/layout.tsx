import ChatWindowView from "@/components/ChatWindowView";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section className="w-screen h-screen bg-gray-100">
    <div className="w-full h-full dashboard">
    <div className="flex flex-row w-full h-full">
      <ChatWindowView>
        {children}
      </ChatWindowView>
    </div>
    </div>
  </section>
}
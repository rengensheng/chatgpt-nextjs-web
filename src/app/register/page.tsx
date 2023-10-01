"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { post } from "@/utils/request"

export default function RegisterPage() {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  function handleRegister() {
    if (password != confirmPassword) {
      alert('密码输入不一致')
      return
    }
    setLoading(true)
    post('/api/register', {
        username: username,
        password: password
    }).then(res => {
      if (res.code > 200) {
        alert(res.message)
        return;
      }
      localStorage.setItem("token", res.result)
      router.push('/application/chat')
    })
  }

  function handleLogin() {
    router.push('/login')
  }

  return <div className={"w-5/6 px-5 py-10 mx-auto mt-20 bg-white rounded shadow-md md:px-10 md-p-8 md:w-1/2 " + (loading ? "loading-container" : "") }>
    <h2 className="mb-4 text-2xl font-bold">新用户注册</h2>
    <form>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-600">用户名</label>
        <input onInput={(e) => {
          setUsername(e.currentTarget.value)
        }} type="text" id="username" name="username" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-indigo-500" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-600">密码</label>
        <input onInput={(e) => {
          setPassword(e.currentTarget.value)
        }} type="password" id="password" name="password" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-indigo-500" required />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-600">确认密码</label>
        <input onInput={(e) => {
          setConfirmPassword(e.currentTarget.value)
        }} type="password" id="password" name="password" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-indigo-500" required />
      </div>
    </form>
    <button className="w-full py-2 font-semibold text-white transition duration-200 bg-indigo-500 rounded-md hover:bg-indigo-600" onClick={() => handleRegister()}>用户注册</button>
    <button className="w-full py-2 mt-5 font-semibold text-white transition duration-200 bg-indigo-500 rounded-md hover:bg-indigo-600" onClick={() => handleLogin()}>用户登录</button>
  </div>
}
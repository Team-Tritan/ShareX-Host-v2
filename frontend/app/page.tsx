"use client";

import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useTokenStore } from "../stores/session.store"

const LoginPage: React.FC = () => {
  const apiToken = useTokenStore((state) => state.apiToken)
  const setToken = useTokenStore((state) => state.setToken)
  const [apiKey, setApiKey] = useState(apiToken)

  useEffect(() => {
    setApiKey(apiToken)
  }, [apiToken])

  const handleLogin = () => {
    setToken(apiKey)
  }

  const handleCreateKey = async () => {
    const displayName = prompt("Please enter a display name:")

    if (!displayName)
      return alert("Display name is required.")


    try {
      const response = await fetch("/api/create-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: displayName }),
      })

      if (!response.ok)
        throw new Error("Failed to create API key")


      const data = await response.json()
      setToken(data.key)
      alert(`Your API key is ${data.key}. Please save it somewhere safe.`)
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0c0e]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#121114] rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">ShareX Host</h1>
        </div>

        <div className="mt-8 space-y-6">
          <div className="relative">
            <input
              id="api-key"
              name="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full px-3 py-2 border-2 border-purple-500 rounded-md bg-[#1a1a1d] text-white focus:outline-none focus:border-purple-600"
              placeholder="API Key"
            />
            <button
              onClick={handleLogin}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500"
              aria-label="Login"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="border-t border-zinc-800 flex-grow"></div>
          <span className="px-4 text-sm text-gray-500">Or</span>
          <div className="border-t border-zinc-800 flex-grow"></div>
        </div>

        <div className="mt-4 text-center">
          <button onClick={handleCreateKey} className="text-sm text-purple-500">
            Create an API Key
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


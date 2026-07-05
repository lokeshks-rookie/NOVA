import { useState, useRef, useEffect } from "react"
import { Trash2, ArrowUp } from "lucide-react"
import { Eyebrow } from "@/components/Eyebrow"
import { useApp } from "@/context/AppContext"
import { aiSuggestedPrompts } from "@/data/mock"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

export default function AIAssistantPage() {
  useApp() // ensures user context is available
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    const userMsg = { id: Date.now(), role: "user", content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      const res = await api.post("/ai/chat", {
        messages: updatedMessages.map(({ role, content }) => ({ role, content }))
      })

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: res.reply || "No response received from Assistant.",
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
      let errorContent = "Sorry, I had trouble connecting to the server. Please check your connection and try again."
      if (err.status === 401) {
        errorContent = "Your session has expired or is invalid. Please click 'Sign out' at the bottom left and sign back in to refresh your connection."
      }
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: errorContent
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input.trim())
  }

  const handleClear = () => {
    setMessages([])
    setIsTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col lg:h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-cf-line pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 items-center justify-center rounded-sm bg-cf-yellow" aria-hidden="true" />
          <Eyebrow className="text-cf-black">AI Assistant</Eyebrow>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-sm text-cf-muted hover:text-cf-black"
          >
            <Trash2 className="h-4 w-4" /> Clear conversation
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-6">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cf-yellow">
              <span className="text-2xl font-bold text-[#000000]">AI</span>
            </div>
            <h2 className="cf-h2">How can I help you today?</h2>
            <p className="mt-2 max-w-sm text-sm text-cf-muted">
              Ask me about lost items, the claim process, or describe what you are looking for.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {aiSuggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="cf-focus-ring rounded-full border border-cf-line px-4 py-2.5 text-sm font-medium text-cf-black hover:bg-cf-cream"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-line",
                msg.role === "user"
                  ? "bg-cf-black text-cf-white"
                  : "border border-cf-line bg-cf-cream text-cf-black",
              )}
            >
              {msg.role === "assistant" && (
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cf-muted">
                  <span className="inline-block h-2 w-2 bg-cf-yellow" aria-hidden="true" />
                  CampusFind
                </p>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-cf-line bg-cf-cream px-5 py-4">
              <span className="h-2 w-2 rounded-full bg-cf-muted" style={{ animation: "cf-typing 1.2s ease-in-out infinite" }} />
              <span className="h-2 w-2 rounded-full bg-cf-muted" style={{ animation: "cf-typing 1.2s ease-in-out 0.2s infinite" }} />
              <span className="h-2 w-2 rounded-full bg-cf-muted" style={{ animation: "cf-typing 1.2s ease-in-out 0.4s infinite" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-cf-line pt-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about lost items, claim process, or describe what you're looking for..."
          rows={1}
          className="cf-focus-ring max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-cf-line bg-cf-white px-4 py-3 text-[15px] text-cf-black placeholder:text-cf-muted"
          style={{ height: "auto", overflow: "hidden" }}
          onInput={(e) => {
            e.target.style.height = "auto"
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px"
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="cf-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cf-black text-cf-white transition-opacity disabled:opacity-40"
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}

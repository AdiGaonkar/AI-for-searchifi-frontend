import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webcontainer'
import { motion, AnimatePresence } from 'framer-motion'

/* ---------- Syntax Highlight ---------- */
function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-')) {
      hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

/* ---------- AI Message Renderer ---------- */
function WriteAiMessage({ message }) {
  let messageObject
  try {
    messageObject = JSON.parse(message)
  } catch {
    return <p>{message}</p>
  }

  return (
    <div className="overflow-auto text-gray-200 rounded-lg p-3">
      <Markdown
        children={messageObject.text || ''}
        options={{ overrides: { code: SyntaxHighlightedCode } }}
      />
    </div>
  )
}

const Project = () => {
  const location = useLocation()
  const { user } = useContext(UserContext)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [webContainer, setWebContainer] = useState(null)

  const messageBox = useRef(null)

  /* ---------- Helpers ---------- */
  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const newSelected = new Set(prev)
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id)
      return newSelected
    })
  }

  const addCollaborators = () => {
    axios
      .put('/projects/add-user', {
        projectId: project._id,
        users: Array.from(selectedUserId),
      })
      .then(() => setIsModalOpen(false))
      .catch(console.error)
  }

  const send = () => {
    if (!message.trim()) return
    sendMessage('project-message', { message, sender: user })
    const newMsg = { sender: user, message }
    setMessages((prev) => [...prev, newMsg]) // local push
    setMessage('')
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  /* ---------- Effects ---------- */
  useEffect(() => {
    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then((container) => setWebContainer(container))
    }

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data])
    }

    receiveMessage('project-message', handleMessage)

    axios.get(`/projects/get-project/${project._id}`).then((res) => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })

    axios.get('/users/all').then((res) => setUsers(res.data.users))

    return () => {
      if (window.socket) {
        window.socket.off('project-message', handleMessage)
      }
    }
  }, [])

  useEffect(() => {
    messageBox.current?.scrollTo({
      top: messageBox.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    sessionStorage.setItem('recentMessages', JSON.stringify(messages))
  }, [messages])

  const firstName = user?.email?.split('@')[0] || 'User'

  /* ---------- Animations ---------- */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { y: 8, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  }

  return (
    <main className="h-screen w-screen font-Quicksand flex bg-gradient-to-br from-black via-neutral-900 to-neutral-950 text-gray-100 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <h1 className="text-lg font-semibold">Searchifi AI</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-neutral-800"
        >
          <i className="ri-menu-fill text-xl" />
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full lg:h-auto w-72 bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-800 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-4 pt-5 pb-3 border-b border-neutral-800 hidden lg:block">
          <h1 className="text-3xl font-light tracking-tight bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
            Searchifi AI
          </h1>
        </div>

        {/* User Card */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/60 border border-neutral-700 shadow-sm">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="user"
                className="w-11 h-10 rounded-full ring-2 ring-white"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-lime-400/30">
                <i className="ri-user-fill text-gray-300 text-xl" />
              </div>
            )}

            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Logged in</p>
            </div>
          </div>
        </div>

        {/* Add Collaborator */}
        <div className="px-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-3 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-semibold transition-all shadow-md active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 justify-center">
              <i className="ri-add-fill text-lg" /> Add Collaborator
            </span>
          </button>
        </div>

        {/* Recent Chats */}
        <div className="px-4 mt-6 overflow-y-auto flex-1">
          <h2 className="text-sm text-gray-400 mb-2">Recent Chats</h2>
          <div className="flex flex-col gap-2 max-h-48 overflow-auto pr-1">
            {messages
              .filter((m) => m?.sender?._id === user?._id)
              .slice(-5)
              .map((msg, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700 text-xs truncate"
                  title={msg.message}
                >
                  {msg.message}
                </motion.div>
              ))}
            {messages.filter((m) => m?.sender?._id === user?._id).length === 0 && (
              <p className="text-xs text-gray-500">No recent user chats</p>
            )}
          </div>
        </div>

        <div className="mt-auto p-4 text-[10px] text-gray-500">v1.0 • Project Chat</div>
      </aside>

      {/* Chat Section */}
      <section className="flex-grow flex mt-10 flex-col relative pt-14 lg:pt-0">
        {/* Subtle grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Messages */}
        <motion.div
          ref={messageBox}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-grow flex flex-col gap-3 overflow-y-auto px-4 sm:px-8 pb-28 scrollbar-hide"
        >
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-cyan-500 via-lime-500 to-cyan-600 text-transparent bg-clip-text">
                  Hello, {firstName}.
                </span>
              </h1>
              <p className="text-base sm:text-xl text-gray-400 mb-6">
                How can I help you today?
              </p>
              <div className="text-sm text-gray-500">
                Tip: Press{' '}
                <span className="px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700">
                  Ctrl/⌘ + Enter
                </span>{' '}
                to send.
              </div>
              <div className="text-sm mt-3 text-gray-500"> Tip: write <span className="px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700">@ai to interact with AI</span> to send. </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const mine = msg?.sender?._id == user?._id?.toString()
              const isAi = msg?.sender?._id === 'ai'
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className={`${
                    mine
                      ? 'ml-auto bg-lime-500/90 text-black ring-lime-400/20'
                      : 'mr-auto text-gray-200 ring-neutral-900'
                  } message relative flex flex-col p-3 rounded-lg max-w-[90%] sm:max-w-[78%] ring-1 shadow-lg backdrop-blur`}
                >
                  <small className="opacity-65 text-[10px] mb-1 select-text">
                    {msg?.sender?.email}
                  </small>
                  <div className="text-sm select-text">
                    {isAi ? <WriteAiMessage message={msg.message} /> : <p>{msg.message}</p>}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Input */}
        <div className="w-full pointer-events-none">
          <div className="w-full max-w-full sm:max-w-3xl mx-auto px-2 h-16 rounded-lg flex absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="pointer-events-auto flex w-full overflow-hidden rounded-full bg-neutral-900 border border-neutral-700 shadow-lg ring-1 ring-neutral-800">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="p-4 grow bg-transparent outline-none text-gray-200 placeholder-gray-500 text-sm sm:text-base"
                type="text"
                placeholder="Enter a prompt here..."
              />
              <button
                onClick={send}
                className="px-4 sm:px-5 hover:bg-neutral-800 transition-colors text-lime-400"
                title="Send"
              >
                <i className="ri-send-plane-fill text-xl sm:text-2xl" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add Collaborators Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg w-full max-w-lg sm:max-w-xl relative shadow-2xl"
          >
            <header className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-lime-400">Select User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-800"
                title="Close"
              >
                <i className="ri-close-fill text-xl text-gray-300" />
              </button>
            </header>

            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto pr-1">
              {users.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  className={`text-left cursor-pointer rounded-lg border transition-colors ${
                    Array.from(selectedUserId).includes(u._id)
                      ? 'bg-lime-500/10 border-lime-400/30 text-lime-300'
                      : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-gray-200'
                  } p-2 flex gap-3 items-center`}
                  onClick={() => handleUserClick(u._id)}
                >
                  <div className="aspect-square relative rounded-full w-9 h-9 flex items-center justify-center text-gray-200 bg-neutral-700">
                    <i className="ri-user-fill" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-base">{u.email}</h1>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black rounded-lg shadow-md"
            >
              Add Collaborators
            </button>
          </motion.div>
        </div>
      )}
    </main>
  )
}

export default Project

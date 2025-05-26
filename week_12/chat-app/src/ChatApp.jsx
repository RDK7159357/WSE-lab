import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Heart,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import "./ChatApp.css";

const ChatApp = () => {
  const initialUsers = [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
      avatar: "👤",
      status: "online",
    },
    {
      id: 2,
      username: "moderator",
      password: "mod123",
      role: "moderator",
      avatar: "🛡️",
      status: "online",
    },
    {
      id: 3,
      username: "user1",
      password: "user123",
      role: "user",
      avatar: "😊",
      status: "online",
    },
    {
      id: 4,
      username: "user2",
      password: "user123",
      role: "user",
      avatar: "🎨",
      status: "away",
    },
  ];

  const [currentUser, setCurrentUser] = useState(null);
  const users = initialUsers;
  const [messages, setMessages] = useState([
    {
      id: 1,
      userId: 2,
      username: "moderator",
      text: "Welcome to the chat! Please follow the community guidelines.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: [],
      type: "text",
      edited: false,
    },
    {
      id: 2,
      userId: 3,
      username: "user1",
      text: "Hello everyone! 👋",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      likes: [2],
      type: "text",
      edited: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChannel] = useState("general");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef();
  const audioInputRef = useRef();
  const messagesEndRef = useRef();

  const rolePermissions = {
    admin: ["delete_any_message", "ban_users", "create_channels", "moderate"],
    moderator: ["delete_messages", "mute_users", "moderate"],
    user: ["send_messages", "like_messages", "upload_files"],
  };

  const hasPermission = (p) =>
    currentUser && rolePermissions[currentUser.role]?.includes(p);
  const formatFileSize = (b) =>
    b
      ? `${(b / 1024 ** (n = Math.floor(Math.log(b) / Math.log(1024)))).toFixed(
          2
        )} ${["Bytes", "KB", "MB", "GB"][n]}`
      : "0 Bytes";

  const handleLogin = () => {
    const user = users.find(
      (u) =>
        u.username === loginData.username && u.password === loginData.password
    );
    if (user) {
      setCurrentUser(user);
      setShowLoginForm(false);
    } else {
      alert(
        "Invalid credentials. Try: admin/admin123, moderator/mod123, or user1/user123"
      );
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !hasPermission("send_messages")) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        text: newMessage,
        timestamp: new Date().toISOString(),
        likes: [],
        type: "text",
        edited: false,
      },
    ]);
    setNewMessage("");
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || !hasPermission("upload_files")) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        text: `Shared a ${type}: ${file.name}`,
        timestamp: new Date().toISOString(),
        likes: [],
        type,
        edited: false,
        [type]: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        },
      },
    ]);
  };

  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorder = useRef(null);

  // Add this function for audio recording
  const handleAudioRecording = () => {
    if (!hasPermission("upload_files")) return;

    if (isRecording) {
      // Stop recording
      mediaRecorder.current.pause();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioChunks([]);

        const message = {
          id: Date.now(),
          userId: currentUser.id,
          username: currentUser.username,
          text: "Shared an audio recording",
          timestamp: new Date().toISOString(),
          likes: [],
          type: "audio",
          edited: false,
          audio: {
            name: "recording.webm",
            url: URL.createObjectURL(audioBlob),
          },
        };

        setMessages((prev) => [...prev, message]);
      };
      mediaRecorder.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorder.current = new MediaRecorder(stream);
          mediaRecorder.current.ondataavailable = (e) => {
            setAudioChunks((prev) => [...prev, e.data]);
          };
          mediaRecorder.current.start();
          setIsRecording(true);
        })
        .catch((err) => console.error("Error accessing microphone:", err));
    }
  };

  const toggleLike = (id) => {
    if (!hasPermission("like_messages")) return;
    setMessages(
      messages.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              likes: msg.likes.includes(currentUser.id)
                ? msg.likes.filter((id) => id !== currentUser.id)
                : [...msg.likes, currentUser.id],
            }
          : msg
      )
    );
  };

  const deleteMessage = (id) => {
    const message = messages.find((m) => m.id === id);
    if (!message) return;
    const canDelete =
      hasPermission("delete_any_message") ||
      (hasPermission("delete_messages") && message.userId !== currentUser.id) ||
      message.userId === currentUser.id;
    if (canDelete && window.confirm("Delete message?")) {
      setMessages(messages.filter((m) => m.id !== id));
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => messagesEndRef.current?.scrollIntoView(), [messages]);

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat App</h1>
            <p className="text-gray-600">Please log in to continue</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            <div>
              <input
                required
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Log In
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <div>Admin: admin / admin123</div>
              <div>Moderator: moderator / mod123</div>
              <div>User: user1 / user123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentUser.avatar}</div>
              <div>
                <div>{currentUser.username}</div>
                <div className="text-xs">{currentUser.role}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentUser(null);
                setShowLoginForm(true);
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Channels</h3>
          {[
            { id: "general", name: "General" },
            { id: "tech", name: "Tech" },
            { id: "random", name: "Random" },
          ].map((channel) => (
            <button
              key={channel.id}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <div>#{channel.name}</div>
            </button>
          ))}
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-3">
            Online Users ({users.filter((u) => u.status === "online").length})
          </h3>
          {users
            .filter((u) => u.status === "online")
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="relative">{user.avatar}</div>
                <div>
                  <div>{user.username}</div>
                  <div className="text-xs">{user.role}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">#General</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>{hasPermission("moderate") && <span>MOD</span>}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="flex space-x-3 group">
              <div className="text-lg">
                {users.find((u) => u.id === message.userId)?.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span>{message.username}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {message.edited && <span className="italic">(edited)</span>}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {message.type === "text" ? (
                    <p>{message.text}</p>
                  ) : message.type === "file" ? (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <File size={24} />
                      <div>
                        <div>{message.file.name}</div>
                        <div>{formatFileSize(message.file.size)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div>🎵</div>
                      <div>
                        <div>{message.audio.name}</div>
                        <audio controls>
                          <source src={message.audio.url} />
                        </audio>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => toggleLike(message.id)}
                    className="flex items-center"
                  >
                    <Heart />
                    <span>{message.likes.length}</span>
                  </button>
                  <button onClick={() => deleteMessage(message.id)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !hasPermission("send_messages")}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              <Send />
            </button>
          </div>

          <div className="flex space-x-3 mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, "file")}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-blue-600"
            >
              <Paperclip />
            </button>

            <button
              onClick={handleAudioRecording}
              className={`p-2 ${
                isRecording ? "text-red-600" : "text-gray-500"
              } hover:text-green-600`}
            >
              <Mic size={16} />
              {isRecording && <span className="ml-2">Recording...</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;

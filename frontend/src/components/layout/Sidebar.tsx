/**
 * Sidebar component with session list and user menu
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Bot, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatSession } from '../../types/session';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
  isLoading?: boolean;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isLoading,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group sessions by date
  const groupedSessions = groupSessionsByDate(sessions);

  const handleRename = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  return (
    <div className="w-72 h-full bg-white flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-blue-700">Viet Law</span>
        </div>
      </div>

      {/* Nút Trang chủ */}
      <div className="px-4 py-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay về trang chủ
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-2">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Cuộc trò chuyện mới
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 mt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-sm text-gray-400 text-center">
            Chưa có cuộc trò chuyện nào
          </p>
        ) : (
          Object.entries(groupedSessions).map(([group, groupSessions]) => (
            <div key={group} className="mb-5">
              <h3 className="px-1 pb-2 text-sm font-bold text-gray-800">
                {group}
              </h3>
              <div className="space-y-0.5">
                {groupSessions.map(session => (
                  <div key={session.id} className="relative" ref={menuOpenId === session.id ? menuRef : null}>
                    {editingId === session.id ? (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleRename(session.id);
                        }}
                        className="py-0.5"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={() => handleRename(session.id)}
                          autoFocus
                          className="w-full px-3 py-2 text-sm border-2 border-blue-500 rounded-lg focus:outline-none"
                        />
                      </form>
                    ) : (
                      <div
                        onClick={() => onSelectSession(session.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all group cursor-pointer ${
                          activeSessionId === session.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <MessageSquare className={`w-4 h-4 shrink-0 ${
                          activeSessionId === session.id
                            ? 'text-blue-500'
                            : 'text-gray-400'
                        }`} />
                        <span className="truncate flex-1 text-left">
                          {session.title}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === session.id ? null : session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-opacity shrink-0"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Session Menu */}
                    {menuOpenId === session.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => startEditing(session)}
                          className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Đổi tên
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            if (confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100" ref={userMenuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-sm font-medium shrink-0">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.username}</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Menu */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
              <button
                onClick={logout}
                className="w-full px-3 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Group sessions by date (Gần đây, Cũ hơn)
 */
function groupSessionsByDate(sessions: ChatSession[]): Record<string, ChatSession[]> {
  const groups: Record<string, ChatSession[]> = {};

  for (const session of sessions) {
    const group = 'Cũ hơn';

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(session);
  }

  return groups;
}

/**
 * Layout Principal da Aplicação
 * 
 * Layout usado para páginas autenticadas com sidebar
 */

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BFSidebar, BFSidebarItem } from '../components/BF-Sidebar';
import { BFIcons } from '../components/BF-Icons';
import { useAuth } from '../components/ProtectedRoute';

interface AppLayoutProps {
  role: 'admin' | 'user';
}

export default function AppLayout({ role }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const adminItems: BFSidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'Home',
      path: '/admin/dashboard',
      roles: ['admin'],
    },
    {
      id: 'games',
      label: 'Jogos',
      icon: 'Trophy',
      path: '/admin/games',
      roles: ['admin'],
    },
    {
      id: 'players',
      label: 'Jogadores',
      icon: 'Users',
      path: '/admin/players',
      roles: ['admin'],
    },
    {
      id: 'debts',
      label: 'Débitos',
      icon: 'DollarSign',
      path: '/admin/debts',
      roles: ['admin'],
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: 'Settings',
      path: '/admin/workspaces',
      roles: ['admin'],
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: 'MessageCircle',
      path: '/admin/chats',
      roles: ['admin'],
    },
  ];

  const userItems: BFSidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Meu Painel',
      icon: 'Home',
      path: '/user/dashboard',
      roles: ['user'],
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: 'User',
      path: '/user/profile',
      roles: ['user'],
    },
  ];

  const items = role === 'admin' ? adminItems : userItems;

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    const item = items.find(i => i.id === itemId);
    if (item?.path) {
      navigate(item.path);
    }
  };



  return (
    <div className="flex min-h-screen bg-[--background]">
      {/* Sidebar */}
      <BFSidebar
        items={items}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userRole={role}
        userName={user?.name || 'Usuário'}
        userEmail={user?.phone || ''}
        onLogout={async () => {
          const { authAPI } = await import('../lib/axios');
          await authAPI.logout();
        }}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-[--card] border-b border-[--border] shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left Side - Title */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <h2 className="text-base font-semibold text-[--foreground]">Bot Fut</h2>
                <p className="text-xs text-[--muted-foreground] leading-none">
                  {role === 'admin' ? 'Painel Administrativo' : 'Painel do Jogador'}
                </p>
              </div>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <button
                className="relative p-2.5 rounded-lg hover:bg-[--accent] transition-colors group"
                onClick={() => {}}
                aria-label="Notificações"
              >
                <BFIcons.Bell size={20} className="text-[--muted-foreground] group-hover:text-[--foreground]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[--card]"></span>
              </button>
              
              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  className="p-2.5 rounded-lg hover:bg-[--accent] transition-colors group"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  aria-label="Configurações"
                >
                  <BFIcons.Settings size={20} className="text-[--muted-foreground] group-hover:text-[--foreground]" />
                </button>

                {/* Settings Dropdown Menu */}
                {showSettingsMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSettingsMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-[--card] rounded-lg shadow-lg border border-[--border] py-2 z-50">
                      {/* Theme Toggle */}
                      <div className="px-4 py-3 hover:bg-[--accent] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isDarkMode ? (
                              <BFIcons.Moon size={18} className="text-[--muted-foreground]" />
                            ) : (
                              <BFIcons.Sun size={18} className="text-[--muted-foreground]" />
                            )}
                            <span className="text-sm text-[--foreground]">
                              {isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
                            </span>
                          </div>
                          <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[--primary] focus:ring-offset-2 ${
                              isDarkMode ? 'bg-[--primary]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isDarkMode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-[--border] my-1" />

                      {/* Other Settings Options */}
                      <button
                        className="w-full px-4 py-2.5 text-left hover:bg-[--accent] transition-colors flex items-center gap-3"
                        onClick={() => setShowSettingsMenu(false)}
                      >
                        <BFIcons.User size={18} className="text-[--muted-foreground]" />
                        <span className="text-sm text-[--foreground]">Meu Perfil</span>
                      </button>

                      <button
                        className="w-full px-4 py-2.5 text-left hover:bg-[--accent] transition-colors flex items-center gap-3"
                        onClick={() => setShowSettingsMenu(false)}
                      >
                        <BFIcons.Bell size={18} className="text-[--muted-foreground]" />
                        <span className="text-sm text-[--foreground]">Notificações</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-[--background]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

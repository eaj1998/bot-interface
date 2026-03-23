import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { BFSidebar, BFSidebarItem } from '../components/BF-Sidebar';
import { BFIcons } from '../components/BF-Icons';
import { useAuth } from '../hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { billingAPI } from '../lib/axios';


export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // NEW: Workspace Protection & Redirection
  const { currentWorkspace, workspaces, loading } = useAuth();

  const refreshBillingStatus = () => {
    if (!currentWorkspace?.id) return;
    billingAPI.getStatus()
      .then((res) => {
        setSubscriptionStatus(res.data?.status ?? null);
        setTrialDaysLeft(res.data?.daysUntilTrialExpiry ?? null);
      })
      .catch(() => { /* silently fail — don't block the UI */ });
  };

  useEffect(() => {
    refreshBillingStatus();
  }, [currentWorkspace?.id]);

  useEffect(() => {
    window.addEventListener('billing:activated', refreshBillingStatus);
    return () => window.removeEventListener('billing:activated', refreshBillingStatus);
  }, [currentWorkspace?.id]);

  // Derive role dynamically
  const userRole = currentWorkspace?.role?.toLowerCase() || 'user';
  const role = (userRole === 'admin' || userRole === 'owner') ? 'admin' : 'user';

  useEffect(() => {
    if (!loading && !currentWorkspace) {
      // If loaded and no workspace selected, force selection
      if (workspaces && workspaces.length === 0) {
        navigate('/no-workspace');
      } else {
        navigate('/select-workspace');
      }
    }
  }, [currentWorkspace, loading, workspaces, navigate]);

  // Redirect on role mismatch/change
  // Redirect on role mismatch/change
  useEffect(() => {
    if (!loading && currentWorkspace) {
      // Use the role from the current workspace directly
      const userRole = currentWorkspace.role?.toLowerCase() || 'user';
      const isAdmin = userRole === 'admin' || userRole === 'owner';
      const currentPath = location.pathname;

      // Prevent infinite loops by checking verify logic only when needed
      if (isAdmin) {
        // If admin tries to access user dashboard, redirect to admin dashboard
        if (currentPath === '/user/dashboard' || currentPath === '/') {
          navigate('/admin/dashboard');
        }
      } else {
        // If user tries to access admin routes, redirect to user dashboard
        if (currentPath.startsWith('/admin')) {
          navigate('/user/dashboard');
        }
      }
    }
  }, [currentWorkspace, loading, navigate, location.pathname]);

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath.startsWith('/admin/games')) {
      setActiveItem('games');
    } else if (currentPath.startsWith('/admin/players')) {
      setActiveItem('players');
    } else if (currentPath.startsWith('/admin/debts')) {
      setActiveItem('debts');
    } else if (currentPath.startsWith('/admin/workspaces')) {
      setActiveItem('workspaces');
    } else if (currentPath.startsWith('/admin/bbq')) {
      setActiveItem('bbq');
    } else if (currentPath.startsWith('/admin/chats')) {
      setActiveItem('chats');
    } else if (currentPath.startsWith('/admin/memberships')) {
      setActiveItem('memberships');
    } else if (currentPath.startsWith('/admin/billing')) {
      setActiveItem('billing');
    } else if (currentPath.startsWith('/admin/my-dashboard')) {
      setActiveItem('my-dashboard');
    } else if (currentPath.startsWith('/admin/my-profile')) {
      setActiveItem('my-profile');
    } else if (currentPath.startsWith('/admin/dashboard')) {
      setActiveItem('dashboard');
    } else if (currentPath.startsWith('/user/profile')) {
      setActiveItem('profile');
    } else if (currentPath.startsWith('/user/dashboard')) {
      setActiveItem('dashboard');
    }
  }, [location.pathname]);

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
    // {
    //   id: 'workspaces',
    //   label: 'Workspaces',
    //   icon: 'Settings',
    //   path: '/admin/workspaces',
    //   roles: ['admin'],
    // },
    {
      id: 'bbq',
      label: 'Churrascos',
      icon: 'Flame',
      path: '/admin/bbq',
      roles: ['admin'],
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: 'MessageSquare',
      path: '/admin/chats',
      roles: ['admin'],
    },
    {
      id: 'memberships',
      label: 'Membros',
      icon: 'CreditCard',
      path: '/admin/memberships',
      roles: ['admin'],
    },
    {
      id: 'finance',
      label: 'Financeiro',
      icon: 'BarChart3',
      path: '/admin/finance',
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'Settings',
      path: '/admin/settings',
      roles: ['admin'],
    },
    {
      id: 'my-dashboard',
      label: 'Meu Painel',
      icon: 'Layers',
      path: '/admin/my-dashboard',
      roles: ['admin'],
      separator: true,
      sectionLabel: 'Como Jogador',
    },
    {
      id: 'my-profile',
      label: 'Meu Perfil',
      icon: 'User',
      path: '/admin/my-profile',
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



  const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/admin/games')) return 'Jogos';
    if (pathname.startsWith('/admin/players')) return 'Jogadores';
    if (pathname.startsWith('/admin/bbq')) return 'Churrascos';
    if (pathname.startsWith('/admin/chats')) return 'Chats';
    if (pathname.startsWith('/admin/memberships')) return 'Membros';
    if (pathname.startsWith('/admin/finance')) return 'Financeiro';
    if (pathname.startsWith('/admin/settings')) return 'Configurações';
    if (pathname.startsWith('/admin/my-dashboard')) return 'Meu Painel';
    if (pathname.startsWith('/admin/my-profile')) return 'Meu Perfil';
    if (pathname.startsWith('/admin/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/user/profile')) return 'Meu Perfil';
    if (pathname.startsWith('/user/dashboard')) return 'Meu Painel';
    return 'Faz o Simples';
  };

  const formatPhone = (phone: string): string => {
    if (!phone) return '';

    const numbers = phone.replace(/\D/g, '');

    const localNumber = numbers.startsWith('55') ? numbers.slice(2) : numbers;

    if (localNumber.length === 11) {
      return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
    } else if (localNumber.length === 10) {
      return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`;
    }

    return phone;
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
        userEmail={formatPhone(user?.phone || '')}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={async () => {
          const { authAPI } = await import('../lib/axios');
          await authAPI.logout();
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left Side - Mobile Menu + Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir Menu"
              >
                <BFIcons.Menu size={20} className="text-[--foreground]" />
              </button>

              {/* App name on sm+, current page on mobile */}
              <div className="hidden sm:block">
                <h2 className="text-base font-semibold text-[--foreground]">Faz o Simples</h2>
              </div>
              <div className="sm:hidden">
                <h2 className="text-base font-semibold text-[--foreground]">{getPageTitle(location.pathname)}</h2>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Theme Toggle - always visible */}
              <button
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
                className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {isDarkMode
                  ? <BFIcons.Sun size={20} className="text-[--muted-foreground]" />
                  : <BFIcons.Moon size={20} className="text-[--muted-foreground]" />
                }
              </button>

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Configurações"
                  >
                    <BFIcons.Settings size={20} className="text-[--muted-foreground]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => navigate('/user/profile')}
                  >
                    <BFIcons.User size={18} />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => navigate('/admin/settings')}
                  >
                    <BFIcons.Settings size={18} />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => navigate('/admin/billing')}
                  >
                    <BFIcons.Wallet size={18} />
                    <span>Assinatura</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    variant="destructive"
                    onSelect={async () => {
                      const { authAPI } = await import('../lib/axios');
                      await authAPI.logout();
                    }}
                  >
                    <BFIcons.LogOut size={18} />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Subscription banners */}
        {subscriptionStatus === 'expired' && (
          <div className="bg-red-600 text-white text-sm px-4 py-2 flex items-center justify-between gap-2">
            <span>
              ⚠️ <strong>Assinatura expirada.</strong> O bot e o painel estão bloqueados.
            </span>
            <Link to="/admin/billing" className="underline font-semibold whitespace-nowrap">
              Assinar agora →
            </Link>
          </div>
        )}
        {subscriptionStatus === 'trialing' && trialDaysLeft !== null && trialDaysLeft <= 5 && (
          <div className="bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-between gap-2">
            <span>
              ⏳ <strong>
                {trialDaysLeft === 0
                  ? 'Seu trial expira hoje!'
                  : `Seu trial expira em ${trialDaysLeft} dia${trialDaysLeft === 1 ? '' : 's'}.`}
              </strong>{' '}
              Assine para continuar.
            </span>
            <Link to="/admin/billing" className="underline font-semibold whitespace-nowrap">
              Ver planos →
            </Link>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-[--background]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

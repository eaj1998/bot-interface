import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { Skeleton } from '../components/ui/skeleton';
import { api } from '../lib/axios';
import { formatEventDate, formatEventTime } from '../lib/dateUtils';
import { toast } from 'sonner';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  pendingRevenue: number;
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  totalGames: number;
  nextGameDate: string | null;
}

interface RecentGame {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
  currentPlayers: number;
  maxPlayers: number;
}

interface RecentDebt {
  id: string;
  playerName: string;
  amount: number;
  status: string;
  createdAt: string;
  notes?: string;
  description?: string;
  category?: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentGames: RecentGame[];
  recentDebts: RecentDebt[];
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const init = async () => {
      try {
        // Use workspaces from context
        const workspaceId = currentWorkspace?.id || null;


        const url = workspaceId ? `/dashboard/${workspaceId}` : '/dashboard';
        const response = await api.get(url, { signal: abortController.signal });
        setDashboardData(response.data);
      } catch (error: any) {
        if (error.code !== 'ERR_CANCELED' && error.name !== 'CanceledError') {
          console.error('Error loading dashboard:', error);
          toast.error('Erro ao carregar dashboard');
          setLoading(false);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      abortController.abort();
    };
  }, [currentWorkspace]);


  const formatMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  /* const formatDate = (dateString: string): string => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return formatDateWithoutTimezone(dateString).split('/').slice(0, 2).join('/');
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }; */

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info', label: string }> = {
      'open': { variant: 'info', label: 'Aberto' },
      'closed': { variant: 'warning', label: 'Fechado' },
      'finished': { variant: 'success', label: 'Concluído' },
      'cancelled': { variant: 'error', label: 'Cancelado' },
      'pending': { variant: 'warning', label: 'Pendente' },
      'pendente': { variant: 'warning', label: 'Pendente' },
      'overdue': { variant: 'error', label: 'Vencido' },
      'paid': { variant: 'success', label: 'Pago' },
      'pago': { variant: 'success', label: 'Pago' },
      'confirmado': { variant: 'success', label: 'Pago' },
    };
    const config = statusMap[status?.toLowerCase()] || { variant: 'warning' as const, label: status };
    return <BFBadge variant={config.variant} size="sm">{config.label}</BFBadge>;
  };

  if (loading) {
    return (
      <div className="space-y-6" data-test="admin-dashboard-skeleton">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <BFCard key={i} variant="elevated" padding="md">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </BFCard>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <BFCard key={i} variant="elevated" padding="lg">
              <div className="mb-4">
                <Skeleton className="h-5 w-36 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </BFCard>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar dashboard</p>
        </div>
      </div>
    );
  }

  const { stats, recentGames, recentDebts } = dashboardData;
  const pendingDebts = recentDebts.filter(d => {
    const s = d.status?.toLowerCase();
    return s === 'pending' || s === 'pendente' || s === 'overdue';
  });

  return (
    <div className="space-y-6" data-test="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[--foreground] mb-2">Dashboard Administrativo</h1>
          <p className="text-[--muted-foreground]">
            Visão geral do sistema Faz o Simples
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Caixa (Saldo Líquido) */}
        <BFCard variant="elevated" padding="md" data-test="stat-balance">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Caixa (Saldo)</p>
              <h2 className={stats.netBalance >= 0 ? "text-[--success]" : "text-[--destructive]"}>
                {formatMoney(stats.netBalance)}
              </h2>
              <p className="text-[--muted-foreground] mt-2 text-xs">
                Entradas: {formatMoney(stats.totalRevenue)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.netBalance >= 0 ? 'bg-[--success]/10' : 'bg-[--destructive]/10'}`}>
              <BFIcons.DollarSign size={24} color={stats.netBalance >= 0 ? 'var(--success)' : 'var(--destructive)'} />
            </div>
          </div>
        </BFCard>

        {/* Card: A Receber (Pending) */}
        <BFCard variant="elevated" padding="md" data-test="stat-pending">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">A Receber</p>
              <h2 className="text-[--warning]">{formatMoney(stats.pendingRevenue)}</h2>
              <p className="text-[--muted-foreground] mt-2 text-xs">
                Previsão de entrada
              </p>
            </div>
            <div className="bg-[--warning]/10 p-3 rounded-lg">
              <BFIcons.Clock size={24} color="var(--warning)" />
            </div>
          </div>
        </BFCard>

        {/* Card: Membros */}
        <BFCard variant="elevated" padding="md" data-test="stat-members">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Membros</p>
              <h2 className="text-[--foreground]">{stats.totalMembers}</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-[--accent] px-2 py-0.5 rounded text-[--foreground] flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" aria-hidden="true"></div>
                  <span className="sr-only">Ativos: </span>
                  {stats.activeMembers}
                </span>
                <span className="text-xs bg-[--accent] px-2 py-0.5 rounded text-[--foreground] flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--destructive)]" aria-hidden="true"></div>
                  <span className="sr-only">Suspensos: </span>
                  {stats.suspendedMembers}
                </span>
              </div>
            </div>
            <div className="bg-[--primary]/10 p-3 rounded-lg">
              <BFIcons.Users size={24} color="var(--primary)" />
            </div>
          </div>
        </BFCard>

        {/* Card: Operacional (Jogos) */}
        <BFCard variant="elevated" padding="md" data-test="stat-games">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Jogos Realizados</p>
              <h2 className="text-[--foreground]">{stats.totalGames}</h2>
              <p className="text-[--muted-foreground] mt-2 text-xs">
                Próximo: {stats.nextGameDate ? formatEventDate(stats.nextGameDate) : 'Nenhum'}
              </p>
            </div>
            <div className="bg-[--accent] p-3 rounded-lg">
              <BFIcons.Trophy size={24} color="var(--primary)" />
            </div>
          </div>
        </BFCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BFCard variant="elevated" padding="lg" data-test="upcoming-games">
          <BFCardHeader
            title="Jogos Recentes"
            subtitle={`${recentGames.length} agendados`}
            action={
              <button
                onClick={() => navigate('/admin/games')}
                className="text-sm text-[--primary] hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            }
          />
          <BFCardContent>
            <div className="space-y-3">
              {recentGames.length > 0 ? recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-[--accent] rounded-lg cursor-pointer hover:bg-[--accent]/80 transition-colors"
                  onClick={() => navigate(`/admin/games/${game.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[--primary] p-2 rounded-lg">
                      <BFIcons.Trophy size={20} color="white" />
                    </div>
                    <div>
                      <p className="text-[--foreground]">{game.name}</p>
                      <p className="text-[--muted-foreground]">
                        {formatEventDate(game.date)} às {game.time ? game.time.replace(':', 'h') : formatEventTime(game.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(game.status)}
                    <p className="text-[--muted-foreground] mt-1">
                      {game.currentPlayers}/{game.maxPlayers} jogadores
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">Nenhum jogo agendado</p>
              )}
            </div>
          </BFCardContent>
        </BFCard>

        <BFCard variant="elevated" padding="lg" data-test="recent-debts">
          <BFCardHeader
            title="Débitos Recentes"
            subtitle={`${pendingDebts.length} pendentes`}
            action={
              <button
                onClick={() => navigate('/admin/finance')}
                className="text-sm text-[--primary] hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            }
          />
          <BFCardContent>
            <div className="space-y-3">
              {recentDebts.length > 0 ? recentDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 bg-[--accent] rounded-lg cursor-pointer hover:bg-accent/80 transition-colors"
                  onClick={() => navigate('/admin/finance')}
                >
                  <div className="flex items-center gap-3">
                    {(debt.category === 'general' || debt.category === 'field-payment') ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--warning)] to-[var(--warning)]/70 flex items-center justify-center shadow-md">
                        <BFIcons.DollarSign size={20} color="white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-lg">
                          {debt.playerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`${(debt.category === 'general' || debt.category === 'field-payment')
                        ? 'text-[--warning] font-semibold'
                        : 'text-[--foreground]'
                        }`}>
                        {(debt.category === 'general' || debt.category === 'field-payment') ? 'Débito Geral' : debt.playerName}
                      </p>
                      {(debt.description || debt.notes) && (
                        <p className="text-[--muted-foreground] text-xs mt-0.5 italic">
                          {debt.description || debt.notes}
                        </p>
                      )}
                      <p className="text-[--muted-foreground] text-sm">{formatEventDate(debt.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[--foreground] font-semibold">
                      {formatMoney(debt.amount)}
                    </p>
                    {getStatusBadge(debt.status)}
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">Nenhum débito pendente</p>
              )}
            </div>
          </BFCardContent>
        </BFCard>
      </div>
    </div>
  );
};

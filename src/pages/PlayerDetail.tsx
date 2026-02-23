import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFBadge } from '../components/BF-Badge';
import { BFCard } from '../components/BF-Card';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { playersAPI, tokenService } from '../lib/axios';
import type { Player } from '../lib/types'; // Updated type import
import { toast } from 'sonner';
import { EditPlayerModal } from '../components/EditPlayerModal';

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const currentUser = tokenService.getUser();
  const isAdmin = currentUser?.role === 'admin';

  const [player, setPlayer] = useState<Player | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]); // Using any for now to match backend return
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  const fetchPlayerData = async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      const [playerData, transactionsData] = await Promise.all([
        playersAPI.getPlayerById(playerId),
        playersAPI.getPlayerTransactions(playerId)
      ]);

      setPlayer(playerData);
      // Backend returns { ledgers: [], ... } or { transactions: [] }? Service returns { ledgers: ... }
      setTransactions(transactionsData.ledgers || transactionsData.transactions || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados do jogador:', error);
      toast.error('Erro ao carregar dados do jogador');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlayer = async (updatedData: Partial<Player>) => {
    if (!playerId) return;

    try {
      await playersAPI.updatePlayer(playerId, {
        name: updatedData.name,
        nick: updatedData.nick,
        phoneE164: updatedData.phone,
        status: updatedData.status,
        isGoalie: updatedData.isGoalie,
        role: updatedData.role,
        profile: updatedData.profile,
      });
      toast.success('Jogador atualizado com sucesso!');
      setIsEditModalOpen(false);
      fetchPlayerData();
    } catch (error: any) {
      console.error('Erro ao atualizar jogador:', error);
      toast.error('Erro ao atualizar jogador');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    const withoutCountry = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;

    if (withoutCountry.length === 11) {
      return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`;
    } else if (withoutCountry.length === 10) {
      return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 6)}-${withoutCountry.slice(6)}`;
    }
    return phone;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'success' as const },
      inactive: { label: 'Inativo', variant: 'neutral' as const },
      suspended: { label: 'Suspenso', variant: 'error' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'neutral' as const };
    return <BFBadge variant={statusInfo.variant}>{statusInfo.label}</BFBadge>;
  };

  const getTransactionStatusBadge = (status: string) => {
    return status === 'COMPLETED' ? (
      <BFBadge variant="success">Pago</BFBadge>
    ) : status === 'CANCELLED' ? (
      <BFBadge variant="neutral">Cancelado</BFBadge>
    ) : (
      <BFBadge variant="warning">Pendente</BFBadge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Jogador não encontrado</h2>
          <BFButton onClick={() => navigate('/admin/players')}>
            Voltar para lista
          </BFButton>
        </div>
      </div>
    );
  }

  const transactionColumns = [
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (_: any, t: any) => formatDate(t.createdAt || t.dueDate),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (_: any, t: any) => (
        <div className="font-medium">{t.description || 'Sem descrição'}</div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (_: any, t: any) => (
        <span className={t.type === 'INCOME' ? 'text-red-500' : 'text-green-500'}>
          {t.type === 'INCOME' ? 'Cobrança' : 'Crédito'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (_: any, t: any) => (
        <span className="font-semibold">{formatCurrency(t.amount / 100)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Situação',
      render: (_: any, t: any) => getTransactionStatusBadge(t.status),
    },
  ];

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const completedCount = transactions.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BFButton
            variant="secondary"
            onClick={() => navigate('/admin/players')}
            icon={<BFIcons.ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Voltar</span>
          </BFButton>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Detalhes do Jogador</h1>
        </div>

        {isAdmin && (
          <BFButton
            variant="primary"
            onClick={() => setIsEditModalOpen(true)}
            icon={<BFIcons.Edit className="w-4 h-4" />}
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Editar jogador
          </BFButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <BFCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            {player.profilePicture ? (
              <img
                src={player.profilePicture}
                alt={player.name}
                className="w-32 h-32 rounded-full object-cover shadow-sm"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-sm">
                {player.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-2 w-full">
              <h2 className="text-xl sm:text-2xl font-bold truncate px-2">{player.name}</h2>
              {player.nick && (
                <p className="text-lg text-muted-foreground truncate px-2">"{player.nick}"</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {getStatusBadge(player.status)}
                {player.isGoalie && (
                  <BFBadge variant="info">Goleiro</BFBadge>
                )}
              </div>
            </div>
          </div>
        </BFCard>

        <BFCard className="lg:col-span-2 flex flex-col justify-center">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informações</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Telefone</p>
              <p className="font-medium text-lg">{formatPhone(player.phone)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Função</p>
              <p className="font-medium text-lg">
                {player.role === 'admin' ? 'Administrador' : 'Jogador'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Data de Entrada</p>
              <p className="font-medium text-lg">{formatDate(player.joinDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Última Atividade</p>
              <p className="font-medium text-lg">{formatDateTime(player.lastActivity)}</p>
            </div>
          </div>
        </BFCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <BFCard>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Saldo</p>
            <p className={`text-3xl font-bold ${player.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(player.balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              (Simulado: R$ 0,00)
            </p>
          </div>
        </BFCard>

        <BFCard>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total em Débitos</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(player.totalDebt)}
            </p>
          </div>
        </BFCard>

        <BFCard>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Pendências</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {pendingCount}
            </p>
          </div>
        </BFCard>
      </div>

      <BFCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-xl font-semibold">Histórico de Transações</h3>
          <div className="text-sm text-muted-foreground">
            Total: {transactions.length} | Pendentes: {pendingCount} | Pagos: {completedCount}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        ) : (
          <BFTable
            columns={transactionColumns}
            data={transactions}
          />
        )}
      </BFCard>

      <EditPlayerModal
        player={player}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePlayer}
      />
    </div>
  );
};

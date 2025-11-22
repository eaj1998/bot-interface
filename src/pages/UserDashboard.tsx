import React, { useEffect, useState } from 'react';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFButton } from '../components/BF-Button';
import { BFIcons } from '../components/BF-Icons';

import { useAuth } from '../components/ProtectedRoute';
import { debtsAPI, gamesAPI, ledgersAPI } from '../lib/axios';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsPagination, setTransactionsPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const debtsResponse = await debtsAPI.getMyDebts();
        const debtsData = debtsResponse.data || debtsResponse;
        const mappedDebts = Array.isArray(debtsData) ? debtsData.map((debt: any) => ({
          id: debt._id,
          amount: debt.amountCents / 100,
          status: debt.status === 'pendente' ? 'pending' : debt.status === 'confirmado' ? 'paid' : 'overdue',
          gameName: debt.note || 'Jogo',
          dueDate: debt.createdAt,
          ...debt
        })) : [];
        setDebts(mappedDebts);

        const gamesResponse = await gamesAPI.getMyOpenGames();
        const gamesData = gamesResponse.data || gamesResponse;
        const mappedGames = Array.isArray(gamesData) ? gamesData.map((game: any) => ({
          id: game.id,
          name: game.title,
          status: game.status === 'open' ? 'scheduled' : game.status,
          date: game.date,
          time: new Date(game.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          location: 'A definir',
          pricePerPlayer: game.priceCents / 100,
          currentPlayers: game.currentPlayers ?? 0,
          maxPlayers: game.maxPlayers ?? 0,
          paid: game.playerInfo?.paid || false,
          ...game
        })) : [];
        setGames(mappedGames);

        // Busca histórico de transações
        const ledgersResponse = await ledgersAPI.getMyLedgers(1, 5);
        const ledgersData = ledgersResponse.ledgers || [];
        const mappedLedgers = Array.isArray(ledgersData) ? ledgersData.map((ledger: any) => ({
          id: ledger._id,
          type: ledger.type === 'credit' ? 'payment' : 'debit',
          description: ledger.note,
          amount: ledger.type === 'credit' ? ledger.amountCents / 100 : -(ledger.amountCents / 100),
          date: ledger.createdAt,
          status: ledger.status,
          ...ledger
        })) : [];
        setTransactions(mappedLedgers);
        setTransactionsPagination({
          page: ledgersResponse.page || 1,
          totalPages: ledgersResponse.totalPages || 1,
          total: ledgersResponse.total || 0,
          limit: ledgersResponse.limit || 5
        });
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar dados');
        setDebts([]);
        setGames([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingDebts = debts.filter(f => f.type === 'debit');
  const totalDebt = pendingDebts.filter(f => f.status === 'pendente' && f.type === 'debit').reduce((sum, d) => sum + d.amount, 0);

  const upcomingGames = games;
  
  const loadTransactionsPage = async (page: number) => {
    try {
      const response = await ledgersAPI.getMyLedgers(page, 5);
      const ledgersData = response.ledgers || [];
      const mappedLedgers = ledgersData.map((ledger: any) => ({
        id: ledger._id,
        type: ledger.type === 'credit' ? 'payment' : 'debit',
        description: ledger.note,
        amount: ledger.type === 'credit' ? ledger.amountCents / 100 : -(ledger.amountCents / 100),
        date: ledger.createdAt,
        status: ledger.status,
      }));
      setTransactions(mappedLedgers);
      setTransactionsPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
        limit: response.limit
      });
    } catch (error) {
      console.error('Error loading transactions page:', error);
    }
  };
  
  const getDebtStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'warning' as const, label: 'Pendente' },
      pendente: { variant: 'warning' as const, label: 'Pendente' },
      paid: { variant: 'success' as const, label: 'Confirmado' },
      confirmado: { variant: 'success' as const, label: 'Confirmado' },
      overdue: { variant: 'error' as const, label: 'Atrasado' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'warning' as const, label: 'Pendente' };
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-test="user-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-[--foreground] mb-2">Olá, {user?.name || 'Usuário'}! 👋</h1>
        <p className="text-[--muted-foreground]">
          Acompanhe seus débitos e próximos jogos
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BFCard variant="stat" padding="md" data-test="user-debt">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 mb-1">Débito Total</p>
              <h2 className="text-white">
                R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-white/70 mt-2">
                {pendingDebts.length} {pendingDebts.length === 1 ? 'pendência' : 'pendências'}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <BFIcons.DollarSign size={24} color="white" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="user-games">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Próximos Jogos</p>
              <h2 className="text-[--foreground]">{upcomingGames.length}</h2>
              <p className="text-[--muted-foreground] mt-2">
                Agendados
              </p>
            </div>
            <div className="bg-[--accent] p-3 rounded-lg">
              <BFIcons.Trophy size={24} color="var(--primary)" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="user-status">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Status</p>
              <BFBadge variant={user.status === 'active' ? 'success' : 'error'} size="lg">{user.status === 'active' ? 'Ativo' : 'Inativo'}</BFBadge>
              <p className="text-[--muted-foreground] mt-2">
                Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="bg-[--success]/10 p-3 rounded-lg">
              <BFIcons.CheckCircle size={24} color="var(--success)" />
            </div>
          </div>
        </BFCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Debts */}
        <BFCard variant="elevated" padding="lg" data-test="pending-debts">
          <BFCardHeader
            title="Débitos Pendentes"
            subtitle={`${pendingDebts.length} ${pendingDebts.length === 1 ? 'débito' : 'débitos'}`}
          // action={
          //   totalDebt > 0 && (
          //     <BFButton
          //       variant="primary"
          //       size="sm"
          //       icon={<BFIcons.DollarSign size={16} />}
          //       data-test="pay-all-button"
          //     >
          //       Pagar Tudo
          //     </BFButton>
          //   )
          // }
          />
          <BFCardContent>
            {pendingDebts.length === 0 ? (
              <div className="text-center py-8 text-[--muted-foreground]">
                <BFIcons.CheckCircle size={48} className="mx-auto mb-3 text-[--success]" />
                <p>Você não tem débitos pendentes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="p-4 bg-[--accent] rounded-lg border border-[--border]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[--foreground]">{debt.gameName}</p>
                        <p className="text-[--muted-foreground]">
                          Vencimento: {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {getDebtStatusBadge(debt.status)}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[--border]">
                      <h4 className="text-[--foreground]">
                        R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h4>
                      <BFButton
                        variant="primary"
                        size="sm"
                        icon={<BFIcons.CheckCircle size={16} />}
                        data-test={`pay-debt-${debt.id}`}
                      >
                        Pagar
                      </BFButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BFCardContent>
        </BFCard>

        {/* Upcoming Games */}
        <BFCard variant="elevated" padding="lg" data-test="upcoming-games">
          <BFCardHeader
            title="Próximos Jogos"
            subtitle="Jogos agendados"
          />
          <BFCardContent>
            {upcomingGames.length === 0 ? (
              <div className="text-center py-8 text-[--muted-foreground]">
                <BFIcons.Trophy size={48} className="mx-auto mb-3" />
                <p>Nenhum jogo agendado no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 bg-[--accent] rounded-lg border border-[--border]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-[--primary]/10 p-2 rounded-lg">
                        <BFIcons.Trophy size={20} color="var(--primary)" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[--foreground]">{game.name}</p>
                        {/* <p className="text-[--muted-foreground]">{game.location}</p> */}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[--muted-foreground]">
                          <BFIcons.Calendar size={16} className="inline mr-1" />
                          {new Date(game.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-[--muted-foreground]">
                          <BFIcons.Clock size={16} className="inline mr-1" />
                          {game.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[--foreground]">
                          R$ {game.pricePerPlayer.toFixed(2)}
                        </p>
                        <p className="text-[--muted-foreground]">
                          {game.currentPlayers}/{game.maxPlayers} jogadores
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BFCardContent>
        </BFCard>
      </div>

      {/* Transaction History */}
      <BFCard variant="elevated" padding="lg" data-test="transaction-history">
        <BFCardHeader
          title="Histórico de Transações"
          subtitle={`${transactionsPagination.total} movimentações`}
        />
        <BFCardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-[--muted-foreground]">
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border-b border-[--border] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${transaction.type === 'payment'
                          ? 'bg-[--success]/10'
                          : 'bg-[--warning]/10'
                          }`}
                      >
                        {transaction.type === 'payment' ? (
                          <BFIcons.TrendingUp size={20} color="var(--success)" />
                        ) : (
                          <BFIcons.TrendingDown size={20} color="var(--warning)" />
                        )}
                      </div>
                      <div>
                        <p className="text-[--foreground]">{transaction.description}</p>
                        <p className="text-[--muted-foreground]">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')} às {new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={
                        transaction.type === 'payment'
                          ? 'text-[--success]'
                          : 'text-[--destructive]'
                      }
                    >
                      {transaction.amount > 0 ? '+' : ''}R${' '}
                      {Math.abs(transaction.amount).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Paginação */}
              {transactionsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[--border]">
                  <p className="text-sm text-[--muted-foreground]">
                    Página {transactionsPagination.page} de {transactionsPagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <BFButton
                      variant="outline"
                      size="sm"
                      disabled={transactionsPagination.page === 1}
                      onClick={() => loadTransactionsPage(transactionsPagination.page - 1)}
                    >
                      Anterior
                    </BFButton>
                    <BFButton
                      variant="outline"
                      size="sm"
                      disabled={transactionsPagination.page === transactionsPagination.totalPages}
                      onClick={() => loadTransactionsPage(transactionsPagination.page + 1)}
                    >
                      Próxima
                    </BFButton>
                  </div>
                </div>
              )}
            </>
          )}
        </BFCardContent>
      </BFCard>
    </div>
  );
};

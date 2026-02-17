import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { BFListView } from '../components/BFListView';
import type { BFListViewColumn, BFListViewStat } from '../components/BFListView';
import { EditPlayerModal } from '../components/EditPlayerModal';
import { CreatePlayerModal } from '../components/modals/CreatePlayerModal';
import { playersAPI } from '../lib/axios';
import type { Player } from '../lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../hooks/useAuth';

export const ManagePlayers: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // const [workspaceId, setWorkspaceId] = useState<string>(''); // Removed redundant state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Removed redundant fetchWorkspace useEffect

  const fetchPlayers = useCallback(async () => {
    // console.log('[DEBUG] fetchPlayers called, workspaceId:', currentWorkspace?.id);
    if (!currentWorkspace?.id) {
      // console.log('[DEBUG] No workspaceId, returning early');
      return;
    }

    try {
      setLoading(true);
      // Fetch all players for client-side filtering
      const response = await playersAPI.getPlayers({
        workspaceId: currentWorkspace.id,
        limit: 1000, // Fetch a large batch to handle client-side filtering
        page: 1
      });

      setAllPlayers(response.players || []);
    } catch (error: any) {
      console.error('Error fetching players:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar jogadores');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Client-side filtering
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(player => {
      const matchesSearch =
        player.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (player.phone && player.phone.includes(debouncedSearchTerm)) || // basic check
        (player.email && player.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || player.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [allPlayers, debouncedSearchTerm, filterStatus]);

  // Pagination
  const paginatedPlayers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPlayers.slice(startIndex, startIndex + pageSize);
  }, [filteredPlayers, currentPage]);

  const totalPages = Math.ceil(filteredPlayers.length / pageSize);

  const stats = useMemo(() => ({
    total: allPlayers.length,
    active: allPlayers.filter(p => p.status === 'active').length,
    withDebts: allPlayers.filter(p => (p.totalDebt || 0) > 0).length,
    suspended: allPlayers.filter(p => p.status === 'suspended' || p.status === 'inactive').length
  }), [allPlayers]);

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      setIsDeleting(true);
      await playersAPI.deletePlayer(playerToDelete.id);
      toast.success(`${playerToDelete.name} foi excluído com sucesso!`);
      setPlayerToDelete(null);
      fetchPlayers();
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir jogador');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePlayer = async (updatedData: Partial<Player>) => {
    if (!playerToEdit) return;

    await playersAPI.updatePlayer(playerToEdit.id, {
      name: updatedData.name,
      nick: updatedData.nick,
      phoneE164: updatedData.phone,
      status: updatedData.status,
      isGoalie: updatedData.isGoalie,
      role: updatedData.role,
      profile: updatedData.profile,
      workspaceId: currentWorkspace?.id,
    });
    toast.success('Jogador atualizado com sucesso!');
    setPlayerToEdit(null);
    fetchPlayers();
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

  const getStatusBadge = (status: Player['status']) => {
    const statusMap = {
      active: { variant: 'success' as const, label: 'Ativo' },
      inactive: { variant: 'neutral' as const, label: 'Inativo' },
      suspended: { variant: 'error' as const, label: 'Suspenso' },
    };
    const config = statusMap[status];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  // Configure statistics for BFListView
  const listStats: BFListViewStat[] = [
    {
      label: 'Total',
      value: stats.total,
      icon: <BFIcons.Users size={20} color="white" />,
      iconBgColor: 'white/20',
      variant: 'stat',
      labelColor: 'white/80',
      valueColor: 'white',
    },
    {
      label: 'Ativos',
      value: stats.active,
      icon: <BFIcons.CheckCircle size={20} color="var(--success)" />,
      iconBgColor: 'var(--success)/10',
      variant: 'elevated'
    },
    {
      label: 'Com Débitos',
      value: stats.withDebts,
      icon: <BFIcons.AlertCircle size={20} color="var(--warning)" />,
      iconBgColor: 'var(--warning)/10',
      variant: 'elevated'
    },
    {
      label: 'Inativos',
      value: stats.suspended,
      icon: <BFIcons.XCircle size={20} color="var(--destructive)" />,
      iconBgColor: 'var(--destructive)/10',
      variant: 'elevated'
    },
  ];

  // Configure columns for BFListView
  const columns: BFListViewColumn<Player>[] = [
    {
      key: 'name',
      label: 'Jogador',
      sortable: true,
      render: (_: any, row: Player) => (
        <div className="flex items-center gap-3">
          {row.profilePicture ? (
            <img
              src={row.profilePicture}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-white font-semibold">{row.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-[--foreground] font-medium">{row.name}</p>
            <p className="text-[--muted-foreground] text-sm">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contato',
      render: (value: string, row: Player) => (
        <div>
          <p className="text-[--foreground]">{formatPhone(value)}</p>
          {row.cpf && <p className="text-[--muted-foreground] text-sm">{row.cpf}</p>}
        </div>
      ),
    },
    {
      key: 'totalDebt',
      label: 'Débito',
      sortable: true,
      render: (value: number) => (
        <span className={value > 0 ? 'text-[--destructive]' : 'text-[--success]'}>
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Última Atividade',
      sortable: true,
      render: (value: string) => (
        <span className="text-[--muted-foreground]">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Player['status']) => getStatusBadge(value),
    },
  ];

  return (
    <>
      <BFListView
        title="Gerenciar Jogadores"
        description="Adicione e gerencie jogadores do sistema"
        createButton={{
          label: 'Novo Jogador',
          onClick: () => setIsCreateDialogOpen(true),
        }}
        stats={listStats}
        searchPlaceholder="Buscar por nome ou telefone..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={{
          value: filterStatus,
          onChange: setFilterStatus,
          options: [
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Ativos' },
            { value: 'inactive', label: 'Inativos' },
          ],
        }}
        columns={columns}
        data={paginatedPlayers}
        loading={loading}
        emptyState={{
          icon: <BFIcons.Users size={48} className="text-muted-foreground mb-3" />,
          message: 'Nenhum jogador encontrado',
          submessage: (debouncedSearchTerm || filterStatus !== 'all') ? 'Tente ajustar os filtros de busca' : undefined,
        }}
        onRowClick={(player) => navigate(`/admin/players/${player.id}`)}
        rowActions={(row: Player) => (
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Ver Detalhes"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/players/${row.id}`);
              }}
              data-test={`view-player-${row.id}`}
            >
              <BFIcons.Eye size={18} color="var(--primary)" />
            </button>
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Editar"
              onClick={(e) => {
                e.stopPropagation();
                setPlayerToEdit(row);
              }}
              data-test={`edit-player-${row.id}`}
            >
              <BFIcons.Edit size={18} color="var(--primary)" />
            </button>
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Deletar"
              onClick={(e) => {
                e.stopPropagation();
                setPlayerToDelete(row);
              }}
              data-test={`delete-player-${row.id}`}
            >
              <BFIcons.Trash2 size={18} color="var(--destructive)" />
            </button>
          </div>
        )}
        pagination={{
          page: currentPage,
          limit: pageSize,
          total: filteredPlayers.length,
          totalPages: totalPages,
          onPageChange: setCurrentPage,
        }}
        dataTest="manage-players"
      />

      {/* Create Player Modal */}
      <CreatePlayerModal
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        workspaceId={currentWorkspace?.id || ''}
        onSuccess={fetchPlayers}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{playerToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlayer}
              disabled={isDeleting}
              className="bg-[--destructive] text-white hover:bg-[--destructive]/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPlayerModal
        player={playerToEdit}
        isOpen={!!playerToEdit}
        onClose={() => setPlayerToEdit(null)}
        onSave={handleSavePlayer}
      />
    </>
  );
};

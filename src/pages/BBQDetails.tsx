import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFBadge } from '../components/BF-Badge';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { formatISODate } from '../lib/dateUtils';
import type { BBQResponseDto, BBQParticipant } from '../lib/types';
import type { BFTableColumn } from '../components/BF-Table';
import { bbqAPI, playersAPI } from '../lib/axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { BFInput } from '../components/BF-Input';
import { Search } from 'lucide-react';

export const BBQDetails: React.FC = () => {
    const { bbqId } = useParams<{ bbqId: string }>();
    const navigate = useNavigate();

    const [bbq, setBbq] = useState<BBQResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [valuePerPerson, setValuePerPerson] = useState('');
    const [valueInCents, setValueInCents] = useState(0);
    const [addParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingPlayers, setSearchingPlayers] = useState(false);
    const [addingParticipant, setAddingParticipant] = useState(false);
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [selectedInviter, setSelectedInviter] = useState<any>(null);
    const [guestName, setGuestName] = useState('');

    useEffect(() => {
        if (bbqId) {
            fetchBBQ();
        }
    }, [bbqId]);

    useEffect(() => {
        // Initialize value per person from BBQ data
        if (bbq?.valuePerPerson && bbq.valuePerPerson > 0) {
            const formatted = (bbq.valuePerPerson / 100).toFixed(2).replace('.', ',');
            setValuePerPerson(formatted);
            setValueInCents(bbq.valuePerPerson);
        }
    }, [bbq?.valuePerPerson]);

    const fetchBBQ = async () => {
        if (!bbqId) {
            console.log('No ID provided, skipping fetch');
            setLoading(false);
            return;
        }

        console.log('Fetching BBQ with ID:', bbqId);

        try {
            setLoading(true);
            const response = await bbqAPI.getBBQById(bbqId);

            console.log('BBQ Details Response:', response);

            // Extract BBQ data from response
            const bbqData = response.data || response;
            console.log('Extracted BBQ data:', bbqData);

            setBbq(bbqData);
        } catch (error: any) {
            console.error('Error fetching BBQ:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });

            if (error.response?.status === 404) {
                toast.error('Churrasco não encontrado');
                setTimeout(() => navigate('/admin/bbq'), 1500);
            } else {
                toast.error(error.response?.data?.message || 'Erro ao carregar churrasco');
            }
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    };

    const handleValueChange = async () => {
        if (!bbqId || !bbq || isReadOnly) return;

        setUpdating(true);
        try {
            await bbqAPI.updateBBQ(bbqId, {
                valuePerPerson: valueInCents,
            });

            // Update local state
            setBbq(prev => prev ? { ...prev, valuePerPerson: valueInCents } : null);
            toast.success('Valor atualizado com sucesso!');
        } catch (error: any) {
            console.error('Error updating value:', error);
            toast.error(error.response?.data?.message || 'Erro ao atualizar valor');
        } finally {
            setUpdating(false);
        }
    };

    const handleCloseBBQ = async () => {
        if (!bbqId || !bbq) return;

        if (!bbq.valuePerPerson || bbq.valuePerPerson === 0) {
            toast.error('É necessário definir um valor por pessoa antes de fechar o churrasco');
            return;
        }

        try {
            setUpdating(true);
            await bbqAPI.closeBBQ(bbqId);
            toast.success('Churrasco fechado com sucesso!');
            await fetchBBQ();
        } catch (error: any) {
            console.error('Error closing BBQ:', error);
            toast.error(error.response?.data?.message || 'Erro ao fechar churrasco');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelBBQ = async () => {
        if (!bbqId) return;

        try {
            setUpdating(true);
            await bbqAPI.cancelBBQ(bbqId);
            toast.success('Churrasco cancelado');
            await fetchBBQ();
        } catch (error: any) {
            console.error('Error canceling BBQ:', error);
            toast.error(error.response?.data?.message || 'Erro ao cancelar churrasco');
        } finally {
            setUpdating(false);
        }
    };

    const handleSearchPlayers = async (search: string) => {
        if (!search || search.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchingPlayers(true);
            const response = await playersAPI.searchPlayers(search);
            setSearchResults(response.players || []);
        } catch (error: any) {
            console.error('Error searching players:', error);
            toast.error('Erro ao buscar jogadores');
        } finally {
            setSearchingPlayers(false);
        }
    };

    const handleAddParticipant = async (player?: any) => {
        if (!bbqId) return;

        try {
            setAddingParticipant(true);

            if (isGuestMode) {
                if (!selectedInviter || !guestName) {
                    toast.error('Selecione quem convida e o nome do convidado');
                    return;
                }

                await bbqAPI.addGuest(bbqId, selectedInviter.id || selectedInviter._id, guestName);
                toast.success(`✅ ${guestName} (convidado por ${selectedInviter.name}) adicionado ao churrasco!`);
            } else {
                if (!player) return;

                await bbqAPI.addParticipant(bbqId, player.id || player._id, player.name);
                toast.success(`✅ ${player.name} adicionado ao churrasco!`);
            }

            await fetchBBQ();
            setAddParticipantDialogOpen(false);
            setSearchTerm('');
            setSearchResults([]);
            setIsGuestMode(false);
            setSelectedInviter(null);
            setGuestName('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao adicionar participante');
        } finally {
            setAddingParticipant(false);
        }
    };

    const handleRemoveParticipant = async (userId: string) => {
        if (!bbqId || isReadOnly) return;

        try {
            await bbqAPI.removeParticipant(bbqId, userId);
            toast.success('Participante removido com sucesso!');
            await fetchBBQ();
        } catch (error: any) {
            console.error('Error removing participant:', error);
            toast.error(error.response?.data?.message || 'Erro ao remover participante');
        }
    };

    const handleTogglePayment = async (userId: string, currentStatus: boolean) => {
        if (!bbqId) return;

        try {
            setUpdating(true);
            await bbqAPI.toggleParticipantPayment(bbqId, userId, !currentStatus);
            toast.success(`Participante marcado como ${!currentStatus ? 'pago' : 'pendente'}!`);
            await fetchBBQ();
        } catch (error: any) {
            console.error('Error toggling payment:', error);
            toast.error(error.response?.data?.message || 'Erro ao atualizar pagamento');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                handleSearchPlayers(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getStatusBadge = (status: BBQResponseDto['status']) => {
        const statusMap = {
            open: { variant: 'info' as const, label: 'Aberto' },
            closed: { variant: 'warning' as const, label: 'Fechado' },
            finished: { variant: 'success' as const, label: 'Finalizado' },
            cancelled: { variant: 'error' as const, label: 'Cancelado' },
        };
        const config = statusMap[status];
        return <BFBadge variant={config.variant} size="lg">{config.label}</BFBadge>;
    };

    const participantColumns: BFTableColumn<BBQParticipant>[] = [
        {
            key: 'userName',
            label: 'Participante',
            render: (_: any, row: BBQParticipant) => (
                <div>
                    <p className="text-[--foreground] font-medium">{row.userName}</p>
                    {row.invitedBy && row.invitedByName && (
                        <p className="text-[--muted-foreground] text-sm mt-1">
                            Convidado por {row.invitedByName}
                        </p>
                    )}
                </div>
            ),
        },
    ];

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4" />
                    <p className="text-[--muted-foreground]">Carregando churrasco...</p>
                </div>
            </div>
        );
    }

    // Not found state
    if (!bbq) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <BFIcons.AlertCircle size={64} className="mx-auto text-[--muted-foreground] mb-4" />
                    <p className="text-[--muted-foreground] text-lg">Churrasco não encontrado</p>
                    <BFButton
                        variant="primary"
                        onClick={() => navigate('/admin/bbq')}
                        className="mt-4"
                    >
                        Voltar para lista
                    </BFButton>
                </div>
            </div>
        );
    }

    const isReadOnly = bbq.status === 'finished';
    const totalCollected = ((bbq.valuePerPerson || 0) / 100) * bbq.participants.length;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <BFButton
                    variant="ghost"
                    icon={<BFIcons.ArrowLeft size={20} />}
                    onClick={() => navigate(-1)}
                    data-test="back-button"
                >
                    Voltar
                </BFButton>
            </div>

            {/* Top Panel - Event Info and Status */}
            <BFCard variant="elevated" padding="lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--badge-info-bg)] flex items-center justify-center">
                            <BFIcons.Flame size={32} color="var(--badge-info-text)" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[--foreground]">
                                Churrasco
                            </h1>
                            <p className="text-[--muted-foreground] text-lg mt-1">
                                {formatISODate(bbq.date)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[--muted-foreground] text-sm">Status:</span>
                            {getStatusBadge(bbq.status)}
                        </div>
                        {bbq.status === 'open' && !isReadOnly && (
                            <div className="flex gap-2">
                                <BFButton
                                    variant="primary"
                                    size="sm"
                                    icon={<BFIcons.Lock size={16} />}
                                    onClick={handleCloseBBQ}
                                    disabled={updating || !bbq.valuePerPerson || bbq.valuePerPerson === 0}
                                    data-test="close-bbq-button"
                                >
                                    Fechar Churrasco
                                </BFButton>
                                <BFButton
                                    variant="danger"
                                    size="sm"
                                    icon={<BFIcons.XCircle size={16} />}
                                    onClick={handleCancelBBQ}
                                    disabled={updating}
                                    data-test="cancel-bbq-button"
                                >
                                    Cancelar Churrasco
                                </BFButton>
                            </div>
                        )}
                    </div>
                </div>
            </BFCard>

            {/* Financial Section */}
            <BFCard variant="default" padding="lg">
                <BFCardHeader title="Informações Financeiras" />
                <BFCardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Value per person */}
                        <div>
                            <BFMoneyInput
                                label="Valor por Pessoa"
                                value={valuePerPerson}
                                onChange={(val, cents) => {
                                    setValuePerPerson(val);
                                    setValueInCents(cents);
                                }}
                                disabled={isReadOnly || updating}
                                showCentsPreview={false}
                                data-test="value-per-person"
                            />
                            {!isReadOnly && (
                                <BFButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleValueChange}
                                    disabled={updating || valueInCents === (bbq.valuePerPerson || 0)}
                                    className="mt-2"
                                    data-test="save-value"
                                >
                                    Salvar Valor
                                </BFButton>
                            )}
                        </div>

                        {/* Total collected */}
                        <div>
                            <label className="block mb-2 text-sm text-foreground">
                                Total Arrecadado
                            </label>
                            <div className="h-12 px-4 bg-[var(--muted)] border-2 border-[var(--border)] rounded-xl flex items-center">
                                <BFIcons.DollarSign size={20} className="text-[var(--muted-foreground)] mr-2" />
                                <span className="text-[--foreground] font-semibold text-lg">
                                    R$ {totalCollected.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-[--muted-foreground]">
                                {bbq.participants.length} {bbq.participants.length === 1 ? 'participante' : 'participantes'} × R$ {((bbq.valuePerPerson || 0) / 100).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                    </div>
                </BFCardContent>
            </BFCard>

            {/* Participants List */}
            <BFCard variant="default" padding="lg">
                <BFCardHeader
                    title="Lista de Presença"
                    subtitle={`${bbq.participants.length} ${bbq.participants.length === 1 ? 'participante confirmado' : 'participantes confirmados'}`}
                    action={
                        !isReadOnly ? (
                            <BFButton
                                variant="primary"
                                size="sm"
                                icon={<BFIcons.User size={16} />}
                                onClick={() => setAddParticipantDialogOpen(true)}
                                disabled={updating}
                            >
                                Adicionar ao Churrasco
                            </BFButton>
                        ) : undefined
                    }
                />
                <BFCardContent>
                    <BFTable
                        columns={participantColumns}
                        data={bbq.participants}
                        emptyMessage="Nenhum participante confirmado ainda"
                        actions={
                            isReadOnly
                                ? undefined
                                : (row: BBQParticipant) => {
                                    // Show remove button when BBQ is open
                                    if (bbq.status === 'open') {
                                        return (
                                            <BFButton
                                                variant="ghost"
                                                size="sm"
                                                icon={<BFIcons.Trash2 size={16} />}
                                                onClick={() => handleRemoveParticipant(row.userId)}
                                                disabled={updating}
                                                data-test={`remove-participant-${row.userId}`}
                                            >
                                                Remover
                                            </BFButton>
                                        );
                                    }

                                    // Show payment toggle button when BBQ is closed
                                    if (bbq.status === 'closed') {
                                        return (
                                            <BFButton
                                                variant={row.isPaid ? 'success' : 'secondary'}
                                                size="sm"
                                                icon={row.isPaid ? <BFIcons.CheckCircle size={16} /> : <BFIcons.DollarSign size={16} />}
                                                onClick={() => handleTogglePayment(row.userId, row.isPaid)}
                                                disabled={updating}
                                                data-test={`toggle-payment-${row.userId}`}
                                            >
                                                {row.isPaid ? 'Pago' : 'Marcar Pago'}
                                            </BFButton>
                                        );
                                    }

                                    return null;
                                }
                        }
                        data-test="participants-table"
                    />
                </BFCardContent>
            </BFCard>

            {/* Read-only indicator */}
            {isReadOnly && (
                <div className="bg-[var(--badge-info-bg)] border-l-4 border-l-[var(--badge-info-text)] p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                        <BFIcons.Lock size={20} color="var(--badge-info-text)" />
                        <p className="text-[var(--badge-info-text)] font-medium">
                            Este evento está finalizado e não pode ser editado
                        </p>
                    </div>
                </div>
            )}

            {/* Dialog de adicionar participante */}
            <Dialog open={addParticipantDialogOpen} onOpenChange={(open) => {
                setAddParticipantDialogOpen(open);
                if (!open) {
                    setIsGuestMode(false);
                    setSearchTerm('');
                    setSearchResults([]);
                    setSelectedInviter(null);
                    setGuestName('');
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Adicionar ao Churrasco</DialogTitle>
                        <DialogDescription>
                            {isGuestMode ? 'Adicione um convidado ao churrasco' : 'Busque o participante por nome ou número de telefone'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Toggle Participante / Convidado */}
                        <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                            <button
                                onClick={() => setIsGuestMode(false)}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors ${!isGuestMode
                                    ? 'bg-primary text-white'
                                    : 'text-foreground hover:bg-accent'
                                    }`}
                                data-test="player-mode-button"
                            >
                                Participante Cadastrado
                            </button>
                            <button
                                onClick={() => setIsGuestMode(true)}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors ${isGuestMode
                                    ? 'bg-primary text-white'
                                    : 'text-foreground hover:bg-accent'
                                    }`}
                                data-test="guest-mode-button"
                            >
                                Convidado
                            </button>
                        </div>

                        {isGuestMode ? (
                            /* Modo Convidado */
                            <>
                                <div className="space-y-3">
                                    {/* Autocomplete para quem convida */}
                                    {!selectedInviter ? (
                                        <>
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-1 block">
                                                    Quem está convidando? *
                                                </label>
                                                <BFInput
                                                    placeholder="Digite o nome ou telefone..."
                                                    value={searchTerm}
                                                    onChange={(value) => setSearchTerm(value)}
                                                    icon={<Search className="w-4 h-4" />}
                                                    fullWidth
                                                    data-test="search-inviter-input"
                                                />
                                            </div>

                                            {/* Resultados da busca de quem convida */}
                                            {searchTerm.length >= 2 && (
                                                <div className="border border-border rounded-lg max-h-[200px] overflow-y-auto">
                                                    {searchingPlayers ? (
                                                        <div className="p-4 text-center text-muted-foreground">
                                                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                                                            <p className="mt-2">Buscando participantes...</p>
                                                        </div>
                                                    ) : searchResults.length > 0 ? (
                                                        <div className="divide-y divide-border">
                                                            {searchResults.map((player) => (
                                                                <button
                                                                    key={player.id}
                                                                    onClick={() => {
                                                                        setSelectedInviter(player);
                                                                        setSearchTerm('');
                                                                        setSearchResults([]);
                                                                    }}
                                                                    className="w-full p-3 text-left hover:bg-accent transition-colors"
                                                                    data-test={`inviter-result-${player.id}`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-sm font-medium text-foreground">{player.name}</p>
                                                                            {player.phone && (
                                                                                <p className="text-xs text-muted-foreground">{player.phone}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-muted-foreground">
                                                            <p>Nenhum participante encontrado</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* Mostrar quem foi selecionado */}
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-1 block">
                                                    Quem está convidando
                                                </label>
                                                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{selectedInviter.name}</p>
                                                        {selectedInviter.phone && (
                                                            <p className="text-xs text-muted-foreground">{selectedInviter.phone}</p>
                                                        )}
                                                    </div>
                                                    <BFButton
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedInviter(null)}
                                                        data-test="change-inviter-button"
                                                    >
                                                        Alterar
                                                    </BFButton>
                                                </div>
                                            </div>

                                            {/* Campo nome do convidado */}
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-1 block">
                                                    Nome do convidado *
                                                </label>
                                                <BFInput
                                                    placeholder="Nome do convidado"
                                                    value={guestName}
                                                    onChange={(value) => setGuestName(value)}
                                                    fullWidth
                                                    data-test="guest-name-input"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Botão adicionar convidado */}
                                <BFButton
                                    variant="primary"
                                    fullWidth
                                    onClick={() => handleAddParticipant()}
                                    disabled={addingParticipant || !selectedInviter || !guestName}
                                    data-test="add-guest-button"
                                >
                                    {addingParticipant ? 'Adicionando...' : 'Adicionar Convidado'}
                                </BFButton>
                            </>
                        ) : (
                            /* Modo Participante Cadastrado */
                            <>
                                {/* Campo de busca */}
                                <div className="relative">
                                    <BFInput
                                        placeholder="Digite o nome ou telefone..."
                                        value={searchTerm}
                                        onChange={(value) => setSearchTerm(value)}
                                        icon={<Search className="w-4 h-4" />}
                                        fullWidth
                                        data-test="search-player-input"
                                    />
                                </div>

                                {/* Resultados da busca */}
                                <div className="border border-border rounded-lg max-h-[300px] overflow-y-auto">
                                    {searchingPlayers ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                                            <p className="mt-2">Buscando participantes...</p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="divide-y divide-border">
                                            {searchResults.map((player) => (
                                                <button
                                                    key={player.id}
                                                    onClick={() => handleAddParticipant(player)}
                                                    disabled={addingParticipant}
                                                    className="w-full p-4 text-left hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    data-test={`player-result-${player.id}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{player.name}</p>
                                                            {player.phone && (
                                                                <p className="text-xs text-muted-foreground">{player.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchTerm.length >= 2 ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            <p>Nenhum participante encontrado</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground">
                                            <p>Digite pelo menos 2 caracteres para buscar</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

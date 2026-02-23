import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFIcons } from '../components/BF-Icons';
import { BFBadge } from '../components/BF-Badge';
import { bbqAPI } from '../lib/axios';
import { formatISODate } from '../lib/dateUtils';
import type { BBQResponseDto } from '../lib/types';
import { toast } from 'sonner';
import { BBQCreateModal } from '../components/BBQ-CreateModal';
import { Skeleton } from '../components/ui/skeleton';

interface ManageBBQProps {
    onSelectBBQ?: (id: string) => void;
}

export const ManageBBQ: React.FC<ManageBBQProps> = ({ onSelectBBQ }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bbqs, setBbqs] = useState<BBQResponseDto[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchBBQs();
    }, []);

    const fetchBBQs = async () => {
        try {
            setLoading(true);
            const response = await bbqAPI.getAllBBQs({ limit: 50 }); // Fetch more for the list
            setBbqs(response.bbqs || []);
        } catch (error: any) {
            console.error('Error fetching BBQs:', error);
            toast.error('Erro ao carregar lista de churrascos');
        } finally {
            setLoading(false);
        }
    };

    const handleBBQClick = (id: string) => {
        if (onSelectBBQ) {
            onSelectBBQ(id);
        } else {
            navigate(`/admin/bbq/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info', label: string }> = {
            'open': { variant: 'info', label: 'Aberto' },
            'closed': { variant: 'warning', label: 'Fechado' },
            'finished': { variant: 'success', label: 'Finalizado' },
            'cancelled': { variant: 'error', label: 'Cancelado' },
        };
        const config = statusMap[status] || { variant: 'info', label: status };
        return <BFBadge variant={config.variant} size="md">{config.label}</BFBadge>;
    };

    if (loading && bbqs.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                    <div className="w-full">
                        <Skeleton className="h-8 w-3/4 sm:w-64 mb-2" />
                        <Skeleton className="h-4 w-full sm:w-96" />
                    </div>
                    <Skeleton className="h-10 w-full sm:w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[220px] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-40 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
<<<<<<< HEAD
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                    <h1 className="text-2xl font-bold text-[--foreground]">Gerenciar Churrascos</h1>
                    <p className="text-[--muted-foreground]">Organize os eventos de churrasco da turma</p>
                </div>
                <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    <BFButton
                        variant="primary"
                        icon={<BFIcons.Plus size={20} />}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        Novo Churrasco
                    </BFButton>
                </div>
=======
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-[--foreground]">Gerenciar Churrascos</h1>
                    <p className="text-[--muted-foreground]">Organize os eventos de churrasco da turma</p>
                </div>
                <BFButton
                    variant="primary"
                    icon={<BFIcons.Plus size={20} />}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto justify-center"
                >
                    Novo Churrasco
                </BFButton>
>>>>>>> 99abb01b (fix responsiveness)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bbqs.length > 0 ? (
                    bbqs.map((bbq) => (
                        <div
                            key={bbq.id}
                            onClick={() => handleBBQClick(bbq.id)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-[var(--primary)]/10 p-3 rounded-lg text-[var(--primary)]">
                                        <BFIcons.Flame size={24} />
                                    </div>
                                    {getStatusBadge(bbq.status)}
                                </div>

                                <h3 className="text-lg font-bold text-[--foreground] mb-1">
                                    {formatISODate(bbq.date)}
                                </h3>

                                {bbq.description && (
                                    <p className="text-sm text-[--muted-foreground] line-clamp-2 mb-4">
                                        {bbq.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-[--muted-foreground] mt-4">
                                    <div className="flex items-center gap-1">
                                        <BFIcons.Users size={16} />
                                        <span>{bbq.participantCount} participantes</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--primary)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-[--muted-foreground]">
                        <BFIcons.AlertCircle size={48} className="mb-4 opacity-20" />
                        <p>Nenhum churrasco encontrado</p>
                    </div>
                )}
            </div>

            <BBQCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => {
                    fetchBBQs();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
};

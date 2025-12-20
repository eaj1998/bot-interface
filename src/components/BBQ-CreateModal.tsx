import React, { useState, useEffect } from 'react';
import { BFDateInput } from './BF-DateInput';
import { BFMoneyInput } from './BF-MoneyInput';
import { BFButton } from './BF-Button';
import { BFAlertMessage } from './BF-AlertMessage';
import { BFSelect } from './BF-Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import type { BBQ, Workspace, Chat } from '../lib/types';
import { workspacesAPI, chatsAPI } from '../lib/axios';

export interface BBQCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (bbq: Partial<BBQ> & { workspaceId?: string; chatId?: string }) => void;
    'data-test'?: string;
}

export const BBQCreateModal: React.FC<BBQCreateModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
    'data-test': dataTest = 'bbq-create-modal',
}) => {
    const [formData, setFormData] = useState({
        workspaceId: '',
        chatId: '',
        date: '',
        valuePerPerson: '',
        valueInCents: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);

    useEffect(() => {
        if (open) {
            fetchWorkspaces();
        }
    }, [open]);

    useEffect(() => {
        if (formData.workspaceId) {
            fetchChats(formData.workspaceId);
        } else {
            setChats([]);
            setFormData(prev => ({ ...prev, chatId: '' }));
        }
    }, [formData.workspaceId]);

    const fetchWorkspaces = async () => {
        try {
            const response = await workspacesAPI.getAllWorkspaces();
            setWorkspaces(response.workspaces || []);
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        }
    };

    const fetchChats = async (workspaceId: string) => {
        try {
            setLoadingChats(true);
            const response = await chatsAPI.getChatsByWorkspace(workspaceId);
            setChats(response.chats || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setChats([]);
        } finally {
            setLoadingChats(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate date
            if (!formData.date) {
                setError('Por favor, selecione uma data para o churrasco');
                setLoading(false);
                return;
            }

            // Create BBQ object
            const newBBQ: Partial<BBQ> & { workspaceId?: string; chatId?: string } = {
                workspaceId: formData.workspaceId || undefined,
                chatId: formData.chatId || undefined,
                date: formData.date,
                valuePerPerson: formData.valueInCents,
                status: 'open',
                participants: [],
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            onSuccess(newBBQ);

            // Reset form
            setFormData({
                workspaceId: '',
                chatId: '',
                date: '',
                valuePerPerson: '',
                valueInCents: 0,
            });
        } catch (err: any) {
            setError(err.message || 'Erro ao criar churrasco');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                workspaceId: '',
                chatId: '',
                date: '',
                valuePerPerson: '',
                valueInCents: 0,
            });
            setError(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md" data-test={dataTest}>
                <DialogHeader>
                    <DialogTitle>Criar Novo Churrasco</DialogTitle>
                    <DialogDescription>
                        Preencha as informações abaixo para criar um novo evento de churrasco
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                    {error && (
                        <BFAlertMessage variant="error" message={error} />
                    )}

                    <BFSelect
                        label="Workspace (opcional)"
                        options={workspaces.map(w => ({ value: w.id, label: w.name }))}
                        value={formData.workspaceId}
                        onChange={(val) => handleChange('workspaceId', val)}
                        placeholder="Selecione um workspace"
                        data-test={`${dataTest}-workspace`}
                    />

                    <BFSelect
                        label="Chat (opcional)"
                        options={chats.map(c => ({ value: c.chatId, label: c.name || c.chatId }))}
                        value={formData.chatId}
                        onChange={(val) => handleChange('chatId', val)}
                        placeholder={formData.workspaceId ? (loadingChats ? "Carregando..." : "Selecione um chat") : "Selecione um workspace primeiro"}
                        disabled={!formData.workspaceId || loadingChats}
                        data-test={`${dataTest}-chat`}
                    />

                    <BFDateInput
                        label="Data do Churrasco"
                        value={formData.date}
                        onChange={(val) => handleChange('date', val)}
                        fullWidth
                        required
                        helperText="Selecione a data do evento"
                        data-test={`${dataTest}-date`}
                    />

                    <BFMoneyInput
                        label="Valor por Pessoa (opcional)"
                        placeholder="0,00"
                        value={formData.valuePerPerson}
                        onChange={(val, cents) => {
                            setFormData(prev => ({ ...prev, valuePerPerson: val, valueInCents: cents }));
                            setError(null);
                        }}
                        showCentsPreview={false}
                        helperText="Deixe em branco se ainda não definido"
                        data-test={`${dataTest}-value`}
                    />

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <BFButton
                            variant="ghost"
                            onClick={handleClose}
                            type="button"
                            disabled={loading}
                            data-test={`${dataTest}-cancel`}
                        >
                            Cancelar
                        </BFButton>
                        <BFButton
                            variant="primary"
                            type="submit"
                            isLoading={loading}
                            data-test={`${dataTest}-submit`}
                        >
                            {loading ? 'Criando...' : 'Criar Churrasco'}
                        </BFButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

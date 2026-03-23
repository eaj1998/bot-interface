import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { workspacesAPI } from '../lib/axios';
import { useAuthContext } from '../contexts/AuthContext';

export const WorkspaceSettings: React.FC = () => {
    const { currentWorkspace, refreshUser } = useAuthContext();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [workspaceName, setWorkspaceName] = useState('');
    const [enablePriority, setEnablePriority] = useState(false);
    const [workspacePix, setWorkspacePix] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentWorkspace) {
            setWorkspaceName(currentWorkspace.name);
            setEnablePriority(currentWorkspace.settings?.enableMemberPriority ?? false);
            setWorkspacePix(currentWorkspace.settings?.pix ?? '');
        }
        setLoading(false);
    }, [currentWorkspace]);

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkspace?.id) return;
        try {
            setIsSaving(true);
            await workspacesAPI.updateWorkspace(currentWorkspace.id, {
                name: workspaceName,
                settings: {
                    ...currentWorkspace.settings,
                    enableMemberPriority: enablePriority,
                    pix: workspacePix,
                },
            });
            toast.success('Geral atualizado com sucesso!');
            await refreshUser();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar configurações gerais');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading && !currentWorkspace) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!currentWorkspace) {
        return <div className="p-4 sm:p-6">Nenhum workspace selecionado</div>;
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Configurações do Workspace</h1>
                <p className="text-muted-foreground">Gerencie todos os aspectos do seu grupo em um só lugar</p>
            </div>

            {/* General Settings */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Configurações Gerais</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Informações básicas do seu grupo e preferências de acesso.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="ws-name">Nome do Grupo</Label>
                            <BFInput
                                id="ws-name"
                                value={workspaceName}
                                onChange={(value) => setWorkspaceName(value)}
                                fullWidth
                                placeholder="Ex: Futebol de Quinta"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ws-pix">Chave Pix do Grupo (Mensalidades e Taxas do Bot)</Label>
                            <BFInput
                                id="ws-pix"
                                value={workspacePix}
                                onChange={(value) => setWorkspacePix(value)}
                                fullWidth
                                placeholder="Ex: 123.456.789-00 ou seu@email.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                Essa é a chave Pix usada para recebimento das mensalidades VIP pelo painel de controle.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 shadow-sm gap-4">
                            <div className="space-y-1">
                                <Label className="text-base">Prioridade para Mensalistas</Label>
                                <p className="text-sm text-muted-foreground">
                                    Bloqueia a entrada de jogadores avulsos na lista antes do dia do jogo.
                                </p>
                            </div>
                            <Switch
                                checked={enablePriority}
                                onCheckedChange={setEnablePriority}
                                className="self-start sm:self-auto"
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-muted-foreground text-xs">ID do Workspace</Label>
                            <BFInput
                                value={currentWorkspace.id}
                                disabled
                                readOnly
                                fullWidth
                                className="bg-muted/50 text-muted-foreground font-mono text-xs h-8"
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row justify-end border-t p-4 sm:p-6">
                    <BFButton
                        onClick={handleSaveGeneral}
                        disabled={isSaving || !workspaceName.trim()}
                        isLoading={isSaving}
                        icon={<Save size={16} />}
                        className="w-full sm:w-auto"
                    >
                        Salvar Geral
                    </BFButton>
                </CardFooter>
            </Card>

            {/* WhatsApp Groups Link */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Grupos do WhatsApp
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Gerencie e configure os grupos vinculados ao bot — horários, financeiro e regras de cada grupo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <BFButton
                        variant="secondary"
                        icon={<MessageSquare size={16} />}
                        onClick={() => navigate('../chats', { relative: 'path' })}
                        className="w-full sm:w-auto"
                    >
                        Gerenciar Grupos e Configurações
                    </BFButton>
                </CardContent>
            </Card>
        </div>
    );
};

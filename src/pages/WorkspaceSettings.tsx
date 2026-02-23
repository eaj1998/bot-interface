import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Save, MessageSquare, RefreshCw, Link as LinkIcon, Copy, Tag, Calendar, CircleDollarSign } from 'lucide-react';

import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFCard } from '../components/BF-Card';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { BFSelect } from '../components/BF-Select';
import { BFTimeInput } from '../components/BF-TimeInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { workspacesAPI, chatsAPI } from '../lib/axios';
import { useAuthContext } from '../contexts/AuthContext';
import type { Chat } from '../lib/types';

// --- SCHEMAS ---

// WhatsApp (Chat) Settings
const whatsappSchema = z.object({
    // General
    label: z.string().optional().or(z.literal('')),

    // Schedule
    weekday: z.coerce.number().min(0).max(6).optional(),
    time: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, "Horário inválido").optional().or(z.literal('')),
    title: z.string().optional(),

    // Rules
    allowGuests: z.boolean(),
    maxPlayersPerGame: z.coerce.number().min(1, "Mínimo 1 jogador").optional(),

    // Financials
    defaultPriceCents: z.number().min(0),
    pixKey: z.string().optional().or(z.literal('')),
});

type WhatsappValues = z.infer<typeof whatsappSchema>;

const weekdayOptions = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
];

// --- SUB-COMPONENT: CHAT SETTINGS FORM ---

interface ChatSettingsFormProps {
    chat: Chat;
    onUpdate: () => void;
}

const ChatSettingsForm: React.FC<ChatSettingsFormProps> = ({ chat, onUpdate }) => {
    const [saving, setSaving] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<WhatsappValues>({
        resolver: zodResolver(whatsappSchema) as any,
        defaultValues: {
            // General
            label: chat.label ?? '',

            // Schedule
            weekday: chat.schedule?.weekday,
            time: chat.schedule?.time ?? '20:00',
            title: chat.schedule?.title ?? '',

            // Rules
            allowGuests: chat.settings?.allowGuests ?? true,
            maxPlayersPerGame: chat.settings?.maxPlayersPerGame ?? 14,

            // Financials
            defaultPriceCents: chat.financials?.defaultPriceCents ?? 0,
            pixKey: chat.financials?.pixKey ?? '',
        }
    });

    // Reset form when chat changes (e.g., if re-fetched)
    useEffect(() => {
        reset({
            label: chat.label ?? '',
            weekday: chat.schedule?.weekday,
            time: chat.schedule?.time ?? '20:00',
            title: chat.schedule?.title ?? '',
            allowGuests: chat.settings?.allowGuests ?? true,
            maxPlayersPerGame: chat.settings?.maxPlayersPerGame ?? 14,
            defaultPriceCents: chat.financials?.defaultPriceCents ?? 0,
            pixKey: chat.financials?.pixKey ?? '',
        });
    }, [chat, reset]);

    const onSubmit = async (data: WhatsappValues) => {
        try {
            setSaving(true);
            await chatsAPI.updateChat(chat.id, {
                label: data.label,
                settings: {
                    allowGuests: data.allowGuests,
                    maxPlayersPerGame: data.maxPlayersPerGame,
                },
                financials: {
                    defaultPriceCents: data.defaultPriceCents,
                    pixKey: data.pixKey,
                },
                schedule: {
                    weekday: data.weekday,
                    time: data.time,
                    title: data.title,
                }
            });
            toast.success(`Configurações de "${chat.name || 'Chat'}" atualizadas!`);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar configurações do chat');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 w-full overflow-hidden sm:overflow-visible">
            {/* Section: General */}
<<<<<<< HEAD
            <div className="space-y-4 w-full">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    🏷️ Identificação
=======
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag size={16} /> Identificação
>>>>>>> 99abb01b (fix responsiveness)
                </h3>
                <div className="space-y-2">
                    <Label>Label do Chat</Label>
                    <Controller
                        name="label"
                        control={control}
                        render={({ field }) => (
                            <BFInput {...field} placeholder="Ex: Pelada da Quinta" fullWidth />
                        )}
                    />
                    <p className="text-xs text-muted-foreground break-words">
                        Nome amigável para identificar este chat no painel
                    </p>
                </div>
            </div>

            {/* Section: Schedule */}
<<<<<<< HEAD
            <div className="space-y-4 pt-4 border-t border-border w-full">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    📅 Agendamento Padrão
=======
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={16} /> Agendamento Padrão
>>>>>>> 99abb01b (fix responsiveness)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2 w-full max-w-full overflow-hidden">
                        <Label>Dia da Semana</Label>
                        <Controller
                            name="weekday"
                            control={control}
                            render={({ field }) => (
                                <BFSelect
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    options={weekdayOptions}
                                    placeholder="Selecione..."
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full max-w-full overflow-hidden">
                        <Label>Horário</Label>
                        <Controller
                            name="time"
                            control={control}
                            render={({ field }) => (
                                <BFTimeInput
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2 w-full max-w-full overflow-hidden">
                        <Label>Título Padrão da Lista</Label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <BFInput {...field} placeholder="Ex: ⚽ FUTEBOL DE QUARTA" fullWidth />
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Section: Financials */}
<<<<<<< HEAD
            <div className="space-y-4 pt-4 border-t border-border w-full">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    💰 Financeiro (Bot)
=======
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <CircleDollarSign size={16} /> Financeiro (Bot)
>>>>>>> 99abb01b (fix responsiveness)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2 w-full max-w-full overflow-hidden">
                        <Label>Valor Padrão do Jogo</Label>
                        <Controller
                            name="defaultPriceCents"
                            control={control}
                            render={({ field }) => (
                                <BFMoneyInput
                                    value={field.value ? (field.value / 100).toFixed(2).replace('.', ',') : ''}
                                    onChange={(_, cents) => field.onChange(cents)}
                                    placeholder="0,00"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full max-w-full overflow-hidden">
                        <Label>Chave Pix (Bot)</Label>
                        <Controller
                            name="pixKey"
                            control={control}
                            render={({ field }) => (
                                <BFInput {...field} placeholder="Chave Pix para pagamentos no bot" fullWidth />
                            )}
                        />
                    </div>
                </div>
            </div>

<<<<<<< HEAD
            {/* Section: Rules */}
            <div className="space-y-4 pt-4 border-t border-border w-full">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    ⚖️ Regras
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2 w-full max-w-full overflow-hidden">
                        <Label>Máximo de Jogadores</Label>
                        <Controller
                            name="maxPlayersPerGame"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    {...field}
                                    type="number"
                                    min={1}
                                    placeholder="Ex: 14"
                                    fullWidth
                                />
                            )}
                        />
                        <p className="text-xs text-muted-foreground break-words">
                            Número máximo de jogadores por jogo (ex: 14 para 7x7)
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-border mt-6 w-full">
                <BFButton type="submit" disabled={saving} icon={<Save size={16} />} className="w-full sm:w-auto">
=======
            <div className="flex justify-end pt-4 border-t border-border">
                <BFButton type="submit" disabled={saving} isLoading={saving} icon={<Save size={16} />}>
>>>>>>> 99abb01b (fix responsiveness)
                    Salvar Configurações deste Chat
                </BFButton>
            </div>
        </form>
    );
};

// --- MAIN COMPONENT ---

export const WorkspaceSettings: React.FC = () => {
    // Auth Context
    const { currentWorkspace, refreshUser } = useAuthContext();

    // States
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState<Chat[]>([]);

    // General Tab States
    const [workspaceName, setWorkspaceName] = useState('');
    const [enablePriority, setEnablePriority] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Chats Logic
    const fetchChats = async () => {
        try {
            setLoading(true);
            const chatsResponse = await chatsAPI.getChatsByWorkspace();
            // @ts-ignore
            const chatsList = Array.isArray(chatsResponse) ? chatsResponse : (chatsResponse.chats || []);
            setChats(chatsList);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar chats');
        } finally {
            setLoading(false);
        }
    };

    // Populate General Settings when currentWorkspace changes
    useEffect(() => {
        if (currentWorkspace) {
            setWorkspaceName(currentWorkspace.name);
            setEnablePriority(currentWorkspace.settings?.enableMemberPriority ?? false);
        }
        fetchChats();
    }, [currentWorkspace]);

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentWorkspace?.id) return;

        try {
            setIsSaving(true);
            await workspacesAPI.updateWorkspace(currentWorkspace.id, {
                name: workspaceName,
                settings: {
                    // Start basic settings if null
                    ...currentWorkspace.settings,
                    enableMemberPriority: enablePriority
                }
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
<<<<<<< HEAD
        <div className="max-w-5xl mx-auto w-full space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Configurações do Workspace</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Gerencie todos os aspectos do seu grupo em um só lugar</p>
=======
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Configurações do Workspace</h1>
                <p className="text-muted-foreground">Gerencie todos os aspectos do seu grupo em um só lugar</p>
>>>>>>> 99abb01b (fix responsiveness)
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 w-full h-auto flex flex-col sm:flex-row p-1 gap-1">
                    <TabsTrigger value="general" className="w-full">Geral</TabsTrigger>
                    <TabsTrigger value="whatsapp" className="w-full">Configurações do Bot</TabsTrigger>
                </TabsList>

                {/* 1. GENERAL TAB */}
                <TabsContent value="general" className="mt-0">
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
                </TabsContent>

                {/* 2. WHATSAPP TAB */}
<<<<<<< HEAD
                <TabsContent value="whatsapp" className="w-full mt-0">
                    <BFCard className="p-4 sm:p-6 w-full shadow-sm max-w-full overflow-hidden">
                        <div className="mb-6 space-y-1">
                            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap">
                                <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="break-words">Chats Vinculados</span>
=======
                <TabsContent value="whatsapp">
                    <BFCard className="p-4 sm:p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Chats Vinculados
>>>>>>> 99abb01b (fix responsiveness)
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground break-words pr-2">
                                Configure as regras e agendamento para cada grupo vinculado ao bot.
                            </p>
                        </div>

                        <Alert className="mb-6 bg-primary/5 border-primary/20 overflow-hidden">
                            <LinkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            <AlertTitle className="text-primary font-semibold text-sm sm:text-base break-words">Vincular novo grupo</AlertTitle>
                            <AlertDescription className="mt-2 text-muted-foreground text-xs sm:text-sm">
                                <div className="break-words">
                                    Para adicionar um novo grupo de pelada a este painel financeiro, adicione nosso bot no seu grupo do WhatsApp e digite o seguinte comando:
                                </div>

<<<<<<< HEAD
                                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                    <div className="flex-1 bg-muted rounded p-2 min-w-0 max-w-full overflow-x-auto">
                                        <code className="block font-mono text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                                            /bind {currentWorkspace.id}
                                        </code>
                                    </div>
                                    <BFButton
                                        variant="secondary"
                                        className="hover:bg-muted/80 w-full sm:w-auto flex-shrink-0"
=======
                                <div className="mt-3 flex flex-wrap sm:flex-nowrap items-center gap-2">
                                    <code className="relative rounded bg-muted px-[0.5rem] py-[0.5rem] font-mono text-sm font-semibold text-foreground break-all">
                                        /bind {currentWorkspace.id}
                                    </code>
                                    <BFButton
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-muted/80 shrink-0"
>>>>>>> 99abb01b (fix responsiveness)
                                        onClick={() => {
                                            navigator.clipboard.writeText(`/bind ${currentWorkspace.id}`);
                                            toast.success('Comando copiado!');
                                        }}
                                        title="Copiar comando"
                                        icon={<Copy className="h-4 w-4" />}
                                    >
                                        Copiar
                                    </BFButton>
                                </div>
                            </AlertDescription>
                        </Alert>

                        {chats.length === 0 ? (
                            <div className="p-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-foreground font-medium">Nenhum chat vinculado a este workspace.</p>
                                <p className="text-sm text-muted-foreground mt-1">Use o comando /bind no WhatsApp para vincular.</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {chats.map((chat) => (
                                    <AccordionItem key={chat.id} value={chat.id} className="border-border">
                                        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-4 rounded-lg">
                                            <div className="flex items-center gap-3 text-left w-full">
                                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                                    <MessageSquare size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-foreground break-words whitespace-normal text-sm sm:text-base">
                                                        {chat.schedule?.title || chat.name || 'Chat sem nome'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-normal break-words whitespace-normal mt-0.5">
                                                        {chat.schedule?.time ? `Agendado: ${chat.schedule.time}` : 'Sem agendamento'} • {chat.chatId}
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-2 sm:px-4 pb-4 w-full max-w-full overflow-hidden">
                                            <ChatSettingsForm chat={chat} onUpdate={fetchChats} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </BFCard>
                </TabsContent>
            </Tabs>
        </div>
    );
};

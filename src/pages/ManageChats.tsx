import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  RefreshCw,
  CheckCircle,
  Link as LinkIcon,
  Copy,
  Settings2,
  Save,
  Tag,
  Calendar,
  CircleDollarSign,
} from 'lucide-react';

import { BFButton } from '../components/BF-Button';
import { BFCard } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFInput } from '../components/BF-Input';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFSelect } from '../components/BF-Select';
import { BFTimeInput } from '../components/BF-TimeInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { chatsAPI } from '../lib/axios';
import type { Chat } from '../lib/types';

// --- SCHEMA ---

const chatSchema = z.object({
  label: z.string().optional().or(z.literal('')),
  weekday: z.coerce.number().min(0).max(6).optional(),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, 'Horário inválido').optional().or(z.literal('')),
  title: z.string().optional(),
  allowGuests: z.boolean(),
  maxPlayersPerGame: z.coerce.number().min(1, 'Mínimo 1 jogador').optional(),
  defaultPriceCents: z.number().min(0),
  pixKey: z.string().optional().or(z.literal('')),
});

type ChatFormValues = z.infer<typeof chatSchema>;

const weekdayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

// --- INLINE CHAT SETTINGS FORM ---

interface ChatSettingsFormProps {
  chat: Chat;
  onUpdate: () => void;
}

const ChatSettingsForm: React.FC<ChatSettingsFormProps> = ({ chat, onUpdate }) => {
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset } = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema) as any,
    defaultValues: {
      label: chat.label ?? '',
      weekday: chat.schedule?.weekday,
      time: chat.schedule?.time ?? '20:00',
      title: chat.schedule?.title ?? '',
      allowGuests: chat.settings?.allowGuests ?? true,
      maxPlayersPerGame: chat.settings?.maxPlayersPerGame ?? 14,
      defaultPriceCents: chat.financials?.defaultPriceCents ?? 0,
      pixKey: chat.financials?.pixKey ?? '',
    },
  });

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

  const onSubmit = async (data: ChatFormValues) => {
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
        },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4 w-full">
      {/* Identificação */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Tag size={14} /> Identificação
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
          <p className="text-xs text-muted-foreground">Nome amigável para identificar este chat no painel</p>
        </div>
      </div>

      {/* Agendamento */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Calendar size={14} /> Agendamento Padrão
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Horário</Label>
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <BFTimeInput value={field.value || ''} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
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

      {/* Financeiro */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <CircleDollarSign size={14} /> Financeiro (Bot)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
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

      {/* Regras */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Tag size={14} /> Regras
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Máximo de Jogadores</Label>
            <Controller
              name="maxPlayersPerGame"
              control={control}
              render={({ field }) => (
                <BFInput {...field} type="number" min={1} placeholder="Ex: 14" fullWidth />
              )}
            />
            <p className="text-xs text-muted-foreground">Número máximo de jogadores por jogo (ex: 14 para 7x7)</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <BFButton type="submit" disabled={saving} isLoading={saving} icon={<Save size={16} />}>
          Salvar Configurações
        </BFButton>
      </div>
    </form>
  );
};

// --- MAIN COMPONENT ---

export const ManageChats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);

  // Bind Modal State
  const [showBindModal, setShowBindModal] = useState(false);

  useEffect(() => {
    const wsId = localStorage.getItem('workspaceId');
    if (wsId) {
      setCurrentWorkspaceId(wsId);
      fetchChats();
    } else {
      setLoading(false);
      toast.error('Nenhum workspace selecionado');
    }
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await chatsAPI.getChatsByWorkspace();
      const list = Array.isArray(data) ? data : (data.chats || []);
      setChats(list);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar chats');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (chat: Chat) => {
    const newStatus = chat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: newStatus } : c));
      if (newStatus === 'ACTIVE') {
        await chatsAPI.activateChat(chat.id);
        toast.success('Chat ativado com sucesso');
      } else {
        await chatsAPI.deactivateChat(chat.id);
        toast.success('Chat desativado com sucesso');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao alterar status do chat');
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: chat.status } : c));
    }
  };

  const toggleExpand = (chatId: string) => {
    setExpandedChatId(prev => (prev === chatId ? null : chatId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Chats</h1>
          <p className="text-muted-foreground">Grupos de WhatsApp vinculados a este workspace</p>
        </div>
        <BFButton
          onClick={() => setShowBindModal(true)}
          icon={<Plus size={16} />}
          className="w-full sm:w-auto"
        >
          Vincular Novo Grupo
        </BFButton>
      </div>

      {chats.length > 0 && (
        <p className="text-sm text-muted-foreground mb-6">
          Clique em <strong>Configurar</strong> para ajustar horários, financeiro e regras de cada grupo.
        </p>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border mt-6">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum grupo vinculado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
            Para começar, use o comando <code>!bind</code> no grupo do WhatsApp ou adicione manualmente.
          </p>
          <BFButton variant="secondary" onClick={() => setShowBindModal(true)}>
            Vincular Agora
          </BFButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => {
            const isExpanded = expandedChatId === chat.id;
            return (
              <BFCard
                key={chat.id}
                className={`flex flex-col transition-all duration-200 ${isExpanded ? 'border-l-4 border-l-primary md:col-span-2 lg:col-span-3' : 'hover:border-primary/50'}`}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={chat.status === 'ACTIVE'}
                        onCheckedChange={() => handleToggleStatus(chat)}
                        className="cursor-pointer"
                      />
                      <BFBadge variant={chat.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {chat.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </BFBadge>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1" title={chat.schedule?.title || chat.name}>
                    {chat.schedule?.title || chat.name || 'Chat sem nome'}
                  </h3>
                  {chat.label && (
                    <p className="text-xs font-medium text-primary mb-1 truncate" title={`Label: ${chat.label}`}>
                      {chat.label}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono mb-4 truncate" title={chat.chatId}>
                    {chat.chatId}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle size={14} className="mr-2 text-green-500" />
                      Bot Conectado
                    </div>
                    <BFButton
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleExpand(chat.id)}
                      icon={<Settings2 size={14} />}
                      className="min-h-[44px] sm:min-h-0"
                    >
                      Configurar
                    </BFButton>
                  </div>
                </div>

                {/* Inline Settings Form */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-border">
                    <ChatSettingsForm chat={chat} onUpdate={fetchChats} />
                  </div>
                )}
              </BFCard>
            );
          })}
        </div>
      )}

      {/* Bind Modal */}
      <Dialog open={showBindModal} onOpenChange={setShowBindModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Vincular novo grupo
            </DialogTitle>
            <DialogDescription>
              Para adicionar um novo grupo de pelada a este painel financeiro, adicione nosso bot no seu grupo do WhatsApp e digite o seguinte comando:
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
              <code className="flex-1 font-mono text-sm font-semibold text-foreground break-all">
                /bind {currentWorkspaceId}
              </code>
              <BFButton
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0"
                onClick={() => {
                  navigator.clipboard.writeText(`/bind ${currentWorkspaceId}`);
                  toast.success('Comando copiado!');
                }}
                icon={<Copy className="h-4 w-4" />}
              >
                Copiar
              </BFButton>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Após executar o comando no WhatsApp, o grupo será automaticamente vinculado a este workspace.
            </p>
          </div>

          <DialogFooter>
            <BFButton variant="primary" onClick={() => setShowBindModal(false)}>Fechar</BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageChats;

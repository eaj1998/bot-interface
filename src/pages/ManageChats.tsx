import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  RefreshCw,
  CheckCircle,
  Link as LinkIcon,
  Copy
} from 'lucide-react';

import { BFButton } from '../components/BF-Button';
import { BFCard } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { chatsAPI } from '../lib/axios';
import type { Chat } from '../lib/types';

import { Switch } from '../components/ui/switch';

export const ManageChats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

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
      // Ensure compatibility if API returns object with data property or array directly
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
      // Optimistic update
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
      // Revert optimistic update
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: chat.status } : c));
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Chats</h1>
          <p className="text-muted-foreground">Grupos de WhatsApp vinculados a este workspace</p>
        </div>
        <BFButton
          onClick={() => setShowBindModal(true)}
          icon={<Plus size={16} />}
        >
          Vincular Novo Grupo
        </BFButton>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
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
          {chats.map((chat) => (
            <BFCard key={chat.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="p-6 flex-1">
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

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle size={14} className="mr-2 text-green-500" />
                    Bot Conectado
                  </div>
                  {/* Add more stats here if available */}
                </div>
              </div>

              {/* Configure button removed as settings are now centralized in Workspace Settings */}
            </BFCard>
          ))}
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
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
              <code className="flex-1 font-mono text-sm font-semibold text-foreground">
                /bind {currentWorkspaceId}
              </code>
              <BFButton
                variant="ghost"
                size="sm"
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

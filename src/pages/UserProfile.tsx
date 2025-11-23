/**
 * User Profile Page
 * Página de perfil do usuário
 */

import React, { useState } from 'react';
import { useAuth } from '../components/ProtectedRoute';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFIcons } from '../components/BF-Icons';
import { playersAPI } from '../lib/axios';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    isGoalkeeper: user?.isGoalkeeper || false,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await playersAPI.updatePlayer(formData.name, formData.isGoalkeeper);
      
      const updatedUserData = response.data || response;
      updateUser({
        ...user,
        name: updatedUserData.name || formData.name,
        isGoalkeeper: updatedUserData.isGoalkeeper ?? formData.isGoalkeeper,
      });
      
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      isGoalkeeper: user?.isGoalkeeper || false,
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6 max-w-4xl" data-test="user-profile">
      {/* Header com saudação */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 dark:text-white mb-2">Olá, {user?.name || 'Usuário'}! 👋</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas informações pessoais
            </p>
          </div>
          
          {!isEditing && (
            <BFButton
              variant="outline"
              size="md"
              icon={<BFIcons.Edit size={16} />}
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </BFButton>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-1 mt-0.5">
              <BFIcons.CheckCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-green-700 dark:text-green-400 font-semibold text-sm mb-1">Tudo certo!</h4>
              <p className="text-green-600 dark:text-green-300 text-sm">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <BFIcons.X size={16} />
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-1 mt-0.5">
              <BFIcons.AlertCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-700 dark:text-red-400 font-semibold text-sm mb-1">Ops! Algo deu errado</h4>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <BFIcons.X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <BFCard variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Seção: Informações Pessoais */}
          <div>
            <h3 className="text-base font-medium text-[--foreground] mb-4 pb-2 border-b border-[--border]">
              Informações Pessoais
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[--foreground] mb-2">
                  Nome Completo {isEditing && <span className="text-[--destructive]">*</span>}
                </label>
                {isEditing ? (
                  <div className="[&_input]:bg-white [&_input]:dark:bg-gray-800 [&_input]:text-gray-900 [&_input]:dark:text-white">
                    <BFInput
                      value={formData.name}
                      onChange={(value) => setFormData({ ...formData, name: value })}
                      placeholder="Digite seu nome completo"
                      disabled={loading}
                      fullWidth
                    />
                  </div>
                ) : (
                  <div className="px-4 py-2.5 bg-[--accent] rounded-lg">
                    <p className="text-[--foreground]">{user?.name || 'Não informado'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[--foreground] mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <div className="px-4 py-2.5 bg-[--muted]/20 rounded-lg border border-[--border]/50">
                    <p className="text-[--muted-foreground]">
                      {user?.phone 
                        ? user.phone.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4')
                        : 'Não informado'}
                    </p>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <BFIcons.Lock size={14} className="text-[--muted-foreground]" />
                  </div>
                </div>
                <p className="text-xs text-[--muted-foreground] mt-1.5">
                  Telefone não pode ser alterado
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Preferências de Jogo */}
          <div>
            <h3 className="text-base font-medium text-[--foreground] mb-4 pb-2 border-b border-[--border]">
              Preferências de Jogo
            </h3>
            
            <div className="space-y-4">
              <div className={`
                p-4 rounded-lg border transition-colors
                ${isEditing 
                  ? 'bg-[--accent] border-[--border] hover:border-[--primary]/50' 
                  : 'bg-[--muted]/10 border-[--border]/50'
                }
                ${!isEditing && 'opacity-75'}
              `}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGoalkeeper}
                    onChange={(e) => setFormData({ ...formData, isGoalkeeper: e.target.checked })}
                    disabled={!isEditing || loading}
                    className="w-5 h-5 mt-0.5 rounded border-[--border] text-[--primary] focus:ring-[--primary] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[--foreground] block mb-1">
                      Sou goleiro
                    </span>
                    <span className="text-xs text-[--muted-foreground]">
                      Marque esta opção se você prefere jogar como goleiro
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>         

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-[--border]">
              <BFButton
                variant="outline"
                size="md"
                onClick={handleCancel}
                disabled={loading}
                icon={<BFIcons.X size={16} />}
                fullWidth
              >
                Cancelar
              </BFButton>
              <BFButton
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={loading || !formData.name.trim()}
                icon={loading ? undefined : <BFIcons.CheckCircle size={16} />}
                fullWidth
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </BFButton>
            </div>
          )}
        </div>
      </BFCard>
    </div>
  );
};

export default UserProfile;

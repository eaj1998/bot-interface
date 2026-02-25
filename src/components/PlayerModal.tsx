import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BFInput } from './BF-Input';
import { BFButton } from './BF-Button';
import type { Player } from '../lib/types';

const editPlayerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido: (99) 9999-9999 ou (99) 99999-9999'),
    nick: z.string().optional(),
    position: z.enum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'STRIKER']).optional(),
    status: z.enum(['active', 'inactive', 'suspended']),
    role: z.enum(['admin', 'user']).optional(),
    mainPosition: z.enum(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']),
    rating: z.union([z.string(), z.number()]).refine((val) => {
        const n = Number(val);
        return !isNaN(n) && n >= 0 && n <= 5;
    }, { message: 'Nota deve ser entre 0 e 5' }),
    dominantFoot: z.enum(['RIGHT', 'LEFT', 'BOTH']),
});

type EditPlayerFormData = z.infer<typeof editPlayerSchema>;

interface PlayerModalProps {
    player?: Player | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (playerData: any) => Promise<void>;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
    player,
    isOpen,
    onClose,
    onSave,
}) => {
    const [isSaving, setIsSaving] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        control
    } = useForm<EditPlayerFormData>({
        resolver: zodResolver(editPlayerSchema),
        defaultValues: {
            name: '',
            phone: '',
            nick: '',
            status: 'active',
            role: 'user',
            mainPosition: 'MEI',
            rating: 3.0,
            dominantFoot: 'RIGHT',
        }
    });

    useEffect(() => {
        if (player) {
            reset({
                name: player.name || '',
                phone: formatPhoneDisplay(player.phone || ''),
                nick: player.nick || '',
                position: player.position as any,
                status: player.status || 'active',
                role: ((player.role as string)?.toLowerCase() === 'admin' ? 'admin' : 'user'),
                mainPosition: (player.profile?.mainPosition as any) || 'MEI',
                rating: player.profile?.rating ?? 3.0,
                dominantFoot: (player.profile?.dominantFoot as any) || 'RIGHT',
            });
        } else {
            reset({
                name: '',
                phone: '',
                nick: '',
                status: 'active',
                role: 'user',
                mainPosition: 'MEI',
                rating: 3.0,
                dominantFoot: 'RIGHT',
            });
        }
    }, [player, reset, isOpen]);

    const formatPhoneInput = (value: string) => {
        let digits = value.replace(/\D/g, '');
        if (digits.length > 11) digits = digits.slice(0, 11);

        if (digits.length <= 2) return digits;

        // If we have more than 10 digits, use 5-4 format (mobile)
        if (digits.length > 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        }

        // Otherwise use 4-4 format (landline/legacy)
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    };

    const formatPhoneDisplay = (phone: string) => {
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

    const onSubmit = async (data: EditPlayerFormData) => {
        try {
            setIsSaving(true);
            await onSave({
                name: data.name,
                phone: data.phone,
                nick: data.nick,
                status: data.status,
                role: data.role,
                position: data.position,
                profile: {
                    ...(player?.profile || {}),
                    mainPosition: data.mainPosition,
                    rating: Number(data.rating),
                    dominantFoot: data.dominantFoot,
                }
            });
            onClose();
        } catch (error) {
            console.error('Error saving player:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{player ? 'Editar Jogador' : 'Novo Jogador'}</DialogTitle>
                    <DialogDescription>
                        {player ? 'Atualize as informações do jogador' : 'Cadastre as informações do novo jogador'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome *</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    placeholder="Nome completo"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={errors.name?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone (WhatsApp) *</label>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    placeholder="(99) 99999-9999"
                                    value={field.value || ''}
                                    onChange={(value) => {
                                        const formatted = formatPhoneInput(value);
                                        field.onChange(formatted);
                                    }}
                                    error={errors.phone?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    {/* Apelido */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Apelido</label>
                        <Controller
                            name="nick"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    placeholder="Apelido (opcional)"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    {/* Perfil Técnico */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-semibold">Perfil Técnico (FairPlay)</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Posição Principal */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Posição Principal</label>
                                <Controller
                                    name="mainPosition"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GOL">Goleiro</SelectItem>
                                                <SelectItem value="ZAG">Zagueiro</SelectItem>
                                                <SelectItem value="LAT">Lateral</SelectItem>
                                                <SelectItem value="MEI">Meio-Campo</SelectItem>
                                                <SelectItem value="ATA">Atacante</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Pé Dominante */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pé Dominante</label>
                                <Controller
                                    name="dominantFoot"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RIGHT">Destro</SelectItem>
                                                <SelectItem value="LEFT">Canhoto</SelectItem>
                                                <SelectItem value="BOTH">Ambidestro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Nota */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nota Inicial (0-5)</label>
                            <Controller
                                name="rating"
                                control={control}
                                render={({ field }) => (
                                    <BFInput
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={field.value}
                                        onChange={field.onChange}
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                    </div>
                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status *</label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value: any) => setValue('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                                <SelectItem value="suspended">Suspenso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Permissão *</label>
                        <Select
                            value={watch('role')}
                            onValueChange={(value: any) => setValue('role', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a permissão" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Jogador</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Administradores têm acesso total ao painel deste grupo.
                        </p>
                    </div>

                    <DialogFooter>
                        <BFButton
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </BFButton>
                        <BFButton type="submit" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : (player ? 'Salvar alterações' : 'Criar Jogador')}
                        </BFButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

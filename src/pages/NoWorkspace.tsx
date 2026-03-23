import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import {
    LogOut,
    CheckCircle2,
    Copy,
    Check,
    Loader2,
    Smartphone,
    Terminal,
    ArrowRight,
    Sparkles,
    User,
    Settings,
    Calendar,
    Clock,
    CircleDollarSign,
    KeyRound,
    Users,
    ChevronRight,
    SkipForward,
} from 'lucide-react';
import { createWorkspace, CreatedWorkspace } from '@/services/workspace.service';
import { authAPI, tokenService, workspacesAPI, chatsAPI } from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'profile' | 'form' | 'configure' | 'success';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const looksLikePhone = (name: string) =>
    /^\+?\d[\d\s\-().]{6,}$/.test(name?.trim() ?? '');

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

const formatCents = (cents: string): string => {
    const num = cents.replace(/\D/g, '');
    if (!num) return '';
    const value = parseInt(num) / 100;
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCentsFromInput = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    return digits ? parseInt(digits) : 0;
};

const weekdayOptions = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
];

// ─── Step Indicator ──────────────────────────────────────────────────────────
const STEPS: { key: Step; label: string }[] = [
    { key: 'profile', label: 'Perfil' },
    { key: 'form', label: 'Grupo' },
    { key: 'success', label: 'Ativar' },
    { key: 'configure', label: 'Configurar' },
];

const StepIndicator: React.FC<{ current: Step }> = ({ current }) => {
    const currentIndex = STEPS.findIndex((s) => s.key === current);

    return (
        <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((s, i) => {
                const isPast = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                    isPast
                                        ? 'bg-primary'
                                        : isCurrent
                                        ? 'bg-primary ring-4 ring-primary/20 h-3 w-3'
                                        : 'bg-muted-foreground/30'
                                }`}
                            />
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`h-px w-8 transition-all duration-300 ${
                                    isPast ? 'bg-primary' : 'bg-muted-foreground/20'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────
const NoWorkspace: React.FC = () => {
    const { signOut, refreshUser, user, updateUser } = useAuth();
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────────
    const [step, setStep] = useState<Step>('profile');
    const [displayName, setDisplayName] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceSlug, setWorkspaceSlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);
    const [createdWorkspace, setCreatedWorkspace] = useState<CreatedWorkspace | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Config step state ──────────────────────────────────────────────────────
    const [weekday, setWeekday] = useState('5'); // Friday
    const [gameTime, setGameTime] = useState('20:00');
    const [gameTitle, setGameTitle] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('14');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [pixKey, setPixKey] = useState('');

    // ── Init: skip profile step if user already has a real name ────────────────
    useEffect(() => {
        if (step === 'profile' && user && !looksLikePhone(user.name) && user.name?.trim()) {
            setStep('form');
        }
    }, [user]);

    // ── Derived ────────────────────────────────────────────────────────────────
    const bindCommand = createdWorkspace
        ? `/bind ${createdWorkspace.slug || createdWorkspace.id}`
        : '';

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setWorkspaceName(name);
        if (!slugEdited) setWorkspaceSlug(toSlug(name));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        setWorkspaceSlug(toSlug(e.target.value));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setPriceDisplay(raw ? formatCents(raw) : '');
    };

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const updatedProfile = await authAPI.updateAuthProfile({ name: displayName.trim() });

            const stored = tokenService.getUser();
            const merged = {
                ...(stored ?? {}),
                ...(updatedProfile ?? {}),
                name: displayName.trim(),
            };
            tokenService.setUser(merged);
            updateUser(merged as any);

            setStep('form');
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Erro ao salvar o nome. Tente novamente.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const workspace = await createWorkspace({
                name: workspaceName.trim(),
                slug: workspaceSlug || undefined,
            });
            setCreatedWorkspace(workspace);
            setStep('success');
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Ocorreu um erro ao criar o workspace. Tente novamente.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveConfig = async (skip = false) => {
        setIsSubmitting(true);
        setError(null);

        if (!skip && createdWorkspace) {
            try {
                const priceCents = parseCentsFromInput(priceDisplay.replace(/\./g, '').replace(',', ''));

                await workspacesAPI.updateWorkspace(createdWorkspace.id, {
                    settings: {
                        ...(maxPlayers ? { maxPlayers: parseInt(maxPlayers) } : {}),
                        ...(priceCents > 0 ? { pricePerGameCents: priceCents } : {}),
                        ...(pixKey.trim() ? { pix: pixKey.trim() } : {}),
                    },
                });
            } catch {
                // Don't block on workspace update failure
            }

            try {
                const chatsData = await chatsAPI.getChatsByWorkspace();
                const chats = Array.isArray(chatsData) ? chatsData : (chatsData.chats ?? []);
                if (chats.length > 0) {
                    const priceCents = parseCentsFromInput(priceDisplay.replace(/\./g, '').replace(',', ''));
                    await chatsAPI.updateChat(chats[0].id, {
                        schedule: {
                            weekday: parseInt(weekday),
                            time: gameTime,
                            ...(gameTitle.trim() ? { title: gameTitle.trim() } : {}),
                            ...(priceCents > 0 ? { priceCents } : {}),
                            ...(pixKey.trim() ? { pix: pixKey.trim() } : {}),
                        },
                        settings: {
                            ...(maxPlayers ? { maxPlayersPerGame: parseInt(maxPlayers) } : {}),
                        },
                        financials: {
                            ...(priceCents > 0 ? { defaultPriceCents: priceCents } : {}),
                            ...(pixKey.trim() ? { pixKey: pixKey.trim() } : {}),
                        },
                    });
                }
            } catch {
                // Don't block on chat update failure
            }
        }

        setIsSubmitting(false);
        const role = (user?.role || '').toLowerCase();
        navigate(role === 'admin' || role === 'owner' ? '/admin/dashboard' : '/user/dashboard');
    };

    const handleCopyCommand = async () => {
        try {
            await navigator.clipboard.writeText(bindCommand);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = bindCommand;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    const handleFinish = async () => {
        setIsFinishing(true);
        try {
            await refreshUser();
        } catch {
            // Proceed even if refresh fails
        } finally {
            setIsFinishing(false);
        }
        setStep('configure');
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // ── Render: Profile Step ───────────────────────────────────────────────────
    if (step === 'profile') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    <StepIndicator current="profile" />

                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo! 👋</h1>
                            <p className="text-muted-foreground text-sm">
                                Antes de começar, como você quer ser chamado?
                            </p>
                        </div>
                    </div>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Seu nome</CardTitle>
                            <CardDescription>
                                Este nome aparecerá para os outros membros do grupo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveName} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="display-name">Nome completo</Label>
                                    <Input
                                        id="display-name"
                                        placeholder="Ex: João Silva"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        disabled={isSubmitting}
                                        autoFocus
                                        maxLength={60}
                                    />
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !displayName.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            Continuar
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair da conta
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render: Form Step ──────────────────────────────────────────────────────
    if (step === 'form') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    <StepIndicator current="form" />

                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Crie seu grupo</h1>
                            <p className="text-muted-foreground text-sm">
                                Configure seu workspace para começar a gerenciar seu time pelo WhatsApp.
                            </p>
                        </div>
                    </div>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Novo Workspace</CardTitle>
                            <CardDescription>
                                Dê um nome ao seu grupo. Você poderá alterar isso depois.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateWorkspace} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="workspace-name">Nome do grupo</Label>
                                    <Input
                                        id="workspace-name"
                                        placeholder="Ex: Pelada da Sexta, FC Amigos..."
                                        value={workspaceName}
                                        onChange={handleNameChange}
                                        disabled={isSubmitting}
                                        autoFocus
                                        maxLength={60}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="workspace-slug">
                                        Slug
                                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">(identificador único)</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">/</span>
                                        <Input
                                            id="workspace-slug"
                                            placeholder="pelada-da-sexta"
                                            value={workspaceSlug}
                                            onChange={handleSlugChange}
                                            disabled={isSubmitting}
                                            maxLength={40}
                                            className="pl-6 font-mono text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Usado no comando <code className="bg-muted px-1 rounded">/bind</code>. Gerado automaticamente.
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !workspaceName.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            Continuar
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair da conta
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render: Configure Step ─────────────────────────────────────────────────
    if (step === 'configure') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-10">
                <div className="w-full max-w-lg space-y-6">
                    <StepIndicator current="configure" />

                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
                                <Settings className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Configure seu jogo</h1>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                Essas informações ajudam o bot a gerenciar sua pelada automaticamente.
                            </p>
                        </div>
                    </div>

                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-0">
                            {/* Agendamento */}
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Quando é a sua pelada?
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weekday">Dia da semana</Label>
                                        <Select value={weekday} onValueChange={setWeekday}>
                                            <SelectTrigger id="weekday">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {weekdayOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="game-time">
                                            <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                                            Horário
                                        </Label>
                                        <Input
                                            id="game-time"
                                            type="time"
                                            value={gameTime}
                                            onChange={(e) => setGameTime(e.target.value)}
                                            className="[&::-webkit-calendar-picker-indicator]:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="game-title">
                                        Título da lista de presença
                                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opcional)</span>
                                    </Label>
                                    <Input
                                        id="game-title"
                                        placeholder="Ex: ⚽ PELADA DA SEXTA"
                                        value={gameTitle}
                                        onChange={(e) => setGameTitle(e.target.value)}
                                        maxLength={80}
                                    />
                                    <p className="text-xs text-muted-foreground">Aparece no cabeçalho quando o bot abre a lista de presença.</p>
                                </div>
                            </div>

                            {/* Financeiro */}
                            <div className="p-5 border-t border-border/60 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <CircleDollarSign className="h-3.5 w-3.5" />
                                    Financeiro
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Valor por jogador</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none font-medium">R$</span>
                                            <Input
                                                id="price"
                                                placeholder="0,00"
                                                value={priceDisplay}
                                                onChange={handlePriceChange}
                                                className="pl-9"
                                                inputMode="numeric"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max-players">
                                            <Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                                            Máx. jogadores
                                        </Label>
                                        <Input
                                            id="max-players"
                                            type="number"
                                            min={1}
                                            max={100}
                                            placeholder="14"
                                            value={maxPlayers}
                                            onChange={(e) => setMaxPlayers(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pix-key">
                                        <KeyRound className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                                        Chave Pix
                                        <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opcional)</span>
                                    </Label>
                                    <Input
                                        id="pix-key"
                                        placeholder="CPF, e-mail, telefone ou chave aleatória"
                                        value={pixKey}
                                        onChange={(e) => setPixKey(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        O bot usará essa chave para solicitar pagamentos dos jogadores.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-3">
                        <Button
                            className="w-full"
                            onClick={() => handleSaveConfig(false)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    Salvar e continuar
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            onClick={() => handleSaveConfig(true)}
                            disabled={isSubmitting}
                        >
                            <SkipForward className="mr-2 h-4 w-4" />
                            Pular por agora
                        </Button>
                    </div>

                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair da conta
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render: Success Step ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                <StepIndicator current="success" />

                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center ring-1 ring-green-500/30">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Workspace criado! 🎉</h1>
                        <p className="text-muted-foreground text-sm">
                            Agora ative o bot no seu grupo do WhatsApp seguindo os passos abaixo.
                        </p>
                    </div>
                </div>

                <Card className="border-border/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/40 border-b border-border/60 pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" />
                            Ativar o Bot no WhatsApp
                        </CardTitle>
                        <CardDescription>
                            Siga os 2 passos abaixo para vincular o sistema ao seu grupo.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Step 1 */}
                        <div className="p-5 border-b border-border/60">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                                <div className="space-y-1 pt-0.5">
                                    <p className="font-medium text-sm">Adicione o bot ao seu grupo</p>
                                    <p className="text-muted-foreground text-sm">
                                        Adicione o número abaixo como participante do seu grupo no WhatsApp:
                                    </p>
                                    <div className="mt-3 inline-flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                                        <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-mono font-semibold text-sm tracking-wide select-all">
                                            (49) 98842-1373
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="p-5">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                                <div className="space-y-1 pt-0.5 w-full min-w-0">
                                    <p className="font-medium text-sm">Envie o comando de vinculação</p>
                                    <p className="text-muted-foreground text-sm">
                                        Dentro do grupo, envie a seguinte mensagem para vincular o sistema:
                                    </p>
                                    <div className="mt-3 rounded-lg border border-border/80 overflow-hidden">
                                        <div className="flex items-center justify-between bg-muted/60 px-3 py-2 border-b border-border/60">
                                            <div className="flex items-center gap-1.5">
                                                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-medium">Comando</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" onClick={handleCopyCommand}>
                                                {isCopied ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                        <span className="text-green-500 font-medium">Copiado!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" />
                                                        Copiar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <div className="bg-background px-4 py-3">
                                            <code className="font-mono text-sm text-foreground font-semibold break-all">
                                                {bindCommand}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleFinish} disabled={isFinishing}>
                        {isFinishing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Já enviei o comando
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={() => setStep('configure')}
                        disabled={isFinishing}
                    >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Fazer isso depois
                    </Button>
                </div>

                <div className="flex justify-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da conta
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NoWorkspace;

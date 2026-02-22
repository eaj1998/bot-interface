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
} from 'lucide-react';
import { createWorkspace, CreatedWorkspace } from '@/services/workspace.service';
import { authAPI, tokenService } from '@/lib/axios';


// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'profile' | 'form' | 'success';

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

    // ── Init: skip profile step if user already has a real name ────────────────
    useEffect(() => {
        if (user && !looksLikePhone(user.name) && user.name?.trim()) {
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

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const updatedProfile = await authAPI.updateAuthProfile({ name: displayName.trim() });

            // Merge the response into the stored user and broadcast via AuthContext
            const stored = tokenService.getUser();
            const merged = {
                ...(stored ?? {}),
                ...(updatedProfile ?? {}),
                // Ensure the name is always the value the user typed
                name: displayName.trim(),
            };
            tokenService.setUser(merged);
            updateUser(merged as any);

            // useEffect will detect the valid name and skip the profile step;
            // we also advance manually for an instant transition.
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
            const role = (user?.role || '').toLowerCase();
            navigate(role === 'admin' || role === 'owner' ? '/admin/dashboard' : '/user/dashboard');
        } catch {
            navigate('/user/dashboard');
        } finally {
            setIsFinishing(false);
        }
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
                                            Criar Workspace
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

    // ── Render: Success Step ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
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
                                            (11) 99999-9999
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
                                            <code className="font-mono text-sm text-primary font-semibold break-all">
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
                    <p className="text-center text-xs text-muted-foreground">
                        Você pode fazer isso depois. O bot ficará aguardando o comando no grupo.
                    </p>
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

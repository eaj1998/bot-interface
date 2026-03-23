import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Clock, AlertTriangle, Zap, Star, CreditCard, Lock } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BFButton } from '../components/BF-Button';
import { billingAPI } from '../lib/axios';
import { useAuth } from '../hooks/useAuth';

type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'canceled';
type WorkspacePlan = 'trial' | 'basico' | 'pro';

interface SubscriptionInfo {
    plan: WorkspacePlan;
    status: SubscriptionStatus;
    trialEndsAt?: string;
    planActivatedAt?: string;
    daysUntilTrialExpiry?: number;
    isActive: boolean;
}

const STATUS_LABELS: Record<SubscriptionStatus, { label: string; color: string }> = {
    trialing: { label: 'Trial ativo', color: 'text-blue-600' },
    active: { label: 'Assinatura ativa', color: 'text-green-600' },
    expired: { label: 'Trial expirado', color: 'text-red-600' },
    canceled: { label: 'Cancelado', color: 'text-gray-500' },
};

const PLAN_FEATURES: Record<string, { icon: React.ReactNode; features: string[] }> = {
    trial: {
        icon: <Clock className="w-6 h-6 text-blue-500" />,
        features: [
            '1 workspace',
            'Até 20 jogadores',
            'Todos os comandos do bot',
            'Gestão de jogos e lista',
            'Dashboard básico',
        ],
    },
    basico: {
        icon: <Zap className="w-6 h-6 text-emerald-500" />,
        features: [
            '1 workspace',
            'Jogadores ilimitados',
            'Bot completo (todos os comandos)',
            'Gestão financeira (mensalidades, PIX)',
            'Dashboard + relatórios',
            'Churrasco e eventos',
        ],
    },
    pro: {
        icon: <Star className="w-6 h-6 text-amber-500" />,
        features: [
            'Até 3 workspaces',
            'Tudo do Básico',
            'Avaliações e ratings de jogadores',
            'Relatórios avançados (MRR, inadimplência)',
            'Suporte prioritário via WhatsApp',
        ],
    },
};

interface CardForm {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
}

const EMPTY_CARD: CardForm = {
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
};

function formatCardNumber(value: string): string {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export const Billing: React.FC = () => {
    const { currentWorkspace } = useAuth();
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<SubscriptionInfo | null>(null);
    const [activating, setActivating] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<'basico' | 'pro' | null>(null);
    const [card, setCard] = useState<CardForm>(EMPTY_CARD);

    useEffect(() => {
        if (!currentWorkspace?.id) return;
        fetchStatus();
    }, [currentWorkspace?.id]);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await billingAPI.getStatus();
            setInfo(res.data);
        } catch (e) {
            toast.error('Erro ao carregar status de assinatura');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = (plan: 'basico' | 'pro') => {
        setCard(EMPTY_CARD);
        setPendingPlan(plan);
    };

    const updateCard = (field: keyof CardForm, value: string) => {
        setCard(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = async () => {
        try {
            setCanceling(true);
            await billingAPI.cancelSubscription();
            setShowCancelModal(false);
            toast.success('Assinatura cancelada.');
            await fetchStatus();
        } catch {
            toast.error('Erro ao cancelar assinatura. Tente novamente.');
        } finally {
            setCanceling(false);
        }
    };

    const submitCheckout = async () => {
        if (!pendingPlan) return;

        const cpf = card.cpfCnpj.replace(/\D/g, '');
        if (cpf.length !== 11 && cpf.length !== 14) {
            toast.error('CPF (11 dígitos) ou CNPJ (14 dígitos) inválido.');
            return;
        }
        const cardNumber = card.number.replace(/\s/g, '');
        if (cardNumber.length < 13) {
            toast.error('Número do cartão inválido.');
            return;
        }
        if (!card.holderName.trim()) {
            toast.error('Informe o nome do titular do cartão.');
            return;
        }
        if (!card.expiryMonth || !card.expiryYear) {
            toast.error('Informe a validade do cartão.');
            return;
        }
        if (card.ccv.length < 3) {
            toast.error('CVV inválido.');
            return;
        }
        if (!card.postalCode.replace(/\D/g, '') || card.postalCode.replace(/\D/g, '').length < 8) {
            toast.error('CEP inválido.');
            return;
        }
        if (!card.addressNumber.trim()) {
            toast.error('Informe o número do endereço.');
            return;
        }

        try {
            setActivating(true);
            setPendingPlan(null);

            await billingAPI.createCheckout(
                pendingPlan,
                {
                    holderName: card.holderName.trim(),
                    number: cardNumber,
                    expiryMonth: card.expiryMonth,
                    expiryYear: card.expiryYear,
                    ccv: card.ccv,
                },
                {
                    name: card.holderName.trim(),
                    cpfCnpj: card.cpfCnpj,
                    postalCode: card.postalCode,
                    addressNumber: card.addressNumber.trim(),
                },
            );

            toast.success('Pagamento aprovado! Plano ativado com sucesso.');
            window.dispatchEvent(new CustomEvent('billing:activated'));
            await fetchStatus();
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Erro ao processar pagamento. Verifique os dados e tente novamente.';
            toast.error(msg);
        } finally {
            setActivating(false);
        }
    };

    const statusInfo = info ? STATUS_LABELS[info.status] : null;

    return (
        <div className="space-y-6 p-4">
            <div>
                <h1 className="text-2xl font-bold">Assinatura</h1>
                <p className="text-muted-foreground">Gerencie o plano do seu workspace</p>
            </div>

            {/* Current status banner */}
            {!loading && info && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            {info.status === 'trialing' && <Clock className="w-5 h-5 text-blue-500" />}
                            {info.status === 'active' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {(info.status === 'expired' || info.status === 'canceled') && (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                                <p className={`font-semibold ${statusInfo?.color}`}>
                                    {statusInfo?.label}
                                </p>
                                {info.status === 'trialing' && info.daysUntilTrialExpiry !== undefined && (
                                    <p className="text-sm text-muted-foreground">
                                        {info.daysUntilTrialExpiry > 0
                                            ? `${info.daysUntilTrialExpiry} dias restantes no trial`
                                            : 'Trial expira hoje'}
                                    </p>
                                )}
                                {info.status === 'active' && info.planActivatedAt && (
                                    <p className="text-sm text-muted-foreground">
                                        Plano {info.plan === 'basico' ? 'Básico' : 'Pro'} ativo desde{' '}
                                        {new Date(info.planActivatedAt).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                                {info.status === 'expired' && (
                                    <p className="text-sm text-muted-foreground">
                                        Assine um plano para continuar usando a plataforma
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Básico */}
                <Card className={`relative ${info?.plan === 'basico' && info.status === 'active' ? 'ring-2 ring-emerald-500' : ''}`}>
                    {info?.plan === 'basico' && info.status === 'active' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Plano atual
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {PLAN_FEATURES.basico.icon}
                            <CardTitle>Básico</CardTitle>
                        </div>
                        <CardDescription>Para grupos de até 30 jogadores</CardDescription>
                        <div className="mt-2">
                            <span className="text-3xl font-bold">R$ 49</span>
                            <span className="text-muted-foreground">/mês</span>
                            <p className="text-sm text-muted-foreground mt-1">
                                ou R$ 490/ano (2 meses grátis)
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {PLAN_FEATURES.basico.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {info?.plan === 'basico' && info.status === 'active' ? (
                            <BFButton variant="secondary" disabled className="w-full">
                                Plano ativo
                            </BFButton>
                        ) : (
                            <BFButton
                                className="w-full"
                                onClick={() => handleCheckout('basico')}
                                disabled={activating}
                            >
                                {activating ? 'Processando...' : 'Assinar Básico — R$ 49/mês'}
                            </BFButton>
                        )}
                    </CardFooter>
                </Card>

                {/* Pro */}
                <Card className={`relative ${info?.plan === 'pro' && info.status === 'active' ? 'ring-2 ring-amber-500' : ''}`}>
                    {info?.plan === 'pro' && info.status === 'active' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Plano atual
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {PLAN_FEATURES.pro.icon}
                            <CardTitle>Pro</CardTitle>
                        </div>
                        <CardDescription>Para quem gerencia mais de 1 grupo</CardDescription>
                        <div className="mt-2">
                            <span className="text-3xl font-bold">R$ 97</span>
                            <span className="text-muted-foreground">/mês</span>
                            <p className="text-sm text-muted-foreground mt-1">
                                ou R$ 970/ano (2 meses grátis)
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {PLAN_FEATURES.pro.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {info?.plan === 'pro' && info.status === 'active' ? (
                            <BFButton variant="secondary" disabled className="w-full">
                                Plano ativo
                            </BFButton>
                        ) : (
                            <BFButton
                                className="w-full"
                                onClick={() => handleCheckout('pro')}
                                disabled={activating}
                            >
                                {activating ? 'Processando...' : 'Assinar Pro — R$ 97/mês'}
                            </BFButton>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* FAQ / Help */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Dúvidas?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        Ao clicar em "Assinar", uma cobrança é gerada automaticamente pelo Asaas.
                        Após o pagamento confirmado, seu plano é ativado em segundos.
                    </p>
                    <p>
                        Entre em contato pelo email:{' '}
                        <span className="font-medium text-foreground">contato@fazosimplesfc.app</span>
                    </p>
                </CardContent>
            </Card>

            {/* Cancel subscription */}
            {info?.status === 'active' && (
                <div className="flex justify-end">
                    <BFButton
                        variant="secondary"
                        onClick={() => setShowCancelModal(true)}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                    >
                        Cancelar assinatura
                    </BFButton>
                </div>
            )}

            {/* Cancel confirmation modal */}
            <Dialog open={showCancelModal} onOpenChange={(open) => { if (!canceling) setShowCancelModal(open); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Cancelar assinatura
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza? O acesso ao bot e ao painel será bloqueado imediatamente após o cancelamento.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <BFButton variant="secondary" onClick={() => setShowCancelModal(false)} disabled={canceling}>
                            Voltar
                        </BFButton>
                        <BFButton
                            onClick={handleCancel}
                            disabled={canceling}
                            loading={canceling}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
                        </BFButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credit Card Checkout Modal */}
            <Dialog open={!!pendingPlan} onOpenChange={(open) => { if (!open && !activating) setPendingPlan(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Dados de pagamento
                        </DialogTitle>
                        <DialogDescription>
                            Pagamento seguro via cartão de crédito. Seus dados são criptografados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Card holder name */}
                        <div className="space-y-1">
                            <Label htmlFor="holderName">Nome no cartão</Label>
                            <Input
                                id="holderName"
                                placeholder="NOME SOBRENOME"
                                value={card.holderName}
                                onChange={(e) => updateCard('holderName', e.target.value.toUpperCase())}
                            />
                        </div>

                        {/* Card number */}
                        <div className="space-y-1">
                            <Label htmlFor="cardNumber">Número do cartão</Label>
                            <Input
                                id="cardNumber"
                                placeholder="0000 0000 0000 0000"
                                value={card.number}
                                onChange={(e) => updateCard('number', formatCardNumber(e.target.value))}
                                maxLength={19}
                            />
                        </div>

                        {/* Expiry + CVV */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="expiryMonth">Mês</Label>
                                <Input
                                    id="expiryMonth"
                                    placeholder="MM"
                                    value={card.expiryMonth}
                                    onChange={(e) => updateCard('expiryMonth', e.target.value.replace(/\D/g, '').slice(0, 2))}
                                    maxLength={2}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="expiryYear">Ano</Label>
                                <Input
                                    id="expiryYear"
                                    placeholder="AAAA"
                                    value={card.expiryYear}
                                    onChange={(e) => updateCard('expiryYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="ccv">CVV</Label>
                                <Input
                                    id="ccv"
                                    placeholder="123"
                                    value={card.ccv}
                                    onChange={(e) => updateCard('ccv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            {/* CPF/CNPJ */}
                            <div className="space-y-1">
                                <Label htmlFor="cpfCnpj">CPF ou CNPJ do titular</Label>
                                <Input
                                    id="cpfCnpj"
                                    placeholder="000.000.000-00"
                                    value={card.cpfCnpj}
                                    onChange={(e) => updateCard('cpfCnpj', e.target.value)}
                                />
                            </div>

                            {/* CEP + Address number */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="postalCode">CEP</Label>
                                    <Input
                                        id="postalCode"
                                        placeholder="00000-000"
                                        value={card.postalCode}
                                        onChange={(e) => updateCard('postalCode', e.target.value.replace(/\D/g, '').slice(0, 8))}
                                        maxLength={9}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="addressNumber">Número</Label>
                                    <Input
                                        id="addressNumber"
                                        placeholder="123"
                                        value={card.addressNumber}
                                        onChange={(e) => updateCard('addressNumber', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            Pagamento processado com segurança pelo Asaas
                        </p>
                    </div>

                    <DialogFooter>
                        <BFButton variant="secondary" onClick={() => setPendingPlan(null)} disabled={activating}>
                            Cancelar
                        </BFButton>
                        <BFButton onClick={submitCheckout} disabled={activating} loading={activating}>
                            {activating ? 'Processando...' : 'Confirmar pagamento'}
                        </BFButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};


import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Copy, Check, Info, Command, Terminal, ShieldAlert, BadgeDollarSign, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

interface BotCommand {
    name: string;
    description: string;
    category: string;
    usage: string;
}

const CATEGORIES = {
    Geral: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Info },
    Financeiro: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: BadgeDollarSign },
    Admin: { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: ShieldAlert },
    Churras: { color: 'bg-orange-50 text-orange-600 border-orange-100', icon: PartyPopper },
};

export const HelpPage = () => {
    const [commands, setCommands] = useState<BotCommand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

    const fetchCommands = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await api.get('/public/commands');
            setCommands(response.data);
        } catch (err) {
            console.error('Error fetching commands:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    const handleCopy = (text: string | null | undefined) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedCommand(text);
        toast.success('Comando copiado!');
        setTimeout(() => setCopiedCommand(null), 2000);
    };

    const filteredCommands = commands.filter((cmd) => {
        const name = cmd.name || '';
        const description = cmd.description || '';
        const usage = cmd.usage || '';
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usage.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || cmd.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        const category = cmd.category || 'Outros';
        if (!acc[category]) acc[category] = [];
        acc[category].push(cmd);
        return acc;
    }, {} as Record<string, BotCommand[]>);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">Erro ao carregar comandos</h1>
                <p className="text-slate-500 mb-6 text-center max-w-sm">
                    Não foi possível buscar a lista de comandos. Por favor, verifique sua conexão ou tente novamente mais tarde.
                </p>
                <Button onClick={fetchCommands} variant="default">Tentar Novamente</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Hero Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-2">
                        <Terminal className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Documentação
                    </h1>
                    <p className="text-lg text-slate-500">
                        Explore os comandos disponíveis para interagir com o Faz o Simples FC. Clique em qualquer comando para copiá-lo rapidamente.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="sticky top-4 z-20 flex flex-col sm:flex-row gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-200/60 ring-1 ring-slate-900/5">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            placeholder="Buscar por comando ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                        />
                    </div>
                    <div className="h-12 w-px bg-slate-200 hidden sm:block"></div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[200px] h-12 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none font-medium text-slate-700">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {Object.keys(CATEGORIES).map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse border-slate-100 shadow-sm rounded-2xl">
                                <CardHeader className="space-y-3 pb-4">
                                    <Skeleton className="h-5 w-3/4 rounded-md" />
                                    <Skeleton className="h-4 w-1/2 rounded-md" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-14">
                        {Object.entries(groupedCommands).map(([category, cmds]) => {
                            const CategoryData = CATEGORIES[category as keyof typeof CATEGORIES] || { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: Command };
                            const CategoryIcon = CategoryData.icon;

                            return (
                                <section key={category} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl border ${CategoryData.color}`}>
                                            <CategoryIcon className="h-6 w-6" strokeWidth={2} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{category}</h2>
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                            {cmds.length}
                                        </span>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {cmds.map((cmd) => (
                                            <Card
                                                key={cmd.name}
                                                className="group relative overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 transition-all duration-300 border-slate-200 bg-white rounded-2xl cursor-pointer hover:-translate-y-0.5"
                                                onClick={() => handleCopy(cmd.usage || cmd.name)}
                                            >
                                                <CardHeader className="pb-3 flex-1">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <CardTitle className="text-[17px] font-semibold text-slate-900 break-words leading-tight group-hover:text-blue-600 transition-colors">
                                                            {cmd.name}
                                                        </CardTitle>
                                                        <div className="shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors">
                                                            {copiedCommand === (cmd.usage || cmd.name) ? (
                                                                <Check className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <CardDescription className="text-sm text-slate-500 leading-relaxed max-w-[95%]">
                                                        {cmd.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="mt-auto">
                                                    <div
                                                        className="bg-slate-900 group-hover:bg-slate-800 transition-colors p-3.5 rounded-xl font-mono text-[13px] text-slate-50 flex items-center justify-between"
                                                    >
                                                        <span className="truncate mr-2 text-slate-300 group-hover:text-white transition-colors">{cmd.usage}</span>
                                                        <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-500 group-hover:text-blue-400 transition-colors whitespace-nowrap">
                                                            Copiar
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                        {filteredCommands.length === 0 && (
                            <div className="text-center py-20 px-6 sm:px-12 bg-white rounded-3xl border border-dashed border-slate-300">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex flex-col items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum comando encontrado</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">Não encontramos comandos correspondentes à sua busca. Tente usar outras palavras-chave ou limpe os filtros.</p>
                                <Button
                                    variant="outline"
                                    className="mt-6 rounded-full px-6"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('all');
                                    }}
                                >
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


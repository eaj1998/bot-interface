import {
	ArrowRight,
	BarChart3,
	CheckCircle2,
	Sparkles,
	Users,
	Wallet,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const landingThemeVars: CSSProperties = {
	['--background' as string]: '#090B10',
	['--foreground' as string]: '#F5F8FF',
	['--card' as string]: '#121722',
	['--card-foreground' as string]: '#F5F8FF',
	['--accent' as string]: '#1A2233',
	['--muted' as string]: '#2C3A58',
	['--muted-foreground' as string]: '#C3D1EA',
	['--border' as string]: '#2A3550',
	['--primary' as string]: '#A3FF12',
	['--primary-foreground' as string]: '#0A0E14',
	['--secondary' as string]: '#35D0FF',
	['--secondary-foreground' as string]: '#0A0E14',
	['--ring' as string]: '#A3FF12',
	['--warning' as string]: '#FFB020',
};

const features = [
	{
		title: 'Lista automática no grupo',
		description:
			'Comandos simples no WhatsApp para confirmar, desistir e adicionar convidado sem confusão no chat.',
		icon: Users,
	},
	{
		title: 'Mensalistas e avulsos separados',
		description:
			'Visualize rapidamente quem é fixo e quem é avulso para evitar erro na hora de fechar a rodada.',
		icon: CheckCircle2,
	},
	{
		title: 'Pix e financeiro sem planilha',
		description:
			'Controle pagamentos, pendências, créditos e receita do jogo em um painel claro e direto.',
		icon: Wallet,
	},
	{
		title: 'Times equilibrados por rating',
		description:
			'Sorteio inteligente para reduzir desequilíbrio e discussão antes da bola rolar.',
		icon: BarChart3,
	},
];

const painPoints = [
	'“Galera, quem vai?” e ninguém responde',
	'Confirmação em cima da hora e sempre falta 1',
	'Mensalista misturado com avulso',
	'Cobrança de Pix virando dor de cabeça',
	'Time montado no improviso',
	'Churrasco pós-jogo sem organização',
];

const faqs = [
	{
		question: 'Funciona em qualquer grupo de WhatsApp?',
		answer: 'Sim. Basta adicionar o bot no grupo da sua pelada e começar a usar. Leva menos de 5 minutos.',
	},
	{
		question: 'O que acontece depois dos 30 dias de teste?',
		answer: 'Você escolhe um plano e continua. Se não quiser continuar, o bot simplesmente para de responder — sem cobrança automática, sem cartão cadastrado.',
	},
	{
		question: 'Meus jogadores precisam fazer alguma coisa?',
		answer: 'Só digitar o comando no grupo. /bora pra entrar, /desistir pra sair. Não precisa instalar nada.',
	},
	{
		question: 'Precisa instalar aplicativo?',
		answer: 'Não. Tudo acontece dentro do WhatsApp e no seu painel web.',
	},
	{
		question: 'Posso cancelar quando quiser?',
		answer: 'Sim. Sem fidelidade, sem multa. Cancela em 1 clique.',
	},
	{
		question: 'É seguro?',
		answer: 'Sim. O bot só acessa os comandos que você ativa. Não lê outras mensagens do grupo.',
	},
];

export const LandingPage = () => {
	const handleSmoothAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
		event.preventDefault();

		const target = document.getElementById(targetId);
		if (!target) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			target.scrollIntoView({ block: 'start' });
			return;
		}

		const navOffset = 96;
		const startY = window.scrollY;
		const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;
		const distance = targetY - startY;
		const duration = 1100;
		let startTime: number | null = null;

		const easeInOutCubic = (progress: number) =>
			progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

		const animate = (timestamp: number) => {
			if (startTime === null) startTime = timestamp;
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeInOutCubic(progress);

			window.scrollTo(0, startY + distance * eased);

			if (progress < 1) {
				window.requestAnimationFrame(animate);
			}
		};

		window.requestAnimationFrame(animate);
	};

	return (
		<div
			id="topo"
			style={landingThemeVars}
			className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]"
		>
			<div className="relative isolate">
				<div className="pointer-events-none absolute inset-0 -z-10">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,var(--bf-green-light)_0%,transparent_34%),radial-gradient(circle_at_82%_14%,var(--bf-blue-primary)_0%,transparent_33%),linear-gradient(180deg,var(--accent)_0%,var(--background)_58%,var(--background)_100%)] opacity-90" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.13]" />
					<div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[var(--primary)] opacity-20 blur-[120px]" />
					<div className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-[var(--secondary)] opacity-20 blur-[125px]" />
				</div>

				<header className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
					<nav className="mx-auto flex min-h-11 items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 px-2 py-3 shadow-[0_10px_30px_rgba(10,22,40,0.12)] backdrop-blur-xl sm:px-6">
						<div className="flex min-w-0 items-center gap-2 sm:gap-3">
							<img
								src={logo}
								alt="Logo Faz o Simples"
								className="h-10 w-10 rounded-xl object-contain sm:h-12 sm:w-12"
							/>
							<div className="min-w-0">
								<p className="truncate text-xs font-semibold leading-tight sm:text-base max-[370px]:hidden">Faz o Simples</p>
								<p className="hidden text-sm text-[var(--muted-foreground)] md:block">Bot de pelada no WhatsApp</p>
							</div>
						</div>

						<div className="hidden items-center gap-2 lg:flex">
							<a
								href="#como-funciona"
								onClick={(event) => handleSmoothAnchorClick(event, 'como-funciona')}
								className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium text-[var(--muted-foreground)] transition duration-200 hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
							>
								Como funciona
							</a>
							<a
								href="#beneficios"
								onClick={(event) => handleSmoothAnchorClick(event, 'beneficios')}
								className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium text-[var(--muted-foreground)] transition duration-200 hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
							>
								Benefícios
							</a>
							<a
								href="#prova"
								onClick={(event) => handleSmoothAnchorClick(event, 'prova')}
								className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium text-[var(--muted-foreground)] transition duration-200 hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
							>
								Resultados
							</a>
							<a
								href="#preco"
								onClick={(event) => handleSmoothAnchorClick(event, 'preco')}
								className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium text-[var(--muted-foreground)] transition duration-200 hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
							>
								Preço
							</a>
						</div>

						<div className="flex shrink-0 items-center gap-1 sm:gap-2">
							<Link
								to="/login"
								className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 text-[11px] font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--secondary)] sm:px-5 sm:text-sm"
							>
								Entrar
							</Link>
							<Link
								to="/criar-conta"
								className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl bg-[var(--primary)] px-2 text-[11px] font-semibold text-[var(--primary-foreground)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,214,111,0.38)] sm:px-5 sm:text-sm"
							>
								<span className="sm:hidden">Testar</span>
								<span className="hidden sm:inline">Teste Grátis</span>
							</Link>
						</div>
					</nav>
				</header>

				<main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
					<section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
						<div className="max-w-3xl">
							<span className="inline-flex max-w-full min-h-11 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 px-4 text-sm font-medium text-[var(--muted-foreground)] whitespace-normal backdrop-blur-sm">
								<Sparkles className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
								Feito para quem organiza a pelada e resolve tudo sozinho
							</span>

							<h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
								Organize sua pelada no automático direto no WhatsApp.
							</h1>

							<p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-[var(--foreground)] sm:text-lg">
								Confirma presença, separa mensalistas, controla Pix e monta os times sem planilha.
							</p>

							<div className="mt-8 flex flex-wrap gap-3">
								<Link
									to="/criar-conta"
									className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-semibold text-[var(--primary-foreground)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,214,111,0.42)] sm:min-w-11 sm:w-auto sm:px-7"
								>
									Quero testar grátis por 30 dias
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
								<a
									href="#como-funciona"
									onClick={(event) => handleSmoothAnchorClick(event, 'como-funciona')}
									className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]/65 px-5 py-3 text-base font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--secondary)] sm:min-w-11 sm:w-auto sm:px-6"
								>
									Ver como funciona
								</a>
							</div>

							<p className="mt-3 text-sm font-semibold text-[var(--primary)]">
								🔥 Oferta para os 50 primeiros grupos
							</p>

							<p className="mt-4 text-[15px] font-medium leading-relaxed text-[var(--foreground)]">
								Sem cartão • Sem fidelidade • Começa em minutos
							</p>
							<p className="mt-2 text-sm font-medium text-[var(--foreground)]">
								Você só entra pra jogar.
							</p>

							<div className="mt-6 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
								<p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
									+500 jogadores já organizados
								</p>
								<p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
									+100 peladas automatizadas
								</p>
							</div>
						</div>

						<article className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_18px_44px_rgba(10,22,40,0.14)] backdrop-blur-xl">
							<div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[2.3rem] bg-[linear-gradient(140deg,var(--primary),var(--secondary))] opacity-30" />
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="rounded-2xl border border-[var(--border)] bg-[var(--accent)]/70 p-4">
									<p className="text-sm font-semibold text-[var(--foreground)]">WhatsApp Bot</p>
									<div className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
										<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
											<p className="font-mono text-[13px] font-semibold text-[var(--foreground)]">/bora</p>
											<p className="mt-1 text-xs text-[var(--muted-foreground)]">Jogador entra na lista ✅</p>
										</div>
										<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
											<p className="font-mono text-[13px] font-semibold text-[var(--foreground)]">/desistir</p>
											<p className="mt-1 text-xs text-[var(--muted-foreground)]">Jogador sai da lista ❌</p>
										</div>
										<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2">
											<p className="font-mono text-[13px] font-semibold text-[var(--foreground)]">/convidado [nome]</p>
											<p className="mt-1 text-xs text-[var(--muted-foreground)]">Convidado entra na lista 👤</p>
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-[var(--border)] bg-[var(--accent)]/70 p-4">
									<p className="text-sm font-semibold text-[var(--foreground)]">Painel de controle</p>
									<div className="mt-3 space-y-3">
										<div>
											<p className="text-xs text-[var(--muted-foreground)]">Receita do jogo</p>
											<p className="text-lg font-semibold text-[var(--primary)]">R$ 1.240,00</p>
										</div>
										<div className="h-2 rounded-full bg-[var(--muted)]">
											<div className="h-full w-[84%] rounded-full bg-[linear-gradient(90deg,var(--primary),var(--secondary))]" />
										</div>
										<p className="text-xs text-[var(--muted-foreground)]">84% dos pagamentos confirmados</p>
									</div>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
									<p className="text-xs text-[var(--muted-foreground)]">Jogadores confirmados</p>
									<p className="text-xl font-bold text-[var(--primary)]">28</p>
								</div>
								<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
									<p className="text-xs text-[var(--muted-foreground)]">Fila de espera</p>
									<p className="text-xl font-bold text-[var(--secondary)]">06</p>
								</div>
							</div>
						</article>
					</section>

					<section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
						<div className="grid grid-cols-1 gap-3 text-sm text-[var(--muted-foreground)] sm:grid-cols-3">
							<p className="rounded-xl bg-[var(--accent)] px-4 py-3">✅ 100% dentro do WhatsApp</p>
							<p className="rounded-xl bg-[var(--accent)] px-4 py-3">⚡ Menos estresse na organização</p>
							<p className="rounded-xl bg-[var(--accent)] px-4 py-3">🎯 Menos de R$1 por jogador</p>
						</div>
					</section>

					<section className="mt-20 scroll-mt-24">
						<div className="max-w-3xl">
							<h2 className="text-3xl font-semibold leading-tight">Se toda semana sobra pra você, isso aqui é pra você</h2>
							<p className="mt-3 text-base font-medium leading-relaxed text-[var(--foreground)] sm:text-lg">
								Se você não organizar, ninguém organiza.
							</p>
							<p className="mt-2 text-base font-semibold leading-relaxed text-[var(--foreground)] sm:text-lg">
								Sempre sobra pra você.
							</p>
						</div>

						<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{painPoints.map((point) => (
								<article
									key={point}
									className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-base text-[var(--muted-foreground)]"
								>
									{point}
								</article>
							))}
						</div>
						<div className="mt-8 flex items-center gap-4">
							<Link
								to="/criar-conta"
								className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(163,255,18,0.38)]"
							>
								Resolver isso agora — grátis
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
							<p className="text-sm text-[var(--muted-foreground)]">30 dias grátis · Sem cartão</p>
						</div>
					</section>

					<section id="como-funciona" className="mt-20 scroll-mt-24">
						<h2 className="text-3xl font-semibold leading-tight">Em 3 passos, a pelada anda sozinha</h2>
						<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-md">
								<span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--secondary)] font-semibold text-[var(--secondary-foreground)]">1</span>
								<h3 className="mt-3 text-lg font-semibold">Adicione no grupo</h3>
								<p className="mt-2 text-base leading-relaxed text-[var(--muted-foreground)]">Você conecta o bot no WhatsApp da sua pelada.</p>
							</article>
							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-md">
								<span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--secondary)] font-semibold text-[var(--secondary-foreground)]">2</span>
								<h3 className="mt-3 text-lg font-semibold">Confirmação automática</h3>
								<p className="mt-2 text-base leading-relaxed text-[var(--muted-foreground)]">Ele organiza lista, reservas e convidados com os comandos do grupo.</p>
							</article>
							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-md">
								<span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--secondary)] font-semibold text-[var(--secondary-foreground)]">3</span>
								<h3 className="mt-3 text-lg font-semibold">Sem planilha. Sem bagunça. Sem estresse.</h3>
								<p className="mt-2 text-base leading-relaxed text-[var(--muted-foreground)]">Você acompanha mensalistas, Pix, times e churrasco em um painel simples.</p>
							</article>
						</div>
					</section>

					<section id="beneficios" className="mt-20 scroll-mt-24">
						<h2 className="text-3xl font-semibold leading-tight">O que muda já na primeira semana</h2>
						<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
							{features.map(({ title, description, icon: Icon }) => (
								<article
									key={title}
									className="group rounded-2xl border border-[var(--border)] bg-[linear-gradient(160deg,var(--card)_0%,var(--accent)_100%)] p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(10,22,40,0.16)]"
								>
									<div className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)] transition duration-200 group-hover:scale-105 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]">
										<Icon className="h-5 w-5" aria-hidden="true" />
									</div>
									<h3 className="mt-4 text-xl font-semibold leading-snug">{title}</h3>
									<p className="mt-2 text-base leading-relaxed text-[var(--muted-foreground)]">{description}</p>
								</article>
							))}
						</div>
					</section>

					<section id="prints" className="mt-16 scroll-mt-24">
						<div className="max-w-3xl">
							<h2 className="text-2xl font-semibold leading-tight sm:text-3xl">Como fica no dia a dia</h2>
							<p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
								Tudo acontece dentro do WhatsApp. Nenhum app novo pra instalar.
							</p>
						</div>

						<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
								<p className="text-xs font-semibold uppercase tracking-wide text-[var(--secondary)]">Confirmação de presença</p>
								<div className="mt-3 space-y-2">
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/bora</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ Rafael entrou na lista. (8/16) ✅</p>
									</div>
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/convidado João</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ João (convidado) entrou. (9/16) 👤</p>
									</div>
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/lista</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ Lista completa com confirmados e reserva</p>
									</div>
								</div>
							</article>

							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
								<p className="text-xs font-semibold uppercase tracking-wide text-[var(--secondary)]">Controle de pagamento</p>
								<div className="mt-3 space-y-2">
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/pago</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ Rafael marcado como pago ✅</p>
									</div>
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/debitos</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ Lista quem ainda não pagou</p>
									</div>
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/saldo</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ Receita total do grupo: R$ 1.280</p>
									</div>
								</div>
							</article>

							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
								<p className="text-xs font-semibold uppercase tracking-wide text-[var(--secondary)]">Sorteio de times</p>
								<div className="mt-3 space-y-2">
									<div className="rounded-xl bg-[var(--accent)] p-3 text-sm">
										<p className="font-mono font-semibold text-[var(--foreground)]">/times</p>
										<p className="mt-1 text-[var(--muted-foreground)]">→ Times sorteados por rating ⚽</p>
									</div>
									<div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
										<p className="font-semibold text-[var(--foreground)]">🟢 Time 1</p>
										<p className="mt-1 text-[var(--muted-foreground)]">Rafael, Diego, Marcelo, Lucas, André</p>
										<p className="mt-2 font-semibold text-[var(--foreground)]">🔵 Time 2</p>
										<p className="mt-1 text-[var(--muted-foreground)]">João, Pedro, Carlos, Felipe, Bruno</p>
									</div>
								</div>
							</article>
						</div>
					</section>

					<section id="prova" className="mt-20 scroll-mt-24">
						<h2 className="text-3xl font-semibold leading-tight">Quem organiza pelada de verdade já sentiu a diferença</h2>
						<div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 backdrop-blur-md">
								<p className="text-base leading-relaxed text-[var(--foreground)]">
									“Antes eu perdia horas cobrando presença. Agora a lista se organiza quase sozinha.”
								</p>
								<p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">Rafael, organizador semanal</p>
							</article>

							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 backdrop-blur-md">
								<p className="text-base leading-relaxed text-[var(--foreground)]">
									“A parte chata sumiu. Hoje eu jogo mais e resolvo menos no grupo.”
								</p>
								<p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">Diego, 32 anos</p>
							</article>

							<article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 backdrop-blur-md">
								<p className="text-base leading-relaxed text-[var(--foreground)]">
									“Por R$49, eu comprei paz. Vale cada centavo para quem organiza.”
								</p>
								<p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">Marcelo, admin de grupo</p>
							</article>
						</div>

						<div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
							<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
								<p className="text-2xl font-bold text-[var(--primary)]">30 dias</p>
								<p className="mt-1 text-sm text-[var(--muted-foreground)]">teste sem cartão</p>
							</div>
							<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
								<p className="text-2xl font-bold text-[var(--primary)]">0</p>
								<p className="mt-1 text-sm text-[var(--muted-foreground)]">planilhas necessárias</p>
							</div>
						</div>
					</section>

					<section id="preco" className="mt-20 scroll-mt-24">
						<div className="text-center">
							<h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Preço simples. Sem surpresa.</h2>
							<p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)]">
								30 dias grátis sem cartão. Depois, menos que uma pizza por mês.
							</p>
						</div>

						<div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
							<article className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7">
								<p className="text-sm font-semibold text-[var(--muted-foreground)]">Grátis</p>
								<div className="mt-3 flex items-end gap-1">
									<span className="text-4xl font-bold">R$ 0</span>
									<span className="mb-1 text-sm text-[var(--muted-foreground)]">/ 30 dias</span>
								</div>
								<p className="mt-1 text-sm text-[var(--muted-foreground)]">Sem cartão. Começa agora.</p>
								<ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--muted-foreground)]">
									{['1 workspace', 'Até 20 jogadores', 'Todos os comandos do bot', 'Gestão de jogos e lista', 'Dashboard básico'].map((f) => (
										<li key={f} className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
											{f}
										</li>
									))}
								</ul>
								<Link to="/criar-conta" className="mt-8 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)]">
									Começar grátis
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</article>

							<article className="relative flex flex-col rounded-3xl border-2 border-[var(--primary)] bg-[var(--card)] p-7 shadow-[0_0_40px_rgba(163,255,18,0.12)]">
								<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-bold text-[var(--primary-foreground)]">
									Mais popular
								</div>
								<p className="text-sm font-semibold text-[var(--primary)]">Básico</p>
								<div className="mt-3 flex items-end gap-1">
									<span className="text-4xl font-bold">R$ 49</span>
									<span className="mb-1 text-sm text-[var(--muted-foreground)]">/ mês</span>
								</div>
								<p className="mt-1 text-sm text-[var(--muted-foreground)]">ou R$ 490/ano — 2 meses grátis</p>
								<p className="mt-1 text-xs font-semibold text-[var(--primary)]">R$ 1,63 por jogador/mês (30 jogadores)</p>
								<ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--muted-foreground)]">
									{['1 workspace', 'Jogadores ilimitados', 'Bot completo (todos os comandos)', 'Gestão financeira (mensalidades, PIX)', 'Dashboard + relatórios', 'Churrasco e eventos'].map((f) => (
										<li key={f} className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
											{f}
										</li>
									))}
								</ul>
								<Link to="/criar-conta" className="mt-8 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(163,255,18,0.38)]">
									Testar 30 dias grátis
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</article>

							<article className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7">
								<p className="text-sm font-semibold text-[var(--secondary)]">Pro</p>
								<div className="mt-3 flex items-end gap-1">
									<span className="text-4xl font-bold">R$ 97</span>
									<span className="mb-1 text-sm text-[var(--muted-foreground)]">/ mês</span>
								</div>
								<p className="mt-1 text-sm text-[var(--muted-foreground)]">ou R$ 970/ano — 2 meses grátis</p>
								<p className="mt-1 text-xs font-semibold text-[var(--secondary)]">Para quem gerencia mais de 1 grupo</p>
								<ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--muted-foreground)]">
									{['Até 3 workspaces', 'Tudo do Básico', 'Ratings e avaliações de jogadores', 'Relatórios avançados', 'Suporte prioritário via WhatsApp'].map((f) => (
										<li key={f} className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--secondary)]" />
											{f}
										</li>
									))}
								</ul>
								<Link to="/criar-conta" className="mt-8 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--secondary)]">
									Começar grátis
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</article>
						</div>

						<p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
							Todos os planos começam com 30 dias grátis · Sem cartão · Cancele quando quiser
						</p>
					</section>

					<section className="mt-20">
						<h2 className="text-3xl font-semibold leading-tight">Perguntas rápidas antes de começar</h2>
						<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
							{faqs.map((faq) => (
								<article key={faq.question} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
									<h3 className="text-base font-semibold">{faq.question}</h3>
									<p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{faq.answer}</p>
								</article>
							))}
						</div>
					</section>

					<section className="mt-20 rounded-3xl border border-[var(--border)] bg-[linear-gradient(140deg,var(--card)_0%,var(--accent)_100%)] p-8 text-center shadow-[0_16px_36px_rgba(10,22,40,0.14)] backdrop-blur-md sm:p-12">
						<h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Você organiza a pelada. O bot organiza o resto.</h2>
						<p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
							Chega de ser o contador da pelada. Coloca no automático e volta a curtir o jogo.
						</p>
						<Link
							to="/criar-conta"
							className="mx-auto mt-8 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-8 py-3 text-base font-semibold text-[var(--primary-foreground)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,214,111,0.4)]"
						>
							Testar grátis por 30 dias
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</section>
				</main>

				<footer className="border-t border-[var(--border)] bg-[var(--background)] py-8 backdrop-blur-sm">
					<div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-3 px-4 text-sm text-[var(--muted-foreground)] sm:grid-cols-4 lg:grid-cols-8 lg:px-8">
						<a
							href="#topo"
							onClick={(event) => handleSmoothAnchorClick(event, 'topo')}
							className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]"
						>
							Topo
						</a>
						<a
							href="#como-funciona"
							onClick={(event) => handleSmoothAnchorClick(event, 'como-funciona')}
							className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]"
						>
							Como funciona
						</a>
						<a
							href="#beneficios"
							onClick={(event) => handleSmoothAnchorClick(event, 'beneficios')}
							className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]"
						>
							Benefícios
						</a>
						<a
							href="#prints"
							onClick={(event) => handleSmoothAnchorClick(event, 'prints')}
							className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]"
						>
							Prints
						</a>
						<a
							href="#prova"
							onClick={(event) => handleSmoothAnchorClick(event, 'prova')}
							className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]"
						>
							Resultados
						</a>
						<a
							href="#preco"
							onClick={(event) => handleSmoothAnchorClick(event, 'preco')}
							className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]"
						>
							Preço
						</a>
						<Link to="/login" className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]">Entrar</Link>
						<Link to="/criar-conta" className="min-h-11 cursor-pointer transition duration-200 hover:text-[var(--foreground)]">Teste grátis</Link>
					</div>
					<p className="mx-auto mt-4 max-w-[1440px] px-4 text-sm text-[var(--muted-foreground)] lg:px-8">
						© 2026 Faz o Simples. Feito para quem vive o futebol amador.
					</p>
				</footer>
			</div>
		</div>
	);
};

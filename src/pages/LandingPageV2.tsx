import {
	ArrowRight,
	BarChart3,
	CheckCircle2,
	Users,
	Wallet,
	Zap,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const vars: CSSProperties = {
	['--bg' as string]: '#07090E',
	['--surface' as string]: '#0F1420',
	['--surface-2' as string]: '#161D2E',
	['--border' as string]: '#1E2A42',
	['--muted' as string]: '#8A9BBF',
	['--fg' as string]: '#EFF4FF',
	['--lime' as string]: '#A3FF12',
	['--lime-dim' as string]: '#7ACC00',
	['--cyan' as string]: '#35D0FF',
	['--lime-fg' as string]: '#060A00',
};

const painPoints = [
	'"Galera, quem vai?" e ninguém responde',
	'Confirmação em cima da hora e sempre falta 1',
	'Mensalista misturado com avulso',
	'Cobrança de Pix virando dor de cabeça',
	'Time montado no improviso',
	'Churrasco pós-jogo sem organização',
];

const steps = [
	{
		num: '01',
		title: 'Adicione no grupo',
		body: 'Você conecta o bot no WhatsApp da sua pelada. Leva menos de 5 minutos.',
	},
	{
		num: '02',
		title: 'Confirmação automática',
		body: 'Ele organiza lista, reservas e convidados com os comandos do grupo.',
	},
	{
		num: '03',
		title: 'Joga em paz',
		body: 'Você acompanha mensalistas, Pix, times e churrasco em um painel simples.',
	},
];

const features = [
	{
		num: '01',
		title: 'Lista automática no grupo',
		body: 'Comandos simples no WhatsApp para confirmar, desistir e adicionar convidado sem confusão no chat.',
		icon: Users,
		color: 'var(--lime)',
	},
	{
		num: '02',
		title: 'Mensalistas e avulsos separados',
		body: 'Visualize rapidamente quem é fixo e quem é avulso para evitar erro na hora de fechar a rodada.',
		icon: CheckCircle2,
		color: 'var(--cyan)',
	},
	{
		num: '03',
		title: 'Pix e financeiro sem planilha',
		body: 'Controle pagamentos, pendências, créditos e receita do jogo em um painel claro e direto.',
		icon: Wallet,
		color: 'var(--lime)',
	},
	{
		num: '04',
		title: 'Times equilibrados por rating',
		body: 'Sorteio inteligente para reduzir desequilíbrio e discussão antes da bola rolar.',
		icon: BarChart3,
		color: 'var(--cyan)',
	},
];

const testimonials = [
	{
		quote: 'Antes eu perdia horas cobrando presença. Agora a lista se organiza quase sozinha.',
		name: 'Rafael',
		role: 'organizador semanal',
	},
	{
		quote: 'A parte chata sumiu. Hoje eu jogo mais e resolvo menos no grupo.',
		name: 'Diego',
		role: '32 anos',
	},
	{
		quote: 'Por R$49, eu comprei paz. Vale cada centavo para quem organiza.',
		name: 'Marcelo',
		role: 'admin de grupo',
	},
];

const faqs = [
	{
		q: 'Funciona em qualquer grupo de WhatsApp?',
		a: 'Sim. Basta adicionar o bot no grupo da sua pelada e começar a usar. Leva menos de 5 minutos.',
	},
	{
		q: 'O que acontece depois dos 30 dias de teste?',
		a: 'Você escolhe um plano e continua. Se não quiser continuar, o bot simplesmente para de responder — sem cobrança automática, sem cartão cadastrado.',
	},
	{
		q: 'Meus jogadores precisam fazer alguma coisa?',
		a: 'Só digitar o comando no grupo. /bora pra entrar, /desistir pra sair. Não precisa instalar nada.',
	},
	{
		q: 'Precisa instalar aplicativo?',
		a: 'Não. Tudo acontece dentro do WhatsApp e no seu painel web.',
	},
	{
		q: 'Posso cancelar quando quiser?',
		a: 'Sim. Sem fidelidade, sem multa. Cancela em 1 clique.',
	},
	{
		q: 'É seguro?',
		a: 'Sim. O bot só acessa os comandos que você ativa. Não lê outras mensagens do grupo.',
	},
];

export const LandingPageV2 = () => {
	const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		const el = document.getElementById(id);
		if (!el) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) { el.scrollIntoView({ block: 'start' }); return; }
		const start = window.scrollY;
		const end = el.getBoundingClientRect().top + window.scrollY - 80;
		const dist = end - start;
		const dur = 900;
		let t0: number | null = null;
		const ease = (p: number) => p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
		const tick = (ts: number) => {
			if (!t0) t0 = ts;
			const p = Math.min((ts - t0) / dur, 1);
			window.scrollTo(0, start + dist * ease(p));
			if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	};

	const tickerContent = [...painPoints, ...painPoints];

	return (
		<div id="topo" style={vars} className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--fg)] antialiased">

			{/* ── Marquee keyframes ── */}
			<style>{`
				@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
				.ticker-track { animation: ticker 28s linear infinite; }
				.ticker-track:hover { animation-play-state: paused; }
				@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
				.float { animation: float 4s ease-in-out infinite; }
				@keyframes pulse-lime { 0%,100% { box-shadow: 0 0 0 0 rgba(163,255,18,0); } 50% { box-shadow: 0 0 24px 4px rgba(163,255,18,0.22); } }
				.pulse-lime { animation: pulse-lime 3s ease-in-out infinite; }
			`}</style>

			{/* ── Ambient glows ── */}
			<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[var(--lime)] opacity-[0.06] blur-[140px]" />
				<div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[var(--cyan)] opacity-[0.07] blur-[130px]" />
			</div>

			{/* ═══════════════════════════════════════════════
			    NAV
			══════════════════════════════════════════════════ */}
			<header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
				<nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					{/* Logo */}
					<div className="flex items-center gap-3">
						<img src={logo} alt="Logo Faz o Simples" className="h-9 w-9 rounded-xl object-contain" />
						<div className="hidden sm:block">
							<p className="text-sm font-bold leading-none tracking-tight">Faz o Simples</p>
							<p className="mt-0.5 text-xs text-[var(--muted)]">Bot de pelada no WhatsApp</p>
						</div>
					</div>

					{/* Links */}
					<div className="hidden items-center gap-1 lg:flex">
						{[
							['Como funciona', 'como-funciona'],
							['Benefícios', 'beneficios'],
							['Resultados', 'prova'],
							['Preço', 'preco'],
						].map(([label, id]) => (
							<a
								key={id}
								href={`#${id}`}
								onClick={(e) => smoothScroll(e, id)}
								className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
							>
								{label}
							</a>
						))}
					</div>

					{/* CTAs */}
					<div className="flex items-center gap-2">
						<Link
							to="/login"
							className="hidden rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition-all hover:border-[var(--cyan)] hover:text-[var(--cyan)] sm:inline-flex"
						>
							Entrar
						</Link>
						<Link
							to="/criar-conta"
							className="pulse-lime inline-flex items-center gap-2 rounded-lg bg-[var(--lime)] px-4 py-2 text-sm font-bold text-[var(--lime-fg)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(163,255,18,0.4)]"
						>
							<Zap className="h-4 w-4" aria-hidden />
							<span className="hidden sm:inline">Teste Grátis</span>
							<span className="sm:hidden">Testar</span>
						</Link>
					</div>
				</nav>
			</header>

			<main>
				{/* ═══════════════════════════════════════════════
				    HERO
				══════════════════════════════════════════════════ */}
				<section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
					{/* Grid rule background */}
					<div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.08]" />

					<div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
						{/* Left col */}
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border border-[var(--lime)]/30 bg-[var(--lime)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--lime)]">
								<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--lime)]" />
								Oferta para os 50 primeiros grupos
							</div>

							<h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
								Organize{' '}
								<span className="relative inline-block">
									<span className="relative z-10 text-[var(--lime)]">sua pelada</span>
									<span
										aria-hidden
										className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[var(--lime)] opacity-60"
									/>
								</span>
								<br />
								no automático.
							</h1>

							<p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-[var(--muted)]">
								Confirma presença, separa mensalistas, controla Pix e monta os times{' '}
								<strong className="text-[var(--fg)]">sem planilha</strong> — direto no WhatsApp.
							</p>

							<div className="mt-8 flex flex-wrap gap-3">
								<Link
									to="/criar-conta"
									className="inline-flex items-center gap-2 rounded-xl bg-[var(--lime)] px-6 py-3.5 text-base font-bold text-[var(--lime-fg)] shadow-[0_0_40px_rgba(163,255,18,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(163,255,18,0.4)]"
								>
									Quero testar grátis por 30 dias
									<ArrowRight className="h-5 w-5" aria-hidden />
								</Link>
								<a
									href="#como-funciona"
									onClick={(e) => smoothScroll(e, 'como-funciona')}
									className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-base font-semibold text-[var(--fg)] transition-all hover:-translate-y-0.5 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
								>
									Ver como funciona
								</a>
							</div>

							<p className="mt-5 text-sm font-medium text-[var(--muted)]">
								Sem cartão · Sem fidelidade · Começa em minutos
							</p>

							{/* Mini stats */}
							<div className="mt-8 flex gap-6">
								<div>
									<p className="text-2xl font-black text-[var(--lime)]">+500</p>
									<p className="text-xs text-[var(--muted)]">jogadores organizados</p>
								</div>
								<div className="w-px bg-[var(--border)]" />
								<div>
									<p className="text-2xl font-black text-[var(--cyan)]">+100</p>
									<p className="text-xs text-[var(--muted)]">peladas automatizadas</p>
								</div>
								<div className="w-px bg-[var(--border)]" />
								<div>
									<p className="text-2xl font-black text-[var(--fg)]">0</p>
									<p className="text-xs text-[var(--muted)]">planilhas necessárias</p>
								</div>
							</div>
						</div>

						{/* Right col — WhatsApp mock */}
						<div className="float mx-auto w-full max-w-md">
							<div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
								{/* Chat header */}
								<div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lime)] text-sm font-black text-[var(--lime-fg)]">⚽</div>
									<div>
										<p className="text-sm font-bold">Pelada do Zé</p>
										<p className="text-xs text-[var(--muted)]">28 participantes</p>
									</div>
									<div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
								</div>

								{/* Chat messages */}
								<div className="space-y-3 p-4">
									{/* Incoming command */}
									<div className="flex flex-col items-start gap-1">
										<p className="text-xs text-[var(--muted)]">Rafael</p>
										<div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[var(--surface-2)] px-4 py-2.5">
											<p className="font-mono text-sm font-bold text-[var(--fg)]">/bora</p>
										</div>
									</div>

									{/* Bot response */}
									<div className="flex flex-col items-end gap-1">
										<p className="text-xs text-[var(--muted)]">Bot</p>
										<div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-[var(--lime)]/20 bg-[var(--lime)]/10 px-4 py-2.5">
											<p className="text-sm text-[var(--fg)]">
												Rafael entrou na lista. <strong className="text-[var(--lime)]">(8/16)</strong> ✅
											</p>
										</div>
									</div>

									{/* Incoming command */}
									<div className="flex flex-col items-start gap-1">
										<p className="text-xs text-[var(--muted)]">Diego</p>
										<div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[var(--surface-2)] px-4 py-2.5">
											<p className="font-mono text-sm font-bold text-[var(--fg)]">/convidado João</p>
										</div>
									</div>

									{/* Bot response */}
									<div className="flex flex-col items-end gap-1">
										<p className="text-xs text-[var(--muted)]">Bot</p>
										<div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-[var(--lime)]/20 bg-[var(--lime)]/10 px-4 py-2.5">
											<p className="text-sm text-[var(--fg)]">
												João (convidado) entrou. <strong className="text-[var(--lime)]">(9/16)</strong> 👤
											</p>
										</div>
									</div>

									{/* Incoming command */}
									<div className="flex flex-col items-start gap-1">
										<p className="text-xs text-[var(--muted)]">Marcelo</p>
										<div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-[var(--surface-2)] px-4 py-2.5">
											<p className="font-mono text-sm font-bold text-[var(--fg)]">/times</p>
										</div>
									</div>

									{/* Bot response — teams */}
									<div className="flex flex-col items-end gap-1">
										<p className="text-xs text-[var(--muted)]">Bot</p>
										<div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-[var(--cyan)]/20 bg-[var(--surface-2)] px-4 py-3">
											<p className="text-xs font-bold uppercase tracking-wide text-[var(--cyan)]">Times sorteados ⚽</p>
											<p className="mt-2 text-sm font-semibold text-[var(--lime)]">Time 1</p>
											<p className="text-xs text-[var(--muted)]">Rafael, Diego, Marcelo, Lucas, André</p>
											<p className="mt-1.5 text-sm font-semibold text-[var(--cyan)]">Time 2</p>
											<p className="text-xs text-[var(--muted)]">João, Pedro, Carlos, Felipe, Bruno</p>
										</div>
									</div>
								</div>

								{/* Dashboard strip */}
								<div className="border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className="text-xs text-[var(--muted)]">Receita do jogo</p>
											<p className="text-lg font-black text-[var(--lime)]">R$ 1.240</p>
										</div>
										<div className="flex-1">
											<div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
												<div className="h-full w-[84%] rounded-full bg-gradient-to-r from-[var(--lime)] to-[var(--cyan)]" />
											</div>
											<p className="mt-1 text-right text-xs text-[var(--muted)]">84% pagamentos confirmados</p>
										</div>
									</div>
									<div className="mt-2 grid grid-cols-2 gap-2">
										<div className="rounded-lg bg-[var(--border)]/40 px-3 py-2">
											<p className="text-xs text-[var(--muted)]">Confirmados</p>
											<p className="text-xl font-black text-[var(--lime)]">28</p>
										</div>
										<div className="rounded-lg bg-[var(--border)]/40 px-3 py-2">
											<p className="text-xs text-[var(--muted)]">Fila de espera</p>
											<p className="text-xl font-black text-[var(--cyan)]">06</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    TRUST BAR
				══════════════════════════════════════════════════ */}
				<div className="border-y border-[var(--border)] bg-[var(--surface)]">
					<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 py-4 sm:px-6">
						{[
							'✅ 100% dentro do WhatsApp',
							'⚡ Menos estresse na organização',
							'🎯 Menos de R$1 por jogador',
							'🔒 Sem acesso às mensagens do grupo',
						].map((item) => (
							<p key={item} className="text-sm font-semibold text-[var(--muted)]">
								{item}
							</p>
						))}
					</div>
				</div>

				{/* ═══════════════════════════════════════════════
				    PAIN SECTION + MARQUEE
				══════════════════════════════════════════════════ */}
				<section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lime)]">O problema</p>
						<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
							Se toda semana sobra pra você, isso aqui é pra você.
						</h2>
						<p className="mt-4 text-lg text-[var(--muted)]">
							Se você não organizar, ninguém organiza.{' '}
							<strong className="text-[var(--fg)]">Sempre sobra pra você.</strong>
						</p>
					</div>

					{/* Marquee ticker */}
					<div className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4">
						<div className="ticker-track flex w-max gap-6 px-6">
							{tickerContent.map((item, i) => (
								<div
									key={i}
									className="flex shrink-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold text-[var(--muted)]"
								>
									<span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)]" />
									{item}
								</div>
							))}
						</div>
					</div>

					<div className="mt-8 flex flex-wrap items-center gap-4">
						<Link
							to="/criar-conta"
							className="inline-flex items-center gap-2 rounded-xl bg-[var(--lime)] px-6 py-3 text-sm font-bold text-[var(--lime-fg)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(163,255,18,0.38)]"
						>
							Resolver isso agora — grátis
							<ArrowRight className="h-4 w-4" aria-hidden />
						</Link>
						<p className="text-sm text-[var(--muted)]">30 dias grátis · Sem cartão</p>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    HOW IT WORKS
				══════════════════════════════════════════════════ */}
				<section id="como-funciona" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)] py-20">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">Como funciona</p>
						<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
							Em 3 passos, a pelada anda sozinha.
						</h2>

						<div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
							{/* Connector line — desktop */}
							<div
								aria-hidden
								className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent md:block"
							/>

							{steps.map(({ num, title, body }) => (
								<article key={num} className="relative flex flex-col gap-4">
									{/* Big background number */}
									<div
										aria-hidden
										className="absolute -top-6 left-0 select-none text-[7rem] font-black leading-none text-[var(--border)] opacity-60"
									>
										{num}
									</div>
									<div className="relative z-10 mt-10">
										<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lime)] text-sm font-black text-[var(--lime-fg)]">
											{num}
										</div>
										<h3 className="mt-3 text-xl font-black">{title}</h3>
										<p className="mt-2 text-base leading-relaxed text-[var(--muted)]">{body}</p>
									</div>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    FEATURES
				══════════════════════════════════════════════════ */}
				<section id="beneficios" className="scroll-mt-20 py-20">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lime)]">Benefícios</p>
						<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
							O que muda já na primeira semana.
						</h2>

						<div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
							{features.map(({ num, title, body, icon: Icon, color }) => (
								<article
									key={num}
									style={{ '--accent-color': color } as CSSProperties}
									className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-color)] hover:shadow-[0_0_40px_rgba(163,255,18,0.08)]"
								>
									{/* Left accent bar */}
									<div
										className="absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all group-hover:w-1.5"
										style={{ background: color }}
									/>
									<div className="flex items-start gap-5">
										<div
											className="shrink-0 rounded-xl p-3 transition-all group-hover:scale-110"
											style={{ background: `${color}15`, color }}
										>
											<Icon className="h-5 w-5" aria-hidden />
										</div>
										<div>
											<p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
												{num}
											</p>
											<h3 className="mt-1 text-lg font-black leading-snug">{title}</h3>
											<p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
										</div>
									</div>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    COMMANDS DEMO
				══════════════════════════════════════════════════ */}
				<section id="prints" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)] py-20">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="max-w-2xl">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">No dia a dia</p>
							<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
								Tudo dentro do WhatsApp.
							</h2>
							<p className="mt-4 text-lg text-[var(--muted)]">
								Nenhum app novo pra instalar.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
							{[
								{
									label: 'Confirmação de presença',
									color: 'var(--lime)',
									commands: [
										{ cmd: '/bora', res: '→ Rafael entrou na lista. (8/16) ✅' },
										{ cmd: '/convidado João', res: '→ João (convidado) entrou. (9/16) 👤' },
										{ cmd: '/lista', res: '→ Lista completa com confirmados e reserva' },
									],
								},
								{
									label: 'Controle de pagamento',
									color: 'var(--cyan)',
									commands: [
										{ cmd: '/pago', res: '→ Rafael marcado como pago ✅' },
										{ cmd: '/debitos', res: '→ Lista quem ainda não pagou' },
										{ cmd: '/saldo', res: '→ Receita total do grupo: R$ 1.280' },
									],
								},
								{
									label: 'Sorteio de times',
									color: 'var(--lime)',
									commands: [
										{ cmd: '/times', res: '→ Times sorteados por rating ⚽' },
										{ cmd: '🟢 Time 1', res: 'Rafael, Diego, Marcelo, Lucas, André' },
										{ cmd: '🔵 Time 2', res: 'João, Pedro, Carlos, Felipe, Bruno' },
									],
								},
							].map(({ label, color, commands }) => (
								<article key={label} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
									<div
										className="border-b border-[var(--border)] px-5 py-3"
										style={{ borderLeftWidth: 3, borderLeftColor: color }}
									>
										<p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
											{label}
										</p>
									</div>
									<div className="space-y-2 p-4">
										{commands.map(({ cmd, res }) => (
											<div key={cmd} className="rounded-xl bg-[var(--surface)] p-3">
												<p className="font-mono text-sm font-bold text-[var(--fg)]">{cmd}</p>
												<p className="mt-1 text-xs text-[var(--muted)]">{res}</p>
											</div>
										))}
									</div>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    TESTIMONIALS
				══════════════════════════════════════════════════ */}
				<section id="prova" className="scroll-mt-20 py-20">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lime)]">Resultados</p>
						<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
							Quem organiza pelada de verdade já sentiu a diferença.
						</h2>

						<div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
							{testimonials.map(({ quote, name, role }, i) => (
								<article
									key={name}
									className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 ${i === 1 ? 'border-[var(--lime)]/40 bg-[var(--lime)]/5' : ''}`}
								>
									{/* Big quote mark */}
									<p
										aria-hidden
										className="absolute -top-4 left-4 select-none text-[8rem] font-black leading-none text-[var(--border)] opacity-50"
									>
										"
									</p>
									<p className="relative z-10 text-base leading-relaxed text-[var(--fg)]">"{quote}"</p>
									<div className="mt-6 flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lime)]/20 text-sm font-black text-[var(--lime)]">
											{name[0]}
										</div>
										<div>
											<p className="text-sm font-bold">{name}</p>
											<p className="text-xs text-[var(--muted)]">{role}</p>
										</div>
									</div>
								</article>
							))}
						</div>

						{/* Stats callout */}
						<div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
							{[
								{ n: '30 dias', label: 'de teste sem cartão' },
								{ n: '0', label: 'planilhas necessárias' },
								{ n: '+500', label: 'jogadores organizados' },
								{ n: '+100', label: 'peladas automatizadas' },
							].map(({ n, label }) => (
								<div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
									<p className="text-3xl font-black text-[var(--lime)]">{n}</p>
									<p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    PRICING
				══════════════════════════════════════════════════ */}
				<section id="preco" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--surface)] py-20">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lime)]">Preço</p>
							<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
								Preço simples. Sem surpresa.
							</h2>
							<p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
								30 dias grátis sem cartão. Depois, menos que uma pizza por mês.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
							{/* Free */}
							<article className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-7">
								<p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Grátis</p>
								<div className="mt-3 flex items-end gap-2">
									<span className="text-5xl font-black">R$ 0</span>
									<span className="mb-1.5 text-sm text-[var(--muted)]">/ 30 dias</span>
								</div>
								<p className="mt-1 text-sm text-[var(--muted)]">Sem cartão. Começa agora.</p>
								<ul className="mt-8 flex-1 space-y-3 text-sm text-[var(--muted)]">
									{['1 workspace', 'Até 20 jogadores', 'Todos os comandos do bot', 'Gestão de jogos e lista', 'Dashboard básico'].map((f) => (
										<li key={f} className="flex items-center gap-2.5">
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--lime)]" aria-hidden />
											{f}
										</li>
									))}
								</ul>
								<Link
									to="/criar-conta"
									className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--fg)] transition-all hover:border-[var(--lime)] hover:text-[var(--lime)]"
								>
									Começar grátis
									<ArrowRight className="h-4 w-4" aria-hidden />
								</Link>
							</article>

							{/* Básico — featured */}
							<article className="relative flex flex-col rounded-3xl border-2 border-[var(--lime)] bg-[var(--bg)] p-7 shadow-[0_0_60px_rgba(163,255,18,0.15)]">
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--lime)] px-5 py-1.5 text-xs font-black text-[var(--lime-fg)]">
									Mais popular
								</div>
								<p className="text-xs font-bold uppercase tracking-wider text-[var(--lime)]">Básico</p>
								<div className="mt-3 flex items-end gap-2">
									<span className="text-5xl font-black">R$ 49</span>
									<span className="mb-1.5 text-sm text-[var(--muted)]">/ mês</span>
								</div>
								<p className="mt-1 text-sm text-[var(--muted)]">ou R$ 490/ano — 2 meses grátis</p>
								<p className="mt-1 text-xs font-bold text-[var(--lime)]">R$ 1,63 por jogador/mês (30 jogadores)</p>
								<ul className="mt-8 flex-1 space-y-3 text-sm text-[var(--muted)]">
									{['1 workspace', 'Jogadores ilimitados', 'Bot completo (todos os comandos)', 'Gestão financeira (mensalidades, PIX)', 'Dashboard + relatórios', 'Churrasco e eventos'].map((f) => (
										<li key={f} className="flex items-center gap-2.5">
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--lime)]" aria-hidden />
											{f}
										</li>
									))}
								</ul>
								<Link
									to="/criar-conta"
									className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--lime)] text-sm font-bold text-[var(--lime-fg)] shadow-[0_0_30px_rgba(163,255,18,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(163,255,18,0.38)]"
								>
									Testar 30 dias grátis
									<ArrowRight className="h-4 w-4" aria-hidden />
								</Link>
							</article>

							{/* Pro */}
							<article className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-7">
								<p className="text-xs font-bold uppercase tracking-wider text-[var(--cyan)]">Pro</p>
								<div className="mt-3 flex items-end gap-2">
									<span className="text-5xl font-black">R$ 97</span>
									<span className="mb-1.5 text-sm text-[var(--muted)]">/ mês</span>
								</div>
								<p className="mt-1 text-sm text-[var(--muted)]">ou R$ 970/ano — 2 meses grátis</p>
								<p className="mt-1 text-xs font-bold text-[var(--cyan)]">Para quem gerencia mais de 1 grupo</p>
								<ul className="mt-8 flex-1 space-y-3 text-sm text-[var(--muted)]">
									{['Até 3 workspaces', 'Tudo do Básico', 'Ratings e avaliações de jogadores', 'Relatórios avançados', 'Suporte prioritário via WhatsApp'].map((f) => (
										<li key={f} className="flex items-center gap-2.5">
											<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--cyan)]" aria-hidden />
											{f}
										</li>
									))}
								</ul>
								<Link
									to="/criar-conta"
									className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--fg)] transition-all hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
								>
									Começar grátis
									<ArrowRight className="h-4 w-4" aria-hidden />
								</Link>
							</article>
						</div>

						<p className="mt-6 text-center text-sm text-[var(--muted)]">
							Todos os planos começam com 30 dias grátis · Sem cartão · Cancele quando quiser
						</p>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    FAQ
				══════════════════════════════════════════════════ */}
				<section className="py-20">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lime)]">FAQ</p>
						<h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
							Perguntas rápidas antes de começar.
						</h2>

						<div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
							{faqs.map(({ q, a }) => (
								<article
									key={q}
									className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--lime)]/30"
								>
									<h3 className="text-base font-black">{q}</h3>
									<p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{a}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* ═══════════════════════════════════════════════
				    FINAL CTA
				══════════════════════════════════════════════════ */}
				<section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
					<div className="relative overflow-hidden rounded-3xl border border-[var(--lime)]/20 bg-[var(--surface)] p-10 text-center sm:p-16">
						{/* Background grid */}
						<div
							aria-hidden
							className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.06]"
						/>
						{/* Corner glows */}
						<div aria-hidden className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[var(--lime)] opacity-[0.07] blur-[80px]" />
						<div aria-hidden className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[var(--cyan)] opacity-[0.07] blur-[80px]" />

						<div className="relative z-10">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lime)]">Você organiza a pelada</p>
							<h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
								O bot organiza o resto.
							</h2>
							<p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
								Chega de ser o contador da pelada. Coloca no automático e volta a curtir o jogo.
							</p>
							<Link
								to="/criar-conta"
								className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[var(--lime)] px-8 py-4 text-base font-black text-[var(--lime-fg)] shadow-[0_0_40px_rgba(163,255,18,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_44px_rgba(163,255,18,0.45)]"
							>
								<Zap className="h-5 w-5" aria-hidden />
								Testar grátis por 30 dias
							</Link>
							<p className="mt-4 text-sm text-[var(--muted)]">Sem cartão · Sem fidelidade · Cancele quando quiser</p>
						</div>
					</div>
				</section>
			</main>

			{/* ═══════════════════════════════════════════════
			    FOOTER
			══════════════════════════════════════════════════ */}
			<footer className="border-t border-[var(--border)] bg-[var(--surface)]">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="flex flex-wrap items-start justify-between gap-8">
						{/* Brand */}
						<div className="flex items-center gap-3">
							<img src={logo} alt="Logo Faz o Simples" className="h-9 w-9 rounded-xl object-contain" />
							<div>
								<p className="text-sm font-bold">Faz o Simples</p>
								<p className="text-xs text-[var(--muted)]">Bot de pelada no WhatsApp</p>
							</div>
						</div>

						{/* Links */}
						<nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
							{[
								['Topo', 'topo'],
								['Como funciona', 'como-funciona'],
								['Benefícios', 'beneficios'],
								['Resultados', 'prova'],
								['Preço', 'preco'],
							].map(([label, id]) => (
								<a
									key={id}
									href={`#${id}`}
									onClick={(e) => smoothScroll(e, id)}
									className="transition-colors hover:text-[var(--fg)]"
								>
									{label}
								</a>
							))}
							<Link to="/login" className="transition-colors hover:text-[var(--fg)]">Entrar</Link>
							<Link to="/criar-conta" className="font-semibold text-[var(--lime)] transition-colors hover:text-[var(--lime-dim)]">Teste grátis</Link>
						</nav>
					</div>

					<div className="mt-8 border-t border-[var(--border)] pt-6">
						<p className="text-sm text-[var(--muted)]">
							© 2026 Faz o Simples. Feito para quem vive o futebol amador.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

<svelte:head>
	<link rel="stylesheet" href="/styles/menu.css">
	<link href="https://fonts.cdnfonts.com/css/the-wild-breath-of-zelda" rel="stylesheet">
</svelte:head>

<script>
	import { trocarEstadoDoJogo } from './Estado.js'

	function sairDoJogo() {
		window.close()

		if (!window.closed) {
			window.location.href = 'about:blank'
		}
	}
</script>

<main class="menu-screen" aria-label="Menu principal Maze of Mystery II">
	<div class="menu-overlay" aria-hidden="true"></div>

	<header class="menu-header">
		<img class="menu-logo" src="/images/logo.png" alt="Maze of Mystery II" />
	</header>

	<section class="menu-actions" aria-label="Ações do menu">
		<button class="menu-btn menu-btn-primary" on:click={() => trocarEstadoDoJogo('historia')}>
			Novo Jogo
		</button>

		<button class="menu-btn" disabled aria-disabled="true" title="Disponível em breve">
			Continuar
		</button>

		<button class="menu-btn" on:click={() => trocarEstadoDoJogo('ajuda')}>
			Como Jogar
		</button>

		<button class="menu-btn" on:click={() => trocarEstadoDoJogo('sobre')}>
			Créditos
		</button>

		<button class="menu-btn menu-btn-danger" on:click={sairDoJogo}>
			Sair
		</button>
	</section>
</main>


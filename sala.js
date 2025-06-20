(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//Dependencias

require('babel-polyfill');

var _mousetrap = require('mousetrap');

var _mousetrap2 = _interopRequireDefault(_mousetrap);

var _conexao = require('conexao');

var _conexao2 = _interopRequireDefault(_conexao);

var _eventos = require('eventos');

var _eventos2 = _interopRequireDefault(_eventos);

var _som = require('som');

var _som2 = _interopRequireDefault(_som);

var _scroll = require('scroll');

var _scroll2 = _interopRequireDefault(_scroll);

var _desenho = require('desenho');

var _desenho2 = _interopRequireDefault(_desenho);

var _player = require('player');

var _player2 = _interopRequireDefault(_player);

var _jogo = require('jogo');

var _jogo2 = _interopRequireDefault(_jogo);

var _ofensa = require('ofensa');

var _ofensa2 = _interopRequireDefault(_ofensa);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Variaveis globais
var som;
var usuario = false;
var tempoInicio;
var listaUsuarios = [];
var listaIgnorados = [];
var listaVazios = [];
var linhas = [];
var respostasEnviadas = [];
var mensagensEnviadas = [];
var miniatura;
var arrProximos = [];
var jogadoresOrdem = 0;
var controleVideo = false;
var videoTracks;

var notificacoes = false;
var permissaoNotificacao = false;
var timerNotificacoes;

var timeMsgChat = 0;
var timeMsgResp = 0;
var timerTempoFim = false;
var timeBloqUser = [];

//elementos
var elemTexto;
var elemTexto2;
var elemTelaCanvas;
var elemCorEscolhida;
var elemDegrade;
var elemTextoAlerta;
var elemCanvas;
var elemMiniatura;
var elemFerramentas;
var elemTempo;
var elemTempoBloco;
var elemRespostas;
var elemRespostasBloco;
var elemConversa;
var elemDica;
var elemDicaBt;

var scrollUsuarios = false;
var scrollRespostas = false;
var scrollChat = false;
var scrollDesenho = $('#desenho');

var zoom = 1;
var zoomPos = 1;
var saindoSala = false;

var desenho = false;
var conexao;
var player;
var server;
var jogo;

var fonteRespostas = 15;
var fonteChat = 15;

window.onbeforeunload = function () {
	if (!saindoSala) return idioma.perguntaSair;
};
window.addEventListener("unload", function () {
	jogo.sair(0);
}, false);

carregando();
dimensoes();
window.addEventListener('resize', dimensoes, false);

var fator;

function dimensoes() {
	var MARGEM = 10;
	var LARGURA = 1142 + MARGEM * 2;
	var ALTURA = 746 + MARGEM * 2;
	var BANNER_LARGURA = 160;

	var larguraTela = window.innerWidth;
	if (larguraTela < 1178) larguraTela = 1178;
	var alturaTela = window.innerHeight;
	if (alturaTela < 600) alturaTela = 600;

	fator = alturaTela / ALTURA;
	if (fator * LARGURA > larguraTela - BANNER_LARGURA) {
		fator = (larguraTela - BANNER_LARGURA) / LARGURA;
	}

	if (fator < 1) {
		$('#tela').style.transform = 'translate(-50%, -50%) scale(' + fator + ')';
		$('#limite').style.minWidth = BANNER_LARGURA + LARGURA * fator + 'px';
		$('#limite').style.minHeight = ALTURA * fator + 'px';
	} else {
		fator = 1;
		$('#tela').style.transform = '';
		$('#limite').style.minWidth = '';
		$('#limite').style.minHeight = '';
	}

	// $('#bannerLateral .banner').style.marginTop = 61 * fator + 'px';
	$('#bannerLateral2 .banner').style.marginTop = 61 * fator + 'px';

	//agregando bordas aos banners
	if (window.innerWidth > LARGURA + MARGEM * 4 + BANNER_LARGURA) {
		// $('#bannerLateral').style.marginLeft = MARGEM + 'px';
		$('#bannerLateral2').style.marginRight = MARGEM + 'px';
	} else {
		// $('#bannerLateral').style.marginLeft = '';
		$('#bannerLateral2').style.marginRight = '';
	}

	zoom = fator;
	if (desenho) desenho.zoomTela = 821 / 510 * fator;
}

window.addEventListener('DOMContentLoaded', function () {
	conexao = new _conexao2.default({
		timeout: 6000,
		removerCache: true
	});
	conexao.chamada(CAMINHO + 'check.php', '', 'GET', function (obj) {
		obj = JSON.parse(obj);

		if (obj) {
			//gravando id da sessao
			// sessao = obj.sessao;
			// window.localStorage.setItem('sessao',obj.sessao);

			//checando se esta logado
			if (obj.login) {
				var fundos = ['azul', 'cinza', 'vermelho', 'laranja', 'verde', 'rosa'];
				document.body.className = fundos[obj.login.fundo];

				if (obj.login.textoRespostas) {
					$('#respostas .historico').style.fontSize = obj.login.textoRespostas + 'px';
					fonteRespostas = parseInt(obj.login.textoRespostas);
				}

				if (obj.login.textoChat) {
					$('#chat .historico').style.fontSize = obj.login.textoChat + 'px';
					fonteChat = parseInt(obj.login.textoChat);
				}

				usuario = true;
			}

			//checando se esta jogando
			if (obj.jogo) {
				if (obj.admin) {
					$('#respostas').className = 'admin';
					var elem = $('#respostas input');
					elem.value = 'Admin';
					elem.disabled = true;
				}
				startCanvas(obj.jogo, obj.admin);
			}
		}
	});

	som = new _som2.default({
		base: '/audio/'
	});
	som.load(['acertoOutro', 'acertoVoce', 'dica', 'entrada', 'vezOutro', 'vezVoce2', 'fimRodada', 'saida', 'fimTempo']);

	var fundos = _('#tema .cor');
	for (var cont = 0; cont < fundos.length; cont++) {
		fundos[cont].addEventListener('click', function () {
			fundoCor(this.getAttribute('codigo'), this.getAttribute('valor'));
		}, false);
	}

	$('#icones .telaCheia').addEventListener('click', fullscreen, false);
	$('#icones .sair').addEventListener('click', fecharJogo, false);

	$('#denunciar').addEventListener('click', denunciar, false);
	$('#cancelarDesenho').addEventListener('click', cancelarDesenho, false);

	// ATIVAR MODO GAMEPLAY
	$('#gameplay').addEventListener('change', ativarGameplay, false);
	$('#usuarios').addEventListener('transitionend', function () {
		scrollUsuarios.refresh();
	}, false);

	// ATIVAR MODO LIVE
	$('#modoLive').addEventListener('change', ativarLive, false);

	// ATIVAR SOM
	if (!localStorage.getItem('somDesativado')) $('#som').checked = true;else som.desativar();

	$('#som').addEventListener('change', ativarSom, false);

	// ATIVAR NOTIFICAÃ‡Ã•ES
	$('#notificacoes').addEventListener('change', ativarNotificacao, false);

	var cores = _('#cores .cor');
	for (var cont = 0; cont < cores.length; cont++) {
		cores[cont].addEventListener('click', function () {
			sel_cor(this.getAttribute('codigo'), true);
		}, false);
	}
	jscolor.selCor = sel_cor;

	var ferramentas = _('#ferramentas-desenho .ico');
	for (var cont = 0; cont < 9; cont++) {
		ferramentas[cont].addEventListener('click', function () {
			sel_opcao(parseInt(this.getAttribute('codigo')), true);
		}, false);
	}
	$('#limparTela').addEventListener('click', function () {
		confirma(idioma.limpar, idioma.limparDesenho, idioma.sim, function () {
			desenho.limparTela(true);
			fecharPopup();
		}, idioma.nao, function () {
			fecharPopup();
		});
	}, false);
	$('#zoomIn').addEventListener('click', function () {
		sel_zoom_mais();
	}, false);
	$('#zoomOut').addEventListener('click', function () {
		sel_zoom_menos();
	}, false);
	$('#voltar').addEventListener('click', function () {
		sel_desfazer();
	}, false);
	$('#avancar').addEventListener('click', function () {
		sel_refazer();
	}, false);
	$('#tamanho').addEventListener('change', function () {
		desenho.mudaBorda(this.value, true);
	}, false);
	$('#opacidade').addEventListener('change', function () {
		sel_alpha(this.value, true);
	}, false);

	//selecao de campos de resposta e chat
	$('#respostas .historico').addEventListener('click', function () {
		elemTexto.focus();
	}, false);

	$('#chat .historico').addEventListener('click', function () {
		elemTexto2.focus();
	}, false);

	$('#topo .info').addEventListener('click', function () {
		carregando();
		conexao.chamada('/info_sala.php', 'id_sala=' + jogo.sala, 'GET', function (obj) {
			obj = JSON.parse(obj);

			if (!obj) {
				fecharPopup();
				return;
			}

			var txtDisponibilidades = [idioma.cadastrados, idioma.todosJogadores, idioma.descadastrados];

			$('#infoNome').innerText = obj.nome;
			$('#infoCriador').innerText = obj.criador;
			$('#infoTemas').innerText = obj.nome_base;

			$('#infoMeta').innerText = obj.meta + idioma.pontos2;
			$('#infoSenha').innerText = !!obj.senha ? idioma.sim : idioma.nao;
			$('#infoDificuldade').innerText = obj.dificuldade.replace('0', idioma.facil).replace('1', idioma.media).replace('2', idioma.dificil).replace(/,/g, ', ');;

			$('#infoTempoIntervalo').innerText = obj.intervalo + idioma.segundos;
			$('#infoTempoDesenho').innerText = obj.rodada + idioma.segundos;
			$('#infoDisponibilidade').innerText = txtDisponibilidades[obj.nao_cadastrados];

			$('#popup h3').innerText = idioma.info;
			$('#popup').className = 'popupInfoSala';
		});
	});
}, false);

function fullscreen() {
	var elem = $('#limite');
	if (elem.requestFullscreen) {
		if (!document.fullscreen) elem.requestFullscreen();else document.exitFullscreen();
	} else if (elem.mozRequestFullScreen) {
		if (!document.mozFullScreen) elem.mozRequestFullScreen();else document.mozCancelFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		if (!document.webkitIsFullScreen) elem.webkitRequestFullscreen();else document.webkitExitFullscreen();
	} else if (elem.msRequestFullscreen) {
		if (!document.fullscreen) elem.msRequestFullscreen();else document.msExitFullscreen();
	}
}

/**
 * InicializaÃ§Ã£o do canvas
 */
function startCanvas(dadosSala, admin) {
	//armazenando elementos da tela
	elemTexto = $('#respostas input');
	elemTexto2 = $('#chat input');
	elemTelaCanvas = $('#telaCanvas');
	elemCorEscolhida = $('#cores .corSelecionada div');
	elemDegrade = $('.paletaCores button');
	elemTextoAlerta = $('#alerta');
	elemMiniatura = $('#miniatura');
	//elemFerramentas = $('#ferramentas');
	//elemTempo = $('#tempoBloco div')[0];
	//elemTempoBloco = $('#tempoBloco')[0];
	elemRespostas = $('#respostas .historico .lista');
	elemConversa = $('#chat .historico .lista');
	elemDica = $('#dica .dicaTxt div');
	elemDicaBt = $('#dica .darDica .btDica');

	miniatura = elemMiniatura.getContext("2d");

	//zerando valores
	listaUsuarios = [];
	listaIgnorados = [];
	arrProximos = [];
	jogadoresOrdem = 0;

	//iniciando desenho e scroll referente ao mesmo
	scrollDesenho.scroll = new _scroll2.default(scrollDesenho, {
		scrollHorizontal: true,
		margemVertical: [8, 20],
		margemHorizontal: [8, 8],
		nativo: true
	});

	desenho = new _desenho2.default($('#telaCanvas'), {
		largura: 510,
		altura: 304,
		elems: 1,
		prev: true,
		usoDesfazer: 1,
		usoRefazer: 1,
		retina: 2,
		larguraIni: 821,
		alturaIni: 489
	});
	desenho.zoomTela = 821 / 510 * zoom;
	elemCanvas = $('#telaCanvas canvas');
	desenho.on('selCor', function () {
		//alterando cor escolhida
		sel_cor(desenho.corReal.substr(1));
	});
	desenho.on('startDraw', function () {
		//retirar opcoes de tela (descarta balde e picker)
		if (jogo.vez) {
			var opcaoAtual = desenho.opcao;
			if (opcaoAtual != 7 && opcaoAtual != 8) {
				elemMiniatura.style.display = 'none';
			}
			//mostrar miniatura pos balde
			else if (opcaoAtual == 7) {
					atualizarMiniatura();
				}
		}

		//status undo e redo
		$("#voltar").disabled = false;
		$("#avancar").disabled = true;
	});
	desenho.on('endDraw', function () {
		//mostrar opcoes de tela
		if (jogo.vez) {
			if (desenho.zoom > 1) elemMiniatura.style.display = "block";
			atualizarMiniatura();
		}
	});

	//animacao do desenho de terceiros
	player = new _player2.default(desenho);
	player.iniciar();

	//logica do jogo
	jogo = new _jogo2.default(player, dadosSala, {
		base: ENDERECO,
		sessao: null,
		admin: admin
	});

	jogo.on('avisoInativo', function (cookieAviso) {
		alerta(idioma.inatividade, idioma.avisoInativo, function () {
			jogo.ativar();
			fecharPopup();
		});
	});

	jogo.on('iniciar', function (cookieAviso) {
		//abrir um aviso inicial ao usuario caso seja necessario
		if (jogo.criador) {
			$('#popup .criador input').value = location.href;
			$('#popup .criador button').addEventListener('click', function () {
				var urlStatus = '%23Gartic%20sala%3A%20' + jogo.salaNome.replace(/\s/g, '%20');
				if (jogo.senha) urlStatus += '%20-%20senha%3A%20' + jogo.senha;
				urlStatus += '%20-%20' + 'https://gartic.com.br/'.replace(/\//g, '%2F').replace(':', '%3A') + '0' + jogo.sala + '%20via%20%40Gartic';
				window.open('https://twitter.com/intent/tweet?text=' + urlStatus, '_blank');
			}, false);
			$('#popup h3').innerText = idioma.aviso;
			$('#popup').className = 'popupCriador';
		} else {
			if (jogo.salaFixa != 1 && jogo.salaVisivel) alerta(idioma.aviso, idioma.avisoCriada);else if (!cookieAviso && jogo.salaVisivel) bemVindo();else fecharPopup();
		}
	});

	jogo.on('inicioVez', function () {
		if (jogo.vez) {
			$('#zoomIn').disabled = false;
			if ($('#desenho').className != '') $('#dica').className = 'abrir exibirDica';
		} else $('#denunciar').style.display = 'block';

		$('#desenho').className = '';
	});

	jogo.on('chat', function (msg) {
		var elemento = buscarMensagem(mensagensEnviadas, msg);
		conversaMsg(jogo.loginJogo, msg, null, elemento);
	});

	jogo.on('chatOutro', function (user, msg) {
		if (user.toLowerCase() != 'administracao') {
			if (!listaIgnorados[user.toLowerCase()]) conversaMsg(user, msg);
		} else conversaMsg(user, msg, 'admin');
	});

	jogo.on('resposta', function (msg) {
		var elemento = buscarMensagem(respostasEnviadas, msg);
		respostaMsg(jogo.loginJogo, msg, null, elemento);
	});

	jogo.on('respostaOutro', function (user, msg) {
		if (!listaIgnorados[user.toLowerCase()]) respostaMsg(user, msg);
	});

	jogo.on('perto', function (msg) {
		var elemento = buscarMensagem(respostasEnviadas, msg);
		//estÃ¡ perto
		if (!server.getOcultado()) respostaMsg('', idioma.estaPerto.replace('###', '<strong>' + msg + '</strong>'), 'perto', elemento);else respostaMsg('', idioma.estaPerto2, 'perto', elemento);
		server.proximo(msg);
	});

	jogo.on('invalido', function (msg) {
		var elemento = buscarMensagem(respostasEnviadas, msg);
		respostaMsg(jogo.loginJogo, msg, 'invalido', elemento);
	});

	jogo.on('acerto', function (resposta) {
		som.play('acertoVoce');
		if (!server.getOcultado()) respostaMsg('', idioma.voceAcertou.replace('###', '<strong>' + resposta + '</strong>'), 'acerto'); //VocÃª acertou:
		else respostaMsg('', idioma.voceAcertou2, 'acerto'); //VocÃª acertou:

		server.acertou(resposta);
		elemTexto.disabled = true;
		elemTexto.value = idioma.acertouEscla;
		elemTexto.blur();
		removerEnviadas();
	});

	jogo.on('acertoOutro', function (usuario) {
		som.play('acertoOutro');
		respostaMsg('', idioma.acertou.replace('###', '<strong>' + usuario + '</strong>'), 'acerto'); //User acertou!!!
	});

	jogo.on('todosAcertaram', function () {
		alertaMsg(idioma.obraDeArte, idioma.todosAcertaram2, 'todosAcertaram');
		respostaMsg('', idioma.todosAcertaram, 'sistema'); //Todos acertaram
	});

	jogo.on('primeiroAcerto', function () {
		fecharPopup(true);
		$('#dica').className = 'abrir';
	});

	jogo.on('dica', function (dica, letras, resposta) {
		som.play('dica');

		//exibindo dica
		$('#dica h2').innerText = idioma.dicaLetras.replace('###', letras);
		respostaMsg('', idioma.dica + ' (' + letras + '): ' + dica.join('&nbsp;').replace(/_/g, '__'), "sistema"); //VocÃª deu a dica

		exibirDica(dica, letras > 13, resposta);

		elemDica.className = 'contentSpan';
		elemDica.offsetHeight;
		setTimeout(function () {
			elemDica.className += ' pulsar';
		}, 0);

		//retornando texto
		if (jogo.vez) {
			elemDicaBt.innerText = idioma.dica;
			elemDicaBt.disabled = false;
		}
	});

	jogo.on('dicaFim', function () {
		if (jogo.vez) elemDicaBt.style.display = 'none';
	});

	jogo.on('denuncia', function (proprio, usuario) {
		if (!proprio) respostaMsg('', idioma.denunciouDesenho.replace('###', usuario), 'erro'); //User denunciou o desenho!
		else {
				respostaMsg('', idioma.voceDenunciou, 'erro'); //VocÃª denunciou o desenho!
				$('#denunciar').style.display = 'none';
			}
	});

	jogo.on('vezOutro', function (usuario, tempo) {
		if (jogo.admin) $('#cancelarDesenho').style.display = 'block';else {
			elemTexto.value = '';
			elemTexto.disabled = false;
		}

		som.play('vezOutro');
		alertaMsg(idioma.novaRodada, idioma.vezCom.replace('###', usuario), 'vezOutro', usuario); //Vez de:
		respostaMsg('', idioma.vezSem.replace('###', '<strong>' + usuario + '</strong>'), 'vez'); //Vez de:
		$('#dica h2').innerText = idioma.dica;
		confPadrao();

		server.vez(usuario);

		//Contagem de tempo
		tempoInicio = parseInt(tempo);
		iniciarTempo(jogo.tempoRodada * 1000, tempoInicio / jogo.tempoRodada);
	});

	jogo.on('vez', function (resposta, tempo) {
		som.play('vezVoce2');

		$('#desenho').className = '';
		if (!jogo.admin) {
			elemTexto.disabled = true;
			elemTexto.value = idioma.suaVez2;
		}
		//sel_texto('texto',false);
		$('#desenhar').innerText = idioma.desenhar;
		if (!server.getOcultado()) {
			alertaMsg(idioma.suaVez, resposta, 'vez'); //Vez de:
			notificar(idioma.suaVezPalavra.replace('###', resposta));
			respostaMsg('', idioma.suaVezPalavra.replace('###', '<strong>' + resposta + '</strong>'), 'vez'); //Sua vez, a palavra Ã©:
			exibirDica(null, resposta.length > 14, resposta);
		} else {
			alertaMsg(idioma.suaVez, 'x', 'vez'); //Vez de:
			notificar(idioma.suaVez2);
			respostaMsg('', idioma.suaVez2, 'vez'); //Sua vez, a palavra Ã©:
			exibirDica(['x'], false);
		}
		confPadrao();
		server.resposta(resposta);

		//reiniciando opÃ§Ãµes avanÃ§adas de desenho
		$('#dica h2').innerText = idioma.suaVez;

		//ativando dicas e pular
		// $('.botaoPular').disabled = $('.botaoDica').disabled = false;
		$('#voltar').disabled = $('#avancar').disabled = true;
		$('#zoomIn').disabled = $('#zoomOut').disabled = true;

		//trocando opcoes
		$('#conteudo').className = 'desenhando';

		//contagem de tempo
		tempoInicio = parseInt(tempo);
		iniciarTempo(jogo.tempoRodada * 1000, tempoInicio / jogo.tempoRodada);
	});

	jogo.on('intervalo', function (resposta) {
		if (resposta) respostaMsg('', idioma.aResposta.replace('###', '<strong>' + resposta + '</strong>'), 'sistema'); //A resposta era:
		else {
				//verifica se hÃ¡ um desenhista, caso contrÃ¡rio acabou de entrar no jogo
				if (jogo.desenhistaVez != "" || jogo.vez) respostaMsg('', idioma.naoAcertou, 'sistema'); //NÃ£o houve acertos
			}

		if (!jogo.vez) alertaMsg(idioma.intervalo, idioma.intervaloTextos[Math.floor(Math.random() * idioma.intervaloTextos.length)], 'intervalo'); //Intervalo...
		else {
				$('#desenhar').innerText = idioma.gravar;
				alertaMsg(idioma.intervalo, idioma.gravarDesenho, 'intervaloDesenho'); //Vez de:
			}
	});

	jogo.on('fimRodada', function (fimJogo) {
		som.play('fimRodada');
		fim_rodada(fimJogo);
	});

	jogo.on('inativo', function () {
		if (!jogo.vez) {
			alertaMsg(idioma.inativo, idioma.perdeuVez.replace('###', jogo.desenhistaVez), 'perdeuVez'); //User inativo! Intervalo...
			respostaMsg('', idioma.perdeuVez.replace('###', jogo.desenhistaVez), 'sistema');
		} else {
			alertaMsg(idioma.inativo, idioma.vocePerdeuVez, 'perdeuVez'); //User inativo! Intervalo...
			respostaMsg('', idioma.vocePerdeuVez, 'sistema');
		}
	});

	jogo.on('cancelar', function () {
		alertaMsg(idioma.cancelado, idioma.desenhoCancel, 'cancelado'); //Desenho cancelado!
		respostaMsg('', idioma.msgCancelado, 'sistema'); //Desenho cancelado! Usuarios que...
	});

	jogo.on('pular', function (usuario) {
		var msg;
		if (usuario == '') msg = idioma.vocePulou; //VocÃª pulou a vez
		else msg = idioma.pulouVez.replace('###', usuario); //User pulou a vez

		alertaMsg(idioma.pulou, msg, 'pulou');
		respostaMsg('', msg, 'sistema');
	});

	jogo.on('fimJogo', function (usuario, pontos) {
		alertaMsg(idioma.fimJogo, usuario + ' ' + idioma.venceu, 'fimJogo', usuario); //Fim de jogo! User venceu!
		respostaMsg('', idioma.venceuCom.replace('###', '<strong>' + usuario + '</strong>').replace('###', pontos), 'sistema'); //Fim de jogo! User vence o jogo com X pontos
	});

	jogo.on('entrada', function (usuario) {
		som.play('entrada');
		conversaMsg('', idioma.entrouJogo.replace('###', '<strong>' + usuario + '</strong>'), 'sistema'); //entra no jogo
	});

	jogo.on('saida', function (usuario) {
		som.play('saida');
		conversaMsg('', idioma.saiuJogo.replace('###', '<strong>' + usuario + '</strong>'), 'sistema'); // sai do jogo
	});

	jogo.on('mensagem', function (tipo, dados) {
		switch (tipo) {
			case 1:
				removerMensagens();
				conversaMsg('', idioma.msgIgnorado.replace('###', '\'' + dados + '\''), 'sistema'); //foi ignorado(a) com sucesso
				ignorar_user(dados);
				break;
			case 2:
				//Mensagem bloqueada
				removerMensagens();
				conversaMsg('', idioma.msgBloqueada + ' (' + dados + ')', 'erro');
				break;
			case 3:
				//Mensagem ofensiva
				removerMensagens();
				conversaMsg('', idioma.mensagemOfensiva + ' (' + dados + ')', 'erro');
				break;
			case 4:
				//Mensagem ofensiva nas respostas
				removerEnviadas();
				respostaMsg('', idioma.mensagemOfensiva + ' (' + dados + ')', 'erro');
				break;
			case 5:
				removerMensagens();
				conversaMsg('', idioma.liberadoSucesso.replace('###', '\'' + dados + '\''), 'sistema'); //foi liberado(a) com sucesso
				liberar_user(dados);
				break;
			case 6:
				removerMensagens();
				conversaMsg('', idioma.naoEncontrado + ' (' + dados + ')', 'erro');
				break;
			case 7:
				removerMensagens();
				conversaMsg('', idioma.comandoInvalido + ' (' + dados + ')', 'erro');
				break;
			case 8:
				removerMensagens();
				conversaMsg('', idioma.todosLiberados, 'sistema'); //Todos os usuarios foram liberados
				break;
		}
	});

	jogo.on('aguardando', function () {
		alertaMsg(idioma.aguardando, idioma.esperandoJogadores, 'salaVazia'); //Sala vazia. Aguardando outro usuario.
		respostaMsg('', idioma.salaVazia, 'sistema'); //Sala vazia. Aguardando outro usuario.
	});

	jogo.on('rank', function (valor) {
		statusRank(valor);
	});

	jogo.on('usuarios', function (valor) {
		lerUsuarios(valor);
	});

	jogo.on('proximos', function (valor) {
		arrProximos = valor;
	});

	jogo.on('sair', function (tipo) {
		//voltando tela
		saindoSala = true;
		location.href = '/';
	});

	//ajustando titulo da pagina
	document.title = jogo.salaNome + ' - Gartic';

	//criando usuarios vazios
	listaVazios = [];
	for (var cont = 0; cont < jogo.maxJogadores; cont++) {
		var elem = criarElemVazio();
		listaVazios.push(elem);
		elem.style.transform = 'translate(0,' + cont * 68 + 'px)';
	}

	//criando linhas
	linhas = [];
	for (var cont = 1; cont < jogo.maxJogadores; cont++) {
		var elem = document.createElement('div');
		elem.className = 'linha vazio';
		linhas.push(elem);
		elem.style.top = cont * 68 + 'px';
		$('#usuarios .area').appendChild(elem);
	}
	$('#usuarios .area').style.height = jogo.maxJogadores * 68 - 2 + 'px';

	//scrolls
	scrollRespostas = new _scroll2.default($('#respostas .historico'), {
		manterPosicao: true,
		elementosMax: 30,
		tolerancia: 4,
		nativo: true
	});
	scrollChat = new _scroll2.default($('#chat .historico'), {
		manterPosicao: true,
		elementosMax: 30,
		tolerancia: 4,
		nativo: true
	});
	scrollUsuarios = new _scroll2.default($('#usuarios'), {
		nativo: true
	});

	//acao do alerta de vez
	$('#desenhar').addEventListener('click', function () {
		if (jogo.vez) {
			jogo.desenhar();
			$('#desenho').className = '';
			$('#dica').className = 'abrir exibirDica';
		} else {
			carregando();
			jogo.salvar(function (tipo, valor) {
				var msg = '';
				switch (tipo) {
					case 6:
					case 1:
						$('#popup h3').innerText = idioma.gravar;
						$('#popup .gravarDesenho .desenho').style.backgroundImage = 'url(' + valor + ')';
						$('#popup').className = 'popupGravarDesenho';

						//trocando o alerta de intervalo
						if (jogo.intervalo) alertaMsg(idioma.intervalo, idioma.intervaloTextos[Math.floor(Math.random() * idioma.intervaloTextos.length)], 'intervalo');
						break;
						break;
					case 2:
					case 3:
					case 4:
					case 5:
					case 7:
					default:
						alerta(idioma.erro, idioma.erroGravarDesenho);
				}
			});
		}
	}, false);
	$('#pular').addEventListener('click', function () {
		$('#desenho').className = '';
		pular();
	}, false);

	$('#dica .darDica .btPular').addEventListener('click', function () {
		confirma('Pular', idioma.perguntaPular, idioma.sim, function () {
			fecharPopup();
			pular();
		}, idioma.nao, function () {
			fecharPopup();
		}, true);
	}, false);
	elemDicaBt.addEventListener('click', function () {
		dar_dica();
	}, false);

	$('#respostas .maior').addEventListener('click', function (e) {
		aplicarFont('respostas', 1);
		e.stopPropagation();
	}, false);

	$('#respostas .menor').addEventListener('click', function (e) {
		aplicarFont('respostas', -1);
		e.stopPropagation();
	}, false);

	$('#chat .maior').addEventListener('click', function (e) {
		aplicarFont('chat', 1);
		e.stopPropagation();
	}, false);

	$('#chat .menor').addEventListener('click', function (e) {
		aplicarFont('chat', -1);
		e.stopPropagation();
	}, false);

	//status de notificacao
	// if (!("Notification" in window && Notification.permission === "granted")) $('#icones .notificacao').className = 'notificacao desligado';

	server = new _server2.default();
	server.onConnect = function () {
		alerta(idioma.aviso, idioma.liveIniciado);
	};
	server.onDisconnect = function () {
		alerta(idioma.aviso, idioma.liveDesligado);
	};
	server.onOcultadoChange = function (ocultado) {
		if (ocultado) alerta(idioma.aviso, idioma.liveConectado);else alerta(idioma.aviso, idioma.liveDesconectado);
	};
}

function buscarMensagem(lista, msg) {
	var elemento = null;

	for (var cont2 = 0; cont2 < lista.length; cont2++) {
		//verificando se a resposta eh a mesma enviada
		if (html_entity_decode(msg) == lista[cont2][0]) {
			elemento = lista[cont2][1];
			lista.splice(cont2, 1);
			break;
		}
	}

	return elemento;
}

function aplicarFont(local, tamanho) {
	var localFont = local;

	var scrollChatFim = true,
	    scrollRespostasFim = true;

	if (tamanho > 0) {
		if (fonteRespostas < 18 && local == 'respostas') {
			fonteRespostas = fonteRespostas + 1;
			$('#respostas .historico').style.fontSize = fonteRespostas + 'px';
			scrollRespostas.refresh();
		} else if (fonteChat < 18 && local == 'chat') {
			fonteChat = fonteChat + 1;
			$('#chat .historico').style.fontSize = fonteChat + 'px';
			scrollChat.refresh();
		}
	} else {
		if (fonteRespostas > 14 && local == 'respostas') {
			fonteRespostas = fonteRespostas - 1;
			$('#respostas .historico').style.fontSize = fonteRespostas + 'px';
			scrollRespostas.refresh();
		} else if (fonteChat > 14 && local == 'chat') {
			fonteChat = fonteChat - 1;
			$('#chat .historico').style.fontSize = fonteChat + 'px';
			scrollChat.refresh();
		}
	}

	if (usuario) textosSala(fonteRespostas, fonteChat);
}

function notificarPermissao() {
	if ("Notification" in window) {
		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				permissaoNotificacao = true;
				notificar(idioma.notificacoesAtivadas);
			}
		});
	}
}

function notificar(mensagem) {
	if ("Notification" in window) {
		if (Notification.permission === "granted" && permissaoNotificacao) {
			//tratando msg
			mensagem = mensagem.replace(/&aacute;/g, "Ã¡").replace(/&eacute;/g, "Ã©").replace(/&iacute;/g, "Ã­").replace(/&oacute;/g, "Ã³").replace(/&uacute;/g, "Ã»").replace(/&acirc;/g, "Ã¢").replace(/&ecirc;/g, "Ãª").replace(/&icirc;/g, "Ã®").replace(/&ocirc;/g, "Ã´").replace(/&ucirc;/g, "Ã»").replace(/&atilde;/g, "Ã£").replace(/&otilde;/g, "Ãµ").replace(/&ccedil;/g, "Ã§");

			//exibindo notificacao
			var options = {
				body: mensagem,
				icon: 'https://gartic.com.br/imgs/icon192.png'
			};
			notificacoes = new Notification('Gartic', options);

			if (timerNotificacoes) clearTimeout(timerNotificacoes);

			timerNotificacoes = setTimeout(function () {
				notificacoes.close();
			}, 6000);
		}
	}
}

function bemVindo() {
	$('#popup h3').innerText = 'Bem vindo!';
	$('#popup').className = 'popupBemVindo';

	$('#popup .bemVindo button').addEventListener('click', function () {
		if ($('#mostrar').checked) conexao.chamada(ENDERECO + 'cookie_aviso.php', '', 'GET');
		fecharPopup();
	}, false);
}

/**
 * Saindo do jogo
 * @param {number} tipo - tipo de saÃ­da
 */
function sairJogo(tipo, bloq) {
	aviso('Saindo da sala...');

	jogo.sair(tipo);
}

function fecharJogo() {
	confirma('Sair', idioma.perguntaSair, idioma.sim, function () {
		sairJogo(0);
	}, idioma.nao, function () {
		fecharPopup();
	});
}

/**
 * Pulando a vez
 */
function pular() {
	if (jogo.pular()) carregando(true);
}

/**
 * Enviando uma dica
 */
function dar_dica() {
	if (jogo.dica()) {
		elemDicaBt.innerText = idioma.enviandoDica;
		elemDicaBt.disabled = true;
	}
}

/*
 * Exibindo dica na tela
 */
function exibirDica(dica, menor, resposta) {
	$('#dica .dicaTxt').className = menor ? 'dicaTxt fonteMenor' : 'dicaTxt';
	//case seja a sua vez, aguardar o momento para mostrar
	if (!jogo.vez) $('#dica').className = 'abrir';

	elemDica.innerHTML = '';
	var palavra, elem;

	if (jogo.vez && resposta && !server.getOcultado()) {
		var arrElems = [];
		var partesPalavra = resposta.match(/./g);
		for (var ind in partesPalavra) {
			palavra = partesPalavra[ind];
			elem = document.createElement('span');

			if (palavra == ' ') {
				elem.innerHTML = '&nbsp;';
				elem.className = 'espaco';
			} else elem.innerText = palavra;

			elemDica.appendChild(elem);
			arrElems.push(elem);
		}

		for (var ind in dica) {
			palavra = dica[ind];
			elem = arrElems[ind];
			if (elem) {
				if (palavra == '_') elem.className = 'traco';else if (palavra != ' ') elem.className = 'traco ativo';
			}
		}
	} else {
		for (var ind in dica) {
			palavra = dica[ind];
			elem = document.createElement('span');

			switch (palavra) {
				//tratando linha
				case '_':
					elem.className = 'traco ativo';
					elem.innerHTML = '&nbsp;';
					break;

				//tratando espaco
				case ' ':
					elem.className = 'espaco';
					elem.innerHTML = '&nbsp;';
					break;

				//tratando letras
				default:
					elem.className = 'traco ativo';
					elem.innerText = palavra;
			}

			elemDica.appendChild(elem);
		}
	}
}

/**
 * Selecionando a ferramenta de desenho
 */
function sel_opcao(num, gravar) {
	if (jogo.vez) {
		//removendo selecao das ferramentas
		var ferramentas = _('.ico.active');
		for (var cont = 0; cont < ferramentas.length; cont++) {
			ferramentas[cont].className = ferramentas[cont].className.replace(' active', '');
		} //selecionando ferramenta atual
		$('#op' + num).className += ' active';

		//definindo o cursor na tela
		var cssCursor = 'crosshair';
		switch (num) {
			case 0:
				cssCursor = 'url("/imgs/cursor/lapis3.cur"), crosshair';
				break;
			case 2:
				cssCursor = 'url("/imgs/cursor/quadrado_cheio.cur"), crosshair';
				break;
			case 3:
				cssCursor = 'url("/imgs/cursor/quadrado_linha.cur"), crosshair';
				break;
			case 4:
				cssCursor = 'url("/imgs/cursor/circulo_cheio.cur"), crosshair';
				break;
			case 5:
				cssCursor = 'url("/imgs/cursor/circulo_linha.cur"), crosshair';
				break;
			case 7:
				cssCursor = 'url("/imgs/cursor/balde.cur"), crosshair';
				break;
			case 8:
				cssCursor = 'url("/imgs/cursor/pega_cor.cur"), crosshair';
				break;
		}
		desenho.canvas.style.cursor = desenho.canvasPrev.style.cursor = cssCursor;
	}

	desenho.mudaOpcao(num, gravar);
}

function sel_alpha(val, gravar) {
	desenho.mudaAlpha(parseFloat(val), gravar);
	if (jogo.vez) elemCorEscolhida.style.opacity = val;
}

function sel_cor(num, gravar, semDegrade) {
	desenho.mudaCor('x' + num.toUpperCase(), jogo.vez && gravar);

	if (jogo.vez) {
		elemCorEscolhida.style.backgroundColor = desenho.corReal;

		if (!semDegrade) elemDegrade.jscolor.fromString(desenho.corReal);
	}
}

function sel_zoom_mais() {
	var zoom = desenho.zoom;
	if (jogo.inicioVez && desenho.liberado && desenho.zoom < 10) {
		desenho.zoom = ++zoom;

		if (desenho.zoom == 10) $("#zoomIn").disabled = true;else if (desenho.zoom == 2) {
			elemMiniatura.style.display = 'block';
			$("#zoomOut").disabled = false;
		}

		scrollDesenho.scroll.refresh();
	}
}

function sel_zoom_menos() {
	var zoom = desenho.zoom;
	if (desenho.liberado && zoom > 1) {
		desenho.zoom = --zoom;

		if (zoom == 1) {
			$("#zoomOut").disabled = true;
			elemTelaCanvas.scrollTop = elemTelaCanvas.scrollLeft = 0;
			elemMiniatura.style.display = "none";
		} else if (zoom == 9) {
			$("#zoomIn").disabled = false;
		}

		scrollDesenho.scroll.refresh();
	}
}

function sel_desfazer() {
	if (jogo.desfazer()) {
		if (!desenho.undoQuant) $("#voltar").disabled = true;
		if (desenho.redoQuant) $("#avancar").disabled = false;
		atualizarMiniatura();
	}
}

function sel_refazer() {
	if (jogo.refazer()) {
		if (!desenho.redoQuant) $("#avancar").disabled = true;
		if (desenho.undoQuant) $("#voltar").disabled = false;
		atualizarMiniatura();
	}
}

function atualizarMiniatura() {
	if (miniatura) {
		miniatura.clearRect(0, 0, 190, 124);
		miniatura.drawImage(elemCanvas, 0, 0, 190, 124);
	}
}

/**
 * Configuracao Padrao de desenho
 */
function confPadrao() {
	sel_opcao(0);
	sel_cor('000000');

	if (jogo.vez) {
		$('#tamanho').value = 4;
		$('#opacidade').value = 1;
		elemCorEscolhida.style.opacity = '';
	}
}

/**
 * Ignora um usuario especifico do jogo
 */
function ignorar_user(user) {
	listaIgnorados[user.toLowerCase()] = true;

	//procurando usuario
	var usuario;
	for (var cont = 0; cont < listaUsuarios.length; cont++) {
		usuario = listaUsuarios[cont];
		if (usuario.login.toLowerCase() == user.toLowerCase()) {
			usuario.elem.className += ' ignorado';
			break;
		}
	}
}

/**
 * Remove status de ignorado de um usuario
 */
function liberar_user(user) {
	delete listaIgnorados[user.toLowerCase()];

	//procurando usuario
	var usuario;
	for (var cont = 0; cont < listaUsuarios.length; cont++) {
		usuario = listaUsuarios[cont];
		if (usuario.login.toLowerCase() == user.toLowerCase()) {
			usuario.elem.className = usuario.elem.className.replace(' ignorado', '');
			break;
		}
	}
}

/**
 * Expulsando um jogador da sala
 */
function kick_user(user) {
	confirma(idioma.aviso, idioma.confirmarExpulsao.replace('###', user), idioma.sim, function () {
		jogo.expulsar(user);
		fecharPopup();
	}, idioma.nao, function () {
		fecharPopup();
	});
}

/**
 * Denunciar um desenho
 */
function denunciar() {
	if (!jogo.vez) {
		confirma(idioma.denunciar, idioma.perguntaDenunciar, idioma.sim, function () {
			jogo.denunciar();
			fecharPopup();
		}, idioma.nao, function () {
			fecharPopup();
		}, true);
	}
}

/**
 * Cancelar desenho, admin
 */
function cancelarDesenho() {
	confirma('AtenÃ§Ã£o', 'Deseja realmente cancelar este desenho?', idioma.sim, function () {
		jogo.cancelarDesenho();
		$('#cancelarDesenho').style.display = 'none';
		fecharPopup();
	}, idioma.nao, function () {
		fecharPopup();
	}, true);
}

/**
 * Finaliza a rodada atual
 * @param {boolean} fimJogo - Diferenciar se Ã© um intervalo normal ou se o jogo acabou
 */
function fim_rodada(fimJogo) {
	if (!fimJogo) respostaMsg('', idioma.intervalo, 'sistema'); //Intervalo...

	//fechando janelas de sistema
	fecharPopup(true);

	server.intervalo();

	//escondendo ferramentas
	if (jogo.vez) {
		desenho.zoom = 1;
		scrollDesenho.scroll.refresh();

		elemMiniatura.style.display = 'none';
		elemDicaBt.style.display = '';
		elemDicaBt.disabled = false;
		elemDicaBt.innerText = idioma.dica;

		//fechando popups de ferramentas
		$('#conteudo').className = '';

		//apagando miniatura
		if (miniatura) miniatura.clearRect(0, 0, 190, 124);
	}

	desenho.liberar(false);
	player.zerar();
	if (!jogo.admin) {
		elemTexto.disabled = true; //esconde texto da tela de desenho
		elemTexto.value = idioma.intervaloSem;
		elemTexto.blur();
	}

	$('#dica').className = '';
	elemDica.innerHTML = '';

	// $('#desenho').className = '';
	elemDegrade.jscolor.hide();

	removerEnviadas();

	$('#denunciar').style.display = 'none';
	if (jogo.admin) $('#cancelarDesenho').style.display = 'none';

	//mostrando tempo
	iniciarTempo(!fimJogo ? jogo.tempoIntervalo + 1000 : jogo.tempoIntervalo * 2 + 1000, 0);

	//mostrando proximos
	var tamProximos = arrProximos.length;
	for (var cont = 0; cont < tamProximos; cont++) {
		alterarElem(arrProximos[cont], 4 + cont);
	}
}

/**
 * Contagem de tempo
 * @param {number} tempo - quanto tempo a correr no total
 * @param {number} porc - qual a porcentagem do tempo decorrido
 */
function iniciarTempo(tempo, porc) {
	if (timerTempoFim) clearTimeout(timerTempoFim);

	var tempoElem = $('#tempo div');
	tempoElem.className = '';
	tempoElem.style.transitionProperty = 'none';
	tempoElem.style.width = Math.round((1 - porc) * 100) + '%';

	tempoElem.offsetWidth;
	setTimeout(function () {
		var duracao = Math.round((1 - porc) * tempo);

		tempoElem.style.transitionProperty = '';
		tempoElem.style.transitionDuration = duracao + 'ms';
		tempoElem.style.width = '0%';

		timerTempoFim = setTimeout(function () {
			// tempoElem.className = 'colorchange'; // removido: inatividade
		}, Math.round(duracao * 0.7));
	}, 0);
}

/**
 * Texto de alerta encima da tela
 * @param {string} msg - Mensagem a ser exibida em alerta
 */
function alertaMsg(titulo, msg, tipo, foto) {
	//ignorar intervalo quando estivem em aviso de todos acertaram
	if (tipo == 'intervalo' && $('#desenho').className == 'todosAcertaram') return;

	$('.texto1', elemTextoAlerta).innerHTML = titulo;
	$('.texto2', elemTextoAlerta).innerHTML = msg;
	$('#desenho').className = tipo;

	//foto ou avatar de usuario
	var iconeElem = $('.icone', elemTextoAlerta);
	if (foto) {
		var user = obterUsuario(foto);
		//imagem
		if (!user.avatar) {
			iconeElem.style.backgroundImage = 'url(https://gartic.com.br/imgs/mural/' + foto.substr(0, 2).toLowerCase() + '/' + foto.toLowerCase() + '/avatar.png?v=' + UTCTime() + ')';
			iconeElem.className = 'icone';
		}
		//avatar
		else {
				iconeElem.style.backgroundImage = '';
				iconeElem.className = 'icone avt' + user.avatar;
			}
	}
	//sem foto e avatar
	else {
			iconeElem.style.backgroundImage = '';
			iconeElem.className = 'icone';
		}
}

/**
 * Mensagem do jogo
 * @param {string} msg - Resposta enviada pelo usuÃ¡rio
 * @param {string} classe - MarcaÃ§Ã£o de layout
 * @param {object} elemento - Campo de respostas
 */
function respostaMsg(user, msg, classe, elemento, forcarFim) {
	var nova;

	//checando substituicao
	if (elemento) {
		elemento.className = classe ? classe : '';
		if (classe == 'perto') {
			//nick
			if (user) msg = '<strong>' + user + '</strong> ' + msg;
			elemento.innerHTML = msg;
		}
		nova = elemento;
	} else {
		nova = document.createElement('div');
		if (classe) nova.className = classe;

		//nick
		if (user) msg = '<strong>' + user + '</strong> ' + msg;

		nova.innerHTML = msg;
		scrollRespostas.append(nova);
	}

	if (forcarFim) scrollRespostas.scrollEnd(false, true);

	return nova;
}

/**
 * Mensagem do jogo
 * @param {string} msg - Mensagem de ExibiÃ§Ã£o
 */
function conversaMsg(user, msg, classe, elemento, forcarFim) {
	var nova;

	if (elemento) {
		elemento.className = classe ? classe : '';
		nova = elemento;
	} else {
		nova = document.createElement('div');
		if (classe) nova.className = classe;

		//emoticon gartic
		if (msg.toLowerCase() == 'gartic') msg = '<img src="/imgs/sala/icone-gartic.png" title="Gartic" />';
		//nick
		if (user) msg = '<strong>' + user + '</strong> ' + msg;

		nova.innerHTML = msg;
		scrollChat.append(nova);
	}

	if (forcarFim) scrollChat.scrollEnd(false, true);

	return nova;
}

/**
 * Enviar Respostas
 */
$('#respostas form').addEventListener('submit', function () {
	//focando novamente no campo de texto
	elemTexto.focus();

	//tempo minimo para reenviar resposta
	if (UTCTime(true) - timeMsgResp > 80) {
		var texto = elemTexto.value.replace(/(^\s)|(\s$)/gi, '').substr(0, 100);
		if (texto != "" && !elemTexto.disabled) {
			elemTexto.value = "";
			if (!(0, _ofensa2.default)(texto)) {
				if (jogo.resposta(texto)) {
					timeMsgResp = UTCTime(true);
					var elem = respostaMsg(jogo.loginJogo, texto, 'enviando', null, true);
					respostasEnviadas.push([texto, elem]);
				} else {
					respostaMsg('', idioma.msgBloqueada, 'erro', null, true);
				}
			} else {
				respostaMsg('', idioma.mensagemOfensiva, 'erro', null, true);
			}
		}
	}

	//cancelando submit
	return false;
}, false);

/**
 * Remover respostas enviadas pendentes
 */
function removerEnviadas() {
	for (var cont = 0; cont < respostasEnviadas.length; cont++) {
		try {
			elemRespostas.removeChild(respostasEnviadas[cont][1]);
		} catch (e) {}
	}
	respostasEnviadas = [];
}

function removerMensagens() {
	for (var cont = 0; cont < mensagensEnviadas.length; cont++) {
		try {
			elemConversa.removeChild(mensagensEnviadas[cont][1]);
		} catch (e) {}
		mensagensEnviadas.splice(cont, 1);
	}
}

/**
 * Enviar Mensagem
 */
$('#chat form').addEventListener('submit', function () {
	//focando novamente no campo de texto
	elemTexto2.focus();

	if (UTCTime(true) - timeMsgChat <= 800) return;

	var texto = elemTexto2.value.replace(/(^\s)|(\s$)/gi, '').substr(0, 100);
	if (texto != "" && !elemTexto2.disabled) {
		elemTexto2.value = "";

		//Detectando possivel flood
		if (!(0, _ofensa2.default)(texto)) {
			if (jogo.mensagem(texto)) {
				//posivel comando
				if (texto.charAt(0) == '/') {
					var partes = texto.split(' ');
					switch (partes[0].toLowerCase()) {
						case '/sound':
						case '/som':
							$('#som').checked = partes[1].toLowerCase() == 'on';
							ativarSom();
							return;
						case '/live':
							$('#modoLive').checked = !partes[1] || partes[1].toLowerCase() != 'off';
							ativarLive();
							return;
					}
				}

				//enviando mensagem
				timeMsgChat = UTCTime(true);
				var elem = conversaMsg(jogo.loginJogo, texto, 'enviando', null, true);
				mensagensEnviadas.push([texto, elem]);
			} else {
				conversaMsg('', idioma.mensagemBloqueada, 'erro', null, true);
			}
		} else {
			conversaMsg('', idioma.mensagemOfensiva, 'erro', null, true);
		}

		//cancelando submit
		return false;
	}
}, false);

/**
 * Define se esta online ou offline
 * @param {number} tipo - online ou ofline
 */
function statusRank(tipo) {
	if (tipo && jogo.salaFixa == 1 && jogo.naoCadastrados < 2) {
		$('#topo .rank strong').innerText = 'ON';
	} else {
		$('#topo .rank strong').innerText = 'OFF';
	}
}

/**
 * interpretando os dados referentes a listagem dos usuarios
 * @param {string} dados - recebe cÃ³digo com usuÃ¡rios presentes em sala
 */
function lerUsuarios(lista) {
	var user, achou, parte, elem, difPontos, statusAnterior, pontosAnterior;
	var reajustar = false;

	var zerados = true,
	    distanciaPontos = false,
	    arrAnimacoes = [];

	//procurando item existente correspondente
	for (var ind = 0; ind < listaUsuarios.length; ind++) {
		user = listaUsuarios[ind];

		//condicao distancia
		if (user.pontos > 80) distanciaPontos = true;

		achou = false;
		for (var cont = 0; cont < lista.length; cont++) {
			parte = lista[cont];

			if (user.login.toLowerCase() == parte.login.toLowerCase()) {
				//condicao zerado
				if (parseInt(parte.pontos) != 0) zerados = false;

				//verificando alteracao nos pontos
				difPontos = parte.pontos - user.pontos;
				if (difPontos != 0) {
					//adicionando animacao
					arrAnimacoes.push([user.elem, difPontos]);
				}

				//alterando dados
				statusAnterior = user.status;
				pontosAnterior = user.pontos;
				user.pontos = parte.pontos;
				user.vitorias = parte.vitorias;
				user.status = parte.status;

				if (statusAnterior != user.status || pontosAnterior != user.pontos) {
					//alterar elemento
					if (listaIgnorados[user.login.toLowerCase()]) user.elem.className = 'user ignorado';else user.elem.className = 'user';

					if (user.proprio) user.elem.className += ' proprio';

					switch (user.status) {
						case 2:
							user.elem.className += ' acertou';
							break;
						case 1:
							user.elem.className += ' vez';
							break;
						case 3:
							//txtStatus = 'Vencedor';
							break;
					}

					txtUser(user);
				}

				//remover parte utilizada
				lista.splice(cont, 1);

				//marcador de encontrado
				achou = true;
				break;
			}
		}

		//verificando se permanece
		if (!achou) {
			$('#usuarios .area').removeChild(listaUsuarios[ind].elem);
			listaUsuarios.splice(ind, 1);
			ind--;
			//recriando vazio apenas se estiver na faixa de jogadores da sala
			if (listaUsuarios.length < jogo.maxJogadores) {
				listaVazios.push(criarElemVazio());
				if (listaUsuarios.length) linhas[listaUsuarios.length - 1].className = 'linha vazio';
			} else if (linhas.length) {
				$('#usuarios .area').removeChild(linhas.splice(linhas.length - 1, 1)[0]);
				$('#usuarios .area').style.height = listaUsuarios.length * 68 - 2 + 'px';
				reajustar = true;
			}
		}
	}

	//executando animacoes
	if (!zerados || !distanciaPontos) {
		for (ind in arrAnimacoes) {
			difPontos = arrAnimacoes[ind][1];

			//criando elemento
			if (difPontos >= 0) {
				elem = document.createElement('div');
				elem.className = 'pontoAni positivo';
				elem.innerText = '+' + difPontos;
			} else {
				elem = document.createElement('div');
				elem.className = 'pontoAni negativo';
				elem.innerText = difPontos;
			}

			arrAnimacoes[ind][0].appendChild(elem);
			animarPonto(elem);
		}
	}

	//criando elementos de usuarios novos
	for (cont = 0; cont < lista.length; cont++) {
		user = lista[cont];

		user.posicao = -1;
		user.ordem = jogadoresOrdem++;
		user.imagem = true;

		criarElem(user);

		if (listaUsuarios.length) {
			if (listaUsuarios.length < jogo.maxJogadores) linhas[listaUsuarios.length - 1].className = 'linha';
			//criando linha nova para usuario imprevisto
			else {
					var linhaElem = document.createElement('div');
					linhaElem.className = 'linha';
					linhas.push(linhaElem);
					linhaElem.style.top = listaUsuarios.length * 68 + 'px';
					$('#usuarios .area').appendChild(linhaElem);
					$('#usuarios .area').style.height = (listaUsuarios.length + 1) * 68 - 2 + 'px';
					reajustar = true;
				}
		}

		listaUsuarios.push(user);
	}

	//ordenando os usuarios
	listaUsuarios.sort(function (a, b) {
		if (b.pontos != a.pontos) return b.pontos - a.pontos;else {
			return a.ordem - b.ordem;
		}
	});

	//reestruturando posicoes
	for (ind in listaUsuarios) {
		user = listaUsuarios[ind];

		//caso tenha trocado de posicao
		if (ind != user.posicao) {
			//novo usuario
			if (user.posicao == -1) {
				user.elem.style.transform = 'translate(0,' + ind * 68 + 'px)';
				user.elem.style.opacity = 1;
			}
			//nova posicao
			else {
					user.elem.style.transform = 'translate(0,' + ind * 68 + 'px)';
				}
			user.posicao = ind;
		}
	}
	//reestruturando vazios
	for (ind in listaVazios) {
		listaVazios[ind].style.transform = 'translate(0,' + (listaUsuarios.length + parseInt(ind)) * 68 + 'px)';
	}

	//reajustando scroll
	if (reajustar) scrollUsuarios.refresh();
}

//animacao de ponto obtido/perdido
function animarPonto(elem) {
	var timer;
	var callback = function callback() {
		if (elem && elem.parentNode) {
			elem.parentNode.removeChild(elem);
			clearTimeout(timer);
		}
	};
	timer = setTimeout(callback, 1550);

	elem.offsetHeight;
	setTimeout(function () {
		elem.addEventListener('transitionend', callback, false);
		elem.style.top = '0px';
		elem.style.opacity = '0';
	}, 0);
}

/**
 * atualizando o HTML da lista de usuarios
 * @param {object} user - Criar elemento do usuÃ¡rio
 */
function criarElem(user) {
	user.proprio = user.login.toLowerCase() == jogo.loginJogo.toLowerCase();
	user.elem = document.createElement('div');
	user.elem.className = !user.proprio ? 'user' : 'user proprio';
	user.imagem = false;

	var imgSrc, img;
	if (!user.avatar && user.login.charAt(0) != '~' && jogo.salaVisivel) {
		imgSrc = '/imgs/mural/' + user.login.substr(0, 2).toLowerCase() + '/' + user.login.toLowerCase() + '/avatar_mini.png?v=' + UTCTime();
		user.imagem = true;

		//verificando se a imagem existe
		img = new Image();
		img.objUsuario = user;
		img.onerror = function () {
			var user = this.objUsuario;
			var imgElem = user.elem.querySelector('.foto');
			imgElem.className = 'foto avt' + user.avatar;
			imgElem.style.backgroundImage = '';
			user.imagem = false;
		};
		img.onload = function () {
			var imgGrande = new Image();
			imgGrande.src = imgSrc.replace('avatar_mini.png', 'avatar.png');
			user.imagemLoad = imgGrande;
		};
		img.src = imgSrc;
	}

	//Atribuindo a classe correta ao fundo
	switch (parseInt(user.status)) {
		case 2:
			user.elem.className += ' acertou';
			break;
		case 1:
			user.elem.className += ' vez';
			break;
		/*case 3:
  	break;*/
	}

	//foto usuario
	var imgElem = document.createElement('div');
	imgElem.className = 'foto';
	if (user.imagem) imgElem.style.backgroundImage = 'url(' + imgSrc + ')';else imgElem.className += ' avt' + user.avatar;

	//dados do usuario
	var dadosElem = document.createElement('div');
	dadosElem.className = 'dados';

	//nome do user
	var nickElem = document.createElement('span');

	//pontos
	var pontosElem = document.createElement('pre');

	//alerta
	var alertaElem = document.createElement('strong');

	//exibindo mini perfil
	if (!user.proprio) {
		user.elem.addEventListener('click', function () {
			$('#popup h3').innerText = user.login;
			$('#popup').className = 'popupPerfil';

			var fotoElem = $('#popup .perfil .foto');
			if (user.imagem) {
				fotoElem.style.backgroundImage = 'url(' + imgSrc.replace('avatar_mini.png', 'avatar.png') + ')';
				fotoElem.className = 'foto';
			} else {
				fotoElem.style.backgroundImage = '';
				fotoElem.className = 'foto avt' + user.avatar;
			}

			//ignorar/liberar usuario
			if (!listaIgnorados[user.login.toLowerCase()]) {
				$('#userIgnorar').innerHTML = idioma.ignorar;
				$('#userIgnorar').onclick = function () {
					ignorar_user(user.login);
					fecharPopup();
				};
			} else {
				$('#userIgnorar').innerHTML = idioma.liberar;
				$('#userIgnorar').onclick = function () {
					som.play('botao2');
					liberar_user(user.login);
					fecharPopup();
				};
			}

			//denunciar usuario
			$('#userDenunciar').onclick = function () {
				$('#popup .denunciar textarea').value = '';
				$('#nickInfrator').innerText = user.login;
				$('#popup h3').innerText = idioma.denunciar;
				$('#popup').className = 'popupDenunciar';

				$('#popup .denunciar button').onclick = function () {
					carregando();

					var retorno = jogo.denunciarUsuario(user.login, $('#popup .denunciar textarea').value, function (tipo) {
						var msg = '';
						switch (tipo) {
							case 1:
								msg = idioma.denunciaSucesso; //Denuncia enviada com sucesso!
								break;
							case 2:
								msg = idioma.erroDenuncia; //Erro ao enviar denuncia
								break;
							case 3:
								msg = idioma.denunciaNickInfrator; //O nick infrator nÃ£o se encontra logado na sua sala.
								break;
							default:
								msg = idioma.erroDenuncia;
						}

						alerta(idioma.denunciar, msg);
					});

					//verificando se nao foi possÃ­vel enviar a denuncia
					if (!retorno) alerta(idioma.denunciar, idioma.denunciaRecente);
				};
			};

			//link de acesso ao perfil
			if (user.login.charAt(0) != '~') {
				$('#acessarPerfil').style.display = 'block';
				$('#acessarPerfil').onclick = function () {
					window.open('/' + user.login, '_blank');
				};
			} else $('#acessarPerfil').style.display = 'none';

			//expulsar usuario da sala
			if (jogo.criador || jogo.admin) {
				$('#userExpulsar').style.display = 'block';
				$('#userExpulsar').onclick = function () {
					kick_user(user.login);
				};
			} else $('#userExpulsar').style.display = 'none';
		}, false);
	}

	//adicionando elementos
	user.elem.appendChild(imgElem);
	dadosElem.appendChild(nickElem);
	dadosElem.appendChild(pontosElem);
	dadosElem.appendChild(alertaElem);
	user.elem.appendChild(dadosElem);

	txtUser(user);

	if (listaVazios.length) $('#usuarios .area').removeChild(listaVazios.pop());
	$('#usuarios .area').appendChild(user.elem);
}

function criarElemVazio() {
	var elem = document.createElement('div');
	elem.className = 'user vazio';

	//foto usuario
	var imgElem = document.createElement('div');
	imgElem.className = 'foto';

	//dados do usuario
	var dadosElem = document.createElement('div');
	dadosElem.className = 'dados';

	//nome do user
	var nickElem = document.createElement('span');
	nickElem.innerHTML = idioma.vazio;

	//pontos
	var pontosElem = document.createElement('pre');

	//alerta
	var alertaElem = document.createElement('strong');

	elem.appendChild(imgElem);
	dadosElem.appendChild(nickElem);
	dadosElem.appendChild(pontosElem);
	dadosElem.appendChild(alertaElem);
	elem.appendChild(dadosElem);

	$('#usuarios .area').appendChild(elem);

	return elem;
}

function alterarElem(usuario, status) {
	var user = obterUsuario(usuario);

	if (user) {
		//verificando indicacao de cor
		var txtStatus = '';
		switch (status) {
			case 4:
				txtStatus = idioma.proximoDesenhar;
				user.status = status;
				break;
			case 5:
				txtStatus = idioma.umaRodadaDesenhar;
				user.status = status;
				break;
			case 6:
				txtStatus = idioma.duasRodadasDesenhar;
				user.status = status;
				break;
		}

		if (txtStatus) txtUser(user, txtStatus);
	}
}

/**
 *  DescriÃ§Ã£o de pontps do usuÃ¡rio
 * @param {string} user - dados usuario
 */
function txtUser(user, txtStatus) {
	$('span', user.elem).innerHTML = user.login;

	var vitoriasTxt = '';
	if (user.vitorias && !jogo.vez) vitoriasTxt = ' / ' + user.vitorias + ' ' + (user.vitorias == 1 ? idioma.vitoria : idioma.vitorias);

	$('pre', user.elem).innerHTML = user.pontos + ' pontos' + vitoriasTxt;

	if (txtStatus) {
		user.elem.className += ' info';
		$('strong', user.elem).innerHTML = txtStatus;
	}
}

/*
 * Obtendo objeto do usuario
 */
function obterUsuario(usuario) {
	usuario = usuario.toLowerCase();
	var user;
	for (var ind in listaUsuarios) {
		user = listaUsuarios[ind];
		if (user.login.toLowerCase() == usuario) return user;
	}
	return false;
}

//ATALHOS
_mousetrap2.default.bind(['ctrl+up', 'command+up'], function () {
	if (jogo.vez && !$('#popup').className) sel_zoom_mais();
});
_mousetrap2.default.bind(['ctrl+down', 'command+down'], function () {
	if (jogo.vez && !$('#popup').className) sel_zoom_menos();
});
_mousetrap2.default.bind(['ctrl+z', 'command+z'], function () {
	if (jogo.vez && !$('#popup').className) sel_desfazer();
});
_mousetrap2.default.bind(['ctrl+y', 'command+y', 'ctrl+shift+z', 'command+shift+z'], function () {
	if (jogo.vez && !$('#popup').className) sel_refazer();
});
_mousetrap2.default.bind("shift+up", function () {
	if (jogo.vez && !$('#popup').className) {
		var num = desenho.borda + 1;
		if (num <= 50) {
			desenho.mudaBorda(num, true);
			$('#tamanho').value = num;
		}
	}
});
_mousetrap2.default.bind("shift+down", function () {
	if (jogo.vez && !$('#popup').className) {
		var num = desenho.borda - 1;
		if (num >= 1) {
			desenho.mudaBorda(num, true);
			$('#tamanho').value = num;
		}
	}
});
_mousetrap2.default.bind("shift+left", function () {
	if (jogo.vez && !$('#popup').className) {
		var num = Math.floor(desenho.alpha * 10) - 1;
		if (num >= 1) {
			num = num / 10;
			sel_alpha(num, true);
			$('#opacidade').value = num;
		}
	}
});
_mousetrap2.default.bind("shift+right", function () {
	if (jogo.vez && !$('#popup').className) {
		var num = Math.floor(desenho.alpha * 10) + 1;
		if (num <= 10) {
			num = num / 10;
			sel_alpha(num, true);
			$('#opacidade').value = num;
		}
	}
});

function fundoCor(classe, val) {
	document.body.className = classe;
	conexao.chamada(ENDERECO + 'cor_fundo.php', 'val=' + val, 'POST');
}

function textosSala(respostas, chat) {
	conexao.chamada(ENDERECO + 'tam_texto.php', 'val1=' + respostas + '&val2=' + chat, 'POST');
}

/**
 * Responsavel pelo som do aplicativo
 */
function ligarSom() {
	if (som.ativo) {
		som.desativar();
		window.localStorage.setItem('somDesativado', true);
	} else {
		som.ativar();
		window.localStorage.removeItem('somDesativado');
	}
}

/**
 * Capturar cÃ³digo html caracteres especiais
 * @param {string} table - tipo de converÃ§Ã£o a ser feito
 */
function get_html_translation_table(table, quote_style) {
	var entities = {},
	    hash_map = {},
	    decimal;
	var constMappingTable = {},
	    constMappingQuoteStyle = {};
	var useTable = {},
	    useQuoteStyle = {};

	// Translate arguments
	constMappingTable[0] = 'HTML_SPECIALCHARS';
	constMappingTable[1] = 'HTML_ENTITIES';
	constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
	constMappingQuoteStyle[2] = 'ENT_COMPAT';
	constMappingQuoteStyle[3] = 'ENT_QUOTES';

	useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
	useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

	if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
		throw new Error("Table: " + useTable + ' not supported');
		// return false;
	}

	entities['38'] = '&amp;';
	if (useTable === 'HTML_ENTITIES') {
		entities['160'] = '&nbsp;';
		entities['161'] = '&iexcl;';
		entities['162'] = '&cent;';
		entities['163'] = '&pound;';
		entities['164'] = '&curren;';
		entities['165'] = '&yen;';
		entities['166'] = '&brvbar;';
		entities['167'] = '&sect;';
		entities['168'] = '&uml;';
		entities['169'] = '&copy;';
		entities['170'] = '&ordf;';
		entities['171'] = '&laquo;';
		entities['172'] = '&not;';
		entities['173'] = '&shy;';
		entities['174'] = '&reg;';
		entities['175'] = '&macr;';
		entities['176'] = '&deg;';
		entities['177'] = '&plusmn;';
		entities['178'] = '&sup2;';
		entities['179'] = '&sup3;';
		entities['180'] = '&acute;';
		entities['181'] = '&micro;';
		entities['182'] = '&para;';
		entities['183'] = '&middot;';
		entities['184'] = '&cedil;';
		entities['185'] = '&sup1;';
		entities['186'] = '&ordm;';
		entities['187'] = '&raquo;';
		entities['188'] = '&frac14;';
		entities['189'] = '&frac12;';
		entities['190'] = '&frac34;';
		entities['191'] = '&iquest;';
		entities['192'] = '&Agrave;';
		entities['193'] = '&Aacute;';
		entities['194'] = '&Acirc;';
		entities['195'] = '&Atilde;';
		entities['196'] = '&Auml;';
		entities['197'] = '&Aring;';
		entities['198'] = '&AElig;';
		entities['199'] = '&Ccedil;';
		entities['200'] = '&Egrave;';
		entities['201'] = '&Eacute;';
		entities['202'] = '&Ecirc;';
		entities['203'] = '&Euml;';
		entities['204'] = '&Igrave;';
		entities['205'] = '&Iacute;';
		entities['206'] = '&Icirc;';
		entities['207'] = '&Iuml;';
		entities['208'] = '&ETH;';
		entities['209'] = '&Ntilde;';
		entities['210'] = '&Ograve;';
		entities['211'] = '&Oacute;';
		entities['212'] = '&Ocirc;';
		entities['213'] = '&Otilde;';
		entities['214'] = '&Ouml;';
		entities['215'] = '&times;';
		entities['216'] = '&Oslash;';
		entities['217'] = '&Ugrave;';
		entities['218'] = '&Uacute;';
		entities['219'] = '&Ucirc;';
		entities['220'] = '&Uuml;';
		entities['221'] = '&Yacute;';
		entities['222'] = '&THORN;';
		entities['223'] = '&szlig;';
		entities['224'] = '&agrave;';
		entities['225'] = '&aacute;';
		entities['226'] = '&acirc;';
		entities['227'] = '&atilde;';
		entities['228'] = '&auml;';
		entities['229'] = '&aring;';
		entities['230'] = '&aelig;';
		entities['231'] = '&ccedil;';
		entities['232'] = '&egrave;';
		entities['233'] = '&eacute;';
		entities['234'] = '&ecirc;';
		entities['235'] = '&euml;';
		entities['236'] = '&igrave;';
		entities['237'] = '&iacute;';
		entities['238'] = '&icirc;';
		entities['239'] = '&iuml;';
		entities['240'] = '&eth;';
		entities['241'] = '&ntilde;';
		entities['242'] = '&ograve;';
		entities['243'] = '&oacute;';
		entities['244'] = '&ocirc;';
		entities['245'] = '&otilde;';
		entities['246'] = '&ouml;';
		entities['247'] = '&divide;';
		entities['248'] = '&oslash;';
		entities['249'] = '&ugrave;';
		entities['250'] = '&uacute;';
		entities['251'] = '&ucirc;';
		entities['252'] = '&uuml;';
		entities['253'] = '&yacute;';
		entities['254'] = '&thorn;';
		entities['255'] = '&yuml;';
	}

	if (useQuoteStyle !== 'ENT_NOQUOTES') {
		entities['34'] = '&quot;';
	}
	if (useQuoteStyle === 'ENT_QUOTES') {
		entities['39'] = '&#39;';
	}
	entities['60'] = '&lt;';
	entities['62'] = '&gt;';

	// ascii decimals to real symbols
	for (decimal in entities) {
		if (entities.hasOwnProperty(decimal)) {
			hash_map[String.fromCharCode(decimal)] = entities[decimal];
		}
	}

	return hash_map;
}

/**
 * Pre chamada de get_html_translation_table
 * @param {string} string - texto em questÃ£o
 */
function html_entity_decode(string, quote_style) {
	var hash_map = {},
	    symbol = '',
	    tmp_str = '',
	    entity = '';
	tmp_str = string.toString();

	if (false === (hash_map = get_html_translation_table('HTML_ENTITIES', quote_style))) {
		return false;
	}

	// fix &amp; problem
	// http://phpjs.org/functions/get_html_translation_table:416#comment_97660
	delete hash_map['&'];
	hash_map['&'] = '&amp;';

	for (symbol in hash_map) {
		entity = hash_map[symbol];
		tmp_str = tmp_str.split(entity).join(symbol);
	}
	tmp_str = tmp_str.split('&#039;').join("'");

	return tmp_str;
}

/**
 * Responsavel para pegar o tempo atual
 * @param {boolean} mili - selecionar o tempo em mili segindos.
 */
function UTCTime(mili) {
	var atual = new Date();
	if (!mili) return parseInt(Date.UTC(atual.getFullYear(), atual.getMonth(), atual.getDate(), atual.getHours(), atual.getMinutes(), atual.getSeconds()) / 1000);else return parseInt(Date.UTC(atual.getFullYear(), atual.getMonth(), atual.getDate(), atual.getHours(), atual.getMinutes(), atual.getSeconds()));
}

function ativarSom() {
	if ($('#som').checked) {
		som.ativar();
		localStorage.removeItem('somDesativado');
	} else {
		som.desativar();
		localStorage.setItem('somDesativado', true);
	}
}

function ativarLive() {
	if ($('#modoLive').checked) {
		carregando();
		server.ligar();
	} else {
		server.desligar();
		alerta(idioma.aviso, idioma.liveRemovido);
	}
}

function ativarGameplay() {
	if ($('#gameplay').checked) {
		if (!$('#usuariosBloco').classList.contains('gameplay')) $('#usuariosBloco').classList.add('gameplay');

		var player = $('#webCam video');
		var handleSuccess = function handleSuccess(stream) {
			if (window.URL) {
				player.src = window.URL.createObjectURL(stream);
				videoTracks = stream.getVideoTracks();
			} else {
				player.src = stream;
			}
			player.play();

			alerta(idioma.aviso, idioma.modoGamePlay);
		};
		navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(handleSuccess).catch(function (err) {
			alerta(idioma.aviso, idioma.semCamera);
		});
	} else {
		if ($('#usuariosBloco').classList.contains('gameplay')) $('#usuariosBloco').classList.remove('gameplay');

		if (videoTracks) videoTracks.forEach(function (track) {
			track.stop();
		});
	}
}

function ativarNotificacao() {
	if ($('#notificacoes').checked) {
		notificarPermissao();
	} else {
		notificar(idioma.notificacoesDesativadas);
		permissaoNotificacao = false;
	}
}

(function () {
	// Older browsers might not implement mediaDevices at all, so we set an empty object first
	if (navigator.mediaDevices === undefined) {
		navigator.mediaDevices = {};
	}

	// Some browsers partially implement mediaDevices. We can't just assign an object
	// with getUserMedia as it would overwrite existing properties.
	// Here, we will just add the getUserMedia property if it's missing.
	if (navigator.mediaDevices.getUserMedia === undefined) {
		navigator.mediaDevices.getUserMedia = function (constraints) {

			// First get ahold of the legacy getUserMedia, if present
			var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			// Some browsers just don't implement it - return a rejected promise with an error
			// to keep a consistent interface
			if (!getUserMedia) {
				alerta(idioma.aviso, idioma.erroSuporteVideo);
				return;
				// return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}

			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
			return new Promise(function (resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		};
	}
})();

},{"./server":2,"babel-polyfill":5,"conexao":13,"desenho":308,"eventos":324,"jogo":329,"mousetrap":332,"ofensa":334,"player":338,"scroll":341,"som":356}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Server() {
	var self = this;
	var logado = false;
	var ocultado = false;
	var socket = null;
	var id = false;

	this.ligar = function () {
		socket = (0, _socket2.default)('https://gartic.live:2028', {
			'connect timeout': 10000,
			reconnect: false,
			'auto connect': true,
			'try multiple transports': false,
			transports: ['websocket'] });

		socket.on('connect', function (data) {
			if (!logado && self.onConnect) self.onConnect();
			logado = true;
			socket.emit('join', id);
		});
		socket.on('disconnect', function (data) {
			if (logado && self.onDisconnect) self.onDisconnect();
			logado = false;
		});
		socket.on('join', function (data) {
			id = data;
		});
		socket.on('entrou', function (data) {
			if (!ocultado && self.onOcultadoChange) self.onOcultadoChange(true);
			ocultado = true;
		});
		socket.on('saiu', function (data) {
			if (ocultado && self.onOcultadoChange) self.onOcultadoChange(false);
			ocultado = false;
		});
	};

	this.desligar = function () {
		if (logado) socket.emit('sair', {});
		logado = false;
		socket = false;
		ocultado = false;
		socket = null;
	};

	this.resposta = function (valor) {
		if (logado) socket.emit('resposta', valor);
	};

	this.intervalo = function () {
		if (logado) socket.emit('intervalo', true);
	};

	this.vez = function (valor) {
		if (logado) socket.emit('vez', valor);
	};

	this.acertou = function (valor) {
		if (logado) socket.emit('acertou', valor);
	};

	this.proximo = function (valor) {
		if (logado) socket.emit('proximo', valor);
	};

	this.getLogado = function () {
		return logado;
	};

	this.getOcultado = function () {
		return ocultado;
	};
}

exports.default = Server;

},{"socket.io-client":342}],3:[function(require,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],4:[function(require,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],5:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator-runtime/runtime");

require("core-js/fn/regexp/escape");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel-polyfill is allowed");
}
global._babelPolyfill = true;

var DEFINE_PROPERTY = "defineProperty";
function define(O, key, value) {
  O[key] || Object[DEFINE_PROPERTY](O, key, {
    writable: true,
    configurable: true,
    value: value
  });
}

define(String.prototype, "padLeft", "".padStart);
define(String.prototype, "padRight", "".padEnd);

"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
  [][key] && define(Array, key, Function.call.bind([][key]));
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/fn/regexp/escape":14,"core-js/shim":307,"regenerator-runtime/runtime":340}],6:[function(require,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],7:[function(require,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();

},{}],8:[function(require,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],11:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],12:[function(require,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],13:[function(require,module,exports){
'use strict';

/**
 * Classe responsÃ¡vel pelo tratamento de requisiÃ§Ãµes ajax
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Conexao = function () {
	/**
  * Construtor da classe
  *
  * @param {Object} opcoes Opcoes do objeto
  * @param {string} opcoes.base Caminho base das requisiÃ§Ãµes
  * @param {number} opcoes.timeout Tempo mÃ¡ximo antes de expirar a requisiÃ§Ã£o (milisegundos)
  * @param {boolean} opcoes.removerCache ForÃ§ar a remoÃ§Ã£o de cache atrelando um numero Ã  requisiÃ§Ã£o
  * @param {string} opcoes.sessao CÃ³digo para forÃ§ar o uso de uma sessÃ£o especÃ­fica no servidor
  * @param {boolean} opcoes.cors Adicionar credenciais para o envio de cookies via CORs
  * @param {boolean} opcoes.statusOff Considera retorno de status 0 como bem sucedido
  */
	function Conexao(opcoes) {
		var _this = this;

		_classCallCheck(this, Conexao);

		this._opcoes = Object.assign({
			base: '',
			removerCache: true,
			sessao: '',
			cors: false,
			statusOff: false,
			timeout: 10000
		}, opcoes);

		//tratamento de requests ativas
		this._indice = 0;
		this._requests = [];

		//rotina de verificacao de requests ociosas
		if (!this._opcoes.statusOff && this._opcoes.timeout) {
			this._timerRotina = setInterval(function () {
				_this._rotina();
			}, 1000);
		}
	}

	/**
  * Rotina para executar os timeouts nas requiÃ§Ãµes, caso tenham ultrapassado o tempo
  */


	_createClass(Conexao, [{
		key: '_rotina',
		value: function _rotina() {
			//removendo requests ociosas/travadas
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this._requests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var request = _step.value;

					if (!request.infinito && Date.now() - request.tempo > this._opcoes.timeout) this.abortar(request.id);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		/**
   * Tratando uma requisiÃ§Ã£o ajax
   *
   * @param {Object} obj Dados da requisiÃ§Ã£o a ser realizada
   */

	}, {
		key: '_ajaxRequest',
		value: function _ajaxRequest(obj) {
			var _this2 = this;

			obj.tempo = Date.now();
			if (!obj.xhr) obj.xhr = new XMLHttpRequest();

			//formatando parametros de URL
			var params = [];
			if (this._opcoes.removerCache) params.push('cache=' + Date.now());
			if (this._opcoes.sessao) params.push('idapp=' + this._opcoes.sessao);
			if (obj.method == 'GET' && obj.param) params.push(obj.param);
			params = params.join('&');
			if (params) params = (obj.pag.indexOf('?') == -1 ? '?' : '&') + params;

			obj.xhr.open(obj.method, this._opcoes.base + obj.pag + params, true);

			//especificando tipo do retorno
			if (obj.tipo) obj.xhr.responseType = obj.tipo;

			//cabeÃ§alhos
			if (typeof obj.param == 'string') obj.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			if (this._opcoes.cors) {
				obj.xhr.setRequestHeader('Access-Control-Allow-Origin', location.host);
				obj.xhr.withCredentials = 'true';
			}

			obj.xhr.onreadystatechange = function () {
				if (obj.xhr.readyState == 4) {
					var status = obj.xhr.status;

					//caso seja uma pagina valida
					if (status == 200 || _this2._opcoes.statusOff && status == 0) {
						var texto = !obj.tipo ? obj.xhr.responseText : obj.xhr.response;
						if (texto !== null) {
							if (obj.callback) obj.callback(texto);
						}
						//Bug Opera
						else if (!texto) {
								_this2._ajaxRequest(obj);
								return;
							}

						//removendo obj da Lista
						var pos = _this2._requests.indexOf(obj);
						if (pos != -1) _this2._requests.splice(pos, 1);
					}
					// caso ocora algum erro e nao seja aborto...
					else if (status != 0) {
							obj.tempo = Date.now();
							obj.timer = setTimeout(function () {
								_this2._ajaxRequest(obj);
							}, 1000);
						}
				}
			};

			try {
				if (obj.method == 'GET') {
					obj.xhr.send(null);
				} else obj.xhr.send(obj.param);
			} catch (e) {
				console.log(e);
			}
		}

		/**
   * Obtem o valor da sessao
   *
   * @type {boolean}
   */

	}, {
		key: 'chamada',


		/**
   * Recebendo uma nova requisiÃ§Ã£o a ser tratada
   *
   * @param {string} pag EndereÃ§o da da requisiÃ§Ã£o
   * @param {string} param ParÃ¢metros a serem enviados na requisiÃ§Ã£o
   * @param {string} method MÃ©todo do ajax (GET, POST, ...)
   * @param {function} callback Retorno apÃ³s realizar a requisiÃ§Ã£o com sucesso
   * @param {string} tipo Tipo de retorno da requisiÃ§Ã£o (text, json, etc)
   * @param {boolean} infinito Indica se a requisiÃ§Ã£o nÃ£o serÃ¡ afetada por timeout
   * @returns {number} ID da requisiÃ§Ã£o criada
   */
		value: function chamada(pag) {
			var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
			var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
			var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
			var tipo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
			var infinito = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

			var obj = {
				id: ++this._indice,
				pag: pag,
				param: param,
				method: method,
				callback: callback,
				tipo: tipo,
				infinito: infinito
			};
			this._requests.push(obj);
			this._ajaxRequest(obj);

			return this._indice;
		}

		/**
   * Aborta uma requisiÃ§Ã£o especÃ­fica em andamento
   *
   * @param {number} id ID da requisiÃ§Ã£o a ser abortada
   * @param {boolean} remover Indica se irÃ¡ remover a requisiÃ§Ã£o ou repeti-la
   */

	}, {
		key: 'abortar',
		value: function abortar(id) {
			var remover = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var busca = this._requests.filter(function (obj) {
				return obj.id == id;
			});
			if (busca.length) {
				if (busca[0].timer) clearTimeout(busca[0].timer);

				busca[0].xhr.abort();
				if (!remover) this._ajaxRequest(busca[0]);else this._requests.splice(this._requests.indexOf(busca[0]), 1);
			}
		}

		/**
   * Destroi a rotina atrelada Ã  classe
   */

	}, {
		key: 'remover',
		value: function remover() {
			if (this._opcoes.timeout) clearInterval(this._timerRotina);
		}
	}, {
		key: 'sessao',
		get: function get() {
			return this._opcoes.sessao;
		}

		/**
   * Altera valor da sessÃ£o
   *
   * @param {string} valor CÃ³digo da sessÃ£o
   */
		,
		set: function set(valor) {
			this._opcoes.sessao = valor;
		}
	}]);

	return Conexao;
}();

exports.default = Conexao;
},{}],14:[function(require,module,exports){
require('../../modules/core.regexp.escape');
module.exports = require('../../modules/_core').RegExp.escape;
},{"../../modules/_core":35,"../../modules/core.regexp.escape":131}],15:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],16:[function(require,module,exports){
var cof = require('./_cof');
module.exports = function(it, msg){
  if(typeof it != 'number' && cof(it) != 'Number')throw TypeError(msg);
  return +it;
};
},{"./_cof":30}],17:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":52,"./_wks":129}],18:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],19:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":61}],20:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = require('./_to-object')
  , toIndex  = require('./_to-index')
  , toLength = require('./_to-length');

module.exports = [].copyWithin || function copyWithin(target/*= 0*/, start/*= 0, end = @length*/){
  var O     = toObject(this)
    , len   = toLength(O.length)
    , to    = toIndex(target, len)
    , from  = toIndex(start, len)
    , end   = arguments.length > 2 ? arguments[2] : undefined
    , count = Math.min((end === undefined ? len : toIndex(end, len)) - from, len - to)
    , inc   = 1;
  if(from < to && to < from + count){
    inc  = -1;
    from += count - 1;
    to   += count - 1;
  }
  while(count-- > 0){
    if(from in O)O[to] = O[from];
    else delete O[to];
    to   += inc;
    from += inc;
  } return O;
};
},{"./_to-index":117,"./_to-length":120,"./_to-object":121}],21:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = require('./_to-object')
  , toIndex  = require('./_to-index')
  , toLength = require('./_to-length');
module.exports = function fill(value /*, start = 0, end = @length */){
  var O      = toObject(this)
    , length = toLength(O.length)
    , aLen   = arguments.length
    , index  = toIndex(aLen > 1 ? arguments[1] : undefined, length)
    , end    = aLen > 2 ? arguments[2] : undefined
    , endPos = end === undefined ? length : toIndex(end, length);
  while(endPos > index)O[index++] = value;
  return O;
};
},{"./_to-index":117,"./_to-length":120,"./_to-object":121}],22:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":49}],23:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":117,"./_to-iobject":119,"./_to-length":120}],24:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":27,"./_ctx":37,"./_iobject":57,"./_to-length":120,"./_to-object":121}],25:[function(require,module,exports){
var aFunction = require('./_a-function')
  , toObject  = require('./_to-object')
  , IObject   = require('./_iobject')
  , toLength  = require('./_to-length');

module.exports = function(that, callbackfn, aLen, memo, isRight){
  aFunction(callbackfn);
  var O      = toObject(that)
    , self   = IObject(O)
    , length = toLength(O.length)
    , index  = isRight ? length - 1 : 0
    , i      = isRight ? -1 : 1;
  if(aLen < 2)for(;;){
    if(index in self){
      memo = self[index];
      index += i;
      break;
    }
    index += i;
    if(isRight ? index < 0 : length <= index){
      throw TypeError('Reduce of empty array with no initial value');
    }
  }
  for(;isRight ? index >= 0 : length > index; index += i)if(index in self){
    memo = callbackfn(memo, self[index], index, O);
  }
  return memo;
};
},{"./_a-function":15,"./_iobject":57,"./_to-length":120,"./_to-object":121}],26:[function(require,module,exports){
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"./_is-array":59,"./_is-object":61,"./_wks":129}],27:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":26}],28:[function(require,module,exports){
'use strict';
var aFunction  = require('./_a-function')
  , isObject   = require('./_is-object')
  , invoke     = require('./_invoke')
  , arraySlice = [].slice
  , factories  = {};

var construct = function(F, len, args){
  if(!(len in factories)){
    for(var n = [], i = 0; i < len; i++)n[i] = 'a[' + i + ']';
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /*, args... */){
  var fn       = aFunction(this)
    , partArgs = arraySlice.call(arguments, 1);
  var bound = function(/* args... */){
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if(isObject(fn.prototype))bound.prototype = fn.prototype;
  return bound;
};
},{"./_a-function":15,"./_invoke":56,"./_is-object":61}],29:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":30,"./_wks":129}],30:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],31:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":18,"./_ctx":37,"./_defined":39,"./_descriptors":40,"./_for-of":49,"./_iter-define":65,"./_iter-step":67,"./_meta":74,"./_object-create":78,"./_object-dp":79,"./_redefine-all":98,"./_set-species":103}],32:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":22,"./_classof":29}],33:[function(require,module,exports){
'use strict';
var redefineAll       = require('./_redefine-all')
  , getWeak           = require('./_meta').getWeak
  , anObject          = require('./_an-object')
  , isObject          = require('./_is-object')
  , anInstance        = require('./_an-instance')
  , forOf             = require('./_for-of')
  , createArrayMethod = require('./_array-methods')
  , $has              = require('./_has')
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};
},{"./_an-instance":18,"./_an-object":19,"./_array-methods":24,"./_for-of":49,"./_has":51,"./_is-object":61,"./_meta":74,"./_redefine-all":98}],34:[function(require,module,exports){
'use strict';
var global            = require('./_global')
  , $export           = require('./_export')
  , redefine          = require('./_redefine')
  , redefineAll       = require('./_redefine-all')
  , meta              = require('./_meta')
  , forOf             = require('./_for-of')
  , anInstance        = require('./_an-instance')
  , isObject          = require('./_is-object')
  , fails             = require('./_fails')
  , $iterDetect       = require('./_iter-detect')
  , setToStringTag    = require('./_set-to-string-tag')
  , inheritIfRequired = require('./_inherit-if-required');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base, target, C);
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":18,"./_export":44,"./_fails":46,"./_for-of":49,"./_global":50,"./_inherit-if-required":55,"./_is-object":61,"./_iter-detect":66,"./_meta":74,"./_redefine":99,"./_redefine-all":98,"./_set-to-string-tag":104}],35:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],36:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":79,"./_property-desc":97}],37:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":15}],38:[function(require,module,exports){
'use strict';
var anObject    = require('./_an-object')
  , toPrimitive = require('./_to-primitive')
  , NUMBER      = 'number';

module.exports = function(hint){
  if(hint !== 'string' && hint !== NUMBER && hint !== 'default')throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};
},{"./_an-object":19,"./_to-primitive":122}],39:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],40:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":46}],41:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":50,"./_is-object":61}],42:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],43:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":85,"./_object-keys":88,"./_object-pie":89}],44:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , hide      = require('./_hide')
  , redefine  = require('./_redefine')
  , ctx       = require('./_ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":35,"./_ctx":37,"./_global":50,"./_hide":52,"./_redefine":99}],45:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function(KEY){
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch(e){
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch(f){ /* empty */ }
  } return true;
};
},{"./_wks":129}],46:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],47:[function(require,module,exports){
'use strict';
var hide     = require('./_hide')
  , redefine = require('./_redefine')
  , fails    = require('./_fails')
  , defined  = require('./_defined')
  , wks      = require('./_wks');

module.exports = function(KEY, length, exec){
  var SYMBOL   = wks(KEY)
    , fns      = exec(defined, SYMBOL, ''[KEY])
    , strfn    = fns[0]
    , rxfn     = fns[1];
  if(fails(function(){
    var O = {};
    O[SYMBOL] = function(){ return 7; };
    return ''[KEY](O) != 7;
  })){
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function(string, arg){ return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function(string){ return rxfn.call(string, this); }
    );
  }
};
},{"./_defined":39,"./_fails":46,"./_hide":52,"./_redefine":99,"./_wks":129}],48:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function(){
  var that   = anObject(this)
    , result = '';
  if(that.global)     result += 'g';
  if(that.ignoreCase) result += 'i';
  if(that.multiline)  result += 'm';
  if(that.unicode)    result += 'u';
  if(that.sticky)     result += 'y';
  return result;
};
},{"./_an-object":19}],49:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":19,"./_ctx":37,"./_is-array-iter":58,"./_iter-call":63,"./_to-length":120,"./core.get-iterator-method":130}],50:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],51:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],52:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":40,"./_object-dp":79,"./_property-desc":97}],53:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":50}],54:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":40,"./_dom-create":41,"./_fails":46}],55:[function(require,module,exports){
var isObject       = require('./_is-object')
  , setPrototypeOf = require('./_set-proto').set;
module.exports = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
    setPrototypeOf(that, P);
  } return that;
};
},{"./_is-object":61,"./_set-proto":102}],56:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],57:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":30}],58:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":68,"./_wks":129}],59:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":30}],60:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = require('./_is-object')
  , floor    = Math.floor;
module.exports = function isInteger(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
};
},{"./_is-object":61}],61:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],62:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object')
  , cof      = require('./_cof')
  , MATCH    = require('./_wks')('match');
module.exports = function(it){
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};
},{"./_cof":30,"./_is-object":61,"./_wks":129}],63:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":19}],64:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":52,"./_object-create":78,"./_property-desc":97,"./_set-to-string-tag":104,"./_wks":129}],65:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":44,"./_has":51,"./_hide":52,"./_iter-create":64,"./_iterators":68,"./_library":70,"./_object-gpo":86,"./_redefine":99,"./_set-to-string-tag":104,"./_wks":129}],66:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":129}],67:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],68:[function(require,module,exports){
module.exports = {};
},{}],69:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":88,"./_to-iobject":119}],70:[function(require,module,exports){
module.exports = false;
},{}],71:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;
},{}],72:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x){
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};
},{}],73:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};
},{}],74:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":46,"./_has":51,"./_is-object":61,"./_object-dp":79,"./_uid":126}],75:[function(require,module,exports){
var Map     = require('./es6.map')
  , $export = require('./_export')
  , shared  = require('./_shared')('metadata')
  , store   = shared.store || (shared.store = new (require('./es6.weak-map')));

var getOrCreateMetadataMap = function(target, targetKey, create){
  var targetMetadata = store.get(target);
  if(!targetMetadata){
    if(!create)return undefined;
    store.set(target, targetMetadata = new Map);
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if(!keyMetadata){
    if(!create)return undefined;
    targetMetadata.set(targetKey, keyMetadata = new Map);
  } return keyMetadata;
};
var ordinaryHasOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
};
var ordinaryGetOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
};
var ordinaryDefineOwnMetadata = function(MetadataKey, MetadataValue, O, P){
  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
};
var ordinaryOwnMetadataKeys = function(target, targetKey){
  var metadataMap = getOrCreateMetadataMap(target, targetKey, false)
    , keys        = [];
  if(metadataMap)metadataMap.forEach(function(_, key){ keys.push(key); });
  return keys;
};
var toMetaKey = function(it){
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};
var exp = function(O){
  $export($export.S, 'Reflect', O);
};

module.exports = {
  store: store,
  map: getOrCreateMetadataMap,
  has: ordinaryHasOwnMetadata,
  get: ordinaryGetOwnMetadata,
  set: ordinaryDefineOwnMetadata,
  keys: ordinaryOwnMetadataKeys,
  key: toMetaKey,
  exp: exp
};
},{"./_export":44,"./_shared":106,"./es6.map":161,"./es6.weak-map":267}],76:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":30,"./_global":50,"./_task":116}],77:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":46,"./_iobject":57,"./_object-gops":85,"./_object-keys":88,"./_object-pie":89,"./_to-object":121}],78:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":19,"./_dom-create":41,"./_enum-bug-keys":42,"./_html":53,"./_object-dps":80,"./_shared-key":105}],79:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":19,"./_descriptors":40,"./_ie8-dom-define":54,"./_to-primitive":122}],80:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":19,"./_descriptors":40,"./_object-dp":79,"./_object-keys":88}],81:[function(require,module,exports){
// Forced replacement prototype accessors methods
module.exports = require('./_library')|| !require('./_fails')(function(){
  var K = Math.random();
  // In FF throws only define methods
  __defineSetter__.call(null, K, function(){ /* empty */});
  delete require('./_global')[K];
});
},{"./_fails":46,"./_global":50,"./_library":70}],82:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":40,"./_has":51,"./_ie8-dom-define":54,"./_object-pie":89,"./_property-desc":97,"./_to-iobject":119,"./_to-primitive":122}],83:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":84,"./_to-iobject":119}],84:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":42,"./_object-keys-internal":87}],85:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],86:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":51,"./_shared-key":105,"./_to-object":121}],87:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":23,"./_has":51,"./_shared-key":105,"./_to-iobject":119}],88:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":42,"./_object-keys-internal":87}],89:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],90:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":35,"./_export":44,"./_fails":46}],91:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject')
  , isEnum    = require('./_object-pie').f;
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)if(isEnum.call(O, key = keys[i++])){
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};
},{"./_object-keys":88,"./_object-pie":89,"./_to-iobject":119}],92:[function(require,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN     = require('./_object-gopn')
  , gOPS     = require('./_object-gops')
  , anObject = require('./_an-object')
  , Reflect  = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
  var keys       = gOPN.f(anObject(it))
    , getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./_an-object":19,"./_global":50,"./_object-gopn":84,"./_object-gops":85}],93:[function(require,module,exports){
var $parseFloat = require('./_global').parseFloat
  , $trim       = require('./_string-trim').trim;

module.exports = 1 / $parseFloat(require('./_string-ws') + '-0') !== -Infinity ? function parseFloat(str){
  var string = $trim(String(str), 3)
    , result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;
},{"./_global":50,"./_string-trim":114,"./_string-ws":115}],94:[function(require,module,exports){
var $parseInt = require('./_global').parseInt
  , $trim     = require('./_string-trim').trim
  , ws        = require('./_string-ws')
  , hex       = /^[\-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix){
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;
},{"./_global":50,"./_string-trim":114,"./_string-ws":115}],95:[function(require,module,exports){
'use strict';
var path      = require('./_path')
  , invoke    = require('./_invoke')
  , aFunction = require('./_a-function');
module.exports = function(/* ...pargs */){
  var fn     = aFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that = this
      , aLen = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !aLen)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(aLen > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./_a-function":15,"./_invoke":56,"./_path":96}],96:[function(require,module,exports){
module.exports = require('./_global');
},{"./_global":50}],97:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],98:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"./_redefine":99}],99:[function(require,module,exports){
var global    = require('./_global')
  , hide      = require('./_hide')
  , has       = require('./_has')
  , SRC       = require('./_uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./_core":35,"./_global":50,"./_has":51,"./_hide":52,"./_uid":126}],100:[function(require,module,exports){
module.exports = function(regExp, replace){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(it).replace(regExp, replacer);
  };
};
},{}],101:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],102:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":19,"./_ctx":37,"./_is-object":61,"./_object-gopd":82}],103:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_descriptors":40,"./_global":50,"./_object-dp":79,"./_wks":129}],104:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":51,"./_object-dp":79,"./_wks":129}],105:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":106,"./_uid":126}],106:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":50}],107:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":15,"./_an-object":19,"./_wks":129}],108:[function(require,module,exports){
var fails = require('./_fails');

module.exports = function(method, arg){
  return !!method && fails(function(){
    arg ? method.call(null, function(){}, 1) : method.call(null);
  });
};
},{"./_fails":46}],109:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":39,"./_to-integer":118}],110:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp')
  , defined  = require('./_defined');

module.exports = function(that, searchString, NAME){
  if(isRegExp(searchString))throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};
},{"./_defined":39,"./_is-regexp":62}],111:[function(require,module,exports){
var $export = require('./_export')
  , fails   = require('./_fails')
  , defined = require('./_defined')
  , quot    = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function(string, tag, attribute, value) {
  var S  = String(defined(string))
    , p1 = '<' + tag;
  if(attribute !== '')p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function(NAME, exec){
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function(){
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};
},{"./_defined":39,"./_export":44,"./_fails":46}],112:[function(require,module,exports){
// https://github.com/tc39/proposal-string-pad-start-end
var toLength = require('./_to-length')
  , repeat   = require('./_string-repeat')
  , defined  = require('./_defined');

module.exports = function(that, maxLength, fillString, left){
  var S            = String(defined(that))
    , stringLength = S.length
    , fillStr      = fillString === undefined ? ' ' : String(fillString)
    , intMaxLength = toLength(maxLength);
  if(intMaxLength <= stringLength || fillStr == '')return S;
  var fillLen = intMaxLength - stringLength
    , stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if(stringFiller.length > fillLen)stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

},{"./_defined":39,"./_string-repeat":113,"./_to-length":120}],113:[function(require,module,exports){
'use strict';
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');

module.exports = function repeat(count){
  var str = String(defined(this))
    , res = ''
    , n   = toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./_defined":39,"./_to-integer":118}],114:[function(require,module,exports){
var $export = require('./_export')
  , defined = require('./_defined')
  , fails   = require('./_fails')
  , spaces  = require('./_string-ws')
  , space   = '[' + spaces + ']'
  , non     = '\u200b\u0085'
  , ltrim   = RegExp('^' + space + space + '*')
  , rtrim   = RegExp(space + space + '*$');

var exporter = function(KEY, exec, ALIAS){
  var exp   = {};
  var FORCE = fails(function(){
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if(ALIAS)exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function(string, TYPE){
  string = String(defined(string));
  if(TYPE & 1)string = string.replace(ltrim, '');
  if(TYPE & 2)string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;
},{"./_defined":39,"./_export":44,"./_fails":46,"./_string-ws":115}],115:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
},{}],116:[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":30,"./_ctx":37,"./_dom-create":41,"./_global":50,"./_html":53,"./_invoke":56}],117:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":118}],118:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],119:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":39,"./_iobject":57}],120:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":118}],121:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":39}],122:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":61}],123:[function(require,module,exports){
'use strict';
if(require('./_descriptors')){
  var LIBRARY             = require('./_library')
    , global              = require('./_global')
    , fails               = require('./_fails')
    , $export             = require('./_export')
    , $typed              = require('./_typed')
    , $buffer             = require('./_typed-buffer')
    , ctx                 = require('./_ctx')
    , anInstance          = require('./_an-instance')
    , propertyDesc        = require('./_property-desc')
    , hide                = require('./_hide')
    , redefineAll         = require('./_redefine-all')
    , toInteger           = require('./_to-integer')
    , toLength            = require('./_to-length')
    , toIndex             = require('./_to-index')
    , toPrimitive         = require('./_to-primitive')
    , has                 = require('./_has')
    , same                = require('./_same-value')
    , classof             = require('./_classof')
    , isObject            = require('./_is-object')
    , toObject            = require('./_to-object')
    , isArrayIter         = require('./_is-array-iter')
    , create              = require('./_object-create')
    , getPrototypeOf      = require('./_object-gpo')
    , gOPN                = require('./_object-gopn').f
    , getIterFn           = require('./core.get-iterator-method')
    , uid                 = require('./_uid')
    , wks                 = require('./_wks')
    , createArrayMethod   = require('./_array-methods')
    , createArrayIncludes = require('./_array-includes')
    , speciesConstructor  = require('./_species-constructor')
    , ArrayIterators      = require('./es6.array.iterator')
    , Iterators           = require('./_iterators')
    , $iterDetect         = require('./_iter-detect')
    , setSpecies          = require('./_set-species')
    , arrayFill           = require('./_array-fill')
    , arrayCopyWithin     = require('./_array-copy-within')
    , $DP                 = require('./_object-dp')
    , $GOPD               = require('./_object-gopd')
    , dP                  = $DP.f
    , gOPD                = $GOPD.f
    , RangeError          = global.RangeError
    , TypeError           = global.TypeError
    , Uint8Array          = global.Uint8Array
    , ARRAY_BUFFER        = 'ArrayBuffer'
    , SHARED_BUFFER       = 'Shared' + ARRAY_BUFFER
    , BYTES_PER_ELEMENT   = 'BYTES_PER_ELEMENT'
    , PROTOTYPE           = 'prototype'
    , ArrayProto          = Array[PROTOTYPE]
    , $ArrayBuffer        = $buffer.ArrayBuffer
    , $DataView           = $buffer.DataView
    , arrayForEach        = createArrayMethod(0)
    , arrayFilter         = createArrayMethod(2)
    , arraySome           = createArrayMethod(3)
    , arrayEvery          = createArrayMethod(4)
    , arrayFind           = createArrayMethod(5)
    , arrayFindIndex      = createArrayMethod(6)
    , arrayIncludes       = createArrayIncludes(true)
    , arrayIndexOf        = createArrayIncludes(false)
    , arrayValues         = ArrayIterators.values
    , arrayKeys           = ArrayIterators.keys
    , arrayEntries        = ArrayIterators.entries
    , arrayLastIndexOf    = ArrayProto.lastIndexOf
    , arrayReduce         = ArrayProto.reduce
    , arrayReduceRight    = ArrayProto.reduceRight
    , arrayJoin           = ArrayProto.join
    , arraySort           = ArrayProto.sort
    , arraySlice          = ArrayProto.slice
    , arrayToString       = ArrayProto.toString
    , arrayToLocaleString = ArrayProto.toLocaleString
    , ITERATOR            = wks('iterator')
    , TAG                 = wks('toStringTag')
    , TYPED_CONSTRUCTOR   = uid('typed_constructor')
    , DEF_CONSTRUCTOR     = uid('def_constructor')
    , ALL_CONSTRUCTORS    = $typed.CONSTR
    , TYPED_ARRAY         = $typed.TYPED
    , VIEW                = $typed.VIEW
    , WRONG_LENGTH        = 'Wrong length!';

  var $map = createArrayMethod(1, function(O, length){
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function(){
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function(){
    new Uint8Array(1).set({});
  });

  var strictToLength = function(it, SAME){
    if(it === undefined)throw TypeError(WRONG_LENGTH);
    var number = +it
      , length = toLength(it);
    if(SAME && !same(number, length))throw RangeError(WRONG_LENGTH);
    return length;
  };

  var toOffset = function(it, BYTES){
    var offset = toInteger(it);
    if(offset < 0 || offset % BYTES)throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function(it){
    if(isObject(it) && TYPED_ARRAY in it)return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function(C, length){
    if(!(isObject(C) && TYPED_CONSTRUCTOR in C)){
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function(O, list){
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function(C, list){
    var index  = 0
      , length = list.length
      , result = allocate(C, length);
    while(length > index)result[index] = list[index++];
    return result;
  };

  var addGetter = function(it, key, internal){
    dP(it, key, {get: function(){ return this._d[internal]; }});
  };

  var $from = function from(source /*, mapfn, thisArg */){
    var O       = toObject(source)
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , iterFn  = getIterFn(O)
      , i, length, values, result, step, iterator;
    if(iterFn != undefined && !isArrayIter(iterFn)){
      for(iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++){
        values.push(step.value);
      } O = values;
    }
    if(mapping && aLen > 2)mapfn = ctx(mapfn, arguments[2], 2);
    for(i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++){
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/*...items*/){
    var index  = 0
      , length = arguments.length
      , result = allocate(this, length);
    while(length > index)result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function(){ arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString(){
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /*, end */){
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /*, thisArg */){
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /*, start, end */){ // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /*, thisArg */){
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /*, thisArg */){
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /*, thisArg */){
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /*, thisArg */){
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /*, fromIndex */){
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /*, fromIndex */){
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator){ // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */){ // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /*, thisArg */){
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse(){
      var that   = this
        , length = validate(that).length
        , middle = Math.floor(length / 2)
        , index  = 0
        , value;
      while(index < middle){
        value         = that[index];
        that[index++] = that[--length];
        that[length]  = value;
      } return that;
    },
    some: function some(callbackfn /*, thisArg */){
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn){
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end){
      var O      = validate(this)
        , length = O.length
        , $begin = toIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end){
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /*, offset */){
    validate(this);
    var offset = toOffset(arguments[1], 1)
      , length = this.length
      , src    = toObject(arrayLike)
      , len    = toLength(src.length)
      , index  = 0;
    if(len + offset > length)throw RangeError(WRONG_LENGTH);
    while(index < len)this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries(){
      return arrayEntries.call(validate(this));
    },
    keys: function keys(){
      return arrayKeys.call(validate(this));
    },
    values: function values(){
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function(target, key){
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key){
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc){
    if(isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ){
      target[key] = desc.value;
      return target;
    } else return dP(target, key, desc);
  };

  if(!ALL_CONSTRUCTORS){
    $GOPD.f = $getDesc;
    $DP.f   = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty:           $setDesc
  });

  if(fails(function(){ arrayToString.call({}); })){
    arrayToString = arrayToLocaleString = function toString(){
      return arrayJoin.call(this);
    }
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice:          $slice,
    set:            $set,
    constructor:    function(){ /* noop */ },
    toString:       arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function(){ return this[TYPED_ARRAY]; }
  });

  module.exports = function(KEY, BYTES, wrapper, CLAMPED){
    CLAMPED = !!CLAMPED;
    var NAME       = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
      , ISNT_UINT8 = NAME != 'Uint8Array'
      , GETTER     = 'get' + KEY
      , SETTER     = 'set' + KEY
      , TypedArray = global[NAME]
      , Base       = TypedArray || {}
      , TAC        = TypedArray && getPrototypeOf(TypedArray)
      , FORCED     = !TypedArray || !$typed.ABV
      , O          = {}
      , TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function(that, index){
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function(that, index, value){
      var data = that._d;
      if(CLAMPED)value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function(that, index){
      dP(that, index, {
        get: function(){
          return getter(this, index);
        },
        set: function(value){
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if(FORCED){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME, '_d');
        var index  = 0
          , offset = 0
          , buffer, byteLength, length, klass;
        if(!isObject(data)){
          length     = strictToLength(data, true)
          byteLength = length * BYTES;
          buffer     = new $ArrayBuffer(byteLength);
        } else if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if($length === undefined){
            if($len % BYTES)throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if(byteLength < 0)throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if(byteLength + offset > $len)throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if(TYPED_ARRAY in data){
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while(index < length)addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if(!$iterDetect(function(iter){
      // V8 works with iterators, but fails in many other cases
      // https://code.google.com/p/v8/issues/detail?id=4552
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if(!isObject(data))return new Base(strictToLength(data, ISNT_UINT8));
        if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if(TYPED_ARRAY in data)return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function(key){
        if(!(key in TypedArray))hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if(!LIBRARY)TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator   = TypedArrayPrototype[ITERATOR]
      , CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined)
      , $iterator         = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if(CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)){
      dP(TypedArrayPrototype, TAG, {
        get: function(){ return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES,
      from: $from,
      of: $of
    });

    if(!(BYTES_PER_ELEMENT in TypedArrayPrototype))hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, {set: $set});

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    $export($export.P + $export.F * (TypedArrayPrototype.toString != arrayToString), NAME, {toString: arrayToString});

    $export($export.P + $export.F * fails(function(){
      new TypedArray(1).slice();
    }), NAME, {slice: $slice});

    $export($export.P + $export.F * (fails(function(){
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString()
    }) || !fails(function(){
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, {toLocaleString: $toLocaleString});

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if(!LIBRARY && !CORRECT_ITER_NAME)hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function(){ /* empty */ };
},{"./_an-instance":18,"./_array-copy-within":20,"./_array-fill":21,"./_array-includes":23,"./_array-methods":24,"./_classof":29,"./_ctx":37,"./_descriptors":40,"./_export":44,"./_fails":46,"./_global":50,"./_has":51,"./_hide":52,"./_is-array-iter":58,"./_is-object":61,"./_iter-detect":66,"./_iterators":68,"./_library":70,"./_object-create":78,"./_object-dp":79,"./_object-gopd":82,"./_object-gopn":84,"./_object-gpo":86,"./_property-desc":97,"./_redefine-all":98,"./_same-value":101,"./_set-species":103,"./_species-constructor":107,"./_to-index":117,"./_to-integer":118,"./_to-length":120,"./_to-object":121,"./_to-primitive":122,"./_typed":125,"./_typed-buffer":124,"./_uid":126,"./_wks":129,"./core.get-iterator-method":130,"./es6.array.iterator":142}],124:[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , DESCRIPTORS    = require('./_descriptors')
  , LIBRARY        = require('./_library')
  , $typed         = require('./_typed')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , fails          = require('./_fails')
  , anInstance     = require('./_an-instance')
  , toInteger      = require('./_to-integer')
  , toLength       = require('./_to-length')
  , gOPN           = require('./_object-gopn').f
  , dP             = require('./_object-dp').f
  , arrayFill      = require('./_array-fill')
  , setToStringTag = require('./_set-to-string-tag')
  , ARRAY_BUFFER   = 'ArrayBuffer'
  , DATA_VIEW      = 'DataView'
  , PROTOTYPE      = 'prototype'
  , WRONG_LENGTH   = 'Wrong length!'
  , WRONG_INDEX    = 'Wrong index!'
  , $ArrayBuffer   = global[ARRAY_BUFFER]
  , $DataView      = global[DATA_VIEW]
  , Math           = global.Math
  , RangeError     = global.RangeError
  , Infinity       = global.Infinity
  , BaseBuffer     = $ArrayBuffer
  , abs            = Math.abs
  , pow            = Math.pow
  , floor          = Math.floor
  , log            = Math.log
  , LN2            = Math.LN2
  , BUFFER         = 'buffer'
  , BYTE_LENGTH    = 'byteLength'
  , BYTE_OFFSET    = 'byteOffset'
  , $BUFFER        = DESCRIPTORS ? '_b' : BUFFER
  , $LENGTH        = DESCRIPTORS ? '_l' : BYTE_LENGTH
  , $OFFSET        = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
var packIEEE754 = function(value, mLen, nBytes){
  var buffer = Array(nBytes)
    , eLen   = nBytes * 8 - mLen - 1
    , eMax   = (1 << eLen) - 1
    , eBias  = eMax >> 1
    , rt     = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0
    , i      = 0
    , s      = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0
    , e, m, c;
  value = abs(value)
  if(value != value || value === Infinity){
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if(value * (c = pow(2, -e)) < 1){
      e--;
      c *= 2;
    }
    if(e + eBias >= 1){
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if(value * c >= 2){
      e++;
      c /= 2;
    }
    if(e + eBias >= eMax){
      m = 0;
      e = eMax;
    } else if(e + eBias >= 1){
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for(; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for(; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
};
var unpackIEEE754 = function(buffer, mLen, nBytes){
  var eLen  = nBytes * 8 - mLen - 1
    , eMax  = (1 << eLen) - 1
    , eBias = eMax >> 1
    , nBits = eLen - 7
    , i     = nBytes - 1
    , s     = buffer[i--]
    , e     = s & 127
    , m;
  s >>= 7;
  for(; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for(; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if(e === 0){
    e = 1 - eBias;
  } else if(e === eMax){
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
};

var unpackI32 = function(bytes){
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
};
var packI8 = function(it){
  return [it & 0xff];
};
var packI16 = function(it){
  return [it & 0xff, it >> 8 & 0xff];
};
var packI32 = function(it){
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
};
var packF64 = function(it){
  return packIEEE754(it, 52, 8);
};
var packF32 = function(it){
  return packIEEE754(it, 23, 4);
};

var addGetter = function(C, key, internal){
  dP(C[PROTOTYPE], key, {get: function(){ return this[internal]; }});
};

var get = function(view, bytes, index, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
};
var set = function(view, bytes, index, conversion, value, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = conversion(+value);
  for(var i = 0; i < bytes; i++)store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
};

var validateArrayBufferArguments = function(that, length){
  anInstance(that, $ArrayBuffer, ARRAY_BUFFER);
  var numberLength = +length
    , byteLength   = toLength(numberLength);
  if(numberLength != byteLength)throw RangeError(WRONG_LENGTH);
  return byteLength;
};

if(!$typed.ABV){
  $ArrayBuffer = function ArrayBuffer(length){
    var byteLength = validateArrayBufferArguments(this, length);
    this._b       = arrayFill.call(Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength){
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH]
      , offset       = toInteger(byteOffset);
    if(offset < 0 || offset > bufferLength)throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if(offset + byteLength > bufferLength)throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if(DESCRIPTORS){
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset){
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset){
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /*, littleEndian */){
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if(!fails(function(){
    new $ArrayBuffer;     // eslint-disable-line no-new
  }) || !fails(function(){
    new $ArrayBuffer(.5); // eslint-disable-line no-new
  })){
    $ArrayBuffer = function ArrayBuffer(length){
      return new BaseBuffer(validateArrayBufferArguments(this, length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for(var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j; ){
      if(!((key = keys[j++]) in $ArrayBuffer))hide($ArrayBuffer, key, BaseBuffer[key]);
    };
    if(!LIBRARY)ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2))
    , $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if(view.getInt8(0) || !view.getInt8(1))redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;
},{"./_an-instance":18,"./_array-fill":21,"./_descriptors":40,"./_fails":46,"./_global":50,"./_hide":52,"./_library":70,"./_object-dp":79,"./_object-gopn":84,"./_redefine-all":98,"./_set-to-string-tag":104,"./_to-integer":118,"./_to-length":120,"./_typed":125}],125:[function(require,module,exports){
var global = require('./_global')
  , hide   = require('./_hide')
  , uid    = require('./_uid')
  , TYPED  = uid('typed_array')
  , VIEW   = uid('view')
  , ABV    = !!(global.ArrayBuffer && global.DataView)
  , CONSTR = ABV
  , i = 0, l = 9, Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while(i < l){
  if(Typed = global[TypedArrayConstructors[i++]]){
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV:    ABV,
  CONSTR: CONSTR,
  TYPED:  TYPED,
  VIEW:   VIEW
};
},{"./_global":50,"./_hide":52,"./_uid":126}],126:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],127:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":35,"./_global":50,"./_library":70,"./_object-dp":79,"./_wks-ext":128}],128:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":129}],129:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":50,"./_shared":106,"./_uid":126}],130:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":29,"./_core":35,"./_iterators":68,"./_wks":129}],131:[function(require,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $export = require('./_export')
  , $re     = require('./_replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&');

$export($export.S, 'RegExp', {escape: function escape(it){ return $re(it); }});

},{"./_export":44,"./_replacer":100}],132:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', {copyWithin: require('./_array-copy-within')});

require('./_add-to-unscopables')('copyWithin');
},{"./_add-to-unscopables":17,"./_array-copy-within":20,"./_export":44}],133:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $every  = require('./_array-methods')(4);

$export($export.P + $export.F * !require('./_strict-method')([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */){
    return $every(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":24,"./_export":44,"./_strict-method":108}],134:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', {fill: require('./_array-fill')});

require('./_add-to-unscopables')('fill');
},{"./_add-to-unscopables":17,"./_array-fill":21,"./_export":44}],135:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $filter = require('./_array-methods')(2);

$export($export.P + $export.F * !require('./_strict-method')([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */){
    return $filter(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":24,"./_export":44,"./_strict-method":108}],136:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./_export')
  , $find   = require('./_array-methods')(6)
  , KEY     = 'findIndex'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);
},{"./_add-to-unscopables":17,"./_array-methods":24,"./_export":44}],137:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export')
  , $find   = require('./_array-methods')(5)
  , KEY     = 'find'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);
},{"./_add-to-unscopables":17,"./_array-methods":24,"./_export":44}],138:[function(require,module,exports){
'use strict';
var $export  = require('./_export')
  , $forEach = require('./_array-methods')(0)
  , STRICT   = require('./_strict-method')([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */){
    return $forEach(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":24,"./_export":44,"./_strict-method":108}],139:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":36,"./_ctx":37,"./_export":44,"./_is-array-iter":58,"./_iter-call":63,"./_iter-detect":66,"./_to-length":120,"./_to-object":121,"./core.get-iterator-method":130}],140:[function(require,module,exports){
'use strict';
var $export       = require('./_export')
  , $indexOf      = require('./_array-includes')(false)
  , $native       = [].indexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /*, fromIndex = 0 */){
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});
},{"./_array-includes":23,"./_export":44,"./_strict-method":108}],141:[function(require,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = require('./_export');

$export($export.S, 'Array', {isArray: require('./_is-array')});
},{"./_export":44,"./_is-array":59}],142:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":17,"./_iter-define":65,"./_iter-step":67,"./_iterators":68,"./_to-iobject":119}],143:[function(require,module,exports){
'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var $export   = require('./_export')
  , toIObject = require('./_to-iobject')
  , arrayJoin = [].join;

// fallback for not array-like strings
$export($export.P + $export.F * (require('./_iobject') != Object || !require('./_strict-method')(arrayJoin)), 'Array', {
  join: function join(separator){
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});
},{"./_export":44,"./_iobject":57,"./_strict-method":108,"./_to-iobject":119}],144:[function(require,module,exports){
'use strict';
var $export       = require('./_export')
  , toIObject     = require('./_to-iobject')
  , toInteger     = require('./_to-integer')
  , toLength      = require('./_to-length')
  , $native       = [].lastIndexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /*, fromIndex = @[*-1] */){
    // convert -0 to +0
    if(NEGATIVE_ZERO)return $native.apply(this, arguments) || 0;
    var O      = toIObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, toInteger(arguments[1]));
    if(index < 0)index = length + index;
    for(;index >= 0; index--)if(index in O)if(O[index] === searchElement)return index || 0;
    return -1;
  }
});
},{"./_export":44,"./_strict-method":108,"./_to-integer":118,"./_to-iobject":119,"./_to-length":120}],145:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $map    = require('./_array-methods')(1);

$export($export.P + $export.F * !require('./_strict-method')([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */){
    return $map(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":24,"./_export":44,"./_strict-method":108}],146:[function(require,module,exports){
'use strict';
var $export        = require('./_export')
  , createProperty = require('./_create-property');

// WebKit Array.of isn't generic
$export($export.S + $export.F * require('./_fails')(function(){
  function F(){}
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , aLen   = arguments.length
      , result = new (typeof this == 'function' ? this : Array)(aLen);
    while(aLen > index)createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});
},{"./_create-property":36,"./_export":44,"./_fails":46}],147:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $reduce = require('./_array-reduce');

$export($export.P + $export.F * !require('./_strict-method')([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});
},{"./_array-reduce":25,"./_export":44,"./_strict-method":108}],148:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $reduce = require('./_array-reduce');

$export($export.P + $export.F * !require('./_strict-method')([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
},{"./_array-reduce":25,"./_export":44,"./_strict-method":108}],149:[function(require,module,exports){
'use strict';
var $export    = require('./_export')
  , html       = require('./_html')
  , cof        = require('./_cof')
  , toIndex    = require('./_to-index')
  , toLength   = require('./_to-length')
  , arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
$export($export.P + $export.F * require('./_fails')(function(){
  if(html)arraySlice.call(html);
}), 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return arraySlice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
},{"./_cof":30,"./_export":44,"./_fails":46,"./_html":53,"./_to-index":117,"./_to-length":120}],150:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $some   = require('./_array-methods')(3);

$export($export.P + $export.F * !require('./_strict-method')([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */){
    return $some(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":24,"./_export":44,"./_strict-method":108}],151:[function(require,module,exports){
'use strict';
var $export   = require('./_export')
  , aFunction = require('./_a-function')
  , toObject  = require('./_to-object')
  , fails     = require('./_fails')
  , $sort     = [].sort
  , test      = [1, 2, 3];

$export($export.P + $export.F * (fails(function(){
  // IE8-
  test.sort(undefined);
}) || !fails(function(){
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !require('./_strict-method')($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn){
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});
},{"./_a-function":15,"./_export":44,"./_fails":46,"./_strict-method":108,"./_to-object":121}],152:[function(require,module,exports){
require('./_set-species')('Array');
},{"./_set-species":103}],153:[function(require,module,exports){
// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = require('./_export');

$export($export.S, 'Date', {now: function(){ return new Date().getTime(); }});
},{"./_export":44}],154:[function(require,module,exports){
'use strict';
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = require('./_export')
  , fails   = require('./_fails')
  , getTime = Date.prototype.getTime;

var lz = function(num){
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (fails(function(){
  return new Date(-5e13 - 1).toISOString() != '0385-07-25T07:06:39.999Z';
}) || !fails(function(){
  new Date(NaN).toISOString();
})), 'Date', {
  toISOString: function toISOString(){
    if(!isFinite(getTime.call(this)))throw RangeError('Invalid time value');
    var d = this
      , y = d.getUTCFullYear()
      , m = d.getUTCMilliseconds()
      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  }
});
},{"./_export":44,"./_fails":46}],155:[function(require,module,exports){
'use strict';
var $export     = require('./_export')
  , toObject    = require('./_to-object')
  , toPrimitive = require('./_to-primitive');

$export($export.P + $export.F * require('./_fails')(function(){
  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({toISOString: function(){ return 1; }}) !== 1;
}), 'Date', {
  toJSON: function toJSON(key){
    var O  = toObject(this)
      , pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});
},{"./_export":44,"./_fails":46,"./_to-object":121,"./_to-primitive":122}],156:[function(require,module,exports){
var TO_PRIMITIVE = require('./_wks')('toPrimitive')
  , proto        = Date.prototype;

if(!(TO_PRIMITIVE in proto))require('./_hide')(proto, TO_PRIMITIVE, require('./_date-to-primitive'));
},{"./_date-to-primitive":38,"./_hide":52,"./_wks":129}],157:[function(require,module,exports){
var DateProto    = Date.prototype
  , INVALID_DATE = 'Invalid Date'
  , TO_STRING    = 'toString'
  , $toString    = DateProto[TO_STRING]
  , getTime      = DateProto.getTime;
if(new Date(NaN) + '' != INVALID_DATE){
  require('./_redefine')(DateProto, TO_STRING, function toString(){
    var value = getTime.call(this);
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}
},{"./_redefine":99}],158:[function(require,module,exports){
// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
var $export = require('./_export');

$export($export.P, 'Function', {bind: require('./_bind')});
},{"./_bind":28,"./_export":44}],159:[function(require,module,exports){
'use strict';
var isObject       = require('./_is-object')
  , getPrototypeOf = require('./_object-gpo')
  , HAS_INSTANCE   = require('./_wks')('hasInstance')
  , FunctionProto  = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))require('./_object-dp').f(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(typeof this != 'function' || !isObject(O))return false;
  if(!isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = getPrototypeOf(O))if(this.prototype === O)return true;
  return false;
}});
},{"./_is-object":61,"./_object-dp":79,"./_object-gpo":86,"./_wks":129}],160:[function(require,module,exports){
var dP         = require('./_object-dp').f
  , createDesc = require('./_property-desc')
  , has        = require('./_has')
  , FProto     = Function.prototype
  , nameRE     = /^\s*function ([^ (]*)/
  , NAME       = 'name';

var isExtensible = Object.isExtensible || function(){
  return true;
};

// 19.2.4.2 name
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function(){
    try {
      var that = this
        , name = ('' + that).match(nameRE)[1];
      has(that, NAME) || !isExtensible(that) || dP(that, NAME, createDesc(5, name));
      return name;
    } catch(e){
      return '';
    }
  }
});
},{"./_descriptors":40,"./_has":51,"./_object-dp":79,"./_property-desc":97}],161:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.1 Map Objects
module.exports = require('./_collection')('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./_collection":34,"./_collection-strong":31}],162:[function(require,module,exports){
// 20.2.2.3 Math.acosh(x)
var $export = require('./_export')
  , log1p   = require('./_math-log1p')
  , sqrt    = Math.sqrt
  , $acosh  = Math.acosh;

$export($export.S + $export.F * !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN 
  && $acosh(Infinity) == Infinity
), 'Math', {
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});
},{"./_export":44,"./_math-log1p":72}],163:[function(require,module,exports){
// 20.2.2.5 Math.asinh(x)
var $export = require('./_export')
  , $asinh  = Math.asinh;

function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0 
$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {asinh: asinh});
},{"./_export":44}],164:[function(require,module,exports){
// 20.2.2.7 Math.atanh(x)
var $export = require('./_export')
  , $atanh  = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0 
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});
},{"./_export":44}],165:[function(require,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $export = require('./_export')
  , sign    = require('./_math-sign');

$export($export.S, 'Math', {
  cbrt: function cbrt(x){
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
},{"./_export":44,"./_math-sign":73}],166:[function(require,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
},{"./_export":44}],167:[function(require,module,exports){
// 20.2.2.12 Math.cosh(x)
var $export = require('./_export')
  , exp     = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
},{"./_export":44}],168:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $export = require('./_export')
  , $expm1  = require('./_math-expm1');

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', {expm1: $expm1});
},{"./_export":44,"./_math-expm1":71}],169:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var $export   = require('./_export')
  , sign      = require('./_math-sign')
  , pow       = Math.pow
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);

var roundTiesToEven = function(n){
  return n + 1 / EPSILON - 1 / EPSILON;
};


$export($export.S, 'Math', {
  fround: function fround(x){
    var $abs  = Math.abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  }
});
},{"./_export":44,"./_math-sign":73}],170:[function(require,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, â€¦ ]]])
var $export = require('./_export')
  , abs     = Math.abs;

$export($export.S, 'Math', {
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , aLen = arguments.length
      , larg = 0
      , arg, div;
    while(i < aLen){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});
},{"./_export":44}],171:[function(require,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = require('./_export')
  , $imul   = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * require('./_fails')(function(){
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y){
    var UINT16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UINT16 & xn
      , yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});
},{"./_export":44,"./_fails":46}],172:[function(require,module,exports){
// 20.2.2.21 Math.log10(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log10: function log10(x){
    return Math.log(x) / Math.LN10;
  }
});
},{"./_export":44}],173:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
var $export = require('./_export');

$export($export.S, 'Math', {log1p: require('./_math-log1p')});
},{"./_export":44,"./_math-log1p":72}],174:[function(require,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log2: function log2(x){
    return Math.log(x) / Math.LN2;
  }
});
},{"./_export":44}],175:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
var $export = require('./_export');

$export($export.S, 'Math', {sign: require('./_math-sign')});
},{"./_export":44,"./_math-sign":73}],176:[function(require,module,exports){
// 20.2.2.30 Math.sinh(x)
var $export = require('./_export')
  , expm1   = require('./_math-expm1')
  , exp     = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
$export($export.S + $export.F * require('./_fails')(function(){
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x){
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});
},{"./_export":44,"./_fails":46,"./_math-expm1":71}],177:[function(require,module,exports){
// 20.2.2.33 Math.tanh(x)
var $export = require('./_export')
  , expm1   = require('./_math-expm1')
  , exp     = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});
},{"./_export":44,"./_math-expm1":71}],178:[function(require,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  trunc: function trunc(it){
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
},{"./_export":44}],179:[function(require,module,exports){
'use strict';
var global            = require('./_global')
  , has               = require('./_has')
  , cof               = require('./_cof')
  , inheritIfRequired = require('./_inherit-if-required')
  , toPrimitive       = require('./_to-primitive')
  , fails             = require('./_fails')
  , gOPN              = require('./_object-gopn').f
  , gOPD              = require('./_object-gopd').f
  , dP                = require('./_object-dp').f
  , $trim             = require('./_string-trim').trim
  , NUMBER            = 'Number'
  , $Number           = global[NUMBER]
  , Base              = $Number
  , proto             = $Number.prototype
  // Opera ~12 has broken Object#toString
  , BROKEN_COF        = cof(require('./_object-create')(proto)) == NUMBER
  , TRIM              = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function(argument){
  var it = toPrimitive(argument, false);
  if(typeof it == 'string' && it.length > 2){
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0)
      , third, radix, maxCode;
    if(first === 43 || first === 45){
      third = it.charCodeAt(2);
      if(third === 88 || third === 120)return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if(first === 48){
      switch(it.charCodeAt(1)){
        case 66 : case 98  : radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79 : case 111 : radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default : return +it;
      }
      for(var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++){
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if(code < 48 || code > maxCode)return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if(!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')){
  $Number = function Number(value){
    var it = arguments.length < 1 ? 0 : value
      , that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function(){ proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for(var keys = require('./_descriptors') ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++){
    if(has(Base, key = keys[j]) && !has($Number, key)){
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./_redefine')(global, NUMBER, $Number);
}
},{"./_cof":30,"./_descriptors":40,"./_fails":46,"./_global":50,"./_has":51,"./_inherit-if-required":55,"./_object-create":78,"./_object-dp":79,"./_object-gopd":82,"./_object-gopn":84,"./_redefine":99,"./_string-trim":114,"./_to-primitive":122}],180:[function(require,module,exports){
// 20.1.2.1 Number.EPSILON
var $export = require('./_export');

$export($export.S, 'Number', {EPSILON: Math.pow(2, -52)});
},{"./_export":44}],181:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export   = require('./_export')
  , _isFinite = require('./_global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"./_export":44,"./_global":50}],182:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = require('./_export');

$export($export.S, 'Number', {isInteger: require('./_is-integer')});
},{"./_export":44,"./_is-integer":60}],183:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./_export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"./_export":44}],184:[function(require,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $export   = require('./_export')
  , isInteger = require('./_is-integer')
  , abs       = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
},{"./_export":44,"./_is-integer":60}],185:[function(require,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', {MAX_SAFE_INTEGER: 0x1fffffffffffff});
},{"./_export":44}],186:[function(require,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', {MIN_SAFE_INTEGER: -0x1fffffffffffff});
},{"./_export":44}],187:[function(require,module,exports){
var $export     = require('./_export')
  , $parseFloat = require('./_parse-float');
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', {parseFloat: $parseFloat});
},{"./_export":44,"./_parse-float":93}],188:[function(require,module,exports){
var $export   = require('./_export')
  , $parseInt = require('./_parse-int');
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', {parseInt: $parseInt});
},{"./_export":44,"./_parse-int":94}],189:[function(require,module,exports){
'use strict';
var $export      = require('./_export')
  , toInteger    = require('./_to-integer')
  , aNumberValue = require('./_a-number-value')
  , repeat       = require('./_string-repeat')
  , $toFixed     = 1..toFixed
  , floor        = Math.floor
  , data         = [0, 0, 0, 0, 0, 0]
  , ERROR        = 'Number.toFixed: incorrect invocation!'
  , ZERO         = '0';

var multiply = function(n, c){
  var i  = -1
    , c2 = c;
  while(++i < 6){
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function(n){
  var i = 6
    , c = 0;
  while(--i >= 0){
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function(){
  var i = 6
    , s = '';
  while(--i >= 0){
    if(s !== '' || i === 0 || data[i] !== 0){
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function(x, n, acc){
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function(x){
  var n  = 0
    , x2 = x;
  while(x2 >= 4096){
    n += 12;
    x2 /= 4096;
  }
  while(x2 >= 2){
    n  += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128..toFixed(0) !== '1000000000000000128'
) || !require('./_fails')(function(){
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits){
    var x = aNumberValue(this, ERROR)
      , f = toInteger(fractionDigits)
      , s = ''
      , m = ZERO
      , e, z, j, k;
    if(f < 0 || f > 20)throw RangeError(ERROR);
    if(x != x)return 'NaN';
    if(x <= -1e21 || x >= 1e21)return String(x);
    if(x < 0){
      s = '-';
      x = -x;
    }
    if(x > 1e-21){
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if(e > 0){
        multiply(0, z);
        j = f;
        while(j >= 7){
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while(j >= 23){
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if(f > 0){
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});
},{"./_a-number-value":16,"./_export":44,"./_fails":46,"./_string-repeat":113,"./_to-integer":118}],190:[function(require,module,exports){
'use strict';
var $export      = require('./_export')
  , $fails       = require('./_fails')
  , aNumberValue = require('./_a-number-value')
  , $toPrecision = 1..toPrecision;

$export($export.P + $export.F * ($fails(function(){
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !$fails(function(){
  // V8 ~ Android 4.3-
  $toPrecision.call({});
})), 'Number', {
  toPrecision: function toPrecision(precision){
    var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision); 
  }
});
},{"./_a-number-value":16,"./_export":44,"./_fails":46}],191:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":44,"./_object-assign":77}],192:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":44,"./_object-create":78}],193:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperties: require('./_object-dps')});
},{"./_descriptors":40,"./_export":44,"./_object-dps":80}],194:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":40,"./_export":44,"./_object-dp":79}],195:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"./_is-object":61,"./_meta":74,"./_object-sap":90}],196:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = require('./_to-iobject')
  , $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./_object-gopd":82,"./_object-sap":90,"./_to-iobject":119}],197:[function(require,module,exports){
// 19.1.2.7 Object.getOwnPropertyNames(O)
require('./_object-sap')('getOwnPropertyNames', function(){
  return require('./_object-gopn-ext').f;
});
},{"./_object-gopn-ext":83,"./_object-sap":90}],198:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":86,"./_object-sap":90,"./_to-object":121}],199:[function(require,module,exports){
// 19.1.2.11 Object.isExtensible(O)
var isObject = require('./_is-object');

require('./_object-sap')('isExtensible', function($isExtensible){
  return function isExtensible(it){
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});
},{"./_is-object":61,"./_object-sap":90}],200:[function(require,module,exports){
// 19.1.2.12 Object.isFrozen(O)
var isObject = require('./_is-object');

require('./_object-sap')('isFrozen', function($isFrozen){
  return function isFrozen(it){
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});
},{"./_is-object":61,"./_object-sap":90}],201:[function(require,module,exports){
// 19.1.2.13 Object.isSealed(O)
var isObject = require('./_is-object');

require('./_object-sap')('isSealed', function($isSealed){
  return function isSealed(it){
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});
},{"./_is-object":61,"./_object-sap":90}],202:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $export = require('./_export');
$export($export.S, 'Object', {is: require('./_same-value')});
},{"./_export":44,"./_same-value":101}],203:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":88,"./_object-sap":90,"./_to-object":121}],204:[function(require,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('preventExtensions', function($preventExtensions){
  return function preventExtensions(it){
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});
},{"./_is-object":61,"./_meta":74,"./_object-sap":90}],205:[function(require,module,exports){
// 19.1.2.17 Object.seal(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('seal', function($seal){
  return function seal(it){
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});
},{"./_is-object":61,"./_meta":74,"./_object-sap":90}],206:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":44,"./_set-proto":102}],207:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof')
  , test    = {};
test[require('./_wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./_redefine')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./_classof":29,"./_redefine":99,"./_wks":129}],208:[function(require,module,exports){
var $export     = require('./_export')
  , $parseFloat = require('./_parse-float');
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), {parseFloat: $parseFloat});
},{"./_export":44,"./_parse-float":93}],209:[function(require,module,exports){
var $export   = require('./_export')
  , $parseInt = require('./_parse-int');
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), {parseInt: $parseInt});
},{"./_export":44,"./_parse-int":94}],210:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":15,"./_an-instance":18,"./_classof":29,"./_core":35,"./_ctx":37,"./_export":44,"./_for-of":49,"./_global":50,"./_is-object":61,"./_iter-detect":66,"./_library":70,"./_microtask":76,"./_redefine-all":98,"./_set-species":103,"./_set-to-string-tag":104,"./_species-constructor":107,"./_task":116,"./_wks":129}],211:[function(require,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $export   = require('./_export')
  , aFunction = require('./_a-function')
  , anObject  = require('./_an-object')
  , rApply    = (require('./_global').Reflect || {}).apply
  , fApply    = Function.apply;
// MS Edge argumentsList argument is optional
$export($export.S + $export.F * !require('./_fails')(function(){
  rApply(function(){});
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList){
    var T = aFunction(target)
      , L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});
},{"./_a-function":15,"./_an-object":19,"./_export":44,"./_fails":46,"./_global":50}],212:[function(require,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export    = require('./_export')
  , create     = require('./_object-create')
  , aFunction  = require('./_a-function')
  , anObject   = require('./_an-object')
  , isObject   = require('./_is-object')
  , fails      = require('./_fails')
  , bind       = require('./_bind')
  , rConstruct = (require('./_global').Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function(){
  function F(){}
  return !(rConstruct(function(){}, [], F) instanceof F);
});
var ARGS_BUG = !fails(function(){
  rConstruct(function(){});
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /*, newTarget*/){
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if(ARGS_BUG && !NEW_TARGET_BUG)return rConstruct(Target, args, newTarget);
    if(Target == newTarget){
      // w/o altered newTarget, optimization for 0-4 arguments
      switch(args.length){
        case 0: return new Target;
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args));
    }
    // with altered newTarget, not support built-in constructors
    var proto    = newTarget.prototype
      , instance = create(isObject(proto) ? proto : Object.prototype)
      , result   = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});
},{"./_a-function":15,"./_an-object":19,"./_bind":28,"./_export":44,"./_fails":46,"./_global":50,"./_is-object":61,"./_object-create":78}],213:[function(require,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP          = require('./_object-dp')
  , $export     = require('./_export')
  , anObject    = require('./_an-object')
  , toPrimitive = require('./_to-primitive');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * require('./_fails')(function(){
  Reflect.defineProperty(dP.f({}, 1, {value: 1}), 1, {value: 2});
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes){
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./_an-object":19,"./_export":44,"./_fails":46,"./_object-dp":79,"./_to-primitive":122}],214:[function(require,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export  = require('./_export')
  , gOPD     = require('./_object-gopd').f
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});
},{"./_an-object":19,"./_export":44,"./_object-gopd":82}],215:[function(require,module,exports){
'use strict';
// 26.1.5 Reflect.enumerate(target)
var $export  = require('./_export')
  , anObject = require('./_an-object');
var Enumerate = function(iterated){
  this._t = anObject(iterated); // target
  this._i = 0;                  // next index
  var keys = this._k = []       // keys
    , key;
  for(key in iterated)keys.push(key);
};
require('./_iter-create')(Enumerate, 'Object', function(){
  var that = this
    , keys = that._k
    , key;
  do {
    if(that._i >= keys.length)return {value: undefined, done: true};
  } while(!((key = keys[that._i++]) in that._t));
  return {value: key, done: false};
});

$export($export.S, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(target);
  }
});
},{"./_an-object":19,"./_export":44,"./_iter-create":64}],216:[function(require,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var gOPD     = require('./_object-gopd')
  , $export  = require('./_export')
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return gOPD.f(anObject(target), propertyKey);
  }
});
},{"./_an-object":19,"./_export":44,"./_object-gopd":82}],217:[function(require,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $export  = require('./_export')
  , getProto = require('./_object-gpo')
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(anObject(target));
  }
});
},{"./_an-object":19,"./_export":44,"./_object-gpo":86}],218:[function(require,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var gOPD           = require('./_object-gopd')
  , getPrototypeOf = require('./_object-gpo')
  , has            = require('./_has')
  , $export        = require('./_export')
  , isObject       = require('./_is-object')
  , anObject       = require('./_an-object');

function get(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc, proto;
  if(anObject(target) === receiver)return target[propertyKey];
  if(desc = gOPD.f(target, propertyKey))return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if(isObject(proto = getPrototypeOf(target)))return get(proto, propertyKey, receiver);
}

$export($export.S, 'Reflect', {get: get});
},{"./_an-object":19,"./_export":44,"./_has":51,"./_is-object":61,"./_object-gopd":82,"./_object-gpo":86}],219:[function(require,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $export = require('./_export');

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey){
    return propertyKey in target;
  }
});
},{"./_export":44}],220:[function(require,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $export       = require('./_export')
  , anObject      = require('./_an-object')
  , $isExtensible = Object.isExtensible;

$export($export.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});
},{"./_an-object":19,"./_export":44}],221:[function(require,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $export = require('./_export');

$export($export.S, 'Reflect', {ownKeys: require('./_own-keys')});
},{"./_export":44,"./_own-keys":92}],222:[function(require,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $export            = require('./_export')
  , anObject           = require('./_an-object')
  , $preventExtensions = Object.preventExtensions;

$export($export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target){
    anObject(target);
    try {
      if($preventExtensions)$preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./_an-object":19,"./_export":44}],223:[function(require,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export  = require('./_export')
  , setProto = require('./_set-proto');

if(setProto)$export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto){
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./_export":44,"./_set-proto":102}],224:[function(require,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var dP             = require('./_object-dp')
  , gOPD           = require('./_object-gopd')
  , getPrototypeOf = require('./_object-gpo')
  , has            = require('./_has')
  , $export        = require('./_export')
  , createDesc     = require('./_property-desc')
  , anObject       = require('./_an-object')
  , isObject       = require('./_is-object');

function set(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = gOPD.f(anObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getPrototypeOf(target))){
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if(has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = gOPD.f(receiver, propertyKey) || createDesc(0);
    existingDescriptor.value = V;
    dP.f(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$export($export.S, 'Reflect', {set: set});
},{"./_an-object":19,"./_export":44,"./_has":51,"./_is-object":61,"./_object-dp":79,"./_object-gopd":82,"./_object-gpo":86,"./_property-desc":97}],225:[function(require,module,exports){
var global            = require('./_global')
  , inheritIfRequired = require('./_inherit-if-required')
  , dP                = require('./_object-dp').f
  , gOPN              = require('./_object-gopn').f
  , isRegExp          = require('./_is-regexp')
  , $flags            = require('./_flags')
  , $RegExp           = global.RegExp
  , Base              = $RegExp
  , proto             = $RegExp.prototype
  , re1               = /a/g
  , re2               = /a/g
  // "new" creates a new object, old webkit buggy here
  , CORRECT_NEW       = new $RegExp(re1) !== re1;

if(require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function(){
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))){
  $RegExp = function RegExp(p, f){
    var tiRE = this instanceof $RegExp
      , piRE = isRegExp(p)
      , fiU  = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function(key){
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function(){ return Base[key]; },
      set: function(it){ Base[key] = it; }
    });
  };
  for(var keys = gOPN(Base), i = 0; keys.length > i; )proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');
},{"./_descriptors":40,"./_fails":46,"./_flags":48,"./_global":50,"./_inherit-if-required":55,"./_is-regexp":62,"./_object-dp":79,"./_object-gopn":84,"./_redefine":99,"./_set-species":103,"./_wks":129}],226:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if(require('./_descriptors') && /./g.flags != 'g')require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});
},{"./_descriptors":40,"./_flags":48,"./_object-dp":79}],227:[function(require,module,exports){
// @@match logic
require('./_fix-re-wks')('match', 1, function(defined, MATCH, $match){
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});
},{"./_fix-re-wks":47}],228:[function(require,module,exports){
// @@replace logic
require('./_fix-re-wks')('replace', 2, function(defined, REPLACE, $replace){
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue){
    'use strict';
    var O  = defined(this)
      , fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});
},{"./_fix-re-wks":47}],229:[function(require,module,exports){
// @@search logic
require('./_fix-re-wks')('search', 1, function(defined, SEARCH, $search){
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});
},{"./_fix-re-wks":47}],230:[function(require,module,exports){
// @@split logic
require('./_fix-re-wks')('split', 2, function(defined, SPLIT, $split){
  'use strict';
  var isRegExp   = require('./_is-regexp')
    , _split     = $split
    , $push      = [].push
    , $SPLIT     = 'split'
    , LENGTH     = 'length'
    , LAST_INDEX = 'lastIndex';
  if(
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ){
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function(separator, limit){
      var string = String(this);
      if(separator === undefined && limit === 0)return [];
      // If `separator` is not a regex, use native split
      if(!isRegExp(separator))return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if(!NPCG)separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while(match = separatorCopy.exec(string)){
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if(lastIndex > lastLastIndex){
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          if(!NPCG && match[LENGTH] > 1)match[0].replace(separator2, function(){
            for(i = 1; i < arguments[LENGTH] - 2; i++)if(arguments[i] === undefined)match[i] = undefined;
          });
          if(match[LENGTH] > 1 && match.index < string[LENGTH])$push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if(output[LENGTH] >= splitLimit)break;
        }
        if(separatorCopy[LAST_INDEX] === match.index)separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if(lastLastIndex === string[LENGTH]){
        if(lastLength || !separatorCopy.test(''))output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if('0'[$SPLIT](undefined, 0)[LENGTH]){
    $split = function(separator, limit){
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit){
    var O  = defined(this)
      , fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});
},{"./_fix-re-wks":47,"./_is-regexp":62}],231:[function(require,module,exports){
'use strict';
require('./es6.regexp.flags');
var anObject    = require('./_an-object')
  , $flags      = require('./_flags')
  , DESCRIPTORS = require('./_descriptors')
  , TO_STRING   = 'toString'
  , $toString   = /./[TO_STRING];

var define = function(fn){
  require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if(require('./_fails')(function(){ return $toString.call({source: 'a', flags: 'b'}) != '/a/b'; })){
  define(function toString(){
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if($toString.name != TO_STRING){
  define(function toString(){
    return $toString.call(this);
  });
}
},{"./_an-object":19,"./_descriptors":40,"./_fails":46,"./_flags":48,"./_redefine":99,"./es6.regexp.flags":226}],232:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":34,"./_collection-strong":31}],233:[function(require,module,exports){
'use strict';
// B.2.3.2 String.prototype.anchor(name)
require('./_string-html')('anchor', function(createHTML){
  return function anchor(name){
    return createHTML(this, 'a', 'name', name);
  }
});
},{"./_string-html":111}],234:[function(require,module,exports){
'use strict';
// B.2.3.3 String.prototype.big()
require('./_string-html')('big', function(createHTML){
  return function big(){
    return createHTML(this, 'big', '', '');
  }
});
},{"./_string-html":111}],235:[function(require,module,exports){
'use strict';
// B.2.3.4 String.prototype.blink()
require('./_string-html')('blink', function(createHTML){
  return function blink(){
    return createHTML(this, 'blink', '', '');
  }
});
},{"./_string-html":111}],236:[function(require,module,exports){
'use strict';
// B.2.3.5 String.prototype.bold()
require('./_string-html')('bold', function(createHTML){
  return function bold(){
    return createHTML(this, 'b', '', '');
  }
});
},{"./_string-html":111}],237:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $at     = require('./_string-at')(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./_export":44,"./_string-at":109}],238:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export   = require('./_export')
  , toLength  = require('./_to-length')
  , context   = require('./_string-context')
  , ENDS_WITH = 'endsWith'
  , $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    var that = context(this, searchString, ENDS_WITH)
      , endPosition = arguments.length > 1 ? arguments[1] : undefined
      , len    = toLength(that.length)
      , end    = endPosition === undefined ? len : Math.min(toLength(endPosition), len)
      , search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});
},{"./_export":44,"./_fails-is-regexp":45,"./_string-context":110,"./_to-length":120}],239:[function(require,module,exports){
'use strict';
// B.2.3.6 String.prototype.fixed()
require('./_string-html')('fixed', function(createHTML){
  return function fixed(){
    return createHTML(this, 'tt', '', '');
  }
});
},{"./_string-html":111}],240:[function(require,module,exports){
'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
require('./_string-html')('fontcolor', function(createHTML){
  return function fontcolor(color){
    return createHTML(this, 'font', 'color', color);
  }
});
},{"./_string-html":111}],241:[function(require,module,exports){
'use strict';
// B.2.3.8 String.prototype.fontsize(size)
require('./_string-html')('fontsize', function(createHTML){
  return function fontsize(size){
    return createHTML(this, 'font', 'size', size);
  }
});
},{"./_string-html":111}],242:[function(require,module,exports){
var $export        = require('./_export')
  , toIndex        = require('./_to-index')
  , fromCharCode   = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res  = []
      , aLen = arguments.length
      , i    = 0
      , code;
    while(aLen > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./_export":44,"./_to-index":117}],243:[function(require,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export  = require('./_export')
  , context  = require('./_string-context')
  , INCLUDES = 'includes';

$export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
  includes: function includes(searchString /*, position = 0 */){
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
},{"./_export":44,"./_fails-is-regexp":45,"./_string-context":110}],244:[function(require,module,exports){
'use strict';
// B.2.3.9 String.prototype.italics()
require('./_string-html')('italics', function(createHTML){
  return function italics(){
    return createHTML(this, 'i', '', '');
  }
});
},{"./_string-html":111}],245:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":65,"./_string-at":109}],246:[function(require,module,exports){
'use strict';
// B.2.3.10 String.prototype.link(url)
require('./_string-html')('link', function(createHTML){
  return function link(url){
    return createHTML(this, 'a', 'href', url);
  }
});
},{"./_string-html":111}],247:[function(require,module,exports){
var $export   = require('./_export')
  , toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length');

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl  = toIObject(callSite.raw)
      , len  = toLength(tpl.length)
      , aLen = arguments.length
      , res  = []
      , i    = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < aLen)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./_export":44,"./_to-iobject":119,"./_to-length":120}],248:[function(require,module,exports){
var $export = require('./_export');

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./_string-repeat')
});
},{"./_export":44,"./_string-repeat":113}],249:[function(require,module,exports){
'use strict';
// B.2.3.11 String.prototype.small()
require('./_string-html')('small', function(createHTML){
  return function small(){
    return createHTML(this, 'small', '', '');
  }
});
},{"./_string-html":111}],250:[function(require,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export     = require('./_export')
  , toLength    = require('./_to-length')
  , context     = require('./_string-context')
  , STARTS_WITH = 'startsWith'
  , $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /*, position = 0 */){
    var that   = context(this, searchString, STARTS_WITH)
      , index  = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length))
      , search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});
},{"./_export":44,"./_fails-is-regexp":45,"./_string-context":110,"./_to-length":120}],251:[function(require,module,exports){
'use strict';
// B.2.3.12 String.prototype.strike()
require('./_string-html')('strike', function(createHTML){
  return function strike(){
    return createHTML(this, 'strike', '', '');
  }
});
},{"./_string-html":111}],252:[function(require,module,exports){
'use strict';
// B.2.3.13 String.prototype.sub()
require('./_string-html')('sub', function(createHTML){
  return function sub(){
    return createHTML(this, 'sub', '', '');
  }
});
},{"./_string-html":111}],253:[function(require,module,exports){
'use strict';
// B.2.3.14 String.prototype.sup()
require('./_string-html')('sup', function(createHTML){
  return function sup(){
    return createHTML(this, 'sup', '', '');
  }
});
},{"./_string-html":111}],254:[function(require,module,exports){
'use strict';
// 21.1.3.25 String.prototype.trim()
require('./_string-trim')('trim', function($trim){
  return function trim(){
    return $trim(this, 3);
  };
});
},{"./_string-trim":114}],255:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":19,"./_descriptors":40,"./_enum-keys":43,"./_export":44,"./_fails":46,"./_global":50,"./_has":51,"./_hide":52,"./_is-array":59,"./_keyof":69,"./_library":70,"./_meta":74,"./_object-create":78,"./_object-dp":79,"./_object-gopd":82,"./_object-gopn":84,"./_object-gopn-ext":83,"./_object-gops":85,"./_object-keys":88,"./_object-pie":89,"./_property-desc":97,"./_redefine":99,"./_set-to-string-tag":104,"./_shared":106,"./_to-iobject":119,"./_to-primitive":122,"./_uid":126,"./_wks":129,"./_wks-define":127,"./_wks-ext":128}],256:[function(require,module,exports){
'use strict';
var $export      = require('./_export')
  , $typed       = require('./_typed')
  , buffer       = require('./_typed-buffer')
  , anObject     = require('./_an-object')
  , toIndex      = require('./_to-index')
  , toLength     = require('./_to-length')
  , isObject     = require('./_is-object')
  , ArrayBuffer  = require('./_global').ArrayBuffer
  , speciesConstructor = require('./_species-constructor')
  , $ArrayBuffer = buffer.ArrayBuffer
  , $DataView    = buffer.DataView
  , $isView      = $typed.ABV && ArrayBuffer.isView
  , $slice       = $ArrayBuffer.prototype.slice
  , VIEW         = $typed.VIEW
  , ARRAY_BUFFER = 'ArrayBuffer';

$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), {ArrayBuffer: $ArrayBuffer});

$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it){
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export($export.P + $export.U + $export.F * require('./_fails')(function(){
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end){
    if($slice !== undefined && end === undefined)return $slice.call(anObject(this), start); // FF fix
    var len    = anObject(this).byteLength
      , first  = toIndex(start, len)
      , final  = toIndex(end === undefined ? len : end, len)
      , result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first))
      , viewS  = new $DataView(this)
      , viewT  = new $DataView(result)
      , index  = 0;
    while(first < final){
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

require('./_set-species')(ARRAY_BUFFER);
},{"./_an-object":19,"./_export":44,"./_fails":46,"./_global":50,"./_is-object":61,"./_set-species":103,"./_species-constructor":107,"./_to-index":117,"./_to-length":120,"./_typed":125,"./_typed-buffer":124}],257:[function(require,module,exports){
var $export = require('./_export');
$export($export.G + $export.W + $export.F * !require('./_typed').ABV, {
  DataView: require('./_typed-buffer').DataView
});
},{"./_export":44,"./_typed":125,"./_typed-buffer":124}],258:[function(require,module,exports){
require('./_typed-array')('Float32', 4, function(init){
  return function Float32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],259:[function(require,module,exports){
require('./_typed-array')('Float64', 8, function(init){
  return function Float64Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],260:[function(require,module,exports){
require('./_typed-array')('Int16', 2, function(init){
  return function Int16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],261:[function(require,module,exports){
require('./_typed-array')('Int32', 4, function(init){
  return function Int32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],262:[function(require,module,exports){
require('./_typed-array')('Int8', 1, function(init){
  return function Int8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],263:[function(require,module,exports){
require('./_typed-array')('Uint16', 2, function(init){
  return function Uint16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],264:[function(require,module,exports){
require('./_typed-array')('Uint32', 4, function(init){
  return function Uint32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],265:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function(init){
  return function Uint8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":123}],266:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function(init){
  return function Uint8ClampedArray(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
}, true);
},{"./_typed-array":123}],267:[function(require,module,exports){
'use strict';
var each         = require('./_array-methods')(0)
  , redefine     = require('./_redefine')
  , meta         = require('./_meta')
  , assign       = require('./_object-assign')
  , weak         = require('./_collection-weak')
  , isObject     = require('./_is-object')
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('./_collection')('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./_array-methods":24,"./_collection":34,"./_collection-weak":33,"./_is-object":61,"./_meta":74,"./_object-assign":77,"./_redefine":99}],268:[function(require,module,exports){
'use strict';
var weak = require('./_collection-weak');

// 23.4 WeakSet Objects
require('./_collection')('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./_collection":34,"./_collection-weak":33}],269:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export   = require('./_export')
  , $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');
},{"./_add-to-unscopables":17,"./_array-includes":23,"./_export":44}],270:[function(require,module,exports){
// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var $export   = require('./_export')
  , microtask = require('./_microtask')()
  , process   = require('./_global').process
  , isNode    = require('./_cof')(process) == 'process';

$export($export.G, {
  asap: function asap(fn){
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});
},{"./_cof":30,"./_export":44,"./_global":50,"./_microtask":76}],271:[function(require,module,exports){
// https://github.com/ljharb/proposal-is-error
var $export = require('./_export')
  , cof     = require('./_cof');

$export($export.S, 'Error', {
  isError: function isError(it){
    return cof(it) === 'Error';
  }
});
},{"./_cof":30,"./_export":44}],272:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Map', {toJSON: require('./_collection-to-json')('Map')});
},{"./_collection-to-json":32,"./_export":44}],273:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  iaddh: function iaddh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});
},{"./_export":44}],274:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  imulh: function imulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >> 16
      , v1 = $v >> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
  }
});
},{"./_export":44}],275:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  isubh: function isubh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});
},{"./_export":44}],276:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  umulh: function umulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >>> 16
      , v1 = $v >>> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
  }
});
},{"./_export":44}],277:[function(require,module,exports){
'use strict';
var $export         = require('./_export')
  , toObject        = require('./_to-object')
  , aFunction       = require('./_a-function')
  , $defineProperty = require('./_object-dp');

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __defineGetter__: function __defineGetter__(P, getter){
    $defineProperty.f(toObject(this), P, {get: aFunction(getter), enumerable: true, configurable: true});
  }
});
},{"./_a-function":15,"./_descriptors":40,"./_export":44,"./_object-dp":79,"./_object-forced-pam":81,"./_to-object":121}],278:[function(require,module,exports){
'use strict';
var $export         = require('./_export')
  , toObject        = require('./_to-object')
  , aFunction       = require('./_a-function')
  , $defineProperty = require('./_object-dp');

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __defineSetter__: function __defineSetter__(P, setter){
    $defineProperty.f(toObject(this), P, {set: aFunction(setter), enumerable: true, configurable: true});
  }
});
},{"./_a-function":15,"./_descriptors":40,"./_export":44,"./_object-dp":79,"./_object-forced-pam":81,"./_to-object":121}],279:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export  = require('./_export')
  , $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it){
    return $entries(it);
  }
});
},{"./_export":44,"./_object-to-array":91}],280:[function(require,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export        = require('./_export')
  , ownKeys        = require('./_own-keys')
  , toIObject      = require('./_to-iobject')
  , gOPD           = require('./_object-gopd')
  , createProperty = require('./_create-property');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O       = toIObject(object)
      , getDesc = gOPD.f
      , keys    = ownKeys(O)
      , result  = {}
      , i       = 0
      , key;
    while(keys.length > i)createProperty(result, key = keys[i++], getDesc(O, key));
    return result;
  }
});
},{"./_create-property":36,"./_export":44,"./_object-gopd":82,"./_own-keys":92,"./_to-iobject":119}],281:[function(require,module,exports){
'use strict';
var $export                  = require('./_export')
  , toObject                 = require('./_to-object')
  , toPrimitive              = require('./_to-primitive')
  , getPrototypeOf           = require('./_object-gpo')
  , getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.4 Object.prototype.__lookupGetter__(P)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __lookupGetter__: function __lookupGetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.get;
    } while(O = getPrototypeOf(O));
  }
});
},{"./_descriptors":40,"./_export":44,"./_object-forced-pam":81,"./_object-gopd":82,"./_object-gpo":86,"./_to-object":121,"./_to-primitive":122}],282:[function(require,module,exports){
'use strict';
var $export                  = require('./_export')
  , toObject                 = require('./_to-object')
  , toPrimitive              = require('./_to-primitive')
  , getPrototypeOf           = require('./_object-gpo')
  , getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.5 Object.prototype.__lookupSetter__(P)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __lookupSetter__: function __lookupSetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.set;
    } while(O = getPrototypeOf(O));
  }
});
},{"./_descriptors":40,"./_export":44,"./_object-forced-pam":81,"./_object-gopd":82,"./_object-gpo":86,"./_to-object":121,"./_to-primitive":122}],283:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export')
  , $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"./_export":44,"./_object-to-array":91}],284:[function(require,module,exports){
'use strict';
// https://github.com/zenparsing/es-observable
var $export     = require('./_export')
  , global      = require('./_global')
  , core        = require('./_core')
  , microtask   = require('./_microtask')()
  , OBSERVABLE  = require('./_wks')('observable')
  , aFunction   = require('./_a-function')
  , anObject    = require('./_an-object')
  , anInstance  = require('./_an-instance')
  , redefineAll = require('./_redefine-all')
  , hide        = require('./_hide')
  , forOf       = require('./_for-of')
  , RETURN      = forOf.RETURN;

var getMethod = function(fn){
  return fn == null ? undefined : aFunction(fn);
};

var cleanupSubscription = function(subscription){
  var cleanup = subscription._c;
  if(cleanup){
    subscription._c = undefined;
    cleanup();
  }
};

var subscriptionClosed = function(subscription){
  return subscription._o === undefined;
};

var closeSubscription = function(subscription){
  if(!subscriptionClosed(subscription)){
    subscription._o = undefined;
    cleanupSubscription(subscription);
  }
};

var Subscription = function(observer, subscriber){
  anObject(observer);
  this._c = undefined;
  this._o = observer;
  observer = new SubscriptionObserver(this);
  try {
    var cleanup      = subscriber(observer)
      , subscription = cleanup;
    if(cleanup != null){
      if(typeof cleanup.unsubscribe === 'function')cleanup = function(){ subscription.unsubscribe(); };
      else aFunction(cleanup);
      this._c = cleanup;
    }
  } catch(e){
    observer.error(e);
    return;
  } if(subscriptionClosed(this))cleanupSubscription(this);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe(){ closeSubscription(this); }
});

var SubscriptionObserver = function(subscription){
  this._s = subscription;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      try {
        var m = getMethod(observer.next);
        if(m)return m.call(observer, value);
      } catch(e){
        try {
          closeSubscription(subscription);
        } finally {
          throw e;
        }
      }
    }
  },
  error: function error(value){
    var subscription = this._s;
    if(subscriptionClosed(subscription))throw value;
    var observer = subscription._o;
    subscription._o = undefined;
    try {
      var m = getMethod(observer.error);
      if(!m)throw value;
      value = m.call(observer, value);
    } catch(e){
      try {
        cleanupSubscription(subscription);
      } finally {
        throw e;
      }
    } cleanupSubscription(subscription);
    return value;
  },
  complete: function complete(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      subscription._o = undefined;
      try {
        var m = getMethod(observer.complete);
        value = m ? m.call(observer, value) : undefined;
      } catch(e){
        try {
          cleanupSubscription(subscription);
        } finally {
          throw e;
        }
      } cleanupSubscription(subscription);
      return value;
    }
  }
});

var $Observable = function Observable(subscriber){
  anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer){
    return new Subscription(observer, this._f);
  },
  forEach: function forEach(fn){
    var that = this;
    return new (core.Promise || global.Promise)(function(resolve, reject){
      aFunction(fn);
      var subscription = that.subscribe({
        next : function(value){
          try {
            return fn(value);
          } catch(e){
            reject(e);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
    });
  }
});

redefineAll($Observable, {
  from: function from(x){
    var C = typeof this === 'function' ? this : $Observable;
    var method = getMethod(anObject(x)[OBSERVABLE]);
    if(method){
      var observable = anObject(method.call(x));
      return observable.constructor === C ? observable : new C(function(observer){
        return observable.subscribe(observer);
      });
    }
    return new C(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          try {
            if(forOf(x, false, function(it){
              observer.next(it);
              if(done)return RETURN;
            }) === RETURN)return;
          } catch(e){
            if(done)throw e;
            observer.error(e);
            return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  },
  of: function of(){
    for(var i = 0, l = arguments.length, items = Array(l); i < l;)items[i] = arguments[i++];
    return new (typeof this === 'function' ? this : $Observable)(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          for(var i = 0; i < items.length; ++i){
            observer.next(items[i]);
            if(done)return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function(){ return this; });

$export($export.G, {Observable: $Observable});

require('./_set-species')('Observable');
},{"./_a-function":15,"./_an-instance":18,"./_an-object":19,"./_core":35,"./_export":44,"./_for-of":49,"./_global":50,"./_hide":52,"./_microtask":76,"./_redefine-all":98,"./_set-species":103,"./_wks":129}],285:[function(require,module,exports){
var metadata                  = require('./_metadata')
  , anObject                  = require('./_an-object')
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey){
  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
}});
},{"./_an-object":19,"./_metadata":75}],286:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , toMetaKey              = metadata.key
  , getOrCreateMetadataMap = metadata.map
  , store                  = metadata.store;

metadata.exp({deleteMetadata: function deleteMetadata(metadataKey, target /*, targetKey */){
  var targetKey   = arguments.length < 3 ? undefined : toMetaKey(arguments[2])
    , metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
  if(metadataMap === undefined || !metadataMap['delete'](metadataKey))return false;
  if(metadataMap.size)return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  return !!targetMetadata.size || store['delete'](target);
}});
},{"./_an-object":19,"./_metadata":75}],287:[function(require,module,exports){
var Set                     = require('./es6.set')
  , from                    = require('./_array-from-iterable')
  , metadata                = require('./_metadata')
  , anObject                = require('./_an-object')
  , getPrototypeOf          = require('./_object-gpo')
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

var ordinaryMetadataKeys = function(O, P){
  var oKeys  = ordinaryOwnMetadataKeys(O, P)
    , parent = getPrototypeOf(O);
  if(parent === null)return oKeys;
  var pKeys  = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

metadata.exp({getMetadataKeys: function getMetadataKeys(target /*, targetKey */){
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"./_an-object":19,"./_array-from-iterable":22,"./_metadata":75,"./_object-gpo":86,"./es6.set":232}],288:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , getPrototypeOf         = require('./_object-gpo')
  , ordinaryHasOwnMetadata = metadata.has
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

var ordinaryGetMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return ordinaryGetOwnMetadata(MetadataKey, O, P);
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

metadata.exp({getMetadata: function getMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":19,"./_metadata":75,"./_object-gpo":86}],289:[function(require,module,exports){
var metadata                = require('./_metadata')
  , anObject                = require('./_an-object')
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

metadata.exp({getOwnMetadataKeys: function getOwnMetadataKeys(target /*, targetKey */){
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"./_an-object":19,"./_metadata":75}],290:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

metadata.exp({getOwnMetadata: function getOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":19,"./_metadata":75}],291:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , getPrototypeOf         = require('./_object-gpo')
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

var ordinaryHasMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return true;
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

metadata.exp({hasMetadata: function hasMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":19,"./_metadata":75,"./_object-gpo":86}],292:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

metadata.exp({hasOwnMetadata: function hasOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":19,"./_metadata":75}],293:[function(require,module,exports){
var metadata                  = require('./_metadata')
  , anObject                  = require('./_an-object')
  , aFunction                 = require('./_a-function')
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({metadata: function metadata(metadataKey, metadataValue){
  return function decorator(target, targetKey){
    ordinaryDefineOwnMetadata(
      metadataKey, metadataValue,
      (targetKey !== undefined ? anObject : aFunction)(target),
      toMetaKey(targetKey)
    );
  };
}});
},{"./_a-function":15,"./_an-object":19,"./_metadata":75}],294:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":32,"./_export":44}],295:[function(require,module,exports){
'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $export = require('./_export')
  , $at     = require('./_string-at')(true);

$export($export.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./_export":44,"./_string-at":109}],296:[function(require,module,exports){
'use strict';
// https://tc39.github.io/String.prototype.matchAll/
var $export     = require('./_export')
  , defined     = require('./_defined')
  , toLength    = require('./_to-length')
  , isRegExp    = require('./_is-regexp')
  , getFlags    = require('./_flags')
  , RegExpProto = RegExp.prototype;

var $RegExpStringIterator = function(regexp, string){
  this._r = regexp;
  this._s = string;
};

require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next(){
  var match = this._r.exec(this._s);
  return {value: match, done: match === null};
});

$export($export.P, 'String', {
  matchAll: function matchAll(regexp){
    defined(this);
    if(!isRegExp(regexp))throw TypeError(regexp + ' is not a regexp!');
    var S     = String(this)
      , flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp)
      , rx    = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});
},{"./_defined":39,"./_export":44,"./_flags":48,"./_is-regexp":62,"./_iter-create":64,"./_to-length":120}],297:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export')
  , $pad    = require('./_string-pad');

$export($export.P, 'String', {
  padEnd: function padEnd(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
},{"./_export":44,"./_string-pad":112}],298:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export')
  , $pad    = require('./_string-pad');

$export($export.P, 'String', {
  padStart: function padStart(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
},{"./_export":44,"./_string-pad":112}],299:[function(require,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimLeft', function($trim){
  return function trimLeft(){
    return $trim(this, 1);
  };
}, 'trimStart');
},{"./_string-trim":114}],300:[function(require,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimRight', function($trim){
  return function trimRight(){
    return $trim(this, 2);
  };
}, 'trimEnd');
},{"./_string-trim":114}],301:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":127}],302:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":127}],303:[function(require,module,exports){
// https://github.com/ljharb/proposal-global
var $export = require('./_export');

$export($export.S, 'System', {global: require('./_global')});
},{"./_export":44,"./_global":50}],304:[function(require,module,exports){
var $iterators    = require('./es6.array.iterator')
  , redefine      = require('./_redefine')
  , global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , wks           = require('./_wks')
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}
},{"./_global":50,"./_hide":52,"./_iterators":68,"./_redefine":99,"./_wks":129,"./es6.array.iterator":142}],305:[function(require,module,exports){
var $export = require('./_export')
  , $task   = require('./_task');
$export($export.G + $export.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./_export":44,"./_task":116}],306:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global     = require('./_global')
  , $export    = require('./_export')
  , invoke     = require('./_invoke')
  , partial    = require('./_partial')
  , navigator  = global.navigator
  , MSIE       = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
var wrap = function(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      typeof fn == 'function' ? fn : Function(fn)
    ), time);
  } : set;
};
$export($export.G + $export.B + $export.F * MSIE, {
  setTimeout:  wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
},{"./_export":44,"./_global":50,"./_invoke":56,"./_partial":95}],307:[function(require,module,exports){
require('./modules/es6.symbol');
require('./modules/es6.object.create');
require('./modules/es6.object.define-property');
require('./modules/es6.object.define-properties');
require('./modules/es6.object.get-own-property-descriptor');
require('./modules/es6.object.get-prototype-of');
require('./modules/es6.object.keys');
require('./modules/es6.object.get-own-property-names');
require('./modules/es6.object.freeze');
require('./modules/es6.object.seal');
require('./modules/es6.object.prevent-extensions');
require('./modules/es6.object.is-frozen');
require('./modules/es6.object.is-sealed');
require('./modules/es6.object.is-extensible');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.function.bind');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.parse-int');
require('./modules/es6.parse-float');
require('./modules/es6.number.constructor');
require('./modules/es6.number.to-fixed');
require('./modules/es6.number.to-precision');
require('./modules/es6.number.epsilon');
require('./modules/es6.number.is-finite');
require('./modules/es6.number.is-integer');
require('./modules/es6.number.is-nan');
require('./modules/es6.number.is-safe-integer');
require('./modules/es6.number.max-safe-integer');
require('./modules/es6.number.min-safe-integer');
require('./modules/es6.number.parse-float');
require('./modules/es6.number.parse-int');
require('./modules/es6.math.acosh');
require('./modules/es6.math.asinh');
require('./modules/es6.math.atanh');
require('./modules/es6.math.cbrt');
require('./modules/es6.math.clz32');
require('./modules/es6.math.cosh');
require('./modules/es6.math.expm1');
require('./modules/es6.math.fround');
require('./modules/es6.math.hypot');
require('./modules/es6.math.imul');
require('./modules/es6.math.log10');
require('./modules/es6.math.log1p');
require('./modules/es6.math.log2');
require('./modules/es6.math.sign');
require('./modules/es6.math.sinh');
require('./modules/es6.math.tanh');
require('./modules/es6.math.trunc');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.trim');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.string.anchor');
require('./modules/es6.string.big');
require('./modules/es6.string.blink');
require('./modules/es6.string.bold');
require('./modules/es6.string.fixed');
require('./modules/es6.string.fontcolor');
require('./modules/es6.string.fontsize');
require('./modules/es6.string.italics');
require('./modules/es6.string.link');
require('./modules/es6.string.small');
require('./modules/es6.string.strike');
require('./modules/es6.string.sub');
require('./modules/es6.string.sup');
require('./modules/es6.date.now');
require('./modules/es6.date.to-json');
require('./modules/es6.date.to-iso-string');
require('./modules/es6.date.to-string');
require('./modules/es6.date.to-primitive');
require('./modules/es6.array.is-array');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.join');
require('./modules/es6.array.slice');
require('./modules/es6.array.sort');
require('./modules/es6.array.for-each');
require('./modules/es6.array.map');
require('./modules/es6.array.filter');
require('./modules/es6.array.some');
require('./modules/es6.array.every');
require('./modules/es6.array.reduce');
require('./modules/es6.array.reduce-right');
require('./modules/es6.array.index-of');
require('./modules/es6.array.last-index-of');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.array.species');
require('./modules/es6.array.iterator');
require('./modules/es6.regexp.constructor');
require('./modules/es6.regexp.to-string');
require('./modules/es6.regexp.flags');
require('./modules/es6.regexp.match');
require('./modules/es6.regexp.replace');
require('./modules/es6.regexp.search');
require('./modules/es6.regexp.split');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.typed.array-buffer');
require('./modules/es6.typed.data-view');
require('./modules/es6.typed.int8-array');
require('./modules/es6.typed.uint8-array');
require('./modules/es6.typed.uint8-clamped-array');
require('./modules/es6.typed.int16-array');
require('./modules/es6.typed.uint16-array');
require('./modules/es6.typed.int32-array');
require('./modules/es6.typed.uint32-array');
require('./modules/es6.typed.float32-array');
require('./modules/es6.typed.float64-array');
require('./modules/es6.reflect.apply');
require('./modules/es6.reflect.construct');
require('./modules/es6.reflect.define-property');
require('./modules/es6.reflect.delete-property');
require('./modules/es6.reflect.enumerate');
require('./modules/es6.reflect.get');
require('./modules/es6.reflect.get-own-property-descriptor');
require('./modules/es6.reflect.get-prototype-of');
require('./modules/es6.reflect.has');
require('./modules/es6.reflect.is-extensible');
require('./modules/es6.reflect.own-keys');
require('./modules/es6.reflect.prevent-extensions');
require('./modules/es6.reflect.set');
require('./modules/es6.reflect.set-prototype-of');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.pad-start');
require('./modules/es7.string.pad-end');
require('./modules/es7.string.trim-left');
require('./modules/es7.string.trim-right');
require('./modules/es7.string.match-all');
require('./modules/es7.symbol.async-iterator');
require('./modules/es7.symbol.observable');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.values');
require('./modules/es7.object.entries');
require('./modules/es7.object.define-getter');
require('./modules/es7.object.define-setter');
require('./modules/es7.object.lookup-getter');
require('./modules/es7.object.lookup-setter');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/es7.system.global');
require('./modules/es7.error.is-error');
require('./modules/es7.math.iaddh');
require('./modules/es7.math.isubh');
require('./modules/es7.math.imulh');
require('./modules/es7.math.umulh');
require('./modules/es7.reflect.define-metadata');
require('./modules/es7.reflect.delete-metadata');
require('./modules/es7.reflect.get-metadata');
require('./modules/es7.reflect.get-metadata-keys');
require('./modules/es7.reflect.get-own-metadata');
require('./modules/es7.reflect.get-own-metadata-keys');
require('./modules/es7.reflect.has-metadata');
require('./modules/es7.reflect.has-own-metadata');
require('./modules/es7.reflect.metadata');
require('./modules/es7.asap');
require('./modules/es7.observable');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/_core');
},{"./modules/_core":35,"./modules/es6.array.copy-within":132,"./modules/es6.array.every":133,"./modules/es6.array.fill":134,"./modules/es6.array.filter":135,"./modules/es6.array.find":137,"./modules/es6.array.find-index":136,"./modules/es6.array.for-each":138,"./modules/es6.array.from":139,"./modules/es6.array.index-of":140,"./modules/es6.array.is-array":141,"./modules/es6.array.iterator":142,"./modules/es6.array.join":143,"./modules/es6.array.last-index-of":144,"./modules/es6.array.map":145,"./modules/es6.array.of":146,"./modules/es6.array.reduce":148,"./modules/es6.array.reduce-right":147,"./modules/es6.array.slice":149,"./modules/es6.array.some":150,"./modules/es6.array.sort":151,"./modules/es6.array.species":152,"./modules/es6.date.now":153,"./modules/es6.date.to-iso-string":154,"./modules/es6.date.to-json":155,"./modules/es6.date.to-primitive":156,"./modules/es6.date.to-string":157,"./modules/es6.function.bind":158,"./modules/es6.function.has-instance":159,"./modules/es6.function.name":160,"./modules/es6.map":161,"./modules/es6.math.acosh":162,"./modules/es6.math.asinh":163,"./modules/es6.math.atanh":164,"./modules/es6.math.cbrt":165,"./modules/es6.math.clz32":166,"./modules/es6.math.cosh":167,"./modules/es6.math.expm1":168,"./modules/es6.math.fround":169,"./modules/es6.math.hypot":170,"./modules/es6.math.imul":171,"./modules/es6.math.log10":172,"./modules/es6.math.log1p":173,"./modules/es6.math.log2":174,"./modules/es6.math.sign":175,"./modules/es6.math.sinh":176,"./modules/es6.math.tanh":177,"./modules/es6.math.trunc":178,"./modules/es6.number.constructor":179,"./modules/es6.number.epsilon":180,"./modules/es6.number.is-finite":181,"./modules/es6.number.is-integer":182,"./modules/es6.number.is-nan":183,"./modules/es6.number.is-safe-integer":184,"./modules/es6.number.max-safe-integer":185,"./modules/es6.number.min-safe-integer":186,"./modules/es6.number.parse-float":187,"./modules/es6.number.parse-int":188,"./modules/es6.number.to-fixed":189,"./modules/es6.number.to-precision":190,"./modules/es6.object.assign":191,"./modules/es6.object.create":192,"./modules/es6.object.define-properties":193,"./modules/es6.object.define-property":194,"./modules/es6.object.freeze":195,"./modules/es6.object.get-own-property-descriptor":196,"./modules/es6.object.get-own-property-names":197,"./modules/es6.object.get-prototype-of":198,"./modules/es6.object.is":202,"./modules/es6.object.is-extensible":199,"./modules/es6.object.is-frozen":200,"./modules/es6.object.is-sealed":201,"./modules/es6.object.keys":203,"./modules/es6.object.prevent-extensions":204,"./modules/es6.object.seal":205,"./modules/es6.object.set-prototype-of":206,"./modules/es6.object.to-string":207,"./modules/es6.parse-float":208,"./modules/es6.parse-int":209,"./modules/es6.promise":210,"./modules/es6.reflect.apply":211,"./modules/es6.reflect.construct":212,"./modules/es6.reflect.define-property":213,"./modules/es6.reflect.delete-property":214,"./modules/es6.reflect.enumerate":215,"./modules/es6.reflect.get":218,"./modules/es6.reflect.get-own-property-descriptor":216,"./modules/es6.reflect.get-prototype-of":217,"./modules/es6.reflect.has":219,"./modules/es6.reflect.is-extensible":220,"./modules/es6.reflect.own-keys":221,"./modules/es6.reflect.prevent-extensions":222,"./modules/es6.reflect.set":224,"./modules/es6.reflect.set-prototype-of":223,"./modules/es6.regexp.constructor":225,"./modules/es6.regexp.flags":226,"./modules/es6.regexp.match":227,"./modules/es6.regexp.replace":228,"./modules/es6.regexp.search":229,"./modules/es6.regexp.split":230,"./modules/es6.regexp.to-string":231,"./modules/es6.set":232,"./modules/es6.string.anchor":233,"./modules/es6.string.big":234,"./modules/es6.string.blink":235,"./modules/es6.string.bold":236,"./modules/es6.string.code-point-at":237,"./modules/es6.string.ends-with":238,"./modules/es6.string.fixed":239,"./modules/es6.string.fontcolor":240,"./modules/es6.string.fontsize":241,"./modules/es6.string.from-code-point":242,"./modules/es6.string.includes":243,"./modules/es6.string.italics":244,"./modules/es6.string.iterator":245,"./modules/es6.string.link":246,"./modules/es6.string.raw":247,"./modules/es6.string.repeat":248,"./modules/es6.string.small":249,"./modules/es6.string.starts-with":250,"./modules/es6.string.strike":251,"./modules/es6.string.sub":252,"./modules/es6.string.sup":253,"./modules/es6.string.trim":254,"./modules/es6.symbol":255,"./modules/es6.typed.array-buffer":256,"./modules/es6.typed.data-view":257,"./modules/es6.typed.float32-array":258,"./modules/es6.typed.float64-array":259,"./modules/es6.typed.int16-array":260,"./modules/es6.typed.int32-array":261,"./modules/es6.typed.int8-array":262,"./modules/es6.typed.uint16-array":263,"./modules/es6.typed.uint32-array":264,"./modules/es6.typed.uint8-array":265,"./modules/es6.typed.uint8-clamped-array":266,"./modules/es6.weak-map":267,"./modules/es6.weak-set":268,"./modules/es7.array.includes":269,"./modules/es7.asap":270,"./modules/es7.error.is-error":271,"./modules/es7.map.to-json":272,"./modules/es7.math.iaddh":273,"./modules/es7.math.imulh":274,"./modules/es7.math.isubh":275,"./modules/es7.math.umulh":276,"./modules/es7.object.define-getter":277,"./modules/es7.object.define-setter":278,"./modules/es7.object.entries":279,"./modules/es7.object.get-own-property-descriptors":280,"./modules/es7.object.lookup-getter":281,"./modules/es7.object.lookup-setter":282,"./modules/es7.object.values":283,"./modules/es7.observable":284,"./modules/es7.reflect.define-metadata":285,"./modules/es7.reflect.delete-metadata":286,"./modules/es7.reflect.get-metadata":288,"./modules/es7.reflect.get-metadata-keys":287,"./modules/es7.reflect.get-own-metadata":290,"./modules/es7.reflect.get-own-metadata-keys":289,"./modules/es7.reflect.has-metadata":291,"./modules/es7.reflect.has-own-metadata":292,"./modules/es7.reflect.metadata":293,"./modules/es7.set.to-json":294,"./modules/es7.string.at":295,"./modules/es7.string.match-all":296,"./modules/es7.string.pad-end":297,"./modules/es7.string.pad-start":298,"./modules/es7.string.trim-left":299,"./modules/es7.string.trim-right":300,"./modules/es7.symbol.async-iterator":301,"./modules/es7.symbol.observable":302,"./modules/es7.system.global":303,"./modules/web.dom.iterable":304,"./modules/web.immediate":305,"./modules/web.timers":306}],308:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _eventos = require('eventos');

var _eventos2 = _interopRequireDefault(_eventos);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Classe para o tratamento de desenhos em canvas no Gartic
 */
var Desenho = function (_Eventos) {
	_inherits(Desenho, _Eventos);

	/**
  * Construtor da classe, especificando os parÃ¢metros do desenho
  *
  * @param {HTMLElement} elemBase Elemento que irÃ¡ conter o desenho
  * @param {Object} opcoes ConfiguraÃ§Ãµes do objeto
  * @param {number} opcoes.largura Largura do desenho
  * @param {number} opcoes.altura Altura do desenho
  * @param {number} opcoes.elems Quantidade de elementos
  * @param {boolean} opcoes.prev Indica se haverÃ¡ elemento para exibir a prÃ©via do desenho
  * @param {HTMLElement} opcoes.eventElem Indica um elemento especÃ­fico para receber os eventos de desenho
  * @param {number} opcoes.usoDesfazer NÃºmero de passos que poderÃ£o ser desfeitos
  * @param {number} opcoes.usoRefazer NÃºmero de passos que poderÃ£o ser refeitos
  * @param {number} opcoes.retina Densidade de pixels do desenho
  * @param {number} opcoes.larguraIni Largura inicial a ser encaixada visualmente
  * @param {number} opcoes.alturaIni Altura inicial a ser encaixada visualmente
  * @param {number} opcoes.mobile Remove eventos desktop
  */
	function Desenho(elemBase, opcoes) {
		_classCallCheck(this, Desenho);

		var _this = _possibleConstructorReturn(this, (Desenho.__proto__ || Object.getPrototypeOf(Desenho)).call(this));

		_this._opcoes = Object.assign({
			largura: 510,
			altura: 304,
			elems: 1,
			prev: true,
			usoDesfazer: 1,
			usoRefazer: 1,
			retina: 1,
			quebra: 230
		}, opcoes);

		_this._elemBase = elemBase;

		//valores padrÃ£o da largura e altura iniciais
		if (!_this._opcoes.larguraIni) _this._opcoes.larguraIni = _this._opcoes.largura;
		if (!_this._opcoes.alturaIni) _this._opcoes.alturaIni = _this._opcoes.altura;

		//transformando atributo em valor numerico se necessario
		if (_this._opcoes.usoDesfazer && _this._opcoes.usoDesfazer instanceof Boolean) _this._opcoes.usoDesfazer = 1;
		if (_this._opcoes.usoRefazer && _this._opcoes.usoRefazer instanceof Boolean) _this._opcoes.usoRefazer = 1;
		if (!_this._opcoes.retina) _this._opcoes.retina = 1;

		_this._liberado = false; //liberacao para poder desenhar
		_this._draw = false; //indicador de estado de desenho
		_this._stack = ''; //pilha de posiÃ§Ãµes
		_this._stackArr = [];
		_this._des_cod = [];
		_this._des_cod_hist = [];
		_this._codigoQuebra = true;

		//Dados do desenho
		_this._cor = 0;
		_this._corValor = 'x000000'; //valor passado para compatibilidade
		_this._borda = 4;
		_this._tipo = 0;
		_this._alpha = 1;

		//Dados temporarios
		_this._bordaTemp = _this._borda;
		_this._alphaTemp = _this._alpha;

		//controles de balde
		_this._tolerancia = 20;

		_this._camada = 0;
		_this._histCamada = [];
		_this._canvasHist = [];
		_this._canvasHistElem = [];
		_this._histPos = 0;
		_this._undoQuant = 0;
		_this._redoQuant = 0;
		_this._histQuant = _this._opcoes.usoDesfazer > _this._opcoes.usoRefazer ? _this._opcoes.usoDesfazer + 1 : _this._opcoes.usoRefazer + 1;

		_this._zoom = 1;
		_this._zoomOrig = 1;
		_this._zoomTela = _this._opcoes.larguraIni / _this._opcoes.largura;
		_this._zoomPos = 1;
		_this._fator = 1;

		//lista de cores padrao (compatibilidade com a versao antiga)
		_this._cores = ['rgba(0,0,0,0)', '#000', '#666', '#8b0000', '#008b00', '#00008b', '#008b8b', '#8b8b00', '#8b4500', '#8b0a50', '#551a8b', '#548b54', '#8b6969', '#8b7b8b', '#fff', '#ccc', '#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ffff00', '#ff7f00', '#ff1493', '#9b30ff', '#9aff9a', '#ffc1c1', '#ffe1ff'];

		//Coordenadas Iniciais e Atuais
		_this._xFirst;
		_this._yFirst;
		_this._xCoord;
		_this._yCoord;

		_this._canvasArr = [];
		_this._canvasElemsArr = [];
		//obtendo contextos do canvas
		for (var cont = 0; cont < _this._opcoes.elems; cont++) {
			var elem = document.createElement('canvas');
			elem.width = _this._opcoes.largura * _this._opcoes.retina;
			elem.height = _this._opcoes.altura * _this._opcoes.retina;

			var ctx = elem.getContext('2d');
			//caracteristicas
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = _this._borda * _this._opcoes.retina;

			_this._canvasArr.push(ctx);
			_this._canvasElemsArr.push(elem);

			elemBase.appendChild(elem);
		}
		//opcao inicial
		_this._canvasElem = _this._canvasElemsArr[0];
		_this._canvas = _this._canvasArr[0];

		_this._canvasLargura = _this._canvasElem.width;
		_this._canvasAltura = _this._canvasElem.height;
		_this._local = [_this._canvas];

		if (_this._opcoes.prev) {
			_this._canvasPrevElem = document.createElement('canvas');
			_this._canvasPrevElem.width = _this._opcoes.largura * _this._opcoes.retina;
			_this._canvasPrevElem.height = _this._opcoes.altura * _this._opcoes.retina;
			_this._canvasPrevElem.style.position = 'absolute';
			_this._canvasPrevElem.style.zIndex = 1;
			_this._canvasPrevElem.style.top = 0;
			_this._canvasPrevElem.style.left = 0;

			_this._canvasPrev = _this._canvasPrevElem.getContext('2d');
			_this._local.push(_this._canvasPrev);

			_this._canvasPrev.lineCap = 'round';
			_this._canvasPrev.lineJoin = 'round';
			_this._canvasPrev.fillStyle = '#000000';
			_this._canvasPrev.strokeStyle = '#000000';
			_this._canvasPrev.lineWidth = _this._borda * _this._opcoes.retina;

			elemBase.appendChild(_this._canvasPrevElem);

			var elemEvent = _this._opcoes.eventElem || _this._canvasPrevElem;

			//direcionando eventos da pagina para o objeto
			elemEvent.addEventListener('touchstart', function (e) {
				_this._startDraw(e);
				if (_this._liberado) e.preventDefault();
			}, false);
			elemEvent.addEventListener('touchmove', function (e) {
				_this._coordenada(e);
				if (_this._liberado) e.preventDefault();
			}, false);
			elemEvent.addEventListener('touchend', function (e) {
				_this._endDraw(e);
				if (_this._liberado) e.preventDefault();
			}, false);
			elemEvent.addEventListener('touchcancel', function (e) {
				_this._endDraw(e);
				if (_this._liberado) e.preventDefault();
			}, false);

			//adicionando listeners desktop
			if (!_this._opcoes.mobile) {
				elemEvent.addEventListener('mousedown', function (e) {
					_this._startDraw(e);
				}, false);
				document.addEventListener('mousemove', function (e) {
					_this._coordenada(e);

					//verificando se o botao do mouse continua pressionado
					if (_this._draw && (e.which === 0 || e.buttons === 0)) _this._endDraw(e);
				}, false);
				document.addEventListener('mouseup', function (e) {
					_this._endDraw(e);
				}, false);
			}
		}

		var elemTemp = void 0,
		    canvasTemp = void 0;
		if (_this._opcoes.usoDesfazer || _this._opcoes.usoRefazer) {
			for (var _cont = 0; _cont < _this._histQuant; _cont++) {
				elemTemp = document.createElement('canvas');
				elemTemp.width = _this._canvasLargura;
				elemTemp.height = _this._canvasAltura;
				elemTemp.style.display = 'none';
				_this._canvasHistElem.push(elemTemp);

				canvasTemp = elemTemp.getContext('2d');
				_this._local.push(canvasTemp);
				canvasTemp.lineCap = 'round';
				canvasTemp.lineJoin = 'round';
				canvasTemp.fillStyle = '#000000';
				canvasTemp.strokeStyle = '#000000';
				canvasTemp.lineWidth = _this._borda * _this._opcoes.retina;
				_this._canvasHist.push(canvasTemp);
			}
		}

		_this.zoom = 1;
		return _this;
	}

	/**
  * Apaga uma Ã¡rea quadrada de acordo com a coordenada e tamanho da borda
  *
  * @param {number} xini Coordenada X do ponto central
  * @param {number} yini Coordenada Y do ponto central
  * @param {number} lugar Local onde serÃ¡ apagado (desenho ou previa)
  */


	_createClass(Desenho, [{
		key: 'borracha',
		value: function borracha(xini, yini, lugar) {
			xini -= this._borda * 3;
			yini -= this._borda * 3;

			xini *= this._opcoes.retina;
			yini *= this._opcoes.retina;

			var tamanho = (this._borda * 6 + 1) * this._opcoes.retina;

			this._local[lugar].clearRect(xini, yini, tamanho, tamanho);
		}

		/**
   * Desenha uma linha reta
   *
   * @param {number} x1 Coordenada X do ponto inicial
   * @param {number} y1 Coordenada Y do ponto inicial
   * @param {number} x2 Coordenada X do ponto final
   * @param {number} y2 Coordenada Y do ponto final
   * @param {number} lugar Local onde serÃ¡ efetuado o desenho
   */

	}, {
		key: 'linha',
		value: function linha(x1, y1, x2, y2, lugar) {
			x1 *= this._opcoes.retina;
			y1 *= this._opcoes.retina;
			x2 *= this._opcoes.retina;
			y2 *= this._opcoes.retina;

			this._local[lugar].beginPath();
			this._local[lugar].lineWidth = this._borda * this._opcoes.retina;
			this._local[lugar].moveTo(x1, y1);
			this._local[lugar].lineTo(x2, y2);
			this._local[lugar].stroke();
			this._local[lugar].closePath();
		}

		/**
   * Desenha uma sequÃªncia de linhas em um mesmo path
   *
   * @param {Array} arrSeq SequÃªncia de coordenadas de linha
   * @param {number} lugar Local onde serÃ¡ efetuado o desenho
   */

	}, {
		key: 'linhaSeq',
		value: function linhaSeq(arrSeq, lugar) {
			this._local[lugar].beginPath();
			this._local[lugar].moveTo(arrSeq[0][0] * this._opcoes.retina, arrSeq[0][1] * this._opcoes.retina);
			var cont = void 0;
			for (cont = 1; cont < arrSeq.length; cont++) {
				this._local[lugar].quadraticCurveTo(arrSeq[cont - 1][0] * this._opcoes.retina, arrSeq[cont - 1][1] * this._opcoes.retina, (arrSeq[cont - 1][0] + (arrSeq[cont][0] - arrSeq[cont - 1][0]) / 2) * this._opcoes.retina, (arrSeq[cont - 1][1] + (arrSeq[cont][1] - arrSeq[cont - 1][1]) / 2) * this._opcoes.retina);
			}this._local[lugar].lineTo(arrSeq[cont - 1][0] * this._opcoes.retina, arrSeq[cont - 1][1] * this._opcoes.retina);
			this._local[lugar].stroke();
		}

		/**
   * Desenha um retÃ¢ngulo preenchido
   *
   * @param {number} x1 Coordenada X do ponto inicial
   * @param {number} y1 Coordenada Y do ponto inicial
   * @param {number} largura Largura do retÃ¢ngulo
   * @param {number} altura Altura do retÃ¢ngulo
   * @param {number} lugar Local onde serÃ¡ efetuado o desenho
   */

	}, {
		key: 'retanguloF',
		value: function retanguloF(x1, y1, largura, altura, lugar) {
			x1 *= this._opcoes.retina;
			y1 *= this._opcoes.retina;
			largura *= this._opcoes.retina;
			altura *= this._opcoes.retina;

			this._local[lugar].fillRect(x1, y1, largura, altura);
		}

		/**
   * Desenha a borda de um retÃ¢ngulo
   *
   * @param {number} x1 Coordenada X do ponto inicial
   * @param {number} y1 Coordenada Y do ponto inicial
   * @param {number} largura Largura do retÃ¢ngulo
   * @param {number} altura Altura do retÃ¢ngulo
   * @param {number} lugar Local onde serÃ¡ efetuado o desenho
   */

	}, {
		key: 'retanguloB',
		value: function retanguloB(x1, y1, largura, altura, lugar) {
			x1 *= this._opcoes.retina;
			y1 *= this._opcoes.retina;
			largura *= this._opcoes.retina;
			altura *= this._opcoes.retina;

			this._local[lugar].strokeRect(x1, y1, largura, altura);
		}

		/**
   * Desenha uma elipse preenchida
   *
   * @param {number} cx Coordenada X do centro da elipse
   * @param {number} cy Coordenada Y do centro da elipse
   * @param {number} rx Raio da elipse na coordenada X
   * @param {number} ry Raio da elipse na coordenada Y
   * @param {number} lugar Local onde serÃ¡ efetuado o desenho
   */

	}, {
		key: 'elipseF',
		value: function elipseF(cx, cy, rx, ry, lugar) {
			cx *= this._opcoes.retina;
			cy *= this._opcoes.retina;
			rx *= this._opcoes.retina;
			ry *= this._opcoes.retina;

			var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
			this._local[lugar].beginPath();
			this._local[lugar].moveTo(cx, cy - ry);
			this._local[lugar].bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
			this._local[lugar].bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
			this._local[lugar].bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
			this._local[lugar].bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
			this._local[lugar].fill();
		}

		/**
   * Desenha uma borda de elipse
   *
   * @param {number} cx Coordenada X do centro da elipse
   * @param {number} cy Coordenada Y do centro da elipse
   * @param {number} rx Raio da elipse na coordenada X
   * @param {number} ry Raio da elipse na coordenada Y
   * @param {number} lugar Local onde serÃ¡ efetuado o desenho
   */

	}, {
		key: 'elipseB',
		value: function elipseB(cx, cy, rx, ry, lugar) {
			cx *= this._opcoes.retina;
			cy *= this._opcoes.retina;
			rx *= this._opcoes.retina;
			ry *= this._opcoes.retina;

			var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
			this._local[lugar].beginPath();
			this._local[lugar].moveTo(cx, cy - ry);
			this._local[lugar].bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
			this._local[lugar].bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
			this._local[lugar].bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
			this._local[lugar].bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
			this._local[lugar].stroke();
		}

		/**
   * ObtÃ©m a cor especÃ­fica de uma coordenada
   *
   * @param {Array} coordenadas Array contando as coordenadas X e Y
   * @returns {string} Hexadecimal da cor, no formato xFFFFFF
   */

	}, {
		key: 'contaGotas',
		value: function contaGotas(coordenadas) {
			var cor = this.getPixel(Math.round(coordenadas[0]), Math.round(coordenadas[1]));
			var novaCor = (cor.b + 256 * cor.g + 65536 * cor.r).toString(16).toUpperCase();

			while (novaCor.length < 6) {
				novaCor = '0' + novaCor;
			}return 'x' + novaCor;
		}

		/**
   * Desenha uma sequÃªncia de retÃ¢ngulos em um mesmo path
   *
   * @param {Array} dados Array contendo a senquÃªncia de retÃ¢ngulos
   */

	}, {
		key: 'baldeF',
		value: function baldeF(dados) {
			var x1 = void 0,
			    y1 = void 0,
			    x2 = void 0,
			    y2 = void 0;

			this._canvas.beginPath();
			for (var cont = 0; cont < dados.length; cont += 4) {
				x1 = parseInt(dados[cont]) * this._opcoes.retina;
				y1 = parseInt(dados[cont + 1]) * this._opcoes.retina;
				x2 = parseInt(dados[cont + 2]) * this._opcoes.retina;
				y2 = parseInt(dados[cont + 3]) * this._opcoes.retina;

				this._canvas.rect(x1, y1, x2, y2);
			}
			this._canvas.fill();
		}

		/**
   * Processa e desenha o balde na Ã¡rea desejada
   *
   * @param {number} x Coordenada X do ponto a ser aplicado
   * @param {number} y Coordenada Y do ponto a ser aplicado
   */

	}, {
		key: 'balde',
		value: function balde(x, y) {
			var _this2 = this;

			var maiorRetanguloSL = function maiorRetanguloSL(antigo, x1, y1) {
				var xc = x1;
				var yc = y1;

				if (comparaPixel(x1, y1, antigo)) {
					while (comparaPixel(xc + 1, yc, antigo)) {
						xc++;
					}var xfinal = xc;
					do {
						xc = x1 - 1;
						yc++;
						while (comparaPixel(xc + 1, yc, antigo) && xc + 1 <= xfinal) {
							xc++;
						}
					} while (xc == xfinal);
					yc--;

					var _x = xfinal - x1;
					var _y = yc - y1;
					return {
						x: x1,
						y: y1,
						w: _x,
						h: _y
					};
				} else return {
					w: -1,
					h: -1
				};
			};

			var maiorRetanguloNO = function maiorRetanguloNO(antigo, x1, y1) {
				var xc = x1;
				var yc = y1;

				if (comparaPixel(x1, y1, antigo)) {
					while (comparaPixel(xc - 1, yc, antigo)) {
						xc--;
					}var xfinal = xc;
					do {
						xc = x1 + 1;
						yc--;
						while (comparaPixel(xc - 1, yc, antigo) && xc - 1 >= xfinal) {
							xc--;
						}
					} while (xc == xfinal);
					yc++;

					var _x2 = x1 - xfinal;
					var _y2 = y1 - yc;
					return {
						x: xfinal,
						y: yc,
						w: _x2,
						h: _y2
					};
				} else return {
					w: -1,
					h: -1
				};
			};

			var maiorRetanguloSO = function maiorRetanguloSO(antigo, x1, y1) {
				var xc = x1;
				var yc = y1;

				if (comparaPixel(x1, y1, antigo)) {
					while (comparaPixel(xc, yc + 1, antigo)) {
						yc++;
					}var yfinal = yc;
					do {
						yc = y1 - 1;
						xc--;
						while (comparaPixel(xc, yc + 1, antigo) && yc + 1 <= yfinal) {
							yc++;
						}
					} while (yc == yfinal);
					xc++;

					var _x3 = x1 - xc;
					var _y3 = yfinal - y1;
					return {
						x: xc,
						y: y1,
						w: _x3,
						h: _y3
					};
				} else return {
					w: -1,
					h: -1
				};
			};

			var maiorRetanguloNL = function maiorRetanguloNL(antigo, x1, y1) {
				var xc = x1;
				var yc = y1;

				if (comparaPixel(x1, y1, antigo)) {
					while (comparaPixel(xc, yc - 1, antigo)) {
						yc--;
					}var yfinal = yc;
					do {
						yc = y1 + 1;
						xc++;
						while (comparaPixel(xc, yc - 1, antigo) && yc - 1 >= yfinal) {
							yc--;
						}
					} while (yc == yfinal);
					xc--;

					var _x4 = xc - x1;
					var _y4 = y1 - yfinal;
					return {
						x: x1,
						y: yfinal,
						w: _x4,
						h: _y4
					};
				} else return {
					w: -1,
					h: -1
				};
			};

			var comparaPixel = function comparaPixel(x, y, antigo) {
				if (!matrizMarcados[x][y]) {
					var _idx = (x + y * _this2._canvasLargura) * 4;
					var conta1 = Math.abs(antigo[0] - canvasData[_idx]);
					var conta2 = Math.abs(antigo[1] - canvasData[_idx + 1]);
					var conta3 = Math.abs(antigo[2] - canvasData[_idx + 2]);
					var conta4 = Math.abs(antigo[3] - canvasData[_idx + 3]);
					return conta1 < _this2._tolerancia && conta2 < _this2._tolerancia && conta3 < _this2._tolerancia && conta4 < _this2._tolerancia;
				} else return false;
			};

			var resetaMatriz = function resetaMatriz() {
				matrizMarcados = [];
				for (var cont = -1; cont <= _this2._canvasLargura; cont++) {
					matrizMarcados[cont] = [];
				}matrizMarcados[-1] = [];
				matrizMarcados[_this2._canvasLargura] = [];
				for (var _cont2 = -1; _cont2 <= _this2._canvasAltura; _cont2++) {
					matrizMarcados[-1][_cont2] = 1;
					matrizMarcados[_this2._canvasLargura][_cont2] = 1;
				}
				for (var _cont3 = 0; _cont3 < _this2._canvasLargura; _cont3++) {
					matrizMarcados[_cont3][-1] = 1;
					matrizMarcados[_cont3][_this2._canvasAltura] = 1;
				}
			};

			var marcarMatriz = function marcarMatriz(coordenadas) {
				var x1 = coordenadas[0];
				var y1 = coordenadas[1];
				var x2 = x1 + coordenadas[2];
				var y2 = y1 + coordenadas[3];

				for (var cont = x1; cont < x2; cont++) {
					for (var cont2 = y1; cont2 < y2; cont2++) {
						matrizMarcados[cont][cont2] = true;
					}
				}

				coordenadas[0] = Math.round(coordenadas[0] / _this2._opcoes.retina);
				coordenadas[1] = Math.round(coordenadas[1] / _this2._opcoes.retina);
				coordenadas[2] = Math.round(coordenadas[2] / _this2._opcoes.retina);
				coordenadas[3] = Math.round(coordenadas[3] / _this2._opcoes.retina);

				return coordenadas.join('#');
			};

			x = Math.round(x) * this._opcoes.retina;
			y = Math.round(y) * this._opcoes.retina;

			var temp = this._cor;
			var corB = temp % 256;
			temp = Math.floor(temp / 256);
			var corG = temp % 256;
			temp = Math.floor(temp / 256);
			var corR = temp;

			var matrizMarcados = void 0;
			resetaMatriz();
			var canvasData = this._canvas.getImageData(0, 0, this._canvasLargura, this._canvasAltura).data;

			var idx = (x + y * this._canvasLargura) * 4;
			var antigo = [canvasData[idx], canvasData[idx + 1], canvasData[idx + 2], canvasData[idx + 3]];
			var pilha = [];
			//iniciando pilha
			for (var cont = 0; cont <= this._canvasLargura; cont++) {
				pilha[cont] = [];
			}if (!comparaPixel(x, y, [corR, corG, corB, 255])) {
				while (comparaPixel(x - 1, y, antigo)) {
					x--;
				}while (comparaPixel(x, y - 1, antigo)) {
					y--;
				}var retIni = maiorRetanguloSL(antigo, x, y);
				var valor = { x: x, y: y, w: retIni.w, h: retIni.h, ref: 0, andada: 0 };
				var andada = void 0;
				var nivel = retIni.w;
				var ref = void 0;

				this._canvas.fillRect(retIni.x, retIni.y, retIni.w + 1, retIni.h + 1);
				var stack = marcarMatriz([retIni.x, retIni.y, retIni.w + 1, retIni.h + 1]);

				do {
					//verificando direita
					andada = 0;
					if (valor.ref == 2) andada += valor.andada;

					while (andada <= valor.h) {
						retIni = maiorRetanguloNL(antigo, valor.x + valor.w + 1, valor.y + valor.h - andada);
						ref = retIni.h;

						if (ref != -1) {
							pilha[ref].push({ x: retIni.x, y: retIni.y, w: retIni.w, h: retIni.h, ref: 1, andada: valor.h + 1 - andada });

							this._canvas.fillRect(retIni.x, retIni.y, retIni.w + 1, retIni.h + 1);
							stack += '#' + marcarMatriz([retIni.x, retIni.y, retIni.w + 1, retIni.h + 1]);

							if (ref > nivel) nivel = ref;
							andada += ref;
						} else andada++;
					}

					//verificando esquerda
					andada = 0;
					if (valor.ref == 1) andada += valor.andada;
					while (andada <= valor.h) {
						retIni = maiorRetanguloSO(antigo, valor.x - 1, valor.y + andada);
						ref = retIni.h;

						if (ref != -1) {
							pilha[ref].push({ x: retIni.x, y: retIni.y, w: retIni.w, h: retIni.h, ref: 2, andada: valor.h + 1 - andada });

							this._canvas.fillRect(retIni.x, retIni.y, retIni.w + 1, retIni.h + 1);
							stack += '#' + marcarMatriz([retIni.x, retIni.y, retIni.w + 1, retIni.h + 1]);

							if (ref > nivel) nivel = ref;
							andada += ref;
						} else andada++;
					}

					//verificando baixo
					andada = 0;
					if (valor.ref == 4) andada += valor.andada;
					while (andada <= valor.w) {
						retIni = maiorRetanguloSL(antigo, valor.x + andada, valor.y + valor.h + 1);
						ref = retIni.w;
						if (ref != -1) {
							pilha[ref].push({ x: retIni.x, y: retIni.y, w: retIni.w, h: retIni.h, ref: 3, andada: valor.w + 1 - andada });

							this._canvas.fillRect(retIni.x, retIni.y, retIni.w + 1, retIni.h + 1);
							stack += '#' + marcarMatriz([retIni.x, retIni.y, retIni.w + 1, retIni.h + 1]);

							if (ref > nivel) nivel = ref;
							andada += ref;
						} else andada++;
					}

					//verificando cima
					andada = 0;
					if (valor.ref == 3) andada += valor.andada;
					while (andada <= valor.w) {
						retIni = maiorRetanguloNO(antigo, valor.x + valor.w - andada, valor.y - 1);
						ref = retIni.w;
						if (ref != -1) {
							pilha[ref].push({ x: retIni.x, y: retIni.y, w: retIni.w, h: retIni.h, ref: 4, andada: valor.w + 1 - andada });

							this._canvas.fillRect(retIni.x, retIni.y, retIni.w + 1, retIni.h + 1);
							stack += '#' + marcarMatriz([retIni.x, retIni.y, retIni.w + 1, retIni.h + 1]);

							if (ref > nivel) nivel = ref;
							andada += ref;
						} else andada++;
					}

					valor = pilha[nivel].pop();

					while (valor == null && nivel > 0) {
						valor = pilha[--nivel].pop();
					}
				} while (valor != null);

				var codigo = '3@' + stack;
				this._des_cod.push(codigo);
				_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
			}
		}

		/**
   * Tratando o inicio do ato de desenhar
   *
   * @param {MouseEvent|TouchEvent} e Evento do ponteiro
   */

	}, {
		key: '_startDraw',
		value: function _startDraw(e) {
			if (!this._draw && this._liberado) {
				//obtendo as coordenadas atuais do mouse
				this._coordenada(e);
				_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'coord', this._xCoord, this._yCoord, false);

				this._draw = true;

				this._xFirst = this._xCoord;
				this._yFirst = this._yCoord;

				//casos especiais
				switch (this._tipo) {
					case 0:
						//PINCEL
						this._stack = this._xFirst + '#' + this._yFirst;
						this._stackArr = [[this._xFirst, this._yFirst]];
						break;
					case 7:
						//BALDE
						this.balde(this._xFirst, this._yFirst);
						this._draw = false;
						this.salvarEstado(false);
						break;
					case 8:
						//COLOR PICKER
						this.mudaCor(this.contaGotas([this._xFirst, this._yFirst]), true);
						_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'selCor');
						this._draw = false;
						break;
					case 1:
						//BORRACHA
						this._stack = this._xFirst + '#' + this._yFirst;
						this.borracha(this._xCoord, this._yCoord, 0, true);
						break;
				}

				if (this._tipo != 8) _get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'startDraw');
			}
		}

		/**
   * Tratando o movimento de desenhar
   *
   * @param {MouseEvent|TouchEvent} e Evento do ponteiro
   */

	}, {
		key: '_coordenada',
		value: function _coordenada(e) {
			if (!this._liberado) return;

			//obtendo dados de acordo com o navegador...
			var rect = (this._opcoes.eventElem || this._canvasPrevElem).getBoundingClientRect();
			var posCanvas = { x: rect.left, y: rect.top };
			posCanvas.x *= this._zoomPos;
			posCanvas.y *= this._zoomPos;

			if (e && e.touches) {
				this._xCoord = e.touches[0].clientX + document.documentElement.scrollLeft - posCanvas.x;
				this._yCoord = e.touches[0].clientY + document.documentElement.scrollTop - posCanvas.y;
			}
			//IE
			else if (window.event) {
					this._xCoord = event.clientX + document.documentElement.scrollLeft - posCanvas.x;
					this._yCoord = event.clientY + document.documentElement.scrollTop - posCanvas.y;
				}
				//Firefox
				else if (document.layers) {
						this._xCoord = e.x + document.documentElement.scrollLeft - posCanvas.x;
						this._yCoord = e.y + document.documentElement.scrollTop - posCanvas.y;
					}
					//Outros
					else {
							this._xCoord = e.clientX + document.documentElement.scrollLeft - posCanvas.x;
							this._yCoord = e.clientY + document.documentElement.scrollTop - posCanvas.y;
						}

			this._xCoord = Math.round(this._xCoord / this._zoom / this._fator / this._zoomTela);
			this._yCoord = Math.round(this._yCoord / this._zoom / this._fator / this._zoomTela);

			//coordenadas do mouse
			if (!this._draw) {
				if (this._xCoord >= 0 && this._xCoord < this._canvasLargura && this._yCoord >= 0 && this._yCoord < this._canvasAltura) _get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'coord', this._xCoord, this._yCoord, true);else _get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'coord', this._xCoord, this._yCoord, false);
			}

			//marcacao da borracha
			if (this._canvasPrevElem && this._tipo == 1) {
				var xini = this._xCoord - this._borda * 3;
				var yini = this._yCoord - this._borda * 3;
				var tamanho = this._borda * 6 + 1;
				this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
				this.desenhar(xini, yini, xini + tamanho, yini + tamanho, 2, 1, false);
				this.desenhar(xini, yini, xini + tamanho, yini + tamanho, 3, 1, false);
			}

			//Verifica de nÃ£o hÃ¡ bloqueio e se comeÃ§ou a desenhar
			if (this._draw && this._liberado) {
				//LAPIS
				if (this._tipo == 0) {
					//quebra do codigo da linha
					if (this._codigoQuebra && this._stack.length > this._opcoes.quebra) {
						var codigo = '2@' + this._stack;
						this._des_cod.push(codigo);
						_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
						_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'quebra');
						this._stack = this._xFirst + '#' + this._yFirst;
						this.salvarEstado(false);
					}

					//gravando linha
					//desenhando sequencia da linha
					this._stack += '#' + this._xCoord + '#' + this._yCoord;
					//tratamento diferenciado para transparencia
					this._stackArr.push([this._xCoord, this._yCoord]);
					this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
					this.linhaSeq(this._stackArr, 1);

					this._xFirst = this._xCoord;
					this._yFirst = this._yCoord;
				}
				//BORRACHA
				else if (this._tipo == 1) {
						if (this._stack.length > 230) {
							var _codigo = '21@' + this._stack;
							this._des_cod.push(_codigo);
							_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', _codigo);
							this._stack = this._xCoord + '#' + this._yCoord;
						}

						this.borracha(this._xCoord, this._yCoord, 0, true);
						this._stack += '#' + this._xCoord + '#' + this._yCoord;
					}
					//OUTROS
					else {
							this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
							this.desenhar(this._xFirst, this._yFirst, this._xCoord, this._yCoord, this._tipo, 1, false);
						}
			}
		}

		/**
   * Repassa e efetua um desenho de acordo com o tipo
   *
   * @param {number} x1 Coordenada X do ponto inicial
   * @param {number} y1 Coordenada Y do ponto inicial
   * @param {number} x2 Coordenada X do ponto final
   * @param {number} y2 Coordenada Y do ponto final
   * @param {number} tipo Tipo de desenho a ser efetuado
   * @param {number} lugar Local onde o desenho serÃ¡ efetuado
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para o desenho
   */

	}, {
		key: 'desenhar',
		value: function desenhar(x1, y1, x2, y2, tipo, lugar, gravar) {
			//coordenadas de inicio e fim iguais... invalidar
			if (x1 == x2 && y1 == y2) {
				return;
			}

			//Verifica o tipo do desenho

			var xIni = void 0,
			    xFim = void 0,
			    yIni = void 0,
			    yFim = void 0;

			if (x1 >= x2) {
				xIni = x2;
				xFim = x1;
			} else {
				xIni = x1;
				xFim = x2;
			}
			if (y1 >= y2) {
				yIni = y2;
				yFim = y1;
			} else {
				yIni = y1;
				yFim = y2;
			}

			switch (tipo) {
				//LINHA
				case 6:
					this.linha(x1, y1, x2, y2, lugar);
					break;
				//RETANGULO FUNDO
				case 2:
					if (xIni == xFim || yIni == yFim) {
						gravar = false;
						break;
					}
					this.retanguloF(xIni, yIni, xFim - xIni, yFim - yIni, lugar);
					break;
				//RETANGULO BORDA
				case 3:
					this.retanguloB(xIni, yIni, xFim - xIni, yFim - yIni, lugar);
					break;
				//ELIPSE FUNDO
				case 4:
					{
						if (xIni == xFim || yIni == yFim) {
							gravar = false;
							break;
						}

						var rx = Math.floor((xFim - xIni) / 2);
						var ry = Math.floor((yFim - yIni) / 2);
						var cx = Math.round(xIni + rx);
						var cy = Math.round(yIni + ry);

						this.elipseF(cx, cy, rx, ry, lugar);
						break;
					}
				//ELIPSE BORDA
				case 5:
					{
						var _rx = Math.floor((xFim - xIni) / 2);
						var _ry = Math.floor((yFim - yIni) / 2);
						var _cx = Math.round(xIni + _rx);
						var _cy = Math.round(yIni + _ry);

						this.elipseB(_cx, _cy, _rx, _ry, lugar);
						break;
					}
			}

			if (gravar) {
				var codigo = '1@' + tipo + '#' + x1 + '#' + y1 + '#' + x2 + '#' + y2;
				this._des_cod.push(codigo);
				_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
			}
		}

		/**
   * Tratando o fim do ato de desenhar
   */

	}, {
		key: '_endDraw',
		value: function _endDraw() {
			//Caso esteja desenhando
			if (this._draw && this._liberado) {
				var codigo = void 0;
				if (this._tipo == 0) {
					var stackSep = this._stack.split('#');
					//veridicando se deu apenas um clique na tela
					if (stackSep.length == 2) {
						var raio = Math.round(this._bordaTemp / 2);
						var diametro = raio * 2;
						stackSep[0] = parseInt(stackSep[0]) - raio;
						stackSep[1] = parseInt(stackSep[1]) - raio;
						stackSep[2] = stackSep[0] + diametro;
						stackSep[3] = stackSep[1] + diametro;

						this.desenhar(stackSep[0], stackSep[1], stackSep[2], stackSep[3], 4, 0, true);
					}
					//desenhando uma linha na tela
					else {
							codigo = '2@' + this._stack;
							this._des_cod.push(codigo);

							this.linhaSeq(this._stackArr, 0);
							this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
							_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
						}
				} else if (this._tipo == 1) {
					codigo = '21@' + this._stack;
					this._des_cod.push(codigo);
					_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
				} else {
					this.desenhar(this._xFirst, this._yFirst, this._xCoord, this._yCoord, this._tipo, 0, true);
					this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
				}

				//salvando estado
				this.salvarEstado(false);

				//termina o processo de desenho
				this._draw = false;

				//trocando dados alterados no meio do desenho
				if (this._borda != this._bordaTemp) this.mudaBorda(this._bordaTemp, true);
				if (this._alpha != this._alphaTemp) this.mudaAlpha(this._alphaTemp, true);

				_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'endDraw');
			}
		}

		/**
   * Altera a ferramenta selecionada
   *
   * @param {number} valor Valor correspondente Ã  ferramenta
   */

	}, {
		key: 'mudaOpcao',
		value: function mudaOpcao(valor) {
			//se for borracha, preenchimento sempre branco
			if (valor == 1) {
				this._canvas.fillStyle = '#FFFFFF';
				if (this._canvasPrevElem && this._liberado) {
					this._canvasPrev.lineWidth = 2 * this._opcoes.retina;
					this._canvasPrev.globalAlpha = 1;
					this._canvasPrev.strokeStyle = '#000000';
					this._canvasPrev.fillStyle = 'rgba(255,255,255,0.8)';
				}
			} else if (this._tipo == 1) {
				this._canvas.fillStyle = this._converterCor(this._cor, true);
				if (this._canvasPrevElem) {
					this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
					this._canvasPrev.lineWidth = this._borda * this._opcoes.retina;
					this._canvasPrev.globalAlpha = this._alpha;
					this._canvasPrev.fillStyle = this._canvas.fillStyle;
					this._canvasPrev.strokeStyle = this._canvas.fillStyle;
				}
			}

			this._tipo = valor;
		}

		/**
   * Altera a espessura da borda
   *
   * @param {number} valor Espessura da borda
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para a aÃ§Ã£o
   */

	}, {
		key: 'mudaBorda',
		value: function mudaBorda(valor, gravar) {
			if (!this._draw) {
				this._canvas.lineWidth = valor * this._opcoes.retina;
				if (this._canvasPrevElem != null && this._tipo != 1) this._canvasPrev.lineWidth = valor * this._opcoes.retina;
				this._borda = valor;
				this._bordaTemp = valor;

				if (gravar) {
					var codigo = '6@' + valor;
					this._des_cod.push(codigo);
					_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
				}
			} else this._bordaTemp = valor;
		}

		/**
   * Altera a opacidade
   *
   * @param {number} valor Opacidade a ser aplicada
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para a aÃ§Ã£o
   */

	}, {
		key: 'mudaAlpha',
		value: function mudaAlpha(valor, gravar) {
			if (!this._draw) {
				this._canvas.globalAlpha = valor;
				if (this._canvasPrevElem != null && this._tipo != 1) this._canvasPrev.globalAlpha = valor;
				this._alpha = valor;
				this._alphaTemp = valor;

				if (gravar) {
					var codigo = '27@' + valor;
					this._des_cod.push(codigo);
					_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
				}
			} else this._alphaTemp = valor;
		}

		/**
   * Altera a cor
   *
   * @param {number|string} valor Valor da cor, em nÃºmero prÃ©definido ou hexadecial no formato xFFFFFF
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para a aÃ§Ã£o
   */

	}, {
		key: 'mudaCor',
		value: function mudaCor(valor, gravar) {
			var valorInt = parseInt(valor);
			var corHTML = void 0;

			//verificando tipo de cor para manter compatbilidade com a versÃ£o antiga
			if (!isNaN(valorInt)) corHTML = this._cores[valorInt];else if (valor.search(/^x[0-9A-F]{6}$/) != -1) {
				valorInt = parseInt(valor.replace('x', ''), 16);
				corHTML = this._converterCor(valorInt, true);
			} else return;

			this._canvas.strokeStyle = corHTML;
			if (this._canvasPrevElem != null && this._tipo != 1) {
				this._canvasPrev.strokeStyle = corHTML;
				this._canvasPrev.fillStyle = corHTML;
			}

			//caso seja sua vez, nao mudar cor para borracha
			if (this._tipo != 1) this._canvas.fillStyle = corHTML;

			this._cor = valorInt;
			this._corValor = valor;

			if (gravar) {
				var codigo = '5@' + valor;
				this._des_cod.push(codigo);
				_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', codigo);
			}
		}

		/**
   * Limpa a tela de desenho deixando-a transparente
   *
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para a aÃ§Ã£o
   * @param {boolean} bloquearCodigo Indica se o cÃ³digo deve ser repassado
   */

	}, {
		key: 'limparTela',
		value: function limparTela(gravar, bloquearCodigo) {
			//voltando alpha ao normal
			this._canvas.globalAlpha = 1;

			//apagando tudo e setando o fundo padrao (branco)
			this.transparencia();

			this._canvas.fillStyle = this._converterCor(this._cor, true);

			if (gravar) {
				this._des_cod = ['5@' + this._converterCor(this._cor, true).replace('#', 'x'), '6@' + this._borda, '27@' + this._alpha];
				if (!bloquearCodigo) {
					_get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', '4@');
				}
			}
			this._draw = false;

			//Futuramente deve apagar todos os undos
			if (gravar) {
				for (var cont = 0; cont < this._histQuant; cont++) {
					this._des_cod_hist[cont] = '';
				}this.salvarEstado(true);
			}
			//voltando alpha setado
			this._canvas.globalAlpha = this._alpha;
		}

		/**
   * Limpa a tela de prÃ©via
   * @param {number} x PosiÃ§Ã£o X
   * @param {number} y PosiÃ§Ã£o Y
   * @param {number} w Largura
   * @param {number} h Altura
   */

	}, {
		key: 'limparTelaPrev',
		value: function limparTelaPrev(x, y, w, h) {
			if (this._canvasPrevElem) {
				if (x === undefined) {
					x = 0;
					y = 0;
					w = this._canvasLargura;
					h = this._canvasAltura;
				} else {
					x *= this._opcoes.retina;
					y *= this._opcoes.retina;
					w *= this._opcoes.retina;
					h *= this._opcoes.retina;
				}

				this._canvasPrev.clearRect(x, y, w, h);
			}
		}

		/**
   * Apaga a tela de desenho e a tela de prÃ©via
   */

	}, {
		key: 'transparencia',
		value: function transparencia() {
			this._canvas.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
			if (this._canvasPrevElem) this._canvasPrev.clearRect(0, 0, this._canvasLargura, this._canvasAltura);
		}

		/**
   * Desfaz o ultimo desenho efetuado
   *
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para a aÃ§Ã£o
   * @returns {boolean} Indica se a aÃ§Ã£o era possÃ­vel ou nÃ£o
   */

	}, {
		key: 'desfazer',
		value: function desfazer(gravar) {
			if (this._opcoes.usoDesfazer && this._undoQuant) {
				//se estÃ¡ durante o desenho, finalizar
				if (this._draw) this._endDraw();

				if (this._opcoes.usoRefazer) this._redoQuant++;

				//atualizando ponteiro de posicao
				if (--this._histPos < 0) this._histPos = this._histQuant - 1;

				//executando o desfazer
				this.transparencia();
				//alpha normal
				this._canvas.globalAlpha = 1;
				//mostrando a imagem guardada
				this._canvas.drawImage(this._canvasHistElem[this._histPos], 0, 0);
				//alpha original
				this._canvas.globalAlpha = this._alpha;

				this._des_cod = this._des_cod_hist[this._histPos].split('|');
				//des_cod_undo[undoPos] = '';

				if (gravar) _get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', '31@0');

				//recriando ambiente padrao
				this.mudaBorda(this._borda, true);
				this.mudaAlpha(this._alpha, true);
				this.mudaCor(this._corValor, true);

				this._undoQuant--;

				return true;
			} else return false;
		}

		/**
   * Refaz o ultimo desenho efetuado
   *
   * @param {boolean} gravar Indica se deve ser emitido cÃ³digo para a aÃ§Ã£o
   * @returns {boolean} Indica se a aÃ§Ã£o era possÃ­vel ou nÃ£o
   */

	}, {
		key: 'refazer',
		value: function refazer(gravar) {
			if (this._opcoes.usoRefazer && this._redoQuant) {
				//se estÃ¡ durante o desenho, finalizar
				if (this._draw) this._endDraw();

				if (this._opcoes.usoDesfazer) this._undoQuant++;

				//atualizando o ponteiro de posicao
				this._histPos = (this._histPos + 1) % this._histQuant;

				//executando o desfazer
				if (!this._baseDiferente) {
					this.transparencia();
					//alpha normal
					this._canvas.globalAlpha = 1;
					//mostrando a imagem guardada
					this._canvas.drawImage(this._canvasHistElem[this._histPos], 0, 0);
					//alpha normal
					this._canvas.globalAlpha = this._alpha;
				} else {
					this.transparencia();
				}

				this._des_cod = this._des_cod_hist[this._histPos].split('|');
				//des_cod_redo[redoPos] = '';

				if (gravar) _get(Desenho.prototype.__proto__ || Object.getPrototypeOf(Desenho.prototype), 'emit', this).call(this, 'codigo', '31@1');

				//recricando ambiente padrao
				this.mudaBorda(this._borda, true);
				this.mudaAlpha(this._alpha, true);
				this.mudaCor(this._corValor, true);

				this._redoQuant--;

				return true;
			} else return false;
		}

		/**
   * Salva o estado atual do desenho e empinha para ser utilizado na lÃ³gica do desfazer
   *
   * @param {boolean} inicial Indica se trata do primeiro traÃ§o efetuado
   */

	}, {
		key: 'salvarEstado',
		value: function salvarEstado(inicial) {
			if (this._opcoes.usoDesfazer) {
				if (!inicial) this._histPos = (this._histPos + 1) % this._histQuant;else {
					this._histPos = 0;
					this._undoQuant = 0;
				}
				this._redoQuant = 0;

				//apagando tudo e setando o fundo padrao (branco)
				this._canvasHist[this._histPos].clearRect(0, 0, this._canvasLargura, this._canvasAltura);

				//copiando ultima imagem
				this._canvasHist[this._histPos].drawImage(this._canvasElem, 0, 0);

				//camada do undo atual
				this._histCamada[this._histPos] = this._camada;

				this._des_cod_hist[this._histPos] = this._des_cod.join('|');
				if (!inicial && ++this._undoQuant > this._opcoes.usoDesfazer) this._undoQuant = this._opcoes.usoDesfazer;
			}
		}

		/**
   * Transforma uma cor numÃ©rica em Hexadecimal formatada
   *
   * @param {number} val Valor numÃ©rico da cor
   * @param {boolean} hash Indica se irÃ¡ retornar um hexadecimal comum ou no formato xFFFFFF
   * @returns {string} Cor em hexadecimal
   */

	}, {
		key: '_converterCor',
		value: function _converterCor(val, hash) {
			var hex = val.toString(16).toUpperCase();
			while (hex.length < 6) {
				hex = '0' + hex;
			}return hash ? '#' + hex : 'x' + hex;
		}

		/**
   * Captura os valores do pixel em um ponto
   *
   * @param {number} x Coordenada X do ponto
   * @param {number} y Coordenada Y do ponto
   * @returns {Object} Objeto com os valores RGB da cor
   */

	}, {
		key: 'getPixel',
		value: function getPixel(x, y) {
			var b = this._local[0].getImageData(x * this._opcoes.retina, y * this._opcoes.retina, 1, 1).data;

			//somando cor branca ao fundo
			var alpha = b[3] / 255;
			return {
				r: Math.ceil(b[0] * alpha + 255 * (1 - alpha)),
				g: Math.ceil(b[1] * alpha + 255 * (1 - alpha)),
				b: Math.ceil(b[2] * alpha + 255 * (1 - alpha))
			};
		}

		/**
   * Obtem o desenho em Data URI
   *
   * @param {string} formato Formato de imagem a ser gerado (jpeg, png, etc)
   * @returns {string} Data URI do desenho
   */

	}, {
		key: 'salvar',
		value: function salvar(formato) {
			if (this._canvasElem.toDataURL) return this._canvasElem.toDataURL(formato);else return false;
		}

		/**
   * Comprime a sequÃªncia de cÃ³digo do desenho, retirando os tipo repetidos
   */

	}, {
		key: 'comprimir',
		value: function comprimir() {
			var tipoAtual = void 0;
			var ultimoTipo = -1;
			for (var cont = 0; cont < this._des_cod.length; cont++) {
				tipoAtual = parseInt(this._des_cod[cont]);
				if (ultimoTipo == tipoAtual && (tipoAtual == 5 || tipoAtual == 6 || tipoAtual == 27)) {
					this._des_cod.splice(cont - 1, 1);
					cont--;
				} else ultimoTipo = tipoAtual;
			}
		}

		/**
   * Verifica se existe prÃ©via de desenho
   *
   * @returns {boolean} ExistÃªncia ou nÃ£o de prÃ©via
   */

	}, {
		key: 'hasCanvasPrev',
		value: function hasCanvasPrev() {
			if (this._canvasPrevElem) return true;else return false;
		}

		/**
   * Libera ou bloquea o desenho para ser alterado
   *
   * @param {boolean} valor Indica bloqueio ou desbloqueio
   */

	}, {
		key: 'liberar',
		value: function liberar(valor) {
			if (valor == this._liberado) return;

			this._liberado = valor;
			if (valor) {
				this._canvasElem.style.cursor = 'crosshair';
				if (this._canvasPrevElem) this._canvasPrevElem.style.cursor = 'crosshair';
			} else {
				this._canvasElem.style.cursor = 'default';
				if (this._canvasPrevElem) this._canvasPrevElem.style.cursor = 'default';
			}
		}

		/**
   * Remove elementos aplicados pela classe
   */

	}, {
		key: 'remover',
		value: function remover() {
			for (var cont = 0; cont < this._canvasElemsArr.length; cont++) {
				this._elemBase.removeChild(this._canvasElemsArr[cont]);
			}if (this._canvasPrevElem) this._elemBase.removeChild(this._canvasPrevElem);
		}

		/**
   * Obtem o cÃ³digo correspondente ao desenho
   * @type {string}
   */

	}, {
		key: 'sequencia',
		get: function get() {
			return this._des_cod.join('|'); //passando String para haver rÃ©plica
		}

		/**
   * Obtem o zoom que estÃ¡ aplicado no desenho
   * @type {number}
   */
		,


		/**
   * Insere o cÃ³digo correspondente ao desenho
   *
   * @param {string} seq SequÃªncia de cÃ³digos que correspondem aos passos do desenho
   */
		set: function set(seq) {
			this._des_cod = seq.split('|');
		}

		/**
   * Aplica zoom ao desenho
   *
   * @param {number} quant Fator do zoom (1 = 100%)
   */

	}, {
		key: 'zoom',
		get: function get() {
			return this._zoomOrig;
		}

		/**
   * Retona se o desenho estÃ¡ liberado para editar
   * @type {boolean}
   */
		,
		set: function set(quant) {
			this._canvasElem.style.width = Math.round(this._opcoes.larguraIni * quant * this._fator) + 'px';
			this._canvasElem.style.height = Math.round(this._opcoes.alturaIni * quant * this._fator) + 'px';
			if (this._canvasPrevElem) {
				this._canvasPrevElem.style.width = Math.round(this._opcoes.larguraIni * quant * this._fator) + 'px';
				this._canvasPrevElem.style.height = Math.round(this._opcoes.alturaIni * quant * this._fator) + 'px';
			}
			this._zoomOrig = quant;
			this._zoom = quant;
		}

		/**
   * Altera a referÃªncia de zoom aplicada na tela externamente
   *
   * @param {number} quant Fator do zoom
   */

	}, {
		key: 'liberado',
		get: function get() {
			return this._liberado;
		}

		/**
   * Obtem a ferramenta que estÃ¡ selecinada
   * @type {number}
   */

	}, {
		key: 'opcao',
		get: function get() {
			return this._tipo;
		}

		/**
   * Obtem a cor que estÃ¡ selecionada
   * @type {string}
   */

	}, {
		key: 'cor',
		get: function get() {
			return this._converterCor(this._cor, false);
		}
	}, {
		key: 'corReal',
		get: function get() {
			return this._converterCor(this._cor, true);
		}
	}, {
		key: 'corValor',
		get: function get() {
			return this._corValor;
		}

		/**
   * Obtem a borda que estÃ¡ selecionada
   * @type {number}
   */

	}, {
		key: 'borda',
		get: function get() {
			return this._bordaTemp;
		}

		/**
   * Obtem a opacidade que estÃ¡ aplicada
   * @type {number}
   */

	}, {
		key: 'alpha',
		get: function get() {
			return this._alphaTemp;
		}

		/**
   * Obtem a largura do desenho
   * @type {number}
   */

	}, {
		key: 'largura',
		get: function get() {
			return this._canvasLargura;
		}

		/**
   * Retorna a quantidade de desfazer possÃ­veis
   * @type {number}
   */

	}, {
		key: 'undoQuant',
		get: function get() {
			return this._undoQuant;
		}

		/**
   * Retorna a quantidade de refazer possÃ­veis
   * @type {number}
   */

	}, {
		key: 'redoQuant',
		get: function get() {
			return this._redoQuant;
		}

		/**
   * Obtem a altura do desenho
   * @type {number}
   */

	}, {
		key: 'altura',
		get: function get() {
			return this._canvasAltura;
		}

		/**
   * Obtem o elemento canvas do desenho
   * @type {HTMLElement}
   */

	}, {
		key: 'canvas',
		get: function get() {
			return this._canvasElem;
		}

		/**
   * Obtem o elemento de prÃ©via do desenho
   * @type {HTMLElement}
   */

	}, {
		key: 'canvasPrev',
		get: function get() {
			return this._canvasPrevElem;
		}

		/**
   * Retorna o cÃ³digo do ultimo traÃ§o produzido
   * @type {string}
   */

	}, {
		key: 'ultimaAcao',
		get: function get() {
			if (this._des_cod.length > 0) return this._des_cod[this._des_cod.length - 1];
			return null;
		}

		/**
   * Indica se o cÃ³digo deve ser dividido ao atingir 250 caracteres
   *
   * @param {boolean} val Se deve ou nÃ£o quebrar o cÃ³digo
   */

	}, {
		key: 'codigoQuebra',
		set: function set(val) {
			this._codigoQuebra = val;
		}
	}, {
		key: 'zoomTela',
		set: function set(quant) {
			this._zoomTela = quant;
		}

		/**
   * Altera a referÃªncia de zoom aplicada em posicionamento de tela externamente
   *
   * @param {number} quant Fator do zoom
   */

	}, {
		key: 'zoomPos',
		set: function set(quant) {
			this._zoomPos = quant;
		}

		/**
   * Aplica um fator sobre o possicionamento das coordenadas
   *
   * @param {number} quant Fator a ser multiplicado
   */

	}, {
		key: 'fator',
		set: function set(quant) {
			this._fator = quant;
			this.setZoom(this._zoom);
		}
	}]);

	return Desenho;
}(_eventos2.default);

exports.default = Desenho;
},{"eventos":324}],309:[function(require,module,exports){

module.exports = require('./lib/index');

},{"./lib/index":310}],310:[function(require,module,exports){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

},{"./socket":311,"engine.io-parser":322}],311:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = require('./transports/index');
var Emitter = require('component-emitter');
var debug = require('debug')('engine.io-client:socket');
var index = require('indexof');
var parser = require('engine.io-parser');
var parseuri = require('parseuri');
var parsejson = require('parsejson');
var parseqs = require('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket (uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure
    : (global.location && 'https:' === location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port
      ? location.port
      : (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode;

  // other options for Node.js client
  var freeGlobal = typeof global === 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  }

  // set on handshake
  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null;

  // set on heartbeat
  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.transports = require('./transports/index');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders,
    forceNode: this.forceNode,
    localAddress: this.localAddress
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function () {
    self.onDrain();
  })
  .on('packet', function (packet) {
    self.onPacket(packet);
  })
  .on('error', function (e) {
    self.onError(e);
  })
  .on('close', function () {
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 });
  var failed = false;
  var self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen () {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' === msg.type && 'probe' === msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport () {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  // Handle any error that happens while probing
  function onerror (err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose () {
    onerror('transport closed');
  }

  // When the socket is closed while we're probing
  function onclose () {
    onerror('socket closed');
  }

  // When the socket is upgraded while we're probing
  function onupgrade (to) {
    if (transport && to.name !== transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  // Remove all listeners on the transport and on self
  function cleanup () {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState ||
      'closing' === this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if ('closed' === this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close () {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose () {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade () {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":312,"./transports/index":313,"component-emitter":319,"debug":320,"engine.io-parser":322,"indexof":327,"parsejson":335,"parseqs":336,"parseuri":337}],312:[function(require,module,exports){
/**
 * Module dependencies.
 */

var parser = require('engine.io-parser');
var Emitter = require('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":319,"engine.io-parser":322}],313:[function(require,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var XHR = require('./polling-xhr');
var JSONP = require('./polling-jsonp');
var websocket = require('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":314,"./polling-xhr":315,"./websocket":317,"xmlhttprequest-ssl":318}],314:[function(require,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = require('./polling');
var inherit = require('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":316,"component-inherit":12}],315:[function(require,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var Polling = require('./polling');
var Emitter = require('component-emitter');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty () {}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR (opts) {
  Polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname !== global.location.hostname ||
      port !== opts.port;
    this.xs = opts.secure !== isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function () {
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request (opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.requestTimeout = opts.requestTimeout;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {}

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };
      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (4 !== xhr.readyState) return;
        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function () {
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function () {
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function () {
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

Request.requestsCount = 0;
Request.requests = {};

if (global.document) {
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler () {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":316,"component-emitter":319,"component-inherit":12,"debug":320,"xmlhttprequest-ssl":318}],316:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parseqs = require('parseqs');
var parser = require('engine.io-parser');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function () {
  var XMLHttpRequest = require('xmlhttprequest-ssl');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function (onPause) {
  var self = this;

  this.readyState = 'pausing';

  function pause () {
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function () {
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function (data) {
  var self = this;
  debug('polling got data %s', data);
  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' === packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function () {
  var self = this;

  function close () {
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' === this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;
  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  parser.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' === schema && Number(this.port) !== 443) ||
     ('http' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

},{"../transport":312,"component-inherit":12,"debug":320,"engine.io-parser":322,"parseqs":336,"xmlhttprequest-ssl":318,"yeast":359}],317:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
var NodeWebSocket;
if (typeof window === 'undefined') {
  try {
    NodeWebSocket = require('ws');
  } catch (e) { }
}

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  WebSocket = NodeWebSocket;
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  if (!this.usingBrowserWebSocket) {
    WebSocket = NodeWebSocket;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = void (0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws = this.usingBrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };
  this.ws.onclose = function () {
    self.onClose();
  };
  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      parser.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error
        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done () {
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function () {
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
    ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function () {
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../transport":312,"component-inherit":12,"debug":320,"engine.io-parser":322,"parseqs":336,"ws":9,"yeast":359}],318:[function(require,module,exports){
(function (global){
// browser shim for xmlhttprequest module

var hasCORS = require('has-cors');

module.exports = function (opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) { }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"has-cors":326}],319:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],320:[function(require,module,exports){
(function (process){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":321,"_process":339}],321:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug.debug = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting
    args = exports.formatArgs.apply(self, args);

    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":333}],322:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = require('./keys');
var hasBinary = require('has-binary');
var sliceBuffer = require('arraybuffer.slice');
var after = require('after');
var utf8 = require('wtf-8');

var base64encoder;
if (global && global.ArrayBuffer) {
  base64encoder = require('base64-arraybuffer');
}

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = require('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  if (data === undefined) {
    return err;
  }
  // String data
  if (typeof data == 'string') {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      data = tryDecode(data);
      if (data === false) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

function tryDecode(data) {
  try {
    data = utf8.decode(data);
  } catch (e) {
    return false;
  }
  return data;
}

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!base64encoder) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":323,"after":3,"arraybuffer.slice":4,"base64-arraybuffer":7,"blob":8,"has-binary":325,"wtf-8":358}],323:[function(require,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],324:[function(require,module,exports){
'use strict';
/**
 * Classe para o tratamento de eventos prÃ³prios no estilo node (EventEmitter)
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Eventos = function () {
	/**
  * Construtor da classe, inicializando a lista de eventos.
  */
	function Eventos() {
		_classCallCheck(this, Eventos);

		this._lista = [];
	}

	/**
  * Criando um evento
  *
  * @param {string} evento Nome/indice do evento a ser adicionado
  * @param {function} callback FunÃ§Ã£o a ser chamada assim que o evento for disparado
  */


	_createClass(Eventos, [{
		key: 'on',
		value: function on(evento, callback) {
			//verificando se ja existe marcador para o evento
			if (!this._lista[evento]) this._lista[evento] = [];

			//agregando callback ao marcador
			this._lista[evento].push(callback);
		}

		/**
   * Emitindo um evento
   *
   * @param {string} evento Nome/indice do evento a ser disparado
   * @returns {boolean} Se o evento possui um registro ou nÃ£o
   */

	}, {
		key: 'emit',
		value: function emit(evento) {
			//checando se evento existe
			if (this._lista[evento]) {
				for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}

				//executando cada callback atrelado ao evento
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this._lista[evento][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var callback = _step.value;

						callback.apply(undefined, args);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				return true;
			}
			return false;
		}

		/**
   * Adiciona um listener no topo da chamada do evento
   *
   * @param {string} evento Nome/indice do evento a ser adicionado
   * @param {function} callback FunÃ§Ã£o a ser chamada assim que o evento for disparado
   */

	}, {
		key: 'prependListener',
		value: function prependListener(evento, callback) {
			//verificando se ja existe marcador para o evento
			if (!this._lista[evento]) this._lista[evento] = [];

			//agregando callback ao marcador
			this._lista[evento].unshift(callback);
		}

		/**
   * Remove um listener especÃ­fico do evento
   *
   * @param {string} evento Nome/indice do evento
   * @param {function} callback FunÃ§Ã£o a ser se removida
   */

	}, {
		key: 'removeListener',
		value: function removeListener(evento, callback) {
			if (this._lista[evento]) {
				var pos = this._lista[evento].indexOf(callback);
				if (pos != -1) this._lista[evento].splice(pos, 1);
			}
		}

		/**
   * Remove todos os listeners de um evento
   *
   * @param {string} evento Evento a ser zerado
   */

	}, {
		key: 'removeAllListeners',
		value: function removeAllListeners(evento) {
			delete this._lista[evento];
		}
	}]);

	return Eventos;
}();

exports.default = Eventos;
},{}],325:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":328}],326:[function(require,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],327:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],328:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],329:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _eventos = require('eventos');

var _eventos2 = _interopRequireDefault(_eventos);

var _conexao = require('conexao');

var _conexao2 = _interopRequireDefault(_conexao);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Constantes do jogo
 */
var JOGO_DESENHO = 1;
var JOGO_LINHA = 2;
var JOGO_BALDE = 3;
var JOGO_LIMPAR = 4;
var JOGO_COR = 5;
var JOGO_BORDA = 6;
var JOGO_CHAT = 7;
var JOGO_RESPOSTA = 8;
var JOGO_VEZ_OUTRO = 9;
var JOGO_VEZ = 10;
var JOGO_INTERVALO = 11;
var JOGO_FIM = 12;
var JOGO_ENTRADA = 15;
var JOGO_PULAR = 16;
var JOGO_ACERTO = 18;
var JOGO_DICA = 19;
var JOGO_DENUNCIA = 20;
var JOGO_BORRACHA = 21;
var JOGO_INATIVO = 22;
var JOGO_AGUARDANDO = 23;
var JOGO_MENSAGEM = 24;
var JOGO_ALPHA = 27;
var JOGO_EXPULSAR = 28;
var JOGO_CANCELAR = 30;
var JOGO_DESFAZER = 31;
var JOGO_INICIO = 32;

var TEMPO_INATIVO = 260000;

/**
 * Classe para o tratamento do jogo no Gartic
 */

var Jogo = function (_Eventos) {
	_inherits(Jogo, _Eventos);

	/**
  * Construtor da Classe
  *
  * @param {Player} player Objeto referente a animaÃ§Ã£o de desenho do jogo
  * @param {Object} dadosSala Dados agrupados de informaÃ§Ã£o da sala
  * @param {Object} opcoes ConfiguraÃ§Ãµes do objeto
  * @param {string} opcoes.base EndereÃ§o base das requisiÃ§Ãµes ajax
  * @param {string} opcoes.sessao Hash para forÃ§ar uso de sessao especÃ­fica
  * @param {boolean} opcoes.admin Indica se Ã© um admin do jogo
  */
	function Jogo(player, dadosSala, opcoes) {
		_classCallCheck(this, Jogo);

		var _this = _possibleConstructorReturn(this, (Jogo.__proto__ || Object.getPrototypeOf(Jogo)).call(this));

		_this._opcoes = Object.assign({
			base: '',
			sessao: '',
			admin: false
		}, opcoes);

		_this._player = player;
		_this._desenho = player.desenho;
		_this._conexao = new _conexao2.default({
			base: _this._opcoes.base,
			timeout: 6000,
			removerCache: true,
			sessao: _this._opcoes.sessao
		});
		_this._dadosSala = dadosSala;

		//globais para manipulaÃ§Ã£o do jogo
		_this._vez = false;
		_this._intervalo = false;
		_this._resposta = '';
		_this._inicioVez = false;
		_this._desenhistaVez = '';
		_this._acertaram = false;
		_this._listaUsuarios = [];
		_this._listaIgnorados = [];
		_this._dadosDesenho = '';
		_this._seqDesenho = '';
		_this._arrProximos = [];
		_this._rankOn = 0;
		_this._floodMsg = ['', ''];
		_this._floodResp = ['', ''];
		_this._numConversaPend = 0;
		_this._jogadoresOrdem = 0;
		_this._inicioJogo = false;
		_this._denunciaLista = [];
		_this._avisoInativo = false;

		_this._desenho.on('startDraw', function () {
			if (!_this._inicioVez) {
				_this._inicioVez = true;
				_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', _this).call(_this, 'inicioVez');

				if (_this._vez) _this.desenhar();
			}
		});
		//repassando codigos gerados ao desenhar na sua vez
		_this._desenho.on('codigo', function (codigo) {
			if (_this._vez) {
				var partes = codigo.split('@');
				_this._requisicao(partes[0], partes[1]);
			}
		});

		//iniciando rotina de atualizaÃ§Ã£o
		_this._reqAtual = null;
		_this._reqEspera = [];
		_this._tempo = Date.now();
		_this._rotina = setInterval(function () {
			//checando inatividade
			if (Date.now() - _this._tempo > TEMPO_INATIVO && !_this._opcoes.admin) _this.sair(2);else {
				//aviso de inatividade
				if (Date.now() - _this._tempo > TEMPO_INATIVO / 4 * 3 && !_this._avisoInativo && !_this._opcoes.admin) {
					_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', _this).call(_this, 'avisoInativo');
					_this._avisoInativo = true;
				}

				//consultando novidades caso nao haja elementos na fila de req
				if (!_this._reqAtual) _this._chamada(false, '');
			}
		}, 1000);
		return _this;
	}

	/**
  * Tratamento das requisiÃ§Ãµes internas ao Conexao
  *
  * @param {boolean} envio Indica se a requisiÃ§Ã£o Ã© uma consulta ou uma atualizaÃ§Ã£o
  * @param {string} conteudo Dados a serem transmitidos, caso seja uma atualizaÃ§Ã£o
  */


	_createClass(Jogo, [{
		key: '_chamada',
		value: function _chamada(envio, conteudo) {
			var _this2 = this;

			var url = void 0,
			    metodo = void 0,
			    param = void 0;
			if (!envio) {
				url = 'news.php';
				metodo = 'GET';
				param = '';
			} else {
				url = 'atualizar.php';
				metodo = 'POST';
				param = 'comando=' + conteudo;
				//atualizando tempo de inatividade
				this._tempo = Date.now();
			}

			this._reqAtual = {
				id: this._conexao.chamada(url + '?lastid=' + this._dadosSala.lastId, param, metodo, function (retorno) {
					//retorno vazio
					if (retorno && retorno != 'n') {
						//retorno valido
						retorno = retorno.split('@');
						if (retorno.length == 2 && !isNaN(parseInt(retorno[0]))) {
							retorno[0] = parseInt(retorno[0]);

							if (retorno[0] > _this2._dadosSala.lastId) {
								_this2._dadosSala.lastId = retorno[0];
								_this2._news(retorno[1]);
							}
						}
						//deslogando
						else if (retorno[0].substr(0, 2) == '--') _this2.sair(1);
					}

					//tratando fila de requisicoes
					_this2._reqAtual = null;
					if (_this2._reqEspera.length) {
						_this2._chamada(true, _this2._reqEspera.join('|'));
						_this2._reqEspera = [];
					}
				}),
				envio: envio
			};
		}

		/**
   * Metodo responsavel empilhar ou priorizar requisicoes
   *
   * @param {number} tipo Tipo de informaÃ§Ã£o a ser transmitida
   * @param {string} conteudo Dados referentes Ã  informaÃ§Ã£o
   */

	}, {
		key: '_requisicao',
		value: function _requisicao(tipo, conteudo) {
			conteudo = tipo + '@' + conteudo + '@' + this._dadosSala.send++;

			if (this._reqAtual) {
				if (!this._reqAtual.envio) {
					this._conexao.abortar(this._reqAtual.id, true);
					this._chamada(true, conteudo);
				} else this._reqEspera.push(conteudo);
			} else this._chamada(true, conteudo);
		}

		/**
   * Reforcando atividade
   */

	}, {
		key: 'ativar',
		value: function ativar() {
			if (this._avisoInativo) {
				this._tempo = Date.now();
				this._avisoInativo = false;
			}
		}

		/**
   * Envio de mensagem de chat
   *
   * @param {string} texto Mensagem a ser enviada
   * @returns {boolean} Indicador de envio bem sucedido
   */

	}, {
		key: 'mensagem',
		value: function mensagem(texto) {
			if (texto != this._floodMsg[0] || texto != this._floodMsg[1]) {
				this._floodMsg.shift();
				this._floodMsg.push(texto);
				this._requisicao(JOGO_CHAT, urlEncode(texto));
				return true;
			}
			return false;
		}

		/**
   * Envio de resposta do jogo
   *
   * @param {string} texto Resposta a ser enviada
   * @returns {boolean} Indicador de envio bem sucedido
   */

	}, {
		key: 'resposta',
		value: function resposta(texto) {
			if (texto != this._floodResp[0] || texto != this._floodResp[1]) {
				this._floodResp.shift();
				this._floodResp.push(texto);
				this._requisicao(JOGO_RESPOSTA, urlEncode(texto));
				return true;
			}
			return false;
		}

		/**
   * Desfazer a ultima aÃ§Ã£o desenhada
   *
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'desfazer',
		value: function desfazer() {
			if (this._vez && this._desenho.desfazer()) {
				this._requisicao(JOGO_DESFAZER, '0');

				return true;
			}
			return false;
		}

		/**
   * Refazer a ultima aÃ§Ã£o desenhada
   *
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'refazer',
		value: function refazer() {
			if (this._vez && this._desenho.refazer()) {
				this._requisicao(JOGO_DESFAZER, '1');

				return true;
			}
			return false;
		}

		/**
   * Enviar uma denuncia ao desenho que estÃ¡ sendo realizado
   *
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'denunciar',
		value: function denunciar() {
			if (!this._vez) {
				this._requisicao(JOGO_DENUNCIA, '');

				return true;
			}
			return false;
		}

		/**
   * Enviar uma denÃºncia a um usuÃ¡rio especÃ­fico
   *
   * @param {string} usuario Nick do usuÃ¡rio a ser denunciado
   * @param {string} texto Mensagem de justificativa da denunciado
   * @param {string} callback FunÃ§Ã£o a ser executada apÃ³s a denuncia ser efetivada
   * @returns {boolean} Se o usuÃ¡rio pode ser denunciado ou nÃ£o
   */

	}, {
		key: 'denunciarUsuario',
		value: function denunciarUsuario(usuario, texto, callback) {
			var timeBloq = this._denunciaLista[usuario.toLowerCase()];

			//verificando se jÃ¡ foi feita uma denuncia recentemente
			if (!timeBloq || Date.now() - timeBloq > 100000 || this._opcoes.admin) {
				this._conexao.chamada('denunciar_usuario_sala.php', 'nick=' + usuario + '&txt=' + urlEncode(texto), 'POST', function (retorno) {
					callback(parseInt(retorno));
				});
				//marcando usuario
				this._denunciaLista[usuario.toLowerCase()] = Date.now();
				return true;
			} else return false;
		}

		/**
   * Cancelar o desenho atual (admin)
   */

	}, {
		key: 'cancelarDesenho',
		value: function cancelarDesenho() {
			if (this._opcoes.admin) this._requisicao(JOGO_CANCELAR, '');
		}

		/**
   * Indicar que irÃ¡ desenhar
   *
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'desenhar',
		value: function desenhar() {
			if (this._vez) {
				this._requisicao(JOGO_INICIO, '1');

				return true;
			}
			return false;
		}

		/**
   * Enviar dica do desenho que estÃ¡ sendo realizado
   *
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'dica',
		value: function dica() {
			if (this._vez && !this._acertaram && this._dicas != -1) {
				this._requisicao(JOGO_DICA, this._dicas);
				this._dicas++;

				return true;
			}
			return false;
		}

		/**
   * Pulando a sua vez de desenhar
   *
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'pular',
		value: function pular() {
			if (this._vez && !this._acertaram) {
				this._requisicao(JOGO_PULAR, '');

				return true;
			}
			return false;
		}

		/**
   * Expulsando um jogador da sala (admin ou dono)
   *
   * @param {string} usuario UsuÃ¡rio a ser expulso
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'expulsar',
		value: function expulsar(usuario) {
			if (this._dadosSala.criador || this._opcoes.admin) {
				this._requisicao(JOGO_EXPULSAR, usuario);

				return true;
			}
			return false;
		}

		/**
   * Salvando o desenho realizado
   *
   * @param {function} callback FunÃ§Ã£o a ser executada apÃ³s o retorno do servidor
   * @returns {boolean} Indica se teve permissÃ£o para realizar a aÃ§Ã£o
   */

	}, {
		key: 'salvar',
		value: function salvar(callback) {
			if (this._dadosDesenho) {
				var dados = 'n=1&dados=' + this._dadosDesenho.substr(this._dadosDesenho.indexOf(',')) + '&seq=' + this._seqDesenho + '&palavra=' + urlEncode(this._resposta);

				this._conexao.chamada('salvar_img.php', dados, 'POST', function (retorno) {
					var partes = retorno.split('#');
					callback(parseInt(partes[1]), partes[2]);
				});

				return true;
			}
			return false;
		}

		/**
   * Saindo do jogo
   *
   * @param {number} tipo CÃ³digo referente ao tipo de saida
   */

	}, {
		key: 'sair',
		value: function sair(tipo) {
			var _this3 = this;

			this.destruir();

			this._conexao.chamada('saida.php', 'tipo=' + tipo + '&ajax=1', 'GET', function (retorno) {
				_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', _this3).call(_this3, 'sair', tipo, retorno);
			});
		}

		/**
   * Estabelecendo configuraÃ§Ãµes iniciais do desenho
   */

	}, {
		key: '_confPadrao',
		value: function _confPadrao() {
			this._desenho.mudaOpcao(0);
			this._desenho.mudaCor('x000000');
			this._desenho.mudaBorda(4);
			this._desenho.mudaAlpha(1);
		}

		/**
   * Finalizando a rodada
   *
   * @param {boolean} fimJogo Indica se esta no intervalo de fim do jogo
   */

	}, {
		key: '_fimRodada',
		value: function _fimRodada(fimJogo) {
			_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'fimRodada', fimJogo);

			this._vez = false;
			this._intervalo = true;
			this._desenho.liberar(false);
			this._player.zerar();
		}

		/**
   * Marcando o inicio do desenho da rodada
   */

	}, {
		key: '_iniciarDesenho',
		value: function _iniciarDesenho() {
			if (!this._inicioVez) {
				this._inicioVez = true;
				_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'inicioVez');
			}
		}

		/**
   * Interpretando lista de usuÃ¡rios
   *
   * @param {string} dados RelaÃ§Ã£o de usuarios da sala codificados
   */

	}, {
		key: '_lerUsuarios',
		value: function _lerUsuarios(dados) {
			this._listaUsuarios = [];
			var partes = dados.split('*');

			//formatando usuarios
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = partes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var usuario = _step.value;

					var infos = usuario.split('.');
					this._listaUsuarios.push({
						login: infos[0],
						avatar: parseInt(infos[7]),
						pontos: parseInt(infos[1]),
						vitorias: parseInt(infos[6]),
						status: parseInt(infos[2]),
						perfil: parseInt(infos[3]),
						tipo: parseInt(infos[4]),
						admin: parseInt(infos[5])
					});
				}

				//emitindo o evento com a lista de usuarios
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'usuarios', this._listaUsuarios);
		}

		/**
   * Interpretando lista de proximos a desenhar
   *
   * @param {string} dados RelaÃ§Ã£o de prÃ³ximos usuarios a desenhar
   */

	}, {
		key: '_lerProximos',
		value: function _lerProximos(dados) {
			this._arrProximos = dados.split('*');
			_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'proximos', this._arrProximos);
		}

		/**
   * Tratando o retorno das atualizaÃ§Ãµes do jogo
   *
   * @param {string} texto Dados compilados das Ãºltimas aÃ§Ãµes do jogo
   */

	}, {
		key: '_news',
		value: function _news(texto) {
			//nao iniciou o jogo
			if (!this._inicioJogo) this._player.direto = true;

			//verifica se existe algum retorno
			if (texto.length > 0 && this._desenho) {
				//dividindo as partes
				var partes = texto.split('|');

				if (partes[0] != '0') {
					//atualizando dados da lista de usuÃ¡rios
					this._lerUsuarios(partes[0]);
				}

				//removendo referencia de usuarios
				partes.splice(0, 1);

				//verificando cada parte
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = partes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var parte = _step2.value;

						//separando os detalhes
						var detalhes = parte.split('#');

						switch (parseInt(detalhes[0])) {
							case JOGO_DESENHO:
							case JOGO_LINHA:
							case JOGO_BALDE:
								this._iniciarDesenho();
							case JOGO_LIMPAR:
							case JOGO_COR:
							case JOGO_BORDA:
							case JOGO_ALPHA:
							case JOGO_DESFAZER:
							case JOGO_BORRACHA:
								this._player.registrar(detalhes);
								break;

							case JOGO_CHAT:
								{
									if (this._dadosSala.loginJogo.toLowerCase() == detalhes[1].toLowerCase()) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'chat', detalhes[2]);else if (!this._listaIgnorados[detalhes[1].toLowerCase()]) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'chatOutro', detalhes[1], detalhes[2]);
									break;
								}

							case JOGO_RESPOSTA:
								if (this._dadosSala.loginJogo.toLowerCase() == detalhes[1].toLowerCase()) {
									switch (parseInt(detalhes[3])) {
										case 1:
											_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'resposta', detalhes[2]);
											break;
										case 2:
											_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'invalido', detalhes[2]);
											break;
										case 3:
											_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'perto', detalhes[2]);
											break;
									}
								} else if (!this._listaIgnorados[detalhes[1].toLowerCase()]) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'respostaOutro', detalhes[1], detalhes[2]);

								break;

							case JOGO_VEZ_OUTRO:
								{
									this._player.iniciar();

									this._intervalo = false;
									this._rankOn = parseInt(detalhes[4]);
									if (this._rankOn < 2) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'rank', this._rankOn);
									this._confPadrao();
									this._desenho.salvarEstado(true);
									this._lerProximos(detalhes[3]);
									this._inicioVez = false;
									this._desenhistaVez = detalhes[2];
									this._dadosDesenho = '';
									this._resposta = '';

									_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'vezOutro', detalhes[2], detalhes[1]);
									break;
								}

							//CODIGO 10: VEZ DO USUARIO ATUAL
							case JOGO_VEZ:
								{
									this._vez = true;
									this._intervalo = false;
									this._rankOn = parseInt(detalhes[5]);
									if (this._rankOn < 2) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'rank', this._rankOn);
									this._desenho.limparTela(true, true);
									this._lerProximos(detalhes[4]);
									this._desenho.liberar(true);
									this._confPadrao();
									this._inicioVez = false;
									this._dadosDesenho = '';
									this._acertaram = false;
									this._resposta = detalhes[2];
									this._dicas = 0;

									_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'vez', detalhes[2], detalhes[1]);
									break;
								}

							case JOGO_INTERVALO:
								//gravando dados do desenho
								if (this._vez) {
									this._dadosDesenho = this._desenho.salvar();
									this._seqDesenho = this._desenho.sequencia;
								}

								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'intervalo', detalhes[1]);
								this._fimRodada();
								break;

							case JOGO_FIM:
								//gravando dados do desenho
								if (this._vez) {
									this._dadosDesenho = this._desenho.salvar();
									this._seqDesenho = this._desenho.sequencia;
								}

								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'rank', parseInt(detalhes[4]));

								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'intervalo', detalhes[5]);
								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'fimJogo', detalhes[1], detalhes[2]); //vencedor, pontos, resposta
								this._fimRodada(true);
								break;

							case JOGO_ENTRADA:
								//verificando alteraÃ§Ãµes no status de rank
								detalhes[3] = parseInt(detalhes[3]);
								if (detalhes[3] > 4) {
									_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'rank', true);
								} else {
									// verificar rank on inicio de rodada
									if (this._rankOn != 1) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'rank', false);
								}

								//entrada
								if (detalhes[1] == '1') _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'entrada', detalhes[2]);else {
									_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'saida', detalhes[2]);

									//saida
									this._lerProximos(detalhes[5]);
								}
								break;

							case JOGO_PULAR:
								if (detalhes[1] == '1') {
									_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'pular', detalhes[2]);
									this._fimRodada();
								}
								break;

							case JOGO_ACERTO:
								if (detalhes[3] != '6') _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'acertoOutro', detalhes[1]);else _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'acerto', detalhes[2]);

								if (detalhes[4] == '1') _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'todosAcertaram');

								if (this._vez && !this._acertaram) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'primeiroAcerto');

								this._acertaram = true;
								break;

							case JOGO_DICA:
								{
									if (detalhes[1] != 'x') {
										var contaLetras = detalhes[1].replace(/\s\./g, '').length / 2;
										var dados = detalhes[1].trim().toUpperCase().replace(/\s/g, '*').replace(/\./g, ' ');

										_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'dica', dados.split('*'), contaLetras, this._resposta);
									} else {
										this._dicas = -1;
										_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'dicaFim');
									}
									break;
								}

							case JOGO_CANCELAR:
							case JOGO_DENUNCIA:
								if (parseInt(detalhes[0]) == 20) _get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'denuncia', detalhes[1] == '2', detalhes[2]);

								if (detalhes[3] == '1') {
									_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'cancelar');
									this._fimRodada();
								}
								break;

							case JOGO_INATIVO:
								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'inativo');
								this._fimRodada();
								break;

							case JOGO_AGUARDANDO:
								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'aguardando');
								break;

							case JOGO_MENSAGEM:
								_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'mensagem', parseInt(detalhes[1]), detalhes[2]);
								break;

							case JOGO_INICIO:
								this._iniciarDesenho();
								break;
						}

						//inicio carregando
						if (!this._inicioJogo) {
							_get(Jogo.prototype.__proto__ || Object.getPrototypeOf(Jogo.prototype), 'emit', this).call(this, 'iniciar', this._dadosSala.cookieAviso);

							//inserindo animacao no desenho
							this._player.direto = false;

							//retirando marcador
							this._inicioJogo = true;
						}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}
		}

		/**
   * Removendo todas as rotinas da classe
   */

	}, {
		key: 'destruir',
		value: function destruir() {
			this._desenho.remover();
			clearInterval(this._rotina);
			if (this._reqAtual) this._conexao.abortar(this._reqAtual.id, true);
		}

		/**
   * Retorna se o usuÃ¡rio estÃ¡ marcado como admin
   * @type {boolean}
   */

	}, {
		key: 'admin',
		get: function get() {
			return this._opcoes.admin;
		}

		/**
   * Obtem o nick do criador da sala
   * @type {string}
   */

	}, {
		key: 'criador',
		get: function get() {
			return this._dadosSala.criador;
		}

		/**
   * Obtem o nick do desenhista da vez
   * @type {string}
   */

	}, {
		key: 'desenhistaVez',
		get: function get() {
			return this._desenhistaVez;
		}

		/**
   * Obtem o indicador se o desenho da rodada jÃ¡ foi iniciado
   * @type {boolean}
   */

	}, {
		key: 'inicioVez',
		get: function get() {
			return this._inicioVez;
		}

		/**
   * Obtem o login prÃ³prio do usuario
   * @type {string}
   */

	}, {
		key: 'loginJogo',
		get: function get() {
			return this._dadosSala.loginJogo;
		}

		/**
   * Obtem o limite de usuÃ¡rios da sala
   * @type {number}
   */

	}, {
		key: 'maxJogadores',
		get: function get() {
			return this._dadosSala.maxJogadores;
		}

		/**
   * Retorna o tipo da sala (cadastrado, nao-cadastrados ou todos)
   * @type {number}
   */

	}, {
		key: 'naoCadastrados',
		get: function get() {
			return this._dadosSala.naoCadastrados;
		}

		/**
   * Retorna o ID da sala
   * @type {number}
   */

	}, {
		key: 'sala',
		get: function get() {
			return this._dadosSala.sala;
		}

		/**
   * Retorna se a sala Ã© fixa
   * @type {boolean}
   */

	}, {
		key: 'salaFixa',
		get: function get() {
			return this._dadosSala.salaFixa;
		}

		/**
   * Retorna o nome da sala
   * @type {string}
   */

	}, {
		key: 'salaNome',
		get: function get() {
			return this._dadosSala.salaNome;
		}

		/**
   * Retorna se a sala Ã© visÃ­vel
   * @type {boolean}
   */

	}, {
		key: 'salaVisivel',
		get: function get() {
			return this._dadosSala.salaVisivel;
		}

		/**
   * Obtem a senha da sala
   * @type {string}
   */

	}, {
		key: 'senha',
		get: function get() {
			return this._dadosSala.salaSenha;
		}

		/**
   * Obtem o tempo de intervalo do jogo em segundos
   * @type {number}
   */

	}, {
		key: 'tempoIntervalo',
		get: function get() {
			return this._dadosSala.tempoIntervalo;
		}

		/**
   * Obtem o tempo da rodada do jogo em segundos
   * @type {number}
   */

	}, {
		key: 'tempoRodada',
		get: function get() {
			return this._dadosSala.tempoRodada;
		}

		/**
   * Obtem o indicador se o jogo estÃ¡ no intervalo
   * @type {boolean}
   */

	}, {
		key: 'intervalo',
		get: function get() {
			return this._intervalo;
		}

		/**
   * Obtem o indicador se Ã© a vez do usuÃ¡rio de desenhar
   * @type {boolean}
   */

	}, {
		key: 'vez',
		get: function get() {
			return this._vez;
		}
	}]);

	return Jogo;
}(_eventos2.default);

function urlEncode(str) {
	var hex_chars = '0123456789ABCDEF';
	var noEncode = /^([a-zA-Z0-9\_\-\.])$/;
	var n = void 0,
	    strCode = void 0,
	    hex1 = void 0,
	    hex2 = void 0,
	    strEncode = '';

	for (n = 0; n < str.length; n++) {
		if (noEncode.test(str.charAt(n))) {
			strEncode += str.charAt(n);
		} else {
			strCode = str.charCodeAt(n);
			hex1 = hex_chars.charAt(Math.floor(strCode / 16));
			hex2 = hex_chars.charAt(strCode % 16);
			strEncode += '%' + (hex1 + hex2);
		}
	}
	return strEncode;
}

exports.default = Jogo;
},{"conexao":330,"eventos":324}],330:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],331:[function(require,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],332:[function(require,module,exports){
/*global define:false */
/**
 * Copyright 2012-2017 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.6.1
 * @url craig.is/killing/mice
 */
(function(window, document, undefined) {

    // Check if mousetrap is used inside browser, if not, return
    if (!window) {
        return;
    }

    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'ins',
        46: 'del',
        91: 'meta',
        93: 'meta',
        224: 'meta'
    };

    /**
     * mapping for special characters so they can support
     *
     * this dictionary is only used incase you want to bind a
     * keyup or keydown event to one of these keys
     *
     * @type {Object}
     */
    var _KEYCODE_MAP = {
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111 : '/',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };

    /**
     * this is a mapping of keys that require shift on a US keypad
     * back to the non shift equivelents
     *
     * this is so you can use keyup events with these keys
     *
     * note that this will only work reliably on US keyboards
     *
     * @type {Object}
     */
    var _SHIFT_MAP = {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        ':': ';',
        '\"': '\'',
        '<': ',',
        '>': '.',
        '?': '/',
        '|': '\\'
    };

    /**
     * this is a list of special strings you can use to map
     * to modifier keys when you specify your keyboard shortcuts
     *
     * @type {Object}
     */
    var _SPECIAL_ALIASES = {
        'option': 'alt',
        'command': 'meta',
        'return': 'enter',
        'escape': 'esc',
        'plus': '+',
        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
    };

    /**
     * variable to store the flipped version of _MAP from above
     * needed to check if we should use keypress or not when no action
     * is specified
     *
     * @type {Object|undefined}
     */
    var _REVERSE_MAP;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {

        // This needs to use a string cause otherwise since 0 is falsey
        // mousetrap will never fire for numpad 0 pressed as part of a keydown
        // event.
        //
        // @see https://github.com/ccampbell/mousetrap/pull/258
        _MAP[i + 96] = i.toString();
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }

            return character;
        }

        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * prevents default for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    }

    /**
     * stops propogation for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }

        e.cancelBubble = true;
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * Converts from a string key combination to an array
     *
     * @param  {string} combination like "command+shift+l"
     * @return {Array}
     */
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }

        combination = combination.replace(/\+{2}/g, '+plus');
        return combination.split('+');
    }

    /**
     * Gets info for a specific key combination
     *
     * @param  {string} combination key combination ("command+s" or "a" or "*")
     * @param  {string=} action
     * @returns {Object}
     */
    function _getKeyInfo(combination, action) {
        var keys;
        var key;
        var i;
        var modifiers = [];

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = _keysFromString(combination);

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        return {
            key: key,
            modifiers: modifiers,
            action: action
        };
    }

    function _belongsTo(element, ancestor) {
        if (element === null || element === document) {
            return false;
        }

        if (element === ancestor) {
            return true;
        }

        return _belongsTo(element.parentNode, ancestor);
    }

    function Mousetrap(targetElement) {
        var self = this;

        targetElement = targetElement || document;

        if (!(self instanceof Mousetrap)) {
            return new Mousetrap(targetElement);
        }

        /**
         * element to attach key events to
         *
         * @type {Element}
         */
        self.target = targetElement;

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        self._callbacks = {};

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        self._directMap = {};

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        var _sequenceLevels = {};

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        var _resetTimer;

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        var _ignoreNextKeyup = false;

        /**
         * temporary state where we will ignore the next keypress
         *
         * @type {boolean}
         */
        var _ignoreNextKeypress = false;

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        var _nextExpectedAction = false;

        /**
         * resets all sequence counters except for the ones passed in
         *
         * @param {Object} doNotReset
         * @returns void
         */
        function _resetSequences(doNotReset) {
            doNotReset = doNotReset || {};

            var activeSequences = false,
                key;

            for (key in _sequenceLevels) {
                if (doNotReset[key]) {
                    activeSequences = true;
                    continue;
                }
                _sequenceLevels[key] = 0;
            }

            if (!activeSequences) {
                _nextExpectedAction = false;
            }
        }

        /**
         * finds all callbacks that match based on the keycode, modifiers,
         * and action
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event|Object} e
         * @param {string=} sequenceName - name of the sequence we are looking for
         * @param {string=} combination
         * @param {number=} level
         * @returns {Array}
         */
        function _getMatches(character, modifiers, e, sequenceName, combination, level) {
            var i;
            var callback;
            var matches = [];
            var action = e.type;

            // if there are no events related to this keycode
            if (!self._callbacks[character]) {
                return [];
            }

            // if a modifier key is coming up on its own we should allow it
            if (action == 'keyup' && _isModifier(character)) {
                modifiers = [character];
            }

            // loop through all callbacks for the key that was pressed
            // and see if any of them match
            for (i = 0; i < self._callbacks[character].length; ++i) {
                callback = self._callbacks[character][i];

                // if a sequence name is not specified, but this is a sequence at
                // the wrong level then move onto the next match
                if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                    continue;
                }

                // if the action we are looking for doesn't match the action we got
                // then we should keep going
                if (action != callback.action) {
                    continue;
                }

                // if this is a keypress event and the meta key and control key
                // are not pressed that means that we need to only look at the
                // character, otherwise check the modifiers as well
                //
                // chrome will not fire a keypress if meta or control is down
                // safari will fire a keypress if meta or meta+shift is down
                // firefox will fire a keypress if meta or control is down
                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

                    // when you bind a combination or sequence a second time it
                    // should overwrite the first one.  if a sequenceName or
                    // combination is specified in this call it does just that
                    //
                    // @todo make deleting its own method?
                    var deleteCombo = !sequenceName && callback.combo == combination;
                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                    if (deleteCombo || deleteSequence) {
                        self._callbacks[character].splice(i, 1);
                    }

                    matches.push(callback);
                }
            }

            return matches;
        }

        /**
         * actually calls the callback function
         *
         * if your callback function returns false this will use the jquery
         * convention - prevent default and stop propogation on the event
         *
         * @param {Function} callback
         * @param {Event} e
         * @returns void
         */
        function _fireCallback(callback, e, combo, sequence) {

            // if this event should not happen stop here
            if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
                return;
            }

            if (callback(e, combo) === false) {
                _preventDefault(e);
                _stopPropagation(e);
            }
        }

        /**
         * handles a character key event
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event} e
         * @returns void
         */
        self._handleKey = function(character, modifiers, e) {
            var callbacks = _getMatches(character, modifiers, e);
            var i;
            var doNotReset = {};
            var maxLevel = 0;
            var processedSequenceCallback = false;

            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
                }
            }

            // loop through matching callbacks for this key event
            for (i = 0; i < callbacks.length; ++i) {

                // fire for all sequence callbacks
                // this is because if for example you have multiple sequences
                // bound such as "g i" and "g t" they both need to fire the
                // callback for matching g cause otherwise you can only ever
                // match the first one
                if (callbacks[i].seq) {

                    // only fire callbacks for the maxLevel to prevent
                    // subsequences from also firing
                    //
                    // for example 'a option b' should not cause 'option b' to fire
                    // even though 'option b' is part of the other sequence
                    //
                    // any sequences that do not match here will be discarded
                    // below by the _resetSequences call
                    if (callbacks[i].level != maxLevel) {
                        continue;
                    }

                    processedSequenceCallback = true;

                    // keep a list of which sequences were matches for later
                    doNotReset[callbacks[i].seq] = 1;
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                    continue;
                }

                // if there were no sequence matches but we are still here
                // that means this is a regular match so we should fire that
                if (!processedSequenceCallback) {
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }

            // if the key you pressed matches the type of sequence without
            // being a modifier (ie "keyup" or "keypress") then we should
            // reset all sequences that were not matched by this event
            //
            // this is so, for example, if you have the sequence "h a t" and you
            // type "h e a r t" it does not match.  in this case the "e" will
            // cause the sequence to reset
            //
            // modifier keys are ignored because you can have a sequence
            // that contains modifiers such as "enter ctrl+space" and in most
            // cases the modifier key will be pressed before the next key
            //
            // also if you have a sequence such as "ctrl+b a" then pressing the
            // "b" key will trigger a "keypress" and a "keydown"
            //
            // the "keydown" is expected when there is a modifier, but the
            // "keypress" ends up matching the _nextExpectedAction since it occurs
            // after and that causes the sequence to reset
            //
            // we ignore keypresses in a sequence that directly follow a keydown
            // for the same character
            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                _resetSequences(doNotReset);
            }

            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
        };

        /**
         * handles a keydown event
         *
         * @param {Event} e
         * @returns void
         */
        function _handleKeyEvent(e) {

            // normalize e.which for key events
            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }

            var character = _characterFromEvent(e);

            // no character found then stop
            if (!character) {
                return;
            }

            // need to use === for the character check because the character can be 0
            if (e.type == 'keyup' && _ignoreNextKeyup === character) {
                _ignoreNextKeyup = false;
                return;
            }

            self.handleKey(character, _eventModifiers(e), e);
        }

        /**
         * called to set a 1 second timeout on the specified sequence
         *
         * this is so after each key press in the sequence you have 1 second
         * to press the next key before you have to start over
         *
         * @returns void
         */
        function _resetSequenceTimer() {
            clearTimeout(_resetTimer);
            _resetTimer = setTimeout(_resetSequences, 1000);
        }

        /**
         * binds a key sequence to an event
         *
         * @param {string} combo - combo specified in bind call
         * @param {Array} keys
         * @param {Function} callback
         * @param {string=} action
         * @returns void
         */
        function _bindSequence(combo, keys, callback, action) {

            // start off by adding a sequence level record for this combination
            // and setting the level to 0
            _sequenceLevels[combo] = 0;

            /**
             * callback to increase the sequence level for this sequence and reset
             * all other sequences that were active
             *
             * @param {string} nextAction
             * @returns {Function}
             */
            function _increaseSequence(nextAction) {
                return function() {
                    _nextExpectedAction = nextAction;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                };
            }

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @param {Event} e
             * @returns void
             */
            function _callbackAndReset(e) {
                _fireCallback(callback, e, combo);

                // we should ignore the next key up if the action is key down
                // or keypress.  this is so if you finish a sequence and
                // release the key the final key will not trigger a keyup
                if (action !== 'keyup') {
                    _ignoreNextKeyup = _characterFromEvent(e);
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            }

            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            //
            // if an action is specified in the original bind call then that will
            // be used throughout.  otherwise we will pass the action that the
            // next key in the sequence should match.  this allows a sequence
            // to mix and match keypress and keydown events depending on which
            // ones are better suited to the key provided
            for (var i = 0; i < keys.length; ++i) {
                var isFinal = i + 1 === keys.length;
                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                _bindSingle(keys[i], wrappedCallback, action, combo, i);
            }
        }

        /**
         * binds a single keyboard combination
         *
         * @param {string} combination
         * @param {Function} callback
         * @param {string=} action
         * @param {string=} sequenceName - name of sequence if part of sequence
         * @param {number=} level - what part of the sequence the command is
         * @returns void
         */
        function _bindSingle(combination, callback, action, sequenceName, level) {

            // store a direct mapped reference for use with Mousetrap.trigger
            self._directMap[combination + ':' + action] = callback;

            // make sure multiple spaces in a row become a single space
            combination = combination.replace(/\s+/g, ' ');

            var sequence = combination.split(' ');
            var info;

            // if this pattern is a sequence of keys then run through this method
            // to reprocess each pattern one key at a time
            if (sequence.length > 1) {
                _bindSequence(combination, sequence, callback, action);
                return;
            }

            info = _getKeyInfo(combination, action);

            // make sure to initialize array if this is the first time
            // a callback is added for this key
            self._callbacks[info.key] = self._callbacks[info.key] || [];

            // remove an existing match if there is one
            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

            // add this call back to the array
            // if it is a sequence put it at the beginning
            // if not put it at the end
            //
            // this is important because the way these are processed expects
            // the sequence ones to come first
            self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: info.modifiers,
                action: info.action,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        }

        /**
         * binds multiple combinations to the same callback
         *
         * @param {Array} combinations
         * @param {Function} callback
         * @param {string|undefined} action
         * @returns void
         */
        self._bindMultiple = function(combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                _bindSingle(combinations[i], callback, action);
            }
        };

        // start!
        _addEvent(targetElement, 'keypress', _handleKeyEvent);
        _addEvent(targetElement, 'keydown', _handleKeyEvent);
        _addEvent(targetElement, 'keyup', _handleKeyEvent);
    }

    /**
     * binds an event to mousetrap
     *
     * can be a single key, a combination of keys separated with +,
     * an array of keys, or a sequence of keys separated by spaces
     *
     * be sure to list the modifier keys first to make sure that the
     * correct key ends up getting bound (the last key in the pattern)
     *
     * @param {string|Array} keys
     * @param {Function} callback
     * @param {string=} action - 'keypress', 'keydown', or 'keyup'
     * @returns void
     */
    Mousetrap.prototype.bind = function(keys, callback, action) {
        var self = this;
        keys = keys instanceof Array ? keys : [keys];
        self._bindMultiple.call(self, keys, callback, action);
        return self;
    };

    /**
     * unbinds an event to mousetrap
     *
     * the unbinding sets the callback function of the specified key combo
     * to an empty function and deletes the corresponding key in the
     * _directMap dict.
     *
     * TODO: actually remove this from the _callbacks dictionary instead
     * of binding an empty function
     *
     * the keycombo+action has to be exactly the same as
     * it was defined in the bind method
     *
     * @param {string|Array} keys
     * @param {string} action
     * @returns void
     */
    Mousetrap.prototype.unbind = function(keys, action) {
        var self = this;
        return self.bind.call(self, keys, function() {}, action);
    };

    /**
     * triggers an event that has already been bound
     *
     * @param {string} keys
     * @param {string=} action
     * @returns void
     */
    Mousetrap.prototype.trigger = function(keys, action) {
        var self = this;
        if (self._directMap[keys + ':' + action]) {
            self._directMap[keys + ':' + action]({}, keys);
        }
        return self;
    };

    /**
     * resets the library back to its initial state.  this is useful
     * if you want to clear out the current keyboard shortcuts and bind
     * new ones - for example if you switch to another page
     *
     * @returns void
     */
    Mousetrap.prototype.reset = function() {
        var self = this;
        self._callbacks = {};
        self._directMap = {};
        return self;
    };

    /**
     * should we stop this event before firing off callbacks
     *
     * @param {Event} e
     * @param {Element} element
     * @return {boolean}
     */
    Mousetrap.prototype.stopCallback = function(e, element) {
        var self = this;

        // if the element has the class "mousetrap" then no need to stop
        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
            return false;
        }

        if (_belongsTo(element, self.target)) {
            return false;
        }

        // stop for input, select, and textarea
        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
    };

    /**
     * exposes _handleKey publicly so it can be overwritten by extensions
     */
    Mousetrap.prototype.handleKey = function() {
        var self = this;
        return self._handleKey.apply(self, arguments);
    };

    /**
     * allow custom key mappings
     */
    Mousetrap.addKeycodes = function(object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                _MAP[key] = object[key];
            }
        }
        _REVERSE_MAP = null;
    };

    /**
     * Init the global mousetrap functions
     *
     * This method is needed to allow the global mousetrap functions to work
     * now that mousetrap is a constructor function.
     */
    Mousetrap.init = function() {
        var documentMousetrap = Mousetrap(document);
        for (var method in documentMousetrap) {
            if (method.charAt(0) !== '_') {
                Mousetrap[method] = (function(method) {
                    return function() {
                        return documentMousetrap[method].apply(documentMousetrap, arguments);
                    };
                } (method));
            }
        }
    };

    Mousetrap.init();

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;

    // expose as a common js module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Mousetrap;
    }

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Mousetrap;
        });
    }
}) (typeof window !== 'undefined' ? window : null, typeof  window !== 'undefined' ? document : null);

},{}],333:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],334:[function(require,module,exports){
'use strict';

/**
 * Remove as letras repetidas de um texto
 *
 * @param  {string} str Texto a ser analizado
 * @return {string} Texto sem repetiÃ§Ãµes
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});
function semRepeticao(str) {
	var strNovo = '';
	var ultimaLetra = '';

	for (var cont = 0; cont < str.length; cont++) {
		if (str.charAt(cont) != ultimaLetra) {
			ultimaLetra = str.charAt(cont);
			strNovo += ultimaLetra;
		}
	}

	return strNovo;
}

/**
 * Verificar se texto Ã© ofensivo
 *
 * @param {string} str - Texto a ser verificado se Ã© ou nÃ£o ofensa
 * @return {boolean} Indica se o texto Ã© ou nÃ£o ofensivo
 */
function ofensa(str) {
	//retirando espacos seguidos e deixando minusculo
	str = str.trim().toLowerCase().replace(/\s+/g, ' ');

	//retirando acentos
	str = str.replace(/[Ã¡Ã Ã¢Ã£Ã¤ÃÃ€Ã‚ÃƒÃ„4]/g, 'a');
	str = str.replace(/[Ã©Ã¨ÃªÃ«Ã‰ÃˆÃŠÃ‹3]/g, 'e');
	str = str.replace(/[Ã­Ã¬Ã®Ã¯ÃÃŒÃŽÃ1y]/g, 'i');
	str = str.replace(/[Ã³Ã²Ã´ÃµÃ¶Ã“Ã’Ã”Ã•Ã–0]/g, 'o');
	str = str.replace(/[ÃºÃ¹Ã»Ã¼ÃšÃ™Ã›Ãœ]/g, 'u');
	str = str.replace(/[Ã±Ã‘]/g, 'n');
	str = str.replace(/[Ã§Ã‡]/g, 'c');
	str = str.replace(/[5]/g, 's');
	str = str.replace(/[^a-zA-Z ]/g, '');

	//verificando ofensa por simbolo
	//let expSimb = new RegExp("(^|[ ])_|_([ ]|$)");
	//if(expSimb.test(str)) return true;

	//retirando letras repetidas
	var strNovo = semRepeticao(str);

	var strComEspaco1 = strNovo.replace(/[^a-zA-Z\s]/g, ' '); //pontuacao considerada como espaco
	var strComEspaco2 = strNovo.replace(/[^a-zA-Z\s]/g, ''); //pontuacao considerada diretamente
	var strSemEspaco = strNovo.replace(/[^a-zA-Z]/g, ''); //retirando todo e qualquer espaco

	var strRepComEspaco1 = str.replace(/[^a-zA-Z\s]/g, ' '); //pontuacao considerada como espaco
	var strRepComEspaco2 = str.replace(/[^a-zA-Z\s]/g, ''); //pontuacao considerada diretamente
	var strRepSemEspaco = str.replace(/[^a-zA-Z]/g, ''); //retirando todo e qualquer espaco

	var expComEspaco = new RegExp('(^|[ ])(estrupar|estuprar|estupro|estrupo|orgia|esperma|cuzinho|sexo|porno|fuck|cu|ku|cacete|brocha|pora|viado|puta|putas|biba|tnc|vtnc|pqp|fdp|otario|otaria|bct|wtf|idiota|corno|corna|trepa|trepar|transar|vagaba|vagabas|broxa|troxa|trouxa|merda|vsf|viadin|bosta|bostas|vadea|vadia|vadias|kacete|cacete|retardado|retardada|kct|foder|babaca|pnc|burra|cusao|putona|nude|nudes|piroca|fuder)([ ]|$)');
	var expSemEspaco = new RegExp('(restodeaborto|comeramae|comerasua|cumeramae|cumerasua|umanal|fodace|fodasi|vaghabunda|chupaminhabola|chupaminhasbola|euanus|tecomer|prexeca|precheca|pepeca|pepeka|mandanude|suaperereca|suaperereka|tefuder|tefoder|sefoder|sefuder|seudemente|suademente|gozeino|gozeina|fazerorgia|fazerumaorgia|metenoseucu|meternoseucu|meternocu|metenocu|suastetas|suateta|seusmamilo|seumamilo|redtube|pornhub|xvideos|tomanocu|tomarnocu|tomanucu|tomarnucu|putaquepari|putaqpari|pirocudo|daocu|darocu|paunocu|pintonocu|caralho|kralho|karalho|buceta|boceta|fidaputa|filhodaput|filhodput|filhadaput|filhadput|suaputa|biscate|merdinha|chupameup|chupaminhar|mechupa|boquete|boqueteir|bokete|boketeir|meupau|meupinto|meupenis|minharola|fodase|fodasse|uapiranha|vagina|penis|seubiba|suabiba|eubicha|uabicha|mabiba|mabicha|mbiba|mbicha|traveco|cuzao|prostituta|comisuabu|comiasuabu|comiseucu|comioseucu|vaisefud|vaisefer|vaisefod|vaicfud|vaicfer|vaicfod|paunocu|paunabu|paunaboc|masturba|punheta|punheteir|imbecil|bucetinha|sucker|bostinha|embecil|vagabundo|vagabunda|putinha|xoxota|meutoba)');

	var expRepComEspaco = new RegExp('(^|[ ])(ppk)([ ]|$)');
	var expRepSemEspaco = new RegExp('(ppkinha)');

	return expComEspaco.test(strComEspaco1) || expComEspaco.test(strComEspaco2) || expSemEspaco.test(strSemEspaco) || expRepComEspaco.test(strRepComEspaco1) || expRepComEspaco.test(strRepComEspaco2) || expRepSemEspaco.test(strRepSemEspaco);
}

exports.semRepeticao = semRepeticao;
exports.default = ofensa;
},{}],335:[function(require,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],336:[function(require,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],337:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],338:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _eventos = require('eventos');

var _eventos2 = _interopRequireDefault(_eventos);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Classe para o tratamento de animaÃ§Ãµes passo-a-passo de desenhos do Gartic
 */
var Player = function (_Eventos) {
	_inherits(Player, _Eventos);

	/**
  * Construtor da classe, instanciando variÃ¡veis de controle
  *
  * @param {Desenho} desenho Objeto do desenho a ser utilizado para reproduÃ§Ã£o
  * @param {Object} opcoes ConfiguraÃ§Ãµes do Objeto
  * @param {boolean} opcoes.baldeFragmentado Indica se deve considerar fragmentaÃ§Ã£o de balde
  */
	function Player(desenho, opcoes) {
		_classCallCheck(this, Player);

		var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this));

		_this._opcoes = Object.assign({
			baldeFragmentado: true
		}, opcoes);

		_this._desenho = desenho;
		_this._fracao = 9;
		_this._ativo = false;
		_this._partesDesenho = [];
		_this._animacao = false;
		_this._contagem = 0;
		_this._pendente = false;
		_this._cacheBalde = '';
		_this._direto = false;
		_this._removerDireto = false;
		_this._ultimoTempo;
		_this._dif = 0;
		_this._posicao = 0;
		return _this;
	}

	/**
  * Altera o marcador de executar as aÃ§Ãµes instantÃ¢neamente (sem animaÃ§Ã£o)
  *
  * @param {boolean} val Indica se exibe o desenho com ou sem animaÃ§Ã£o
  */


	_createClass(Player, [{
		key: 'registrar',


		/**
   * Adicionando novas informaÃ§Ãµes de desenho a serem exibidas
   *
   * @param {Array|string} detalhes Dados do desenho
   */
		value: function registrar(detalhes) {
			var _this2 = this;

			if (typeof detalhes != 'string') this._partesDesenho.push(detalhes);else {
				var partes = detalhes.split('|');
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = partes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var parte = _step.value;

						var dados = parte.split('@');

						if (dados.length == 2) {
							var formatado = dados[1].split('#');
							formatado.unshift(dados[0]);
							this._partesDesenho.push(formatado);
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}

			//voltando a animacao caso esteja paralizado
			if (this._ativo && !this._animacao) {
				this._ultimoTempo = Date.now();
				this._animacao = requestAnimationFrame(function () {
					_this2._rotina();
				});
			}
		}

		/**
   * Adiciona indicador para aplicar animaÃ§Ã£o apÃ³s desenhos pendentes
   */

	}, {
		key: 'removerDireto',
		value: function removerDireto() {
			this._removerDireto = true;
		}

		/**
   * Zerando o desenho realizado atÃ© entÃ£o e parando a animaÃ§Ã£o
   */

	}, {
		key: 'zerar',
		value: function zerar() {
			this.parar();
			this._partesDesenho = [];
		}

		/**
   * Inicia a animaÃ§Ã£o do desenho
   */

	}, {
		key: 'iniciar',
		value: function iniciar() {
			var _this3 = this;

			_get(Player.prototype.__proto__ || Object.getPrototypeOf(Player.prototype), 'emit', this).call(this, 'iniciar');
			this._ativo = true;
			this._ultimoTempo = Date.now();
			this._animacao = requestAnimationFrame(function () {
				_this3._rotina();
			});
		}

		/**
   * Pausa a animaÃ§Ã£o do desenho, mantendo o progresso de execuÃ§Ã£o atual
   *
   * @param {boolean} repasse Indica se o evento de pausa deve ser emitido
   */

	}, {
		key: 'pausar',
		value: function pausar() {
			var repasse = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this._cancelarAnimacao();
			this._ativo = false;
			if (!repasse) _get(Player.prototype.__proto__ || Object.getPrototypeOf(Player.prototype), 'emit', this).call(this, 'pausar');
		}

		/**
   * Para a animaÃ§Ã£o do desenho, retornando a mesma para o inicio
   */

	}, {
		key: 'parar',
		value: function parar() {
			this.pausar(true);
			this._desenho.limparTela(false, true); //limpa tela sem enviar ajax
			this._posicao = 0;
			this._contagem = 0;
			this._dif = 0;
			this._cacheBalde = '';
			this._pendente = false;
			_get(Player.prototype.__proto__ || Object.getPrototypeOf(Player.prototype), 'emit', this).call(this, 'parar');
		}

		/**
   * ForÃ§ando com que traÃ§os pendentes finalizem
   */

	}, {
		key: 'flush',
		value: function flush() {
			this._desenhar(this._pendente, 0, true);
			this._pendente = false;
		}

		/**
   * Cancela animacao enquanto
   */

	}, {
		key: '_cancelarAnimacao',
		value: function _cancelarAnimacao() {
			if (this._animacao) {
				cancelAnimationFrame(this._animacao);
				this._animacao = false;
			}
		}

		/**
   * Controle da animaÃ§Ã£o por fraÃ§Ã£o de tempo liberada pelo Animation Frame
   */

	}, {
		key: '_rotina',
		value: function _rotina() {
			var _this4 = this;

			if (!this._ativo) return;

			//dando os passos
			this._dif += Date.now() - this._ultimoTempo;
			var retorno = void 0;
			while (this._dif >= this._fracao) {
				retorno = this._passo();
				if (retorno) this._dif -= this._fracao;else {
					this._dif = this._dif % this._fracao;
					_get(Player.prototype.__proto__ || Object.getPrototypeOf(Player.prototype), 'emit', this).call(this, 'fim');
					break;
				}
			}

			//remocao de direto pendente
			if (this._removerDireto) {
				this._direto = false;
				this._removerDireto = false;
			}

			// encaminhando para proxima rotina
			if (this._ativo && this._animacao) {
				this._ultimoTempo = Date.now();
				this._animacao = requestAnimationFrame(function () {
					_this4._rotina();
				});
			}
		}

		/**
   * Executando um passo de animaÃ§Ã£o
   *
   * @returns {boolean} Desenho realizado ou ausÃªncia de desenho para executar
   */

	}, {
		key: '_passo',
		value: function _passo() {
			if (this._posicao < this._partesDesenho.length) {
				var detalhes = this._partesDesenho[this._posicao];

				//checando complemento de tracos
				if (this._contagem == 0 && this._pendente && detalhes.length > 3 && this._pendente.length > 3 && detalhes[0] == 2 && detalhes[1] == this._pendente[this._pendente.length - 2] && detalhes[2] == this._pendente[this._pendente.length - 1]) {
					this._contagem = (this._pendente.length - 1) / 2 + 1;
					detalhes = this._pendente.concat(detalhes.slice(3));
					this._partesDesenho.splice(this._posicao--, 1);
					this._partesDesenho[this._posicao] = detalhes;
					this._pendente = false;
				} else if (this._pendente) this.flush();

				//desenhando na tela
				if (this._desenhar(detalhes, this._contagem)) {
					//marcar como pendente apenas se for lapis
					if (detalhes[0] == 2) this._pendente = this._partesDesenho[this._posicao];else this._pendente = false;

					this._posicao++;
					this._contagem = 0;
				} else this._contagem++;

				//checando necessidade de executar direto
				if (this._direto || detalhes[0] == 4 || detalhes[0] == 5 || detalhes[0] == 6 || detalhes[0] == 27 || detalhes[0] == 3 && this._partesDesenho.length && this._partesDesenho[0][0] == 3) this._passo();

				return true;
			} else {
				this._cancelarAnimacao();
				return false;
			}
		}

		/**
   * Desenhando de acordo com o cÃ³digo repassado
   *
   * @param {string} detalhes Dados do desenho a ser executado
   * @param {number} contagem Contador interno do prÃ³prio cÃ³digo (subpassos) para exibir partes do mesmo
   * @param {boolean} finalizar Indica se o subpasso finalizou
   * @returns {boolean} TraÃ§o completo ou parcial
   */

	}, {
		key: '_desenhar',
		value: function _desenhar(detalhes, contagem, finalizar) {
			switch (parseInt(detalhes[0])) {
				//CODIGO 1: DESENHO
				case 1:
					this._desenho.desenhar(parseInt(detalhes[2]), parseInt(detalhes[3]), parseInt(detalhes[4]), parseInt(detalhes[5]), parseInt(detalhes[1]), 0, false);
					this._desenho.salvarEstado(false);
					break;

				//CODIGO 2: DESENHO LINHA
				case 2:
					{
						var x1 = parseInt(detalhes[1]);
						var y1 = parseInt(detalhes[2]);
						var seq = [[x1, y1]];
						var limpar = [x1, y1, x1, y1];

						var maximo = 3 + (contagem + 1) * 2;
						if (maximo > detalhes.length || finalizar) maximo = detalhes.length;

						for (var cont2 = 3; cont2 < maximo; cont2 = cont2 + 2) {
							var x = parseInt(detalhes[cont2]);
							var y = parseInt(detalhes[cont2 + 1]);

							//verificando os limites de limpar tela
							if (x < limpar[0]) limpar[0] = x;else if (x > limpar[2]) limpar[2] = x;
							if (y < limpar[1]) limpar[1] = y;else if (y > limpar[3]) limpar[3] = y;

							seq.push([x, y]);
						}

						//apagando desenho anterior
						if (!contagem) this._desenho.limparTelaPrev();else {
							var borda = this._desenho.borda;
							var _x2 = limpar[0] - borda / 2;
							var _y = limpar[1] - borda / 2;
							var w = limpar[2] - limpar[0] + borda;
							var h = limpar[3] - limpar[1] + borda;
							this._desenho.limparTelaPrev(_x2, _y, w, h);
						}

						//desenhando passo ou finalizando
						maximo += 2;
						if (maximo <= detalhes.length) {
							this._desenho.linhaSeq(seq, 1);
							return false;
						} else {
							if (!finalizar) this._desenho.linhaSeq(seq, 1);else {
								this._desenho.linhaSeq(seq, 0);
								this._desenho.salvarEstado(false);
							}
						}
						break;
					}

				//CODIGO 3: DESENHO BALDE
				case 3:
					{
						if (this._opcoes.baldeFragmentado) {
							//verificando se Ã© inicio do balde
							if (detalhes[1] == '0') {
								this._cacheBalde += detalhes.slice(2).join('$');
							} else if (detalhes[1] == '1') {
								this._cacheBalde = '';
								this._cacheBalde += detalhes.slice(2).join('$');
							} else {
								if (detalhes[1] == '3') this._cacheBalde = '';

								this._cacheBalde += detalhes.slice(2).join('$');

								//verificando se Ã© fim do balde
								var dadosBalde = this._cacheBalde.split('$').map(function (num) {
									return parseInt(num);
								});

								//desenhando balde inteiro
								this._desenho.baldeF(dadosBalde);

								//salvar
								this._desenho.salvarEstado(false);
							}
						} else {
							//desenhando balde inteiro
							this._desenho.baldeF(detalhes.slice(1).map(function (num) {
								return parseInt(num);
							}));
							//salvar
							this._desenho.salvarEstado(false);
						}
						break;
					}

				//CODIGO 4: LIMPAR TELA
				case 4:
					this._desenho.limparTela(true, true);
					break;

				//CODIGO 5: MUDANCA DE COR
				case 5:
					this._desenho.mudaCor(detalhes[1], false);
					break;

				//CODIGO 6: MUDANCA DE BORDA
				case 6:
					this._desenho.mudaBorda(detalhes[1], false);
					break;

				//CODIGO 6: MUDANCA DE ALPHA
				case 27:
					this._desenho.mudaAlpha(detalhes[1], false);
					break;

				//CODIGO 21: DESENHO BORRACHA
				case 21:
					for (var _cont = 1; _cont < detalhes.length; _cont = _cont + 2) {
						this._desenho.borracha(parseInt(detalhes[_cont]), parseInt(detalhes[_cont + 1]), 0, false);
					}break;

				//DESFAZER REFAZER
				case 31:
					if (detalhes[1] == 1) this._desenho.refazer();else this._desenho.desfazer();
					break;
			}

			return true;
		}
	}, {
		key: 'direto',
		set: function set(val) {
			this._direto = val;
		}

		/**
   * Determina a taxa de exibiÃ§Ã£o dos traÃ§os
   *
   * @param {number} fracao Tempo em milisegundos
   */

	}, {
		key: 'fracao',
		set: function set(fracao) {
			this._fracao = fracao;
		}

		/**
   * Obter o objeto de Desenho vinculado a classe
   *
   * @returns {Desenho} Objeto de desenho utilizado na classe
   */

	}, {
		key: 'desenho',
		get: function get() {
			return this._desenho;
		}
	}]);

	return Player;
}(_eventos2.default);

exports.default = Player;


(function () {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
})();
},{"eventos":324}],339:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],340:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof global.process === "object" && global.process.domain) {
      invoke = global.process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],341:[function(require,module,exports){
'use strict';

//DependÃªncia do projeto

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _eventos = require('eventos');

var _eventos2 = _interopRequireDefault(_eventos);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Classe para o tratamente genÃ©rico de scrolls
 */
var Scroll = function (_Eventos) {
	_inherits(Scroll, _Eventos);

	/**
  * Construtor da classe, preparando elemento de scroll
  *
  * @param {HTMLElement} elem Elemento que irÃ¡ englobar toda a lÃ³gica do scroll
  * @param {Object} opcoes ConfiguraÃ§Ãµes do scroll
  * @param {Array} opcoes.classes Lista de classes para aplicar a sombra (topo, meio, rodape)
  * @param {boolean} opcoes.manterPosicao Fixa a posiÃ§Ã£o de visÃ£o do scroll
  * @param {number} opcoes.elementosMax Quantidade mÃ¡xima de elementos
  * @param {string} opcoes.elementoScroll Query de captura do elemento de scroll
  * @param {boolean} opcoes.scrollVertical Indica se farÃ¡ uso de scrollbar vertical
  * @param {boolean} opcoes.scrollHorizontal Indica se farÃ¡ uso de scrollbar horizontal
  * @param {Array} opcoes.margemVertical Margem no topo e rodapÃ© do scroll vertical
  * @param {Array} opcoes.margemHorizontal Margem a esquerda e a direita do scroll horizontal
  * @param {number} opcoes.tolerancia TolerÃ¢ncia para detecÃ§Ã£o do fim do scroll
  * @param {boolean} opcoes.nativo Indica o uso de scroll nativo
  */
	function Scroll(elem, opcoes) {
		_classCallCheck(this, Scroll);

		//opcoes padrao
		var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this));

		_this._opcoes = Object.assign({
			classes: false,
			manterPosicao: false,
			elementosMax: 0,
			elementoScroll: 'div',
			scrollVertical: true,
			scrollHorizontal: false,
			margemVertical: [0, 0],
			margemHorizontal: [0, 0],
			wheel: true,
			tolerancia: 0,
			nativo: false
		}, opcoes);

		_this._elem = elem;
		_this._scroll = elem.querySelector(_this._opcoes.elementoScroll);
		_this._sombraClasse = '';
		_this._scrollFim = false;
		_this._moving = false;

		// this._scroll.style.overflow = 'hidden';
		_this._scroll.addEventListener('scroll', function (e) {
			_this.refresh(true);
			e.stopPropagation();
		}, false);

		//simulando scroll touch
		if (!_this._opcoes.nativo) {
			_this._elem.addEventListener('touchstart', function (e) {
				_this._scrollbarStart(e, true, true);
			}, false);
		}

		//criando scrollbar
		if (_this._opcoes.scrollVertical) {
			_this._scrollbarVertical = document.createElement('div');
			_this._scrollbarVertical.className = 'scrollbar-vertical';
			_this._scrollbarVertical.addEventListener('mousedown', function (e) {
				_this._scrollbarStart(e, true);
				e.stopPropagation();
				e.preventDefault();
			}, false);
			_this._scrollbarVertical.addEventListener('touchstart', function (e) {
				_this._scrollbarStart(e, true);
				e.stopPropagation();
				e.preventDefault();
			}, false);
			_this._elem.appendChild(_this._scrollbarVertical);
		}

		//scroll horizontal
		if (_this._opcoes.scrollHorizontal) {
			_this._scrollbarHorizontal = document.createElement('div');
			_this._scrollbarHorizontal.className = 'scrollbar-horizontal';
			_this._scrollbarHorizontal.addEventListener('mousedown', function (e) {
				_this._scrollbarStart(e, false);
				e.stopPropagation();
			}, false);
			_this._scrollbarHorizontal.addEventListener('touchstart', function (e) {
				_this._scrollbarStart(e, false);
				e.stopPropagation();
			}, false);
			_this._elem.appendChild(_this._scrollbarHorizontal);
		}

		//filtrando elementos de texto
		if (_this._opcoes.elementosMax) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = _this._scroll.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var filho = _step.value;

					if (filho.nodeType == 3) _this._scroll.removeChild(filho);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		//habilitando rolagem
		if (_this._opcoes.wheel) {
			window.addWheelListener(_this._scroll, function (e) {
				//destravando manutenÃ§Ã£o de posiÃ§Ã£o
				if (e.deltaY < 0) _this._scrollFim = false;
				//movendo de acordo com o delta
				_this.scrollTo(_this._scroll.scrollLeft + e.deltaX, _this._scroll.scrollTop + e.deltaY);
				e.preventDefault();
			}, true);
		}

		//inicializando sombras e scroll
		_this.refresh();
		return _this;
	}

	/**
  * Remove o primeiro elemento-filho do scroll
  */


	_createClass(Scroll, [{
		key: '_pop',
		value: function _pop() {
			if (this._scroll.childNodes.length) {
				var elem = this._scroll.childNodes[0];
				if (this._opcoes.manterPosicao) this._scroll.scrollTop -= elem.offsetHeight;
				this._scroll.removeChild(elem);
			}
		}

		/**
   * Calcula o tamanho do scrollbar
   */

	}, {
		key: '_scrollbarSize',
		value: function _scrollbarSize() {
			if (this._scrollbarVertical) {
				//checando se o scroll ultrapassa os limites (mobile)
				var dif = 0,
				    top = Math.ceil(this._scroll.scrollTop);
				if (top < 0) {
					dif = top;
					top = 0;
				} else if (top + this._scroll.offsetHeight >= this._scroll.scrollHeight) dif = this._scroll.scrollHeight - (top + this._scroll.offsetHeight);

				//checando se existe scroll
				var fator = this._scroll.offsetHeight / this._scroll.scrollHeight;
				//bug ie fator 99%
				if (fator < 0.99) {
					var altura = Math.floor(this._scroll.offsetHeight * fator);
					this._scrollbarVertical.style.display = '';
					this._scrollbarVertical.style.height = altura + dif - this._opcoes.margemVertical[0] - this._opcoes.margemVertical[1] + 'px';
					this._scrollbarVertical.style.top = top / (this._scroll.scrollHeight - dif - this._scroll.offsetHeight) * (this._scroll.offsetHeight - altura - dif) + this._opcoes.margemVertical[0] + 'px';
				} else this._scrollbarVertical.style.display = 'none';
			}

			if (this._scrollbarHorizontal) {
				//checando se o scroll ultrapassa os limites (mobile)
				var _dif = 0,
				    _top = this._scroll.scrollLeft;
				if (this._scroll.scrollLeft < 0) {
					_top = 0;
					_dif = this._scroll.scrollLeft;
				} else if (this._scroll.scrollLeft + this._scroll.offsetWidth > this._scroll.scrollWidth) {
					_dif = this._scroll.scrollWidth - (this._scroll.scrollLeft + this._scroll.offsetWidth);
				}

				//checando se existe scroll
				var _fator = this._scroll.offsetWidth / this._scroll.scrollWidth;
				//bug ie fator 99%
				if (_fator < 0.99) {
					var _altura = Math.floor(this._scroll.offsetWidth * _fator);
					this._scrollbarHorizontal.style.display = '';
					this._scrollbarHorizontal.style.width = _altura + _dif - this._opcoes.margemHorizontal[0] - this._opcoes.margemHorizontal[1] + 'px';
					this._scrollbarHorizontal.style.left = _top / (this._scroll.scrollWidth - _dif - this._scroll.offsetWidth) * (this._scroll.offsetWidth - _altura - _dif) + this._opcoes.margemHorizontal[0] + 'px';
				} else this._scrollbarHorizontal.style.display = 'none';
			}
		}

		/**
   * Inicia o tratamento de arrasto do scrollbar
   *
   * @param {MouseEvent} e Evento do mouse
   * @param {boolean} vertical Indica se o scroll Ã© vertical ou horizontal
   * @param {boolean} invertido Troca a direÃ§Ã£o do scroll
   */

	}, {
		key: '_scrollbarStart',
		value: function _scrollbarStart(e, vertical) {
			var _this2 = this;

			var invertido = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var elem = void 0,
			    start = void 0,
			    top = void 0,
			    max = void 0,
			    attrScroll = void 0,
			    coord = void 0,
			    dif = void 0;

			this._moving = true;

			if (vertical) {
				elem = this._scrollbarVertical;
				start = !e.touches ? e.clientY : e.touches[0].clientY;
				top = elem.offsetTop - this._opcoes.margemVertical[0];
				max = this._scroll.offsetHeight - elem.offsetHeight - this._opcoes.margemVertical[0] - this._opcoes.margemVertical[1];
				attrScroll = 'scrollTop';
				coord = 'clientY';
				dif = this._scroll.scrollHeight - this._scroll.offsetHeight;
			} else {
				elem = this._scrollbarHorizontal;
				start = !e.touches ? e.clientX : e.touches[0].clientX;
				top = elem.offsetLeft - this._opcoes.margemHorizontal[0];
				max = this._scroll.offsetWidth - elem.offsetWidth - this._opcoes.margemHorizontal[0] - this._opcoes.margemHorizontal[1];
				attrScroll = 'scrollLeft';
				coord = 'clientX';
				dif = this._scroll.scrollWidth - this._scroll.offsetWidth;
			}

			var move = function move(e) {
				var pos = void 0;
				if (!invertido) pos = top + (!e.touches ? e[coord] : e.touches[0][coord]) - start;else pos = top + start - (!e.touches ? e[coord] : e.touches[0][coord]);

				if (pos <= 0) pos = 0;else if (pos >= max) pos = max;else e.preventDefault();

				_this2._scroll[attrScroll] = dif * pos / max;
			};
			var end = function end() {
				document.removeEventListener('mousemove', move, false);
				document.removeEventListener('mouseup', end, false);
				if (!invertido) document.removeEventListener('touchmove', move, false);
				document.removeEventListener('touchend', end, true);
				_this2._moving = false;
			};

			document.addEventListener('mousemove', move, false);
			document.addEventListener('mouseup', end, false);
			if (!invertido) document.addEventListener('touchmove', move, false);
			document.addEventListener('touchend', end, true);
		}

		/**
   * Trata a exibiÃ§Ã£o de sombras de acordo com o scroll
   */

	}, {
		key: '_sombras',
		value: function _sombras() {
			var inicio = this._scroll.scrollTop - this._opcoes.tolerancia <= 0;

			//checando se chegou ao final do scroll vertical
			if (this._scroll.scrollTop + this._scroll.offsetHeight + this._opcoes.tolerancia >= this._scroll.scrollHeight) {
				this._scrollFim = true;
				//emitindo evento do final do scroll
				_get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'emit', this).call(this, 'fim');
			} else this._scrollFim = false;

			//checando se chegou ao inicio do scroll
			if (inicio) _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'emit', this).call(this, 'inicio');

			//verificando suporte a sombras
			if (this._opcoes.classes) {
				var classe = '';

				//baixo
				if (!this._scrollFim) {
					if (this._opcoes.classes) {
						if (inicio) classe = this._opcoes.classes[2];
						//topo baixo
						else if (this._scroll.scrollTop > 0) classe = this._opcoes.classes[1];
					}
				} else {
					//topo
					if (this._opcoes.classes && this._scroll.scrollTop > 0) classe = this._opcoes.classes[0];
				}

				//trocando a classe de sombra do elemento
				if (classe != this._sombraClasse) {
					//removendo sombra atual
					if (this._sombraClasse) this._elem.classList.remove(this._sombraClasse);

					//verificando se existe sombra
					if (classe) {
						this._elem.classList.add(classe);
						this._sombraClasse = classe;
					} else this._sombraClasse = '';
				}
			}
		}

		/**
   * Adiciona um elemento ao scroll
   *
   * @param {HTMLElement} elem - Elemento a ser adicionado
   */

	}, {
		key: 'append',
		value: function append(elem) {
			//mantando quantidade de elementos fixa
			if (this._opcoes.elementosMax && this._scroll.childNodes.length >= this._opcoes.elementosMax) this._pop();
			this._scroll.appendChild(elem);

			//mantendo scroll no fim
			this.refresh();
		}

		/**
   * Atualiza parÃ¢metros do scroll
   *
   * @param {boolean} manual - Indica se a atualizaÃ§Ã£o estÃ¡ sendo feita por scroll do usuario
   */

	}, {
		key: 'refresh',
		value: function refresh() {
			var manual = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (!manual && this._opcoes.manterPosicao && this._scrollFim) this.scrollTo(undefined, this._scroll.scrollHeight);
			this._scrollbarSize();
			this._sombras();
		}

		/**
   * Move o scroll para um ponto especÃ­fico
   *
   * @param {number} x Coordenada X para posicionamento do topo do scroll
   * @param {number} y Coordenada Y para posicionamento do topo do scroll
   */

	}, {
		key: 'scrollTo',
		value: function scrollTo(x, y) {
			if (x !== undefined) this._scroll.scrollLeft = x;

			if (y !== undefined) this._scroll.scrollTop = y;
		}

		/**
   * Move o scroll para o fim
   *
   * @param {boolean} x Mover para o fim do scroll horizontal
   * @param {boolean} y Mover para o fim do scroll vertical
   */

	}, {
		key: 'scrollEnd',
		value: function scrollEnd(x, y) {
			x = x ? this._scroll.scrollWidth : undefined;
			y = y ? this._scroll.scrollHeight : undefined;
			this.scrollTo(x, y);
		}
	}]);

	return Scroll;
}(_eventos2.default);

/**
 * Tratamento do scroll do mouse crossbrowser
 * @see {@link https://developer.mozilla.org/pt-BR/docs/Web/Events/wheel}
 */


(function (window, document) {
	var prefix = '',
	    _addEventListener = void 0,
	    support = void 0;

	// detect event model
	if (window.addEventListener) {
		_addEventListener = 'addEventListener';
	} else {
		_addEventListener = 'attachEvent';
		prefix = 'on';
	}

	// detect available wheel event
	support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support 'wheel'
	document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least 'mousewheel'
	'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

	window.addWheelListener = function (elem, callback, useCapture) {
		_addWheelListener(elem, support, callback, useCapture);

		// handle MozMousePixelScroll in older Firefox
		if (support == 'DOMMouseScroll') {
			_addWheelListener(elem, 'MozMousePixelScroll', callback, useCapture);
		}
	};

	function _addWheelListener(elem, eventName, callback, useCapture) {
		elem[_addEventListener](prefix + eventName, support == 'wheel' ? callback : function (originalEvent) {
			!originalEvent && (originalEvent = window.event);

			// create a normalized event object
			var event = {
				// keep a ref to the original event object
				originalEvent: originalEvent,
				target: originalEvent.target || originalEvent.srcElement,
				type: 'wheel',
				deltaMode: originalEvent.type == 'MozMousePixelScroll' ? 0 : 1,
				deltaX: 0,
				deltaY: 0,
				deltaZ: 0,
				preventDefault: function preventDefault() {
					originalEvent.preventDefault ? originalEvent.preventDefault() : originalEvent.returnValue = false;
				}
			};

			// calculate deltaY (and deltaX) according to the event
			if (support == 'mousewheel') {
				event.deltaY = -1 / 40 * originalEvent.wheelDelta;
				// Webkit also support wheelDeltaX
				originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
			} else {
				event.deltaY = originalEvent.detail;
			}

			// it's time to fire the callback
			return callback(event);
		}, useCapture || false);
	}
})(window, document);

exports.default = Scroll;
},{"eventos":324}],342:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var parser = require('socket.io-parser');
var Manager = require('./manager');
var debug = require('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup (uri, opts) {
  if (typeof uri === 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.query;
  } else if (opts && 'object' === typeof opts.query) {
    opts.query = encodeQueryString(opts.query);
  }
  return io.socket(parsed.path, opts);
}
/**
 *  Helper method to parse query objects to string.
 * @param {object} query
 * @returns {string}
 */
function encodeQueryString (obj) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}
/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = require('./manager');
exports.Socket = require('./socket');

},{"./manager":343,"./socket":345,"./url":346,"debug":348,"socket.io-parser":351}],343:[function(require,module,exports){

/**
 * Module dependencies.
 */

var eio = require('engine.io-client');
var Socket = require('./socket');
var Emitter = require('component-emitter');
var parser = require('socket.io-parser');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:manager');
var indexOf = require('indexof');
var Backoff = require('backo2');

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager (uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' === typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function (fn, opts) {
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function () {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function (data) {
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function () {
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function () {
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function (err) {
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting () {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function (socket) {
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function (packet) {
  debug('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function () {
  debug('cleanup');

  var subsLength = this.subs.length;
  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function () {
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function (reason) {
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function (err) {
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":344,"./socket":345,"backo2":6,"component-bind":10,"component-emitter":347,"debug":348,"engine.io-client":309,"indexof":327,"socket.io-parser":351}],344:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}

},{}],345:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parser = require('socket.io-parser');
var Emitter = require('component-emitter');
var toArray = require('to-array');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:socket');
var hasBin = require('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket (io, nsp, opts) {
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (opts && opts.query) {
    this.query = opts.query;
  }
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function () {
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' === this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function () {
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function (ev) {
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' === typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' !== this.nsp) {
    if (this.query) {
      this.packet({type: parser.CONNECT, query: this.query});
    } else {
      this.packet({type: parser.CONNECT});
    }
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function (packet) {
  if (packet.nsp !== this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function (packet) {
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function (id) {
  var self = this;
  var sent = false;
  return function () {
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function (packet) {
  var ack = this.acks[packet.id];
  if ('function' === typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function () {
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function () {
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function (compress) {
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};

},{"./on":344,"component-bind":10,"component-emitter":347,"debug":348,"has-binary":325,"socket.io-parser":351,"to-array":357}],346:[function(require,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = require('parseuri');
var debug = require('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url (uri, loc) {
  var obj = uri;

  // default to window.location
  loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":348,"parseuri":337}],347:[function(require,module,exports){
arguments[4][319][0].apply(exports,arguments)
},{"dup":319}],348:[function(require,module,exports){
arguments[4][320][0].apply(exports,arguments)
},{"./debug":349,"_process":339,"dup":320}],349:[function(require,module,exports){
arguments[4][321][0].apply(exports,arguments)
},{"dup":321,"ms":333}],350:[function(require,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = require('isarray');
var isBuf = require('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":352,"isarray":328}],351:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('socket.io-parser');
var json = require('json3');
var Emitter = require('component-emitter');
var binary = require('./binary');
var isBuf = require('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    p = tryParse(p, str.substr(i));
  }

  debug('decoded %s as %j', str, p);
  return p;
}

function tryParse(p, str) {
  try {
    p.data = json.parse(str);
  } catch(e){
    return error();
  }
  return p; 
};

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":350,"./is-buffer":352,"component-emitter":11,"debug":353,"json3":331}],352:[function(require,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],353:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":354}],354:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":355}],355:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],356:[function(require,module,exports){
'use strict';

/**
 * Classe responsÃ¡vel por tratar os sons.
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Som = function () {

	/**
  * Construtor da classe.
  *
  * @param {Object} opcoes OpÃ§Ãµes do objeto
  * @param {string} opcoes.base EndereÃ§o base do caminho dos sons
  */
	function Som(opcoes) {
		_classCallCheck(this, Som);

		this._endereco = opcoes.base;

		this._ativo = true;
		this._listaSons = [];
		this._listaTocando = [];
		this._audioTag;
		this._extensao;

		//definindo a extensao padrao a ser utilizada
		try {
			var somTest = new Audio();
			if (somTest.canPlayType('audio/mpeg')) this._extensao = '.mp3';

			this._audioTag = true;
		} catch (e) {
			this._audioTag = false;
			this._ativo = false;
		}
	}

	/**
  * Pausa todos os sons que estiverem ativos.
  */


	_createClass(Som, [{
		key: '_pauseAll',
		value: function _pauseAll() {
			for (var key in this._listaTocando) {
				if (this._listaTocando[key]) this.pause(key);
			}
		}

		/**
   * Ativar sons.
   */

	}, {
		key: 'ativar',
		value: function ativar() {
			if (this._audioTag) {
				this._ativo = true;
				var ind = void 0,
				    listaTocar = [];
				for (ind in this._listaTocando) {
					if (this._listaTocando[ind]) listaTocar.push(ind);
				}

				this._pauseAll();
				//executando os sons em loop retirados
				for (var cont = 0; cont < listaTocar.length; cont++) {
					this.play(listaTocar[cont], false, true);
				}
			}
		}

		/**
   * Buscando ativo.
   *
   * @return {boolean} Som ativo(true) ou nÃ£o(false).
   */

	}, {
		key: 'desativar',


		/**
   * Desativar sons.
   */
		value: function desativar() {
			this._pauseAll();
			this._ativo = false;
		}

		/**
   * Carregando novos sons
   *
   * @param {Array} arrSom Lista de sons
   */

	}, {
		key: 'load',
		value: function load(arrSom) {
			if (this._audioTag) {
				for (var key in arrSom) {
					var som = arrSom[key];

					//procurando se o som jah existe, caso contrario cria
					if (!this._listaSons[som]) {
						var novoSom = new Audio();
						novoSom.src = this._endereco + som + this._extensao;
						novoSom.load();
						this._listaSons[som] = novoSom;
					}
				}
			}
		}

		/**
   * Pausar um som.
   *
   * @param  {string} som Som que deve ser pausado.
   */

	}, {
		key: 'pause',
		value: function pause(som) {
			var somObj = this._listaSons[som];
			if (somObj) {
				somObj.pause();
				this._listaTocando[som] = false;
			}
		}

		/**
   * Toca o som desejado.
   *
   * @param  {string} som Nome do som que deve ser tocado.
   * @param  {boolean} loop Indica se haverÃ¡ loop ou nÃ£o do som.
   * @param  {number} volume Volume percentual do som a ser tocado.
   */

	}, {
		key: 'play',
		value: function play(som) {
			var _this = this;

			var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
			var volume = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

			var somObj = this._listaSons[som];
			if (somObj && this._ativo) {
				(function () {
					somObj.currentTime = 0;
					somObj.loop = loop;
					somObj.volume = volume;

					_this._listaTocando[som] = true;
					somObj.setAttribute('som', som);
					somObj.onpause = function () {
						callbackPause(this.getAttribute('som'));
					};
					var callbackPause = function callbackPause(som) {
						_this._listaTocando[som] = false;
					};
					somObj.play();
				})();
			}
		}
	}, {
		key: 'ativo',
		get: function get() {
			return this._ativo;
		}
	}]);

	return Som;
}();

exports.default = Som;
},{}],357:[function(require,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}],358:[function(require,module,exports){
(function (global){
/*! https://mths.be/wtf8 v1.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function wtf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, itâ€™s not a continuation byte.
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read the first byte.
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid WTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function wtf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var wtf8 = {
		'version': '1.0.0',
		'encode': wtf8encode,
		'decode': wtf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return wtf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = wtf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in wtf8) {
				hasOwnProperty.call(wtf8, key) && (freeExports[key] = wtf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.wtf8 = wtf8;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],359:[function(require,module,exports){
'use strict';

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;

},{}]},{},[1]);
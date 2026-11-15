/* ============================================================
   FLUXO — 3 fases sequenciais
   Fase 1: três frases, avanço por toque/clique em qualquer ponto
   Fase 2: escolha do receptáculo (guarda o primeiro nome)
   Fase 3: selo do pacto → redirecionamento para o WhatsApp
   ============================================================ */

(() => {
  "use strict";

  const state = {
    personagem: null,
    introIndex: 0,
    locked: false, // trava durante transições para evitar cliques duplos
  };

  const WHATSAPP_NUMERO = "5511996812010";

  const stageIntro = document.getElementById("fase-intro");
  const stageFiles = document.getElementById("fase-arquivos");
  const stageSeal = document.getElementById("fase-selo");
  const introScreens = Array.from(stageIntro.querySelectorAll(".intro-screen"));
  const sealNome = document.getElementById("seal-nome");
  const btnPacto = document.getElementById("btn-pacto");

  /* ---------- troca de fase (fade-out → fade-in) ---------- */

  function trocarFase(de, para) {
    de.classList.remove("is-visible");
    window.setTimeout(() => {
      de.classList.remove("is-active");
      para.classList.add("is-active");
      // força reflow para a transição de opacidade disparar
      void para.offsetWidth;
      para.classList.add("is-visible");
      state.locked = false;
    }, 950);
  }

  /* ---------- FASE 1 — introdução ---------- */

  function avancarIntro() {
    if (state.locked) return;
    state.locked = true;

    AudioFX.drone();

    const atual = introScreens[state.introIndex];
    atual.classList.add("is-leaving");
    atual.classList.remove("is-current");

    const proxima = state.introIndex + 1;

    if (proxima < introScreens.length) {
      window.setTimeout(() => {
        atual.classList.remove("is-leaving");
        state.introIndex = proxima;
        introScreens[proxima].classList.add("is-current");
        state.locked = false;
      }, 600);
    } else {
      // última frase → Fase 2
      trocarFase(stageIntro, stageFiles);
    }
  }

  stageIntro.addEventListener("click", avancarIntro);
  stageIntro.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      avancarIntro();
    }
  });
  stageIntro.setAttribute("tabindex", "0");

  /* Desbloqueia o contexto de áudio na primeira interação (autoplay) */
  const primeiroToque = () => {
    AudioFX.ensure();
    window.removeEventListener("pointerdown", primeiroToque);
    window.removeEventListener("keydown", primeiroToque);
  };
  window.addEventListener("pointerdown", primeiroToque, { once: false });
  window.addEventListener("keydown", primeiroToque, { once: false });

  /* ---------- FASE 2 — escolha do receptáculo ---------- */

  stageFiles.querySelectorAll(".file-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (state.locked) return;
      state.locked = true;

      state.personagem = card.dataset.nome;
      card.classList.add("is-chosen");
      AudioFX.impact();

      sealNome.textContent = state.personagem;

      // pequena pausa para o impacto visual/sonoro assentar
      window.setTimeout(() => trocarFase(stageFiles, stageSeal), 450);
    });
  });

  /* ---------- FASE 3 — firmar o pacto ---------- */

  btnPacto.addEventListener("click", () => {
    const nome = state.personagem || "o Receptáculo";
    const mensagem = `O destino de ${nome} foi selado.`;
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
    window.location.href = url;
  });

  /* ---------- estado inicial ---------- */

  requestAnimationFrame(() => {
    stageIntro.classList.add("is-visible");
  });
})();

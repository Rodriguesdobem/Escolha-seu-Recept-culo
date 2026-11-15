/* ============================================================
   FLUXO — 3 fases sequenciais
   Fase 1: três frases, avanço por toque/clique em qualquer ponto
   Fase 2: escolha do receptáculo (guarda o primeiro nome)
   Fase 3: selo do pacto → redirecionamento para o WhatsApp
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { AudioFX } from "./audio.js";

const WHATSAPP_NUMERO = "5511996812010";

const PERSONAGENS = [
  { nome: "Christopher", sobrenome: "Machado", numero: "001", perfil: "MASCULINO" },
  { nome: "Blanca", sobrenome: "Erechim", numero: "002", perfil: "FEMININO" },
  { nome: "Falkes", sobrenome: "Decredo", numero: "003", perfil: "MASCULINO" },
  { nome: "Zenith", sobrenome: "Oriachi", numero: "004", perfil: "FEMININO" },
];

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | files | seal
  const [visible, setVisible] = useState(false);
  const [introIndex, setIntroIndex] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const [personagem, setPersonagem] = useState(null);

  const locked = useRef(false);
  const timeouts = useRef([]);

  const agendar = (fn, ms) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  };

  /* fade-in da fase ativa (inclusive a primeira) */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      locked.current = false;
    });
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  /* desbloqueia o contexto de áudio na primeira interação (autoplay) */
  useEffect(() => {
    const primeiroToque = () => AudioFX.ensure();
    window.addEventListener("pointerdown", primeiroToque);
    window.addEventListener("keydown", primeiroToque);
    return () => {
      window.removeEventListener("pointerdown", primeiroToque);
      window.removeEventListener("keydown", primeiroToque);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  /* ---------- troca de fase (fade-out → fade-in) ---------- */

  function trocarFase(para) {
    setVisible(false);
    agendar(() => setStage(para), 950);
  }

  /* ---------- FASE 1 — introdução ---------- */

  function avancarIntro() {
    if (locked.current) return;
    locked.current = true;

    AudioFX.drone();

    const atual = introIndex;
    setLeaving(atual);

    if (atual + 1 < 3) {
      agendar(() => {
        setLeaving(null);
        setIntroIndex(atual + 1);
        locked.current = false;
      }, 600);
    } else {
      // última frase → Fase 2
      trocarFase("files");
    }
  }

  /* ---------- FASE 2 — escolha do receptáculo ---------- */

  function escolher(nome) {
    if (locked.current) return;
    locked.current = true;

    setPersonagem(nome);
    AudioFX.impact();

    // pequena pausa para o impacto visual/sonoro assentar
    agendar(() => trocarFase("seal"), 450);
  }

  /* ---------- FASE 3 — firmar o pacto ---------- */

  function firmarPacto() {
    const nome = personagem || "o Receptáculo";
    const mensagem = `O destino de ${nome} foi selado.`;
    window.location.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
  }

  const stageClass = (id) =>
    `stage stage--${id === "intro" ? "intro" : id === "files" ? "files" : "seal"}` +
    (stage === id ? " is-active" : "") +
    (stage === id && visible ? " is-visible" : "");

  const screenClass = (i) =>
    "intro-screen" +
    (introIndex === i && leaving !== i ? " is-current" : "") +
    (leaving === i ? " is-leaving" : "");

  return (
    <>
      {/* Atmosfera global */}
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <main id="app">
        {/* ============ FASE 1 · INTRODUÇÃO NARRATIVA ============ */}
        <section
          className={stageClass("intro")}
          aria-label="Introdução"
          tabIndex={0}
          onClick={avancarIntro}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              avancarIntro();
            }
          }}
        >
          <div className="intro-frame">
            <div className={screenClass(0)}>
              <p className="phrase phrase--medo">
                O <span className="medo">Medo</span> é o início de tudo,
                <br />
                onde ele nasce, desperta
                <br />
                <span className="phrase--medo-end">aquilo que deveria ser temido.</span>
              </p>
            </div>

            <div className={screenClass(1)}>
              <p className="phrase phrase--trilha">
                <span className="dim">Os caminhos eram outros,</span>
                <br />
                mas o destino os arrastou
                <br />
                <span className="track">para a mesma trilha.</span>
              </p>
            </div>

            <div className={screenClass(2)}>
              <p className="phrase phrase--corpo">
                Você não foi escolhido para estar aqui,
                <br />
                mas precisa{" "}
                <em className="glitch" data-text="escolher um corpo">
                  escolher um corpo
                </em>
                <br />
                para habitar.
              </p>
            </div>
          </div>

          <div className="tap-hint" aria-hidden="true">
            Toque para continuar…
          </div>
        </section>

        {/* ============ FASE 2 · ARQUIVOS CONFIDENCIAIS ============ */}
        <section className={stageClass("files")} aria-label="Escolha de personagem">
          <header className="files-head">
            <p className="files-stamp">ORDEM &mdash; ACESSO RESTRITO</p>
            <h1 className="files-title">Escolha seu Receptáculo</h1>
            <p className="files-sub">
              Quatro identidades recuperadas. Nomes parcialmente destruídos no incidente.
            </p>
          </header>

          <div className="files-grid" role="list">
            {PERSONAGENS.map((p) => (
              <button
                key={p.nome}
                className={"file-card" + (personagem === p.nome ? " is-chosen" : "")}
                role="listitem"
                onClick={() => escolher(p.nome)}
              >
                <span className="file-card__no">ARQUIVO Nº {p.numero}</span>
                <span className="file-card__name">
                  {p.nome}
                  <span className="redacted" aria-label="sobrenome censurado">
                    <span className="redacted__text">{p.sobrenome}</span>
                  </span>
                </span>
                <span className="file-card__meta">
                  <span className="file-card__tag">PERFIL: {p.perfil}</span>
                  <span className="file-card__status">STATUS: DISPONÍVEL</span>
                </span>
                <span className="file-card__seal" aria-hidden="true">
                  CONFIDENCIAL
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ============ FASE 3 · O SELO ============ */}
        <section className={stageClass("seal")} aria-label="O pacto">
          <div className="seal-pulse" aria-hidden="true" />

          <div className="seal-body">
            <p className="seal-chosen">
              <span>{personagem || "—"}</span> &mdash; receptáculo aceito
            </p>
            <h2 className="seal-text">
              O pacto está selado.
              <br />
              Caminhe agora pelas consequências
              <br />
              da sua própria escolha.
            </h2>
            <button className="pact-btn" onClick={firmarPacto}>
              <span className="pact-btn__rune" aria-hidden="true">
                &#10017;
              </span>
              Firmar Pacto
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

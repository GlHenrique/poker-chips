<div align="center">
  <h1>🃏 Poker Chips</h1>
  <p><strong>Gerencie fichas de poker de forma inteligente — distribua, configure e cronometre suas partidas.</strong></p>

  <p>
    <a href="https://poker-chips-lemon.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel" alt="Demo ao vivo" />
    </a>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/i18n-pt--BR%20%7C%20en%20%7C%20es-orange?style=for-the-badge" alt="i18n" />
  </p>
</div>

---

## Sobre o projeto

**Poker Chips** é uma aplicação web pensada para grupos que jogam poker presencialmente e precisam de uma forma prática de calcular a distribuição de fichas entre os jogadores e controlar o tempo de cada rodada.

Diferente de calculadoras genéricas, o app permite **configurar as fichas disponíveis** (nome, valor, quantidade e cor), informar o valor inicial de cada stack e calcular automaticamente a melhor combinação de fichas por jogador — com um algoritmo de backtracking que respeita os limites de estoque.

---

## Funcionalidades

### Distribuição de Fichas
- Configura fichas personalizadas com nome, valor, quantidade e cor
- Calcula a distribuição ideal de fichas por jogador a partir do valor da stack, small blind e big blind
- Algoritmo de backtracking com múltiplos níveis de reserva para garantir combinações válidas
- Exibe resultado visual com chips coloridos e tooltips informativos
- Estado das fichas e do formulário persiste durante a sessão

### Timer
- Contador regressivo configurável (minutos e segundos)
- Ações de iniciar, pausar, continuar e parar
- Estado do timer persiste no `localStorage` — o tempo continua mesmo ao sair e voltar à página
- Alarme sonoro e vibração (em dispositivos compatíveis) ao término
- Histórico de execuções com data/hora de início e fim

### Internacionalização (i18n)
- Suporte a **Português (pt-BR)**, **Inglês (en)** e **Espanhol (es)**
- Detecção automática do idioma do navegador
- Preferência salva no `localStorage`
- Moedas adaptadas por idioma: **BRL**, **USD** e **EUR**
- Nomes das fichas padrão traduzidos automaticamente ao trocar de idioma

### UX & Acessibilidade
- Tema claro, escuro e automático (sistema)
- Layout responsivo — funciona em desktop e mobile
- Animações de entrada e saída suaves
- `aria-live` no display do timer para leitores de tela

---

## Stack tecnológica

| Tecnologia | Uso |
|---|---|
| **React 19** | Interface e gerenciamento de estado |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Vite** | Bundler e dev server |
| **Tailwind CSS v4** | Estilização utilitária |
| **Radix UI** | Componentes acessíveis (Dropdown, Tooltip, Label) |
| **React Router v7** | Roteamento client-side |
| **i18next + react-i18next** | Internacionalização e detecção de idioma |
| **Lucide React** | Ícones |

---

## Arquitetura

```
src/
├── components/
│   ├── app/
│   │   ├── ThemeProvider/       # Contexto de tema (claro/escuro/sistema)
│   │   ├── ToggleMode/          # Botão de alternância de tema
│   │   └── LanguageSwitcher/    # Seletor de idioma com dropdown
│   ├── layout/
│   │   └── Layout.tsx           # Header, nav, footer e Outlet
│   └── ui/                      # Componentes base (Button, Input, Label…)
├── context/
│   └── TimerContext.tsx          # Estado global do timer com persistência
├── hooks/
│   └── useCurrencyFormatter.ts  # Formatação de moeda reativa ao idioma
├── locales/
│   ├── pt-BR/translation.json
│   ├── en/translation.json
│   └── es/translation.json
├── pages/
│   ├── Home.tsx
│   ├── Timer.tsx
│   └── ManagePlayers/
│       ├── index.tsx
│       ├── constants.ts         # Fichas iniciais com suporte a i18n
│       ├── types.ts
│       └── components/
│           ├── ChipConfigCard.tsx
│           ├── ChipRow.tsx
│           ├── DistributionForm.tsx
│           ├── DistributionResult.tsx
│           └── DistributionError.tsx
└── utils/
    ├── calculateDistribution.ts  # Algoritmo de backtracking
    ├── formatCurrency.ts
    ├── color.ts
    └── scrollToElement.ts
```

---

## Algoritmo de distribuição

O cálculo de fichas usa **backtracking com múltiplos níveis de reserva**:

1. Converte todos os valores para centavos (evita erros de ponto flutuante)
2. Testa 4 níveis de reserva do estoque: 25%, 20%, 15% e 0%
3. Para cada nível, tenta encontrar uma combinação exata de fichas que some ao valor da stack usando busca recursiva
4. Retorna a primeira combinação válida encontrada — ou uma lista vazia se nenhuma for possível

---

## Como executar localmente

**Pré-requisitos:** Node.js 20+ e pnpm

```bash
# Clone o repositório
git clone https://github.com/GlHenrique/poker-chips.git
cd poker-chips

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`.

```bash
# Build de produção
pnpm build

# Preview do build
pnpm preview
```

---

## Deploy

O projeto está configurado para deploy automático na **Vercel** via `vercel.json` com rewrite de todas as rotas para `index.html` (necessário para o roteamento client-side do React Router).

---

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais informações.

---

<div align="center">
  <p>Feito com ♠ por <a href="https://github.com/GlHenrique">GlHenrique</a></p>
</div>

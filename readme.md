# Costs Dashboard

Este projeto é um **dashboard de custos em cloud** que integra dados do **Google Sheets** e gera análises automáticas usando **IA Gemini**.
O front-end é construído em **React + Vite**, com **TanStack React Query** para cache e persistência de dados.
As funções serverless são hospedadas na **Vercel**, facilitando deploy e execução local com `vercel dev`.

## Requisitos
- Node.js >= 20
- Vercel CLI (`npm i -g vercel`)
- Conta Vercel

---

## 🚀 Setup do Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/JoaoCFN/costs-dashboard.git
cd costs-dashboard
```

### 2. Instalar dependências
```bash
yarn install
```

### 3. Rodar em desenvolvimento
```bash
vercel dev
```

### 4. Deploy
```bash
vercel --prod
```

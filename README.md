## 🚀 Configuração do Ambiente

1. Clone o repositório:

```bash
git clone https://github.com/gusteycamargo/mcp-debug-server.git
cd mcp-debug-server
```

2. Instale as dependências:

```bash
yarn install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DISCORD_TOKEN=seu_token_do_discord
DISCORD_STAGING_CHANNEL_ID=id_do_canal_staging
DISCORD_PRODUCTION_CHANNEL_ID=id_do_canal_producao
DISCORD_DEVELOPMENT_CHANNEL_ID=id_do_canal_desenvolvimento
```

## 🛠️ Desenvolvimento

1. Para compilar o projeto:

```bash
yarn build
```

## Adicionando o MCP ao Cursor

```json
{
  "mcpServers": {
    "mcp-debug-server": {
      "command": "node",
      "args": ["path/to/mcp-debug-server/build/index.js"]
    }
  }
}
```

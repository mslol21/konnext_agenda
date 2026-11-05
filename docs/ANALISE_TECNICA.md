# Konnexy Agenda — revisão de 05/11/2026

## Diagnóstico

O repositório tem duas implementações que ainda não formam um sistema operacional integrado:

- Interface e painéis baseados em `DataStore`, dados fictícios e localStorage.
- Backend PostgreSQL/Prisma para catálogo, disponibilidade, reservas temporárias e confirmação.

A inspeção da configuração Vercel de `konnext-agenda` retornou uma lista vazia de variáveis de ambiente. Portanto, não havia conexão DATABASE_URL configurada por esse mecanismo. Não foram consultadas ou alteradas bases de outros projetos.

Não existe fluxo de login nem aplicação de autenticação/autorização aos painéis. A biblioteca de JWT/RBAC é apenas infraestrutura; selecionar um perfil na demonstração não autentica o visitante.

## Problemas corrigidos

| Área | Problema | Correção |
| --- | --- | --- |
| Confirmação | API com erro ou offline ainda resultava em sucesso local | O modo conectado só confirma após sucesso da API; erros não viram reservas locais |
| Demonstração | Dados locais apresentados como sincronizados | Modo demo explícito quando DATABASE_URL não está configurada; aviso para usar dados fictícios |
| Catálogo | IDs locais `srv-*` não correspondiam aos UUIDs do banco | Endpoint público de catálogo com IDs e valores reais; modal carrega essa fonte no modo conectado |
| Profissionais | Todos eram mostrados independentemente do serviço | Filtro por profissional ativo e vínculo com o serviço |
| Horários | Duração, buffer, escala e antecedência podiam ser burlados | Validação da reserva e confirmação contra o motor de disponibilidade |
| Disponibilidade | Um profissional podia ser elegível por apenas um dos vários serviços | Exigir vínculo com todos os serviços solicitados |
| Reservas temporárias | Consulta por sessão sem escopo de empresa; confirmação aceitava hold expirado/diferente | Escopo por tenant e conferência de serviço, horário e expiração |
| Reservas temporárias | Mesmo telefone temporário em clientes distintos colidia com índice único | Um cliente de checkout por empresa, obtido com upsert |
| Expiração | Limpeza em etapas podia excluir reserva renovada | Exclusão condicional de agendamentos held com cascata, em uma operação |
| Cadastro | Reserva pública podia sobrescrever identidade e notas de cliente existente | Dados já cadastrados não são alterados pelo endpoint público; divergências de contato são rejeitadas |
| Financeiro | Nova reserva aumentava visitas e gasto antes do atendimento | Backend não contabiliza reserva como visita concluída ou receita realizada |
| Preços | Recibo local podia diferir do banco; cupom só existia no navegador | Recibo usa registro/preço do servidor; cupons locais apenas na demonstração |
| Empresa | Middleware enviava headers de resposta em vez de encaminhar contexto à rota | Header de requisição; reserva `agenda`, `app`, `www` e ignora nomes de preview Vercel |
| Isolamento | Update podia transferir serviço para outro tenant | Tenant obrigatório tanto no filtro como nos dados de update |
| Autenticação | JWT tinha segredo público de fallback; magic link podia ser interpretado como sessão | AUTH_SECRET obrigatório e validação de tipo de token |
| WhatsApp | Webhook aceitava payload sem autenticar origem | Verificação HMAC SHA-256 com WHATSAPP_APP_SECRET; resposta automática exige ativação explícita |
| Comunicação | Promessa de e-mail, lembretes, pagamentos e avaliações reais sem implementação | Textos corrigidos; demonstração não afirma reserva real nem envio de mensagem |
| Acessibilidade | Modal sem semântica de diálogo ou controle de teclado | Diálogo identificado, foco contido, Escape, restauração de foco e bloqueio de rolagem |
| Mobile | Toolbar do calendário e faixa de perfis podiam ultrapassar a tela | Quebra de linha, limites de largura e ajustes nos botões |
| SEO | Sitemap apontava para outro domínio e listava área de cliente | Domínio agenda.konnexy.com.br; exclusão dos portais no robots |
| Ícones | Manifest apontava para PNGs inexistentes | Ícone SVG próprio, referência válida e cores da marca |
| Exportação | CSV escapava aspas incorretamente; PDF pendente dizia TOTAL PAGO | Escape CSV correto e indicação de valor a pagar conforme status |
| Migração | tstzrange incompatível com timestamp sem timezone do Prisma | tsrange na constraint de exclusão |

A identidade visual escura, neon, gradientes e componentes existentes foram preservados.

## Comportamento dos modos

Sem DATABASE_URL, o endpoint de catálogo informa explicitamente `mode: demo`. O modal usa catálogo e reservas locais, sem chamar endpoints de gravação no banco e sem enviar mensagens. Não se trata de um fallback após falha do banco.

Com DATABASE_URL, o modal usa catálogo real e requer sucesso das APIs. Uma conexão configurada que falhe não ativa a demonstração silenciosamente. Os painéis e a landing continuam usando conteúdo de demonstração; conectar o agendamento não converte esses painéis em gestão real.

## O que falta para uso comercial real

1. Selecionar a base PostgreSQL correta e configurar DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_TENANT_SLUG e NEXT_PUBLIC_APP_URL na Vercel.
2. Preparar e validar as tabelas Prisma. A migração existente contém apenas a constraint de exclusão e não cria as tabelas: não executar `migrate deploy` sobre uma base vazia esperando um schema completo. Uma base legada Supabase também precisa de compatibilização, pois o schema SQL anterior difere do Prisma atual.
3. Implementar login, sessão e autorização no servidor para os painéis, com associação usuário/empresa/profissional e proteção de todas as operações.
4. Migrar clientes, serviços, profissionais, agenda, financeiro, estoque e configuração dos painéis do DataStore para APIs autenticadas.
5. Definir RLS/grants se as tabelas forem expostas pela Data API do Supabase; Prisma não substitui essas políticas.
6. Implementar cancelamento/reagendamento persistente, conclusão e conciliação de pagamentos, cupons no servidor, notificações, idempotência, limites de requisição e tratamento de reentregas do webhook.
7. Substituir conteúdo fictício e contatos ilustrativos da landing pelos dados do estabelecimento. O assistente atual usa contexto de demonstração e não deve confirmar disponibilidade nem receber credenciais reais no navegador.
8. Executar testes com PostgreSQL real, incluindo 50 reservas concorrentes, expiração/renovação e confirmação simultânea. O teste existente é uma simulação em memória; não comprova a constraint do banco.

## Validação e limites

- Testes unitários, isolamento, autenticação, disponibilidade e simulação de concorrência executados com Vitest; novos testes cobrem contatos inválidos, hold expirado/divergente, datas passadas, limite de expiração e disponibilidade da demonstração.
- TypeScript e build de produção executados.
- Revisão da interface publicada original pelo navegador.
- A prévia local gerenciada não iniciou por incompatibilidade de flags da infraestrutura com Next.js. A validação foi concluída em uma prévia Vercel READY: serviço → profissional elegível → horário → formulário com dados fictícios → confirmação identificada como simulação → registro visível no painel de recepção, com pagamento pendente e duração incluindo buffer. Essa verificação cobre o modo demonstração em desktop; mobile e gravação em PostgreSQL real não foram verificados no navegador.
- Nenhuma migração executada em banco real. Nenhuma mensagem, cobrança ou e-mail de teste enviado.

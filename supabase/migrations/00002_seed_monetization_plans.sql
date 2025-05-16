-- Seeding de Planos de Monetização padrão para a aplicação

-- Plano de Assinatura Mensal
INSERT INTO monetization_plans (name, monetization_type, platform_fee, description)
VALUES ('Assinatura Básica', 'subscription', 15.00, 'Plano mensal básico com acesso a todo o conteúdo do artista');

-- Plano de Assinatura Premium
INSERT INTO monetization_plans (name, monetization_type, platform_fee, description)
VALUES ('Assinatura Premium', 'subscription', 25.00, 'Plano mensal premium com acesso a conteúdo exclusivo e downloads ilimitados');

-- Plano Por Visualização
INSERT INTO monetization_plans (name, monetization_type, platform_fee, description)
VALUES ('Pay-per-View', 'per_stream', 5.00, 'Pagamento por visualização individual de conteúdo');

-- Plano Por Download
INSERT INTO monetization_plans (name, monetization_type, platform_fee, description)
VALUES ('Download', 'download', 10.00, 'Compra para download permanente do conteúdo');

-- Plano de Doação
INSERT INTO monetization_plans (name, monetization_type, platform_fee, description)
VALUES ('Doação', 'donation', 2.50, 'Modelo baseado em doações para o artista'); 
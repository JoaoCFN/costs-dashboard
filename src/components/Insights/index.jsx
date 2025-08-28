import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Theme/card';
import { Badge } from '@/components/Theme/badge';

function Insights() {
	return (
		<div className="grid gap-4">
			<Card className="bg-card text-card-foreground">
				<CardHeader>
					<CardTitle>Principais Descobertas</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">1</Badge>
						<div>
							<p className="font-semibold">AWS S3 é o principal custo:</p>
							<p>Representa <span className="font-bold text-primary">42.9%</span> dos custos totais da AWS. Otimizar o uso do S3 (ciclos de vida, classes de armazenamento) pode gerar economias significativas.</p>
						</div>
					</div>
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">2</Badge>
						<div>
							<p className="font-semibold">AWS RDS como candidato a Reserved Instances:</p>
							<p>Com <span className="font-bold text-primary">19.6%</span> dos custos da AWS, o RDS é um serviço estável e previsível. A compra de Reserved Instances pode reduzir o custo em até 30-40%.</p>
						</div>
					</div>
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">3</Badge>
						<div>
							<p className="font-semibold">Novos provedores (Cloudflare, Make, Github) representam pequena parcela:</p>
							<p>Juntos, representam apenas <span className="font-bold text-primary">~1.3%</span> dos custos totais. Monitorar o crescimento desses custos é importante, mas o foco principal deve ser nos maiores provedores.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-card text-card-foreground">
				<CardHeader>
					<CardTitle>Recomendações</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">1</Badge>
						<div>
							<p className="font-semibold">Otimização de S3:</p>
							<p>Revisar políticas de ciclo de vida, identificar e arquivar dados pouco acessados para classes de armazenamento mais baratas (Glacier, Deep Archive).</p>
						</div>
					</div>
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">2</Badge>
						<div>
							<p className="font-semibold">Avaliar Reserved Instances para RDS:</p>
							<p>Analisar o padrão de uso do RDS e considerar a compra de Reserved Instances para reduzir custos a longo prazo.</p>
						</div>
					</div>
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">3</Badge>
						<div>
							<p className="font-semibold">Monitoramento Contínuo:</p>
							<p>Implementar alertas para picos de custo inesperados e revisar relatórios de custos mensalmente para identificar novas oportunidades de otimização.</p>
						</div>
					</div>
					<div className="flex items-start space-x-2">
						<Badge variant="secondary" className="mt-1">4</Badge>
						<div>
							<p className="font-semibold">Potencial de Economia:</p>
							<p>Com as otimizações sugeridas, estima-se um potencial de economia de <span className="font-bold text-primary">$2.500 - $3.500 por mês</span>, totalizando <span className="font-bold text-primary">$30.000 - $42.000 por ano</span>.</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default Insights;
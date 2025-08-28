import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { formatCurrency } from '../../../services/formatCurrency';

function TopProviders({
	topProviders,
	topProvidersTotal,
	colors
}) {
	return (
		<Card className="col-span-3 bg-card text-card-foreground">
			<CardHeader>
				<CardTitle>Top 3 Provedores</CardTitle>
				<CardDescription>
					Participação dos principais provedores
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={350}>
					<PieChart>
						<Pie
							data={topProviders}
							cx="50%"
							cy="50%"
							outerRadius={80}
							fill="#8884d8"
							dataKey="total"
							label={({ provider, total }) => `${provider}: ${formatCurrency(total)}`}
						>
							{topProviders.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
							))}
						</Pie>
						<Tooltip
							formatter={(value, name, props) => [`${formatCurrency(value)}`, props.payload.provider]}
							contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
							labelStyle={{ color: '#000000' }}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="text-center text-sm text-muted-foreground mt-2">
					Custo total: ${topProvidersTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
				</div>
			</CardContent>
		</Card>
	);
}

export default TopProviders;
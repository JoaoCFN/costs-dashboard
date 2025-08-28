import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Theme/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { formatCurrency } from '@/utils/formatCurrency';

function MonthlyCostsEvolution({
	monthlyTrend
}) {
	return (
		<Card className="col-span-4 bg-card text-card-foreground">
			<CardHeader>
				<CardTitle>Evolução Mensal dos Custos</CardTitle>
			</CardHeader>
			<CardContent className="pl-2">
				<ResponsiveContainer width="100%" height={350}>
					<AreaChart data={monthlyTrend}>
						<CartesianGrid strokeDasharray="3 3" stroke="#333" />
						<XAxis dataKey="month" stroke="#888" />
						<YAxis stroke="#888" />
						<Tooltip
							formatter={(value) => [`${formatCurrency(value)}`, 'Custo Total']}
							contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
							labelStyle={{ color: '#000000' }}
						/>
						<Area type="monotone" dataKey="total" stroke="#007BFF" fill="#007BFF" fillOpacity={0.1} />
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

export default MonthlyCostsEvolution;
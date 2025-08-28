import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { formatCurrency } from '../../../services/formatCurrency';

function TrendCostsByProvider({
	costTrendData,
	memoizedCostsData,
	colors
}) {
	return (
		<Card className="col-span-7 bg-card text-card-foreground">
			<CardHeader>
				<CardTitle>Tendência de Custos por Provedor</CardTitle>
			</CardHeader>
			<CardContent className="pl-2">
				<ResponsiveContainer width="100%" height={350}>
					<LineChart data={costTrendData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#333" />
						<XAxis dataKey="month" stroke="#888" />
						<YAxis stroke="#888" />
						<Tooltip
							formatter={(value, name) => [`$${formatCurrency(value)}`, name]}
							contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
							labelStyle={{ color: '#000000' }}
						/>
						<Legend />
						{memoizedCostsData.uniqueProviders.map((provider, index) => (
							<Line
								key={provider}
								type="monotone"
								dataKey={provider}
								stroke={colors[index % colors.length]}
								activeDot={{ r: 8 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

export default TrendCostsByProvider;
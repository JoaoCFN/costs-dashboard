import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Theme/card';
import { DollarSign, TrendingUp, TrendingDown, Cloud } from 'lucide-react';

function MetricCard({
	title,
	icon,
	value,
	content
}) {
	const icons = {
		total: <DollarSign className="h-4 w-4 text-muted-foreground" />,
		montly: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
		growth: value > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />,
		providers: <Cloud className="h-4 w-4 text-muted-foreground" />
	}

	return (
		<Card className="bg-card text-card-foreground">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icons[icon]}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">
					{value}
				</div>
				<p className="text-xs text-muted-foreground">
					{content}
				</p>
			</CardContent>
		</Card>
	);
}

export default MetricCard;
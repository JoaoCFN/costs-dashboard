import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { formatCurrency } from '../../../utils/formatCurrency';

function CostBreakdownByProvider({
	memoizedCostsData,
	detailedCostsTable
}) {
	return (
		<Card className="col-span-7 bg-card text-card-foreground">
			<CardHeader>
				<CardTitle>Detalhamento de Custos por Provedor</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Provedor</TableHead>
							{memoizedCostsData.uniqueMonths.map(month => (
								<TableHead key={month}>{month}</TableHead>
							))}
							<TableHead>Total</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{detailedCostsTable.map((row, index) => (
							<TableRow key={index}>
								<TableCell className="font-medium">{row.provider}</TableCell>
								{memoizedCostsData.uniqueMonths.map(month => (
									<TableCell key={month}>{formatCurrency(row[month.toLowerCase()])}</TableCell>
								))}
								<TableCell className="font-bold">{formatCurrency(row.total)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export default CostBreakdownByProvider;
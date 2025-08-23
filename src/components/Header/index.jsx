import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

function Header({
	selectedMonth,
	setSelectedMonth,
	memoizedCostsData
}) {
	return (
		<div className="flex items-center justify-between space-y-2">
			<div>
				<h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard de Custos - Autódromo</h2>
				<p className="text-muted-foreground">
					Análise de custos de infraestrutura cloud para o produto Autódromo
				</p>
			</div>
			<div className="flex items-center space-x-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<Select value={selectedMonth} onValueChange={setSelectedMonth}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Selecionar período" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Todos os meses</SelectItem>
						{memoizedCostsData.uniqueMonths.map(month => (
							<SelectItem key={month} value={month}>{month}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

export default Header;
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Theme/tabs';
import Header from './components/Header';
import Insights from './components/Insights';
import MonthlyCostsEvolution from './components/Charts/MonthlyCostEvolution';
import TopProviders from './components/Charts/TopProviders';
import TrendCostsByProvider from './components/Charts/CostTrendsByProvider';
import CostBreakdownByProvider from './components/Tables/CostBreakdownByProvider';
import AWSCostDistribution from './components/Charts/AWSCostDistibution';
import HerokuCostDistibution from './components/Charts/HerokuCostDistibution';
import MetricCard from './components/MetricCard';

import { useFilteredData } from './hooks/useFilteredData';
import { useMonthlyTrend } from './hooks/useMonthlyTrend';
import { useProviderTotals } from './hooks/useProviderTotals';
import { useTopProviders } from './hooks/useTopProviders';
import { useCostTrendData } from './hooks/useCostTrendData';
import { useDetailedCostsTable } from './hooks/useDetailedCostsTable';
import { useTotalCost } from './hooks/useTotalCost';
import { useAvgMonthlyCost } from './hooks/useAvgMonthlyCost';
import { useMonthlyGrowth } from './hooks/useMonthlyGrowth';
import { useProviderServicesData } from './hooks/useProviderServicesData';
import { useSheetsData } from './hooks/useSheetsData';

import { formatCurrency } from './utils/formatCurrency';

import './App.css';

const COLORS = ['#007BFF', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f97316'];

function App() {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const { data: costsData, error, isLoading } = useSheetsData();

  const filteredData = useFilteredData(costsData, selectedMonth);
  const monthlyTrend = useMonthlyTrend(costsData);
  const providerTotals = useProviderTotals(costsData, selectedMonth);
  const { topProviders, topProvidersTotal } = useTopProviders(providerTotals);
  const costTrendData = useCostTrendData(costsData);
  const detailedCostsTable = useDetailedCostsTable(costsData);
  const awsServicesData = useProviderServicesData(costsData, selectedMonth, 'AWS');
  const herokuServicesData = useProviderServicesData(costsData, selectedMonth, 'Heroku');
  const awsTotal = awsServicesData.reduce((sum, s) => sum + s.value, 0);
  const herokuTotal = herokuServicesData.reduce((sum, s) => sum + s.value, 0);
  const totalCost = useTotalCost(costsData, selectedMonth);
  const avgMonthlyCost = useAvgMonthlyCost(costsData);
  const monthlyGrowth = useMonthlyGrowth(costsData);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen text-2xl">Carregando dados...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-2xl text-red-500">Erro ao carregar dados: {error.message}</div>;
  if (!costsData) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Header
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          memoizedCostsData={costsData}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title={'Custo total'}
                icon={'total'}
                value={`${formatCurrency(totalCost)}`}
                content={selectedMonth === 'all' ? 'Últimos meses' : `Mês de ${selectedMonth}`}
              />

              <MetricCard
                title={'Média mensal'}
                icon={'montly'}
                value={`${formatCurrency(avgMonthlyCost)}`}
                content={`${costsData.uniqueMonths[0]} a ${costsData.uniqueMonths[costsData.uniqueMonths.length - 1]}`}
              />

              <MetricCard
                title={'Crescimento'}
                icon={'growth'}
                value={monthlyGrowth.toFixed(1)}
                content={`${costsData.uniqueMonths[0]} vs ${costsData.uniqueMonths[costsData.uniqueMonths.length - 1]}`}
              />

              <MetricCard
                title={'Provedores'}
                icon={'providers'}
                value={costsData.uniqueProviders.length}
                content={costsData.uniqueProviders.join(', ')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              <MonthlyCostsEvolution monthlyTrend={monthlyTrend} />

              <TopProviders
                topProviders={topProviders}
                topProvidersTotal={topProvidersTotal}
                colors={COLORS}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <TrendCostsByProvider
                memoizedCostsData={costsData}
                costTrendData={costTrendData}
                colors={COLORS}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <CostBreakdownByProvider
                memoizedCostsData={costsData}
                detailedCostsTable={detailedCostsTable}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              <AWSCostDistribution
                awsServicesData={awsServicesData}
                awsTotal={awsTotal}
                colors={COLORS}
              />

              <HerokuCostDistibution
                herokuServicesData={herokuServicesData}
                herokuTotal={herokuTotal}
                colors={COLORS}
              />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Insights
              costsData={costsData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

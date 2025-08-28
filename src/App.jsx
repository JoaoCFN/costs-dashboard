import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

import { formatCurrency } from './utils/formatCurrency';

import './App.css';

const COLORS = ['#007BFF', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f97316']

function App() {
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [costsData, setCostsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getCostsData = async () => {
      try {
        const response = await fetch(`/api/sheets`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const { data } = await response.json()

        const headers = data.values[0]
        const rows = data.values.slice(1)

        const processedData = rows.map(row => {
          const obj = {}
          headers.forEach((header, index) => {
            obj[header] = row[index]
          })
          return {
            month: obj.Mês,
            provider: obj.Provedor,
            service: obj.Serviço,
            cost: parseFloat(obj.Custo.replace('$', '').replace(',', '.')) || 0 // Convert cost to number
          }
        })

        const uniqueMonths = [...new Set(processedData.map(item => item.month))].sort((a, b) => {
          const monthOrder = {'Maio': 1, 'Junho': 2, 'Julho': 3, 'Agosto': 4, 'Setembro': 5, 'Outubro': 6, 'Novembro': 7, 'Dezembro': 8}; // Extend as needed
          return monthOrder[a] - monthOrder[b];
        });
        const uniqueProviders = [...new Set(processedData.map(item => item.provider))]

        const monthlyTotals = uniqueMonths.map(month => ({
          month,
          total: processedData.filter(item => item.month === month && item.service === 'Total').reduce((sum, item) => sum + item.cost, 0)
        }))

        const detailedCosts = processedData.filter(item => item.service !== 'Total')
        const totalServiceProviders = processedData.filter(item => item.service === 'Total')

        const awsServices = processedData.filter(item => item.provider === 'AWS' && item.service !== 'Total')
          .reduce((acc, item) => {
            const existing = acc.find(service => service.service === item.service)
            if (existing) {
              existing.cost += item.cost
            } else {
              acc.push({ service: item.service, cost: item.cost })
            }
            return acc
          }, [])

        const herokuServices = processedData.filter(item => item.provider === 'Heroku' && item.service !== 'Total')
          .reduce((acc, item) => {
            const existing = acc.find(service => service.service === item.service)
            if (existing) {
              existing.cost += item.cost
            } else {
              acc.push({ service: item.service, cost: item.cost })
            }
            return acc
          }, [])

        setCostsData({
          uniqueMonths,
          uniqueProviders,
          monthlyTotals,
          detailedCosts,
          totalServiceProviders,
          awsServices,
          herokuServices
        })
        setLoading(false)
      } catch (e) {
        setError(e)
        setLoading(false)
      }
    }

    getCostsData();
  }, [])

  const memoizedCostsData = useMemo(() => costsData, [costsData]);

  const filteredData = useFilteredData(memoizedCostsData, selectedMonth);
  const monthlyTrend = useMonthlyTrend(memoizedCostsData);
  const providerTotals = useProviderTotals(memoizedCostsData, selectedMonth);
  const { topProviders, topProvidersTotal } = useTopProviders(providerTotals);
  const costTrendData = useCostTrendData(memoizedCostsData);
  const detailedCostsTable = useDetailedCostsTable(memoizedCostsData);
  const awsServicesData = useProviderServicesData(memoizedCostsData, selectedMonth, 'AWS');
  const herokuServicesData = useProviderServicesData(memoizedCostsData, selectedMonth, 'Heroku');
  const awsTotal = awsServicesData.reduce((sum, s) => sum + s.value, 0);
  const herokuTotal = herokuServicesData.reduce((sum, s) => sum + s.value, 0);
  const totalCost = useTotalCost(memoizedCostsData, selectedMonth);
  const avgMonthlyCost = useAvgMonthlyCost(memoizedCostsData);
  const monthlyGrowth = useMonthlyGrowth(memoizedCostsData);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-2xl">Carregando dados...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-2xl text-red-500">Erro ao carregar dados: {error.message}</div>;

  // Render the dashboard only when costsData is available
  if (!memoizedCostsData) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Header
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          memoizedCostsData={memoizedCostsData}
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
                content={
                  `${memoizedCostsData.uniqueMonths[0]} a ${memoizedCostsData.uniqueMonths[memoizedCostsData.uniqueMonths.length - 1]} 2025`
                }
              />

              <MetricCard
                title={'Crescimento'}
                icon={'growth'}
                value={monthlyGrowth.toFixed(1)}
                content={
                  `${memoizedCostsData.uniqueMonths[0]} vs ${memoizedCostsData.uniqueMonths[memoizedCostsData.uniqueMonths.length - 1]}`
                }
              />

              <MetricCard
                title={'Provedores'}
                icon={'providers'}
                value={memoizedCostsData.uniqueProviders.length}
                content={memoizedCostsData.uniqueProviders.join(', ')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <MonthlyCostsEvolution monthlyTrend={monthlyTrend} />

              <TopProviders
                topProviders={topProviders}
                topProvidersTotal={topProvidersTotal}
                colors={COLORS}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <TrendCostsByProvider
                memoizedCostsData={memoizedCostsData}
                costTrendData={costTrendData}
                colors={COLORS}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <CostBreakdownByProvider
                memoizedCostsData={memoizedCostsData}
                detailedCostsTable={detailedCostsTable}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
            <Insights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

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

  // Ensure costsData is not null before using it in useMemo hooks
  const memoizedCostsData = useMemo(() => costsData, [costsData]);

  const filteredData = useMemo(() => {
    if (!memoizedCostsData) return [];
    let filtered = memoizedCostsData.detailedCosts;

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(item => item.month === selectedMonth);
    }

    return filtered;
  }, [selectedMonth, memoizedCostsData]);

  const monthlyTrend = useMemo(() => {
    if (!memoizedCostsData) return [];
    return memoizedCostsData.monthlyTotals
      .map(item => ({
        month: item.month,
        total: item.total,
        formatted: `$${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }));
  }, [memoizedCostsData]);

  const providerTotals = useMemo(() => {
    if (!memoizedCostsData) return [];
    const totals = {};

    if (memoizedCostsData.totalServiceProviders) {
      memoizedCostsData.totalServiceProviders.forEach(totalItem => {
        if (!totals[totalItem.provider]) {
          totals[totalItem.provider] = 0;
        }
        if (selectedMonth === 'all' || totalItem.month === selectedMonth) {
          totals[totalItem.provider] += totalItem.cost;
        }
      });
    }

    return Object.entries(totals)
      .map(([provider, total]) => ({
        provider,
        total,
        formatted: `$${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }))
      .sort((a, b) => b.total - a.total);
  }, [selectedMonth, memoizedCostsData]);

  const topProviders = useMemo(() => {
    if (!memoizedCostsData) return [];
    return providerTotals.slice(0, 3);
  }, [providerTotals]);

  const topProvidersTotal = useMemo(() => {
    if (!memoizedCostsData) return 0;
    return topProviders.reduce((sum, provider) => sum + provider.total, 0);
  }, [topProviders]);

  const costTrendData = useMemo(() => {
    if (!memoizedCostsData) return [];
    const trendData = {};

    // Use totalServiceProviders for the trend data
    if (memoizedCostsData.totalServiceProviders) {
      memoizedCostsData.totalServiceProviders.forEach(totalItem => {
        if (!trendData[totalItem.month]) {
          trendData[totalItem.month] = {};
        }
        if (!trendData[totalItem.month][totalItem.provider]) {
          trendData[totalItem.month][totalItem.provider] = 0;
        }
        trendData[totalItem.month][totalItem.provider] += totalItem.cost;
      });
    }

    return memoizedCostsData.uniqueMonths
      .map(month => ({
        month,
        ...trendData[month]
      }));
  }, [memoizedCostsData]);

  const detailedCostsTable = useMemo(() => {
    if (!memoizedCostsData) return [];
    const tableData = {};

    const allCosts = [...memoizedCostsData.detailedCosts];

    if (memoizedCostsData.totalServiceProviders) {
      memoizedCostsData.totalServiceProviders.forEach(totalItem => {
        allCosts.push(totalItem);
      });
    }

    allCosts.forEach(item => {
      if (item.service === 'Total' && !memoizedCostsData.detailedCosts.some(d => d.provider === item.provider)) {
        if (!tableData[item.provider]) {
          tableData[item.provider] = {};
        }
        if (!tableData[item.provider][item.month]) {
          tableData[item.provider][item.month] = 0;
        }
        tableData[item.provider][item.month] += item.cost;
      } else if (item.service !== 'Total') {
        if (!tableData[item.provider]) {
          tableData[item.provider] = {};
        }
        if (!tableData[item.provider][item.month]) {
          tableData[item.provider][item.month] = 0;
        }
        tableData[item.provider][item.month] += item.cost;
      }
    });

    return Object.entries(tableData).map(([provider, months]) => ({
      provider,
      ...memoizedCostsData.uniqueMonths.reduce((acc, month) => ({ ...acc, [month.toLowerCase()]: months[month] || 0 }), {}),
      total: memoizedCostsData.uniqueMonths.reduce((sum, month) => sum + (months[month] || 0), 0)
    })).sort((a, b) => b.total - a.total);
  }, [memoizedCostsData]);

  const awsServicesData = useMemo(() => {
    if (!memoizedCostsData) return [];
    let data = memoizedCostsData.awsServices;
    if (selectedMonth !== 'all') {
      data = memoizedCostsData.detailedCosts
        .filter(item => item.provider === 'AWS' && item.month === selectedMonth && item.service !== 'Total')
        .reduce((acc, item) => {
          const existing = acc.find(service => service.service === item.service);
          if (existing) {
            existing.cost += item.cost;
          } else {
            acc.push({ service: item.service, cost: item.cost });
          }
          return acc;
        }, []);
    }

    return data.map(service => ({
      name: service.service,
      value: service.cost
    }));
  }, [selectedMonth, memoizedCostsData]);

  const herokuServicesData = useMemo(() => {
    if (!memoizedCostsData) return [];
    let data = memoizedCostsData.herokuServices;
    if (selectedMonth !== 'all') {
      data = memoizedCostsData.detailedCosts
        .filter(item => item.provider === 'Heroku' && item.month === selectedMonth && item.service !== 'Total')
        .reduce((acc, item) => {
          const existing = acc.find(service => service.service === item.service);
          if (existing) {
            existing.cost += item.cost;
          } else {
            acc.push({ service: item.service, cost: item.cost });
          }
          return acc;
        }, []);
    }

    return data.map(service => ({
      name: service.service,
      value: service.cost
    }));
  }, [selectedMonth, memoizedCostsData]);

  const awsTotal = useMemo(() => {
    if (!memoizedCostsData) return 0;
    return awsServicesData.reduce((sum, service) => sum + service.value, 0);
  }, [awsServicesData]);

  const herokuTotal = useMemo(() => {
    if (!memoizedCostsData) return 0;
    return herokuServicesData.reduce((sum, service) => sum + service.value, 0);
  }, [herokuServicesData]);

  const totalCost = useMemo(() => {
    if (!memoizedCostsData) return 0;
    if (selectedMonth === 'all') {
      return memoizedCostsData.monthlyTotals.reduce((sum, month) => sum + month.total, 0);
    } else {
      const monthData = memoizedCostsData.monthlyTotals.find(m => m.month === selectedMonth);
      return monthData ? monthData.total : 0;
    }
  }, [selectedMonth, memoizedCostsData]);

  const avgMonthlyCost = useMemo(() => {
    if (!memoizedCostsData) return 0;
    return memoizedCostsData.monthlyTotals.reduce((sum, item) => sum + item.total, 0) / memoizedCostsData.monthlyTotals.length;
  }, [memoizedCostsData]);

  const monthlyGrowth = useMemo(() => {
    if (!memoizedCostsData) return 0;
    return memoizedCostsData.monthlyTotals.length >= 2 ?
      ((memoizedCostsData.monthlyTotals[memoizedCostsData.monthlyTotals.length - 1].total - memoizedCostsData.monthlyTotals[0].total) / memoizedCostsData.monthlyTotals[0].total) * 100 : 0;
  }, [memoizedCostsData]);

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
                value={`$${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                content={selectedMonth === 'all' ? 'Últimos meses' : `Mês de ${selectedMonth}`}
              />

              <MetricCard
                title={'Média mensal'}
                icon={'montly'}
                value={`$${avgMonthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Cloud, Calendar } from 'lucide-react'
import './App.css'

const COLORS = ['#007BFF', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#f97316']

const spreadsheetId = import.meta.env.VITE_SHEETS_SPREADSHEETID;
const keyAPI = import.meta.env.VITE_SHEETS_KEYAPI; 

function App() {
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [costsData, setCostsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getCostsData = async () => {
      try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z?key=${keyAPI}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
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

    getCostsData()
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

  const top3Providers = useMemo(() => {
    if (!memoizedCostsData) return [];
    return providerTotals.slice(0, 3);
  }, [providerTotals]);

  const top3Total = useMemo(() => {
    if (!memoizedCostsData) return 0;
    return top3Providers.reduce((sum, provider) => sum + provider.total, 0);
  }, [top3Providers]);

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

  const CustomTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{`Mês: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: $${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-2xl">Carregando dados...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-2xl text-red-500">Erro ao carregar dados: {error.message}</div>;
  
  // Render the dashboard only when costsData is available
  if (!memoizedCostsData) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex-1 space-y-4 p-8 pt-6">
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

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedMonth === 'all' ? 'Últimos meses' : `Mês de ${selectedMonth}`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${avgMonthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    {memoizedCostsData.uniqueMonths[0]} a {memoizedCostsData.uniqueMonths[memoizedCostsData.uniqueMonths.length - 1]} 2025
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                  {monthlyGrowth > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyGrowth.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {memoizedCostsData.uniqueMonths[0]} vs {memoizedCostsData.uniqueMonths[memoizedCostsData.uniqueMonths.length - 1]}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Provedores</CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memoizedCostsData.uniqueProviders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {memoizedCostsData.uniqueProviders.join(', ')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                        formatter={(value) => [`$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Custo Total']} 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
                        labelStyle={{ color: '#000000' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#007BFF" fill="#007BFF" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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
                        data={top3Providers}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        label={({ provider, total }) => `${provider}: $${total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                      >
                        {top3Providers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, props.payload.provider]} 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
                        labelStyle={{ color: '#000000' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Custo total: ${top3Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                        formatter={(value, name) => [`$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name]} 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
                        labelStyle={{ color: '#000000' }}
                      />
                      <Legend />
                      {memoizedCostsData.uniqueProviders.map((provider, index) => (
                        <Line
                          key={provider}
                          type="monotone"
                          dataKey={provider}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                            <TableCell key={month}>${row[month.toLowerCase()].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          ))}
                          <TableCell className="font-bold">${row.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Distribuição de Custos - AWS</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={awsServicesData.filter(item => item.name !== 'Total')}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                      >
                        {awsServicesData.filter(item => item.name !== 'Total').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, props.payload.name]} 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
                        labelStyle={{ color: '#000000' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Custo total: ${awsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Distribuição de Custos - Heroku</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={herokuServicesData.filter(item => item.name !== 'Total')}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                      >
                        {herokuServicesData.filter(item => item.name !== 'Total').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, props.payload.name]} 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
                        labelStyle={{ color: '#000000' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Custo total: ${herokuTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;



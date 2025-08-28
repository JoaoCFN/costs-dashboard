import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';

function AWSCostDistribution({ awsServicesData, awsTotal, colors }) {
  return (
    <Card className="col-span-4 bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Distribuição de Custos - AWS</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={awsServicesData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) =>
                `${name}: ${formatCurrency(value)}`
              }
            >
              {awsServicesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${formatCurrency(value)}`,
                props.payload.name
              ]}
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#333', color: '#000000' }}
              labelStyle={{ color: '#000000' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-sm text-muted-foreground mt-2">
          Custo total: {formatCurrency(awsTotal)}
        </div>
      </CardContent>
    </Card>
  );
}

export default AWSCostDistribution;

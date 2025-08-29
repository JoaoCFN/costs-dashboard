import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Theme/card';
import { Badge } from '@/components/Theme/badge';
import { useGeminiAnalysis } from '@/hooks/useGeminiAnalysis';
import { jsonToCsv } from '@/utils/jsonToCsv';
import ReactMarkdown from 'react-markdown';

function Insights({ costsData }) {
	const detailedCosts = jsonToCsv(costsData && costsData.detailedCosts);

	const { data: insightsData, error, isLoading } = useGeminiAnalysis(detailedCosts);

	if (isLoading) return <div className="flex justify-center items-center min-h-screen text-2xl">Analisando os dados...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-2xl text-red-500">Erro ao analisar os dados: {error.message}</div>;
	if (!insightsData) return null;

	const insightsCandidates = insightsData.candidates && insightsData.candidates[0];
	const insightsParts = insightsCandidates.content.parts && insightsCandidates.content.parts[0];
	const text = insightsParts.text;

	return (
		<div className="grid gap-4">
			<Card className="bg-card text-card-foreground">
				<CardHeader>
					<CardTitle>Insights gerados</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ReactMarkdown>
						{text}
					</ReactMarkdown>
				</CardContent>
			</Card>
		</div>
	);
}

export default Insights;
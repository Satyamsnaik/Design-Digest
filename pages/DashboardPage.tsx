import React from 'react';
import { DigestConfig } from '../types';
import DigestConfigurator from '../components/DigestConfigurator';
import UrlAnalyzer from '../components/UrlAnalyzer';

interface DashboardPageProps {
	config: DigestConfig;
	setConfig: React.Dispatch<React.SetStateAction<DigestConfig>>;
	onGenerate: () => void;
	onAnalyze: (url: string) => void;
	loading: boolean;
	isKeyMissing: boolean;
	onOpenApiKey: () => void;
}

export default function DashboardPage({
	config,
	setConfig,
	onGenerate,
	onAnalyze,
	loading,
	isKeyMissing,
	onOpenApiKey
}: DashboardPageProps) {
	return (
		<div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
			<section className="text-center space-y-4 md:space-y-6">
				<h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-charcoal leading-tight pt-2 tracking-tight">
					Daily Design Digest
				</h1>
				<p className="text-stone-500 text-lg md:text-xl font-sans font-light max-w-lg mx-auto leading-relaxed px-4">
					Curated intelligence for product designers, strategists, and engineers.
				</p>

				{isKeyMissing && (
					<button
						onClick={onOpenApiKey}
						className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-full hover:bg-amber-100 transition-all animate-in fade-in slide-in-from-top-4 duration-1000"
					>
						<span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
						API Key required for live intelligence. Click to setup.
					</button>
				)}
			</section>
			<DigestConfigurator config={config} setConfig={setConfig} onGenerate={onGenerate} isLoading={loading} />
			<UrlAnalyzer onAnalyze={onAnalyze} isLoading={loading} />
		</div>
	);
}

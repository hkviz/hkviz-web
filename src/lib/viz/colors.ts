import { cn } from '../utils';

export interface ColorClasses {
	checkbox: string;
	hexLight: string;
	hexDark: string;
	path: string;
	background: string;
	beforeBackground: string;
	li: string;
	toggleGroupItem: string;
}

const toggleGroupItemBase = cn('border-1 data-pressed:border-1');

export const tailwindChartColors = {
	red: {
		checkbox: cn('border-red-500 outline-red-500 data-checked:bg-red-500'),
		hexLight: '#ef4444',
		hexDark: '#ef4444',
		path: cn('fill-current text-red-500'),
		background: cn('bg-red-500'),
		beforeBackground: cn('before:bg-red-500'),
		li: cn('marker:text-red-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-red-500/60 from-red-500/80 to-red-500/50 hover:bg-red-500/30 data-pressed:bg-linear-to-b',
		),
	},
	pink: {
		checkbox: cn('border-pink-500 outline-pink-500 data-checked:bg-pink-500'),
		hexLight: '#f6339a',
		hexDark: '#f6339a',
		path: cn('fill-current text-pink-500'),
		background: cn('bg-pink-500'),
		beforeBackground: cn('before:bg-pink-500'),
		li: cn('marker:text-pink-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-pink-500/60 from-pink-500/80 to-pink-500/50 hover:bg-pink-500/30 data-pressed:bg-linear-to-b',
		),
	},
	emerald: {
		checkbox: cn('border-emerald-500 outline-emerald-500 data-checked:bg-emerald-500'),
		hexLight: '#10b981',
		hexDark: '#10b981',
		path: cn('fill-current text-emerald-500'),
		background: cn('bg-emerald-500'),
		beforeBackground: cn('before:bg-emerald-500'),
		li: cn('marker:text-emerald-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-emerald-500/60 from-emerald-500/80 to-emerald-500/50 hover:bg-emerald-500/30 data-pressed:bg-linear-to-b',
		),
	},
	green: {
		checkbox: cn('border-green-500 outline-green-500 data-checked:bg-green-500'),
		hexLight: '#22c55e',
		hexDark: '#22c55e',
		path: cn('fill-current text-green-500'),
		background: cn('bg-green-500'),
		beforeBackground: cn('before:bg-green-500'),
		li: cn('marker:text-green-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-green-500/60 from-green-500/80 to-green-500/50 hover:bg-green-500/30 data-pressed:bg-linear-to-b',
		),
	},
	limeDark: {
		checkbox: cn('border-lime-800 outline-lime-800 data-checked:bg-lime-800'),
		hexLight: '#3f6212',
		hexDark: '#3f6212',
		path: cn('fill-current text-lime-800'),
		background: cn('bg-lime-800'),
		beforeBackground: cn('before:bg-lime-800'),
		li: cn('marker:text-lime-800'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-lime-800/60 from-lime-800/80 to-lime-800/50 hover:bg-lime-800/30 data-pressed:bg-linear-to-b',
		),
	},
	indigo: {
		checkbox: cn('border-indigo-500 outline-indigo-500 data-checked:bg-indigo-500'),
		hexLight: '#6366f1',
		hexDark: '#6366f1',
		path: cn('fill-current text-indigo-500'),
		background: cn('bg-indigo-500'),
		beforeBackground: cn('before:bg-indigo-500'),
		li: cn('marker:text-indigo-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-indigo-500/60 from-indigo-500/80 to-indigo-500/50 hover:bg-indigo-500/30 data-pressed:bg-linear-to-b',
		),
	},
	rose: {
		checkbox: cn('border-rose-500 outline-rose-500 data-checked:bg-rose-500'),
		hexLight: '#f43f5e',
		hexDark: '#f43f5e',
		path: cn('fill-current text-rose-500'),
		background: cn('bg-rose-500'),
		beforeBackground: cn('before:bg-rose-500'),
		li: cn('marker:text-rose-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-rose-500/60 from-rose-500/80 to-rose-500/50 hover:bg-rose-500/30 data-pressed:bg-linear-to-b',
		),
	},
	orange: {
		checkbox: cn('border-orange-400 outline-orange-400 data-checked:bg-orange-400'),
		hexLight: '#fb923c',
		hexDark: '#fb923c',
		path: cn('fill-current text-orange-400'),
		background: cn('bg-orange-400'),
		beforeBackground: cn('before:bg-orange-400'),
		li: cn('marker:text-orange-400'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-orange-400/60 from-orange-400/80 to-orange-400/50 hover:bg-orange-400/30 data-pressed:bg-linear-to-b',
		),
	},
	sky: {
		checkbox: cn('border-sky-500 outline-sky-500 data-checked:bg-sky-500'),
		hexLight: '#0ea5e9',
		hexDark: '#0ea5e9',
		path: cn('fill-current text-sky-500'),
		background: cn('bg-sky-500'),
		beforeBackground: cn('before:bg-sky-500'),
		li: cn('marker:text-sky-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-sky-500/60 from-sky-500/80 to-sky-500/50 hover:bg-sky-500/30 data-pressed:bg-linear-to-b',
		),
	},
	slate: {
		checkbox: cn('border-slate-500 outline-slate-500 data-checked:bg-slate-500'),
		hexLight: '#64748b',
		hexDark: '#64748b',
		path: cn('fill-current text-slate-500'),
		background: cn('bg-slate-500'),
		beforeBackground: cn('before:bg-slate-500'),
		li: cn('marker:text-slate-500'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-slate-500/60 from-slate-500/80 to-slate-500/50 hover:bg-slate-500/30 data-pressed:bg-linear-to-b',
		),
	},
	light: {
		checkbox: cn(
			'border-slate-300 outline-slate-300 data-checked:bg-slate-300 dark:border-slate-800 dark:outline-slate-800 dark:data-checked:bg-slate-800',
		),
		hexLight: '#cbd5e1',
		hexDark: '#1e293b',
		path: cn('fill-current text-slate-300 dark:text-slate-800'),
		background: cn('bg-slate-300 dark:bg-slate-800'),
		beforeBackground: cn('before:bg-slate-300 dark:before:bg-slate-800'),
		li: cn('marker:text-slate-300 dark:marker:text-slate-800'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-slate-300/60 from-slate-300/80 to-slate-300/50 hover:bg-slate-300/30 data-pressed:bg-linear-to-b',
		),
	},
	amberLight: {
		checkbox: cn(
			'border-amber-400 outline-amber-400 data-checked:bg-amber-400 dark:border-amber-400 dark:outline-amber-400 dark:data-checked:bg-amber-400',
		),
		hexLight: '#fbbf24',
		hexDark: '#fde68a',
		path: cn('fill-current text-amber-400 dark:text-amber-200'),
		background: cn('bg-amber-400 dark:bg-amber-200'),
		beforeBackground: cn('before:bg-amber-400 dark:before:bg-amber-200'),
		li: cn('marker:text-amber-400 dark:marker:text-amber-200'),
		toggleGroupItem: cn(
			toggleGroupItemBase,
			'border-amber-400/60 from-amber-400/80 to-amber-400/50 hover:bg-amber-400/30 data-pressed:bg-linear-to-b dark:from-amber-300/80',
		),
	},
} satisfies Record<string, ColorClasses>;

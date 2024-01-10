import { type LineChartVariableClassNames } from './line-area-chart';

export const lineAreaColors = {
    emerald: {
        checkbox: 'data-[state=checked]:bg-emerald-500 border-emerald-500 outline-emerald-500',
        path: 'text-emerald-500 fill-current',
    },
    indigo: {
        checkbox: 'data-[state=checked]:bg-indigo-500 border-indigo-500 outline-indigo-500',
        path: 'text-indigo-500 fill-current',
    },
    rose: {
        checkbox: 'data-[state=checked]:bg-rose-500 border-rose-500 outline-rose-500',
        path: 'text-rose-500 fill-current',
    },
    sky: {
        checkbox: 'data-[state=checked]:bg-sky-500 border-sky-500 outline-sky-500',
        path: 'text-sky-500 fill-current',
    },
    slate: {
        checkbox: 'data-[state=checked]:bg-slate-500 border-slate-500 outline-slate-500',
        path: 'text-slate-500 fill-current',
    },
    light: {
        checkbox:
            'data-[state=checked]:bg-slate-300 border-slate-300 outline-slate-300 dark:data-[state=checked]:bg-slate-800 dark:border-slate-800 dark:outline-slate-800',
        path: 'text-slate-300 dark:text-slate-800 fill-current',
    },
} satisfies Record<string, LineChartVariableClassNames>;

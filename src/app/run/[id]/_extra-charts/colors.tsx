export interface LineChartVariableClassNames {
    checkbox: string;
    path: string;
    background: string;
    li: string;
}

export const tailwindChartColors = {
    red: {
        checkbox: 'data-[state=checked]:bg-red-500 border-red-500 outline-red-500',
        path: 'text-red-500 fill-current',
        background: 'bg-red-500',
        li: 'marker:text-red-500',
    },
    emerald: {
        checkbox: 'data-[state=checked]:bg-emerald-500 border-emerald-500 outline-emerald-500',
        path: 'text-emerald-500 fill-current',
        background: 'bg-emerald-500',
        li: 'marker:text-emerald-500',
    },
    green: {
        checkbox: 'data-[state=checked]:bg-green-500 border-green-500 outline-green-500',
        path: 'text-green-500 fill-current',
        background: 'bg-green-500',
        li: 'marker:text-green-500',
    },
    limeDark: {
        checkbox: 'data-[state=checked]:bg-lime-800 border-lime-800 outline-lime-800',
        path: 'text-lime-800 fill-current',
        background: 'bg-lime-800',
        li: 'marker:text-lime-800',
    },
    indigo: {
        checkbox: 'data-[state=checked]:bg-indigo-500 border-indigo-500 outline-indigo-500',
        path: 'text-indigo-500 fill-current',
        background: 'bg-indigo-500',
        li: 'marker:text-indigo-500',
    },
    rose: {
        checkbox: 'data-[state=checked]:bg-rose-500 border-rose-500 outline-rose-500',
        path: 'text-rose-500 fill-current',
        background: 'bg-rose-500',
        li: 'marker:text-rose-500',
    },
    sky: {
        checkbox: 'data-[state=checked]:bg-sky-500 border-sky-500 outline-sky-500',
        path: 'text-sky-500 fill-current',
        background: 'bg-sky-500',
        li: 'marker:text-sky-500',
    },
    slate: {
        checkbox: 'data-[state=checked]:bg-slate-500 border-slate-500 outline-slate-500',
        path: 'text-slate-500 fill-current',
        background: 'bg-slate-500',
        li: 'marker:text-slate-500',
    },
    light: {
        checkbox:
            'data-[state=checked]:bg-slate-300 border-slate-300 outline-slate-300 dark:data-[state=checked]:bg-slate-800 dark:border-slate-800 dark:outline-slate-800',
        path: 'text-slate-300 dark:text-slate-800 fill-current',
        background: 'bg-slate-300 dark:bg-slate-800',
        li: 'marker:text-slate-300 dark:marker:text-slate-800',
    },
    amberLight: {
        // checkbox:
        //     'data-[state=checked]:bg-amber-400 border-amber-400 outline-amber-400 dark:data-[state=checked]:bg-amber-200 dark:border-amber-200 dark:outline-amber-200',
        checkbox:
            'data-[state=checked]:bg-amber-400 border-amber-400 outline-amber-400 dark:data-[state=checked]:bg-amber-400 dark:border-amber-400 dark:outline-amber-400',
        path: 'text-amber-400 dark:text-amber-200 fill-current',
        background: 'bg-amber-400 dark:bg-amber-200',
        li: 'marker:text-amber-400 dark:marker:text-amber-200',
    },
} satisfies Record<string, LineChartVariableClassNames>;

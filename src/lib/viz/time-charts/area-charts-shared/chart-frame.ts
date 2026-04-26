export const chartBaseWidth = 400;
export const chartBaseHeight = 300;

const baseMarginTop = 25;
const baseMarginRight = 10;
const baseMarginBottom = 35;
const baseMarginLeft = 45;
const minPlotWidth = 80;
const minPlotHeight = 40;

export type ChartFrame = {
	widthWithMargin: number;
	heightWithMargin: number;
	marginTop: number;
	marginRight: number;
	marginBottom: number;
	marginLeft: number;
	width: number;
	height: number;
};

function fitMarginPair(total: number, startMargin: number, endMargin: number, minContent: number) {
	const maxMarginTotal = Math.max(0, total - minContent);
	const marginTotal = startMargin + endMargin;
	if (marginTotal <= maxMarginTotal || marginTotal === 0) {
		return [startMargin, endMargin] as const;
	}

	const scale = maxMarginTotal / marginTotal;
	return [startMargin * scale, endMargin * scale] as const;
}

export function getChartFrame(widthWithMargin: number, heightWithMargin: number): ChartFrame {
	const safeWidthWithMargin = Math.max(1, widthWithMargin);
	const safeHeightWithMargin = Math.max(1, heightWithMargin);
	const rawMarginTop = Math.max(baseMarginTop, safeHeightWithMargin * (baseMarginTop / chartBaseHeight));
	const rawMarginRight = Math.max(baseMarginRight, safeWidthWithMargin * (baseMarginRight / chartBaseWidth));
	const rawMarginBottom = Math.max(baseMarginBottom, safeHeightWithMargin * (baseMarginBottom / chartBaseHeight));
	const rawMarginLeft = Math.max(baseMarginLeft, safeWidthWithMargin * (baseMarginLeft / chartBaseWidth));
	const [marginLeft, marginRight] = fitMarginPair(safeWidthWithMargin, rawMarginLeft, rawMarginRight, minPlotWidth);
	const [marginTop, marginBottom] = fitMarginPair(safeHeightWithMargin, rawMarginTop, rawMarginBottom, minPlotHeight);

	return {
		widthWithMargin: safeWidthWithMargin,
		heightWithMargin: safeHeightWithMargin,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		width: Math.max(1, safeWidthWithMargin - marginLeft - marginRight),
		height: Math.max(1, safeHeightWithMargin - marginTop - marginBottom),
	};
}

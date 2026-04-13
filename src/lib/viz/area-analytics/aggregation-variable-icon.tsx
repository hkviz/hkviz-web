import { Clock12Icon, Clock2Icon, ClockArrowUpIcon, HashIcon, type LucideIcon } from 'lucide-solid';
import { Match, Switch } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { AggregationVariableAny } from '~/lib/aggregation/aggregation-value-specific';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { GameId } from '~/lib/types/game-ids';
import {
	coinImg,
	dreamNailImg,
	focusImg,
	hornetDeathPinImg,
	hornetHealthImg,
	maskImg,
	rosaryIconImg,
	shadeImg,
	shellShardImg,
	spellDownImg,
	spellFireballImg,
	spellUpImg,
} from '../img-urls';

interface IconInfoPrimitive {
	Icon?: LucideIcon;
	image?: string;
}

type IconInfo = IconInfoPrimitive | ((game: GameId) => IconInfoPrimitive);

export const aggregationVariableDisplayInfos: Record<AggregationVariableAny, IconInfo> = {
	visitOrder: {
		Icon: ClockArrowUpIcon,
	},
	visits: {
		Icon: HashIcon,
	},
	firstVisitMs: {
		Icon: Clock12Icon,
	},
	timeSpendMs: {
		Icon: Clock2Icon,
	},
	damageTaken: (game) => ({
		image: game === 'silk' ? hornetHealthImg : maskImg,
	}),
	deaths: (game) => ({
		image: game === 'silk' ? hornetDeathPinImg : shadeImg,
	}),
	focusing: {
		image: focusImg,
	},
	spellFireball: {
		image: spellFireballImg,
	},
	spellDown: {
		image: spellDownImg,
	},
	spellUp: {
		image: spellUpImg,
	},
	geoEarned: (game) => ({
		image: game === 'silk' ? rosaryIconImg : coinImg,
	}),
	geoSpent: (game) => ({
		image: game === 'silk' ? rosaryIconImg : coinImg,
	}),
	essenceEarned: {
		image: dreamNailImg,
	},
	essenceSpent: {
		image: dreamNailImg,
	},
	shellShardsEarned: {
		image: shellShardImg,
	},
	shellShardsSpent: {
		image: shellShardImg,
	},
};

export function AggregationVariableIcon(props: { variable: AggregationVariable; game: GameId }) {
	const displayInfos = () => {
		const info = aggregationVariableDisplayInfos[props.variable as AggregationVariableAny];
		return typeof info === 'function' ? info(props.game) : info;
	};

	return (
		<Switch>
			<Match when={'image' in displayInfos() && displayInfos()}>
				{(displayInfos) => (
					<img
						class="block h-6 w-6 object-contain object-center"
						src={displayInfos().image}
						alt={'Aggregation Variable icon'}
						aria-hidden={true}
					/>
				)}
			</Match>
			<Match when={'Icon' in displayInfos() && displayInfos()}>
				{(displayInfos) => <Dynamic component={displayInfos().Icon} class="h-5 w-5" />}
			</Match>
		</Switch>
	);
}

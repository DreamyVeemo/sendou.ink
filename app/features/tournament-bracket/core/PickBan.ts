import * as R from "remeda";
import type { ActionType, TournamentRoundMaps, WhoSide } from "~/db/tables";
import type {
	ModeShort,
	ModeWithStage,
	StageId,
} from "~/modules/in-game-lists/types";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator/types";
import invariant from "~/utils/invariant";
import { logger } from "~/utils/logger";
import { assertUnreachable } from "~/utils/types";
import { isSetOverByResults } from "../tournament-bracket-utils";
import type { TournamentDataTeam } from "./Tournament.server";

export const types = [
	"COUNTERPICK",
	"COUNTERPICK_MODE_REPEAT_OK",
	"BAN_2",
	"CUSTOM",
] as const;
export type Type = (typeof types)[number];

export function turnOf({
	results,
	maps,
	teams,
	mapList,
}: {
	results: Array<{ winnerTeamId: number }>;
	maps: TournamentRoundMaps;
	teams: [number, number];
	mapList?: TournamentMapListMap[] | null;
}) {
	if (!maps.pickBan) return null;
	if (!mapList) return null;

	switch (maps.pickBan) {
		case "BAN_2": {
			if (
				isSetOverByResults({ count: maps.count, results, countType: maps.type })
			) {
				return null;
			}

			// typically lower seed is the "bottom team" and they pick first
			const [secondPicker, firstPicker] = teams;

			if (
				!mapList.some((map) => map.bannedByTournamentTeamId === firstPicker)
			) {
				return firstPicker;
			}

			if (
				!mapList.some((map) => map.bannedByTournamentTeamId === secondPicker)
			) {
				return secondPicker;
			}

			return null;
		}
		case "COUNTERPICK_MODE_REPEAT_OK":
		case "COUNTERPICK": {
			// there exists an unplayed map
			if (mapList.length > results.length) return null;

			if (
				isSetOverByResults({ count: maps.count, results, countType: maps.type })
			) {
				return null;
			}

			const latestWinner = results[results.length - 1]?.winnerTeamId;
			invariant(latestWinner, "turnOf: No winner found");

			const result = teams.find(
				(tournamentTeamId) => latestWinner !== tournamentTeamId,
			);
			invariant(result, "turnOf: No result found");

			return result;
		}
		// CLAUDETODO: implement this
		case "CUSTOM": {
			// custom flow handling is done separately
			return null;
		}
		default: {
			assertUnreachable(maps.pickBan);
		}
	}
}

export function isLegal({
	map,
	...rest
}: MapListWithStatusesArgs & { map: ModeWithStage }) {
	const pool = mapsListWithLegality(rest);

	return pool.some(
		(m) => m.mode === map.mode && m.stageId === map.stageId && m.isLegal,
	);
}

interface MapListWithStatusesArgs {
	results: Array<{ mode: ModeShort; stageId: StageId; winnerTeamId: number }>;
	maps: TournamentRoundMaps | null;
	mapList: TournamentMapListMap[] | null;
	teams: [TournamentDataTeam, TournamentDataTeam];
	pickerTeamId: number;
	tieBreakerMapPool: ModeWithStage[];
	toSetMapPool: Array<{ mode: ModeShort; stageId: StageId }>;
}
export function mapsListWithLegality(args: MapListWithStatusesArgs) {
	const mapPool = (() => {
		if (!args.maps?.pickBan) return [];
		switch (args.maps.pickBan) {
			case "BAN_2": {
				if (!args.mapList) {
					logger.warn("mapsListWithLegality: mapList is empty");
					return [];
				}
				return args.mapList;
			}
			case "COUNTERPICK_MODE_REPEAT_OK":
			case "COUNTERPICK": {
				if (args.toSetMapPool.length === 0) {
					const combinedPools = [
						...(args.teams[0].mapPool ?? []),
						...(args.teams[1].mapPool ?? []),
						...args.tieBreakerMapPool,
					];

					const result: ModeWithStage[] = [];
					for (const map of combinedPools) {
						if (
							!result.some(
								(m) => m.mode === map.mode && m.stageId === map.stageId,
							)
						) {
							result.push(map);
						}
					}

					return result;
				}

				return args.toSetMapPool;
			}
			// CLAUDETODO: implement this
			case "CUSTOM": {
				return args.toSetMapPool;
			}
			default: {
				assertUnreachable(args.maps.pickBan);
			}
		}
	})();

	const modesIncluded = R.unique(mapPool.map((m) => m.mode));

	const unavailableStagesSet = unavailableStages(args);
	const unavailableModesSetAll = unavailableModes(args);
	const unavailableModesSet =
		// one mode tournament
		unavailableModesSetAll.size < modesIncluded.length
			? unavailableModesSetAll
			: new Set();

	const result = mapPool.map((map) => {
		const isLegal =
			!unavailableStagesSet.has(map.stageId) &&
			!unavailableModesSet.has(map.mode);

		return { ...map, isLegal };
	});

	const everythingBanned = result.every((map) => !map.isLegal);
	if (everythingBanned) {
		return result.map((map) => ({ ...map, isLegal: true }));
	}

	return result;
}

function unavailableStages({
	results,
	mapList,
	maps,
}: {
	results: Array<{ mode: ModeShort; stageId: StageId }>;
	mapList?: TournamentMapListMap[] | null;
	maps: TournamentRoundMaps | null;
}): Set<StageId> {
	if (!maps?.pickBan) return new Set();

	switch (maps.pickBan) {
		case "BAN_2": {
			return new Set(
				mapList
					?.filter((m) => m.bannedByTournamentTeamId)
					.map((map) => map.stageId) ?? [],
			);
		}
		case "COUNTERPICK_MODE_REPEAT_OK":
		case "COUNTERPICK": {
			return new Set(results.map((result) => result.stageId));
		}
		// CLAUDETODO: implement this
		case "CUSTOM": {
			return new Set();
		}
		default: {
			assertUnreachable(maps.pickBan);
		}
	}
}

function unavailableModes({
	results,
	pickerTeamId,
	maps,
}: {
	results: Array<{ mode: ModeShort; winnerTeamId: number }>;
	pickerTeamId: number;
	maps: TournamentRoundMaps | null;
}): Set<ModeShort> {
	if (
		!maps?.pickBan ||
		maps.pickBan === "BAN_2" ||
		maps.pickBan === "COUNTERPICK_MODE_REPEAT_OK" ||
		// CLAUDETODO: implement this
		maps.pickBan === "CUSTOM"
	) {
		return new Set();
	}

	// can't pick the same mode last won on
	const result = new Set(
		results
			.filter((result) => result.winnerTeamId === pickerTeamId)
			.slice(-1)
			.map((result) => result.mode),
	);

	return result;
}

const BEFORE_SET_INVALID_WHO: ReadonlySet<WhoSide> = new Set([
	"WINNER",
	"LOSER",
]);

export const CUSTOM_FLOW_VALIDATION_ERRORS = {
	STEP_MISSING_ACTION: "STEP_MISSING_ACTION",
	STEP_MISSING_WHO: "STEP_MISSING_WHO",
	LAST_STEP_MUST_BE_PICK_OR_ROLL: "LAST_STEP_MUST_BE_PICK_OR_ROLL",
	WINNER_LOSER_IN_PRE_SET: "WINNER_LOSER_IN_PRE_SET",
	TOO_MANY_MODE_PICKS: "TOO_MANY_MODE_PICKS",
} as const;
export type CustomFlowValidationError =
	(typeof CUSTOM_FLOW_VALIDATION_ERRORS)[keyof typeof CUSTOM_FLOW_VALIDATION_ERRORS];

interface ValidatableStep {
	action?: ActionType;
	side?: WhoSide;
}

export function validateCustomFlowSection(
	steps: ValidatableStep[],
	section: "preSet" | "postGame",
): CustomFlowValidationError[] {
	const errors: CustomFlowValidationError[] = [];

	for (const step of steps) {
		if (!step.action) {
			errors.push(CUSTOM_FLOW_VALIDATION_ERRORS.STEP_MISSING_ACTION);
			break;
		}
		if (step.action !== "ROLL" && !step.side) {
			errors.push(CUSTOM_FLOW_VALIDATION_ERRORS.STEP_MISSING_WHO);
			break;
		}
	}

	const lastStep = steps.at(-1);
	if (
		!lastStep ||
		(lastStep.action &&
			lastStep.action !== "PICK" &&
			lastStep.action !== "ROLL")
	) {
		errors.push(CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL);
	}

	if (section === "preSet") {
		for (const step of steps) {
			if (step.side && BEFORE_SET_INVALID_WHO.has(step.side)) {
				errors.push(CUSTOM_FLOW_VALIDATION_ERRORS.WINNER_LOSER_IN_PRE_SET);
				break;
			}
		}
	}

	const modePickCount = steps.filter((s) => s.action === "MODE_PICK").length;
	if (modePickCount > 1) {
		errors.push(CUSTOM_FLOW_VALIDATION_ERRORS.TOO_MANY_MODE_PICKS);
	}

	return errors;
}

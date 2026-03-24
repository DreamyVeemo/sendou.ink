import { describe, expect, it } from "vitest";
import {
	CUSTOM_FLOW_VALIDATION_ERRORS,
	validateCustomFlowSection,
} from "./PickBan";

// CLAUDETODO: maybe also validate that you can't do Pick (mode) followed by Pick (map) by the same team as that is clearly redundant
describe("validateCustomFlowSection", () => {
	it("returns no errors for valid preSet steps", () => {
		const steps = [
			{ action: "BAN" as const, side: "HIGHER_SEED" as const },
			{ action: "BAN" as const, side: "LOWER_SEED" as const },
			{ action: "PICK" as const, side: "HIGHER_SEED" as const },
		];

		expect(validateCustomFlowSection(steps, "preSet")).toEqual([]);
	});

	it("returns no errors for valid postGame steps", () => {
		const steps = [
			{ action: "BAN" as const, side: "WINNER" as const },
			{ action: "PICK" as const, side: "LOSER" as const },
		];

		expect(validateCustomFlowSection(steps, "postGame")).toEqual([]);
	});

	it("returns STEP_MISSING_ACTION when a step has no action", () => {
		const steps = [
			{ side: "ALPHA" as const },
			{ action: "PICK" as const, side: "ALPHA" as const },
		];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.STEP_MISSING_ACTION,
		);
	});

	it("returns STEP_MISSING_WHO when a non-ROLL step has no side", () => {
		const steps = [{ action: "BAN" as const }];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.STEP_MISSING_WHO,
		);
	});

	it("does not require side for ROLL steps", () => {
		const steps = [{ action: "ROLL" as const }];

		expect(validateCustomFlowSection(steps, "preSet")).toEqual([]);
	});

	it("returns LAST_STEP_MUST_BE_PICK_OR_ROLL when last step is BAN", () => {
		const steps = [
			{ action: "PICK" as const, side: "ALPHA" as const },
			{ action: "BAN" as const, side: "BRAVO" as const },
		];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL,
		);
	});

	it("returns LAST_STEP_MUST_BE_PICK_OR_ROLL when last step is MODE_BAN", () => {
		const steps = [{ action: "MODE_BAN" as const, side: "ALPHA" as const }];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL,
		);
	});

	it("allows PICK as last step", () => {
		const steps = [{ action: "PICK" as const, side: "ALPHA" as const }];

		const errors = validateCustomFlowSection(steps, "preSet");

		expect(errors).not.toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL,
		);
	});

	it("allows ROLL as last step", () => {
		const steps = [{ action: "ROLL" as const }];

		const errors = validateCustomFlowSection(steps, "postGame");

		expect(errors).not.toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL,
		);
	});

	it("returns WINNER_LOSER_IN_PRE_SET when WINNER is used in preSet", () => {
		const steps = [{ action: "PICK" as const, side: "WINNER" as const }];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.WINNER_LOSER_IN_PRE_SET,
		);
	});

	it("returns WINNER_LOSER_IN_PRE_SET when LOSER is used in preSet", () => {
		const steps = [{ action: "PICK" as const, side: "LOSER" as const }];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.WINNER_LOSER_IN_PRE_SET,
		);
	});

	it("allows WINNER/LOSER in postGame", () => {
		const steps = [
			{ action: "BAN" as const, side: "WINNER" as const },
			{ action: "PICK" as const, side: "LOSER" as const },
		];

		expect(validateCustomFlowSection(steps, "postGame")).toEqual([]);
	});

	it("returns TOO_MANY_MODE_PICKS when more than one MODE_PICK", () => {
		const steps = [
			{ action: "MODE_PICK" as const, side: "ALPHA" as const },
			{ action: "MODE_PICK" as const, side: "BRAVO" as const },
			{ action: "PICK" as const, side: "ALPHA" as const },
		];

		expect(validateCustomFlowSection(steps, "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.TOO_MANY_MODE_PICKS,
		);
	});

	it("allows exactly one MODE_PICK", () => {
		const steps = [
			{ action: "MODE_PICK" as const, side: "ALPHA" as const },
			{ action: "PICK" as const, side: "BRAVO" as const },
		];

		const errors = validateCustomFlowSection(steps, "preSet");

		expect(errors).not.toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.TOO_MANY_MODE_PICKS,
		);
	});

	it("returns LAST_STEP_MUST_BE_PICK_OR_ROLL for empty steps array", () => {
		expect(validateCustomFlowSection([], "preSet")).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL,
		);
	});

	it("can return multiple errors at once", () => {
		const steps = [
			{ action: "MODE_PICK" as const, side: "WINNER" as const },
			{ action: "MODE_PICK" as const, side: "LOSER" as const },
			{ action: "MODE_BAN" as const, side: "ALPHA" as const },
		];

		const errors = validateCustomFlowSection(steps, "preSet");

		expect(errors).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.WINNER_LOSER_IN_PRE_SET,
		);
		expect(errors).toContain(CUSTOM_FLOW_VALIDATION_ERRORS.TOO_MANY_MODE_PICKS);
		expect(errors).toContain(
			CUSTOM_FLOW_VALIDATION_ERRORS.LAST_STEP_MUST_BE_PICK_OR_ROLL,
		);
	});
});

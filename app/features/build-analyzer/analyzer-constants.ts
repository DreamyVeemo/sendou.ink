import type { DamageType } from "./analyzer-types";

export const MAX_LDE_INTENSITY = 21;

export const DAMAGE_TYPE = [
	"TURRET_MAX",
	"TURRET_MIN",
	"NORMAL_MAX_FULL_CHARGE", // Hydra Splatling goes from 32 to 40 dmg when fully charged
	"NORMAL_MAX",
	"NORMAL_MIN",
	"DIRECT",
	"DIRECT_MIN",
	"DIRECT_MAX",
	"DIRECT_SECONDARY_MIN",
	"DIRECT_SECONDARY_MAX",
	"FULL_CHARGE",
	"MAX_CHARGE",
	"TAP_SHOT",
	"DISTANCE",
	"SPLASH",
	"WAVE",
	"BOMB_DIRECT",
	"BOMB_NORMAL",
	"SPLATANA_VERTICAL",
	"SPLATANA_VERTICAL_DIRECT",
	"SPLATANA_HORIZONTAL",
	"SPLATANA_HORIZONTAL_DIRECT",
	"SPLASH_MIN",
	"SPLASH_MAX",
	"SPLASH_VERTICAL_MIN",
	"SPLASH_VERTICAL_MAX",
	"SPLASH_HORIZONTAL_MIN",
	"SPLASH_HORIZONTAL_MAX",
	"ROLL_OVER",
	"SPECIAL_MAX_CHARGE",
	"SPECIAL_MIN_CHARGE",
	"SPECIAL_THROW_DIRECT",
	"SPECIAL_THROW",
	"SPECIAL_SWING",
	"SPECIAL_CANNON",
	"SPECIAL_BULLET_MAX",
	"SPECIAL_BULLET_MIN",
	"SPECIAL_BUMP",
	"SPECIAL_JUMP",
	"SPECIAL_TICK",
	"SECONDARY_MODE_MAX",
	"SECONDARY_MODE_MIN",
] as const;

export const damageTypeToWeaponType: Record<
	DamageType,
	"MAIN" | "SUB" | "SPECIAL"
> = {
	NORMAL_MIN: "MAIN",
	NORMAL_MAX: "MAIN",
	TURRET_MAX: "MAIN",
	TURRET_MIN: "MAIN",
	SECONDARY_MODE_MAX: "MAIN",
	SECONDARY_MODE_MIN: "MAIN",
	NORMAL_MAX_FULL_CHARGE: "MAIN",
	DIRECT: "MAIN",
	DIRECT_MIN: "MAIN",
	DIRECT_MAX: "MAIN",
	DIRECT_SECONDARY_MAX: "MAIN",
	DIRECT_SECONDARY_MIN: "MAIN",
	FULL_CHARGE: "MAIN",
	MAX_CHARGE: "MAIN",
	TAP_SHOT: "MAIN",
	DISTANCE: "MAIN",
	SPLASH: "MAIN",
	BOMB_NORMAL: "SUB",
	BOMB_DIRECT: "SUB",
	SPLATANA_VERTICAL: "MAIN",
	SPLATANA_VERTICAL_DIRECT: "MAIN",
	SPLATANA_HORIZONTAL: "MAIN",
	SPLATANA_HORIZONTAL_DIRECT: "MAIN",
	SPLASH_MIN: "MAIN",
	SPLASH_MAX: "MAIN",
	SPLASH_HORIZONTAL_MAX: "MAIN",
	SPLASH_HORIZONTAL_MIN: "MAIN",
	SPLASH_VERTICAL_MAX: "MAIN",
	SPLASH_VERTICAL_MIN: "MAIN",
	ROLL_OVER: "MAIN",
	WAVE: "SPECIAL",
	SPECIAL_MAX_CHARGE: "SPECIAL",
	SPECIAL_MIN_CHARGE: "SPECIAL",
	SPECIAL_SWING: "SPECIAL",
	SPECIAL_THROW: "SPECIAL",
	SPECIAL_THROW_DIRECT: "SPECIAL",
	SPECIAL_BULLET_MIN: "SPECIAL",
	SPECIAL_BULLET_MAX: "SPECIAL",
	SPECIAL_CANNON: "SPECIAL",
	SPECIAL_BUMP: "SPECIAL",
	SPECIAL_JUMP: "SPECIAL",
	SPECIAL_TICK: "SPECIAL",
};

export const RAINMAKER_SPEED_PENALTY_MODIFIER = 0.8;

export const UNKNOWN_SHORT = "U";

export const MAX_AP = 57;

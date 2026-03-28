export function up(db) {
	db.transaction(() => {
		db.prepare(
			/*sql*/ `
      create table "TournamentStreamer" (
        "id" integer primary key autoincrement,
        "userId" integer,
        "tournamentId" integer not null,
        "twitchAccount" text not null,
        unique("twitchAccount", "tournamentId") on conflict ignore
      ) strict
    `,
		).run();
	})();
}

# Feature verification â€” September 12, 2026

59 application checks passed, plus 6 backend/merge tests and a storage-adapter integration check. Run `npm test` to repeat them. The GitHub deployment workflow now runs these tests.

Verified state and persistence: teacher/class/group/roster creation, profile changes, four log types, log editing/deletion, readiness/bodyweight check-ins, notes, tested maxes, food/water records, injury and weight flags, attendance, sessions, repeating schedules, cycles, goals, announcements, testing days, PR feed, staff/substitute configuration, personal schedules, and exercise management.

Verified rendering/navigation: all eight coach tabs, six reports, five student tabs, four staff-log tabs, substitute roster, athlete detail, session editor, TV session/leaderboard, starter sessions, cycles, and exercise editor. These checks establish rendering, not exhaustive interaction coverage of every control.

Verified forms/calculations: teacher creation, substitute login, PIN entry, lift logging, all four log editors, CSV/TSV quoting, clipboard export, readiness endpoints, 1RM/plates, sprint units, school-year boundaries, streaks, food search, and legacy sessions.

Browser check against isolated server: logged in as student, saved 155 lb x 6, opened a fresh page as coach, and confirmed the saved set in athlete history and spreadsheet export. No test athletes were added to the live school database.

Fixes: corrected reversed soreness/stress scoring and feet-based sprint conversion; rejected invalid log values; retained sharded history during exercise rename; cleaned related records on student deletion; merged independent concurrent saves while rejecting same-field conflicts.

Remaining before dependable school deployment:
- Permanent domain and named tunnel setup. Current public tunnel is temporary and its address can change.
- Individual student/teacher server sign-in was added September 13. Students can read and update their own personal records; teachers retain school-wide management; substitutes can mark attendance for the assigned teacher’s classes. The long password is now administrator-only. Account isolation, rejected cross-student changes, logout, rate limiting, and code-reset session invalidation have automated coverage.
- Automatic off-device backups and a restore drill. A pre-update database snapshot exists on the Pi, but the same SD card is not a separate backup.
- School-network and intended-device acceptance checks, plus real class-size load testing.

Not exhaustively verified: every timer/circuit variant, image uploads, print/download behavior on every browser, all program import formats, accessibility, and every malformed input. Passing these tests does not establish that every feature is 100% correct. A domain alone does not address the remaining items above.


## Individual login update — September 13

Verified in a browser: student signed in directly using an existing individual code, saved a readiness check-in, signed out, and teacher signed in using an individual code and saw that check-in. No shared server password was entered. Seven backend tests and all 59 application checks passed.

Roster and staff creation are available to signed-in teachers. On the public login screen, people select an existing account; self-enrollment and unauthenticated station mode are not exposed. Students receive only their own personal records, so school-wide leaderboards and team totals should be viewed from the coach/TV view. The administrator can still use the maintenance password. These access changes do not replace the remaining domain, backup, and school acceptance work.

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'star.db');
const DATA_DIR = path.join(__dirname, 'data');
mkdirSync(DATA_DIR, { recursive: true });

function query(sql) {
    const cmd = `sqlite3 -json "${DB_PATH}" "${sql.replace(/"/g, '\\"')}"`;
    try {
        const output = execSync(cmd).toString().trim();
        return output ? JSON.parse(output) : [];
    } catch (e) {
        console.error(`Query failed: ${sql}`);
        console.error(e.message);
        return [];
    }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const today = `${MONTHS[new Date().getUTCMonth()]} ${new Date().getUTCDate()}, ${new Date().getUTCFullYear()}`;

console.log("Exporting leaderboard.json...");
const leaderboard = query("SELECT name, stars_total FROM repos ORDER BY stars_total DESC LIMIT 20");
writeFileSync(path.join(DATA_DIR, 'leaderboard.json'), JSON.stringify({ updated_at: today, repos: leaderboard }, null, 2));

console.log("Exporting weekly-ranking.json...");
const maxWeek = query("SELECT MAX(week) as week FROM weekly_stats")[0]?.week;
const weeklyRanking = query(`
    SELECT w.repo_name AS name, w.new_stars, r.stars_total
    FROM weekly_stats w
    JOIN repos r ON r.name = w.repo_name
    WHERE w.week = '${maxWeek}'
    ORDER BY w.new_stars DESC
    LIMIT 20
`);
writeFileSync(path.join(DATA_DIR, 'weekly-ranking.json'), JSON.stringify({ updated_at: today, repos: weeklyRanking }, null, 2));

console.log("Exporting star-count.json...");
const starCounts = query("SELECT threshold, label, count FROM star_counts ORDER BY threshold DESC");
writeFileSync(path.join(DATA_DIR, 'star-count.json'), JSON.stringify({ updated_at: today, tiers: starCounts }, null, 2));

console.log("Exporting repos.json...");
// This one is complex because of percentile calculation, but let's do a simplified version or the full one.
const repos = query(`
    WITH recent AS (
      SELECT week FROM weekly_stats GROUP BY week ORDER BY week DESC LIMIT 8
    ),
    agg AS (
      SELECT
        w.repo_name,
        SUM(w.new_stars) AS agg_new_stars,
        SUM(w.pushes) AS agg_pushes,
        SUM(w.unique_contributors) AS agg_contributors,
        SUM(w.issues_closed) AS agg_issues_closed
      FROM weekly_stats w
      WHERE w.week IN (SELECT week FROM recent)
      GROUP BY w.repo_name
    )
    SELECT
      r.name,
      r.owner,
      r.stars_total,
      r.description,
      r.language,
      r.topics,
      r.license,
      r.homepage,
      r.forks_count,
      r.open_issues_count,
      r.created_at,
      r.archived,
      r.size,
      COALESCE(a.agg_new_stars, 0) AS agg_new_stars,
      COALESCE(a.agg_pushes, 0) AS agg_pushes,
      COALESCE(a.agg_contributors, 0) AS agg_contributors,
      COALESCE(a.agg_issues_closed, 0) AS agg_issues_closed,
      ROW_NUMBER() OVER (ORDER BY r.stars_total DESC) AS rank
    FROM repos r
    LEFT JOIN agg a ON a.repo_name = r.name
    ORDER BY r.stars_total DESC
`);

// Simplified percentile (or we can just do it in JS)
const rawValues = {
    stars: repos.map(r => r.stars_total),
    new_stars: repos.map(r => r.agg_new_stars),
    pushes: repos.map(r => r.agg_pushes),
    contributors: repos.map(r => r.agg_contributors),
    issues_closed: repos.map(r => r.agg_issues_closed),
    forks: repos.map(r => r.forks_count),
};

const sorted = {
    stars: [...rawValues.stars].sort((a, b) => a - b),
    new_stars: [...rawValues.new_stars].sort((a, b) => a - b),
    pushes: [...rawValues.pushes].sort((a, b) => a - b),
    contributors: [...rawValues.contributors].sort((a, b) => a - b),
    issues_closed: [...rawValues.issues_closed].sort((a, b) => a - b),
    forks: [...rawValues.forks].sort((a, b) => a - b),
};

function percentile(sortedArr, value) {
    let count = 0;
    for (const v of sortedArr) {
        if (v < value) count++;
    }
    return Math.round((count / sortedArr.length) * 99);
}

const cards = repos.map((r, i) => {
    let topics = [];
    try { topics = JSON.parse(r.topics); } catch (e) {}
    return {
        ...r,
        topics,
        archived: r.archived === 1,
        total_repos: repos.length,
        attributes: {
            stars: percentile(sorted.stars, rawValues.stars[i]),
            new_stars: percentile(sorted.new_stars, rawValues.new_stars[i]),
            pushes: percentile(sorted.pushes, rawValues.pushes[i]),
            contributors: percentile(sorted.contributors, rawValues.contributors[i]),
            issues_closed: percentile(sorted.issues_closed, rawValues.issues_closed[i]),
            forks: percentile(sorted.forks, rawValues.forks[i]),
        }
    };
});

writeFileSync(path.join(DATA_DIR, 'repos.json'), JSON.stringify({ min_stars: 0, repos: cards }, null, 2));

console.log("Done!");

import { db } from '../db/database.js';

export function listVerticals() {
  return db.prepare('SELECT vertical, label FROM market_axes ORDER BY rowid').all();
}

/** Assemble the full competitive picture for one vertical. */
export function marketForVertical(vertical: string) {
  const axes = db.prepare('SELECT * FROM market_axes WHERE vertical = ?').get(vertical) as any;
  if (!axes) return null;

  const competitors = (db.prepare('SELECT * FROM competitors WHERE vertical = ? ORDER BY is_us DESC, size DESC').all(vertical) as any[])
    .map((c) => ({ ...c, is_us: !!c.is_us }));

  const features = (db.prepare('SELECT * FROM market_features WHERE vertical = ? ORDER BY sort').all(vertical) as any[])
    .map((f) => ({ capability: f.capability, scores: JSON.parse(f.scores_json) }));

  const opportunities = db.prepare('SELECT num,title,body,impact,effort,detail FROM opportunities WHERE vertical = ? ORDER BY num').all(vertical);

  return {
    vertical: axes.vertical,
    label: axes.label,
    summary: axes.summary,
    axis: { l: axes.ax_l, r: axes.ax_r, t: axes.ax_t, b: axes.ax_b },
    competitors,
    features,
    opportunities,
  };
}

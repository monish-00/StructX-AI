const STEEL_LIMIT = { 250: 0.53, 415: 0.48, 500: 0.46 };

export function designSinglyReinforcedBeam({ b, d, fck, fy, Mu }) {
  for (const [name, value] of Object.entries({ b, d, fck, fy, Mu })) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a positive number.`);
  }
  if (d >= 10000 || b >= 10000) throw new Error('Dimensions must be entered in mm.');
  const xuMaxRatio = STEEL_LIMIT[fy];
  if (!xuMaxRatio) throw new Error('Supported steel grades: Fe250, Fe415, and Fe500 only.');
  const xuMax = xuMaxRatio * d;
  const MuLimit = 0.36 * fck * b * xuMax * (d - 0.42 * xuMax) / 1e6;
  const MuNmm = Mu * 1e6;
  if (Mu > MuLimit) return {
    supported: false, requested: Mu, limitingMoment: MuLimit,
    message: 'This section exceeds its singly reinforced limiting moment. Increase section capacity or use a separately verified design method; no reinforcement is proposed.'
  };
  // Solve Mu = 0.87 fy Ast (d - 0.42 xu), with xu = 0.87 fy Ast / (0.36 fck b).
  const a = 0.87 * fy * (0.42 * 0.87 * fy / (0.36 * fck * b));
  const c = MuNmm;
  const disc = (0.87 * fy * d) ** 2 - 4 * a * c;
  if (disc < 0) throw new Error('No real reinforcement solution for the supplied section.');
  const Ast = (0.87 * fy * d - Math.sqrt(disc)) / (2 * a);
  const xu = 0.87 * fy * Ast / (0.36 * fck * b);
  const MuCheck = 0.87 * fy * Ast * (d - 0.42 * xu) / 1e6;
  return {
    supported: true, b, d, fck, fy, Mu,
    Ast: round(Ast, 1), xu: round(xu, 1), xuMax: round(xuMax, 1),
    MuLimit: round(MuLimit, 2), MuCheck: round(MuCheck, 2),
    flexurePass: xu <= xuMax + 1e-8 && Math.abs(MuCheck - Mu) < 0.02,
    formula: 'Mu = 0.87 fy Ast (d − 0.42 xu); xu = 0.87 fy Ast / (0.36 fck b)',
    assumptions: ['Rectangular, singly reinforced section under sagging bending.','b and d are in mm; fck and fy are in N/mm²; Mu is in kN·m.','Limit-state flexure only; no load derivation, shear, deflection, detailing, durability, or construction checks.'],
    references: [{ code: 'IS 456:2000', verification: 'Clause/table/page not verified against an accessible source; reference verification required.' }]
  };
}
function round(n, places) { return Number(n.toFixed(places)); }

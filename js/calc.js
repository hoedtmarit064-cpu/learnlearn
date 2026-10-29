// ------------------------------------------------------------
// Calculations: energy needs, exercise, healthy-goal checks
// ------------------------------------------------------------

// Lowest daily goal we consider safe without medical supervision.
const MIN_SAFE_KCAL = 1200;

// Basal metabolic rate (energy at complete rest) – Mifflin-St Jeor formula.
function calcBMR(s) {
  const base = 10 * s.weight + 6.25 * s.height - 5 * s.age;
  return Math.round(s.sex === "male" ? base + 5 : base - 161);
}

// Daily energy need without workouts (workouts are logged separately).
function calcTDEE(s) {
  return Math.round(calcBMR(s) * Number(s.activity));
}

// Suggested daily goal: a moderate deficit, never more than 20 % of the
// daily need, and never below the safe minimum.
function suggestedGoal(s) {
  const tdee = calcTDEE(s);
  const deficit = Math.min(Number(s.deficit), Math.round(tdee * 0.2));
  return Math.max(MIN_SAFE_KCAL, tdee - deficit);
}

// The goal actually in use (own goal if set, otherwise the suggestion).
function dailyGoal(s) {
  if (s.customGoalOn && s.customGoal > 0) return Number(s.customGoal);
  return suggestedGoal(s);
}

// Calories burned by exercise.
// We use (MET − 1): the "1" is what you'd burn anyway while resting,
// and that is already included in your daily need. This avoids counting
// the same calories twice.
function calcActivityKcal(activityId, intensity, minutes, weightKg) {
  const met = findActivity(activityId).met[intensity] || 5;
  return Math.round((met - 1) * weightKg * (minutes / 60));
}

// Friendly warning text if a goal is too low, otherwise null.
function goalWarning(goal, s) {
  if (goal < MIN_SAFE_KCAL) {
    return `A daily goal under ${MIN_SAFE_KCAL} kcal is very low. Eating too little tends to cost muscle, energy and mood — and the weight often comes back. A small deficit works better long term.`;
  }
  const tdee = calcTDEE(s);
  if (goal < tdee * 0.75) {
    return `This goal is more than 25 % below your daily need (${tdee} kcal). That's a steep deficit — especially with lots of training. Consider a gentler pace.`;
  }
  return null;
}

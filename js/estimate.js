// ------------------------------------------------------------
// Free text → calorie estimate
//
// How it works:
// 1. The text is cleaned up and split into words ("tokens").
// 2. We look for the food names from foods.js, longest names first,
//    so "chicken rice" wins over "chicken" and "rice".
// 3. Words in front of a food tell us the amount:
//    "2 slices bread", "200g chicken", "half a mango", "large latte".
// ------------------------------------------------------------

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, ein: 1, eine: 1, einen: 1, einem: 1, einer: 1,
  two: 2, zwei: 2, three: 3, drei: 3, four: 4, vier: 4, five: 5, fünf: 5,
  six: 6, sechs: 6, half: 0.5, halb: 0.5, halbe: 0.5, halben: 0.5, halbes: 0.5,
  couple: 2, paar: 2,
};

// Measurement words → one standard unit name
const UNITS = {};
function units(name, words) { for (const w of words) UNITS[w] = name; }
units("g", ["g", "gr", "gram", "grams", "gramm", "grammes"]);
units("kg", ["kg", "kilo", "kilogram"]);
units("ml", ["ml", "milliliter", "millilitre", "milliliters"]);
units("l", ["l", "liter", "litre", "liters", "litres"]);
units("tbsp", ["tbsp", "tbsps", "tbs", "tablespoon", "tablespoons", "spoon", "spoons", "el", "esslöffel", "essloeffel", "löffel"]);
units("tsp", ["tsp", "tsps", "teaspoon", "teaspoons", "tl", "teelöffel", "teeloeffel"]);
units("cup", ["cup", "cups", "mug", "mugs", "tasse", "tassen", "becher"]);
units("slice", ["slice", "slices", "scheibe", "scheiben"]);
units("piece", ["piece", "pieces", "pcs", "pc", "stück", "stueck", "stk"]);
units("bowl", ["bowl", "bowls", "schüssel", "schale"]);
units("plate", ["plate", "plates", "teller"]);
units("glass", ["glass", "glasses", "glas", "gläser"]);
units("can", ["can", "cans", "dose", "bottle", "bottles", "flasche"]);
units("serving", ["serving", "servings", "portion", "portions", "portionen"]);
units("handful", ["handful", "handfuls", "handvoll"]);
units("scoop", ["scoop", "scoops"]);
units("stick", ["stick", "sticks", "spiesse", "spieße"]);
units("bar", ["bar", "bars", "riegel"]);
units("set", ["set", "sets"]);
units("x", ["x"]);

// Units we can convert: weight in grams, volume in millilitres
const WEIGHT_G = { g: 1, kg: 1000 };
const VOLUME_ML = { tbsp: 15, tsp: 5, cup: 240, ml: 1, l: 1000 };

// Size words multiply the portion
const SIZE_WORDS = {
  small: 0.7, klein: 0.7, kleine: 0.7, kleiner: 0.7, kleines: 0.7, mini: 0.5,
  large: 1.3, big: 1.3, groß: 1.3, große: 1.3, großer: 1.3, großes: 1.3,
  gross: 1.3, grosse: 1.3, double: 2, doppelt: 2,
};

// Small words we ignore when reporting "not recognised"
const FILLER_WORDS = new Set([
  "with", "and", "mit", "und", "of", "von", "the", "der", "die", "das", "some",
  "etwas", "extra", "plus", "little", "less", "more", "wenig", "viel", "no", "ohne",
  "in", "on", "auf", "dazu", "side", "for", "für", "my", "bit", "also", "auch",
  "or", "oder", "add", "added", "homemade", "selbstgemacht", "cooked", "gekocht",
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/½/g, " 0.5 ")
    .replace(/(\d),(\d)/g, "$1.$2")                  // German decimal comma: 1,5 → 1.5
    .replace(/(\d)\s*([a-zäöüß])/g, "$1 $2")         // 200g → 200 g
    .replace(/([a-zäöüß])(\d)/g, "$1 $2")            // x2 → x 2
    .replace(/[^\p{L}\p{N}.\s]/gu, " ")              // remove punctuation
    .replace(/(^|\s)\.|\.(\s|$)/g, " ")              // dots that are not decimals
    .split(/\s+/)
    .filter(Boolean);
}

// Prepare the list of food names once: [{ tokens, food }], longest first
const ALIAS_INDEX = (() => {
  const index = [];
  for (const f of FOODS) {
    const names = new Set(f.aliases.concat(f.name.replace(/\(.*\)/, "")));
    for (const alias of names) {
      const tokens = normalizeText(alias);
      if (tokens.length) index.push({ tokens, food: f });
    }
  }
  return index.sort((a, b) =>
    b.tokens.length - a.tokens.length || b.tokens.join(" ").length - a.tokens.join(" ").length);
})();

// Does a word from the text match a word of a food name? (also plurals)
function wordMatches(word, aliasWord) {
  return word === aliasWord ||
    word === aliasWord + "s" ||
    word === aliasWord + "es" ||
    word === aliasWord + "n" ||
    (aliasWord.endsWith("y") && word === aliasWord.slice(0, -1) + "ies");
}

// Small typos are OK: "copi o kosung" → "kopi o kosong", "chiken rice".
// One letter may differ per word. To avoid silly matches ("nice" → "rice"),
// a single-word food needs 5+ letters; a longer name needs at least one
// word spelled exactly.
function editDistanceIsOne(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;        // extra letter in a
    else if (a.length < b.length) j++;   // missing letter in a
    else { i++; j++; }                   // different letter
  }
  return edits + (a.length - i) + (b.length - j) === 1;
}

function matchAlias(tokens, i, aliasTokens, allowTypos) {
  const n = aliasTokens.length;
  if (i + n > tokens.length) return false;
  let exact = 0;
  for (let k = 0; k < n; k++) {
    const word = tokens[i + k], aliasWord = aliasTokens[k];
    if (wordMatches(word, aliasWord)) { exact++; continue; }
    const minLength = n === 1 ? 5 : 3;
    const typoOk = allowTypos && !FILLER_WORDS.has(word) &&
      word.length >= minLength && aliasWord.length >= minLength &&
      editDistanceIsOne(word, aliasWord);
    if (!typoOk) return false;
  }
  return n === 1 || exact > 0;
}

function aliasAt(tokens, i) {
  // First look for exact matches, then allow small typos
  for (const allowTypos of [false, true]) {
    for (const entry of ALIAS_INDEX) {
      if (matchAlias(tokens, i, entry.tokens, allowTypos)) return entry;
    }
  }
  return null;
}

function parseNumber(word) {
  if (word in NUMBER_WORDS) return NUMBER_WORDS[word];
  const n = parseFloat(word);
  return isNaN(n) ? null : n;
}

// Read the amount from the words in front of a food (from right to left):
// "4 tablespoons of", "200 g", "half a cup of", "2 large"
function readAmount(words) {
  let count = null, unit = null, size = 1;
  for (let k = words.length - 1; k >= 0; k--) {
    const w = words[k];
    if (w in UNITS) { if (!unit) unit = UNITS[w]; continue; }
    if (w in SIZE_WORDS) { size *= SIZE_WORDS[w]; continue; }
    if (w === "of" || w === "von") continue;
    const n = parseNumber(w);
    if (n !== null) {
      count = count === null ? n : count * n;   // "half a" → 0.5 × 1
      continue;
    }
    break;                          // any other word ends the amount
  }
  return { count, unit, size };
}

// How much of the food's standard portion is this amount?
// Returns { factor, label }
function portionFactor(f, amount) {
  const count = amount.count ?? 1;
  const unit = amount.unit;

  // Weight: "200 g chicken"
  if (unit in WEIGHT_G) {
    const grams = count * WEIGHT_G[unit];
    return { factor: grams / f.grams, label: `${formatQty(grams)} g` };
  }
  // Volume: "4 tbsp oats" → millilitres → grams (oats are lighter than yogurt).
  // If the food's own portion is that unit (e.g. "1 cup kopi"), count portions instead.
  if (unit in VOLUME_ML && unit !== f.portion) {
    const ml = count * VOLUME_ML[unit];
    const grams = ml * (f.density || 1);
    const label = unit === "ml" || unit === "l"
      ? `${formatQty(ml)} ml`
      : `${formatQty(count)} ${unit} (≈${Math.round(grams)} g)`;
    return { factor: grams / f.grams, label };
  }
  // Portions: "2 slices bread", "large latte", "egg prata x2"
  const factor = count * amount.size;
  return { factor, label: `${formatQty(factor)} ${f.portion}` };
}

// Main function: returns { items, unknown, kcal, protein }
function estimateFood(text) {
  const tokens = normalizeText(text);
  const items = [];
  const unknown = [];
  let lastEnd = 0;                  // first token not yet used

  let i = 0;
  while (i < tokens.length) {
    const entry = aliasAt(tokens, i);
    if (!entry) { i++; continue; }

    const f = entry.food;
    const before = tokens.slice(lastEnd, i);
    const amount = readAmount(before);

    // "chicken rice x2" → amount behind the food
    let end = i + entry.tokens.length;
    if (tokens[end] === "x" && parseNumber(tokens[end + 1] || "") !== null) {
      amount.count = (amount.count || 1) * parseNumber(tokens[end + 1]);
      end += 2;
    }

    // Words in front that weren't part of the amount → unknown
    collectUnknown(before, unknown);

    const { factor, label } = portionFactor(f, amount);

    items.push({
      name: f.name,
      label,
      kcal: Math.round(f.kcal * factor),
      protein: Math.round(f.protein * factor),
    });

    lastEnd = end;
    i = end;
  }
  collectUnknown(tokens.slice(lastEnd), unknown);

  return {
    items,
    unknown,
    kcal: items.reduce((sum, it) => sum + it.kcal, 0),
    protein: items.reduce((sum, it) => sum + it.protein, 0),
  };
}

function collectUnknown(words, unknown) {
  for (const w of words) {
    const isAmountWord = parseNumber(w) !== null || w in UNITS || w in SIZE_WORDS;
    if (!isAmountWord && !FILLER_WORDS.has(w) && w.length > 2) unknown.push(w);
  }
}

function formatQty(q) {
  if (q === 0.5) return "½";
  return Number.isInteger(q) ? String(q) : q.toFixed(1).replace(/\.0$/, "");
}

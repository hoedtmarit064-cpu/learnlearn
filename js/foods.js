// ------------------------------------------------------------
// Food database
//
// Each line is one food:
//   food(name, [words that mean this food], portion, grams, kcal, protein)
//
// - "portion" is what one serving means ("plate", "slice", ...)
// - "grams" is how much one portion weighs (used when you type "200g ...")
// - kcal and protein (g) are for ONE portion
//
// Values are typical averages (Singapore HPB, USDA and similar sources).
// Hawker portions vary a lot, so treat everything as an estimate.
// You can add your own foods here at any time – just copy a line.
// ------------------------------------------------------------

const FOODS = [];

function food(name, aliases, portion, grams, kcal, protein) {
  FOODS.push({ name, aliases, portion, grams, kcal, protein });
}

// ---------- Singapore hawker: rice dishes ----------
food("Chicken rice (steamed)", ["chicken rice", "hainanese chicken rice", "steamed chicken rice", "white chicken rice"], "plate", 380, 607, 25);
food("Roasted chicken rice", ["roasted chicken rice", "roast chicken rice"], "plate", 380, 650, 28);
food("Duck rice", ["duck rice", "braised duck rice"], "plate", 400, 670, 30);
food("Char siew rice", ["char siew rice", "char siu rice", "bbq pork rice"], "plate", 380, 600, 25);
food("Roast pork rice", ["roast pork rice", "siew yoke rice", "sio bak rice"], "plate", 380, 700, 25);
food("Nasi lemak", ["nasi lemak"], "plate", 350, 650, 20);
food("Economy rice (2 veg + 1 meat)", ["economy rice", "economic rice", "cai fan", "chap chye png", "mixed rice"], "plate", 450, 600, 22);
food("Nasi padang (rice + 2 dishes)", ["nasi padang"], "plate", 450, 750, 25);
food("Chicken biryani", ["biryani", "briyani", "chicken biryani", "nasi briyani"], "plate", 450, 880, 35);
food("Fried rice", ["fried rice", "egg fried rice", "yang chow fried rice", "nasi goreng"], "plate", 350, 650, 18);
food("Claypot rice", ["claypot rice"], "pot", 500, 800, 28);
food("Chicken curry with rice", ["curry chicken rice", "chicken curry rice"], "plate", 450, 700, 28);
food("Ayam penyet set", ["ayam penyet"], "set", 450, 900, 40);
food("Hainanese curry rice", ["curry rice", "scissors cut curry rice"], "plate", 450, 750, 22);
food("Chicken porridge", ["chicken porridge", "porridge", "congee", "fish porridge", "century egg porridge"], "bowl", 450, 300, 15);
food("Kway chap", ["kway chap", "kuay chap"], "set", 500, 650, 30);

// ---------- Singapore hawker: noodles ----------
food("Laksa", ["laksa", "curry laksa", "katong laksa"], "bowl", 500, 590, 22);
food("Char kway teow", ["char kway teow", "char kuay teow", "ckt"], "plate", 380, 744, 23);
food("Hokkien mee (fried)", ["hokkien mee", "hokkien prawn mee", "fried hokkien mee"], "plate", 380, 522, 18);
food("Bak chor mee (dry)", ["bak chor mee", "minced pork noodles", "mee pok tah"], "bowl", 350, 511, 25);
food("Wanton mee (dry)", ["wanton mee", "wonton mee", "wanton noodles", "wonton noodles"], "plate", 300, 409, 18);
food("Fishball noodles", ["fishball noodles", "fish ball noodles", "fishball noodle soup", "fishball mee pok"], "bowl", 450, 330, 15);
food("Mee goreng", ["mee goreng", "mee goreng mamak"], "plate", 380, 660, 18);
food("Mee rebus", ["mee rebus"], "bowl", 450, 571, 20);
food("Mee siam", ["mee siam"], "plate", 400, 520, 15);
food("Prawn noodle soup", ["prawn noodles", "prawn mee", "prawn noodle soup", "hae mee"], "bowl", 500, 450, 22);
food("Lor mee", ["lor mee"], "bowl", 500, 383, 16);
food("Ban mian (soup)", ["ban mian", "mee hoon kueh", "you mian"], "bowl", 550, 475, 22);
food("Sliced fish soup", ["fish soup", "sliced fish soup", "fish bee hoon", "fish soup bee hoon"], "bowl", 550, 340, 28);
food("Fish soup with milk", ["fish soup with milk", "milky fish soup"], "bowl", 550, 450, 28);
food("Beef hor fun", ["hor fun", "beef hor fun", "wat tan hor"], "plate", 450, 690, 25);
food("Yong tau foo (soup, 6 pieces)", ["yong tau foo", "ytf"], "bowl", 450, 350, 20);
food("Mala xiang guo", ["mala", "mala xiang guo", "mala hotpot"], "bowl", 400, 800, 25);
food("Fried bee hoon", ["fried bee hoon", "bee hoon", "mee hoon"], "plate", 300, 450, 10);
food("Pho", ["pho"], "bowl", 550, 450, 25);
food("Ramen", ["ramen"], "bowl", 550, 550, 22);

// ---------- Singapore hawker: other ----------
food("Kaya toast (2 slices)", ["kaya toast", "kaya butter toast"], "set", 70, 300, 5);
food("Kaya toast set (toast + 2 soft-boiled eggs, drink extra)", ["kaya toast set", "kaya set", "toast set", "breakfast set"], "set", 180, 450, 18);
food("Soft-boiled eggs (2)", ["soft boiled eggs", "half boiled eggs", "soft-boiled eggs"], "set", 110, 150, 13);
food("Roti prata (plain)", ["prata", "roti prata", "plain prata", "kosong prata"], "piece", 80, 210, 4);
food("Egg prata", ["egg prata", "prata telur"], "piece", 120, 280, 9);
food("Murtabak", ["murtabak"], "serving", 300, 700, 30);
food("Thosai", ["thosai", "dosa", "masala dosa"], "piece", 120, 200, 5);
food("Chapati", ["chapati", "chapatti"], "piece", 45, 120, 3);
food("Chicken satay", ["satay", "chicken satay", "satay stick"], "stick", 25, 40, 4);
food("Satay peanut sauce", ["peanut sauce", "satay sauce"], "serving", 50, 120, 4);
food("Popiah", ["popiah"], "roll", 150, 190, 6);
food("Fried carrot cake", ["carrot cake", "chai tow kway", "chye tow kway"], "plate", 300, 493, 10);
food("Oyster omelette", ["oyster omelette", "orh luak", "orh jian"], "plate", 250, 650, 18);
food("Bak kut teh (soup + ribs, no rice)", ["bak kut teh", "bkt"], "bowl", 450, 350, 30);
food("Fish head curry (shared portion)", ["fish head curry"], "serving", 350, 450, 30);
food("Chilli crab (shared portion)", ["chilli crab"], "serving", 300, 550, 35);
food("Sambal stingray", ["sambal stingray", "bbq stingray"], "serving", 250, 400, 40);
food("Chwee kueh", ["chwee kueh", "chwee kuey"], "piece", 50, 75, 1);
food("Soon kueh", ["soon kueh", "soon kway"], "piece", 70, 100, 3);
food("Otah", ["otah", "otak otak"], "piece", 50, 70, 6);
food("Rojak", ["rojak"], "plate", 250, 350, 8);
food("Curry puff", ["curry puff", "epok epok"], "piece", 80, 250, 5);
food("Char siew bao", ["char siew bao", "char siu bao", "bao", "pau", "char siew pau"], "piece", 70, 160, 6);
food("Siew mai", ["siew mai", "siu mai", "shumai"], "piece", 20, 50, 3);
food("Har gow", ["har gow", "har gao"], "piece", 20, 40, 2);
food("Chee cheong fun", ["chee cheong fun", "cheong fun", "rice rolls"], "plate", 200, 300, 8);
food("Lo mai gai", ["lo mai gai", "glutinous rice chicken"], "piece", 200, 400, 15);
food("Spring roll", ["spring roll", "spring rolls"], "piece", 40, 100, 2);
food("Dumpling (boiled)", ["dumpling", "dumplings", "jiaozi", "gyoza", "xiao long bao", "xlb"], "piece", 25, 50, 3);
food("Ondeh ondeh", ["ondeh ondeh", "onde onde"], "piece", 20, 45, 0);
food("Kueh lapis", ["kueh lapis", "kuih lapis", "kueh"], "piece", 40, 120, 1);
food("Ice kachang", ["ice kachang", "ais kacang", "ice kacang"], "bowl", 400, 250, 3);
food("Chendol", ["chendol", "cendol"], "bowl", 350, 400, 4);
food("Tau huay (soybean pudding)", ["tau huay", "beancurd", "douhua", "soybean pudding"], "bowl", 250, 150, 7);
food("Sushi", ["sushi", "nigiri", "maki"], "piece", 30, 50, 2);
food("Bibimbap", ["bibimbap"], "bowl", 500, 550, 20);
food("Tom yum soup", ["tom yum", "tom yam"], "bowl", 400, 200, 15);
food("Green curry with rice", ["green curry", "thai green curry"], "plate", 450, 750, 25);

// ---------- Drinks (Singapore kopitiam & more) ----------
food("Kopi (with condensed milk)", ["kopi"], "cup", 250, 100, 2);
food("Kopi-O (with sugar)", ["kopi o", "kopi-o"], "cup", 250, 60, 0);
food("Kopi-O kosong (black, no sugar)", ["kopi o kosong", "kopi-o kosong", "black coffee", "americano", "espresso", "kaffee schwarz"], "cup", 250, 5, 0);
food("Kopi-C (evaporated milk + sugar)", ["kopi c", "kopi-c"], "cup", 250, 80, 2);
food("Teh (with condensed milk)", ["teh", "teh tarik", "milk tea"], "cup", 250, 110, 2);
food("Teh-O (with sugar)", ["teh o", "teh-o"], "cup", 250, 55, 0);
food("Tea (plain)", ["tea", "green tea", "tee", "teh o kosong", "teh-o kosong"], "cup", 250, 2, 0);
food("Milo", ["milo", "milo dinosaur"], "cup", 250, 160, 4);
food("Bandung", ["bandung"], "glass", 300, 200, 3);
food("Bubble tea", ["bubble tea", "boba", "pearl milk tea"], "cup", 500, 350, 3);
food("Sugarcane juice", ["sugarcane juice", "sugarcane"], "cup", 300, 250, 0);
food("Coconut water", ["coconut water", "coconut"], "cup", 300, 60, 1);
food("Latte", ["latte", "cafe latte", "milchkaffee"], "cup", 350, 190, 10);
food("Cappuccino", ["cappuccino", "flat white"], "cup", 250, 120, 7);
food("Coffee with milk", ["coffee", "kaffee", "coffee with milk"], "cup", 250, 40, 2);
food("Soft drink (can)", ["coke", "cola", "soft drink", "sprite", "soda", "100plus", "fanta"], "can", 330, 140, 0);
food("Diet soft drink", ["coke zero", "diet coke", "cola zero", "pepsi max"], "can", 330, 1, 0);
food("Orange juice", ["orange juice", "juice", "orangensaft", "saft"], "glass", 250, 110, 2);
food("Smoothie", ["smoothie"], "cup", 350, 250, 3);
food("Protein shake (with water)", ["protein shake", "protein", "whey", "proteinshake"], "scoop", 30, 120, 24);
food("Beer", ["beer", "tiger", "bier"], "can", 330, 150, 1);
food("Wine", ["wine", "wein", "red wine", "white wine"], "glass", 150, 125, 0);
food("Water", ["water", "wasser"], "glass", 250, 0, 0);

// ---------- Basics: grains, bread, breakfast ----------
food("White rice (cooked)", ["rice", "white rice", "reis"], "bowl", 200, 260, 5);
food("Brown rice (cooked)", ["brown rice", "naturreis", "vollkornreis"], "bowl", 200, 220, 5);
food("Noodles (cooked)", ["noodles", "nudeln", "mee", "udon", "soba"], "bowl", 200, 220, 7);
food("Pasta (cooked, plain)", ["pasta", "spaghetti", "penne"], "plate", 200, 310, 11);
food("Pasta with tomato sauce", ["pasta with tomato sauce", "spaghetti with tomato sauce", "pasta pomodoro"], "plate", 350, 550, 16);
food("Spaghetti bolognese", ["bolognese", "spaghetti bolognese", "pasta bolognese"], "plate", 400, 650, 30);
food("White bread", ["bread", "toast", "white bread", "brot", "toastbrot"], "slice", 30, 75, 3);
food("Wholemeal bread", ["wholemeal bread", "whole wheat bread", "wholegrain bread", "vollkornbrot", "brown bread", "sourdough"], "slice", 40, 95, 4);
food("Bread roll", ["bread roll", "roll", "bun", "brötchen", "broetchen"], "piece", 60, 160, 5);
food("Croissant", ["croissant"], "piece", 60, 230, 5);
food("Bagel", ["bagel"], "piece", 100, 270, 10);
food("Oats", ["oats", "oatmeal", "porridge oats", "haferflocken", "overnight oats"], "serving", 40, 150, 5);
food("Muesli", ["muesli", "müsli", "musli"], "serving", 50, 190, 5);
food("Granola", ["granola"], "serving", 50, 230, 5);
food("Cereal", ["cereal", "cornflakes"], "serving", 30, 110, 2);
food("Pancake", ["pancake", "pancakes", "pfannkuchen"], "piece", 60, 120, 3);
food("Waffle", ["waffle", "waffel"], "piece", 75, 220, 5);

// ---------- Eggs, meat, fish, tofu ----------
food("Egg", ["egg", "eggs", "boiled egg", "ei", "eier"], "piece", 55, 75, 6.5);
food("Fried egg", ["fried egg", "sunny side up", "spiegelei"], "piece", 55, 90, 6.5);
food("Omelette (2 eggs)", ["omelette", "omelet", "scrambled eggs", "rührei", "ruehrei"], "serving", 130, 200, 13);
food("Chicken breast (cooked)", ["chicken breast", "hähnchenbrust", "haehnchenbrust"], "serving", 120, 200, 37);
food("Chicken (cooked)", ["chicken", "hähnchen", "haehnchen", "huhn", "chicken thigh"], "serving", 120, 250, 30);
food("Fried chicken", ["fried chicken", "ayam goreng"], "piece", 130, 320, 22);
food("Chicken wing (fried)", ["fried chicken wing", "fried chicken wings", "chicken wing", "chicken wings", "wing", "wings"], "piece", 50, 110, 8);
food("Beef steak", ["steak", "beef", "rindfleisch"], "serving", 150, 300, 40);
food("Minced beef (cooked)", ["minced beef", "ground beef", "hackfleisch"], "serving", 100, 250, 26);
food("Pork (cooked)", ["pork", "schwein", "schweinefleisch"], "serving", 120, 290, 32);
food("Bacon", ["bacon", "speck"], "slice", 10, 45, 3);
food("Ham", ["ham", "schinken"], "slice", 20, 25, 4);
food("Sausage", ["sausage", "wurst", "hot dog"], "piece", 70, 200, 8);
food("Salmon", ["salmon", "lachs"], "serving", 120, 250, 25);
food("Fish fillet", ["fish", "fish fillet", "fisch", "white fish", "dory"], "serving", 120, 130, 26);
food("Tuna (canned in water)", ["tuna", "thunfisch"], "can", 100, 120, 26);
food("Prawns", ["prawns", "shrimp", "prawn", "garnelen"], "serving", 100, 100, 24);
food("Tofu", ["tofu", "tau kwa", "taukwa"], "serving", 100, 80, 8);
food("Tempeh", ["tempeh"], "serving", 100, 190, 19);

// ---------- Dairy & spreads ----------
food("Cheese (slice)", ["cheese", "käse", "kaese", "cheese slice"], "slice", 25, 100, 6);
food("Cheddar", ["cheddar"], "serving", 30, 120, 7);
food("Mozzarella", ["mozzarella"], "serving", 30, 85, 6);
food("Feta", ["feta"], "serving", 30, 80, 4);
food("Cottage cheese", ["cottage cheese", "hüttenkäse"], "serving", 100, 100, 12);
food("Cream cheese", ["cream cheese", "frischkäse"], "serving", 30, 100, 2);
food("Milk", ["milk", "milch", "full cream milk"], "glass", 250, 160, 8);
food("Low-fat milk", ["low fat milk", "skim milk", "fettarme milch"], "glass", 250, 110, 8);
food("Soy milk", ["soy milk", "soya milk", "soy bean milk", "sojamilch"], "glass", 250, 100, 7);
food("Oat milk", ["oat milk", "hafermilch"], "glass", 250, 120, 2);
food("Greek yogurt", ["greek yogurt", "greek yoghurt", "griechischer joghurt"], "serving", 150, 150, 15);
food("Yogurt", ["yogurt", "yoghurt", "joghurt"], "serving", 150, 100, 6);
food("Skyr", ["skyr", "quark", "magerquark"], "serving", 150, 95, 16);
food("Butter", ["butter"], "tsp", 5, 36, 0);
food("Peanut butter", ["peanut butter", "erdnussbutter"], "tbsp", 16, 95, 4);
food("Jam", ["jam", "marmelade", "konfitüre"], "tbsp", 20, 50, 0);
food("Honey", ["honey", "honig"], "tbsp", 21, 64, 0);
food("Nutella", ["nutella", "chocolate spread"], "tbsp", 19, 100, 1);
food("Kaya", ["kaya"], "tbsp", 20, 60, 1);
food("Olive oil", ["olive oil", "oil", "öl", "olivenöl"], "tbsp", 14, 120, 0);
food("Avocado (half)", ["avocado"], "half", 70, 120, 1.5);
food("Hummus", ["hummus"], "serving", 30, 70, 2);

// ---------- Fruit ----------
food("Apple", ["apple", "apfel"], "piece", 180, 95, 0.5);
food("Banana", ["banana", "banane"], "piece", 120, 105, 1.3);
food("Orange", ["orange", "mandarin", "orange fruit"], "piece", 130, 60, 1.2);
food("Mango", ["mango"], "piece", 200, 120, 1.6);
food("Papaya", ["papaya"], "cup", 150, 60, 0.7);
food("Watermelon", ["watermelon", "wassermelone"], "slice", 280, 85, 1.7);
food("Pineapple", ["pineapple", "ananas"], "cup", 165, 80, 0.9);
food("Grapes", ["grapes", "trauben"], "cup", 150, 100, 1);
food("Strawberries", ["strawberries", "strawberry", "erdbeeren"], "cup", 150, 50, 1);
food("Blueberries", ["blueberries", "heidelbeeren", "berries", "beeren"], "cup", 150, 85, 1);
food("Dragon fruit", ["dragon fruit", "dragonfruit", "pitaya"], "piece", 300, 150, 3);
food("Durian", ["durian"], "seed", 50, 75, 1);
food("Pear", ["pear", "birne"], "piece", 180, 100, 0.6);
food("Kiwi", ["kiwi"], "piece", 75, 45, 0.8);
food("Dates", ["date", "dates", "datteln"], "piece", 8, 23, 0.2);
food("Fruit (mixed)", ["fruit", "fruits", "obst", "fruit salad"], "cup", 150, 80, 1);

// ---------- Vegetables & sides ----------
food("Salad (no dressing)", ["salad", "salat", "greens"], "bowl", 100, 30, 2);
food("Salad dressing", ["dressing", "salad dressing"], "tbsp", 15, 70, 0);
food("Stir-fried vegetables", ["vegetables", "veggies", "gemüse", "kai lan", "kailan", "kangkong", "bok choy", "xiao bai cai", "stir fried vegetables", "stir-fried vegetables"], "plate", 200, 150, 4);
food("Broccoli", ["broccoli", "brokkoli"], "cup", 90, 30, 2.5);
food("Cucumber", ["cucumber", "gurke"], "piece", 150, 20, 1);
food("Tomato", ["tomato", "tomatoes", "tomate", "tomaten"], "piece", 120, 20, 1);
food("Carrot", ["carrot", "carrots", "karotte", "möhre"], "piece", 60, 25, 0.6);
food("Spinach (cooked)", ["spinach", "spinat"], "cup", 180, 40, 5);
food("Potato (boiled)", ["potato", "potatoes", "kartoffel", "kartoffeln"], "piece", 170, 150, 4);
food("Sweet potato", ["sweet potato", "süßkartoffel", "suesskartoffel"], "piece", 130, 110, 2);
food("Corn", ["corn", "mais", "sweet corn"], "cob", 100, 90, 3);
food("Fries", ["fries", "french fries", "chips fries", "pommes"], "serving", 115, 340, 4);

// ---------- Western / fast food ----------
food("Burger", ["burger", "hamburger"], "piece", 220, 500, 25);
food("Cheeseburger (small)", ["cheeseburger"], "piece", 120, 300, 15);
food("Big Mac", ["big mac"], "piece", 220, 560, 26);
food("Pizza", ["pizza"], "slice", 110, 285, 12);
food("Sandwich", ["sandwich", "subway", "belegtes brot"], "piece", 200, 350, 18);
food("Wrap", ["wrap", "burrito"], "piece", 250, 450, 20);
food("Kebab / döner", ["kebab", "döner", "doner", "shawarma"], "piece", 350, 650, 30);
food("Soup", ["soup", "suppe"], "bowl", 350, 200, 8);
food("Chicken salad", ["chicken salad", "salad with chicken"], "bowl", 300, 400, 30);
food("Chicken curry", ["curry", "chicken curry"], "serving", 250, 400, 25);
food("Stir fry", ["stir fry", "wok"], "plate", 350, 450, 22);

// ---------- Snacks & sweets ----------
food("Chocolate bar", ["chocolate", "schokolade", "chocolate bar", "kitkat", "snickers"], "bar", 45, 240, 3);
food("Dark chocolate", ["dark chocolate", "zartbitter"], "piece", 10, 55, 1);
food("Chips / crisps", ["crisps", "potato chips", "chips", "pringles"], "bag", 30, 160, 2);
food("Nuts", ["nuts", "nüsse", "mixed nuts", "cashews", "peanuts"], "handful", 30, 180, 6);
food("Almonds", ["almonds", "mandeln"], "handful", 30, 170, 6);
food("Cookie", ["cookie", "cookies", "biscuit", "biscuits", "keks", "kekse"], "piece", 15, 75, 1);
food("Cake", ["cake", "kuchen", "cheesecake", "torte"], "slice", 100, 350, 5);
food("Ice cream", ["ice cream", "eis", "gelato"], "scoop", 65, 140, 2);
food("Muffin", ["muffin"], "piece", 110, 400, 6);
food("Donut", ["donut", "doughnut"], "piece", 75, 250, 4);
food("Protein bar", ["protein bar", "proteinriegel"], "bar", 60, 200, 20);
food("Muesli bar", ["muesli bar", "granola bar", "cereal bar", "müsliriegel"], "bar", 30, 120, 2);
food("Popcorn", ["popcorn"], "cup", 10, 55, 1);
food("Rice cake", ["rice cake", "reiswaffel"], "piece", 9, 35, 1);

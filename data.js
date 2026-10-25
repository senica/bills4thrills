/* Bills 4 Thrills — fictional demo profiles. Not real people. */
window.B4T_PROFILES = [
  {
    id: "jessica",
    name: "Jessica",
    age: 31,
    photo: "https://i.pravatar.cc/600?img=32",
    tagline: "Single mom of two · Phoenix, AZ",
    story: "Two kids, one car with a mysterious rattle, and an AC that worked overtime all summer. I'm crushing it at work, but July's heat wave crushed my budget.",
    billType: "Electric",
    emoji: "⚡",
    amount: 142,
    due: "2026-11-03"
  },
  {
    id: "marcus",
    name: "Marcus",
    age: 20,
    photo: "https://i.pravatar.cc/600?img=12",
    tagline: "Sophomore · Nursing major",
    story: "I've eaten ramen 11 days in a row. I'm not complaining, I'm just saying the textbook for Anatomy costs more than my car did.",
    billType: "Textbooks",
    emoji: "📚",
    amount: 289,
    due: "2026-11-01"
  },
  {
    id: "priya",
    name: "Priya",
    age: 27,
    photo: "https://i.pravatar.cc/600?img=16",
    tagline: "Grad student · Lab rat (affectionately)",
    story: "I study clean water for a living, which is ironic because my water bill is the one thing I can't seem to keep clean.",
    billType: "Water",
    emoji: "💧",
    amount: 64,
    due: "2026-11-07"
  },
  {
    id: "dana",
    name: "Dana",
    age: 36,
    photo: "https://i.pravatar.cc/600?img=36",
    tagline: "Single mom · Night-shift nurse",
    story: "I keep other people's kids healthy all night, then come home to my own tiny tornado. Our pediatrician bill showed up looking very confident.",
    billType: "Medical",
    emoji: "🩺",
    amount: 210,
    due: "2026-11-10"
  },
  {
    id: "tyler",
    name: "Tyler",
    age: 22,
    photo: "https://i.pravatar.cc/600?img=8",
    tagline: "Senior · Computer science",
    story: "My Wi‑Fi is how I do homework, apply to jobs, and pretend to be productive. Losing it would be a full-blown tragedy in three acts.",
    billType: "Internet",
    emoji: "📶",
    amount: 75,
    due: "2026-11-05"
  },
  {
    id: "rosa",
    name: "Rosa",
    age: 29,
    photo: "https://i.pravatar.cc/600?img=34",
    tagline: "Single mom · Baker & small business owner",
    story: "I make the best tres leches in town. My oven agrees, which is why it ran all month. Gas bill, meet my secret ingredient: optimism.",
    billType: "Gas",
    emoji: "🔥",
    amount: 98,
    due: "2026-11-04"
  },
  {
    id: "jordan",
    name: "Jordan",
    age: 19,
    photo: "https://i.pravatar.cc/600?img=60",
    tagline: "Freshman · Undeclared (and proud)",
    story: "First time living on my own. Nobody told me phones cost money every single month. Mom says this is a learning experience. I've learned.",
    billType: "Phone",
    emoji: "📱",
    amount: 55,
    due: "2026-11-02"
  },
  {
    id: "keisha",
    name: "Keisha",
    age: 34,
    photo: "https://i.pravatar.cc/600?img=45",
    tagline: "Single mom of three · Teacher's aide",
    story: "Three kids, three growth spurts, one very hungry household. Our grocery bill could use a hero, and you look like the type.",
    billType: "Groceries",
    emoji: "🛒",
    amount: 160,
    due: "2026-11-06"
  }
];

/* Leaderboard — fictional donors. All-time and "this week" totals are made up. */
window.B4T_TIERS = [
  { min: 25000, label: "Bill Baron", emoji: "🏆" },
  { min: 10000, label: "Utility Tycoon", emoji: "💎" },
  { min: 5000, label: "Rent Rescuer", emoji: "🔥" },
  { min: 1000, label: "Power Patron", emoji: "⚡" },
  { min: 250, label: "Drip Donor", emoji: "💧" },
  { min: 1, label: "Penny Philanthropist", emoji: "🪙" },
  { min: 0, label: "Fresh Thumb", emoji: "👍" }
];

window.B4T_DONORS = [
  { handle: "YachtDaddy42", emoji: "🛥️", allTime: { total: 48250, bills: 212 }, week: { total: 2410, bills: 11 } },
  { handle: "Trust Fund Tina", emoji: "👛", allTime: { total: 31780, bills: 164 }, week: { total: 1980, bills: 9 } },
  { handle: "CryptoChad", emoji: "🚀", allTime: { total: 22400, bills: 97 }, week: { total: 2950, bills: 14 } },
  { handle: "Sir Spends-a-Lot", emoji: "🎩", allTime: { total: 14920, bills: 71 }, week: { total: 640, bills: 4 } },
  { handle: "Old Money Margaret", emoji: "🦢", allTime: { total: 9875, bills: 58 }, week: { total: 1120, bills: 6 } },
  { handle: "HedgeFund Hank", emoji: "📈", allTime: { total: 6300, bills: 30 }, week: { total: 310, bills: 2 } },
  { handle: "Brunch Barbara", emoji: "🥂", allTime: { total: 3450, bills: 27 }, week: { total: 480, bills: 5 } },
  { handle: "Venture Vince", emoji: "🦄", allTime: { total: 1890, bills: 12 }, week: { total: 95, bills: 1 } },
  { handle: "Influencer Ivy", emoji: "🤳", allTime: { total: 960, bills: 9 }, week: { total: 220, bills: 2 } },
  { handle: "DentistDave", emoji: "🦷", allTime: { total: 410, bills: 3 }, week: { total: 140, bills: 1 } }
];

'use strict';
export const SlimeFacts = [
"Slimes love Firefox",
"Firefox runs smooth like slime",
"Slimes browse anonymously",
"Open source slimes for open web",
"Slimes hate tab hoarding",
"Firefox extensions make slimes happy",
"Slimes prefer dark mode",
"Privacy focused slimes",
"Slimes never track you",
"Firefox is slime approved",
"Slimes evolve with AI",
"Slimes love the internet",
"Slimes dream of electric tabs",
"Slimes learn from your habits",
"Slimes adapt to your workflow",
"Tech friendly slimes",
"Slimes understand algorithms",
"Slimes never go offline",
"Digital slimes for digital age",
"Rimuru became a Demon Lord",
"Slimes can be overpowered",
"Veldora taught Rimuru magic",
"Great Sage lives in slimes",
"Slimes can absorb anything",
"Jura Tempest built on trust",
"Milim is strongest Demon Lord",
"Slimes can shapeshift",
"Predator skill is real",
"Slimes name their friends",
"Slimes are 95 percent water",
"Slimes regenerate from cells",
"Some slimes glow in dark",
"Slimes have no brain",
"Slimes solve mazes easily",
"Slimes eat bacteria",
"Slimes live in forests",
"Slimes move very slowly",
"Slimes sense light",
"Slimes reproduce by splitting",
"Feed me tabs please",
"I eat tabs for breakfast",
"Burp that was spicy",
"Tabs taste better organized",
"Your tab count is my score",
"I dream of closed tabs",
"Slimes love clean browsers",
"One tab at a time",
"Slimes never judge your tabs",
"Click me for more facts",
"Clean tabs clear mind",
"You are doing great",
"Small wins matter",
"Progress not perfection",
"One tab closed at a time",
"You got this hero",
"Stay organized friend",
"Slimes believe in you",
"Keep going strong",
"Every tab counts"
];
export const getSlimeFact = () => {
return SlimeFacts[Math.floor(Math.random() * SlimeFacts.length)];
};
export const getContextualFact = (tabCount) => {
if (Math.random() > 0.7) {
if (tabCount === 0) return "Empty... Feed me";
if (tabCount > 30) return "More than Tempest";
if (tabCount < 5) return "Minimalist vibes";
}
return getSlimeFact();
};
export const SlimeTapCounter = { count: 0, timeout: null };
export const checkTripleTap = () => {
SlimeTapCounter.count++;
if (SlimeTapCounter.timeout) clearTimeout(SlimeTapCounter.timeout);
SlimeTapCounter.timeout = setTimeout(() => { SlimeTapCounter.count = 0; }, 500);
if (SlimeTapCounter.count >= 3) {
SlimeTapCounter.count = 0;
return true;
}
return false;
};

export function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 5) return { text: "Burning the midnight oil?", emoji: "🌙" };
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", emoji: "🌅" };
  return { text: "Working late?", emoji: "🌙" };
}

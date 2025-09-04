export interface SeasonalEvent {
  id: string
  name: string
  slug: string
  date: string
  timezone: string
  description: string
  emoji: string
  color: string
  keywords: string[]
  metaDescription: string
}

export const seasonalEvents: SeasonalEvent[] = [
  // 🎄 Holidays
  {
    id: "christmas-2025",
    name: "Christmas 2025",
    slug: "christmas-2025",
    date: "2025-12-25T00:00",
    timezone: "UTC",
    description: "Track the countdown to Christmas Day 2025! Christmas is the most celebrated holiday worldwide, bringing families together for gift-giving, festive meals, and creating cherished memories. Whether you're planning your holiday shopping, organizing family gatherings, or just counting down to the magic of Christmas morning, this countdown timer helps you track every moment until December 25th.",
    emoji: "🎄",
    color: "red",
    keywords: ["christmas", "christmas 2025", "holiday countdown", "christmas timer", "xmas countdown", "december 25"],
    metaDescription: "Free countdown to Christmas 2025. Track days, hours, minutes until Christmas Day. Shareable link, embeddable widget, no signup required."
  },
  {
    id: "new-year-2026",
    name: "New Year 2026",
    slug: "new-year-2026", 
    date: "2026-01-01T00:00",
    timezone: "UTC",
    description: "Count down to the start of 2026! New Year's Eve is a time for reflection, resolutions, and celebration as we welcome fresh beginnings. Join millions around the world in counting down to midnight on December 31st, 2025, as we say goodbye to the old year and embrace the possibilities of 2026.",
    emoji: "🎊",
    color: "purple",
    keywords: ["new year", "new year 2026", "new years eve", "countdown timer", "2026 countdown", "january 1"],
    metaDescription: "Free countdown to New Year 2026. Track the time until 2026 begins. Shareable countdown timer with embeddable widget."
  },
  {
    id: "valentines-day-2026",
    name: "Valentine's Day 2026",
    slug: "valentines-day-2026",
    date: "2026-02-14T00:00",
    timezone: "UTC", 
    description: "Count down to the day of love! Valentine's Day celebrates romance, love, and affection between intimate companions. Whether you're planning a romantic dinner, preparing heartfelt gifts, or simply wanting to show someone special how much you care, track the time until this beautiful celebration of love.",
    emoji: "💕",
    color: "pink",
    keywords: ["valentine's day", "valentines 2026", "love day", "february 14", "valentine countdown", "romance"],
    metaDescription: "Free countdown to Valentine's Day 2026. Track time until the day of love. Romantic countdown timer with embeddable widget."
  },
  {
    id: "halloween-2025",
    name: "Halloween 2025", 
    slug: "halloween-2025",
    date: "2025-10-31T18:00",
    timezone: "UTC",
    description: "Count down to the spookiest night of the year! Halloween brings together trick-or-treating, costume parties, haunted houses, and all things spooky. Whether you're planning your costume, decorating your home, or preparing for trick-or-treaters, this countdown helps you track every spine-tingling moment until October 31st.",
    emoji: "🎃",
    color: "orange", 
    keywords: ["halloween", "halloween 2025", "spooky countdown", "october 31", "halloween timer", "trick or treat"],
    metaDescription: "Free countdown to Halloween 2025. Track days until the spookiest night of the year. Embeddable Halloween countdown widget."
  },
  {
    id: "thanksgiving-2025",
    name: "Thanksgiving 2025",
    slug: "thanksgiving-2025",
    date: "2025-11-27T12:00", 
    timezone: "America/New_York",
    description: "Count down to Thanksgiving Day 2025! This cherished American holiday brings families together for gratitude, traditional feasts, and creating lasting memories. From turkey preparation to family reunions, track the time until this special day of thankfulness and togetherness.",
    emoji: "🦃",
    color: "amber",
    keywords: ["thanksgiving", "thanksgiving 2025", "holiday countdown", "family gathering", "thanksgiving timer", "turkey day"],
    metaDescription: "Free countdown to Thanksgiving 2025. Track days until Thanksgiving Day. Shareable holiday countdown timer."
  },
  {
    id: "easter-2026",
    name: "Easter 2026",
    slug: "easter-2026",
    date: "2026-04-05T00:00",
    timezone: "UTC",
    description: "Count down to Easter 2026! Easter celebrates the resurrection of Jesus Christ and marks the end of Lent for Christians worldwide. The holiday brings families together for egg hunts, special meals, and springtime celebrations. Track the time until this joyous celebration of renewal and hope.",
    emoji: "🐰",
    color: "yellow",
    keywords: ["easter", "easter 2026", "easter sunday", "spring holiday", "easter countdown", "april 5"],
    metaDescription: "Free countdown to Easter 2026. Track time until Easter Sunday. Shareable Easter countdown timer with embeddable widget."
  },

  // 🕌 Religious Observances
  {
    id: "ramadan-2026",
    name: "Ramadan 2026",
    slug: "ramadan-2026", 
    date: "2026-01-18T18:00",
    timezone: "UTC",
    description: "Count down to the holy month of Ramadan 2026. Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting, prayer, reflection, and community. This sacred time brings families together for iftar meals and spiritual growth throughout the month-long observance.",
    emoji: "🌙",
    color: "green",
    keywords: ["ramadan", "ramadan 2026", "islamic calendar", "holy month", "ramadan countdown", "fasting"],
    metaDescription: "Free countdown to Ramadan 2026. Track time until the holy month begins. Respectful countdown timer with embeddable widget."
  },
  {
    id: "eid-al-fitr-2026",
    name: "Eid al-Fitr 2026",
    slug: "eid-al-fitr-2026",
    date: "2026-02-17T00:00",
    timezone: "UTC",
    description: "Count down to Eid al-Fitr 2026! Known as the 'Festival of Breaking the Fast,' Eid al-Fitr marks the end of Ramadan with joyous celebrations, special prayers, family gatherings, and gift-giving. This important Islamic holiday is celebrated by Muslims worldwide with feasts, new clothes, and acts of charity.",
    emoji: "🕌",
    color: "green",
    keywords: ["eid al-fitr", "eid 2026", "islamic holiday", "end of ramadan", "eid countdown", "festival"],
    metaDescription: "Free countdown to Eid al-Fitr 2026. Track time until the Festival of Breaking the Fast. Embeddable Eid countdown widget."
  },
  {
    id: "diwali-2025",
    name: "Diwali 2025",
    slug: "diwali-2025",
    date: "2025-10-21T18:00",
    timezone: "Asia/Kolkata",
    description: "Count down to Diwali 2025! Known as the Festival of Lights, Diwali is one of the most important Hindu celebrations, symbolizing the victory of light over darkness and good over evil. Families celebrate with oil lamps, fireworks, sweets, and prayers, creating a magical atmosphere of joy and prosperity.",
    emoji: "🪔",
    color: "yellow",
    keywords: ["diwali", "diwali 2025", "festival of lights", "hindu holiday", "diwali countdown", "deepavali"],
    metaDescription: "Free countdown to Diwali 2025. Track time until the Festival of Lights. Embeddable Diwali countdown timer."
  },
  {
    id: "hanukkah-2025",
    name: "Hanukkah 2025",
    slug: "hanukkah-2025",
    date: "2025-12-25T18:00",
    timezone: "UTC",
    description: "Count down to Hanukkah 2025! The Festival of Lights commemorates the rededication of the Second Temple in Jerusalem and celebrates the miracle of oil that burned for eight days. Jewish families worldwide celebrate with the lighting of the menorah, traditional foods, gifts, and prayers.",
    emoji: "🕎",
    color: "blue",
    keywords: ["hanukkah", "hanukkah 2025", "festival of lights", "jewish holiday", "hanukkah countdown", "chanukah"],
    metaDescription: "Free countdown to Hanukkah 2025. Track time until the Festival of Lights begins. Embeddable Hanukkah countdown widget."
  },

  // 🏆 Sports Events
  {
    id: "super-bowl-2026",
    name: "Super Bowl LX 2026",
    slug: "super-bowl-2026",
    date: "2026-02-08T18:30",
    timezone: "America/Phoenix",
    description: "Count down to Super Bowl LX 2026! The biggest sporting event in America brings together the NFL's best teams for the ultimate championship game. Beyond the game itself, the Super Bowl features spectacular halftime shows, memorable commercials, and parties watched by over 100 million viewers worldwide.",
    emoji: "🏈", 
    color: "blue",
    keywords: ["super bowl", "super bowl 2026", "nfl", "football", "super bowl countdown", "championship"],
    metaDescription: "Free countdown to Super Bowl LX 2026. Track time until the biggest game in American sports. Shareable Super Bowl countdown timer."
  },
  {
    id: "olympics-2028",
    name: "Olympics 2028 Los Angeles",
    slug: "olympics-2028",
    date: "2028-07-21T20:00",
    timezone: "America/Los_Angeles",
    description: "Count down to the 2028 Summer Olympics in Los Angeles! The world's greatest athletes will gather in the City of Angels for two weeks of inspiring competition, record-breaking performances, and unforgettable moments. This marks the third time LA will host the Olympic Games, promising spectacular venues and world-class competition.",
    emoji: "🏅",
    color: "gold",
    keywords: ["olympics", "olympics 2028", "los angeles olympics", "summer olympics", "olympic games", "LA 2028"],
    metaDescription: "Free countdown to Olympics 2028 Los Angeles. Track time until the Summer Olympic Games begin. Embeddable Olympics countdown widget."
  },
  {
    id: "world-cup-2026",
    name: "FIFA World Cup 2026",
    slug: "world-cup-2026",
    date: "2026-06-11T12:00",
    timezone: "America/New_York",
    description: "Count down to the FIFA World Cup 2026! The world's most watched sporting event comes to North America, with matches across the United States, Canada, and Mexico. This expanded 48-team tournament will showcase the best football talent from every continent in the ultimate global celebration of the beautiful game.",
    emoji: "⚽",
    color: "green",
    keywords: ["world cup", "fifa world cup 2026", "soccer", "football", "world cup countdown", "fifa 2026"],
    metaDescription: "Free countdown to FIFA World Cup 2026. Track time until the world's biggest football tournament. Embeddable World Cup countdown timer."
  },
  {
    id: "uefa-euro-2028",
    name: "UEFA Euro 2028",
    slug: "uefa-euro-2028",
    date: "2028-06-09T15:00",
    timezone: "Europe/London",
    description: "Count down to UEFA Euro 2028! Europe's premier football championship showcases the continent's best national teams in a month-long celebration of football excellence. With matches across multiple host cities, Euro 2028 promises world-class competition and unforgettable moments for football fans worldwide.",
    emoji: "🏆",
    color: "blue",
    keywords: ["euro 2028", "uefa euro", "european championship", "football", "euro countdown", "uefa 2028"],
    metaDescription: "Free countdown to UEFA Euro 2028. Track time until Europe's biggest football tournament. Embeddable Euro 2028 countdown widget."
  },

  // 💸 Shopping / Pop Culture
  {
    id: "black-friday-2025",
    name: "Black Friday 2025",
    slug: "black-friday-2025",
    date: "2025-11-29T00:00", 
    timezone: "America/New_York",
    description: "Get ready for the biggest shopping day of the year! Black Friday 2025 kicks off the holiday shopping season with massive discounts, doorbusters deals, and limited-time offers across retailers worldwide. From electronics to fashion, this is the day shoppers wait for all year to score incredible savings.",
    emoji: "🛍️",
    color: "gray",
    keywords: ["black friday", "black friday 2025", "shopping deals", "sale countdown", "shopping timer", "doorbusters"],
    metaDescription: "Free countdown to Black Friday 2025. Track time until the biggest shopping deals of the year. Embeddable countdown widget."
  },
  {
    id: "cyber-monday-2025",
    name: "Cyber Monday 2025",
    slug: "cyber-monday-2025",
    date: "2025-12-02T00:00",
    timezone: "America/New_York",
    description: "Count down to Cyber Monday 2025! The biggest online shopping day of the year features exclusive digital deals, flash sales, and deep discounts on electronics, software, and digital products. Perfect for tech enthusiasts and online bargain hunters looking for the best deals from the comfort of home.",
    emoji: "💻",
    color: "blue",
    keywords: ["cyber monday", "cyber monday 2025", "online deals", "digital sales", "tech deals", "online shopping"],
    metaDescription: "Free countdown to Cyber Monday 2025. Track time until the biggest online shopping day. Embeddable Cyber Monday countdown timer."
  },
  {
    id: "prime-day-2026",
    name: "Amazon Prime Day 2026",
    slug: "prime-day-2026",
    date: "2026-07-15T00:00",
    timezone: "America/Los_Angeles",
    description: "Count down to Amazon Prime Day 2026! This exclusive shopping event offers Prime members access to thousands of lightning deals, deep discounts on popular products, and exclusive launches. From household essentials to the latest gadgets, Prime Day has become a global shopping phenomenon rivaling Black Friday.",
    emoji: "📦",
    color: "orange",
    keywords: ["prime day", "amazon prime day 2026", "prime deals", "amazon sales", "prime day countdown", "exclusive deals"],
    metaDescription: "Free countdown to Amazon Prime Day 2026. Track time until exclusive Prime member deals begin. Embeddable Prime Day countdown widget."
  },
  {
    id: "iphone-17-launch",
    name: "iPhone 17 Launch",
    slug: "iphone-17-launch",
    date: "2026-09-10T13:00",
    timezone: "America/Los_Angeles",
    description: "Count down to the iPhone 17 launch! Apple's annual September event showcases the latest iPhone innovations, featuring cutting-edge technology, camera improvements, and design updates. Tech enthusiasts worldwide eagerly await each new iPhone release for groundbreaking features and enhanced performance.",
    emoji: "📱",
    color: "gray",
    keywords: ["iphone 17", "apple launch", "iphone release", "apple event", "new iphone", "september event"],
    metaDescription: "Free countdown to iPhone 17 launch. Track time until Apple's latest iPhone release. Embeddable iPhone countdown timer."
  },
  {
    id: "taylor-swift-tour-2026",
    name: "Taylor Swift Tour 2026",
    slug: "taylor-swift-tour-2026",
    date: "2026-05-01T19:30",
    timezone: "America/New_York",
    description: "Count down to Taylor Swift's 2026 tour! The global superstar continues to break records and create unforgettable concert experiences for millions of Swifties worldwide. With spectacular productions, surprise songs, and career-spanning setlists, each Taylor Swift tour becomes a cultural phenomenon.",
    emoji: "🎤",
    color: "purple",
    keywords: ["taylor swift", "taylor swift tour 2026", "concert countdown", "swifties", "tour dates", "pop concert"],
    metaDescription: "Free countdown to Taylor Swift Tour 2026. Track time until the pop superstar's next tour begins. Embeddable concert countdown timer."
  },
  {
    id: "coachella-2026",
    name: "Coachella 2026",
    slug: "coachella-2026",
    date: "2026-04-10T12:00",
    timezone: "America/Los_Angeles",
    description: "Count down to Coachella 2026! The iconic music and arts festival in the California desert brings together the biggest names in music, cutting-edge art installations, and unforgettable performances. Known for its fashion, celebrity sightings, and diverse lineup, Coachella sets the tone for festival season worldwide.",
    emoji: "🎪",
    color: "yellow",
    keywords: ["coachella", "coachella 2026", "music festival", "desert festival", "festival countdown", "indie music"],
    metaDescription: "Free countdown to Coachella 2026. Track time until the iconic desert music festival. Embeddable Coachella countdown widget."
  },
  // Additional events to reach 30 total
  {
    id: "independence-day-2025",
    name: "Independence Day 2025",
    slug: "independence-day-2025",
    date: "2026-07-04T12:00",
    timezone: "America/New_York",
    description: "Count down to Independence Day 2026! Also known as the Fourth of July, this American holiday commemorates the Declaration of Independence with fireworks, parades, barbecues, and patriotic celebrations. Track the time until this day of national pride and festive gatherings across the United States.",
    emoji: "🇺🇸",
    color: "blue",
    keywords: ["independence day", "fourth of july", "4th of july 2026", "american holiday", "july 4", "independence countdown"],
    metaDescription: "Free countdown to Independence Day 2026. Track time until the Fourth of July celebrations. Embeddable 4th of July countdown widget."
  },
  {
    id: "lunar-new-year-2026",
    name: "Lunar New Year 2026",
    slug: "lunar-new-year-2026",
    date: "2026-02-17T00:00",
    timezone: "Asia/Shanghai",
    description: "Count down to Lunar New Year 2026! Also known as Chinese New Year or Spring Festival, this major holiday is celebrated across Asia and by Chinese communities worldwide with dragon dances, red envelopes, family reunions, and traditional foods. Track the time until this vibrant celebration of renewal and good fortune.",
    emoji: "🐉",
    color: "red",
    keywords: ["lunar new year", "chinese new year 2026", "spring festival", "asian holiday", "lunar countdown", "year of the horse"],
    metaDescription: "Free countdown to Lunar New Year 2026. Track time until Chinese New Year celebrations begin. Embeddable Lunar New Year countdown widget."
  },
  {
    id: "mardi-gras-2026",
    name: "Mardi Gras 2026",
    slug: "mardi-gras-2026",
    date: "2026-02-17T12:00",
    timezone: "America/New_Orleans",
    description: "Count down to Mardi Gras 2026! Known as Fat Tuesday, Mardi Gras is the culmination of Carnival season with vibrant parades, masquerade balls, king cakes, and festive celebrations, especially in New Orleans. Track the time until this colorful explosion of music, costumes, and cultural tradition.",
    emoji: "🎭",
    color: "purple",
    keywords: ["mardi gras", "mardi gras 2026", "fat tuesday", "carnival", "new orleans", "mardi gras countdown"],
    metaDescription: "Free countdown to Mardi Gras 2026. Track time until Fat Tuesday celebrations in New Orleans. Embeddable Mardi Gras countdown widget."
  },
  {
    id: "st-patricks-day-2026",
    name: "St. Patrick's Day 2026",
    slug: "st-patricks-day-2026",
    date: "2026-03-17T00:00",
    timezone: "UTC",
    description: "Count down to St. Patrick's Day 2026! This Irish holiday celebrates Saint Patrick, the patron saint of Ireland, with parades, green attire, shamrocks, and festive parties worldwide. Whether you're Irish or just Irish-at-heart, track the time until this day of luck and celebration.",
    emoji: "🍀",
    color: "green",
    keywords: ["st patricks day", "st patricks day 2026", "irish holiday", "march 17", "st paddy's day", "shamrock countdown"],
    metaDescription: "Free countdown to St. Patrick's Day 2026. Track time until the Irish celebration on March 17. Embeddable St. Paddy's Day countdown widget."
  },
  {
    id: "cinco-de-mayo-2026",
    name: "Cinco de Mayo 2026",
    slug: "cinco-de-mayo-2026",
    date: "2026-05-05T12:00",
    timezone: "America/Mexico_City",
    description: "Count down to Cinco de Mayo 2026! This holiday commemorates the Mexican Army's victory over the French Empire at the Battle of Puebla in 1862. Celebrated with parades, mariachi music, traditional foods, and festive events, especially in Mexico and the United States, track the time until this vibrant cultural celebration.",
    emoji: "🌮",
    color: "red",
    keywords: ["cinco de mayo", "cinco de mayo 2026", "mexican holiday", "may 5", "battle of puebla", "mexican countdown"],
    metaDescription: "Free countdown to Cinco de Mayo 2026. Track time until the Mexican cultural celebration on May 5. Embeddable Cinco de Mayo countdown widget."
  },
  {
    id: "wimbledon-2026",
    name: "Wimbledon 2026",
    slug: "wimbledon-2026",
    date: "2026-06-29T11:00",
    timezone: "Europe/London",
    description: "Count down to Wimbledon 2026! The oldest and most prestigious tennis tournament in the world, Wimbledon is held annually in London, featuring the world's top players competing on iconic grass courts. Known for its traditions, including strawberries and cream, track the time until this grand slam event.",
    emoji: "🎾",
    color: "green",
    keywords: ["wimbledon", "wimbledon 2026", "tennis tournament", "grand slam", "tennis countdown", "london tennis"],
    metaDescription: "Free countdown to Wimbledon 2026. Track time until the world's most prestigious tennis tournament. Embeddable Wimbledon countdown widget."
  },
  {
    id: "tour-de-france-2026",
    name: "Tour de France 2026",
    slug: "tour-de-france-2026",
    date: "2026-07-04T09:00",
    timezone: "Europe/Paris",
    description: "Count down to Tour de France 2026! The world's most famous cycling race challenges the best cyclists over 21 grueling stages across France and neighboring countries. Known for its iconic yellow jersey and breathtaking mountain stages, track the time until this ultimate test of endurance.",
    emoji: "🚴",
    color: "yellow",
    keywords: ["tour de france", "tour de france 2026", "cycling race", "french race", "cycling countdown", "yellow jersey"],
    metaDescription: "Free countdown to Tour de France 2026. Track time until the world's most famous cycling race. Embeddable Tour de France countdown widget."
  },
  {
    id: "back-to-school-2025",
    name: "Back to School 2025",
    slug: "back-to-school-2025",
    date: "2026-09-02T08:00",
    timezone: "America/New_York",
    description: "Count down to Back to School 2025! The start of the new school year brings excitement and preparation for students, parents, and teachers alike. From shopping for school supplies to getting ready for the first day, track the time until classrooms open and learning begins anew.",
    emoji: "🎒",
    color: "blue",
    keywords: ["back to school", "back to school 2025", "school start", "new school year", "school countdown", "september school"],
    metaDescription: "Free countdown to Back to School 2025. Track time until the new school year begins. Embeddable Back to School countdown widget."
  },
  {
    id: "samsung-galaxy-s26-launch",
    name: "Samsung Galaxy S26 Launch",
    slug: "samsung-galaxy-s26-launch",
    date: "2026-01-15T10:00",
    timezone: "Asia/Seoul",
    description: "Count down to the Samsung Galaxy S26 launch! Samsung's annual Unpacked event unveils the latest flagship smartphone with cutting-edge technology, innovative features, and powerful performance. Tech enthusiasts worldwide await each new Galaxy S series release for its advancements in mobile technology.",
    emoji: "📲",
    color: "gray",
    keywords: ["samsung galaxy s26", "samsung launch", "galaxy release", "samsung event", "new galaxy", "january unpacked"],
    metaDescription: "Free countdown to Samsung Galaxy S26 launch. Track time until Samsung's latest flagship release. Embeddable Galaxy countdown timer."
  },
  {
    id: "burning-man-2025",
    name: "Burning Man 2025",
    slug: "burning-man-2025",
    date: "2026-08-31T09:00",
    timezone: "America/Los_Angeles",
    description: "Count down to Burning Man 2025! This unique event in Nevada's Black Rock Desert brings together a temporary community for radical self-expression, art installations, and communal living. Known for its iconic burning of 'The Man' structure, track the time until this transformative cultural experience.",
    emoji: "🔥",
    color: "orange",
    keywords: ["burning man", "burning man 2025", "art festival", "desert event", "burning man countdown", "black rock city"],
    metaDescription: "Free countdown to Burning Man 2025. Track time until the unique desert art festival. Embeddable Burning Man countdown widget."
  }
]

export function getEventBySlug(slug: string): SeasonalEvent | null {
  return seasonalEvents.find(event => event.slug === slug) || null
}

export function getAllEventSlugs(): string[] {
  return seasonalEvents.map(event => event.slug)
}

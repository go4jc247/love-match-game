/**
 * Love Match - Marriage Quiz & Sharing System
 * Fun, positive quizzes for couples to take and share results.
 */

// ─── Quiz Data ──────────────────────────────────────────────────────────────

const QUIZZES = {
  knowYourSpouse: {
    id: 'knowYourSpouse',
    title: 'How Well Do You Know Your Spouse?',
    description: 'Put your knowledge to the test! Answer questions about your spouse and see how well you really know them.',
    category: 'knowledge',
    icon: '💑',
    pointsReward: 500,
    questions: [
      {
        text: "What is your spouse's favorite color?",
        type: 'open',
        verifyNote: 'Your spouse will verify your answer!',
      },
      {
        text: "What would your spouse choose for a dream vacation?",
        type: 'multiple',
        options: ['Beach paradise', 'Mountain retreat', 'Exciting city trip', 'Peaceful countryside'],
      },
      {
        text: "What does your spouse value most in a relationship?",
        type: 'multiple',
        options: ['Quality Time', 'Acts of Service', 'Words of Affirmation', 'Receiving Gifts', 'Physical Touch'],
      },
      {
        text: "Your spouse's go-to comfort food is...",
        type: 'multiple',
        options: ['Pizza or pasta', 'Ice cream or chocolate', 'Home-cooked soup or stew', 'Chips and dip', 'Something sweet from a bakery'],
      },
      {
        text: "What does your spouse do first thing in the morning?",
        type: 'multiple',
        options: ['Check their phone', 'Make coffee or tea', 'Exercise', 'Hit snooze repeatedly', 'Pray or meditate'],
      },
      {
        text: "What movie genre does your spouse enjoy most?",
        type: 'multiple',
        options: ['Comedy', 'Action/Adventure', 'Romance', 'Drama', 'Sci-Fi/Fantasy'],
      },
      {
        text: "How does your spouse unwind after a long day?",
        type: 'multiple',
        options: ['Watching TV or a movie', 'Reading a book', 'Going for a walk', 'Talking with family or friends', 'Taking a bath or nap'],
      },
      {
        text: "What is your spouse's hidden talent?",
        type: 'open',
        verifyNote: 'Your spouse will verify your answer!',
      },
      {
        text: "If your spouse won the lottery, the first thing they would do is...",
        type: 'multiple',
        options: ['Buy a dream home', 'Travel the world', 'Give generously to others', 'Save and invest', 'Throw an epic party'],
      },
      {
        text: "Your spouse's biggest pet peeve is...",
        type: 'multiple',
        options: ['Being late', 'Loud chewing', 'Messy spaces', 'Dishonesty', 'Interrupting'],
      },
      {
        text: "What song would your spouse say is 'their song'?",
        type: 'open',
        verifyNote: 'Your spouse will verify your answer!',
      },
      {
        text: "Your spouse's dream job (if money didn't matter) would be...",
        type: 'multiple',
        options: ['Travel blogger', 'Chef or baker', 'Teacher or mentor', 'Artist or musician', 'Business owner'],
      },
      {
        text: "What is your spouse most likely to splurge on?",
        type: 'multiple',
        options: ['Clothes or shoes', 'Food or dining out', 'Tech gadgets', 'Books or courses', 'Home decor'],
      },
      {
        text: "Your spouse's favorite season is...",
        type: 'multiple',
        options: ['Spring', 'Summer', 'Fall', 'Winter'],
      },
      {
        text: "What makes your spouse laugh the hardest?",
        type: 'multiple',
        options: ['Silly puns and dad jokes', 'Funny videos or memes', 'Inside jokes between you two', 'Slapstick comedy', 'Witty sarcasm'],
      },
      {
        text: "Your spouse's favorite way to show love is...",
        type: 'multiple',
        options: ['Cooking a meal', 'Writing a note or text', 'Giving a hug', 'Planning a surprise', 'Helping with a task'],
      },
      {
        text: "If your spouse could have dinner with anyone (living or historical), who would it be?",
        type: 'open',
        verifyNote: 'Your spouse will verify your answer!',
      },
      {
        text: "What is your spouse afraid of?",
        type: 'multiple',
        options: ['Spiders or bugs', 'Heights', 'Public speaking', 'The dark', 'Losing loved ones'],
      },
      {
        text: "Your spouse's favorite holiday is...",
        type: 'multiple',
        options: ['Christmas', 'Thanksgiving', 'Their birthday', 'Valentine\'s Day', 'Fourth of July'],
      },
      {
        text: "What is the one thing your spouse could never live without?",
        type: 'multiple',
        options: ['Their phone', 'Coffee or tea', 'Music', 'Family time', 'Their faith'],
      },
    ],
  },

  loveLanguage: {
    id: 'loveLanguage',
    title: 'Love Language Quiz',
    description: 'Discover your primary love language and understand how you and your spouse give and receive love best.',
    category: 'personality',
    icon: '❤️',
    pointsReward: 400,
    languages: ['Words of Affirmation', 'Quality Time', 'Receiving Gifts', 'Acts of Service', 'Physical Touch'],
    questions: [
      {
        text: "After a tough day, what would mean the most to you?",
        type: 'multiple',
        options: [
          { text: 'Hearing "I\'m so proud of you"', language: 'Words of Affirmation' },
          { text: 'Cuddling on the couch together', language: 'Quality Time' },
          { text: 'Receiving a small surprise gift', language: 'Receiving Gifts' },
          { text: 'Coming home to a clean house', language: 'Acts of Service' },
          { text: 'A long, warm hug', language: 'Physical Touch' },
        ],
      },
      {
        text: "On your birthday, you would love it if your spouse...",
        type: 'multiple',
        options: [
          { text: 'Wrote you a heartfelt letter', language: 'Words of Affirmation' },
          { text: 'Planned a full day together just for you two', language: 'Quality Time' },
          { text: 'Surprised you with a meaningful gift', language: 'Receiving Gifts' },
          { text: 'Took care of all your responsibilities for the day', language: 'Acts of Service' },
          { text: 'Gave you a massage or held your hand all day', language: 'Physical Touch' },
        ],
      },
      {
        text: "You feel most loved when your spouse...",
        type: 'multiple',
        options: [
          { text: 'Tells you specific things they appreciate about you', language: 'Words of Affirmation' },
          { text: 'Puts away their phone and gives you full attention', language: 'Quality Time' },
          { text: 'Brings you something thoughtful "just because"', language: 'Receiving Gifts' },
          { text: 'Handles a chore you dislike without being asked', language: 'Acts of Service' },
          { text: 'Reaches for your hand in public', language: 'Physical Touch' },
        ],
      },
      {
        text: "Which would hurt you most if it was missing from your relationship?",
        type: 'multiple',
        options: [
          { text: 'Never hearing "I love you" or compliments', language: 'Words of Affirmation' },
          { text: 'Never spending uninterrupted time together', language: 'Quality Time' },
          { text: 'Never receiving gifts on special occasions', language: 'Receiving Gifts' },
          { text: 'Never having help around the house', language: 'Acts of Service' },
          { text: 'Never being hugged or touched affectionately', language: 'Physical Touch' },
        ],
      },
      {
        text: "A perfect evening with your spouse would be...",
        type: 'multiple',
        options: [
          { text: 'Deep conversation sharing dreams and encouragement', language: 'Words of Affirmation' },
          { text: 'A quiet dinner with no distractions', language: 'Quality Time' },
          { text: 'Exchanging thoughtful gifts you picked for each other', language: 'Receiving Gifts' },
          { text: 'One of you cooks while the other cleans up', language: 'Acts of Service' },
          { text: 'Watching a movie while snuggled up together', language: 'Physical Touch' },
        ],
      },
      {
        text: "When you're feeling down, you most want your spouse to...",
        type: 'multiple',
        options: [
          { text: 'Say encouraging and affirming words', language: 'Words of Affirmation' },
          { text: 'Sit with you and just be present', language: 'Quality Time' },
          { text: 'Bring you your favorite treat', language: 'Receiving Gifts' },
          { text: 'Take something off your plate', language: 'Acts of Service' },
          { text: 'Hold you close', language: 'Physical Touch' },
        ],
      },
      {
        text: "You would be most excited if your spouse...",
        type: 'multiple',
        options: [
          { text: 'Left a love note in your bag', language: 'Words of Affirmation' },
          { text: 'Surprised you with a weekend getaway for two', language: 'Quality Time' },
          { text: 'Gave you jewelry or something you\'ve been eyeing', language: 'Receiving Gifts' },
          { text: 'Fixed something that\'s been bothering you at home', language: 'Acts of Service' },
          { text: 'Greeted you at the door with a big kiss', language: 'Physical Touch' },
        ],
      },
      {
        text: "What makes you feel most connected to your spouse?",
        type: 'multiple',
        options: [
          { text: 'When they verbally express gratitude for you', language: 'Words of Affirmation' },
          { text: 'When you share a hobby or activity together', language: 'Quality Time' },
          { text: 'When they remember something you mentioned wanting', language: 'Receiving Gifts' },
          { text: 'When they go out of their way to make your life easier', language: 'Acts of Service' },
          { text: 'When they are physically close and affectionate', language: 'Physical Touch' },
        ],
      },
      {
        text: "In a conflict, you feel resolved when your spouse...",
        type: 'multiple',
        options: [
          { text: 'Apologizes sincerely with meaningful words', language: 'Words of Affirmation' },
          { text: 'Sits down to talk it through with full attention', language: 'Quality Time' },
          { text: 'Makes a gesture like bringing flowers', language: 'Receiving Gifts' },
          { text: 'Shows change through actions, not just words', language: 'Acts of Service' },
          { text: 'Offers a hug to reconnect', language: 'Physical Touch' },
        ],
      },
      {
        text: "At a party, you feel most loved when your spouse...",
        type: 'multiple',
        options: [
          { text: 'Brags about you to others', language: 'Words of Affirmation' },
          { text: 'Stays by your side most of the night', language: 'Quality Time' },
          { text: 'Brings you a drink or plate of food', language: 'Receiving Gifts' },
          { text: 'Drives home so you can relax', language: 'Acts of Service' },
          { text: 'Keeps an arm around you', language: 'Physical Touch' },
        ],
      },
      {
        text: "The best random text from your spouse would be...",
        type: 'multiple',
        options: [
          { text: '"I just want you to know how amazing you are"', language: 'Words of Affirmation' },
          { text: '"I cleared my schedule tonight so we can hang out"', language: 'Quality Time' },
          { text: '"I ordered that thing you wanted!"', language: 'Receiving Gifts' },
          { text: '"I already picked up the groceries and started dinner"', language: 'Acts of Service' },
          { text: '"Can\'t wait to be in your arms tonight"', language: 'Physical Touch' },
        ],
      },
      {
        text: "On your anniversary, the ideal celebration would be...",
        type: 'multiple',
        options: [
          { text: 'Reading love letters you wrote to each other', language: 'Words of Affirmation' },
          { text: 'Recreating your first date together', language: 'Quality Time' },
          { text: 'Exchanging meaningful anniversary gifts', language: 'Receiving Gifts' },
          { text: 'Your spouse planning every detail so you can just enjoy', language: 'Acts of Service' },
          { text: 'Dancing together in the living room', language: 'Physical Touch' },
        ],
      },
      {
        text: "You most appreciate it when your spouse...",
        type: 'multiple',
        options: [
          { text: 'Prays for you out loud', language: 'Words of Affirmation' },
          { text: 'Goes on a walk with you to talk about life', language: 'Quality Time' },
          { text: 'Picks up your favorite coffee on their way home', language: 'Receiving Gifts' },
          { text: 'Fills up your car with gas without being asked', language: 'Acts of Service' },
          { text: 'Rubs your shoulders while you\'re cooking', language: 'Physical Touch' },
        ],
      },
      {
        text: "When meeting friends, you love it when your spouse...",
        type: 'multiple',
        options: [
          { text: 'Speaks highly of your accomplishments', language: 'Words of Affirmation' },
          { text: 'Makes sure you two still get one-on-one time', language: 'Quality Time' },
          { text: 'Surprises you with a small gift in front of everyone', language: 'Receiving Gifts' },
          { text: 'Takes care of logistics so you can just have fun', language: 'Acts of Service' },
          { text: 'Holds your hand or puts their arm around you', language: 'Physical Touch' },
        ],
      },
      {
        text: "The greatest daily gesture from your spouse would be...",
        type: 'multiple',
        options: [
          { text: 'A "good morning, I love you" text', language: 'Words of Affirmation' },
          { text: '15 minutes of undivided conversation', language: 'Quality Time' },
          { text: 'A small token or treat left for you', language: 'Receiving Gifts' },
          { text: 'Making the bed or prepping breakfast', language: 'Acts of Service' },
          { text: 'A goodnight kiss and cuddle', language: 'Physical Touch' },
        ],
      },
    ],
  },

  dreamTogether: {
    id: 'dreamTogether',
    title: 'Dream Together',
    description: 'Explore your shared dreams and discover what kind of future you and your spouse envision together!',
    category: 'dreams',
    icon: '✨',
    pointsReward: 350,
    questions: [
      {
        text: "In 5 years, we'd love to...",
        type: 'multiple',
        options: ['Own our dream home', 'Travel to at least 5 new places', 'Start or grow our family', 'Launch a business or passion project', 'Be debt-free and financially secure'],
      },
      {
        text: "Our dream home would be...",
        type: 'multiple',
        options: ['A cozy cottage in the countryside', 'A modern loft in the city', 'A beachfront bungalow', 'A spacious farmhouse with land', 'A mountain cabin with a view'],
      },
      {
        text: "A perfect Saturday together looks like...",
        type: 'multiple',
        options: ['Sleeping in, brunch, and a movie', 'An outdoor adventure — hiking or biking', 'Hosting friends and family at home', 'Exploring a new town or neighborhood', 'A lazy day reading and cooking together'],
      },
      {
        text: "We want to learn together...",
        type: 'multiple',
        options: ['A new language', 'How to cook a cuisine we love', 'A sport or physical activity', 'A creative skill like painting or music', 'Financial planning and investing'],
      },
      {
        text: "Our dream vacation together would be...",
        type: 'multiple',
        options: ['A European road trip', 'A tropical island getaway', 'A mission trip serving others', 'An adventurous safari', 'A cozy cabin in the snow'],
      },
      {
        text: "If we could volunteer together, we'd choose...",
        type: 'multiple',
        options: ['Mentoring young couples', 'Building homes for those in need', 'Serving at a food bank', 'Teaching or tutoring kids', 'Leading a community group at church'],
      },
      {
        text: "A tradition we'd love to start is...",
        type: 'multiple',
        options: ['Annual anniversary trips', 'Weekly date nights', 'Holiday baking or crafting together', 'Sunday family dinners', 'Monthly game or movie nights with friends'],
      },
      {
        text: "Our ideal retirement looks like...",
        type: 'multiple',
        options: ['Traveling the world in an RV', 'Living near our grandkids', 'Running a small bed and breakfast', 'Volunteering and giving back full-time', 'Living somewhere warm and peaceful'],
      },
      {
        text: "A fitness goal we'd love to tackle together is...",
        type: 'multiple',
        options: ['Running a 5K or marathon', 'Doing a couples yoga class', 'Hiking a famous trail', 'Learning to dance', 'Training for a fun obstacle course'],
      },
      {
        text: "If we could live anywhere for one year, it would be...",
        type: 'multiple',
        options: ['Paris, France', 'Tokyo, Japan', 'Sydney, Australia', 'A small town in Italy', 'Somewhere in Costa Rica'],
      },
      {
        text: "We'd love to build or create together...",
        type: 'multiple',
        options: ['A garden or outdoor space', 'A photo book of our memories', 'A YouTube channel or blog', 'A piece of furniture by hand', 'A family cookbook with our recipes'],
      },
      {
        text: "Our shared faith goal is to...",
        type: 'multiple',
        options: ['Read the Bible together daily', 'Lead a small group or Bible study', 'Go on a mission trip together', 'Pray together every night', 'Memorize scripture as a couple'],
      },
      {
        text: "A couple we admire and want to be like is one that...",
        type: 'multiple',
        options: ['Laughs together constantly', 'Serves their community selflessly', 'Still goes on dates after decades', 'Raised incredible children', 'Built something meaningful together'],
      },
      {
        text: "If we could master one thing as a team, it would be...",
        type: 'multiple',
        options: ['Communication during hard times', 'Budgeting and financial teamwork', 'Hosting and hospitality', 'Adventuring and spontaneity', 'Patience and grace with each other'],
      },
      {
        text: "The legacy we want to leave together is...",
        type: 'multiple',
        options: ['A strong, loving family', 'A positive impact on our community', 'A faith that inspires others', 'A story of overcoming challenges together', 'Generosity that changed lives'],
      },
    ],
  },

  marriageStrength: {
    id: 'marriageStrength',
    title: 'Marriage Strength Finder',
    description: 'Discover the superpowers in your marriage! Find your top strengths and an area to grow in together.',
    category: 'strengths',
    icon: '💪',
    pointsReward: 400,
    strengthCategories: ['Communication', 'Trust', 'Fun', 'Spiritual Growth', 'Teamwork', 'Romance'],
    questions: [
      {
        text: "When we disagree, we usually...",
        type: 'multiple',
        options: [
          { text: 'Talk it through calmly and listen to each other', strength: 'Communication' },
          { text: 'Trust that we\'ll work it out together', strength: 'Trust' },
          { text: 'Find a way to laugh about it eventually', strength: 'Fun' },
          { text: 'Pray about it and seek wisdom', strength: 'Spiritual Growth' },
          { text: 'Tackle the problem as a team', strength: 'Teamwork' },
          { text: 'Reconnect with a hug or kind gesture', strength: 'Romance' },
        ],
      },
      {
        text: "Our friends would say we are great at...",
        type: 'multiple',
        options: [
          { text: 'Having honest, open conversations', strength: 'Communication' },
          { text: 'Having each other\'s backs no matter what', strength: 'Trust' },
          { text: 'Being the fun couple everyone loves to be around', strength: 'Fun' },
          { text: 'Encouraging others in their faith', strength: 'Spiritual Growth' },
          { text: 'Working together seamlessly', strength: 'Teamwork' },
          { text: 'Keeping the spark alive', strength: 'Romance' },
        ],
      },
      {
        text: "On a typical weekend, you'll find us...",
        type: 'multiple',
        options: [
          { text: 'Catching up on life over coffee', strength: 'Communication' },
          { text: 'Enjoying time apart knowing we\'re solid', strength: 'Trust' },
          { text: 'Doing something adventurous or silly together', strength: 'Fun' },
          { text: 'At church or in a Bible study', strength: 'Spiritual Growth' },
          { text: 'Tackling a home project together', strength: 'Teamwork' },
          { text: 'On a date — we never skip date night!', strength: 'Romance' },
        ],
      },
      {
        text: "The best thing about our marriage is...",
        type: 'multiple',
        options: [
          { text: 'We can talk about anything', strength: 'Communication' },
          { text: 'We completely trust each other', strength: 'Trust' },
          { text: 'We never stop having fun', strength: 'Fun' },
          { text: 'Our shared faith keeps us grounded', strength: 'Spiritual Growth' },
          { text: 'We make an incredible team', strength: 'Teamwork' },
          { text: 'The romance is still going strong', strength: 'Romance' },
        ],
      },
      {
        text: "When one of us is stressed, we handle it by...",
        type: 'multiple',
        options: [
          { text: 'Talking about what\'s going on openly', strength: 'Communication' },
          { text: 'Giving space while trusting we\'ll reconnect', strength: 'Trust' },
          { text: 'Doing something fun to lighten the mood', strength: 'Fun' },
          { text: 'Praying together about it', strength: 'Spiritual Growth' },
          { text: 'Dividing tasks to lighten the load', strength: 'Teamwork' },
          { text: 'Extra affection and quality time', strength: 'Romance' },
        ],
      },
      {
        text: "We're at our best when we...",
        type: 'multiple',
        options: [
          { text: 'Have a deep heart-to-heart', strength: 'Communication' },
          { text: 'Show unwavering loyalty to each other', strength: 'Trust' },
          { text: 'Are laughing until our sides hurt', strength: 'Fun' },
          { text: 'Worship or serve together', strength: 'Spiritual Growth' },
          { text: 'Accomplish a big goal together', strength: 'Teamwork' },
          { text: 'Are on a romantic getaway', strength: 'Romance' },
        ],
      },
      {
        text: "Something we do better than most couples is...",
        type: 'multiple',
        options: [
          { text: 'Resolving conflict respectfully', strength: 'Communication' },
          { text: 'Being transparent and honest', strength: 'Trust' },
          { text: 'Finding joy in everyday moments', strength: 'Fun' },
          { text: 'Growing spiritually as a couple', strength: 'Spiritual Growth' },
          { text: 'Sharing responsibilities equally', strength: 'Teamwork' },
          { text: 'Keeping the romance fresh', strength: 'Romance' },
        ],
      },
      {
        text: "A challenge we've overcome together was...",
        type: 'multiple',
        options: [
          { text: 'Learning to communicate more effectively', strength: 'Communication' },
          { text: 'Rebuilding or deepening trust', strength: 'Trust' },
          { text: 'Finding fun again during a hard season', strength: 'Fun' },
          { text: 'Navigating a faith struggle together', strength: 'Spiritual Growth' },
          { text: 'A financial or career challenge we tackled as a team', strength: 'Teamwork' },
          { text: 'Reigniting our connection after a busy season', strength: 'Romance' },
        ],
      },
      {
        text: "What we'd want to teach younger couples is...",
        type: 'multiple',
        options: [
          { text: 'How to really listen to each other', strength: 'Communication' },
          { text: 'Why trust is the foundation of everything', strength: 'Trust' },
          { text: 'Never stop dating and having fun together', strength: 'Fun' },
          { text: 'Keep God at the center of your marriage', strength: 'Spiritual Growth' },
          { text: 'You\'re a team — act like it!', strength: 'Teamwork' },
          { text: 'Small romantic gestures matter more than big ones', strength: 'Romance' },
        ],
      },
      {
        text: "If our marriage had a motto, it would be...",
        type: 'multiple',
        options: [
          { text: '"Let\'s talk about it"', strength: 'Communication' },
          { text: '"I\'ve got your back, always"', strength: 'Trust' },
          { text: '"Life\'s too short not to laugh"', strength: 'Fun' },
          { text: '"Faith, hope, and love"', strength: 'Spiritual Growth' },
          { text: '"Together we can do anything"', strength: 'Teamwork' },
          { text: '"Still falling in love with you"', strength: 'Romance' },
        ],
      },
      {
        text: "A daily habit that strengthens our marriage is...",
        type: 'multiple',
        options: [
          { text: 'A daily check-in conversation', strength: 'Communication' },
          { text: 'Being fully honest about our day', strength: 'Trust' },
          { text: 'Sharing a laugh or inside joke', strength: 'Fun' },
          { text: 'Praying or reading devotions together', strength: 'Spiritual Growth' },
          { text: 'Sharing household duties without keeping score', strength: 'Teamwork' },
          { text: 'A kiss, hug, or sweet text every day', strength: 'Romance' },
        ],
      },
      {
        text: "When we celebrate, we typically...",
        type: 'multiple',
        options: [
          { text: 'Share what we appreciate about each other', strength: 'Communication' },
          { text: 'Reflect on how far we\'ve come together', strength: 'Trust' },
          { text: 'Do something spontaneous and exciting', strength: 'Fun' },
          { text: 'Thank God for our blessings', strength: 'Spiritual Growth' },
          { text: 'Plan the celebration together', strength: 'Teamwork' },
          { text: 'Go on a special date', strength: 'Romance' },
        ],
      },
      {
        text: "The thing that keeps us strong during hard times is...",
        type: 'multiple',
        options: [
          { text: 'Being able to share anything without judgment', strength: 'Communication' },
          { text: 'Knowing we\'d never give up on each other', strength: 'Trust' },
          { text: 'Finding moments of joy even in difficulty', strength: 'Fun' },
          { text: 'Our faith and prayer life', strength: 'Spiritual Growth' },
          { text: 'Facing challenges as a united front', strength: 'Teamwork' },
          { text: 'Small acts of love that remind us why we chose each other', strength: 'Romance' },
        ],
      },
      {
        text: "One thing we never skip is...",
        type: 'multiple',
        options: [
          { text: 'Saying goodnight and talking about our day', strength: 'Communication' },
          { text: 'Being honest, even when it\'s hard', strength: 'Trust' },
          { text: 'Having fun together, no matter how busy we are', strength: 'Fun' },
          { text: 'Going to church together', strength: 'Spiritual Growth' },
          { text: 'Making decisions together as a team', strength: 'Teamwork' },
          { text: 'Telling each other "I love you"', strength: 'Romance' },
        ],
      },
      {
        text: "The way we handle finances shows our strength in...",
        type: 'multiple',
        options: [
          { text: 'Talking openly about money without fighting', strength: 'Communication' },
          { text: 'Trusting each other with spending decisions', strength: 'Trust' },
          { text: 'Budgeting for fun experiences together', strength: 'Fun' },
          { text: 'Tithing and giving generously', strength: 'Spiritual Growth' },
          { text: 'Managing money as equal partners', strength: 'Teamwork' },
          { text: 'Saving for romantic surprises and trips', strength: 'Romance' },
        ],
      },
    ],
  },

  dateNightGenerator: {
    id: 'dateNightGenerator',
    title: 'Date Night Generator',
    description: 'Answer a few quick questions and get 5 personalized date night ideas made just for you two!',
    category: 'fun',
    icon: '🌙',
    pointsReward: 200,
    questions: [
      {
        text: "What's your ideal date night budget?",
        type: 'multiple',
        options: ['Free — we love creativity!', 'Under $30', '$30-$75', '$75-$150', 'Sky\'s the limit!'],
        tag: 'budget',
      },
      {
        text: "Indoor or outdoor?",
        type: 'multiple',
        options: ['Definitely indoors', 'Mostly indoors with some outdoor', 'A good mix of both', 'Mostly outdoors', 'Outdoors all the way!'],
        tag: 'setting',
      },
      {
        text: "What's your adventure level?",
        type: 'multiple',
        options: ['Cozy and relaxed', 'Mildly adventurous', 'Moderately adventurous', 'Very adventurous', 'Extreme — surprise us!'],
        tag: 'adventure',
      },
      {
        text: "Do you prefer activities or conversation?",
        type: 'multiple',
        options: ['All about the deep conversation', 'Mostly talking with a light activity', 'Equal mix', 'Mostly activity with some chatting', 'Action-packed all the way!'],
        tag: 'activity',
      },
      {
        text: "What time of day works best?",
        type: 'multiple',
        options: ['Morning / Brunch', 'Afternoon', 'Evening', 'Late night', 'All day date!'],
        tag: 'time',
      },
      {
        text: "Are other couples welcome?",
        type: 'multiple',
        options: ['Just us two, please!', 'Maybe one other couple', 'The more the merrier!'],
        tag: 'social',
      },
      {
        text: "What sounds most fun right now?",
        type: 'multiple',
        options: ['Learning something new together', 'Being active and moving', 'Creating something together', 'Exploring somewhere new', 'Pure relaxation and pampering'],
        tag: 'vibe',
      },
      {
        text: "Food is...",
        type: 'multiple',
        options: ['The main event!', 'An important part of the date', 'Nice but not the focus', 'We can grab something quick', 'We\'ll eat before or after'],
        tag: 'food',
      },
      {
        text: "How much planning do you want?",
        type: 'multiple',
        options: ['Totally spontaneous', 'A rough idea is fine', 'Some planning is good', 'Well-planned, please', 'Every detail mapped out'],
        tag: 'planning',
      },
      {
        text: "What season or weather are you in?",
        type: 'multiple',
        options: ['Spring — mild and fresh', 'Summer — warm and sunny', 'Fall — cool and cozy', 'Winter — cold and bundled up', 'Doesn\'t matter — we\'ll adapt!'],
        tag: 'season',
      },
    ],
    dateIdeas: {
      cozyBudget: [
        { title: 'Blanket Fort Movie Night', description: 'Build a cozy blanket fort, make popcorn, and watch your wedding video or a favorite movie together.' },
        { title: 'Cook-Off Challenge', description: 'Each pick a secret ingredient and compete to make the best dish. Rate each other\'s creations!' },
        { title: 'Stargazing Picnic', description: 'Grab a blanket, some snacks, and find a spot to watch the stars. Use an app to find constellations.' },
        { title: 'Memory Lane Walk', description: 'Walk through your neighborhood and share favorite memories from your relationship at each block.' },
        { title: 'At-Home Spa Night', description: 'Face masks, candles, soothing music, and giving each other massages. Pure relaxation together.' },
      ],
      adventurous: [
        { title: 'Sunrise Hike & Breakfast', description: 'Get up early, hike to a scenic spot, and enjoy breakfast together as the sun rises.' },
        { title: 'Mystery Drive', description: 'Take turns giving directions (left, right, straight) without a destination. Stop wherever looks interesting!' },
        { title: 'Kayaking or Canoeing', description: 'Rent a kayak or canoe and explore a local lake or river together.' },
        { title: 'Rock Climbing Date', description: 'Try an indoor rock climbing gym together. Take turns belaying and cheering each other on!' },
        { title: 'Food Truck Crawl', description: 'Find 3-4 food trucks in your area and split a dish from each one. Rate them together!' },
      ],
      creative: [
        { title: 'Paint & Sip Night', description: 'Get canvases and paint, pick a theme, and create art together. Compare your masterpieces!' },
        { title: 'Pottery or Ceramics Class', description: 'Take a pottery class together and make something you can keep as a memory.' },
        { title: 'Write Love Letters', description: 'Go to a cozy coffee shop and write heartfelt letters to each other. Read them aloud over dessert.' },
        { title: 'Photo Walk', description: 'Explore your city with cameras (phones work!) and photograph what catches your eye. Share favorites.' },
        { title: 'Build Something Together', description: 'Pick a simple woodworking or DIY project and build it together. A shelf, planter, or picture frame!' },
      ],
      social: [
        { title: 'Double Date Game Night', description: 'Invite another couple over for board games, snacks, and lots of laughs.' },
        { title: 'Couples Cooking Class', description: 'Take a cooking class together with other couples. Learn a new cuisine!' },
        { title: 'Trivia Night', description: 'Find a local trivia night at a restaurant or bar and team up together.' },
        { title: 'Serve Together', description: 'Volunteer at a local organization together. Giving back strengthens your bond!' },
        { title: 'Outdoor Movie in the Park', description: 'Bring chairs and blankets to an outdoor movie screening. Invite friends to join!' },
      ],
      romantic: [
        { title: 'Recreate Your First Date', description: 'Go back to where it all started and recreate your very first date together.' },
        { title: 'Candlelit Dinner at Home', description: 'Cook a fancy meal together, light candles, dress up, and enjoy a restaurant-quality evening at home.' },
        { title: 'Dance Under the Stars', description: 'Put on your favorite slow songs and dance together in the backyard or on the porch.' },
        { title: 'Couples Massage', description: 'Book a couples massage at a spa and enjoy total relaxation together.' },
        { title: 'Scenic Drive & Dessert', description: 'Take a scenic drive, stop for dessert at a cozy spot, and talk about your dreams for the future.' },
      ],
    },
  },

  bibleKnowledge: {
    id: 'bibleKnowledge',
    title: 'Bible Knowledge - Couples Edition',
    description: 'Test your knowledge of marriage and love in the Bible! Earn bonus game points for correct answers.',
    category: 'bible',
    icon: '📖',
    pointsReward: 300,
    bonusPointsPerCorrect: 20,
    questions: [
      {
        text: "Which book contains 'Love is patient, love is kind'?",
        type: 'multiple',
        options: ['Romans', '1 Corinthians', 'Ephesians', 'Song of Solomon'],
        correctIndex: 1,
        explanation: '1 Corinthians 13:4 — one of the most beloved passages about love!',
      },
      {
        text: "Who said 'Where you go, I will go; where you stay, I will stay'?",
        type: 'multiple',
        options: ['Sarah to Abraham', 'Ruth to Naomi', 'Rachel to Jacob', 'Mary to Joseph'],
        correctIndex: 1,
        explanation: 'Ruth 1:16 — a beautiful declaration of loyalty and love.',
      },
      {
        text: "What was the first miracle Jesus performed, at a wedding in Cana?",
        type: 'multiple',
        options: ['Healing a blind man', 'Turning water into wine', 'Feeding the 5000', 'Walking on water'],
        correctIndex: 1,
        explanation: 'John 2:1-11 — Jesus honored the celebration of marriage with His first miracle!',
      },
      {
        text: "According to Genesis, why did God create Eve?",
        type: 'multiple',
        options: ['To rule over Adam', 'Because Adam was lonely and needed a helper', 'To tend the garden', 'To name the animals'],
        correctIndex: 1,
        explanation: 'Genesis 2:18 — "It is not good for the man to be alone. I will make a helper suitable for him."',
      },
      {
        text: "In Ephesians 5, husbands are told to love their wives as...",
        type: 'multiple',
        options: ['They love themselves', 'Christ loved the church', 'Their parents loved them', 'A shepherd loves his flock'],
        correctIndex: 1,
        explanation: 'Ephesians 5:25 — a call to sacrificial, selfless love.',
      },
      {
        text: "Which Old Testament book is a love poem between a husband and wife?",
        type: 'multiple',
        options: ['Psalms', 'Proverbs', 'Song of Solomon', 'Ecclesiastes'],
        correctIndex: 2,
        explanation: 'Song of Solomon celebrates romantic love between spouses.',
      },
      {
        text: "What does Proverbs 31 say about a wife of noble character?",
        type: 'multiple',
        options: ['She is worth far more than rubies', 'She is quiet and meek', 'She stays at home always', 'She never disagrees'],
        correctIndex: 0,
        explanation: 'Proverbs 31:10 — "A wife of noble character, who can find? She is worth far more than rubies."',
      },
      {
        text: "Jacob worked how many years total to marry Rachel?",
        type: 'multiple',
        options: ['7 years', '10 years', '14 years', '20 years'],
        correctIndex: 2,
        explanation: 'Genesis 29 — Jacob worked 7 years, was given Leah, then worked 7 more years for Rachel!',
      },
      {
        text: "Complete this verse: 'Two are better than one, because...'",
        type: 'multiple',
        options: [
          'They can share the load equally',
          'They have a good return for their labor',
          'They will never be alone',
          'They can accomplish more',
        ],
        correctIndex: 1,
        explanation: 'Ecclesiastes 4:9 — a beautiful verse about partnership.',
      },
      {
        text: "In the story of Hosea, God uses his marriage to illustrate...",
        type: 'multiple',
        options: ['The importance of obedience', 'God\'s faithful love despite unfaithfulness', 'How to choose a spouse', 'The dangers of jealousy'],
        correctIndex: 1,
        explanation: 'The book of Hosea is a powerful picture of God\'s relentless, redeeming love.',
      },
      {
        text: "What does 1 Peter 4:8 say love does?",
        type: 'multiple',
        options: ['Conquers all things', 'Covers a multitude of sins', 'Never fails', 'Bears all things'],
        correctIndex: 1,
        explanation: '"Above all, love each other deeply, because love covers over a multitude of sins."',
      },
      {
        text: "Which couple is known for working together as tentmakers and ministry partners?",
        type: 'multiple',
        options: ['Abraham and Sarah', 'Aquila and Priscilla', 'Boaz and Ruth', 'Isaac and Rebekah'],
        correctIndex: 1,
        explanation: 'Aquila and Priscilla (Acts 18) — an amazing example of a couple serving together!',
      },
      {
        text: "According to Colossians 3:14, what binds everything together in perfect unity?",
        type: 'multiple',
        options: ['Faith', 'Hope', 'Love', 'Patience'],
        correctIndex: 2,
        explanation: '"And over all these virtues put on love, which binds them all together in perfect unity."',
      },
      {
        text: "What did God say after creating man and woman? (Genesis 1:31)",
        type: 'multiple',
        options: ['It was good', 'It was very good', 'It was complete', 'It was blessed'],
        correctIndex: 1,
        explanation: '"God saw all that he had made, and it was very good."',
      },
      {
        text: "What cord is not easily broken, according to Ecclesiastes 4:12?",
        type: 'multiple',
        options: ['A cord of two strands', 'A cord of three strands', 'A cord of four strands', 'A golden cord'],
        correctIndex: 1,
        explanation: '"A cord of three strands is not quickly broken." — Often symbolizing husband, wife, and God.',
      },
    ],
  },
};

// ─── Date Night Idea Generator Logic ────────────────────────────────────────

function generateDateIdeas(answers) {
  const ideas = QUIZZES.dateNightGenerator.dateIdeas;
  const selected = [];
  const budgetAnswer = answers[0] ?? 0;
  const adventureAnswer = answers[2] ?? 0;
  const activityAnswer = answers[3] ?? 2;
  const socialAnswer = answers[5] ?? 0;
  const vibeAnswer = answers[6] ?? 0;

  // Cozy / budget-friendly
  if (budgetAnswer <= 1 || adventureAnswer <= 1) {
    selected.push(...pickRandom(ideas.cozyBudget, 2));
  } else {
    selected.push(...pickRandom(ideas.cozyBudget, 1));
  }

  // Adventurous
  if (adventureAnswer >= 3) {
    selected.push(...pickRandom(ideas.adventurous, 2));
  } else if (adventureAnswer >= 1) {
    selected.push(...pickRandom(ideas.adventurous, 1));
  }

  // Creative
  if (vibeAnswer === 0 || vibeAnswer === 2) {
    selected.push(...pickRandom(ideas.creative, 1));
  }

  // Social
  if (socialAnswer >= 1) {
    selected.push(...pickRandom(ideas.social, 1));
  }

  // Romantic
  selected.push(...pickRandom(ideas.romantic, 1));

  // Deduplicate and trim to 5
  const unique = [...new Map(selected.map(i => [i.title, i])).values()];
  while (unique.length < 5) {
    const allIdeas = [
      ...ideas.cozyBudget,
      ...ideas.adventurous,
      ...ideas.creative,
      ...ideas.social,
      ...ideas.romantic,
    ];
    const remaining = allIdeas.filter(i => !unique.find(u => u.title === i.title));
    if (remaining.length === 0) break;
    unique.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return unique.slice(0, 5);
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Result Calculators ─────────────────────────────────────────────────────

function calculateLoveLanguageResults(answers) {
  const quiz = QUIZZES.loveLanguage;
  const tally = {};
  quiz.languages.forEach(lang => { tally[lang] = 0; });

  answers.forEach((answerIndex, qIndex) => {
    const question = quiz.questions[qIndex];
    if (question && question.options[answerIndex]) {
      const language = question.options[answerIndex].language;
      if (language) {
        tally[language] = (tally[language] || 0) + 1;
      }
    }
  });

  const total = Object.values(tally).reduce((sum, v) => sum + v, 0) || 1;
  const breakdown = {};
  quiz.languages.forEach(lang => {
    breakdown[lang] = Math.round((tally[lang] / total) * 100);
  });

  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    breakdown,
    summary: `Your primary love language is ${sorted[0][0]} (${sorted[0][1]}%), followed by ${sorted[1][0]} (${sorted[1][1]}%).`,
  };
}

function calculateStrengthResults(answers) {
  const quiz = QUIZZES.marriageStrength;
  const tally = {};
  quiz.strengthCategories.forEach(cat => { tally[cat] = 0; });

  answers.forEach((answerIndex, qIndex) => {
    const question = quiz.questions[qIndex];
    if (question && question.options[answerIndex]) {
      const strength = question.options[answerIndex].strength;
      if (strength) {
        tally[strength] = (tally[strength] || 0) + 1;
      }
    }
  });

  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const topThree = sorted.slice(0, 3).map(([name]) => name);
  const growthArea = sorted[sorted.length - 1][0];

  const growthAdvice = {
    Communication: 'Try a daily 10-minute check-in where you share highs and lows. No phones allowed!',
    Trust: 'Practice radical honesty this week. Share something you normally keep to yourself.',
    Fun: 'Schedule a spontaneous date this week. Try something neither of you has done before!',
    'Spiritual Growth': 'Start a 5-minute nightly prayer or devotional together. Small steps lead to big growth.',
    Teamwork: 'Pick a project to tackle together this week — cook a new recipe, organize a space, or set a goal.',
    Romance: 'Write each other a love note this week and hide it somewhere your spouse will find it.',
  };

  return {
    topStrengths: topThree,
    growthArea,
    growthAdvice: growthAdvice[growthArea],
    tally,
    summary: `Your top marriage strengths are ${topThree.join(', ')}! Your growth area is ${growthArea}.`,
  };
}

function calculateBibleResults(answers) {
  const quiz = QUIZZES.bibleKnowledge;
  let correct = 0;
  const details = [];

  answers.forEach((answerIndex, qIndex) => {
    const question = quiz.questions[qIndex];
    if (!question) return;
    const isCorrect = answerIndex === question.correctIndex;
    if (isCorrect) correct++;
    details.push({
      question: question.text,
      yourAnswer: question.options[answerIndex] ?? 'No answer',
      correctAnswer: question.options[question.correctIndex],
      isCorrect,
      explanation: question.explanation,
    });
  });

  const total = quiz.questions.length;
  const percentage = Math.round((correct / total) * 100);
  const bonusPoints = correct * quiz.bonusPointsPerCorrect;

  let grade;
  if (percentage >= 90) grade = 'Bible Scholar';
  else if (percentage >= 70) grade = 'Faithful Student';
  else if (percentage >= 50) grade = 'Growing Learner';
  else grade = 'Just Getting Started';

  return {
    correct,
    total,
    percentage,
    bonusPoints,
    grade,
    details,
    summary: `You got ${correct}/${total} correct (${percentage}%)! Grade: ${grade}. You earned ${bonusPoints} bonus game points!`,
  };
}

function calculateGenericResults(quizId, answers) {
  const quiz = QUIZZES[quizId];
  if (!quiz) return null;

  const totalQuestions = quiz.questions.length;
  const answeredCount = answers.filter(a => a !== null && a !== undefined).length;

  return {
    quizId,
    quizTitle: quiz.title,
    totalQuestions,
    answeredCount,
    answers,
    completionRate: Math.round((answeredCount / totalQuestions) * 100),
    summary: `You completed ${answeredCount}/${totalQuestions} questions in "${quiz.title}"!`,
  };
}

// ─── QuizManager Class ──────────────────────────────────────────────────────

export class QuizManager {
  constructor(playerId) {
    this.playerId = playerId;
    this.quizState = {};   // { [quizId]: { answers: [], currentIndex: 0, completed: bool, startedAt, completedAt } }
    this.results = {};     // { [quizId]: { ... result data } }
    this.sharedResults = {}; // { [quizId]: { ... result data, sharedAt } }
    this.spouseResults = {}; // { [quizId]: { ... results from spouse } }
  }

  // ── List & Status ───────────────────────────────────────────────────────

  getAvailableQuizzes() {
    return Object.values(QUIZZES).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      icon: quiz.icon,
      questionCount: quiz.questions.length,
      pointsReward: quiz.pointsReward,
      completed: this.quizState[quiz.id]?.completed ?? false,
      inProgress: (this.quizState[quiz.id] && !this.quizState[quiz.id].completed) ?? false,
      progress: this.quizState[quiz.id]
        ? Math.round(
            ((this.quizState[quiz.id].answers.filter(a => a !== null && a !== undefined).length) /
              quiz.questions.length) *
              100
          )
        : 0,
    }));
  }

  getCompletedQuizzes() {
    return this.getAvailableQuizzes().filter(q => q.completed);
  }

  getQuizProgress(quizId) {
    const quiz = QUIZZES[quizId];
    if (!quiz) return null;

    const state = this.quizState[quizId];
    if (!state) {
      return { quizId, started: false, currentIndex: 0, total: quiz.questions.length, progress: 0 };
    }

    const answered = state.answers.filter(a => a !== null && a !== undefined).length;
    return {
      quizId,
      started: true,
      completed: state.completed,
      currentIndex: state.currentIndex,
      total: quiz.questions.length,
      answered,
      progress: Math.round((answered / quiz.questions.length) * 100),
      startedAt: state.startedAt,
      completedAt: state.completedAt,
    };
  }

  // ── Quiz Flow ───────────────────────────────────────────────────────────

  startQuiz(quizId) {
    const quiz = QUIZZES[quizId];
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    this.quizState[quizId] = {
      answers: new Array(quiz.questions.length).fill(null),
      currentIndex: 0,
      completed: false,
      startedAt: Date.now(),
      completedAt: null,
    };

    // Clear previous results when restarting
    delete this.results[quizId];

    return this._formatQuestion(quizId, 0);
  }

  answerQuestion(quizId, questionIndex, answer) {
    const quiz = QUIZZES[quizId];
    const state = this.quizState[quizId];

    if (!quiz) throw new Error(`Quiz not found: ${quizId}`);
    if (!state) throw new Error(`Quiz not started: ${quizId}. Call startQuiz() first.`);
    if (state.completed) throw new Error(`Quiz already completed: ${quizId}`);
    if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
      throw new Error(`Invalid question index: ${questionIndex}`);
    }

    state.answers[questionIndex] = answer;
    state.currentIndex = questionIndex + 1;

    const isLast = questionIndex === quiz.questions.length - 1;

    return {
      accepted: true,
      questionIndex,
      answer,
      isLastQuestion: isLast,
      nextQuestion: isLast ? null : this._formatQuestion(quizId, questionIndex + 1),
      progress: Math.round(((questionIndex + 1) / quiz.questions.length) * 100),
    };
  }

  completeQuiz(quizId) {
    const quiz = QUIZZES[quizId];
    const state = this.quizState[quizId];

    if (!quiz) throw new Error(`Quiz not found: ${quizId}`);
    if (!state) throw new Error(`Quiz not started: ${quizId}`);

    state.completed = true;
    state.completedAt = Date.now();

    const results = this._calculateResults(quizId, state.answers);
    results.pointsEarned = quiz.pointsReward;
    results.completedAt = state.completedAt;
    results.timeTaken = state.completedAt - state.startedAt;

    this.results[quizId] = results;

    return {
      ...results,
      animation: this._getRevealAnimation(quizId),
    };
  }

  // ── Results & Sharing ───────────────────────────────────────────────────

  getResults(quizId) {
    return this.results[quizId] ?? null;
  }

  shareResults(quizId) {
    const results = this.results[quizId];
    if (!results) {
      throw new Error(`No results to share for quiz: ${quizId}. Complete the quiz first.`);
    }

    const shareable = {
      ...results,
      sharedBy: this.playerId,
      sharedAt: Date.now(),
      shareMessage: this._generateShareMessage(quizId, results),
    };

    this.sharedResults[quizId] = shareable;
    return shareable;
  }

  getSpouseResults(quizId) {
    return this.spouseResults[quizId] ?? null;
  }

  receiveSpouseResults(quizId, spouseResultData) {
    this.spouseResults[quizId] = {
      ...spouseResultData,
      receivedAt: Date.now(),
    };
  }

  compareResults(quizId) {
    const mine = this.results[quizId];
    const theirs = this.spouseResults[quizId];

    if (!mine) {
      throw new Error(`You haven't completed quiz: ${quizId}`);
    }
    if (!theirs) {
      throw new Error(`Your spouse hasn't shared results for quiz: ${quizId}`);
    }

    return this._buildComparison(quizId, mine, theirs);
  }

  getBonusPoints(quizId) {
    const results = this.results[quizId];
    if (!results) return 0;

    let bonus = results.pointsEarned || 0;

    // Bible quiz has additional per-question bonus
    if (quizId === 'bibleKnowledge' && results.bonusPoints) {
      bonus += results.bonusPoints;
    }

    return bonus;
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  _formatQuestion(quizId, index) {
    const quiz = QUIZZES[quizId];
    const question = quiz.questions[index];
    if (!question) return null;

    const formatted = {
      quizId,
      quizTitle: quiz.title,
      questionIndex: index,
      totalQuestions: quiz.questions.length,
      text: question.text,
      type: question.type,
      progress: Math.round(((index) / quiz.questions.length) * 100),
    };

    if (question.type === 'multiple') {
      formatted.options = question.options.map((opt, i) => ({
        index: i,
        text: typeof opt === 'string' ? opt : opt.text,
      }));
    }

    if (question.type === 'open') {
      formatted.verifyNote = question.verifyNote;
    }

    return formatted;
  }

  _calculateResults(quizId, answers) {
    switch (quizId) {
      case 'loveLanguage':
        return calculateLoveLanguageResults(answers);
      case 'marriageStrength':
        return calculateStrengthResults(answers);
      case 'bibleKnowledge':
        return calculateBibleResults(answers);
      case 'dateNightGenerator':
        return {
          dateIdeas: generateDateIdeas(answers),
          answers,
          summary: 'Here are 5 personalized date night ideas just for you two!',
        };
      case 'knowYourSpouse':
      case 'dreamTogether':
      default:
        return calculateGenericResults(quizId, answers);
    }
  }

  _getRevealAnimation(quizId) {
    const animations = {
      knowYourSpouse: {
        type: 'scoreReveal',
        style: 'hearts',
        message: 'Let\'s see how well you know your spouse!',
        duration: 2000,
      },
      loveLanguage: {
        type: 'barChart',
        style: 'gradient',
        message: 'Your love language breakdown is ready!',
        duration: 2500,
      },
      dreamTogether: {
        type: 'sparkle',
        style: 'stars',
        message: 'Your shared dreams are beautiful!',
        duration: 2000,
      },
      marriageStrength: {
        type: 'strengthBars',
        style: 'power',
        message: 'Your marriage superpowers revealed!',
        duration: 2500,
      },
      dateNightGenerator: {
        type: 'cardFlip',
        style: 'moonlight',
        message: 'Your perfect date nights are...',
        duration: 3000,
      },
      bibleKnowledge: {
        type: 'scoreReveal',
        style: 'scrolls',
        message: 'Let\'s see your Bible knowledge score!',
        duration: 2000,
      },
    };

    return animations[quizId] || { type: 'fadeIn', style: 'default', message: 'Results are in!', duration: 1500 };
  }

  _generateShareMessage(quizId, results) {
    switch (quizId) {
      case 'loveLanguage':
        return `I just discovered my love language is ${results.primary}! Take the quiz and let's compare!`;
      case 'marriageStrength':
        return `Our top marriage strengths are ${results.topStrengths.join(', ')}! Take the quiz to see yours!`;
      case 'bibleKnowledge':
        return `I scored ${results.percentage}% on the Couples Bible Quiz (${results.grade})! Can you beat my score?`;
      case 'dateNightGenerator':
        return `I just got 5 personalized date night ideas for us! Check them out!`;
      case 'dreamTogether':
        return `I shared my dreams for our future! Take the quiz so we can compare visions!`;
      case 'knowYourSpouse':
        return `I just answered 20 questions about you... let's see if I got them right!`;
      default:
        return `I just completed "${QUIZZES[quizId]?.title}"! Take it and let's compare!`;
    }
  }

  _buildComparison(quizId, myResults, spouseResults) {
    const quiz = QUIZZES[quizId];
    const comparison = {
      quizId,
      quizTitle: quiz.title,
      myResults,
      spouseResults,
      comparedAt: Date.now(),
    };

    switch (quizId) {
      case 'loveLanguage': {
        const myPrimary = myResults.primary;
        const theirPrimary = spouseResults.primary;
        comparison.highlights = [
          { label: 'Your Love Language', value: myPrimary },
          { label: 'Their Love Language', value: theirPrimary },
          {
            label: 'Match',
            value: myPrimary === theirPrimary ? 'You share the same love language!' : 'Different languages — great to know!',
          },
        ];
        comparison.tip = myPrimary === theirPrimary
          ? `You both feel most loved through ${myPrimary}. Keep speaking that language to each other!`
          : `You feel loved through ${myPrimary}, and your spouse through ${theirPrimary}. Try expressing love in their language this week!`;
        break;
      }
      case 'marriageStrength': {
        const sharedStrengths = myResults.topStrengths.filter(s => spouseResults.topStrengths.includes(s));
        comparison.highlights = [
          { label: 'Your Top Strengths', value: myResults.topStrengths.join(', ') },
          { label: 'Their Top Strengths', value: spouseResults.topStrengths.join(', ') },
          { label: 'Shared Strengths', value: sharedStrengths.length > 0 ? sharedStrengths.join(', ') : 'None in common — you complement each other!' },
        ];
        comparison.tip = sharedStrengths.length > 0
          ? `You both see ${sharedStrengths.join(' and ')} as a strength. Build on that foundation!`
          : `You each see different strengths in your marriage. That means you notice different things — together, you cover all the bases!`;
        break;
      }
      case 'bibleKnowledge': {
        comparison.highlights = [
          { label: 'Your Score', value: `${myResults.correct}/${myResults.total} (${myResults.percentage}%)` },
          { label: 'Their Score', value: `${spouseResults.correct}/${spouseResults.total} (${spouseResults.percentage}%)` },
          { label: 'Combined', value: `${myResults.correct + spouseResults.correct}/${myResults.total + spouseResults.total} total correct!` },
        ];
        comparison.tip = 'Study the ones you missed together! It\'s a great way to grow in God\'s Word as a couple.';
        break;
      }
      default: {
        comparison.highlights = [
          { label: 'You', value: myResults.summary },
          { label: 'Your Spouse', value: spouseResults.summary },
        ];
        comparison.tip = 'Compare your answers together and talk about the ones that surprised you!';
        break;
      }
    }

    return comparison;
  }
}

// ─── Export quiz data for external use ───────────────────────────────────────

export { QUIZZES };

export default QuizManager;

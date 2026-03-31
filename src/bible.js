/**
 * Bible Reading & Devotional System for Love Match
 * Marriage-themed Bible reading with tracking, notes, and bonus points.
 */

// ─── Verse Database ──────────────────────────────────────────────────────────

const VERSES = [
  // ── Love ───────────────────────────────────────────────────────────────────
  {
    reference: "1 Corinthians 13:4",
    text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    category: "Love",
    reflectionPrompt: "How can you show patience to your spouse today?",
    romanticSuggestion: {
      forHusband: "Write your wife a note about one thing you love about her patience.",
      forWife: "Plan a quiet evening together where you practice being fully present."
    }
  },
  {
    reference: "1 Corinthians 13:5",
    text: "It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.",
    category: "Love",
    reflectionPrompt: "Is there a grudge you need to release to strengthen your marriage?",
    romanticSuggestion: {
      forHusband: "Apologize for something small you've been holding onto.",
      forWife: "Tell your husband about a time his selflessness meant the world to you."
    }
  },
  {
    reference: "1 Corinthians 13:6-7",
    text: "Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.",
    category: "Love",
    reflectionPrompt: "What does it look like to always hope and persevere in your marriage?",
    romanticSuggestion: {
      forHusband: "Share a dream you have for your future together.",
      forWife: "Remind your husband of a challenge you overcame together."
    }
  },
  {
    reference: "1 Corinthians 13:8",
    text: "Love never fails. But where there are prophecies, they will cease; where there are tongues, they will be stilled; where there is knowledge, it will pass away.",
    category: "Love",
    reflectionPrompt: "How does knowing love never fails give you confidence in your marriage?",
    romanticSuggestion: {
      forHusband: "Tell your wife three reasons your love for her will never fail.",
      forWife: "Write a short letter about why your love story is unfailing."
    }
  },
  {
    reference: "1 Corinthians 13:13",
    text: "And now these three remain: faith, hope and love. But the greatest of these is love.",
    category: "Love",
    reflectionPrompt: "How do faith, hope, and love work together in your relationship?",
    romanticSuggestion: {
      forHusband: "Plan a date night centered around something your wife hopes for.",
      forWife: "Share with your husband how his faith inspires your love."
    }
  },
  {
    reference: "Song of Solomon 2:10",
    text: "My beloved spoke and said to me, 'Arise, my darling, my beautiful one, come with me.'",
    category: "Love",
    reflectionPrompt: "When did you last invite your spouse on an adventure together?",
    romanticSuggestion: {
      forHusband: "Surprise your wife with a spontaneous outing, even just a walk.",
      forWife: "Initiate a date and tell your husband he's your beloved."
    }
  },
  {
    reference: "Song of Solomon 2:16",
    text: "My beloved is mine and I am his; he browses among the lilies.",
    category: "Love",
    reflectionPrompt: "What does belonging to each other mean in your daily life?",
    romanticSuggestion: {
      forHusband: "Bring home flowers and say 'I'm yours.'",
      forWife: "Leave a note in his pocket that says 'You are mine and I am yours.'"
    }
  },
  {
    reference: "Song of Solomon 4:9",
    text: "You have stolen my heart, my sister, my bride; you have stolen my heart with one glance of your eyes.",
    category: "Love",
    reflectionPrompt: "Do you still look at your spouse with the wonder of first love?",
    romanticSuggestion: {
      forHusband: "Catch your wife's eye across the room today and hold her gaze.",
      forWife: "Tell your husband about the moment you first knew you loved him."
    }
  },
  {
    reference: "Song of Solomon 8:6-7",
    text: "Place me like a seal over your heart, like a seal on your arm; for love is as strong as death, its jealousy unyielding as the grave. It burns like blazing fire, like a mighty flame. Many waters cannot quench love; rivers cannot sweep it away.",
    category: "Love",
    reflectionPrompt: "How can you fan the flame of love in your marriage this week?",
    romanticSuggestion: {
      forHusband: "Write your wedding vows from memory and read them to her tonight.",
      forWife: "Light candles at dinner and tell him your love burns bright."
    }
  },
  {
    reference: "1 John 4:18",
    text: "There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love.",
    category: "Love",
    reflectionPrompt: "Is there any fear holding back your love for your spouse?",
    romanticSuggestion: {
      forHusband: "Share a vulnerability with your wife to deepen trust.",
      forWife: "Create a safe space for your husband to share his heart."
    }
  },
  {
    reference: "1 John 4:19",
    text: "We love because he first loved us.",
    category: "Love",
    reflectionPrompt: "How does God's love for you shape the way you love your spouse?",
    romanticSuggestion: {
      forHusband: "Pray together thanking God for the love you share.",
      forWife: "Tell your husband how God's love overflows into your marriage."
    }
  },
  {
    reference: "Romans 13:10",
    text: "Love does no harm to a neighbor. Therefore love is the fulfillment of the law.",
    category: "Love",
    reflectionPrompt: "Are there habits that unintentionally harm your spouse?",
    romanticSuggestion: {
      forHusband: "Ask your wife if there's one thing you could do differently to love her better.",
      forWife: "Affirm your husband in an area where he's been trying hard."
    }
  },

  // ── Faithfulness ───────────────────────────────────────────────────────────
  {
    reference: "Proverbs 31:10",
    text: "A wife of noble character who can find? She is worth far more than rubies.",
    category: "Faithfulness",
    reflectionPrompt: "How do you honor the noble character in your spouse?",
    romanticSuggestion: {
      forHusband: "Tell your wife she is more precious to you than anything.",
      forWife: "Thank your husband for seeing your worth."
    }
  },
  {
    reference: "Proverbs 31:11-12",
    text: "Her husband has full confidence in her and lacks nothing of value. She brings him good, not harm, all the days of her life.",
    category: "Faithfulness",
    reflectionPrompt: "Does your spouse have full confidence in you? How can you build that trust?",
    romanticSuggestion: {
      forHusband: "Express your complete trust in your wife with specific examples.",
      forWife: "Do something today that brings your husband good."
    }
  },
  {
    reference: "Proverbs 31:28-29",
    text: "Her children arise and call her blessed; her husband also, and he praises her: 'Many women do noble things, but you surpass them all.'",
    category: "Faithfulness",
    reflectionPrompt: "When did you last praise your spouse in front of others?",
    romanticSuggestion: {
      forHusband: "Praise your wife publicly today, at dinner or on social media.",
      forWife: "Tell your children one thing that makes their father amazing."
    }
  },
  {
    reference: "Proverbs 3:3-4",
    text: "Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart.",
    category: "Faithfulness",
    reflectionPrompt: "What does wearing love and faithfulness look like in your daily routine?",
    romanticSuggestion: {
      forHusband: "Wear your wedding ring with renewed intentionality today.",
      forWife: "Write a love note and tuck it where your husband will find it."
    }
  },
  {
    reference: "Lamentations 3:22-23",
    text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    category: "Faithfulness",
    reflectionPrompt: "How can you offer your spouse fresh compassion each morning?",
    romanticSuggestion: {
      forHusband: "Start tomorrow morning by telling your wife something you appreciate about her.",
      forWife: "Greet your husband each morning this week with an encouraging word."
    }
  },
  {
    reference: "Psalm 37:3",
    text: "Trust in the Lord and do good; dwell in the land and enjoy safe pasture.",
    category: "Faithfulness",
    reflectionPrompt: "How does trusting God together create a safe home?",
    romanticSuggestion: {
      forHusband: "Pray with your wife about a decision you're facing together.",
      forWife: "Share a verse with your husband that gives you peace."
    }
  },
  {
    reference: "Psalm 100:5",
    text: "For the Lord is good and his love endures forever; his faithfulness continues through all generations.",
    category: "Faithfulness",
    reflectionPrompt: "What legacy of faithfulness do you want to leave for your family?",
    romanticSuggestion: {
      forHusband: "Talk with your wife about the legacy you want to build together.",
      forWife: "Share a family tradition you'd like to start or continue."
    }
  },
  {
    reference: "2 Timothy 2:13",
    text: "If we are faithless, he remains faithful, for he cannot disown himself.",
    category: "Faithfulness",
    reflectionPrompt: "How does God's unwavering faithfulness inspire your commitment?",
    romanticSuggestion: {
      forHusband: "Reassure your wife of your commitment, especially if times are hard.",
      forWife: "Remind your husband that you chose him and you'd choose him again."
    }
  },
  {
    reference: "Hebrews 10:23",
    text: "Let us hold unswervingly to the hope we profess, for he who promised is faithful.",
    category: "Faithfulness",
    reflectionPrompt: "What hopes did you profess on your wedding day? Are you holding to them?",
    romanticSuggestion: {
      forHusband: "Revisit your wedding vows together tonight.",
      forWife: "Write down three promises you want to renew for your marriage."
    }
  },
  {
    reference: "Proverbs 20:6",
    text: "Many claim to have unfailing love, but a faithful person who can find?",
    category: "Faithfulness",
    reflectionPrompt: "How do your actions prove your faithfulness beyond words?",
    romanticSuggestion: {
      forHusband: "Follow through on a promise you made to your wife this week.",
      forWife: "Show your husband faithfulness through a consistent act of kindness."
    }
  },

  // ── Unity ──────────────────────────────────────────────────────────────────
  {
    reference: "Genesis 2:24",
    text: "That is why a man leaves his father and mother and is united to his wife, and they become one flesh.",
    category: "Unity",
    reflectionPrompt: "What does being 'one flesh' mean for how you make decisions together?",
    romanticSuggestion: {
      forHusband: "Make a decision together today that you'd normally make alone.",
      forWife: "Plan something that celebrates your unity as a couple."
    }
  },
  {
    reference: "Ecclesiastes 4:9-10",
    text: "Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up.",
    category: "Unity",
    reflectionPrompt: "When has your spouse helped you up during a hard time?",
    romanticSuggestion: {
      forHusband: "Help your wife with something she's been struggling with.",
      forWife: "Thank your husband for a time he lifted you up."
    }
  },
  {
    reference: "Ecclesiastes 4:12",
    text: "Though one may be overpowered, two can defend themselves. A cord of three strands is not quickly broken.",
    category: "Unity",
    reflectionPrompt: "How is God the third strand in your marriage?",
    romanticSuggestion: {
      forHusband: "Suggest starting a devotional time together.",
      forWife: "Get a three-strand cord symbol for your home as a reminder."
    }
  },
  {
    reference: "Mark 10:9",
    text: "Therefore what God has joined together, let no one separate.",
    category: "Unity",
    reflectionPrompt: "What forces try to separate you, and how do you resist them together?",
    romanticSuggestion: {
      forHusband: "Remove one distraction this week and give that time to your wife.",
      forWife: "Protect your couple time fiercely this week."
    }
  },
  {
    reference: "Amos 3:3",
    text: "Do two walk together unless they have agreed to do so?",
    category: "Unity",
    reflectionPrompt: "Are you and your spouse walking in the same direction right now?",
    romanticSuggestion: {
      forHusband: "Take a literal walk together and talk about your shared goals.",
      forWife: "Ask your husband where he sees your family in five years."
    }
  },
  {
    reference: "Philippians 2:2",
    text: "Then make my joy complete by being like-minded, having the same love, being one in spirit and of one mind.",
    category: "Unity",
    reflectionPrompt: "Where do you and your spouse need to become more like-minded?",
    romanticSuggestion: {
      forHusband: "Find common ground on something you've disagreed about.",
      forWife: "Celebrate an area where you and your husband think alike."
    }
  },
  {
    reference: "1 Peter 3:8",
    text: "Finally, all of you, be like-minded, be sympathetic, love one another, be compassionate and humble.",
    category: "Unity",
    reflectionPrompt: "How can you show more compassion in your marriage this week?",
    romanticSuggestion: {
      forHusband: "Put yourself in your wife's shoes about something stressful she's facing.",
      forWife: "Show sympathy for something your husband is going through."
    }
  },
  {
    reference: "Colossians 3:14",
    text: "And over all these virtues put on love, which binds them all together in perfect unity.",
    category: "Unity",
    reflectionPrompt: "Is love the thread holding all your other virtues together?",
    romanticSuggestion: {
      forHusband: "Do something loving that also shows patience, kindness, and humility.",
      forWife: "Write about how love ties together everything good in your marriage."
    }
  },
  {
    reference: "Romans 15:5-6",
    text: "May the God who gives endurance and encouragement give you the same attitude of mind toward each other that Christ Jesus had.",
    category: "Unity",
    reflectionPrompt: "What attitude of mind does Christ model for your marriage?",
    romanticSuggestion: {
      forHusband: "Encourage your wife with words that reflect Christ's love.",
      forWife: "Show endurance in an area of your marriage that needs patience."
    }
  },
  {
    reference: "Psalm 133:1",
    text: "How good and pleasant it is when God's people live together in unity!",
    category: "Unity",
    reflectionPrompt: "What makes your home a place of unity and pleasantness?",
    romanticSuggestion: {
      forHusband: "Create a peaceful atmosphere at home tonight.",
      forWife: "Do something to make your home feel like a sanctuary together."
    }
  },

  // ── Patience & Kindness ────────────────────────────────────────────────────
  {
    reference: "Galatians 5:22-23",
    text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    category: "Patience & Kindness",
    reflectionPrompt: "Which fruit of the Spirit does your marriage need most right now?",
    romanticSuggestion: {
      forHusband: "Show one specific fruit of the Spirit to your wife today.",
      forWife: "Tell your husband which fruit of the Spirit you see most in him."
    }
  },
  {
    reference: "Ephesians 4:2",
    text: "Be completely humble and gentle; be patient, bearing with one another in love.",
    category: "Patience & Kindness",
    reflectionPrompt: "What does 'bearing with one another' look like in your marriage?",
    romanticSuggestion: {
      forHusband: "Be extra patient about something that normally frustrates you.",
      forWife: "Respond with gentleness the next time tension arises."
    }
  },
  {
    reference: "Colossians 3:12",
    text: "Therefore, as God's chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.",
    category: "Patience & Kindness",
    reflectionPrompt: "If kindness were clothing, would your spouse say you're well-dressed?",
    romanticSuggestion: {
      forHusband: "Perform three acts of kindness for your wife before noon.",
      forWife: "Surprise your husband with his favorite meal prepared with love."
    }
  },
  {
    reference: "Proverbs 15:1",
    text: "A gentle answer turns away wrath, but a harsh word stirs up anger.",
    category: "Patience & Kindness",
    reflectionPrompt: "Do you choose gentle answers even when you're frustrated?",
    romanticSuggestion: {
      forHusband: "Practice responding gently in your next disagreement.",
      forWife: "Use soft words even when discussing something difficult."
    }
  },
  {
    reference: "Romans 12:10",
    text: "Be devoted to one another in love. Honor one another above yourselves.",
    category: "Patience & Kindness",
    reflectionPrompt: "How do you honor your spouse above yourself in daily life?",
    romanticSuggestion: {
      forHusband: "Let your wife choose tonight's plans without negotiation.",
      forWife: "Put your husband's preference first in a decision today."
    }
  },
  {
    reference: "Proverbs 19:11",
    text: "A person's wisdom yields patience; it is to one's glory to overlook an offense.",
    category: "Patience & Kindness",
    reflectionPrompt: "Is there a small offense you can choose to overlook today?",
    romanticSuggestion: {
      forHusband: "Let go of a pet peeve and replace it with appreciation.",
      forWife: "Choose grace over correction about something small."
    }
  },
  {
    reference: "1 Thessalonians 5:15",
    text: "Make sure that nobody pays back wrong for wrong, but always strive to do what is good for each other and for everyone else.",
    category: "Patience & Kindness",
    reflectionPrompt: "Do you ever keep score in your marriage? How can you stop?",
    romanticSuggestion: {
      forHusband: "Respond to a frustration with an unexpected act of goodness.",
      forWife: "Break a negative cycle by doing something kind when you feel wronged."
    }
  },
  {
    reference: "Proverbs 16:24",
    text: "Gracious words are a honeycomb, sweet to the soul and healing to the bones.",
    category: "Patience & Kindness",
    reflectionPrompt: "Are your words to your spouse sweet and healing?",
    romanticSuggestion: {
      forHusband: "Send your wife a text with nothing but kind, gracious words.",
      forWife: "Speak words of affirmation to your husband before bed tonight."
    }
  },
  {
    reference: "Romans 2:4",
    text: "Or do you show contempt for the riches of his kindness, forbearance and patience, not realizing that God's kindness is intended to lead you to repentance?",
    category: "Patience & Kindness",
    reflectionPrompt: "How can God's patient kindness inspire how you treat your spouse?",
    romanticSuggestion: {
      forHusband: "Show your wife the same patient kindness God shows you.",
      forWife: "Lead with kindness in a conversation that needs to happen."
    }
  },
  {
    reference: "James 1:19",
    text: "My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry.",
    category: "Patience & Kindness",
    reflectionPrompt: "Are you quicker to listen or quicker to respond in your marriage?",
    romanticSuggestion: {
      forHusband: "Listen to your wife for ten minutes without interrupting or fixing.",
      forWife: "Ask your husband about his day and truly listen to his answer."
    }
  },

  // ── Forgiveness ────────────────────────────────────────────────────────────
  {
    reference: "Ephesians 4:32",
    text: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.",
    category: "Forgiveness",
    reflectionPrompt: "Is there something you need to forgive your spouse for today?",
    romanticSuggestion: {
      forHusband: "Release a grudge and tell your wife you've let it go.",
      forWife: "Forgive something unspoken and show extra compassion tonight."
    }
  },
  {
    reference: "Colossians 3:13",
    text: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.",
    category: "Forgiveness",
    reflectionPrompt: "Are you bearing with your spouse the way the Lord bears with you?",
    romanticSuggestion: {
      forHusband: "Write down a grievance, then tear it up as a symbol of forgiveness.",
      forWife: "Tell your husband about a time his forgiveness healed your heart."
    }
  },
  {
    reference: "Matthew 6:14-15",
    text: "For if you forgive other people when they sin against you, your heavenly Father will also forgive you. But if you do not forgive others their sins, your Father will not forgive your sins.",
    category: "Forgiveness",
    reflectionPrompt: "How does unforgiveness in marriage block blessings?",
    romanticSuggestion: {
      forHusband: "Pray together for the grace to forgive freely.",
      forWife: "Model forgiveness by addressing a past hurt with grace."
    }
  },
  {
    reference: "Matthew 18:21-22",
    text: "Then Peter came to Jesus and asked, 'Lord, how many times shall I forgive my brother or sister who sins against me? Up to seven times?' Jesus answered, 'I tell you, not seven times, but seventy-seven times.'",
    category: "Forgiveness",
    reflectionPrompt: "Do you forgive your spouse limitlessly, or do you keep count?",
    romanticSuggestion: {
      forHusband: "Commit to forgiving without keeping a tally.",
      forWife: "Stop counting past mistakes and start fresh today."
    }
  },
  {
    reference: "1 Peter 4:8",
    text: "Above all, love each other deeply, because love covers over a multitude of sins.",
    category: "Forgiveness",
    reflectionPrompt: "How does deep love help you look past your spouse's imperfections?",
    romanticSuggestion: {
      forHusband: "Focus on your wife's strengths instead of her weaknesses today.",
      forWife: "Cover your husband's faults with love and see the best in him."
    }
  },
  {
    reference: "Micah 7:18-19",
    text: "Who is a God like you, who pardons sin and forgives the transgression of the remnant of his inheritance? You do not stay angry forever but delight to show mercy.",
    category: "Forgiveness",
    reflectionPrompt: "Do you delight in showing mercy to your spouse?",
    romanticSuggestion: {
      forHusband: "Choose mercy over being right in your next disagreement.",
      forWife: "Show your husband mercy by releasing expectations about something."
    }
  },
  {
    reference: "Psalm 103:12",
    text: "As far as the east is from the west, so far has he removed our transgressions from us.",
    category: "Forgiveness",
    reflectionPrompt: "When you forgive your spouse, do you truly let it go?",
    romanticSuggestion: {
      forHusband: "Promise your wife you won't bring up a forgiven issue again.",
      forWife: "Release a past hurt completely and don't revisit it."
    }
  },
  {
    reference: "Luke 6:37",
    text: "Do not judge, and you will not be judged. Do not condemn, and you will not be condemned. Forgive, and you will be forgiven.",
    category: "Forgiveness",
    reflectionPrompt: "Are you quick to judge your spouse or quick to forgive?",
    romanticSuggestion: {
      forHusband: "Replace a critical thought about your wife with a grateful one.",
      forWife: "Give your husband the benefit of the doubt today."
    }
  },
  {
    reference: "Isaiah 43:25",
    text: "I, even I, am he who blots out your transgressions, for my own sake, and remembers your sins no more.",
    category: "Forgiveness",
    reflectionPrompt: "Can you choose to remember your spouse's offenses no more?",
    romanticSuggestion: {
      forHusband: "Make a fresh start on an area of repeated conflict.",
      forWife: "Wipe the slate clean and greet your husband with a fresh heart."
    }
  },
  {
    reference: "Proverbs 17:9",
    text: "Whoever would foster love covers over an offense, but whoever repeats the matter separates close friends.",
    category: "Forgiveness",
    reflectionPrompt: "Do you cover offenses or do you bring them up repeatedly?",
    romanticSuggestion: {
      forHusband: "Guard your wife's reputation by never sharing her faults with others.",
      forWife: "Stop replaying a past offense in your mind and replace it with a happy memory."
    }
  },

  // ── Communication ──────────────────────────────────────────────────────────
  {
    reference: "Proverbs 18:21",
    text: "The tongue has the power of life and death, and those who love it will eat its fruit.",
    category: "Communication",
    reflectionPrompt: "Are your words giving life or death to your marriage?",
    romanticSuggestion: {
      forHusband: "Speak only life-giving words to your wife for the entire day.",
      forWife: "Use your words to breathe life into your husband's dreams."
    }
  },
  {
    reference: "Ephesians 4:29",
    text: "Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up according to their needs.",
    category: "Communication",
    reflectionPrompt: "Are your words building your spouse up or tearing them down?",
    romanticSuggestion: {
      forHusband: "Build your wife up with five specific compliments today.",
      forWife: "Speak words that encourage your husband in his work or calling."
    }
  },
  {
    reference: "Proverbs 12:18",
    text: "The words of the reckless pierce like swords, but the tongue of the wise brings healing.",
    category: "Communication",
    reflectionPrompt: "Have any of your recent words pierced your spouse? How can you heal that?",
    romanticSuggestion: {
      forHusband: "Heal a wound your words may have caused with sincere apology.",
      forWife: "Use wise, healing words when discussing a sensitive topic."
    }
  },
  {
    reference: "Proverbs 25:11",
    text: "Like apples of gold in settings of silver is a ruling rightly given.",
    category: "Communication",
    reflectionPrompt: "How can you make your words to your spouse like golden apples?",
    romanticSuggestion: {
      forHusband: "Choose your words carefully to make your wife feel treasured.",
      forWife: "Offer your husband timely words of wisdom and encouragement."
    }
  },
  {
    reference: "Proverbs 15:4",
    text: "The soothing tongue is a tree of life, but a perverse tongue crushes the spirit.",
    category: "Communication",
    reflectionPrompt: "Is your tongue a tree of life in your home?",
    romanticSuggestion: {
      forHusband: "Soothe your wife with calm, loving words after a stressful day.",
      forWife: "Be a source of peace and calm for your husband when he's anxious."
    }
  },
  {
    reference: "Ephesians 4:15",
    text: "Instead, speaking the truth in love, we will grow to become in every respect the mature body of him who is the head, that is, Christ.",
    category: "Communication",
    reflectionPrompt: "Do you speak truth in love, or does one overshadow the other?",
    romanticSuggestion: {
      forHusband: "Have an honest conversation wrapped in love and respect.",
      forWife: "Share something truthful with gentleness and care."
    }
  },
  {
    reference: "Proverbs 31:26",
    text: "She speaks with wisdom, and faithful instruction is on her tongue.",
    category: "Communication",
    reflectionPrompt: "How can wisdom guide your conversations with your spouse?",
    romanticSuggestion: {
      forHusband: "Ask your wife for her wise perspective on a decision.",
      forWife: "Share wisdom with your husband through encouragement, not lectures."
    }
  },
  {
    reference: "Proverbs 10:19",
    text: "Sin is not ended by multiplying words, but the prudent hold their tongues.",
    category: "Communication",
    reflectionPrompt: "Sometimes silence is golden. When should you hold your tongue?",
    romanticSuggestion: {
      forHusband: "Practice restraint by not having the last word in a disagreement.",
      forWife: "Sit in comfortable silence together and enjoy each other's presence."
    }
  },
  {
    reference: "James 3:17",
    text: "But the wisdom that comes from heaven is first of all pure; then peace-loving, considerate, submissive, full of mercy and good fruit, impartial and sincere.",
    category: "Communication",
    reflectionPrompt: "Is your communication with your spouse peace-loving and considerate?",
    romanticSuggestion: {
      forHusband: "Approach a difficult topic with heavenly wisdom: pure and peace-loving.",
      forWife: "Be considerate and merciful in how you bring up concerns."
    }
  },
  {
    reference: "Ecclesiastes 3:7",
    text: "A time to tear and a time to mend, a time to be silent and a time to speak.",
    category: "Communication",
    reflectionPrompt: "Do you know when to speak and when to be silent in your marriage?",
    romanticSuggestion: {
      forHusband: "Discern the right moment to share something important with your wife.",
      forWife: "Mend something between you with well-timed, heartfelt words."
    }
  },

  // ── Serving Each Other ─────────────────────────────────────────────────────
  {
    reference: "Galatians 5:13",
    text: "You, my brothers and sisters, were called to be free. But do not use your freedom to indulge the flesh; rather, serve one another humbly in love.",
    category: "Serving Each Other",
    reflectionPrompt: "How can you serve your spouse humbly today?",
    romanticSuggestion: {
      forHusband: "Do one of your wife's regular chores without being asked.",
      forWife: "Serve your husband in his love language today."
    }
  },
  {
    reference: "Philippians 2:3-4",
    text: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves, not looking to your own interests but each of you to the interests of the others.",
    category: "Serving Each Other",
    reflectionPrompt: "Are you putting your spouse's interests above your own?",
    romanticSuggestion: {
      forHusband: "Give up something you want to do for something your wife wants.",
      forWife: "Prioritize your husband's needs above your own agenda today."
    }
  },
  {
    reference: "Mark 10:45",
    text: "For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.",
    category: "Serving Each Other",
    reflectionPrompt: "Jesus led by serving. How can you lead your marriage through service?",
    romanticSuggestion: {
      forHusband: "Serve your wife sacrificially today, following Christ's example.",
      forWife: "Model servant leadership by meeting a need before being asked."
    }
  },
  {
    reference: "John 13:14-15",
    text: "Now that I, your Lord and Teacher, have washed your feet, you also should wash one another's feet. I have set you an example that you should do as I have done for you.",
    category: "Serving Each Other",
    reflectionPrompt: "What would a 'foot washing' act of service look like in your marriage?",
    romanticSuggestion: {
      forHusband: "Give your wife a foot massage or draw her a bath.",
      forWife: "Prepare something special that shows you value his comfort."
    }
  },
  {
    reference: "Matthew 20:26-28",
    text: "Whoever wants to become great among you must be your servant, and whoever wants to be first must be your slave.",
    category: "Serving Each Other",
    reflectionPrompt: "Is greatness in your marriage measured by who serves the most?",
    romanticSuggestion: {
      forHusband: "Compete with your wife to see who can out-serve the other today.",
      forWife: "Start a 'service challenge' where you both try to out-love each other."
    }
  },
  {
    reference: "Romans 12:13",
    text: "Share with the Lord's people who are in need. Practice hospitality.",
    category: "Serving Each Other",
    reflectionPrompt: "How can you and your spouse practice hospitality together?",
    romanticSuggestion: {
      forHusband: "Invite another couple over and serve them together as a team.",
      forWife: "Plan a hospitality event together to strengthen your partnership."
    }
  },
  {
    reference: "1 Peter 4:10",
    text: "Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms.",
    category: "Serving Each Other",
    reflectionPrompt: "What unique gifts do you bring to your marriage? How do you use them to serve?",
    romanticSuggestion: {
      forHusband: "Use your unique talents to bless your wife today.",
      forWife: "Use your gifts to create something meaningful for your husband."
    }
  },
  {
    reference: "Hebrews 6:10",
    text: "God is not unjust; he will not forget your work and the love you have shown him as you have helped his people and continue to help them.",
    category: "Serving Each Other",
    reflectionPrompt: "God sees every act of love in your marriage. Does that motivate you?",
    romanticSuggestion: {
      forHusband: "Know that every hidden act of service for your wife matters to God.",
      forWife: "Continue serving even when it feels unnoticed, God sees it all."
    }
  },
  {
    reference: "Ephesians 5:21",
    text: "Submit to one another out of reverence for Christ.",
    category: "Serving Each Other",
    reflectionPrompt: "What does mutual submission look like in a healthy marriage?",
    romanticSuggestion: {
      forHusband: "Yield to your wife's preference on something out of love.",
      forWife: "Support your husband's decision on something important."
    }
  },
  {
    reference: "Ephesians 5:25",
    text: "Husbands, love your wives, just as Christ loved the church and gave himself up for her.",
    category: "Serving Each Other",
    reflectionPrompt: "What does sacrificial love look like in your daily marriage life?",
    romanticSuggestion: {
      forHusband: "Give up something for your wife's benefit today.",
      forWife: "Thank your husband for the ways he sacrifices for your family."
    }
  },

  // ── Growing Together ───────────────────────────────────────────────────────
  {
    reference: "Philippians 1:6",
    text: "Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.",
    category: "Growing Together",
    reflectionPrompt: "God is still working on both of you. How does that give you hope?",
    romanticSuggestion: {
      forHusband: "Tell your wife about growth you've seen in her recently.",
      forWife: "Celebrate the progress your husband has made as a person."
    }
  },
  {
    reference: "2 Peter 3:18",
    text: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ.",
    category: "Growing Together",
    reflectionPrompt: "How are you and your spouse growing in grace together?",
    romanticSuggestion: {
      forHusband: "Start reading a devotional book together.",
      forWife: "Suggest a new way to grow spiritually as a couple."
    }
  },
  {
    reference: "Proverbs 27:17",
    text: "As iron sharpens iron, so one person sharpens another.",
    category: "Growing Together",
    reflectionPrompt: "How does your spouse sharpen you? Do you welcome it?",
    romanticSuggestion: {
      forHusband: "Thank your wife for the ways she challenges you to be better.",
      forWife: "Welcome your husband's input on an area of your growth."
    }
  },
  {
    reference: "Hebrews 10:24-25",
    text: "And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another.",
    category: "Growing Together",
    reflectionPrompt: "How do you spur your spouse on toward love and good deeds?",
    romanticSuggestion: {
      forHusband: "Encourage your wife to pursue a goal she's been hesitant about.",
      forWife: "Spur your husband on by recognizing his good deeds."
    }
  },
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    category: "Growing Together",
    reflectionPrompt: "What plans does God have for your marriage's future?",
    romanticSuggestion: {
      forHusband: "Dream together about God's plans for your family.",
      forWife: "Write down three hopes you have for your marriage's future."
    }
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    category: "Growing Together",
    reflectionPrompt: "When marriage feels weary, how do you renew your strength together?",
    romanticSuggestion: {
      forHusband: "Plan a restful day together to renew your strength.",
      forWife: "Encourage your husband when he's weary and remind him of God's promise."
    }
  },
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    category: "Growing Together",
    reflectionPrompt: "How have challenges in your marriage worked for good?",
    romanticSuggestion: {
      forHusband: "Share a difficulty that ultimately strengthened your marriage.",
      forWife: "Remind your husband that God is working all things for your good."
    }
  },
  {
    reference: "Psalm 1:3",
    text: "That person is like a tree planted by streams of water, which yields its fruit in season and whose leaf does not wither. Whatever they do prospers.",
    category: "Growing Together",
    reflectionPrompt: "What streams of water is your marriage planted beside?",
    romanticSuggestion: {
      forHusband: "Plant something together as a symbol of your growing love.",
      forWife: "Water your marriage with prayer and watch it bear fruit."
    }
  },
  {
    reference: "Ephesians 3:17-19",
    text: "So that Christ may dwell in your hearts through faith. And I pray that you, being rooted and established in love, may have power, together with all the Lord's holy people, to grasp how wide and long and high and deep is the love of Christ.",
    category: "Growing Together",
    reflectionPrompt: "How rooted and established in love is your marriage?",
    romanticSuggestion: {
      forHusband: "Explore a new dimension of love with your wife: width, length, height, or depth.",
      forWife: "Pray for your marriage to be deeply rooted in Christ's love."
    }
  },
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    category: "Growing Together",
    reflectionPrompt: "What old patterns in your marriage need to become new?",
    romanticSuggestion: {
      forHusband: "Identify one old habit and replace it with a new, loving one.",
      forWife: "Celebrate how your marriage has been made new through Christ."
    }
  }
];

// ─── Category list (derived) ─────────────────────────────────────────────────

const CATEGORIES = [...new Set(VERSES.map(v => v.category))];

// ─── Helper: deterministic daily index ───────────────────────────────────────

function daysSinceEpoch(date = new Date()) {
  return Math.floor(date.getTime() / 86400000);
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  readVerses: "lm_bible_readVerses",
  notes: "lm_bible_notes",
  sharedNotes: "lm_bible_sharedNotes",
  streak: "lm_bible_streak",
  bonusPoints: "lm_bible_bonusPoints",
  lastReadDate: "lm_bible_lastReadDate",
  spouseRead: "lm_bible_spouseRead",
  spouseSharedNotes: "lm_bible_spouseSharedNotes",
  levelVerses: "lm_bible_levelVerses"
};

// ─── BibleReader Class ───────────────────────────────────────────────────────

export class BibleReader {
  constructor(storage = localStorage) {
    this._storage = storage;
    this._verses = VERSES;
    this._categories = CATEGORIES;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  _load(key) {
    try {
      const raw = this._storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _save(key, value) {
    this._storage.setItem(key, JSON.stringify(value));
  }

  _getReadSet() {
    return new Set(this._load(STORAGE_KEYS.readVerses) || []);
  }

  _saveReadSet(readSet) {
    this._save(STORAGE_KEYS.readVerses, [...readSet]);
  }

  _getNotesMap() {
    return this._load(STORAGE_KEYS.notes) || {};
  }

  _saveNotesMap(notesMap) {
    this._save(STORAGE_KEYS.notes, notesMap);
  }

  _getSharedNotesMap() {
    return this._load(STORAGE_KEYS.sharedNotes) || {};
  }

  _saveSharedNotesMap(map) {
    this._save(STORAGE_KEYS.sharedNotes, map);
  }

  _getSpouseSharedNotes() {
    return this._load(STORAGE_KEYS.spouseSharedNotes) || {};
  }

  _getStreakData() {
    return this._load(STORAGE_KEYS.streak) || { current: 0, longest: 0 };
  }

  _saveStreakData(data) {
    this._save(STORAGE_KEYS.streak, data);
  }

  _getBonusPoints() {
    return this._load(STORAGE_KEYS.bonusPoints) || 0;
  }

  _saveBonusPoints(pts) {
    this._save(STORAGE_KEYS.bonusPoints, pts);
  }

  _getLastReadDate() {
    return this._load(STORAGE_KEYS.lastReadDate);
  }

  _saveLastReadDate(dateStr) {
    this._save(STORAGE_KEYS.lastReadDate, dateStr);
  }

  _todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Returns today's verse, deterministic by date.
   */
  getDailyVerse() {
    const index = daysSinceEpoch() % this._verses.length;
    return this._verses[index];
  }

  /**
   * Get the verse unlocked at a given level (cycles through verses).
   * @param {number|string} levelId
   */
  getVerseForLevel(levelId) {
    const num = typeof levelId === "string" ? parseInt(levelId, 10) : levelId;
    const index = (num - 1) % this._verses.length;
    return this._verses[Math.abs(index)];
  }

  /**
   * Get a verse object by reference string.
   * @param {string} reference
   */
  getVerse(reference) {
    return this._verses.find(v => v.reference === reference) || null;
  }

  /**
   * Get all verses, optionally filtered by category.
   * @param {string} [category]
   */
  getAllVerses(category) {
    if (category) {
      return this._verses.filter(v => v.category === category);
    }
    return [...this._verses];
  }

  /**
   * Get the list of categories.
   */
  getCategories() {
    return [...this._categories];
  }

  /**
   * Mark a verse as read. Awards 10 bonus points.
   * Updates streak and awards streak milestone bonuses (50 pts at 7, 14, 30, 60, 90 days).
   * @param {string} reference
   * @returns {{ pointsEarned: number, newStreak: number, milestoneReached: boolean }}
   */
  markAsRead(reference) {
    const readSet = this._getReadSet();
    const alreadyRead = readSet.has(reference);
    readSet.add(reference);
    this._saveReadSet(readSet);

    let pointsEarned = 0;
    if (!alreadyRead) {
      pointsEarned += 10;
    }

    // Streak logic
    const today = this._todayStr();
    const lastDate = this._getLastReadDate();
    const streakData = this._getStreakData();

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (lastDate === yesterdayStr) {
        streakData.current += 1;
      } else if (lastDate !== today) {
        streakData.current = 1;
      }

      this._saveLastReadDate(today);
    }

    // Streak milestones
    const milestones = [7, 14, 30, 60, 90];
    let milestoneReached = false;
    for (const m of milestones) {
      if (streakData.current === m) {
        pointsEarned += 50;
        milestoneReached = true;
        break;
      }
    }

    if (streakData.current > streakData.longest) {
      streakData.longest = streakData.current;
    }

    this._saveStreakData(streakData);

    // Save bonus points
    if (pointsEarned > 0) {
      this._saveBonusPoints(this._getBonusPoints() + pointsEarned);
    }

    return {
      pointsEarned,
      newStreak: streakData.current,
      milestoneReached
    };
  }

  /**
   * Add a personal note to a verse.
   * @param {string} reference
   * @param {string} noteText
   * @returns {{ id: number, text: string, timestamp: string }}
   */
  addNote(reference, noteText) {
    const notesMap = this._getNotesMap();
    if (!notesMap[reference]) {
      notesMap[reference] = [];
    }
    const note = {
      id: Date.now(),
      text: noteText,
      timestamp: new Date().toISOString()
    };
    notesMap[reference].push(note);
    this._saveNotesMap(notesMap);
    return note;
  }

  /**
   * Get personal notes for a verse.
   * @param {string} reference
   * @returns {Array<{ id: number, text: string, timestamp: string }>}
   */
  getNotes(reference) {
    const notesMap = this._getNotesMap();
    return notesMap[reference] || [];
  }

  /**
   * Share a note with spouse.
   * @param {string} reference
   * @param {string} noteText
   * @returns {{ id: number, text: string, timestamp: string }}
   */
  shareNote(reference, noteText) {
    const sharedMap = this._getSharedNotesMap();
    if (!sharedMap[reference]) {
      sharedMap[reference] = [];
    }
    const note = {
      id: Date.now(),
      text: noteText,
      timestamp: new Date().toISOString()
    };
    sharedMap[reference].push(note);
    this._saveSharedNotesMap(sharedMap);
    return note;
  }

  /**
   * Get spouse's shared notes for a verse.
   * In a real multiplayer system this would fetch from the partner's data.
   * For now reads from the spouseSharedNotes storage key.
   * @param {string} reference
   * @returns {Array<{ id: number, text: string, timestamp: string }>}
   */
  getSharedNotes(reference) {
    const spouseMap = this._getSpouseSharedNotes();
    return spouseMap[reference] || [];
  }

  /**
   * Get overall reading progress.
   * @returns {{ totalVerses: number, readCount: number, percentage: number }}
   */
  getReadingProgress() {
    const readSet = this._getReadSet();
    const total = this._verses.length;
    const readCount = readSet.size;
    return {
      totalVerses: total,
      readCount,
      percentage: total > 0 ? Math.round((readCount / total) * 100) : 0
    };
  }

  /**
   * Get spouse's reading progress.
   * In a real system this would come from a shared data store.
   * @returns {{ totalVerses: number, readCount: number, percentage: number, versesThisWeek: number }}
   */
  getSpouseProgress() {
    const spouseRead = this._load(STORAGE_KEYS.spouseRead) || {
      references: [],
      weeklyCount: 0
    };
    const total = this._verses.length;
    const readCount = spouseRead.references.length;
    return {
      totalVerses: total,
      readCount,
      percentage: total > 0 ? Math.round((readCount / total) * 100) : 0,
      versesThisWeek: spouseRead.weeklyCount
    };
  }

  /**
   * Get the current daily reading streak.
   * @returns {{ current: number, longest: number }}
   */
  getStreak() {
    const streakData = this._getStreakData();
    // Check if streak is still active (read today or yesterday)
    const lastDate = this._getLastReadDate();
    const today = this._todayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (lastDate !== today && lastDate !== yesterdayStr) {
      // Streak is broken
      return { current: 0, longest: streakData.longest };
    }
    return streakData;
  }

  /**
   * Get progress for a specific category.
   * @param {string} category
   * @returns {{ category: string, totalVerses: number, readCount: number, percentage: number }}
   */
  getCategoryProgress(category) {
    const readSet = this._getReadSet();
    const categoryVerses = this._verses.filter(v => v.category === category);
    const readCount = categoryVerses.filter(v => readSet.has(v.reference)).length;
    return {
      category,
      totalVerses: categoryVerses.length,
      readCount,
      percentage: categoryVerses.length > 0
        ? Math.round((readCount / categoryVerses.length) * 100)
        : 0
    };
  }

  /**
   * Get all category progress at once.
   * @returns {Array<{ category: string, totalVerses: number, readCount: number, percentage: number }>}
   */
  getAllCategoryProgress() {
    return this._categories.map(cat => this.getCategoryProgress(cat));
  }

  /**
   * Get total bonus points earned from Bible reading.
   * @returns {number}
   */
  getBonusPoints() {
    return this._getBonusPoints();
  }

  /**
   * Get the reflection prompt for a verse.
   * @param {string} reference
   * @returns {string|null}
   */
  getReflectionPrompt(reference) {
    const verse = this.getVerse(reference);
    return verse ? verse.reflectionPrompt : null;
  }

  /**
   * Get a gender-specific romantic suggestion for a verse.
   * @param {string} reference
   * @param {"husband"|"wife"} gender
   * @returns {string|null}
   */
  getRomanticSuggestion(reference, gender) {
    const verse = this.getVerse(reference);
    if (!verse) return null;
    if (gender === "husband") return verse.romanticSuggestion.forHusband;
    if (gender === "wife") return verse.romanticSuggestion.forWife;
    return null;
  }

  // ── UI Data Methods ──────────────────────────────────────────────────────

  /**
   * Get complete data for rendering a verse card.
   * @param {string} reference
   * @returns {object|null}
   */
  getVerseCardData(reference) {
    const verse = this.getVerse(reference);
    if (!verse) return null;

    const readSet = this._getReadSet();
    const notes = this.getNotes(reference);
    const sharedNotes = this.getSharedNotes(reference);

    return {
      reference: verse.reference,
      text: verse.text,
      category: verse.category,
      isRead: readSet.has(reference),
      reflectionPrompt: verse.reflectionPrompt,
      romanticSuggestion: verse.romanticSuggestion,
      personalNotes: notes,
      spouseNotes: sharedNotes,
      noteCount: notes.length + sharedNotes.length
    };
  }

  /**
   * Get data for the daily devotional view.
   * Includes daily verse, streak, progress, and spouse info.
   * @returns {object}
   */
  getDailyDevotionalData() {
    const dailyVerse = this.getDailyVerse();
    const streak = this.getStreak();
    const progress = this.getReadingProgress();
    const spouseProgress = this.getSpouseProgress();
    const categoryProgress = this.getAllCategoryProgress();
    const bonusPoints = this.getBonusPoints();

    return {
      dailyVerse: this.getVerseCardData(dailyVerse.reference) || {
        ...dailyVerse,
        isRead: false,
        personalNotes: [],
        spouseNotes: [],
        noteCount: 0
      },
      streak,
      progress,
      spouseProgress,
      categoryProgress,
      bonusPoints,
      nextMilestone: this._getNextMilestone(streak.current)
    };
  }

  /**
   * Get the next streak milestone.
   * @param {number} currentStreak
   * @returns {{ days: number, pointsReward: number, daysRemaining: number }|null}
   */
  _getNextMilestone(currentStreak) {
    const milestones = [7, 14, 30, 60, 90];
    for (const m of milestones) {
      if (currentStreak < m) {
        return {
          days: m,
          pointsReward: 50,
          daysRemaining: m - currentStreak
        };
      }
    }
    return null;
  }

  /**
   * Get complete reading list data for the UI, organized by category.
   * @returns {Array<{ category: string, progress: object, verses: Array<object> }>}
   */
  getReadingListData() {
    const readSet = this._getReadSet();
    return this._categories.map(category => {
      const verses = this._verses
        .filter(v => v.category === category)
        .map(v => ({
          reference: v.reference,
          text: v.text,
          isRead: readSet.has(v.reference),
          noteCount: (this.getNotes(v.reference).length) +
                     (this.getSharedNotes(v.reference).length)
        }));

      const readCount = verses.filter(v => v.isRead).length;
      return {
        category,
        progress: {
          totalVerses: verses.length,
          readCount,
          percentage: verses.length > 0
            ? Math.round((readCount / verses.length) * 100)
            : 0
        },
        verses
      };
    });
  }

  /**
   * Export all data in a serializable format for localStorage backup.
   * @returns {object}
   */
  exportData() {
    return {
      readVerses: this._load(STORAGE_KEYS.readVerses) || [],
      notes: this._load(STORAGE_KEYS.notes) || {},
      sharedNotes: this._load(STORAGE_KEYS.sharedNotes) || {},
      streak: this._load(STORAGE_KEYS.streak) || { current: 0, longest: 0 },
      bonusPoints: this._load(STORAGE_KEYS.bonusPoints) || 0,
      lastReadDate: this._load(STORAGE_KEYS.lastReadDate),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import data from a serialized backup.
   * @param {object} data
   */
  importData(data) {
    if (data.readVerses) this._save(STORAGE_KEYS.readVerses, data.readVerses);
    if (data.notes) this._save(STORAGE_KEYS.notes, data.notes);
    if (data.sharedNotes) this._save(STORAGE_KEYS.sharedNotes, data.sharedNotes);
    if (data.streak) this._save(STORAGE_KEYS.streak, data.streak);
    if (data.bonusPoints !== undefined) this._save(STORAGE_KEYS.bonusPoints, data.bonusPoints);
    if (data.lastReadDate) this._save(STORAGE_KEYS.lastReadDate, data.lastReadDate);
  }

  /**
   * Reset all reading data (useful for testing or starting fresh).
   */
  reset() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this._storage.removeItem(key);
    });
  }
}

// ─── Exported constants ──────────────────────────────────────────────────────

export { VERSES, CATEGORIES, STORAGE_KEYS };

// ─── Default instance ────────────────────────────────────────────────────────

export default BibleReader;

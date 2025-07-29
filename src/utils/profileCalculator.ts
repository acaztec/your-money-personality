import { Profile } from '../types';

// Question to category mapping from the CSV
const QUESTION_CATEGORIES = {
  1: 'Focus',
  2: 'Focus', 
  3: 'Focus',
  4: 'Focus',
  5: 'Focus',
  6: 'Focus',
  7: 'Emotions',
  8: 'Emotions',
  9: 'Emotions',
  10: 'Emotions',
  11: 'Emotions',
  12: 'Emotions',
  13: 'Emotions',
  14: 'Emotions',
  15: 'Emotions',
  16: 'Outlook',
  17: 'Outlook',
  18: 'Outlook',
  19: 'Outlook',
  20: 'Outlook',
  21: 'Outlook',
  22: 'Outlook',
  23: 'Outlook',
  24: 'Outlook',
  25: 'Influence',
  26: 'Influence',
  27: 'Influence',
  28: 'Influence',
  29: 'Influence',
  30: 'Influence',
  31: 'Influence',
  32: 'Influence',
  33: 'Influence',
  34: 'Bonus',
  35: 'Bonus',
  36: 'Bonus',
  37: 'Bonus',
  38: 'Bonus',
  39: 'Bonus',
  40: 'Bonus',
  41: 'Bonus',
  42: 'Bonus'
};

// Personality types and descriptions from the lookup CSV
const PERSONALITY_TYPES = {
  'Emotions': {
    'Apprehensive': {
      percentage: 24,
      description: 'Apprehensive financial types frequently worry about money. They may be financially strapped or navigating a temporary rough patch, or they may simply be anxious in general. They often second-guess their financial decisions and are constantly aware of how much (or how little) money they have. They live with an unhealthy fear of unexpected expenses or of losing control of their financial lives. On the other hand, when things are operating smoothly, they may thrive in planning and organization.',
      strengths: [
        'You likely have an above-average understanding of financial principles and a keen awareness of your own financial situation and responsibilities.',
        'You rarely waste money on frivolous things. You are not as susceptible as others to the temptations of tricky advertising or impulse purchases.',
        'When making big decisions you tend to weigh your options and conduct thorough research; your decisions are generally practical and well-thought-out.'
      ],
      challenges: [
        'Sometimes it\'s easier not to think about financial challenges or responsibilities. High levels of anxiety may lead you into this type of avoidance behavior.',
        'Financial stress (real or imagined) may lead you to keep more money than necessary locked up in savings, therefore disregarding its investment potential.',
        'You may not feel that you have the knowledge or the discipline to compare financial options and make the best decisions, even if you\'re fully capable.'
      ],
      actionItems: [
        {
          title: 'Put people first.',
          description: 'Prioritize the value of relationships and set aside a certain amount of money to improve your relationships with friends and family. Make that a similar priority to your other goals for a month and evaluate any resulting changes in your finances with an open mind.'
        },
        {
          title: 'Step out of your comfort zone.',
          description: 'Responsible use of debt can actually be a good thing when it comes to realizing your major goals, such as buying a house. Try to look at the full picture when it comes to making an investment in the future and weigh the advantages of using debt if necessary.'
        },
        {
          title: 'Research.',
          description: 'Sometimes caution can come from fear. If you\'re uncomfortable making a financial decision, do your homework and learn about the transaction. And if a friend or financial professional weighs in, be sure to rely on someone you trust and research their credentials.'
        }
      ]
    },
    'Cautious': {
      percentage: 59,
      description: 'Cautious financial types have a healthy level of anxiety about their finances. They think about money from time to time and it has a moderate impact on their life in general. While making financial decisions is not necessarily a pleasant activity, cautious types enjoy the feeling of having some money saved, and as a result they tend to be risk averse and avoid unnecessary expenditures. They often set goals that they are saving for, and they don\'t find it difficult to visualize those goals.',
      strengths: [
        'You care about money, but it doesn\'t dominate your thinking. You strike a balance between controlling your finances and letting them control you.',
        'You tend to avoid irresponsible debt and irresponsible financial behavior in general. While you may succumb to occasional splurges, your spending is mostly moderate.',
        'You are generally well-prepared in the case of a financial set-back or emergency, both practically and emotionally. You tend to plan rather than panic.'
      ],
      challenges: [
        'You may be slightly too analytical about money while ignoring some of the emotional aspects, such as how your financial restraint may impact your quality of life.',
        'Being overly risk averse can limit your options, and excessive caution with your finances may actually stop your money from fully working in your favor.',
        'You tend to enjoy routine in most aspects of life and may find it difficult to make big financial decisions that require you to step out of your comfort zone.'
      ]
    },
    'Relaxed': {
      description: 'Relaxed financial types don\'t worry much about money, and they tend to enjoy spending it. Going into debt is not a big issue for relaxed types, and they don\'t worry much about paying off those debts in the future. Their attitude might be "spend now and worry about it later." Relaxed financial types may even be somewhat aloof when calculating the risks they are taking. On the other hand they may not focus on the amount of risk at all, but rather on how the process makes them feel in the here and now.',
      strengths: [
        'You have no hang-ups about enjoying your hard-earned money. If you come across something you really want, you likely find a way to make it happen.',
        'You can be generous with family and friends and easygoing in social situations where money is involved. You don\'t sweat the bill, and gift-giving may be a forte.',
        'You tend to be more willing than other people to take risks, and not just financially. Others may see you as a thrill-seeker.'
      ],
      challenges: [
        'You are more susceptible than others to the sway of tricky advertising or the temptation of impulse buying and may often waste money on frivolous purchases.',
        'Your friends or family may begin to perceive you as careless or irresponsible with money, which could negatively impact those relationships.',
        'Debt management is not something you usually think about when opening a line of credit. You may find yourself in debt without a plan to get out.'
      ]
    }
  },
  'Outlook': {
      percentage: 17,
    'Confident': {
      description: 'Because people "don\'t know what they don\'t know" they tend to overestimate their ability to make good financial decisions. Confident types make decisions quickly and are efficient in most money matters. This can be a desirable skill and can have great effect. However, confident types may veer into dangerous territory if overly confident, as they can make decisions based on insufficient information or act hastily about other things in their lives (such as their jobs) that can impact their financial situation.',
        'You have no hang-ups about enjoying your hard-earned money. If you come across something you really want, you likely find a way to make it happen.',
        'You can be generous with family and friends and easygoing in social situations where money is involved. You don\'t sweat the bill, and gift-giving may be a forte.',
        'You tend to be more willing than other people to take risks, and not just financially. Others may see you as a thrill-seeker.'
        'You\'re willing to take monetary risks for the chance of a big payoff. Call it luck or positioning, when there\'s luck to be had, you\'re more likely to have it.'
      ],
        'You are more susceptible than others to the sway of tricky advertising or the temptation of impulse buying and may often waste money on frivolous purchases.',
        'Your friends or family may begin to perceive you as careless or irresponsible with money, which could negatively impact those relationships.',
        'Debt management is not something you usually think about when opening a line of credit. You may find yourself in debt without a plan to get out.'
      ],
      actionItems: [
        {
          title: 'Create boundaries.',
          description: 'Set spending limits for yourself and stick to them. Consider using cash for discretionary spending to make your spending more tangible.'
        },
        {
          title: 'Plan for fun.',
          description: 'Budget for entertainment and enjoyable purchases so you can spend guilt-free within your means.'
        },
        {
          title: 'Automate savings.',
          description: 'Set up automatic transfers to savings so you save before you have a chance to spend.'
        }
        'You may not have a realistic understanding of your capabilities when making money decisions, nor a realistic picture of the risks you are taking.'
      ]
    },
    'Optimistic': {
      description: 'Optimistic financial types tend to be hopeful about the future and believe that things will work out somehow. In the general population, most people are overly optimistic about their futures as compared to the actual probabilities of positive events occurring. This positive outlook works well on a daily basis, but optimistic types may be caught off guard every now and then when things don\'t work out as hoped. Optimists also tend to associate with similar types of people, which can reinforce their behavior and attitudes.',
      percentage: 17,
      strengths: [
        'Your optimistic outlook can be a great asset when approaching debt management, credit repair, or other high stakes or potentially challenging tasks.',
        'Your confidence in your ability to handle money translates well into certain skills; you may excel in professions that require sales techniques and negotiations.',
        'Once you\'ve made up your mind, you don\'t often waver or second-guess yourself. You act on your words, so people view you as steadfast and reliable.',
        'You\'re willing to take monetary risks for the chance of a big payoff. Call it luck or positioning, when there\'s luck to be had, you\'re more likely to have it.'
      challenges: [
        'Since you have faith that everything will "work out," you may be caught off-guard when things don\'t go as hoped, even if you have a backup plan.',
        'Most people don\'t incorporate all of the information available when making decisions, and you may be prone to discounting warning signs or red flags.',
        'Too much confidence can translate to a careless attitude, so you might not have any emergency funds or be good at saving money.',
        'You may not have a realistic understanding of your capabilities when making money decisions, nor a realistic picture of the risks you are taking.'
      ],
      actionItems: [
        {
          title: 'Get grounded and assess your finances.',
          description: 'Get grounded and take a realistic assessment of your finances for a complete and accurate picture of your net worth. Understand that there may be something you don\'t know or that you are not incorporating all of the alternative choices when making money decisions.'
        },
        {
          title: 'Consider all outcomes.',
          description: 'Because taking risks is a part of everyday life, make sure you stop and think about any possible negative consequences, not just the positive. Look at "worst case scenarios" along with potential positive outcomes to help make better decisions, financial and otherwise.'
        },
        {
          title: 'Use your confidence wisely.',
          description: 'Be more careful with the risks you take and ask for a second opinion from someone you trust before taking larger risks. If you consult financial resources or professionals, combine their expertise with your own outlook for a hopeful yet grounded financial plan.'
        }
    },
    'Skeptical': {
      description: 'Skeptical financial types are concerned about the future and don\'t always expect things to work out financially. Some level of skepticism is healthy, especially when finances are at stake, and these types are good at recognizing risks or scams and taking the appropriate precautions for protecting their assets. But too much skepticism can have a negative impact, such as causing miserly behavior or resentment in social relationships. It can also affect investment choices, causing skeptical types to assume too little risk.',
      percentage: 41,
      strengths: [
        'You don\'t expect things to happen automatically, so you are more likely and willing than other types to work hard to meet your financial goals.',
        'Your optimistic outlook can be a great asset when approaching debt management, credit repair, or other high stakes or potentially challenging tasks.',
        'You can have a "happy go lucky" or "go with the flow" attitude that makes you popular with other people. Money is not usually an obstacle to having fun.',
        'You prioritize happiness in life and are generally willing to spend money on positive experiences like entertainment, dining out, and vacations.'
      challenges: [
        'Some amount of concern can help to keep you grounded, but it can also be a downer. You may sometimes feel like "no matter what I do, I can\'t seem to get ahead."',
        'Since you have faith that everything will "work out," you may be caught off-guard when things don\'t go as hoped, even if you have a backup plan.',
        'You may not make accurate assessments as to how the risks you take in life will work out. This can impact both yourself as well as those close to you.',
        'Happiness in the short term can take precedence over happiness in the long term. Without grounding future plans in present reality, debt can become a problem.'
      ],
      actionItems: [
        {
          title: 'Plan for setbacks.',
          description: 'While maintaining your positive outlook, prepare for potential challenges by building an emergency fund and having backup plans.'
        },
        {
          title: 'Balance present and future.',
          description: 'Continue enjoying life while also setting aside money for long-term goals and retirement.'
        },
        {
          title: 'Seek realistic perspectives.',
          description: 'Get input from trusted friends or advisors who can provide objective viewpoints on your financial decisions.'
        }
    }
  },
  'Focus': {
      percentage: 42,
    'Future Focused': {
      description: 'Future-focused financial types usually have a set of goals and personal aspirations in place, with a solid understanding of at least the basic financial principles needed to achieve them. These goals tend to be specific and measurable; for instance, future-focused types are more likely than others to visualize what they would like to do in retirement rather than saying "I will figure it out when the time comes." Future-focused types generally save more, and will often earmark the money they are saving for specific goals.',
        'You don\'t expect things to happen automatically, so you are more likely and willing than other types to work hard to meet your financial goals.',
        'You are usually conservative and moderate with money. You don\'t typically engage in wasteful behaviors or bite off more than you can chew.',
        'You tend to be on guard and hold your cards close. As a result, you are no easy target and are not likely to be taken advantage of financially.'
        'In many situations, you are the type to "keep your eye on the prize." You are likely to be perceived as a hard-working and responsible person.'
      ],
        'Some amount of concern can help to keep you grounded, but it can also be a downer. You may sometimes feel like "no matter what I do, I can\'t seem to get ahead."',
        'Your skepticism may keep you from making progress; you are hesitant to take any financial risks, so your money might not be used to its full potential.',
        'Being overly skeptical can make it difficult to accept advice. You may find it hard to trust people, and this may impact your personal relationships.'
      ],
      actionItems: [
        {
          title: 'Take calculated risks.',
          description: 'While maintaining your cautious nature, consider low-risk investments that can help your money grow over time.'
        },
        {
          title: 'Find trusted advisors.',
          description: 'Identify one or two financial professionals whose credentials and approach you trust for guidance on major decisions.'
        },
        {
          title: 'Focus on progress.',
          description: 'Celebrate small financial wins and track your progress to maintain motivation despite setbacks.'
        }
        'You tend to enjoy routine in most aspects of life and may find it difficult to make big financial decisions that require you to step out of your comfort zone.'
      ],
      actionItems: [
        {
          title: 'Put people first.',
      percentage: 43,
          description: 'Prioritize the value of relationships and set aside a certain amount of money to improve your relationships with friends and family. Make that a similar priority to your other goals for a month and evaluate any resulting changes in your finances with an open mind.'
        },
        'You are driven and practical when it comes to your financial goals and personal aspirations, which can often lead to success in achieving them!',
        'You understand the importance of having money saved for a rainy day, and you are generally prepared in the case of an emergency or a financial setback.',
        'In many situations, you are the type to "keep your eye on the prize." You are likely to be perceived as a hard-working and responsible person.'
        },
        {
        'You can get overly caught up in thinking about the impact your present actions will have on the future, and so you don\'t always appreciate the present moment.',
        'Having big dreams is applauded, but your chances of attaining them may be hampered by a disconnect between the dream and your everyday financial behavior.',
        'Your tendency to think ahead may occasionally reach extremes, which can contribute to anxiety or might negatively impact other aspects of your life.'
      ],
      actionItems: [
        {
          title: 'Balance present and future.',
          description: 'While planning for the future is important, make sure to enjoy some of your money today and appreciate present moments.'
        },
        {
          title: 'Break down big goals.',
          description: 'Turn your long-term financial dreams into specific, actionable steps you can take each month.'
        },
        {
          title: 'Review and adjust.',
          description: 'Regularly review your financial plans and adjust them as your life circumstances change.'
        }
      ]
    },
    'Present Focused': {
      percentage: 57,
      description: 'As the term implies, present-focused people live for today and prefer to leave the future open-ended. This attitude can make for a refreshing lifestyle, yet it can also be fatalistic, in that a disregard for the future implies that everything will just "work out somehow." Alternatively, present-focused types may be well aware of financial behaviors they should adopt, such as saving money, yet they give little thought to how their present actions impact their financial situation in the future.',
      strengths: [
        'You tend to live in the moment and relish small pleasures. With few worries about the future, you live a mostly happy and optimistic life.',
        'You can be good at small-scale budgeting, like making the best use of a set amount of money for a shopping trip, or stretching a dollar when you\'re in a pinch.',
        'Since you are not overly concerned with your finances on a daily basis, you can be generous and easygoing in social situations where money is an issue.'
      ],
      challenges: [
        'Your financial goals (if you have them) may be too vague or unrealistic. Or you might know what you want, but have trouble turning your goals into actions.',
        'You can get caught up in the minutiae of everyday financial decisions and lose sight of the bigger picture. You may stress over unimportant details.',
        'You may not have much money set aside for savings or in your retirement account, or if you do, not much thought is put into how it is invested.'
      ],
      actionItems: [
        {
          title: 'Start small with future planning.',
          description: 'Begin with simple, short-term financial goals that feel manageable and gradually work toward longer-term planning.'
        },
        {
          title: 'Automate your future.',
          description: 'Set up automatic savings and investment contributions so your future self is taken care of without daily decisions.'
        },
        {
          title: 'Make it visual.',
          description: 'Use apps or tools that show how small actions today can impact your future financial picture.'
        }
      ]
    }
  },
  'Influence': {
    'Independent': {
      percentage: 57,
      description: 'Independent financial types are typically self-reliant in life, which carries over into financial matters. They pride themselves on being independent thinkers, and may even be "lone wolves" in other aspects. Independent financial types may ask for advice from others, but will rely primarily on their own research and perhaps on the services of one or a few professional advisors when they need to make financial decisions. In some cases they may come from families where money was not an acceptable topic of conversation.',
      strengths: [
        'You tend to work hard and are generally responsible with your money, which you spend on things you truly value. You view money as just a means to an end.',
        'You aren\'t overly influenced by the opinions of others. You generally feel no pressure to conform, and do not try to keep up with friends or neighbors when it comes to purchasing new or desirable items.',
        'You like to do your own research when making decisions, which builds your financial education and can streamline many otherwise complicated processes.'
      ],
      challenges: [
        'Over-confidence in your own abilities may be an issue. You might have trouble delegating authority to others or trusting authority even when it is warranted.',
        'You are not as concerned as others with maintaining norms or standards when it comes to financial matters, which can lead to misplaced funds or waste.',
        'You don\'t necessarily care about money intrinsically, spending more when you have it, and less when you don\'t. Resources might be scarce sometimes.'
      ],
      actionItems: [
        {
          title: 'Honor your personality; ask questions.',
          description: 'Watch that you are not eliminating potential sources of expert information when making financial decisions. Independent types may need to spend more time than others when learning something new to adequately research and become comfortable with the result.'
        },
        {
          title: 'Embrace your lone wolf.',
          description: 'You\'ve heard money-related rules (like housing costs should be a third of your income), but don\'t always abide by them. Go ahead and embrace this spirit, but do so in ways that won\'t affect your finances too drastically. Start small.'
        },
        {
          title: 'Give credence to professionals.',
          description: 'Since you know your goals better than anyone, you\'re in the best position to decide how your money is spent. However, everyone can benefit from an objective point of view. Evaluate the sources of information that are already available to you, and give credit to experience.'
        }
      ]
    },
    'Social': {
      percentage: 28,
      description: 'Social, outwardly focused people tend to rely heavily or even exclusively on the opinions of others – sometimes more than they know. They are not necessarily independent thinkers when it comes to money and will instead make certain decisions because their friends are making them, particularly those they trust the most. They may put friends\' or family\'s needs ahead of their own. The size and composition of their families or social circles will impact their financial decisions and the degree of risk they are willing to assume.',
      strengths: [
        'You can be excellent at making connections and networking, which is useful when working to find partners in business, or to develop your career.',
        'You always take into account the opinions and wishes of those close to you when making money decisions; you are generally perceived as reliable and trustworthy.',
        'You can be quite open-minded when learning something new and are generally comfortable trusting others to give you advice on financial matters.'
      ],
      challenges: [
        'You can lose sight of your own priorities when faced with the needs and wants of others, so your financial picture is susceptible to inconsistency.',
        'You tend to get caught up in trends, so rather than assessing your true desires, you may end up spending money on things you don\'t necessarily value.',
        'You may find yourself in the middle of difficult discussions, debates, or stuck between dissenting opinions. Financial disagreements are especially stressful.'
      ],
      actionItems: [
        {
          title: 'Define your own priorities.',
          description: 'Before seeking advice from others, take time to identify your personal financial goals and values.'
        },
        {
          title: 'Set boundaries.',
          description: 'Learn to say no to financial requests or social spending that doesn\'t align with your goals.'
        },
        {
          title: 'Diversify your advisors.',
          description: 'Get input from multiple trusted sources to avoid being overly influenced by any one person\'s opinion.'
        }
      ]
    },
    'Elusive': {
      percentage: 15,
      description: 'Elusive financial types avoid making decisions when it comes to money matters. Financial topics may not be of much interest to them, or they may feel unqualified, or some combination of the two. Whether they are intimidated by financial matters or simply prone to avoidance in making decisions in any sphere of their lives, elusive financial types generally leave decisions to other people. They may also self-identify as dependent or needing help in other aspects of their lives.',
      strengths: [
        'You tend to value time over money, and a decreased focus on money matters means you have more time and energy for things that are truly important to you.',
        'You may already have a trusted friend or advisor to make decisions for you, but if not, you likely have no trouble finding help when you need it.',
        'In social settings you are adept at steering the conversation away from touchy topics; people in your social circle may see you as a peacemaker.'
      ],
      challenges: [
        'Researching how to handle finances may seem boring, overwhelming, or otherwise unpleasant; you are more likely than others to be lacking in financial literacy.',
        'Your own wants and needs may get overlooked, as the source or person you trust to make financial decisions may not be making optimal decisions for you.',
        'Avoidance can have negative consequences; you may not be fully prepared to deal with unexpected setbacks or emergency situations when you need to.'
      ],
      actionItems: [
        {
          title: 'Start with basics.',
          description: 'Begin with simple financial concepts and gradually build your knowledge and confidence.'
        },
        {
          title: 'Find the right help.',
          description: 'Identify a trusted financial advisor who can guide you while respecting your preferences and comfort level.'
        },
        {
          title: 'Automate what you can.',
          description: 'Set up automatic systems for savings and bill paying to reduce the number of financial decisions you need to make.'
        }
      ]
    }
  },
  'Bonus': {
    'Organized': {
      percentage: 25,
      description: 'Organizers tend to be the people in their families or social circles who manage the finances, and they achieve a great deal of satisfaction from keeping tabs on their own or their household\'s financial situation. They are also likely to monitor items such as insurance policies and to be up to date on the details of their financial lives. Organizers may enjoy reading or discussing financial topics, comparing notes, and applying what they\'ve learned to their own financial situation.',
      strengths: [
        'You have an idea of the state of your finances at all times and rarely make costly financial blunders such as overdrawing an account or missing a bill payment.',
        'If you are tempted by tricky advertising or an impulse purchase, you tend to recognize it before your spending gets too far out of hand.',
        'You are likely to take your career or academic pursuits very seriously, and you enjoy making progress. You have the makings of an excellent employee.'
      ],
      challenges: [
        'You can become overly miserly about money matters. Spending money on anything unnecessary can sometimes be challenging for you and may even cause anxiety.',
        'Generally, you appreciate measurable aspects of your finances, like your credit score, but you can also obsess over the number and lose sight of the purpose.',
        'Being overly organized can impact your ability to take suitable risks. You hesitate to act without a plan, which can be a detriment when time is of the essence.'
      ],
      actionItems: [
        {
          title: 'Allow for flexibility.',
          description: 'Build some "fun money" into your budget and give yourself permission to spend it without guilt.'
        },
        {
          title: 'Focus on the big picture.',
          description: 'While tracking details is important, regularly step back to see how your organization is serving your larger goals.'
        },
        {
          title: 'Take calculated risks.',
          description: 'Use your organizational skills to research and plan for appropriate financial risks that can help you grow wealth.'
        }
      ]
    },
    'Fun Seeking': {
      percentage: 18,
      description: 'Fun-seekers see money as a means for enjoying life. They tend to be hedonists to a certain degree, who will spend money just because they enjoy the process. They have been know to use terms such as "retail therapy," "YOLO," and "treat yo\'self." Financial responsibility is not high on the fun-seekers\' list of concerns, and so these types are most likely to incur large amounts of debt. And beware, even other types have been known to fall into fun-seeker behavior if they come across a large sum of money.',
      strengths: [
        'You tend to enjoy life to the fullest. You are likely quite popular and have a number of like-minded friends who will indulge your fun-seeking nature.',
        'If you are tempted by tricky advertising or an impulse purchase, you tend to recognize it before your spending gets too far out of hand.',
        'You are an excellent shopper and always know where to find the most interesting things. You take pride in your possessions and generally love to share.'
      ],
      challenges: [
        'The social bonding process of shopping or other costly activities can have long-term implications and financial effects. Credit card debt may be a problem.',
        'You prefer to spend money on enjoyable activities rather than putting it away for a rainy day, so you might have less money saved than you should.',
        'Online purchases can be your downfall when it comes to reining in spending. You tend to get caught up in the act without much regard to the consequences.'
      ],
      actionItems: [
        {
          title: 'Take the impulse out of purchasing.',
          description: 'Every time you start to make an impulse purchase, imagine the item in your life. Picture yourself using it in different circumstances. Does it feel realistic or forced? Think of what else you might use that money on. Then reevaluate - do you still want it?'
        },
        {
          title: 'Anticipate big savings.',
          description: 'If the idea of saving money bores you, link it to an actual payoff. Think of a financial goal that excites you, and put aside a set amount each month toward that goal. This can be a "gift jar" on your countertop or a "vacation" or "holidays" savings account at the bank.'
        },
        {
          title: 'Use checks and balances online.',
          description: 'When shopping online, place all your purchases on a wish list or in a shopping cart and leave them there. Read a few product reviews. Then step away from the computer and give yourself a day or two to think about whether or not you really want those items.'
        }
      ]
    },
    'Change Seeking': {
      percentage: 57,
      description: 'Change-seekers are quickly bored with the status quo and are constantly looking for the next adventure in life.',
      strengths: [
        'You are likely willing to take suitable risks with your money. This has potential for major gains when making ambitious financial decisions or investments.',
        'If you are tempted by tricky advertising or an impulse purchase, you tend to recognize it before your spending gets too far out of hand.',
        'You value experiences greatly, and it\'s likely you have a wealth of stories to share about your travels to far off places or reviews of cultural events.'
      ],
      challenges: [
        'You might have a habit of making spontaneous decisions without thinking about the costs involved. Current and future expenses sometimes shock you.',
        'You prefer to spend money on enjoyable activities rather than putting it away for a rainy day, so you might have less money saved than you should.',
        'While looking forward to the next big thing, you might not be taking into account all of the implications or financial effects that come with transition.'
      ],
      actionItems: [
        {
          title: 'Plan for change.',
          description: 'Before making major life changes, calculate the financial impact and create a transition budget.'
        },
        {
          title: 'Build a change fund.',
          description: 'Set aside money specifically for new experiences and adventures so you can pursue them without derailing other financial goals.'
        },
        {
          title: 'Channel your energy.',
          description: 'Use your desire for change to explore new investment opportunities or income streams that align with your interests.'
        }
      ]
    }
  }
};

export function calculateProfile(answers: number[]): Profile {
  // Calculate category scores
  const categoryScores: { [key: string]: number[] } = {
    'Focus': [],
    'Emotions': [],
    'Outlook': [],
    'Influence': [],
    'Bonus': []
  };

  // Group answers by category
  answers.forEach((answer, index) => {
    const questionNum = index + 1;
    const category = QUESTION_CATEGORIES[questionNum];
    if (category) {
      categoryScores[category].push(answer);
    }
  });

  // Calculate average scores for each category
  const categoryAverages: { [key: string]: number } = {};
  Object.keys(categoryScores).forEach(category => {
    const scores = categoryScores[category];
    if (scores.length > 0) {
      categoryAverages[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  });

  // Determine personality types based on scores
  // This is a simplified algorithm - you may need to adjust based on your specific rules
  const personalities: string[] = [];
  const descriptions: string[] = [];
  const percentages: number[] = [];

  // Focus category
  if (categoryAverages['Focus'] >= 4.5) {
    personalities.push('Future Focused');
    descriptions.push(PERSONALITY_TYPES['Focus']['Future Focused'].description);
    percentages.push(PERSONALITY_TYPES['Focus']['Future Focused'].percentage);
  } else {
    personalities.push('Present Focused');
    descriptions.push(PERSONALITY_TYPES['Focus']['Present Focused'].description);
    percentages.push(PERSONALITY_TYPES['Focus']['Present Focused'].percentage);
  }

  // Emotions category
  if (categoryAverages['Emotions'] >= 5.5) {
    personalities.push('Apprehensive');
    descriptions.push(PERSONALITY_TYPES['Emotions']['Apprehensive'].description);
    percentages.push(PERSONALITY_TYPES['Emotions']['Apprehensive'].percentage);
  } else if (categoryAverages['Emotions'] >= 3.5) {
    personalities.push('Cautious');
    descriptions.push(PERSONALITY_TYPES['Emotions']['Cautious'].description);
    percentages.push(PERSONALITY_TYPES['Emotions']['Cautious'].percentage);
  } else {
    personalities.push('Relaxed');
    descriptions.push(PERSONALITY_TYPES['Emotions']['Relaxed'].description);
    percentages.push(PERSONALITY_TYPES['Emotions']['Relaxed'].percentage);
  }

  // Outlook category
  if (categoryAverages['Outlook'] >= 5.0) {
    personalities.push('Optimistic');
    descriptions.push(PERSONALITY_TYPES['Outlook']['Optimistic'].description);
    percentages.push(PERSONALITY_TYPES['Outlook']['Optimistic'].percentage);
  } else if (categoryAverages['Outlook'] >= 3.5) {
    personalities.push('Confident');
    descriptions.push(PERSONALITY_TYPES['Outlook']['Confident'].description);
    percentages.push(PERSONALITY_TYPES['Outlook']['Confident'].percentage);
  } else {
    personalities.push('Skeptical');
    descriptions.push(PERSONALITY_TYPES['Outlook']['Skeptical'].description);
    percentages.push(PERSONALITY_TYPES['Outlook']['Skeptical'].percentage);
  }

  // Influence category
  if (categoryAverages['Influence'] >= 5.0) {
    personalities.push('Social');
    descriptions.push(PERSONALITY_TYPES['Influence']['Social'].description);
    percentages.push(PERSONALITY_TYPES['Influence']['Social'].percentage);
  } else if (categoryAverages['Influence'] >= 3.5) {
    personalities.push('Independent');
    descriptions.push(PERSONALITY_TYPES['Influence']['Independent'].description);
    percentages.push(PERSONALITY_TYPES['Influence']['Independent'].percentage);
  } else {
    personalities.push('Elusive');
    descriptions.push(PERSONALITY_TYPES['Influence']['Elusive'].description);
    percentages.push(PERSONALITY_TYPES['Influence']['Elusive'].percentage);
  }

  // Bonus category
  if (categoryAverages['Bonus'] >= 5.5) {
    personalities.push('Change Seeking');
    descriptions.push(PERSONALITY_TYPES['Bonus']['Change Seeking'].description);
    percentages.push(PERSONALITY_TYPES['Bonus']['Change Seeking'].percentage);
  } else if (categoryAverages['Bonus'] >= 4.5) {
    personalities.push('Fun Seeking');
    descriptions.push(PERSONALITY_TYPES['Bonus']['Fun Seeking'].description);
    percentages.push(PERSONALITY_TYPES['Bonus']['Fun Seeking'].percentage);
  } else {
    personalities.push('Organized');
    descriptions.push(PERSONALITY_TYPES['Bonus']['Organized'].description);
    percentages.push(PERSONALITY_TYPES['Bonus']['Organized'].percentage);
  }

  return {
    emotions: 0, // Not used in new system
    outlook: 0,  // Not used in new system
    focus: 0,    // Not used in new system
    influence: 0, // Not used in new system
    riskTolerance: 0, // Not used in new system
    personalities: personalities,
    personalityScores: categoryAverages,
    descriptions: descriptions,
    percentages: percentages
  };
}
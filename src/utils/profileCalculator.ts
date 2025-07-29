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
      ]
    },
    'Cautious': {
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
    'Confident': {
      description: 'Because people "don\'t know what they don\'t know" they tend to overestimate their ability to make good financial decisions. Confident types make decisions quickly and are efficient in most money matters. This can be a desirable skill and can have great effect. However, confident types may veer into dangerous territory if overly confident, as they can make decisions based on insufficient information or act hastily about other things in their lives (such as their jobs) that can impact their financial situation.',
      strengths: [
        'Your confidence in your ability to handle money translates well into certain skills; you may excel in professions that require sales techniques and negotiations.',
        'Once you\'ve made up your mind, you don\'t often waver or second-guess yourself. You act on your words, so people view you as steadfast and reliable.',
        'You\'re willing to take monetary risks for the chance of a big payoff. Call it luck or positioning, when there\'s luck to be had, you\'re more likely to have it.'
      ],
      challenges: [
        'Most people don\'t incorporate all of the information available when making decisions, and you may be prone to discounting warning signs or red flags.',
        'Too much confidence can create a lackadaisical attitude, so you might not be well prepared for setbacks, such as with proper insurance or an estate plan.',
        'You may not have a realistic understanding of your capabilities when making money decisions, nor a realistic picture of the risks you are taking.'
      ]
    },
    'Optimistic': {
      description: 'Optimistic financial types tend to be hopeful about the future and believe that things will work out somehow. In the general population, most people are overly optimistic about their futures as compared to the actual probabilities of positive events occurring. This positive outlook works well on a daily basis, but optimistic types may be caught off guard every now and then when things don\'t work out as hoped. Optimists also tend to associate with similar types of people, which can reinforce their behavior and attitudes.',
      strengths: [
        'Your optimistic outlook can be a great asset when approaching debt management, credit repair, or other high stakes or potentially challenging tasks.',
        'You can have a "happy go lucky" or "go with the flow" attitude that makes you popular with other people. Money is not usually an obstacle to having fun.',
        'You prioritize happiness in life and are generally willing to spend money on positive experiences like entertainment, dining out, and vacations.'
      ],
      challenges: [
        'Since you have faith that everything will "work out," you may be caught off-guard when things don\'t go as hoped, even if you have a backup plan.',
        'You may not make accurate assessments as to how the risks you take in life will work out. This can impact both yourself as well as those close to you.',
        'Happiness in the short term can take precedence over happiness in the long term. Without grounding future plans in present reality, debt can become a problem.'
      ]
    },
    'Skeptical': {
      description: 'Skeptical financial types are concerned about the future and don\'t always expect things to work out financially. Some level of skepticism is healthy, especially when finances are at stake, and these types are good at recognizing risks or scams and taking the appropriate precautions for protecting their assets. But too much skepticism can have a negative impact, such as causing miserly behavior or resentment in social relationships. It can also affect investment choices, causing skeptical types to assume too little risk.',
      strengths: [
        'You don\'t expect things to happen automatically, so you are more likely and willing than other types to work hard to meet your financial goals.',
        'You are usually conservative and moderate with money. You don\'t typically engage in wasteful behaviors or bite off more than you can chew.',
        'You tend to be on guard and hold your cards close. As a result, you are no easy target and are not likely to be taken advantage of financially.'
      ],
      challenges: [
        'Some amount of concern can help to keep you grounded, but it can also be a downer. You may sometimes feel like "no matter what I do, I can\'t seem to get ahead."',
        'Your skepticism may keep you from making progress; you are hesitant to take any financial risks, so your money might not be used to its full potential.',
        'Being overly skeptical can make it difficult to accept advice. You may find it hard to trust people, and this may impact your personal relationships.'
      ]
    }
  },
  'Focus': {
    'Future Focused': {
      description: 'Future-focused financial types usually have a set of goals and personal aspirations in place, with a solid understanding of at least the basic financial principles needed to achieve them. These goals tend to be specific and measurable; for instance, future-focused types are more likely than others to visualize what they would like to do in retirement rather than saying "I will figure it out when the time comes." Future-focused types generally save more, and will often earmark the money they are saving for specific goals.',
      strengths: [
        'You are driven and practical when it comes to your financial goals and personal aspirations, which can often lead to success in achieving them!',
        'You understand the importance of having money saved for a rainy day, and you are generally prepared in the case of an emergency or a financial setback.',
        'In many situations, you are the type to "keep your eye on the prize." You are likely to be perceived as a hard-working and responsible person.'
      ],
      challenges: [
        'You can get overly caught up in thinking about the impact your present actions will have on the future, and so you don\'t always appreciate the present moment.',
        'Having big dreams is applauded, but your chances of attaining them may be hampered by a disconnect between the dream and your everyday financial behavior.',
        'Your tendency to think ahead may occasionally reach extremes, which can contribute to anxiety or might negatively impact other aspects of your life.'
      ]
    },
    'Present Focused': {
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
      ]
    }
  },
  'Influence': {
    'Independent': {
      description: 'Independent financial types are typically self-reliant in life, which carries over into financial matters. They pride themselves on being independent thinkers, and may even be "lone wolves" in other aspects. Independent financial types may ask for advice from others, but will rely primarily on their own research and perhaps on the services of one or a few professional advisors when they need to make financial decisions. In some cases they may come from families where money was not an acceptable topic of conversation.',
      strengths: [
        'You tend to work hard and are generally responsible with your money, which you spend on things you truly value. You view money as a just a means to an end.',
        'You aren\'t overly influenced by the opinions of others. You generally feel no pressure to conform, and do not identify with "keeping up with the Joneses."',
        'You like to do your own research when making decisions, which builds your financial education and can streamline many otherwise complicated processes.'
      ],
      challenges: [
        'Over-confidence in your own abilities may be an issue. You might have trouble delegating authority to others or trusting authority even when it is warranted.',
        'You are not as concerned as others with maintaining norms or standards when it comes to financial matters, which can lead to misplaced funds or waste.',
        'You don\'t necessarily care about money intrinsically, spending more when you have it, spending less when you don\'t. Resources might be tight sometimes.'
      ]
    },
    'Social': {
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
      ]
    },
    'Elusive': {
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
      ]
    }
  },
  'Bonus': {
    'Organized': {
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
      ]
    },
    'Fun Seeking': {
      description: 'Fun-seekers see money as a means for enjoying life. They tend to be hedonists to a certain degree, who will spend money just because they enjoy the process. They have been know to use terms such as "retail therapy," "YOLO," and "treat yo\'self." Financial responsibility is not high on the fun-seekers\' list of concerns, and so these types are most likely to incur large amounts of debt. And beware, even other types have been known to fall into fun-seeker behavior if they come across a large sum of money.',
      strengths: [
        'You tend to enjoy life to the fullest. You are likely quite popular and have a number of like-minded friends who will indulge your fun-seeking nature.',
        'If you are tempted by tricky advertising or an impulse purchase, you tend to recognize it before your spending gets too far out of hand.',
        'You are an excellent shopper and always know where to find the most interesting things. You take pride in your possessions and generally love to share.'
      ],
      challenges: [
        'The social bonding process of shopping or other costly activities can have long term implications and financial effects. Credit card debt may be a problem.',
        'You prefer to spend money on enjoyable activities rather than putting it away for a rainy day, so you might have less money saved than you should.',
        'Online purchases can be your downfall when it comes to reining in spending. You tend to get caught up in the act without much regard to the consequences.'
      ]
    },
    'Change Seeking': {
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

  // Focus category
  if (categoryAverages['Focus'] >= 4.5) {
    personalities.push('Future Focused');
    descriptions.push(PERSONALITY_TYPES['Focus']['Future Focused'].description);
  } else {
    personalities.push('Present Focused');
    descriptions.push(PERSONALITY_TYPES['Focus']['Present Focused'].description);
  }

  // Emotions category
  if (categoryAverages['Emotions'] >= 5.5) {
    personalities.push('Apprehensive');
    descriptions.push(PERSONALITY_TYPES['Emotions']['Apprehensive'].description);
  } else if (categoryAverages['Emotions'] >= 3.5) {
    personalities.push('Cautious');
    descriptions.push(PERSONALITY_TYPES['Emotions']['Cautious'].description);
  } else {
    personalities.push('Relaxed');
    descriptions.push(PERSONALITY_TYPES['Emotions']['Relaxed'].description);
  }

  // Outlook category
  if (categoryAverages['Outlook'] >= 5.0) {
    personalities.push('Optimistic');
    descriptions.push(PERSONALITY_TYPES['Outlook']['Optimistic'].description);
  } else if (categoryAverages['Outlook'] >= 3.5) {
    personalities.push('Confident');
    descriptions.push(PERSONALITY_TYPES['Outlook']['Confident'].description);
  } else {
    personalities.push('Skeptical');
    descriptions.push(PERSONALITY_TYPES['Outlook']['Skeptical'].description);
  }

  // Take top 3 personalities (Focus, Emotions, Outlook are primary)
  const topPersonalities = personalities.slice(0, 3);
  const topDescriptions = descriptions.slice(0, 3);

  return {
    emotions: 0, // Not used in new system
    outlook: 0,  // Not used in new system
    focus: 0,    // Not used in new system
    influence: 0, // Not used in new system
    riskTolerance: 0, // Not used in new system
    personalities: topPersonalities,
    personalityScores: categoryAverages,
    descriptions: topDescriptions
  };
}
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  TrendingUp, 
  Target, 
  Users, 
  Brain,
  BookOpen,
  Wrench,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText
} from 'lucide-react';
import { Profile } from '../types';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';
import { generateAdvisorSummary } from '../services/aiService';

export default function Dashboard() {
  const location = useLocation();
  const { profile, assessmentAnswers } = location.state as { profile: Profile; assessmentAnswers: number[] };
  const [activeChapter, setActiveChapter] = useState(1);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const generateSummary = async () => {
      setLoadingSummary(true);
      try {
        const summary = await generateAdvisorSummary(profile, assessmentAnswers);
        setAdvisorSummary(summary);
      } catch (error) {
        console.error('Error generating advisor summary:', error);
        setAdvisorSummary('Unable to generate advisor summary at this time.');
      } finally {
        setLoadingSummary(false);
      }
    };

    generateSummary();
  }, [profile, assessmentAnswers]);

  const getPersonalityData = (category: string, personalityType: string) => {
    // The personality data is stored in the profileCalculator, not in the profile object
    // Import it directly from the calculator
    const PERSONALITY_DATA = {
      'EMOTIONS': {
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
          ],
          actionItems: [
            {
              title: 'Put your financial life on autopilot.',
              description: 'Sign up for online bill pay. If your bills are paid automatically each month you won\'t spend extra time thinking about them. You can also find tools to set up "push" notifications that will help you anticipate events in an orderly, structured manner and reduce anxiety.'
            },
            {
              title: 'Engage in practical daydreaming.',
              description: 'Use visualization techniques to imagine how small behavioral changes can have big effects. Then resolve to do just one measurable thing every day to improve your finances. Start with something simple, like making a daily contribution to a savings jar and watching it grow.'
            },
            {
              title: 'Write out your budget.',
              description: 'Try tracking how much money you have coming in and out on a consistent basis with a budget and projecting it forward with best-case scenarios. You can hopefully ease your money worries with a sense of predictability and pattern.'
            }
          ]
        },
        'Cautious': {
          description: 'Cautious financial types have a healthy level of anxiety about their finances. They think about money from time to time and it has a moderate impact on their life in general. While making financial decisions is not necessarily a pleasant activity, cautious types enjoy the feeling of having some money saved, and as a result they tend to be risk averse and avoid unnecessary expenditures. They often set goals that they are saving for, and they don t find it difficult to visualize those goals.',
          strengths: [
            'You care about money, but it doesn\'t dominate your thinking. You strike a balance between controlling your finances and letting them control you.',
            'You tend to avoid irresponsible debt and irresponsible financial behavior in general. While you may succumb to occasional splurges, your spending is mostly moderate.',
            'You are generally well-prepared in the case of a financial set-back or emergency, both practically and emotionally. You tend to plan rather than panic.'
          ],
          challenges: [
            'You may be slightly too analytical about money while ignoring some of the emotional aspects, such as how your financial restraint may impact your quality of life.',
            'Being overly risk averse can limit your options, and excessive caution with your finances may actually stop your money from fully working in your favor.',
            'You tend to enjoy routine in most aspects of life and may find it difficult to make big financial decisions that require you to step out of your comfort zone.'
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
        'Relaxed': {
          description: 'Relaxed financial types don t worry much about money, and they tend to enjoy spending it. Going into debt is not a big issue for relaxed types, and they don t worry much about paying off those debts in the future. Their attitude might be  spend now and worry about it later.  Relaxed financial types may even be somewhat aloof when calculating the risks they are taking. On the other hand they may not focus on the amount of risk at all, but rather on how the process makes them feel in the here and now.',
          strengths: [
            'You have no hang-ups about enjoying your hard-earned money. If you come across something you really want, you likely find a way to make it happen.',
            'You can be generous with family and friends and easygoing in social situations where money is involved. You don\'t sweat the bill, and gift-giving may be a forte.',
            'You tend to be more willing than other people to take risks, and not just financially. Others may see you as a thrill-seeker.'
          ],
          challenges: [
            'You are more susceptible than others to the sway of tricky advertising or the temptation of impulse buying and may often waste money on frivolous purchases.',
            'Your friends or family may begin to perceive you as careless or irresponsible with money, which could negatively impact those relationships.',
            'Debt management is not something you usually think about when opening a line of credit. You may find yourself in debt without a plan to get out.'
          ],
          actionItems: [
            {
              title: 'Put your financial life on autopilot.',
              description: 'Try signing up for online bill pay: if your bills are paid automatically each month, you won\'t need to switch gears or spend any extra time thinking about them. Just be sure to check your accounts every now and then to make sure things are operating smoothly.'
            },
            {
              title: 'Slow down; give yourself a moment to reconsider before you buy.',
              description: 'Before making a spending decision (from impulse buy to major purchase), think through the implications of your decision. If it helps, take a walk around the store or up and down the street while you assess pros, cons, long-term effects, and how much you actually want it.'
            },
            {
              title: 'Give yourself an allowance.',
              description: 'Evaluate your current accounts for stability. Then, if you can build into your budget a certain amount to spend on fun things each month, you\'ll be less likely to overspend. Consider putting aside a set amount of cash or using a prepaid debit card if that\'s easier.'
            }
          ]
        }
      },
      'OUTLOOK': {
        'Confident': {
          description: 'Because people  don t know what they don t know  they tend to overestimate their ability to make good financial decisions. Confident types make decisions quickly and are efficient in most money matters. This can be a desirable skill and can have great effect. However, confident types may veer into dangerous territory if overly confident, as they can make decisions based on insufficient information or act hastily about other things in their lives (such as their jobs) that can impact their financial situation.',
          strengths: [
            'Your confidence in your ability to handle money translates well into certain skills; you may excel in professions that require sales techniques and negotiations.',
            'Once you\'ve made up your mind, you don\'t often waver or second-guess yourself. You act on your words, so people view you as steadfast and reliable.',
            'You\'re willing to take monetary risks for the chance of a big payoff. Call it luck or positioning, when there\'s luck to be had, you\'re more likely to have it.'
          ],
          challenges: [
            'Most people don\'t incorporate all of the information available when making decisions, and you may be prone to discounting warning signs or red flags.',
            'Too much confidence can create a lackadaisical attitude, so you might not be well prepared for setbacks, such as with proper insurance or an estate plan.',
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
          ],
          actionItems: [
            {
              title: 'Get grounded and assess your finances.',
              description: 'Gather all of your financial information together in one place: accounts, bills, debts, assets and create a budget. This should be a complete and current financial picture. Then project it forward a few years to be more mindful of your overall financial situation.'
            },
            {
              title: 'Consider all outcomes.',
              description: 'Because taking risks is a part of everyday life, make sure you stop and think about any possible negative consequences, not just the positive. Look at "worst case scenarios" along with potential positive outcomes to help make better decisions, financial and otherwise.'
            },
            {
              title: 'Use your optimism wisely.',
              description: 'Be sure to incorporate long term strategies when thinking about what will make you and those close to you the happiest. If you consult financial resources or professionals, combine their expertise with your own outlook for a hopeful yet grounded financial plan.'
            }
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
          ],
          actionItems: [
            {
              title: 'Assess your finances realistically.',
              description: 'Do a realistic assessment of your finances - perhaps you\'re in a better position than you thought. Give yourself credit for what you have accomplished and realize that most other people are in the same boat. If you have a budget, try to find potential for surplus.'
            },
            {
              title: 'List your goals, and don\'t hold back.',
              description: 'Compartmentalize your money goals to address all of the important areas in life, such as basic needs, family and friends, and saving for the future. Make goals for each area and concrete plans to meet those goals. Work on those goals a little bit at a time.'
            },
            {
              title: 'Engage in tiny acts of trust.',
              description: 'If you work with a financial professional, be open-minded to their advice and projections. Try to see the larger picture and understand that there may be information that you don\'t have.'
            }
          ]
        }
      },
      'FOCUS': {
        'Future Focused': {
          description: 'Future-focused financial types usually have a set of goals and personal aspirations in place, with a solid understanding of at least the basic financial principles needed to achieve them. These goals tend to be specific and measurable; for instance, future-focused types are more likely than others to visualize what they would like to do in retirement rather than saying  I will figure it out when the time comes.  Future-focused types generally save more, and will often earmark the money they are saving for specific goals.',
          strengths: [
            'You are driven and practical when it comes to your financial goals and personal aspirations, which can often lead to success in achieving them!',
            'You understand the importance of having money saved for a rainy day, and you are generally prepared in the case of an emergency or a financial setback.',
            'In many situations, you are the type to "keep your eye on the prize." You are likely to be perceived as a hard-working and responsible person.'
          ],
          challenges: [
            'You can get overly caught up in thinking about the impact your present actions will have on the future, and so you don\'t always appreciate the present moment.',
            'Having big dreams is applauded, but your chances of attaining them may be hampered by a disconnect between the dream and your everyday financial behavior.',
            'Your tendency to think ahead may occasionally reach extremes, which can contribute to anxiety or might negatively impact other aspects of your life.'
          ],
          actionItems: [
            {
              title: 'Break big goals into smaller pieces.',
              description: 'You probably already know your major financial goals, but have you assessed them on a smaller scale? Break your long-term goals into smaller, more measurable ones. Then assess whether these are feasible, and set up milestones to make sure you\'re staying on track.'
            },
            {
              title: 'Treat yourself.',
              description: 'Saving money for the future is important, but are you neglecting the present? If spending money on immediate pleasures comes with a sense of guilt, you may not be enjoying your money as much as you should be. The solution is simple: within reason, treat yourself.'
            },
            {
              title: 'Reassess old standards.',
              description: 'If you already have a savings account, take a closer look. When was the last time you assessed your savings needs? If it\'s been a while, reevaluate these figures in light of your current income and status.'
            }
          ]
        },
        'Present Focused': {
          description: 'As the term implies, present-focused people live for today and prefer to leave the future open-ended. This attitude can make for a refreshing lifestyle, yet it can also be fatalistic, in that a disregard for the future implies that everything will just  work out somehow.  Alternatively, present-focused types may be well aware of financial behaviors they should adopt, such as saving money, yet they give little thought to how their present actions impact their financial situation in the future.',
          strengths: [
            'You tend to live in the moment and relish small pleasures. With few worries about the future, you live a mostly happy and optimistic life.',
            'You can be good at small-scale budgeting, like making the best use of a set amount of money for a shopping trip, or stretching your money if necessary.',
            'Since you are not overly concerned with your finances on a daily basis, you can be generous and easygoing in social situations where money is an issue.'
          ],
          challenges: [
            'Your financial goals (if you have them) may be too vague or unrealistic. Or you might know what you want, but have trouble turning your goals into actions.',
            'You can get caught up in the minutiae of everyday financial decisions and lose sight of the bigger picture. You may stress over unimportant details.',
            'You may not have much money set aside for savings in your banking or investment accounts, or if you do, not much thought is put into how it is invested.'
          ],
          actionItems: [
            {
              title: 'Embrace time value of money.',
              description: 'If you\'re not familiar with the time value of money, look it up; if you\'re already a pro, calculate how much a given amount will be worth in five, ten, and twenty years. Even if you don\'t have surplus now, you\'ll see the benefits of putting money aside in the future.'
            },
            {
              title: 'Link goals and actions.',
              description: 'Spend some time brainstorming about your future financial aspirations. Then define specific goals for the next month, next year, and the distant future. Compare these to a list of your current priorities. Then set up measurable milestones with actions to take now.'
            },
            {
              title: 'Prepare for emergencies.',
              description: 'Are you prepared for a financial setback? If you haven\'t already done so, build up your emergency fund. Opinion varies, but in general experts recommend keeping 3-6 months worth of expenses at easy access. Check your accounts and make sure you have a comfortable amount.'
            }
          ]
        }
      },
      'INFLUENCE': {
        'Independent': {
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
          description: 'Social, outwardly focused people tend to rely heavily or even exclusively on the opinions of others   sometimes more than they know. They are not necessarily independent thinkers when it comes to money and will instead make certain decisions because their friends are making them, particularly those they trust the most. They may put friends\' or family\'s needs ahead of their own. The size and composition of their families or social circles will impact their financial decisions and the degree of risk they are willing to assume.',
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
              title: 'Develop healthy skepticism.',
              description: 'Be mindful of over-reliance on the opinions of others. It\'s not always a bad thing to look to others for advice, but be wary of who you listen to when it comes to financial matters. Do your own independent research to back up what others have told you.'
            },
            {
              title: 'Assert your opinions.',
              description: 'Deferring to others to make decisions can leave you feeling resentful. You know your goals and money needs better than anyone, you are in the best position to decide how your money is spent. Guidance is fine, but be sure your decisions are ultimately your own.'
            },
            {
              title: 'Use your social nature effectively.',
              description: 'Hold regular conversations with people included in your financial picture to make sure everyone is involved and informed. Determine if there are any decisions that can be made autonomously, then delegate assignments or control of those decisions to yourself and others.'
            }
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
          ],
          actionItems: [
            {
              title: 'Gain skills and confidence simultaneously.',
              description: 'To combat the feeling that you are unqualified to make financial decisions, seek out sources of financial literacy education that approach difficult topics in a manner that feels right to you. Consider articles, videos, games, and content that is conversational in tone.'
            },
            {
              title: 'Assert your opinions.',
              description: 'Deferring to others can result in feeling a lack of control or resentment. You know your goals and money needs better than anyone, so you are in the best position to decide how your money is spent. Guidance is fine, but be sure your decisions are ultimately your own.'
            },
            {
              title: 'Empower yourself with money.',
              description: 'If making big decisions is uncomfortable for you, start with low stakes. Test out an independent spirit by making an impromptu financial decision - just be sure it won\'t affect your finances too drastically. Start small.'
            }
          ]
        }
      },
      'BONUS': {
        'Organized': {
          description: 'Organizers tend to be the people in their families or social circles who manage the finances, and they achieve a great deal of satisfaction from keeping tabs on their own or their household s financial situation. They are also likely to monitor items such as insurance policies and to be up to date on the details of their financial lives. Organizers may enjoy reading or discussing financial topics, comparing notes, and applying what they\'ve learned to their own financial situation.',
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
              title: 'Buddy up and organize your worries away.',
    // Import it directly from the calculator
    const PERSONALITY_DATA = {
      'EMOTIONS': {
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
          ],
          actionItems: [
            {
              title: 'Put your financial life on autopilot.',
              description: 'Sign up for online bill pay. If your bills are paid automatically each month you won\'t spend extra time thinking about them. You can also find tools to set up "push" notifications that will help you anticipate events in an orderly, structured manner and reduce anxiety.'
            },
            {
              title: 'Engage in practical daydreaming.',
              description: 'Use visualization techniques to imagine how small behavioral changes can have big effects. Then resolve to do just one measurable thing every day to improve your finances. Start with something simple, like making a daily contribution to a savings jar and watching it grow.'
            },
            {
              title: 'Write out your budget.',
              description: 'Try tracking how much money you have coming in and out on a consistent basis with a budget and projecting it forward with best-case scenarios. You can hopefully ease your money worries with a sense of predictability and pattern.'
            }
          ]
        },
        'Cautious': {
          description: 'Cautious financial types have a healthy level of anxiety about their finances. They think about money from time to time and it has a moderate impact on their life in general. While making financial decisions is not necessarily a pleasant activity, cautious types enjoy the feeling of having some money saved, and as a result they tend to be risk averse and avoid unnecessary expenditures. They often set goals that they are saving for, and they don t find it difficult to visualize those goals.',
          strengths: [
            'You care about money, but it doesn\'t dominate your thinking. You strike a balance between controlling your finances and letting them control you.',
            'You tend to avoid irresponsible debt and irresponsible financial behavior in general. While you may succumb to occasional splurges, your spending is mostly moderate.',
            'You are generally well-prepared in the case of a financial set-back or emergency, both practically and emotionally. You tend to plan rather than panic.'
          ],
          challenges: [
            'You may be slightly too analytical about money while ignoring some of the emotional aspects, such as how your financial restraint may impact your quality of life.',
            'Being overly risk averse can limit your options, and excessive caution with your finances may actually stop your money from fully working in your favor.',
            'You tend to enjoy routine in most aspects of life and may find it difficult to make big financial decisions that require you to step out of your comfort zone.'
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
        'Relaxed': {
          description: 'Relaxed financial types don t worry much about money, and they tend to enjoy spending it. Going into debt is not a big issue for relaxed types, and they don t worry much about paying off those debts in the future. Their attitude might be  spend now and worry about it later.  Relaxed financial types may even be somewhat aloof when calculating the risks they are taking. On the other hand they may not focus on the amount of risk at all, but rather on how the process makes them feel in the here and now.',
          strengths: [
            'You have no hang-ups about enjoying your hard-earned money. If you come across something you really want, you likely find a way to make it happen.',
            'You can be generous with family and friends and easygoing in social situations where money is involved. You don\'t sweat the bill, and gift-giving may be a forte.',
            'You tend to be more willing than other people to take risks, and not just financially. Others may see you as a thrill-seeker.'
          ],
          challenges: [
            'You are more susceptible than others to the sway of tricky advertising or the temptation of impulse buying and may often waste money on frivolous purchases.',
            'Your friends or family may begin to perceive you as careless or irresponsible with money, which could negatively impact those relationships.',
            'Debt management is not something you usually think about when opening a line of credit. You may find yourself in debt without a plan to get out.'
          ],
          actionItems: [
            {
              title: 'Put your financial life on autopilot.',
              description: 'Try signing up for online bill pay: if your bills are paid automatically each month, you won\'t need to switch gears or spend any extra time thinking about them. Just be sure to check your accounts every now and then to make sure things are operating smoothly.'
            },
            {
              title: 'Slow down; give yourself a moment to reconsider before you buy.',
              description: 'Before making a spending decision (from impulse buy to major purchase), think through the implications of your decision. If it helps, take a walk around the store or up and down the street while you assess pros, cons, long-term effects, and how much you actually want it.'
            },
            {
              title: 'Give yourself an allowance.',
              description: 'Evaluate your current accounts for stability. Then, if you can build into your budget a certain amount to spend on fun things each month, you\'ll be less likely to overspend. Consider putting aside a set amount of cash or using a prepaid debit card if that\'s easier.'
            }
          ]
        }
      },
      'OUTLOOK': {
        'Confident': {
          description: 'Because people  don t know what they don t know  they tend to overestimate their ability to make good financial decisions. Confident types make decisions quickly and are efficient in most money matters. This can be a desirable skill and can have great effect. However, confident types may veer into dangerous territory if overly confident, as they can make decisions based on insufficient information or act hastily about other things in their lives (such as their jobs) that can impact their financial situation.',
          strengths: [
            'Your confidence in your ability to handle money translates well into certain skills; you may excel in professions that require sales techniques and negotiations.',
            'Once you\'ve made up your mind, you don\'t often waver or second-guess yourself. You act on your words, so people view you as steadfast and reliable.',
            'You\'re willing to take monetary risks for the chance of a big payoff. Call it luck or positioning, when there\'s luck to be had, you\'re more likely to have it.'
          ],
          challenges: [
            'Most people don\'t incorporate all of the information available when making decisions, and you may be prone to discounting warning signs or red flags.',
            'Too much confidence can create a lackadaisical attitude, so you might not be well prepared for setbacks, such as with proper insurance or an estate plan.',
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
          ],
          actionItems: [
            {
              title: 'Get grounded and assess your finances.',
              description: 'Gather all of your financial information together in one place: accounts, bills, debts, assets and create a budget. This should be a complete and current financial picture. Then project it forward a few years to be more mindful of your overall financial situation.'
            },
            {
              title: 'Consider all outcomes.',
              description: 'Because taking risks is a part of everyday life, make sure you stop and think about any possible negative consequences, not just the positive. Look at "worst case scenarios" along with potential positive outcomes to help make better decisions, financial and otherwise.'
            },
            {
              title: 'Use your optimism wisely.',
              description: 'Be sure to incorporate long term strategies when thinking about what will make you and those close to you the happiest. If you consult financial resources or professionals, combine their expertise with your own outlook for a hopeful yet grounded financial plan.'
            }
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
          ],
          actionItems: [
            {
              title: 'Assess your finances realistically.',
              description: 'Do a realistic assessment of your finances - perhaps you\'re in a better position than you thought. Give yourself credit for what you have accomplished and realize that most other people are in the same boat. If you have a budget, try to find potential for surplus.'
            },
            {
              title: 'List your goals, and don\'t hold back.',
              description: 'Compartmentalize your money goals to address all of the important areas in life, such as basic needs, family and friends, and saving for the future. Make goals for each area and concrete plans to meet those goals. Work on those goals a little bit at a time.'
            },
            {
              title: 'Engage in tiny acts of trust.',
              description: 'If you work with a financial professional, be open-minded to their advice and projections. Try to see the larger picture and understand that there may be information that you don\'t have.'
            }
          ]
        }
      },
      'FOCUS': {
        'Future Focused': {
          description: 'Future-focused financial types usually have a set of goals and personal aspirations in place, with a solid understanding of at least the basic financial principles needed to achieve them. These goals tend to be specific and measurable; for instance, future-focused types are more likely than others to visualize what they would like to do in retirement rather than saying  I will figure it out when the time comes.  Future-focused types generally save more, and will often earmark the money they are saving for specific goals.',
          strengths: [
            'You are driven and practical when it comes to your financial goals and personal aspirations, which can often lead to success in achieving them!',
            'You understand the importance of having money saved for a rainy day, and you are generally prepared in the case of an emergency or a financial setback.',
            'In many situations, you are the type to "keep your eye on the prize." You are likely to be perceived as a hard-working and responsible person.'
          ],
          challenges: [
            'You can get overly caught up in thinking about the impact your present actions will have on the future, and so you don\'t always appreciate the present moment.',
            'Having big dreams is applauded, but your chances of attaining them may be hampered by a disconnect between the dream and your everyday financial behavior.',
            'Your tendency to think ahead may occasionally reach extremes, which can contribute to anxiety or might negatively impact other aspects of your life.'
          ],
          actionItems: [
            {
              title: 'Break big goals into smaller pieces.',
              description: 'You probably already know your major financial goals, but have you assessed them on a smaller scale? Break your long-term goals into smaller, more measurable ones. Then assess whether these are feasible, and set up milestones to make sure you\'re staying on track.'
            },
            {
              title: 'Treat yourself.',
              description: 'Saving money for the future is important, but are you neglecting the present? If spending money on immediate pleasures comes with a sense of guilt, you may not be enjoying your money as much as you should be. The solution is simple: within reason, treat yourself.'
            },
            {
              title: 'Reassess old standards.',
              description: 'If you already have a savings account, take a closer look. When was the last time you assessed your savings needs? If it\'s been a while, reevaluate these figures in light of your current income and status.'
            }
          ]
        },
        'Present Focused': {
          description: 'As the term implies, present-focused people live for today and prefer to leave the future open-ended. This attitude can make for a refreshing lifestyle, yet it can also be fatalistic, in that a disregard for the future implies that everything will just  work out somehow.  Alternatively, present-focused types may be well aware of financial behaviors they should adopt, such as saving money, yet they give little thought to how their present actions impact their financial situation in the future.',
          strengths: [
            'You tend to live in the moment and relish small pleasures. With few worries about the future, you live a mostly happy and optimistic life.',
            'You can be good at small-scale budgeting, like making the best use of a set amount of money for a shopping trip, or stretching your money if necessary.',
            'Since you are not overly concerned with your finances on a daily basis, you can be generous and easygoing in social situations where money is an issue.'
          ],
          challenges: [
            'Your financial goals (if you have them) may be too vague or unrealistic. Or you might know what you want, but have trouble turning your goals into actions.',
            'You can get caught up in the minutiae of everyday financial decisions and lose sight of the bigger picture. You may stress over unimportant details.',
            'You may not have much money set aside for savings in your banking or investment accounts, or if you do, not much thought is put into how it is invested.'
          ],
          actionItems: [
            {
              title: 'Embrace time value of money.',
              description: 'If you\'re not familiar with the time value of money, look it up; if you\'re already a pro, calculate how much a given amount will be worth in five, ten, and twenty years. Even if you don\'t have surplus now, you\'ll see the benefits of putting money aside in the future.'
            },
            {
              title: 'Link goals and actions.',
              description: 'Spend some time brainstorming about your future financial aspirations. Then define specific goals for the next month, next year, and the distant future. Compare these to a list of your current priorities. Then set up measurable milestones with actions to take now.'
            },
            {
              title: 'Prepare for emergencies.',
              description: 'Are you prepared for a financial setback? If you haven\'t already done so, build up your emergency fund. Opinion varies, but in general experts recommend keeping 3-6 months worth of expenses at easy access. Check your accounts and make sure you have a comfortable amount.'
            }
          ]
        }
      },
      'INFLUENCE': {
        'Independent': {
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
          description: 'Social, outwardly focused people tend to rely heavily or even exclusively on the opinions of others   sometimes more than they know. They are not necessarily independent thinkers when it comes to money and will instead make certain decisions because their friends are making them, particularly those they trust the most. They may put friends\' or family\'s needs ahead of their own. The size and composition of their families or social circles will impact their financial decisions and the degree of risk they are willing to assume.',
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
              title: 'Develop healthy skepticism.',
              description: 'Be mindful of over-reliance on the opinions of others. It\'s not always a bad thing to look to others for advice, but be wary of who you listen to when it comes to financial matters. Do your own independent research to back up what others have told you.'
            },
            {
              title: 'Assert your opinions.',
              description: 'Deferring to others to make decisions can leave you feeling resentful. You know your goals and money needs better than anyone, you are in the best position to decide how your money is spent. Guidance is fine, but be sure your decisions are ultimately your own.'
            },
            {
              title: 'Use your social nature effectively.',
              description: 'Hold regular conversations with people included in your financial picture to make sure everyone is involved and informed. Determine if there are any decisions that can be made autonomously, then delegate assignments or control of those decisions to yourself and others.'
            }
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
          ],
          actionItems: [
            {
              title: 'Gain skills and confidence simultaneously.',
              description: 'To combat the feeling that you are unqualified to make financial decisions, seek out sources of financial literacy education that approach difficult topics in a manner that feels right to you. Consider articles, videos, games, and content that is conversational in tone.'
            },
            {
              title: 'Assert your opinions.',
              description: 'Deferring to others can result in feeling a lack of control or resentment. You know your goals and money needs better than anyone, so you are in the best position to decide how your money is spent. Guidance is fine, but be sure your decisions are ultimately your own.'
            },
            {
              title: 'Empower yourself with money.',
              description: 'If making big decisions is uncomfortable for you, start with low stakes. Test out an independent spirit by making an impromptu financial decision - just be sure it won\'t affect your finances too drastically. Start small.'
            }
          ]
        }
      },
      'BONUS': {
        'Organized': {
          description: 'Organizers tend to be the people in their families or social circles who manage the finances, and they achieve a great deal of satisfaction from keeping tabs on their own or their household s financial situation. They are also likely to monitor items such as insurance policies and to be up to date on the details of their financial lives. Organizers may enjoy reading or discussing financial topics, comparing notes, and applying what they\'ve learned to their own financial situation.',
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
              title: 'Buddy up and organize your worries away.',
              description: 'There\'s no point in denying your organized nature, so why not share? Aim your focus at a particularly disorganized friend and help him get his finances in order. Your systematic methods and his relaxed approach may just teach each other a thing or two.'
            },
            {
              title: 'Guard against potential threats.',
              description: 'If you find yourself fixating on certain aspects of your financial situation that are beyond your immediate control, implement methods to alleviate the burden. To protect your finances, for example, consider identity theft monitoring for peace of mind.'
            },
            {
              title: 'Stick to a schedule.',
              description: 'Set up a schedule for monitoring your finances and stick to it. Avoid overly obsessive monitoring of accounts. Allow online banking and other financial websites to do most of the work for you; then try to relax.'
            }
          ]
        },
        'Fun Seeking': {
          description: 'Fun-seekers see money as a means for enjoying life. They tend to be hedonists to a certain degree, who will spend money just because they enjoy the process. Financial responsibility is not high on the fun-seekers\' list of concerns, and so these types are most likely to incur large amounts of debt. And beware, even other types have been known to fall into fun-seeker behavior if they come across a large sum of money.',
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
              title: 'Budget for spontaneity.',
              description: 'It might feel dull to avoid taking risks altogether, so if your budget allows, each month set aside a modest amount of cash in an envelope to be used however you like, whenever you\'re feeling spontaneous. But there\'s a rule: once it\'s gone, it\'s gone.'
            },
            {
              title: 'View savings as future experiences.',
              description: 'If the idea of saving money bores you, link it to an actual experience. Think of a financial goal that excites you, and put aside a set amount each month toward that goal. This can be a "restaurant jar" on your countertop or a "vacation" savings account at the bank.'
            },
            {
              title: 'Zoom out.',
              description: 'Try to take a holistic view. Always be aware of how the current adventure can impact your ability to have adventures down the road. Before you make a major change (such as a new job or moving to a new location), carefully list all the associated costs you can think of.'
            }
          ]
        }
      }
    };

    return PERSONALITY_DATA[category]?.[personalityType];
  };

  const getChapterIcon = (index: number) => {
    const icons = [User, TrendingUp, Target, Users, Brain, BookOpen, FileText];
    const IconComponent = icons[index - 1] || User;
    return <IconComponent className="w-5 h-5" />;
  };

  const getPersonalityColor = (personality: string) => {
    const colors = {
      'Future Focused': 'text-blue-600',
      'Present Focused': 'text-green-600',
      'Apprehensive': 'text-red-600',
      'Cautious': 'text-yellow-600',
      'Relaxed': 'text-green-600',
      'Confident': 'text-blue-600',
      'Optimistic': 'text-green-600',
      'Skeptical': 'text-gray-600',
      'Independent': 'text-purple-600',
      'Social': 'text-pink-600',
      'Elusive': 'text-gray-600',
      'Organized': 'text-indigo-600',
      'Fun Seeking': 'text-orange-600',
      'Change Seeking': 'text-purple-600'
    };
    return colors[personality] || 'text-gray-600';
  };

  const chapters = [
    { title: 'Your Personality Overview', icon: User },
    { title: 'Focus & Planning', icon: Target },
    { title: 'Emotions & Money', icon: TrendingUp },
    { title: 'Outlook & Confidence', icon: Brain },
    { title: 'Social Influence', icon: Users },
    { title: 'Recommended Resources', icon: BookOpen },
    { title: 'Financial Advisor Summary', icon: FileText }
  ];

  const renderChapterContent = () => {
    switch (activeChapter) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Money Personality Profile</h2>
              <p className="text-lg text-gray-600">
                Based on your assessment responses, here are your primary financial personality traits:
              </p>
            </div>

            <div className="grid gap-6">
              {profile.personalities.map((personality, index) => (
                <div key={personality} className="card">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-xl font-bold ${getPersonalityColor(personality)}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${getPersonalityColor(personality)}`}>
                        {personality}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {profile.descriptions?.[index] || 'Description not available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        const focusPersonality = profile.personalities.find(p => 
          p === 'Future Focused' || p === 'Present Focused'
        );
        const focusData = focusPersonality ? getPersonalityData('FOCUS', focusPersonality) : null;

        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Focus & Planning</h2>
              <p className="text-lg text-gray-600">
                Understanding your approach to financial planning and goal-setting
              </p>
            </div>

            {focusData ? (
              <div className="space-y-6">
                <div className="card">
                  <h3 className={`text-2xl font-semibold mb-4 ${getPersonalityColor(focusPersonality)}`}>
                    {focusPersonality}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {focusData.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-600 mb-3">Your Strengths</h4>
                      <ul className="space-y-2">
                        {focusData.strengths?.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">Areas to Watch</h4>
                      <ul className="space-y-2">
                        {focusData.challenges?.map((challenge, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">Action Items</h4>
                    <div className="space-y-4">
                      {focusData.actionItems?.map((item, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">{item.title}</h5>
                          <p className="text-blue-800 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <p className="text-gray-500">No focus personality data found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Available personalities: {profile.personalities.join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        const emotionPersonality = profile.personalities.find(p => 
          p === 'Apprehensive' || p === 'Cautious' || p === 'Relaxed'
        );
        const emotionData = emotionPersonality ? getPersonalityData('EMOTIONS', emotionPersonality) : null;

        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Emotions & Money</h2>
              <p className="text-lg text-gray-600">
                How your emotions influence your financial decisions
              </p>
            </div>

            {emotionData ? (
              <div className="space-y-6">
                <div className="card">
                  <h3 className={`text-2xl font-semibold mb-4 ${getPersonalityColor(emotionPersonality)}`}>
                    {emotionPersonality}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {emotionData.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-600 mb-3">Your Strengths</h4>
                      <ul className="space-y-2">
                        {emotionData.strengths?.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">Areas to Watch</h4>
                      <ul className="space-y-2">
                        {emotionData.challenges?.map((challenge, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">Action Items</h4>
                    <div className="space-y-4">
                      {emotionData.actionItems?.map((item, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">{item.title}</h5>
                          <p className="text-blue-800 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <p className="text-gray-500">No emotion personality data found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Available personalities: {profile.personalities.join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        const outlookPersonality = profile.personalities.find(p => 
          p === 'Confident' || p === 'Optimistic' || p === 'Skeptical'
        );
        const outlookData = outlookPersonality ? getPersonalityData('OUTLOOK', outlookPersonality) : null;

        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Outlook & Confidence</h2>
              <p className="text-lg text-gray-600">
                Your general outlook on financial matters and decision-making confidence
              </p>
            </div>

            {outlookData ? (
              <div className="space-y-6">
                <div className="card">
                  <h3 className={`text-2xl font-semibold mb-4 ${getPersonalityColor(outlookPersonality)}`}>
                    {outlookPersonality}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {outlookData.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-600 mb-3">Your Strengths</h4>
                      <ul className="space-y-2">
                        {outlookData.strengths?.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">Areas to Watch</h4>
                      <ul className="space-y-2">
                        {outlookData.challenges?.map((challenge, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">Action Items</h4>
                    <div className="space-y-4">
                      {outlookData.actionItems?.map((item, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">{item.title}</h5>
                          <p className="text-blue-800 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <p className="text-gray-500">No outlook personality data found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Available personalities: {profile.personalities.join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        const influencePersonality = profile.personalities.find(p => 
          p === 'Independent' || p === 'Social' || p === 'Elusive'
        );
        const influenceData = influencePersonality ? getPersonalityData('INFLUENCE', influencePersonality) : null;

        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Social Influence</h2>
              <p className="text-lg text-gray-600">
                How social factors and others' opinions influence your financial decisions
              </p>
            </div>

            {influenceData ? (
              <div className="space-y-6">
                <div className="card">
                  <h3 className={`text-2xl font-semibold mb-4 ${getPersonalityColor(influencePersonality)}`}>
                    {influencePersonality}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {influenceData.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-600 mb-3">Your Strengths</h4>
                      <ul className="space-y-2">
                        {influenceData.strengths?.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-orange-600 mb-3">Areas to Watch</h4>
                      <ul className="space-y-2">
                        {influenceData.challenges?.map((challenge, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">Action Items</h4>
                    <div className="space-y-4">
                      {influenceData.actionItems?.map((item, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">{item.title}</h5>
                          <p className="text-blue-800 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                <p className="text-gray-500">No influence personality data found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Available personalities: {profile.personalities.join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      case 6:
        const personalizedTools = toolsData.filter(tool => 
          tool.personalities.some(p => profile.personalities.includes(p)) || 
          tool.personalities.includes('all')
        );

        const personalizedCourses = coursesData.filter(course => 
          course.personalities.some(p => profile.personalities.includes(p))
        );

        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Resources</h2>
              <p className="text-lg text-gray-600">
                Tools and courses tailored to your money personality
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Wrench className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">Recommended Tools</h3>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  {personalizedTools.map((tool) => (
                    <div key={tool.id} className="card hover:shadow-md transition-shadow duration-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h4>
                      <p className="text-gray-600 mb-3">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">{tool.category}</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Try Tool →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">Recommended Courses</h3>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  {personalizedCourses.map((course) => (
                    <div key={course.id} className="card hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">{course.title}</h4>
                        {course.recommended && (
                          <span className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full ml-2">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">{course.category}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{course.duration}</span>
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Start Course →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Advisor Summary</h2>
              <p className="text-lg text-gray-600">
                A professional summary for financial advisors working with this client
              </p>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Profile Summary</h3>
                  <p className="text-gray-600">
                    Based on the comprehensive money personality assessment
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                {loadingSummary ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-bounce flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-600">Generating advisor summary...</span>
                  </div>
                ) : (
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {advisorSummary}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.personalities.map((personality, index) => (
                    <span 
                      key={personality}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPersonalityColor(personality)} bg-white`}
                    >
                      {personality}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Chapter not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <img 
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
              alt="iGrad Enrich" 
              className="h-8 w-auto"
            />
            <Link
              to="/"
              className="flex items-center space-x-2 text-primary-100 hover:text-white transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Assessment Results</h3>
              </div>
              <nav className="p-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setActiveChapter(index + 1)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg transition-colors duration-200 ${
                      activeChapter === index + 1
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {getChapterIcon(index + 1)}
                    <div>
                      <div className="font-medium">Chapter {index + 1}</div>
                      <div className="text-sm opacity-75">{chapter.title}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {renderChapterContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setActiveChapter(Math.max(1, activeChapter - 1))}
                disabled={activeChapter === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeChapter === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setActiveChapter(Math.min(7, activeChapter + 1))}
                disabled={activeChapter === 7}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeChapter === 7
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
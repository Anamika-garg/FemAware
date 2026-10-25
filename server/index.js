import { connectDB } from "./config/db.js";
import { TeenModule } from "./models/TeenModule.js";


await connectDB();
// Inside your seeding function:
console.log('Seeding teen learning modules...');
await TeenModule.deleteMany({});


const modulesToSeed = [
    {
      slug: 'basics',
      title: 'Cycle Basics',
      description: 'Learn the fundamentals of your menstrual cycle and body changes.',
      xpReward: 50,
      reviewStatus: 'approved',
      questions: [
        {
          index: 0,
          prompt: 'What is the average length of a standard menstrual cycle?',
          options: ['14 days', '28 days', '45 days'],
          correctIndex: 1,
          explanation: 'A typical cycle averages around 28 days, though anywhere from 21 to 35 days can be completely normal.'
        },
        {
          index: 1,
          prompt: 'Which hormone rises during the follicular phase?',
          options: ['Progesterone', 'Melatonin', 'Estrogen'],
          correctIndex: 2,
          explanation: 'Estrogen rises during the follicular phase to help thicken the uterine lining.'
        }
      ]
    },
    {
      slug: 'hormones-101',
      title: 'Hormones 101',
      description: 'Understand how hormones shift across different phases.',
      xpReward: 50,
      reviewStatus: 'approved',
      questions: [
        {
          index: 0,
          prompt: 'When does ovulation typically occur in a 28-day cycle?',
          options: ['Day 1', 'Day 14', 'Day 28'],
          correctIndex: 1,
          explanation: 'Ovulation generally occurs midway through the cycle, around day 14 in a 28-day cycle.'
        },
        {
          index: 1,
          prompt: 'Which hormone dominates after ovulation during the luteal phase?',
          options: ['Progesterone', 'Testosterone', 'Cortisol'],
          correctIndex: 0,
          explanation: 'Progesterone rises after ovulation to maintain the uterine lining.'
        }
      ]
    },
    {
      slug: 'period-cramps',
      title: 'Managing Cramps & PMS',
      description: 'Discover practical and safe ways to manage painful cramps and mood changes.',
      xpReward: 50,
      reviewStatus: 'approved',
      questions: [
        {
          index: 0,
          prompt: 'What causes period cramps (dysmenorrhea)?',
          options: ['Muscle tension in legs', 'Prostaglandins causing uterine contractions', 'Dehydration only'],
          correctIndex: 1,
          explanation: 'Prostaglandins trigger the muscles of the uterus to contract, causing cramps.'
        },
        {
          index: 1,
          prompt: 'Which home remedy helps relax uterine muscles?',
          options: ['Ice packs on the back', 'Applying gentle heat (heating pad)', 'Cold showers'],
          correctIndex: 1,
          explanation: 'Applying heat increases blood flow and relaxes the cramping uterine muscles.'
        }
      ]
    },
    {
      slug: 'hygiene-care',
      title: 'Menstrual Products & Hygiene',
      description: 'Learn about different menstrual care products and safe usage practices.',
      xpReward: 50,
      reviewStatus: 'approved',
      questions: [
        {
          index: 0,
          prompt: 'How often should a disposable pad typically be changed?',
          options: ['Every 12 hours', 'Every 4 to 8 hours', 'Once a day'],
          correctIndex: 1,
          explanation: 'Changing pads every 4 to 8 hours helps maintain hygiene and prevents bacterial buildup.'
        },
        {
          index: 1,
          prompt: 'What is a key safety rule when using tampons?',
          options: ['Change them every 4–8 hours to avoid Toxic Shock Syndrome (TSS)', 'Wear them overnight without alarms', 'Reuse disposable tampons'],
          correctIndex: 0,
          explanation: 'Changing tampons regularly reduces the risk of Toxic Shock Syndrome (TSS).'
        }
      ]
    },
    {
      slug: 'nutrition-movement',
      title: 'Nutrition & Cycle Support',
      description: 'Fuel your body with nutrients that support energy and mood across your cycle.',
      xpReward: 50,
      reviewStatus: 'approved',
      questions: [
        {
          index: 0,
          prompt: 'Why is iron important during your period?',
          options: ['It builds strong bones', 'It helps replace blood lost during menstruation', 'It speeds up your heart rate'],
          correctIndex: 1,
          explanation: 'Menstruation reduces body iron stores, making iron-rich foods essential during your period.'
        },
        {
          index: 1,
          prompt: 'What type of exercise can help ease mild cramping and boost mood?',
          options: ['Light walking or yoga', 'Extremely intense powerlifting', 'Complete bed rest without moving'],
          correctIndex: 0,
          explanation: 'Light movement releases endorphins, which act as natural pain relievers.'
        }
      ]
    }
  ];
  
await TeenModule.insertMany(modulesToSeed);
console.log(`✅ Inserted ${modulesToSeed.length} learning modules.`);
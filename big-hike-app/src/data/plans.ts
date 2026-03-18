export type Exercise = {
  name: string;
  prescription?: string;
};

export type Circuit = {
  title: string;
  rounds: string;
  exercises: Exercise[];
  note?: string;
};

export type StrengthWorkout = {
  id: string;
  title: string;
  focus: string;
  warmup: string;
  mainWork: string;
  finisherLabel: string;
  effortTarget: string;
  note?: string;
  circuits: Circuit[];
  finisher: Exercise[];
};

export type YogaDay = {
  day: string;
  theme: string;
  notes: string;
  poses: { file: string; label: string }[];
};

export const globalStrengthFormat = {
  warmup:
    'Brisk march → hip hinges → glute bridge → ankle rocks → band pull-aparts (about 45–60 sec each).',
  mainWork: 'Two circuits. Main work 20–22 min.',
  finisher: 'Carries + calves/tibialis (hike-specific durability), 2–3 min.',
  effortTarget:
    'Most sets should feel like you could do ~2–4 more reps if you had to (quality > suffering).',
};

export const strengthWorkouts: StrengthWorkout[] = [
  {
    id: 'A',
    title: 'Workout A',
    focus: 'climb strength + upper back',
    warmup: globalStrengthFormat.warmup,
    mainWork: globalStrengthFormat.mainWork,
    finisherLabel: globalStrengthFormat.finisher,
    effortTarget: globalStrengthFormat.effortTarget,
    circuits: [
      {
        title: 'Circuit 1',
        rounds: '3 rounds in later weeks; 2 rounds early',
        exercises: [
          { name: 'Step-ups (low-moderate step)', prescription: '8–10/side' },
          { name: '1-arm DB row', prescription: '10–12/side' },
          { name: 'DB floor press', prescription: '10–12' },
        ],
      },
      {
        title: 'Circuit 2',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Band lateral walks', prescription: '10–12 steps/way' },
          { name: 'DB Romanian deadlift', prescription: '8–12' },
          { name: 'Dead bug', prescription: '6–10/side' },
        ],
      },
    ],
    finisher: [{ name: 'Farmer carry', prescription: '2 × 30–45 sec' }],
  },
  {
    id: 'B',
    title: 'Workout B',
    focus: 'posterior chain + core anti-rotation',
    warmup: globalStrengthFormat.warmup,
    mainWork: globalStrengthFormat.mainWork,
    finisherLabel: globalStrengthFormat.finisher,
    effortTarget: globalStrengthFormat.effortTarget,
    circuits: [
      {
        title: 'Circuit 1',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'DB Romanian deadlift', prescription: '8–12' },
          { name: 'Half-kneeling DB press', prescription: '8–10/side' },
          { name: 'Band row', prescription: '12–20' },
        ],
      },
      {
        title: 'Circuit 2',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Hip thrust off sofa or weighted glute bridge', prescription: '10–12' },
          { name: 'Pallof press', prescription: '8–12/side' },
          { name: 'Tibialis raises', prescription: '12–20' },
        ],
      },
    ],
    finisher: [{ name: 'Suitcase carry', prescription: '2 × 30–40 sec/side' }],
  },
  {
    id: 'C',
    title: 'Workout C',
    focus: 'squat pattern + hiking calves',
    warmup: globalStrengthFormat.warmup,
    mainWork: globalStrengthFormat.mainWork,
    finisherLabel: globalStrengthFormat.finisher,
    effortTarget: globalStrengthFormat.effortTarget,
    circuits: [
      {
        title: 'Circuit 1',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Goblet box squat', prescription: '8–10' },
          { name: 'Band face pull or pull-apart', prescription: '12–20' },
          { name: 'Incline press-ups', prescription: '6–12' },
        ],
      },
      {
        title: 'Circuit 2',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Supported split squat (short range)', prescription: '6–10/side' },
          { name: 'Single-leg calf raise', prescription: '8–12/side' },
          { name: 'Side plank', prescription: '20–40 sec/side' },
        ],
      },
    ],
    finisher: [{ name: 'Wall sit', prescription: '2 × 20–45 sec (only as deep as comfortable)' }],
  },
  {
    id: 'D',
    title: 'Workout D',
    focus: 'downhill brakes + balance',
    warmup: globalStrengthFormat.warmup,
    mainWork: globalStrengthFormat.mainWork,
    finisherLabel: globalStrengthFormat.finisher,
    effortTarget: globalStrengthFormat.effortTarget,
    note:
      'This is your eccentric-dose day: keep it controlled, don’t chase failure. Unaccustomed eccentric work is a classic trigger for DOMS peaking 24–72h.',
    circuits: [
      {
        title: 'Circuit 1',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Step-downs (very low step, 3–4 sec lower)', prescription: '6–8/side' },
          { name: '1-arm DB row', prescription: '10–12/side' },
          { name: 'DB overhead press', prescription: '8–10' },
        ],
      },
      {
        title: 'Circuit 2',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Supported single-leg RDL', prescription: '6–10/side' },
          { name: 'Band lateral walks', prescription: '10–12 steps/way' },
          { name: 'Bird-dog', prescription: '6–10/side' },
        ],
      },
    ],
    finisher: [{ name: 'Calves', prescription: '1–2 × 15–20 (bodyweight or light DB)' }],
  },
  {
    id: 'E',
    title: 'Workout E',
    focus: 'full-body stamina, knee-kind',
    warmup: globalStrengthFormat.warmup,
    mainWork: globalStrengthFormat.mainWork,
    finisherLabel: globalStrengthFormat.finisher,
    effortTarget: globalStrengthFormat.effortTarget,
    circuits: [
      {
        title: 'Circuit 1',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Sit-to-stand holding DB at chest', prescription: '8–12' },
          { name: 'Band row', prescription: '12–20' },
          { name: 'DB floor press', prescription: '10–14' },
        ],
      },
      {
        title: 'Circuit 2',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Glute bridge march', prescription: '8–10/side' },
          { name: 'Pallof press', prescription: '8–12/side' },
          { name: 'Tibialis raises', prescription: '12–20' },
        ],
      },
    ],
    finisher: [{ name: 'Carries', prescription: '3 × 30 sec on / 30 sec off' }],
  },
  {
    id: 'F',
    title: 'Workout F',
    focus: 'hike-specific muscular endurance',
    warmup: globalStrengthFormat.warmup,
    mainWork: globalStrengthFormat.mainWork,
    finisherLabel: globalStrengthFormat.finisher,
    effortTarget: globalStrengthFormat.effortTarget,
    circuits: [
      {
        title: 'Circuit 1',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Step-ups (lighter, smoother)', prescription: '10–14/side' },
          { name: 'DB hinge (RDL)', prescription: '10–14' },
          { name: 'Band face pull', prescription: '12–20' },
        ],
      },
      {
        title: 'Circuit 2',
        rounds: 'As prescribed within session time',
        exercises: [
          { name: 'Hamstring band curls', prescription: '12–20' },
          { name: 'Calf raises', prescription: '12–20' },
          { name: 'Front plank', prescription: '20–45 sec' },
        ],
      },
    ],
    finisher: [{ name: 'Easy walk around the house', prescription: '2 minutes to downshift' }],
  },
];

export const yogaDays: YogaDay[] = [
  {
    day: 'Monday',
    theme: 'restorative only',
    notes: 'Legs-up-the-wall, supported hamstring stretch, supported twist, long exhales.',
    poses: [
      { file: 'supine-leg-stretch.png', label: 'Supported hamstring stretch' },
      { file: 'Supine_twist.png', label: 'Supported twist' },
      { file: 'Corpse.png', label: 'Corpse' },
      { file: 'Child’s_pose.png', label: 'Child’s pose' },
      { file: 'Easy_pose.png', label: 'Easy pose' },
      { file: 'happy_Baby.png', label: 'Happy Baby' },
      { file: 'bound_angle.png', label: 'Bound angle' },
      { file: 'Seated_forward_fold.png', label: 'Seated forward fold' },
      { file: 'Supine_pelvic_tilt_.png', label: 'Supine pelvic tilt' },
      { file: 'Puppy_pose.png', label: 'Puppy pose' },
    ],
  },
  {
    day: 'Tuesday',
    theme: 'ankles/calves',
    notes: 'Downward dog pedals, calf stretch, kneeling ankle rocks, squat-to-box holds.',
    poses: [
      { file: 'Downward_dog.png', label: 'Downward dog' },
      { file: 'Three_legged_dog.png', label: 'Three legged dog' },
      { file: 'table-top.png', label: 'Table top' },
      { file: 'Squat.png', label: 'Squat hold' },
      { file: 'Chair.png', label: 'Chair' },
      { file: 'half-way-fold.png', label: 'Half-way fold' },
      { file: 'forward-fold.png', label: 'Forward fold' },
      { file: 'Mountain_climbers.png', label: 'Mountain climbers' },
      { file: 'Low_lunge.png', label: 'Low lunge' },
      { file: 'Bridge.png', label: 'Bridge' },
    ],
  },
  {
    day: 'Wednesday',
    theme: 'hips',
    notes: 'Low lunge, half-pigeon (or figure-4), glute stretch, gentle quad stretch.',
    poses: [
      { file: 'Low_lunge.png', label: 'Low lunge' },
      { file: 'Half_pigeon.png', label: 'Half pigeon' },
      { file: 'happy_Baby.png', label: 'Happy Baby' },
      { file: 'bound_angle.png', label: 'Bound angle' },
      { file: 'Seated_twist.png', label: 'Seated twist' },
      { file: 'lizard.png', label: 'Lizard' },
      { file: 'Crescent_lunge.png', label: 'Crescent lunge' },
      { file: 'Side_lunge.png', label: 'Side lunge' },
      { file: 'Puppy_pose.png', label: 'Puppy pose' },
      { file: 'Child’s_pose.png', label: 'Child’s pose' },
    ],
  },
  {
    day: 'Thursday',
    theme: 'hamstrings + adductors',
    notes: 'Half split, wide-leg fold (bent knees allowed), strap hamstring stretch.',
    poses: [
      { file: 'supine-leg-stretch.png', label: 'Strap hamstring stretch' },
      { file: 'wide-legged-forward-fold.png', label: 'Wide-legged forward fold' },
      { file: 'half-way-fold.png', label: 'Half-way fold' },
      { file: 'forward-fold.png', label: 'Forward fold' },
      { file: 'Gate_pose.png', label: 'Gate pose' },
      { file: 'triangle.png', label: 'Triangle' },
      { file: 'Extended_side_angle.png', label: 'Extended side angle' },
      { file: 'Seated_forward_fold.png', label: 'Seated forward fold' },
      { file: 'Staff_pose.png', label: 'Staff pose' },
      { file: 'bound_angle.png', label: 'Bound angle' },
    ],
  },
  {
    day: 'Friday',
    theme: 'T-spine + posture',
    notes: 'Thread-the-needle, sphinx/cobra (gentle), chest opener, side bends.',
    poses: [
      { file: 'Cat_Cow.png', label: 'Cat Cow' },
      { file: 'Cow_.png', label: 'Cow' },
      { file: 'Cat.png', label: 'Cat' },
      { file: 'Sphinx.png', label: 'Sphinx' },
      { file: 'Cobra.png', label: 'Cobra' },
      { file: 'Standing_side_bend.png', label: 'Standing side bend' },
      { file: 'Seated_Side_Fold.png', label: 'Seated side fold' },
      { file: 'Camel.png', label: 'Camel' },
      { file: 'Cow_face.png', label: 'Cow face' },
      { file: 'Locust.png', label: 'Locust' },
    ],
  },
  {
    day: 'Saturday',
    theme: 'hike flow',
    notes: 'Sun-salutation-ish flow at easy pace, add chair pose (mini range), warrior 1/2 holds.',
    poses: [
      { file: 'mountain.png', label: 'Mountain' },
      { file: 'half-way-fold.png', label: 'Half-way fold' },
      { file: 'forward-fold.png', label: 'Forward fold' },
      { file: 'Plank.png', label: 'Plank' },
      { file: 'Downward_dog.png', label: 'Downward dog' },
      { file: 'Runners_lunge.png', label: 'Runner’s lunge' },
      { file: 'Warrior_I.png', label: 'Warrior I' },
      { file: 'Extended_side_angle.png', label: 'Extended side angle' },
      { file: 'Reverse_warrior.png', label: 'Reverse warrior' },
      { file: 'Chair.png', label: 'Chair' },
    ],
  },
  {
    day: 'Sunday',
    theme: 'recovery',
    notes: 'Gentle full body + longer holds, no ego stretches.',
    poses: [
      { file: 'Easy_pose.png', label: 'Easy pose' },
      { file: 'Child’s_pose.png', label: 'Child’s pose' },
      { file: 'Cat_Cow.png', label: 'Cat Cow' },
      { file: 'Downward_dog.png', label: 'Downward dog' },
      { file: 'Low_lunge.png', label: 'Low lunge' },
      { file: 'triangle.png', label: 'Triangle' },
      { file: 'bound_angle.png', label: 'Bound angle' },
      { file: 'Supine_twist.png', label: 'Supine twist' },
      { file: 'happy_Baby.png', label: 'Happy Baby' },
      { file: 'Corpse.png', label: 'Corpse' },
    ],
  },
];

export type CalendarEntry = {
  key: string;
  week: number;
  day: string;
  kind: 'strength' | 'run' | 'yoga' | 'recovery';
  title: string;
  strengthId?: string;
  yogaDay?: string;
  note?: string;
};

const weeks1to12Pattern: Array<{ sunday: string; wednesday: string; friday: string }> = [
  { wednesday: 'A', friday: 'B', sunday: 'C' },
  { wednesday: 'D', friday: 'E', sunday: 'F' },
];

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const buildCalendar = (): CalendarEntry[] => {
  const entries: CalendarEntry[] = [];

  for (let week = 1; week <= 12; week += 1) {
    const pattern = weeks1to12Pattern[(week - 1) % 2];

    dayOrder.forEach((day) => {
      const base: CalendarEntry = {
        key: `week-${week}-${day.toLowerCase()}`,
        week,
        day,
        kind: 'yoga',
        title: `${day} yoga`,
        yogaDay: day,
      };

      if (day === 'Tuesday' || day === 'Thursday' || day === 'Saturday') {
        entries.push({
          ...base,
          kind: 'run',
          title: 'Run day',
          note: 'Third-party app day. Tick complete in this app only.',
        });
      }

      if (day === 'Sunday') {
        entries.push({
          ...base,
          kind: 'strength',
          title: `Workout ${pattern.sunday}`,
          strengthId: pattern.sunday,
        });
      }

      if (day === 'Wednesday') {
        entries.push({
          ...base,
          kind: 'strength',
          title: `Workout ${pattern.wednesday}`,
          strengthId: pattern.wednesday,
        });
      }

      if (day === 'Friday') {
        entries.push({
          ...base,
          kind: 'strength',
          title: `Workout ${pattern.friday}`,
          strengthId: pattern.friday,
        });
      }

      entries.push(base);
    });
  }

  const week13Entries: CalendarEntry[] = [
    {
      key: 'week-13-note',
      week: 13,
      day: 'Week 13',
      kind: 'recovery',
      title: 'Week 13 note',
      note: 'Week 13 is kept unscheduled on purpose: complete one round of each strength workout A–F during this week, with yoga daily and run days tracked separately.',
    },
    ...['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({
      key: `week-13-strength-${id}`,
      week: 13,
      day: `Workout ${id}`,
      kind: 'strength' as const,
      title: `Workout ${id} — one round only`,
      strengthId: id,
    })),
    ...dayOrder.map((day) => ({
      key: `week-13-yoga-${day.toLowerCase()}`,
      week: 13,
      day,
      kind: (day === 'Tuesday' || day === 'Thursday' || day === 'Saturday' ? 'run' : 'yoga') as
        | 'run'
        | 'yoga',
      title: day === 'Tuesday' || day === 'Thursday' || day === 'Saturday' ? 'Run day' : `${day} yoga`,
      yogaDay: day,
      note:
        day === 'Tuesday' || day === 'Thursday' || day === 'Saturday'
          ? 'Third-party app day. Tick complete in this app only.'
          : undefined,
    })),
  ];

  return [...entries, ...week13Entries];
};

export const poseFilenameList = [
  'Half_pigeon.png',
  'Gate_pose.png',
  'dancer.png',
  'Extended_side_angle.png',
  'Easy_pose.png',
  'Crescent_lunge.png',
  'Cow_face.png',
  'Cow_.png',
  'Corpse.png',
  'Cobra.png',
  'Child’s_pose.png',
  'Chair.png',
  'Cat.png',
  'Camel.png',
  'Bridge.png',
  'bound_angle.png',
  'Bird_dog.png',
  'Plank.png',
  'half-way-fold.png',
  'forward-fold.png',
  'mountain.png',
  'Downward_dog.png',
  'happy_Baby.png',
  'Warrior_Iii.png',
  'Wild_Thing.png',
  'Seated_Side_Fold.png',
  'Cat_Cow.png',
  '_Bear_hover.png',
  'Mountain_climbers.png',
  'supine-leg-stretch.png',
  'lizard.png',
  'side-plank.png',
  'Warrior_I.png',
  'table-top.png',
  'triangle.png',
  'wide-legged-forward-fold.png',
  'Wide_leg_squat_.png',
  'Tree.png',
  'Three_legged_dog.png',
  'Supine_twist.png',
  'Supine_pelvic_tilt_.png',
  'Standing_side_bend.png',
  'Staff_pose.png',
  'Squat.png',
  'Sphinx.png',
  'Side_lunge.png',
  'Seated_twist.png',
  'Seated_forward_fold.png',
  'Seated_eagle_arms.png',
  'Runners_lunge.png',
  'Reverse_warrior.png',
  'Low_lunge.png',
  'Locust.png',
  'Puppy_pose.png',
];
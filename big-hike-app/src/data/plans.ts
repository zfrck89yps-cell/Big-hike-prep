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
      { file: 'supine_leg_stretch.png', label: 'Supported hamstring stretch' },
      { file: 'supine_twist.png', label: 'Supported twist' },
      { file: 'corpse.png', label: 'Corpse' },
      { file: 'childs_pose.png', label: 'Child’s pose' },
      { file: 'easy_pose.png', label: 'Easy pose' },
      { file: 'happy_baby.png', label: 'Happy Baby' },
      { file: 'bound_angle.png', label: 'Bound angle' },
      { file: 'seated_forward_fold.png', label: 'Seated forward fold' },
      { file: 'supine_pelvic_tilt.png', label: 'Supine pelvic tilt' },
      { file: 'puppy_pose.png', label: 'Puppy pose' },
    ],
  },
  {
    day: 'Tuesday',
    theme: 'ankles/calves',
    notes: 'Downward dog pedals, calf stretch, kneeling ankle rocks, squat-to-box holds.',
    poses: [
      { file: 'downward_dog.png', label: 'Downward dog' },
      { file: 'three_legged_dog.png', label: 'Three legged dog' },
      { file: 'table_top.png', label: 'Table top' },
      { file: 'squat.png', label: 'Squat hold' },
      { file: 'chair.png', label: 'Chair' },
      { file: 'half_way_fold.png', label: 'Half-way fold' },
      { file: 'forward_fold.png', label: 'Forward fold' },
      { file: 'mountain_climbers.png', label: 'Mountain climbers' },
      { file: 'low_lunge.png', label: 'Low lunge' },
      { file: 'bridge.png', label: 'Bridge' },
    ],
  },
  {
    day: 'Wednesday',
    theme: 'hips',
    notes: 'Low lunge, half-pigeon (or figure-4), glute stretch, gentle quad stretch.',
    poses: [
      { file: 'low_lunge.png', label: 'Low lunge' },
      { file: 'half_pigeon.png', label: 'Half pigeon' },
      { file: 'happy_baby.png', label: 'Happy Baby' },
      { file: 'bound_angle.png', label: 'Bound angle' },
      { file: 'seated_twist.png', label: 'Seated twist' },
      { file: 'lizard.png', label: 'Lizard' },
      { file: 'crescent_lunge.png', label: 'Crescent lunge' },
      { file: 'side_lunge.png', label: 'Side lunge' },
      { file: 'puppy_pose.png', label: 'Puppy pose' },
      { file: 'childs_pose.png', label: 'Child’s pose' },
    ],
  },
  {
    day: 'Thursday',
    theme: 'hamstrings + adductors',
    notes: 'Half split, wide-leg fold (bent knees allowed), strap hamstring stretch.',
    poses: [
      { file: 'supine_leg_stretch.png', label: 'Strap hamstring stretch' },
      { file: 'wide_legged_forward_fold.png', label: 'Wide-legged forward fold' },
      { file: 'half_way_fold.png', label: 'Half-way fold' },
      { file: 'forward_fold.png', label: 'Forward fold' },
      { file: 'gate_pose.png', label: 'Gate pose' },
      { file: 'triangle.png', label: 'Triangle' },
      { file: 'extended_side_angle.png', label: 'Extended side angle' },
      { file: 'seated_forward_fold.png', label: 'Seated forward fold' },
      { file: 'staff_pose.png', label: 'Staff pose' },
      { file: 'bound_angle.png', label: 'Bound angle' },
    ],
  },
  {
    day: 'Friday',
    theme: 'T-spine + posture',
    notes: 'Thread-the-needle, sphinx/cobra (gentle), chest opener, side bends.',
    poses: [
      { file: 'cat_cow.png', label: 'Cat Cow' },
      { file: 'cow.png', label: 'Cow' },
      { file: 'cat.png', label: 'Cat' },
      { file: 'sphinx.png', label: 'Sphinx' },
      { file: 'cobra.png', label: 'Cobra' },
      { file: 'standing_side_bend.png', label: 'Standing side bend' },
      { file: 'seated_side_fold.png', label: 'Seated side fold' },
      { file: 'camel.png', label: 'Camel' },
      { file: 'cow_face.png', label: 'Cow face' },
      { file: 'locust.png', label: 'Locust' },
    ],
  },
  {
    day: 'Saturday',
    theme: 'hike flow',
    notes: 'Sun-salutation-ish flow at easy pace, add chair pose (mini range), warrior 1/2 holds.',
    poses: [
      { file: 'mountain.png', label: 'Mountain' },
      { file: 'half_way_fold.png', label: 'Half-way fold' },
      { file: 'forward_fold.png', label: 'Forward fold' },
      { file: 'plank.png', label: 'Plank' },
      { file: 'downward_dog.png', label: 'Downward dog' },
      { file: 'runners_lunge.png', label: 'Runner’s lunge' },
      { file: 'warrior_i.png', label: 'Warrior I' },
      { file: 'extended_side_angle.png', label: 'Extended side angle' },
      { file: 'reverse_warrior.png', label: 'Reverse warrior' },
      { file: 'chair.png', label: 'Chair' },
    ],
  },
  {
    day: 'Sunday',
    theme: 'recovery',
    notes: 'Gentle full body + longer holds, no ego stretches.',
    poses: [
      { file: 'easy_pose.png', label: 'Easy pose' },
      { file: 'childs_pose.png', label: 'Child’s pose' },
      { file: 'cat_cow.png', label: 'Cat Cow' },
      { file: 'downward_dog.png', label: 'Downward dog' },
      { file: 'low_lunge.png', label: 'Low lunge' },
      { file: 'triangle.png', label: 'Triangle' },
      { file: 'bound_angle.png', label: 'Bound angle' },
      { file: 'supine_twist.png', label: 'Supine twist' },
      { file: 'happy_baby.png', label: 'Happy Baby' },
      { file: 'corpse.png', label: 'Corpse' },
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
  'bear_hover.png',
  'bird_dog.png',
  'bound_angle.png',
  'bridge.png',
  'camel.png',
  'cat.png',
  'cat_cow.png',
  'chair.png',
  'childs_pose.png',
  'cobra.png',
  'corpse.png',
  'cow.png',
  'cow_face.png',
  'crescent_lunge.png',
  'dancer.png',
  'downward_dog.png',
  'easy_pose.png',
  'extended_side_angle.png',
  'forward_fold.png',
  'gate_pose.png',
  'half_pigeon.png',
  'half_way_fold.png',
  'happy_baby.png',
  'lizard.png',
  'locust.png',
  'low_lunge.png',
  'mountain.png',
  'mountain_climbers.png',
  'plank.png',
  'puppy_pose.png',
  'reverse_warrior.png',
  'runners_lunge.png',
  'seated_eagle_arms.png',
  'seated_forward_fold.png',
  'seated_side_fold.png',
  'seated_twist.png',
  'side_lunge.png',
  'side_plank.png',
  'sphinx.png',
  'squat.png',
  'staff_pose.png',
  'standing_side_bend.png',
  'supine_leg_stretch.png',
  'supine_pelvic_tilt.png',
  'supine_twist.png',
  'table_top.png',
  'three_legged_dog.png',
  'tree.png',
  'triangle.png',
  'warrior_i.png',
  'warrior_ii.png',
  'warrior_iii.png',
  'wide_leg_squat.png',
  'wide_legged_forward_fold.png',
  'wild_thing.png',
];
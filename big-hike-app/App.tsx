import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  buildCalendar,
  poseFilenameList,
  strengthWorkouts,
  yogaDays,
  type CalendarEntry,
} from './src/data/plans';
import poseImageMap from './src/data/poseImageMap';
import { loadJson, saveJson, STORAGE_KEYS } from './src/utils/storage';

type Screen =
  | { name: 'home' }
  | { name: 'today' }
  | { name: 'week'; week: number }
  | { name: 'strength'; id: string; week?: number }
  | { name: 'yoga'; day: string; week?: number };

type LoggedSet = {
  weight?: string;
  reps?: string;
};

type LoggedExercise = {
  rounds?: LoggedSet[];
  weight?: string;
  reps?: string;
};

type WorkoutLog = {
  completed?: boolean;
  notes?: string;
  nextTimeNotes?: string;
  exercises?: Record<string, LoggedExercise>;
};

type RunLog = { completed?: boolean; notes?: string };

type AllLogs = Record<string, WorkoutLog | RunLog>;

type TrainingSettings = {
  strengthDays: string[];
  runDays: string[];
};

const ACTIVE_PROFILE_ID = 'default';
const SETTINGS_STORAGE_KEY = 'big-hike:settings';
const DEFAULT_SETTINGS: TrainingSettings = {
  strengthDays: ['Sunday', 'Wednesday', 'Friday'],
  runDays: ['Tuesday', 'Thursday', 'Saturday'],
};

const calendar = buildCalendar();
const weekNumbers = Array.from({ length: 13 }, (_, i) => i + 1);
const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const kindOrder = ['strength', 'yoga', 'run', 'recovery'] as const;

const backgroundImage = require('./assets/icons/background.png');
const sessionBackgroundImage = require('./assets/icons/background-session.png');

function keyFor(profileId: string, itemKey: string) {
  return `${profileId}::${itemKey}`;
}

function dayIndex(day: string) {
  return dayOrder.indexOf(day as (typeof dayOrder)[number]);
}

function sortDays(days: string[]) {
  return [...days].sort((a, b) => dayIndex(a) - dayIndex(b));
}

function sortEntries(a: CalendarEntry, b: CalendarEntry) {
  const byDay = dayIndex(a.day) - dayIndex(b.day);
  if (byDay !== 0) return byDay;
  return kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind);
}

function getTargetHikeDate() {
  const now = new Date();
  const year = now.getFullYear();
  const thisYear = new Date(year, 5, 14);
  if (now <= thisYear) return thisYear;
  return new Date(year + 1, 5, 14);
}

function getPlanStartDate(targetDate: Date) {
  const start = new Date(targetDate);
  start.setDate(start.getDate() - 91);
  return start;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysUntil(target: Date) {
  const today = startOfDay(new Date());
  const diffMs = startOfDay(target).getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

function getDayName(date: Date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCurrentWeekNumber(targetDate: Date) {
  const today = startOfDay(new Date());
  const start = startOfDay(getPlanStartDate(targetDate));
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const rawWeek = Math.floor(diffDays / 7) + 1;
  return clamp(rawWeek, 1, 13);
}

function withLength<T>(items: T[], length: number, filler: () => T): T[] {
  const next = [...items];
  while (next.length < length) next.push(filler());
  return next.slice(0, length);
}

function getLoggedRounds(entry?: LoggedExercise): LoggedSet[] {
  if (!entry) return Array.from({ length: 4 }, () => ({}));
  if (Array.isArray(entry.rounds)) {
    return withLength(entry.rounds, 4, () => ({}));
  }
  if (entry.weight || entry.reps) {
    return withLength([{ weight: entry.weight, reps: entry.reps }], 4, () => ({}));
  }
  return Array.from({ length: 4 }, () => ({}));
}

function getOrderedWeeks(currentWeek: number) {
  const currentAndForward = weekNumbers.filter((week) => week >= currentWeek);
  const older = weekNumbers.filter((week) => week < currentWeek);
  return [...currentAndForward, ...older];
}

function isBothSidesPose(label: string) {
  const text = label.toLowerCase();
  return ['side', 'twist', 'lunge', 'warrior', 'triangle', 'pigeon', 'runner', 'split', 'cow_face', 'lizard', 'dancer', 'supine_leg_stretch', 'three_legged_dog', 'tree', 'wild_thing'].some((term) =>
    text.includes(term)
  );
}

function buildVisibleWeekEntries(week: number, settings: TrainingSettings): CalendarEntry[] {
  const weekEntries = calendar.filter((item) => item.week === week);
  const yogaEntries = weekEntries
    .filter((item) => item.kind === 'yoga')
    .map((item) => ({ ...item }));

  const strengthTemplates = weekEntries.filter((item) => item.kind === 'strength');
  const runTemplates = weekEntries.filter((item) => item.kind === 'run');

  const strengthDays = sortDays(settings.strengthDays).slice(0, 3);
  const runDays = sortDays(settings.runDays).slice(0, 3);

  if (week === 13) {
    const walkEntries: CalendarEntry[] = runDays.map((day) => ({
      week,
      day,
      kind: 'run',
      title: '5k walk',
      key: `week-13-walk-${day.toLowerCase()}`,
      note: undefined,
    }));

    return [...yogaEntries, ...walkEntries].sort(sortEntries);
  }

  const strengthEntries: CalendarEntry[] = strengthDays
    .map((day, index) => {
      const template = strengthTemplates[index];
      if (!template) return null;
      return {
        ...template,
        day,
        key: `week-${week}-strength-${template.strengthId ?? index}-${day.toLowerCase()}`,
      };
    })
    .filter(Boolean) as CalendarEntry[];

  const runEntries: CalendarEntry[] = runDays.map((day, index) => {
    const template = runTemplates[index];
    return {
      ...(template ?? {
        week,
        day,
        kind: 'run' as const,
        title: 'Run / walk',
        key: `week-${week}-run-${day.toLowerCase()}`,
      }),
      week,
      day,
      kind: 'run',
      title: template?.title ?? 'Run / walk',
      key: `week-${week}-run-${day.toLowerCase()}`,
      note: undefined,
    };
  });

  return [...yogaEntries, ...strengthEntries, ...runEntries].sort(sortEntries);
}

function getTodayEntries(currentWeek: number, todayName: string, settings: TrainingSettings) {
  return buildVisibleWeekEntries(currentWeek, settings).filter((item) => item.day === todayName);
}

function getWorkoutLetter(title: string) {
  const match = title.match(/Workout\s+([A-F])/i);
  return match ? match[1].toUpperCase() : '';
}

function getPreviousStrengthKey(
  currentWorkoutId: string,
  currentWeek: number | undefined,
  settings: TrainingSettings
) {
  if (!currentWeek) return null;

  const currentEntries = buildVisibleWeekEntries(currentWeek, settings);
  const currentEntry = currentEntries.find(
    (item) => item.kind === 'strength' && item.strengthId === currentWorkoutId
  );

  if (!currentEntry) return null;

  const currentLetter = getWorkoutLetter(currentEntry.title);
  if (!currentLetter) return null;

  const allStrengthEntries: Array<{ key: string; title: string; week: number }> = [];

  for (let week = 1; week <= 13; week++) {
    const entries = buildVisibleWeekEntries(week, settings)
      .filter((item) => item.kind === 'strength')
      .map((item) => ({
        key: item.key,
        title: item.title,
        week,
      }));

    allStrengthEntries.push(...entries);
  }

  const ordered = allStrengthEntries.sort((a, b) => {
    if (a.week !== b.week) return a.week - b.week;
    return getWorkoutLetter(a.title).localeCompare(getWorkoutLetter(b.title));
  });

  const currentIndex = ordered.findIndex(
    (item) => item.key === currentEntry.key && getWorkoutLetter(item.title) === currentLetter
  );

  if (currentIndex <= 0) return null;

  return ordered[currentIndex - 1]?.key ?? null;
}

function getPreviousExerciseWeight(
  logs: AllLogs,
  previousKey: string | null,
  exerciseName: string
) {
  if (!previousKey) return '';

  const previousLog = logs[keyFor(ACTIVE_PROFILE_ID, previousKey)] as WorkoutLog | undefined;
  const exercise = previousLog?.exercises?.[exerciseName];
  const rounds = exercise?.rounds ?? [];

  for (let i = rounds.length - 1; i >= 0; i--) {
    if (rounds[i]?.weight) return rounds[i].weight ?? '';
  }

  if (exercise?.weight) return exercise.weight;
  return '';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [logs, setLogs] = useState<AllLogs>({});
  const [settings, setSettings] = useState<TrainingSettings>(DEFAULT_SETTINGS);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const { width, height } = useWindowDimensions();
  const yogaContentMaxWidth = width > 1000 ? width - 32 : 820;
  const yogaColumns = width > 1000 ? 4 : width > 800 ? 3 : width > 600 ? 2 : 1;
  const yogaTileWidth = Math.floor((yogaContentMaxWidth - (yogaColumns - 1) * 10) / yogaColumns);
  const yogaTileMinHeight = Math.max(170, Math.floor(height * 0.2));

  const hikeDate = useMemo(() => getTargetHikeDate(), []);
  const currentWeek = useMemo(() => getCurrentWeekNumber(hikeDate), [hikeDate]);
  const todayName = useMemo(() => getDayName(new Date()), []);
  const daysUntilHike = useMemo(() => getDaysUntil(hikeDate), [hikeDate]);
  const orderedWeeks = useMemo(() => getOrderedWeeks(currentWeek), [currentWeek]);
  const todayEntries = useMemo(
    () => getTodayEntries(currentWeek, todayName, settings),
    [currentWeek, todayName, settings]
  );

  useEffect(() => {
    (async () => {
      const storedLogs = await loadJson<AllLogs>(STORAGE_KEYS.LOGS, {});
      const storedSettings = await loadJson<TrainingSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
      setLogs(storedLogs);
      setSettings({
        strengthDays: sortDays(storedSettings.strengthDays ?? DEFAULT_SETTINGS.strengthDays).slice(0, 3),
        runDays: sortDays(storedSettings.runDays ?? DEFAULT_SETTINGS.runDays).slice(0, 3),
      });
    })();
  }, []);

  const persistLogs = async (next: AllLogs) => {
    setLogs(next);
    await saveJson(STORAGE_KEYS.LOGS, next);
  };

  const persistSettings = async (next: TrainingSettings) => {
    setSettings(next);
    await saveJson(SETTINGS_STORAGE_KEY, next);
  };

  const upsertLog = async (itemKey: string, value: WorkoutLog | RunLog) => {
    const composite = keyFor(ACTIVE_PROFILE_ID, itemKey);
    const next = {
      ...logs,
      [composite]: { ...(logs[composite] ?? {}), ...value },
    };
    await persistLogs(next);
  };

  const getLog = (itemKey: string): WorkoutLog | RunLog => logs[keyFor(ACTIVE_PROFILE_ID, itemKey)] ?? {};

  const toggleDaySetting = async (type: 'strengthDays' | 'runDays', day: string) => {
    const current = settings[type];
    const exists = current.includes(day);

    let nextList: string[];

    if (exists) {
      nextList = current.filter((item) => item !== day);
    } else {
      if (current.length >= 3) {
        Alert.alert('Max 3 days', `You can only select up to 3 ${type === 'strengthDays' ? 'weights' : 'run / walk'} days.`);
        return;
      }
      nextList = [...current, day];
    }

    const nextSettings = {
      ...settings,
      [type]: sortDays(nextList),
    };

    await persistSettings(nextSettings);
  };

  const renderHome = () => (
    <View style={styles.pageShell}>
      <Pressable style={styles.settingsButton} onPress={() => setSettingsModalVisible(true)}>
        <Text style={styles.iconButtonText}>⚙</Text>
      </Pressable>
      <View style={styles.homeHeroSpacer} />
      <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
        <View style={styles.countdownWrap}>
          <Text style={styles.countdownLabel}>BIG HIKE COUNTDOWN</Text>
          <Text style={styles.countdownNumber}>{daysUntilHike}</Text>
          <Text style={styles.countdownUnit}>days to go</Text>
          <Text style={styles.countdownDate}>14 June {hikeDate.getFullYear()}</Text>
        </View>

        <Pressable style={styles.todayCard} onPress={() => setScreen({ name: 'today' })}>
          <View style={styles.todayCardTop}>
            <Text style={[styles.subtleLabel, styles.todaySessionsLabel]}>TODAY’S SESSIONS</Text>
            <Text style={styles.metaText}>Week {currentWeek}</Text>
          </View>
          <Text style={styles.todayCardDay}>{todayName}</Text>
          <Text style={styles.todayCardBody}>Open today’s page to view the required sessions.</Text>
        </Pressable>

        <Text style={[styles.sectionHeading, styles.sectionHeadingHidden]}>Weeks</Text>

        {orderedWeeks.map((week) => {
          const entries = buildVisibleWeekEntries(week, settings);
          const completed = entries.filter((item) => Boolean((getLog(item.key) as WorkoutLog | RunLog).completed)).length;
          const total = entries.length;
          const isCurrent = week === currentWeek;

          return (
            <Pressable key={week} style={styles.weekCard} onPress={() => setScreen({ name: 'week', week })}>
              <View style={styles.weekCardTop}>
                <View>
                  <Text style={styles.subtleLabel}>
                    {isCurrent ? 'CURRENT WEEK' : week < currentWeek ? 'OLDER WEEK' : 'UPCOMING WEEK'}
                  </Text>
                  <Text style={styles.weekCardTitle}>Week {week}</Text>
                </View>
                <CompletionPill completed={completed === total && total > 0} label={`${completed}/${total}`} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderToday = () => (
    <View style={styles.pageShell}>
      <View style={styles.innerHeroSpacer} />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <Header
          title="Today’s Sessions"
          subtitle={`Week ${currentWeek} • ${todayName}`}
          onBack={() => setScreen({ name: 'home' })}
        />

        {todayEntries.length === 0 ? (
          <View style={styles.entryCard}>
            <Text style={styles.entryTitle}>No sessions set for today</Text>
            <Text style={styles.entryBody}>Use the settings button on the home screen to change weights and run / walk days.</Text>
          </View>
        ) : null}

        {todayEntries.map((item) => {
          const log = getLog(item.key);
          const complete = Boolean(log.completed);

          return (
            <View key={item.key} style={[styles.entryCard, complete && styles.entryComplete]}>
              <View style={styles.entryTopRow}>
                <View>
                  <Text style={styles.entryDay}>{item.day}</Text>
                  <Text style={styles.entryTitle}>{item.kind === 'run' && currentWeek === 13 ? '5k walk' : item.title}</Text>
                </View>
                <CompletionPill completed={complete} />
              </View>

              {item.kind === 'yoga' && item.yogaDay ? (
                <Pressable style={styles.primaryButton} onPress={() => setScreen({ name: 'yoga', day: item.yogaDay!, week: currentWeek })}>
                  <Text style={styles.primaryButtonText}>Open yoga</Text>
                </Pressable>
              ) : null}

              {item.kind === 'strength' && item.strengthId ? (
                <Pressable style={styles.primaryButton} onPress={() => setScreen({ name: 'strength', id: item.strengthId!, week: currentWeek })}>
                  <Text style={styles.primaryButtonText}>Open workout</Text>
                </Pressable>
              ) : null}

              {item.kind === 'run' ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => upsertLog(item.key, { completed: !complete } as RunLog)}
                >
                  <Text style={styles.primaryButtonText}>
                    {complete
                      ? 'Mark incomplete'
                      : currentWeek === 13
                      ? 'Mark 5k walk complete'
                      : 'Mark run / walk complete'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderWeek = (week: number) => {
    const entries = buildVisibleWeekEntries(week, settings);

    return (
      <View style={styles.pageShell}>
        <View style={styles.innerHeroSpacer} />
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
          <Header
            title={`Week ${week}`}
            subtitle={week === 13 ? 'Yoga daily • 5k walks on selected run days' : 'Yoga daily • weights and run days from settings'}
            onBack={() => setScreen({ name: 'home' })}
          />

          {entries.map((item) => {
            const log = getLog(item.key);
            const complete = Boolean(log.completed);

            return (
              <View key={item.key} style={[styles.entryCard, complete && styles.entryComplete]}>
                <View style={styles.entryTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryDay}>{item.day}</Text>
                    <Text style={styles.entryTitle}>
                      {item.kind === 'run' && week === 13 ? '5k walk' : item.title}
                    </Text>
                  </View>
                  <CompletionPill completed={complete} />
                </View>

                <View style={styles.entryActions}>
                  {item.kind === 'strength' && item.strengthId ? (
                    <Pressable style={styles.primaryButton} onPress={() => setScreen({ name: 'strength', id: item.strengthId!, week })}>
                      <Text style={styles.primaryButtonText}>Open workout</Text>
                    </Pressable>
                  ) : null}

                  {item.kind === 'yoga' && item.yogaDay ? (
                    <Pressable style={styles.primaryButton} onPress={() => setScreen({ name: 'yoga', day: item.yogaDay!, week })}>
                      <Text style={styles.primaryButtonText}>Open yoga</Text>
                    </Pressable>
                  ) : null}

                  {item.kind === 'run' ? (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => upsertLog(item.key, { completed: !complete } as RunLog)}
                    >
                      <Text style={styles.primaryButtonText}>
                        {complete
                          ? 'Mark incomplete'
                          : week === 13
                          ? 'Mark 5k walk complete'
                          : 'Mark run / walk complete'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderStrength = (id: string, week?: number) => {
    const workout = strengthWorkouts.find((item) => item.id === id);
    const weekEntries = week ? buildVisibleWeekEntries(week, settings) : [];
    const matchingEntry = weekEntries.find((item) => item.kind === 'strength' && item.strengthId === id);
    const actualKey = matchingEntry?.key ?? `strength-${id}`;
    const log = getLog(actualKey) as WorkoutLog;

    const previousStrengthKey = getPreviousStrengthKey(id, week, settings);
    const previousStrengthLog = previousStrengthKey
      ? (getLog(previousStrengthKey) as WorkoutLog)
      : undefined;

    if (!workout) return null;

    const updateExerciseRound = async (
      exerciseName: string,
      roundIndex: number,
      field: 'weight' | 'reps',
      value: string
    ) => {
      const exercises = { ...(log.exercises ?? {}) };
      const existing = exercises[exerciseName];
      const rounds = getLoggedRounds(existing);
      rounds[roundIndex] = { ...rounds[roundIndex], [field]: value };
      exercises[exerciseName] = { ...(existing ?? {}), rounds };
      await upsertLog(actualKey, { exercises });
    };

    return (
      <View style={styles.pageShell}>
        <View style={styles.innerHeroSpacer} />
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
          <Header
            title={workout.title}
            subtitle={workout.focus}
            onBack={() => setScreen(week ? { name: 'week', week } : { name: 'home' })}
          />

          {previousStrengthLog?.nextTimeNotes ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>NOTES FROM LAST TIME</Text>
              <Text style={styles.cardBody}>{previousStrengthLog.nextTimeNotes}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.blockLabel}>WARM-UP</Text>
            <Text style={styles.cardBody}>{workout.warmup}</Text>

            <Text style={styles.blockLabel}>MAIN WORK</Text>
            <Text style={styles.cardBody}>{workout.mainWork}</Text>

            <Text style={styles.blockLabel}>STRUCTURE</Text>
            <Text style={styles.cardBody}>Two circuits. Two rounds each. Log all four rounds below.</Text>

            <Text style={styles.blockLabel}>FINISHER</Text>
            <Text style={styles.cardBody}>{workout.finisherLabel}</Text>

            <Text style={styles.blockLabel}>EFFORT TARGET</Text>
            <Text style={styles.cardBody}>{workout.effortTarget}</Text>

            {workout.note ? (
              <>
                <Text style={styles.blockLabel}>NOTE</Text>
                <Text style={styles.cardBody}>{workout.note}</Text>
              </>
            ) : null}
          </View>

          {workout.circuits.map((circuit, circuitIndex) => (
            <View key={circuit.title} style={styles.card}>
              <Text style={styles.cardTitle}>{circuit.title}</Text>
              <Text style={styles.metaText}>2 rounds in this circuit</Text>

              {circuit.exercises.map((exercise) => {
                const rounds = getLoggedRounds(log.exercises?.[exercise.name]);
                const roundOffset = circuitIndex === 0 ? 0 : 2;

                return (
                  <View key={exercise.name} style={styles.exerciseCard}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.prescription ? <Text style={styles.exercisePrescription}>{exercise.prescription}</Text> : null}

                    {[0, 1].map((localRound) => {
                      const roundIndex = roundOffset + localRound;
                      return (
                        <View key={`${exercise.name}-round-${roundIndex}`} style={styles.roundRow}>
                          <Text style={styles.roundLabel}>Round {roundIndex + 1}</Text>
                          <TextInput
                            value={
                              rounds[roundIndex]?.weight ??
                              getPreviousExerciseWeight(logs, previousStrengthKey, exercise.name)
                            }
                            onChangeText={(value) => updateExerciseRound(exercise.name, roundIndex, 'weight', value)}
                            style={[styles.input, styles.roundInput]}
                            placeholder="kg"
                            placeholderTextColor="#D7E6F3"
                          />
                          <TextInput
                            value={rounds[roundIndex]?.reps ?? ''}
                            onChangeText={(value) => updateExerciseRound(exercise.name, roundIndex, 'reps', value)}
                            style={[styles.input, styles.roundInput]}
                            placeholder="reps"
                            placeholderTextColor="#D7E6F3"
                          />
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>FINISHER</Text>
            {workout.finisher.map((exercise) => (
              <Text key={exercise.name} style={styles.cardBody}>
                {exercise.name}
                {exercise.prescription ? ` — ${exercise.prescription}` : ''}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>SESSION NOTES</Text>
            <TextInput
              value={log.notes ?? ''}
              onChangeText={(value) => upsertLog(actualKey, { notes: value })}
              multiline
              style={[styles.input, styles.notesInput]}
              placeholder="Optional notes"
              placeholderTextColor="#D7E6F3"
            />

            <Text style={styles.cardTitle}>NOTES FOR NEXT TIME</Text>
            <TextInput
              value={log.nextTimeNotes ?? ''}
              onChangeText={(value) => upsertLog(actualKey, { nextTimeNotes: value })}
              multiline
              style={[styles.input, styles.notesInput]}
              placeholder="Things to remember next session"
              placeholderTextColor="#D7E6F3"
            />

            <Pressable style={styles.primaryButton} onPress={() => upsertLog(actualKey, { completed: !log.completed })}>
              <Text style={styles.primaryButtonText}>
                {log.completed ? 'Mark incomplete' : 'Mark workout complete'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderYoga = (day: string, week?: number) => {
    const yoga = yogaDays.find((item) => item.day === day);
    const weekEntries = week ? buildVisibleWeekEntries(week, settings) : [];
    const matchingEntry = weekEntries.find((item) => item.kind === 'yoga' && item.yogaDay === day);
    const actualKey = matchingEntry?.key ?? `yoga-${day.toLowerCase()}`;
    const log = getLog(actualKey) as WorkoutLog;

    if (!yoga) return null;

    const tiles = [
      { type: 'intro' as const, key: `intro-${day}` },
      ...yoga.poses.map((pose, index) => ({
        type: 'pose' as const,
        key: pose.file,
        pose,
        index,
      })),
      { type: 'complete' as const, key: `complete-${day}` },
    ];

    return (
      <View style={styles.pageShell}>
        <View style={styles.innerHeroSpacer} />
        <ScrollView
          contentContainerStyle={[
            styles.screenContent,
            styles.yogaScreenContent,
            { maxWidth: yogaContentMaxWidth },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title={`${day} yoga`}
            subtitle={yoga.theme}
            onBack={() => setScreen(week ? { name: 'week', week } : { name: 'today' })}
          />

          <View style={styles.yogaGrid}>
            {tiles.map((tile) => {
              const tileStyle = [
                styles.yogaTile,
                {
                  width: yogaTileWidth,
                  aspectRatio: 1,
                  minHeight: yogaTileMinHeight,
                },
              ];

          if (tile.type === 'intro') {
            return (
              <View key={tile.key} style={[...tileStyle, styles.yogaTileInfo]}>
                <Text style={styles.yogaTileTitleLarge}>{day}</Text>
                <Text style={styles.metaText}>{yoga.theme}</Text>
              </View>
            );
          }

          if (tile.type === 'complete') {
            return (
              <Pressable
                key={tile.key}
                style={[
                  ...tileStyle,
                  styles.yogaTileComplete,
                  log.completed && styles.yogaTileCompleteDone
                ]}
                onPress={() => upsertLog(actualKey, { completed: !log.completed })}
              >
                <Text style={styles.yogaTileTitle}>
                  {log.completed ? 'Complete' : 'Tap to complete'}
                </Text>
              </Pressable>
            );
          }

          return (
            <View key={tile.key} style={tileStyle}>
              <Text style={styles.poseOrderNumber}>{tile.index + 1}</Text>

              <PosePreview
                fileName={tile.pose.file}
                label={tile.pose.label}
              />

              <View style={styles.yogaPoseTextWrap}>
                <Text style={styles.yogaPoseLabel} numberOfLines={2}>
                  {tile.pose.label}
                </Text>

                {isBothSidesPose(tile.pose.label) ? (
                  <Text style={styles.bothSidesText}>
                    Perform on both sides
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  </View>
  );
  };

  const backgroundSource =
    screen.name === 'strength' || screen.name === 'yoga' || screen.name === 'today'
      ? sessionBackgroundImage
      : backgroundImage;

  return (
    <ImageBackground
      source={backgroundSource}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {screen.name === 'home' ? renderHome() : null}
        {screen.name === 'today' ? renderToday() : null}
        {screen.name === 'week' ? renderWeek(screen.week) : null}
        {screen.name === 'strength' ? renderStrength(screen.id, screen.week) : null}
        {screen.name === 'yoga' ? renderYoga(screen.day, screen.week) : null}

        <Modal visible={settingsModalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.cardTitle}>SETTINGS</Text>
              <Text style={styles.metaText}>Choose up to 3 weights days and up to 3 run / walk days.</Text>

              <View style={styles.settingsSection}>
                <Text style={styles.blockLabel}>WEIGHTS DAYS</Text>
                <View style={styles.dayButtonGrid}>
                  {dayOrder.map((day) => {
                    const selected = settings.strengthDays.includes(day);
                    return (
                      <Pressable
                        key={`strength-${day}`}
                        style={[styles.dayChip, selected && styles.dayChipSelected]}
                        onPress={() => toggleDaySetting('strengthDays', day)}
                      >
                        <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>{day.slice(0, 3)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.blockLabel}>RUN / WALK DAYS</Text>
                <View style={styles.dayButtonGrid}>
                  {dayOrder.map((day) => {
                    const selected = settings.runDays.includes(day);
                    return (
                      <Pressable
                        key={`run-${day}`}
                        style={[styles.dayChip, selected && styles.dayChipSelected]}
                        onPress={() => toggleDaySetting('runDays', day)}
                      >
                        <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>{day.slice(0, 3)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.primaryButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.headerRow}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function CompletionPill({
  completed,
  label,
}: {
  completed: boolean;
  label?: string;
}) {
  return (
    <View style={[styles.pill, completed ? styles.pillDone : styles.pillOpen]}>
      <Text style={[styles.pillText, completed ? styles.pillTextDone : styles.pillTextOpen]}>
        {label ?? (completed ? 'Done' : 'Open')}
      </Text>
    </View>
  );
}

function PosePreview({ fileName, label }: { fileName: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const source = poseImageMap[fileName];

  if (failed || !poseFilenameList.includes(fileName) || !source) {
    return (
      <View style={styles.poseFallback}>
        <Text style={styles.poseFallbackText}>{label}</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={styles.poseImage}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#09111D',
  },
  backgroundImage: {},

  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 12, 20, 0.16)',
  },
  safeArea: {
    flex: 1,
  },

  pageShell: {
    flex: 1,
    position: 'relative',
  },
  homeHeroSpacer: {
    height: 280,
  },
  innerHeroSpacer: {
    height: 50,
  },

  homeContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  screenContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconButtonText: {
    color: '#0E2F1C',
    fontSize: 22,
    fontWeight: '900',
  },

  countdownWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  countdownLabel: {
    color: '#ef850c',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.1,
    textShadowColor: '#0E2F1C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,

  },
  countdownNumber: {
    color: '#ef850c',
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 98,
    marginTop: 4,
    textShadowColor: '#0E2F1C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
 
  },
  countdownUnit: {
    color: '#ef850c',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
    textShadowColor: '#0E2F1C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  countdownDate: {
    color: '#ef850c',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    textShadowColor: '#0E2F1C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },

  todayCard: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 8,
  },
  todayCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtleLabel: {
    color: '#0E2F1C',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  todaySessionsLabel: {
    fontSize: 28,
  },
  metaText: {
    color: '#2F6B3E',
    fontSize: 28,
    fontWeight: '800',
  },
  todayCardDay: {
    color: '#0E2F1C',
    fontSize: 20,
    fontWeight: '900',
  },
  todayCardBody: {
    color: '#2F6B3E',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '700',
  },

  sectionHeading: {
    color: '#E6A800',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
    textShadowColor: '#0E2F1C',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sectionHeadingHidden: {
    opacity: 0,
  },

  weekCard: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  weekCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekCardTitle: {
    color: '#0E2F1C',
    fontSize: 28,
    fontWeight: '900',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 10,
  },
  cardTitle: {
    color: '#0E2F1C',
    fontSize: 18,
    fontWeight: '900',
  },
  cardBody: {
    color: '#2F6B3E',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },

  primaryButton: {
    backgroundColor: '#F6A64C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#102033',
    fontWeight: '900',
    fontSize: 14,
  },

  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  backButtonText: {
    color: '#0E2F1C',
    fontWeight: '900',
  },
  pageTitle: {
    color: '#0E2F1C',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pageSubtitle: {
    color: '#2F6B3E',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 12,
  },
  entryComplete: {
    backgroundColor: 'rgba(196, 226, 185, 0.68)',
    borderColor: 'rgba(39, 97, 53, 0.18)',
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDay: {
    color: '#2F6B3E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  entryTitle: {
    color: '#0E2F1C',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  entryBody: {
    color: '#2F6B3E',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillDone: {
    backgroundColor: '#D9F6D5',
  },
  pillOpen: {
    backgroundColor: 'rgba(14, 47, 28, 0.08)',
  },
  pillText: {
    fontWeight: '900',
    fontSize: 12,
  },
  pillTextDone: {
    color: '#185824',
  },
  pillTextOpen: {
    color: '#0E2F1C',
  },

  blockLabel: {
    color: '#0E2F1C',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.7,
  },

  exerciseCard: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(14,47,28,0.10)',
  },
  exerciseName: {
    color: '#0E2F1C',
    fontWeight: '900',
    fontSize: 15,
  },
  exercisePrescription: {
    color: '#2F6B3E',
    marginTop: 2,
    marginBottom: 2,
    fontWeight: '700',
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundLabel: {
    color: '#2F6B3E',
    fontWeight: '800',
    width: 62,
    fontSize: 12,
  },
  roundInput: {
    flex: 1,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14,47,28,0.10)',
    color: '#0E2F1C',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  yogaGrid: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  yogaScreenContent: {
    flexGrow: 1,
  },
  yogaTile: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 6,
    minHeight: 170,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  yogaTileInfo: {
    justifyContent: 'center',
    padding: 12,
  },
  yogaTileComplete: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  yogaTileCompleteDone: {
    backgroundColor: 'rgba(196, 226, 185, 0.78)',
    borderColor: 'rgba(39, 97, 53, 0.18)',
  },
  yogaTileTitleLarge: {
    color: '#0E2F1C',
    fontSize: 26,
    fontWeight: '900',
  },
  yogaTileTitle: {
    color: '#0E2F1C',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  poseOrderNumber: {
    position: 'absolute',
    top: 5,
    left: 7,
    zIndex: 2,
    color: '#0E2F1C',
    fontSize: 9,
    fontWeight: '900',
  },
  yogaPoseTextWrap: {
    marginTop: 8,
    alignItems: 'center',
  },
  yogaPoseLabel: {
    color: '#0E2F1C',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },
  bothSidesText: {
    color: '#2F6B3E',
    fontSize: 9,
    marginTop: 4,
    lineHeight: 11,
    fontWeight: '700',
  },

  poseImage: {
    width: '100%',
    flex: 1,
    marginTop: 10,
  },
  poseFallback: {
    width: '100%',
    height: 84,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,47,28,0.10)',
    paddingHorizontal: 4,
    marginTop: 10,
  },
  poseFallbackText: {
    color: '#0E2F1C',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 14,
  },
  settingsSection: {
    gap: 8,
  },
  dayButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(14,47,28,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(14,47,28,0.10)',
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: '#0E2F1C',
    borderColor: '#0E2F1C',
  },
  dayChipText: {
    color: '#E6A800',
    fontWeight: '900',
  },
  dayChipTextSelected: {
    color: '#E6A800',
  },
});
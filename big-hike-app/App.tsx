import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { buildCalendar, poseFilenameList, strengthWorkouts, yogaDays } from './src/data/plans';
import poseImageMap from './src/data/poseImageMap';
import { loadJson, saveJson, STORAGE_KEYS } from './src/utils/storage';

type Screen =
  | { name: 'home' }
  | { name: 'week'; week: number }
  | { name: 'strength'; id: string; week?: number }
  | { name: 'yoga'; day: string; week?: number };

type Profile = { id: string; name: string };

type WorkoutLog = {
  completed?: boolean;
  notes?: string;
  exercises?: Record<string, { weight?: string; reps?: string }>;
};

type RunLog = { completed?: boolean; notes?: string };

type AllLogs = Record<string, Record<string, WorkoutLog | RunLog>>;

const calendar = buildCalendar();
const weekNumbers = Array.from({ length: 13 }, (_, i) => i + 1);
const appIcon = require('./assets/icons/icon.png');

function keyFor(profileId: string, itemKey: string) {
  return `${profileId}::${itemKey}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [profiles, setProfiles] = useState<Profile[]>([{ id: 'default', name: 'My plan' }]);
  const [activeProfileId, setActiveProfileId] = useState('default');
  const [logs, setLogs] = useState<AllLogs>({});
  const [newProfileName, setNewProfileName] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const storedProfiles = await loadJson<Profile[]>(STORAGE_KEYS.PROFILES, [{ id: 'default', name: 'My plan' }]);
      const storedActive = await loadJson<string>(STORAGE_KEYS.ACTIVE_PROFILE, 'default');
      const storedLogs = await loadJson<AllLogs>(STORAGE_KEYS.LOGS, {});
      setProfiles(storedProfiles);
      setActiveProfileId(storedActive);
      setLogs(storedLogs);
    })();
  }, []);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0],
    [profiles, activeProfileId]
  );

  const persistProfiles = async (nextProfiles: Profile[], nextActive: string) => {
    setProfiles(nextProfiles);
    setActiveProfileId(nextActive);
    await saveJson(STORAGE_KEYS.PROFILES, nextProfiles);
    await saveJson(STORAGE_KEYS.ACTIVE_PROFILE, nextActive);
  };

  const persistLogs = async (next: AllLogs) => {
    setLogs(next);
    await saveJson(STORAGE_KEYS.LOGS, next);
  };

  const upsertLog = async (itemKey: string, value: WorkoutLog | RunLog) => {
    const composite = keyFor(activeProfile.id, itemKey);
    const next = { ...logs, [composite]: { ...(logs[composite] ?? {}), ...value } };
    await persistLogs(next);
  };

  const getLog = (itemKey: string): WorkoutLog | RunLog => logs[keyFor(activeProfile.id, itemKey)] ?? {};

  const addProfile = async () => {
    const name = newProfileName.trim();
    if (!name) return;
    const newProfile = { id: `profile-${Date.now()}`, name };
    const nextProfiles = [...profiles, newProfile];
    await persistProfiles(nextProfiles, newProfile.id);
    setNewProfileName('');
    setProfileModalVisible(false);
  };

  const deleteProfile = async (profileId: string) => {
    if (profileId === 'default') {
      Alert.alert('Nope', 'Keep the default profile around as a safe fallback.');
      return;
    }
    const nextProfiles = profiles.filter((profile) => profile.id !== profileId);
    const nextActive = activeProfileId === profileId ? 'default' : activeProfileId;
    const nextLogs = Object.fromEntries(Object.entries(logs).filter(([key]) => !key.startsWith(`${profileId}::`)));
    await persistProfiles(nextProfiles, nextActive);
    await persistLogs(nextLogs);
  };

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Image source={appIcon} style={styles.heroIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Big Hike</Text>
          <Text style={styles.heroTitle}>13-week hike training tracker</Text>
          <Text style={styles.heroText}>Strength locked to your exact plan. Yoga mapped to your filenames. Run days are just completion ticks.</Text>
        </View>
      </View>

      <View style={styles.profileBar}>
        <View>
          <Text style={styles.sectionLabel}>Active profile</Text>
          <Text style={styles.profileName}>{activeProfile?.name ?? 'My plan'}</Text>
        </View>
        <Pressable style={styles.secondaryButton} onPress={() => setProfileModalVisible(true)}>
          <Text style={styles.secondaryButtonText}>Profiles</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Plan structure</Text>
        <Text style={styles.cardBody}>Weeks 1–12 repeat the two-week cycle exactly: A Sun, B Wed, C Fri, then D Sun, E Wed, F Fri. Week 13 is left unscheduled in-app so you can complete one round of A–F without me inventing days you didn’t specify.</Text>
      </View>

      <Text style={styles.sectionTitle}>Weeks</Text>
      <View style={styles.weekGrid}>
        {weekNumbers.map((week) => (
          <Pressable key={week} style={styles.weekCard} onPress={() => setScreen({ name: 'week', week })}>
            <Text style={styles.weekLabel}>Week</Text>
            <Text style={styles.weekNumber}>{week}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Asset drop folder</Text>
        <Text style={styles.cardBody}>Put yoga PNGs in assets/yoga and keep the filenames from docs/yoga-image-file-list.txt. Missing images automatically fall back to pose names on the yoga screen.</Text>
      </View>
    </ScrollView>
  );

  const renderWeek = (week: number) => {
    const entries = calendar.filter((item) => item.week === week);
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Header title={`Week ${week}`} onBack={() => setScreen({ name: 'home' })} />
        {entries.map((item) => {
          const log = getLog(item.key);
          const complete = Boolean(log.completed);
          return (
            <View key={item.key} style={[styles.entryCard, complete && styles.entryComplete]}>
              <View style={styles.entryTopRow}>
                <View>
                  <Text style={styles.entryDay}>{item.day}</Text>
                  <Text style={styles.entryTitle}>{item.title}</Text>
                </View>
                <CompletionPill completed={complete} />
              </View>
              {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}
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
                    <Text style={styles.primaryButtonText}>{complete ? 'Mark incomplete' : 'Mark run complete'}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderStrength = (id: string, week?: number) => {
    const workout = strengthWorkouts.find((item) => item.id === id);
    const itemKey = week ? `week-${week}-${id}` : `strength-${id}`;
    const matchingCalendar = calendar.find((item) => item.week === week && item.strengthId === id);
    const actualKey = matchingCalendar?.key ?? itemKey;
    const log = getLog(actualKey) as WorkoutLog;
    if (!workout) return null;

    const updateExercise = async (name: string, field: 'weight' | 'reps', value: string) => {
      const exercises = { ...(log.exercises ?? {}) };
      exercises[name] = { ...(exercises[name] ?? {}), [field]: value };
      await upsertLog(actualKey, { exercises });
    };

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Header title={`${workout.title}`} subtitle={workout.focus} onBack={() => setScreen(week ? { name: 'week', week } : { name: 'home' })} />
        <View style={styles.card}>
          <Text style={styles.blockLabel}>Warm-up</Text>
          <Text style={styles.cardBody}>{workout.warmup}</Text>
          <Text style={styles.blockLabel}>Main work</Text>
          <Text style={styles.cardBody}>{workout.mainWork}</Text>
          <Text style={styles.blockLabel}>Finisher</Text>
          <Text style={styles.cardBody}>{workout.finisherLabel}</Text>
          <Text style={styles.blockLabel}>Effort target</Text>
          <Text style={styles.cardBody}>{workout.effortTarget}</Text>
          {workout.note ? (
            <>
              <Text style={styles.blockLabel}>Note</Text>
              <Text style={styles.cardBody}>{workout.note}</Text>
            </>
          ) : null}
        </View>

        {workout.circuits.map((circuit) => (
          <View key={circuit.title} style={styles.card}>
            <Text style={styles.cardTitle}>{circuit.title}</Text>
            <Text style={styles.cardBody}>{circuit.rounds}</Text>
            {circuit.exercises.map((exercise) => (
              <View key={exercise.name} style={styles.exerciseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.prescription ? <Text style={styles.exercisePrescription}>{exercise.prescription}</Text> : null}
                </View>
                <View style={styles.inputColumn}>
                  <Text style={styles.inputLabel}>Weight</Text>
                  <TextInput
                    value={log.exercises?.[exercise.name]?.weight ?? ''}
                    onChangeText={(value) => updateExercise(exercise.name, 'weight', value)}
                    style={styles.input}
                    placeholder="kg"
                    placeholderTextColor="#7990A6"
                  />
                </View>
                <View style={styles.inputColumn}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    value={log.exercises?.[exercise.name]?.reps ?? ''}
                    onChangeText={(value) => updateExercise(exercise.name, 'reps', value)}
                    style={styles.input}
                    placeholder="reps"
                    placeholderTextColor="#7990A6"
                  />
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Finisher</Text>
          {workout.finisher.map((exercise) => (
            <Text key={exercise.name} style={styles.cardBody}>
              {exercise.name}{exercise.prescription ? ` — ${exercise.prescription}` : ''}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session notes</Text>
          <TextInput
            value={log.notes ?? ''}
            onChangeText={(value) => upsertLog(actualKey, { notes: value })}
            multiline
            style={[styles.input, styles.notesInput]}
            placeholder="Optional notes"
            placeholderTextColor="#7990A6"
          />
          <Pressable style={styles.primaryButton} onPress={() => upsertLog(actualKey, { completed: !log.completed })}>
            <Text style={styles.primaryButtonText}>{log.completed ? 'Mark incomplete' : 'Mark workout complete'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderYoga = (day: string, week?: number) => {
    const yoga = yogaDays.find((item) => item.day === day);
    const matchingCalendar = calendar.find((item) => item.week === week && item.kind === 'yoga' && item.yogaDay === day);
    const actualKey = matchingCalendar?.key ?? `yoga-${day}`;
    const log = getLog(actualKey) as WorkoutLog;

    if (!yoga) return null;

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Header title={`${day} yoga`} subtitle={yoga.theme} onBack={() => setScreen(week ? { name: 'week', week } : { name: 'home' })} />
        <View style={styles.card}>
          <Text style={styles.cardBody}>{yoga.notes}</Text>
          <Pressable style={styles.primaryButton} onPress={() => upsertLog(actualKey, { completed: !log.completed })}>
            <Text style={styles.primaryButtonText}>{log.completed ? 'Mark incomplete' : 'Mark yoga complete'}</Text>
          </Pressable>
        </View>

        {yoga.poses.map((pose) => (
          <View key={pose.file} style={styles.poseCard}>
            <Text style={styles.poseName}>{pose.label}</Text>
            <PosePreview fileName={pose.file} label={pose.label} />
            <Text style={styles.poseFile}>{pose.file}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {screen.name === 'home' ? renderHome() : null}
      {screen.name === 'week' ? renderWeek(screen.week) : null}
      {screen.name === 'strength' ? renderStrength(screen.id, screen.week) : null}
      {screen.name === 'yoga' ? renderYoga(screen.day, screen.week) : null}

      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Profiles</Text>
            <Text style={styles.cardBody}>Use separate profiles so friends can keep their own logs on the same build.</Text>
            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.profileRow}>
                  <Pressable style={{ flex: 1 }} onPress={() => persistProfiles(profiles, item.id)}>
                    <Text style={styles.profileRowTitle}>{item.name}</Text>
                    <Text style={styles.profileRowSub}>{item.id === activeProfileId ? 'Active' : 'Tap to switch'}</Text>
                  </Pressable>
                  {item.id !== 'default' ? (
                    <Pressable onPress={() => deleteProfile(item.id)}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            />
            <TextInput
              value={newProfileName}
              onChangeText={setNewProfileName}
              style={styles.input}
              placeholder="New profile name"
              placeholderTextColor="#7990A6"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.primaryButton} onPress={addProfile}>
                <Text style={styles.primaryButtonText}>Add profile</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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

function CompletionPill({ completed }: { completed: boolean }) {
  return (
    <View style={[styles.pill, completed ? styles.pillDone : styles.pillOpen]}>
      <Text style={[styles.pillText, completed ? styles.pillTextDone : styles.pillTextOpen]}>{completed ? 'Done' : 'Open'}</Text>
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
  safeArea: { flex: 1, backgroundColor: '#0B1320' },
  content: { padding: 18, gap: 14, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#162235',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: '#223650',
  },
  heroIcon: { width: 84, height: 84, borderRadius: 18 },
  eyebrow: { color: '#F5D957', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#F3F7FB', fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroText: { color: '#B8C7D8', fontSize: 14, lineHeight: 20, marginTop: 8 },
  sectionTitle: { color: '#F3F7FB', fontSize: 20, fontWeight: '800', marginTop: 4 },
  sectionLabel: { color: '#8CA2B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  profileBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileName: { color: '#F3F7FB', fontSize: 18, fontWeight: '700', marginTop: 2 },
  card: {
    backgroundColor: '#111C2D',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#203048',
    gap: 10,
  },
  cardTitle: { color: '#F3F7FB', fontSize: 18, fontWeight: '800' },
  cardBody: { color: '#B8C7D8', fontSize: 14, lineHeight: 21 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  weekCard: {
    width: '30%',
    minWidth: 100,
    backgroundColor: '#162235',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A3F5F',
  },
  weekLabel: { color: '#91A7BC', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  weekNumber: { color: '#F5D957', fontSize: 28, fontWeight: '900', marginTop: 6 },
  primaryButton: {
    backgroundColor: '#FF8A3D',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#0B1320', fontWeight: '800', fontSize: 14 },
  secondaryButton: {
    backgroundColor: '#203048',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButtonText: { color: '#F3F7FB', fontWeight: '700' },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  backButton: { backgroundColor: '#203048', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  backButtonText: { color: '#F3F7FB', fontWeight: '700' },
  pageTitle: { color: '#F3F7FB', fontSize: 24, fontWeight: '900' },
  pageSubtitle: { color: '#8CC7EE', fontSize: 14, fontWeight: '600', marginTop: 2 },
  entryCard: {
    backgroundColor: '#111C2D',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#203048',
    gap: 12,
  },
  entryComplete: { borderColor: '#4DAA57', backgroundColor: '#102515' },
  entryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDay: { color: '#8CA2B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  entryTitle: { color: '#F3F7FB', fontSize: 18, fontWeight: '800', marginTop: 4 },
  entryNote: { color: '#B8C7D8', lineHeight: 20 },
  entryActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillDone: { backgroundColor: '#D4F3D6' },
  pillOpen: { backgroundColor: '#203048' },
  pillText: { fontWeight: '800', fontSize: 12 },
  pillTextDone: { color: '#1C6D2A' },
  pillTextOpen: { color: '#D7E5F0' },
  blockLabel: { color: '#F5D957', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.6 },
  exerciseRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#203048',
  },
  exerciseName: { color: '#F3F7FB', fontWeight: '700', fontSize: 15 },
  exercisePrescription: { color: '#8CA2B8', marginTop: 2 },
  inputColumn: { width: 80 },
  inputLabel: { color: '#8CA2B8', fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#0E1725',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223650',
    color: '#F3F7FB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  notesInput: { minHeight: 90, textAlignVertical: 'top' },
  poseCard: {
    backgroundColor: '#111C2D',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#203048',
    gap: 10,
  },
  poseName: { color: '#F3F7FB', fontSize: 16, fontWeight: '800' },
  poseImage: { width: '100%', height: 180, backgroundColor: '#0E1725', borderRadius: 16 },
  poseFallback: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#0E1725',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#203048',
  },
  poseFallbackText: { color: '#B8C7D8', fontSize: 18, fontWeight: '700' },
  poseFile: { color: '#8CA2B8', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
  modalCard: {
    backgroundColor: '#111C2D',
    borderRadius: 24,
    padding: 18,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#203048',
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#203048',
  },
  profileRowTitle: { color: '#F3F7FB', fontSize: 16, fontWeight: '700' },
  profileRowSub: { color: '#8CA2B8', marginTop: 2 },
  deleteText: { color: '#FF7D7D', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 10 },
});

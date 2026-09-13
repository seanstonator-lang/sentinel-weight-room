import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Dumbbell, Plus, User, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, TrendingUp, X, Users, Flame,
  Trash2, ClipboardList, Check, Timer, Apple, Calendar, BarChart3, Heart,
  Lock, GraduationCap, Copy, Award, AlertTriangle, Droplets, Gauge, Layers, BookOpen,
  MessageSquare, Repeat, Table, Download, Pencil, Camera, Monitor, Eye, EyeOff, Play, Activity, CalendarCheck, Zap, Target,
} from "lucide-react";

/* ===============================================================
   SENTINEL SPARTANS — WEIGHT ROOM
   Design language carried from the first draft: deep Spartan purple
   grounds every screen, warm gold is spent only on earned things
   (PRs, rank 1, primary actions). Anton for display, Inter for body.
   Signature element: the plate stack — every load in the app renders
   as the actual plates you'd slide onto the bar.
================================================================ */
const C = {
  bg: "#1A0E2B",
  surface: "#241536",
  surfaceAlt: "#2F1B48",
  border: "#402A5C",
  steel: "#A996C4",
  text: "#F5F0E6",
  textDim: "#B4A3CE",
  accent: "#F8B533",
  accentDim: "rgba(248,181,51,0.16)",
  accentBorder: "rgba(248,181,51,0.45)",
  good: "#5FBF8B",
  warn: "#E8A54B",
  bad: "#E08585",
  crest: "#5A2E6D",
};

const SCHEMA = "sw3";
const K = (name) => `${SCHEMA}:${name}`;

/* ---------------- exercise library ---------------- */
// mode: weight (lb x reps) | reps (bodyweight reps) | sprint (timed) | measure (inches)
const LIBRARY = [
  { name: "Back Squat", mode: "weight", group: "Lower" },
  { name: "Front Squat", mode: "weight", group: "Lower" },
  { name: "Goblet Squat", mode: "weight", group: "Lower" },
  { name: "Split Squat", mode: "weight", group: "Lower" },
  { name: "Deadlift", mode: "weight", group: "Lower" },
  { name: "Trap Bar Deadlift", mode: "weight", group: "Lower" },
  { name: "Romanian Deadlift", mode: "weight", group: "Lower" },
  { name: "Hip Thrust", mode: "weight", group: "Lower" },
  { name: "Bench Press", mode: "weight", group: "Upper" },
  { name: "Incline Bench Press", mode: "weight", group: "Upper" },
  { name: "Dumbbell Bench Press", mode: "weight", group: "Upper" },
  { name: "Overhead Press", mode: "weight", group: "Upper" },
  { name: "Push Press", mode: "weight", group: "Upper" },
  { name: "Barbell Row", mode: "weight", group: "Upper" },
  { name: "Lat Pulldown", mode: "weight", group: "Upper" },
  { name: "Bicep Curl", mode: "weight", group: "Upper" },
  { name: "Tricep Extension", mode: "weight", group: "Upper" },
  { name: "Power Clean", mode: "weight", group: "Olympic" },
  { name: "Hang Clean", mode: "weight", group: "Olympic" },
  { name: "Clean Pull", mode: "weight", group: "Olympic" },
  { name: "Pull-Up", mode: "reps", group: "Bodyweight" },
  { name: "Chin-Up", mode: "reps", group: "Bodyweight" },
  { name: "Push-Up", mode: "reps", group: "Bodyweight" },
  { name: "Dip", mode: "reps", group: "Bodyweight" },
  { name: "10 Yard Dash", mode: "sprint", dist: 10, unit: "yd", group: "Speed" },
  { name: "20 Yard Dash", mode: "sprint", dist: 20, unit: "yd", group: "Speed" },
  { name: "40 Yard Dash", mode: "sprint", dist: 40, unit: "yd", group: "Speed" },
  { name: "Pro Agility (5-10-5)", mode: "sprint", dist: 20, unit: "yd", group: "Speed" },
  { name: "60 Meter", mode: "sprint", dist: 60, unit: "m", group: "Speed" },
  { name: "100 Meter", mode: "sprint", dist: 100, unit: "m", group: "Speed" },
  { name: "200 Meter", mode: "sprint", dist: 200, unit: "m", group: "Speed" },
  { name: "400 Meter", mode: "sprint", dist: 400, unit: "m", group: "Speed" },
  { name: "300 Yard Shuttle", mode: "sprint", dist: 300, unit: "yd", group: "Speed" },
  { name: "1 Mile", mode: "sprint", dist: 1760, unit: "yd", group: "Speed" },
  { name: "Vertical Jump", mode: "measure", unit: "in", group: "Power" },
  { name: "Broad Jump", mode: "measure", unit: "in", group: "Power" },
  { name: "Box Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Depth Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Hurdle Hops", mode: "reps", group: "Jumps/Throws" },
  { name: "Single-Leg Bound", mode: "reps", group: "Jumps/Throws" },
  { name: "Max Effort Med Ball Chest Pass", mode: "reps", group: "Jumps/Throws" },
  { name: "Med Ball Backwards Scoop Throw", mode: "reps", group: "Jumps/Throws" },
  { name: "Med Ball Rotational Throw", mode: "reps", group: "Jumps/Throws" },

  // Added from the coach's TrainHeroic exercise index.
  { name: "1 Power Clean + 1 Hang Clean + 1 Front Squat", mode: "weight", group: "Olympic" },
  { name: "10 Meter Fly", mode: "sprint", group: "Speed" },
  { name: "10 Meter Split", mode: "sprint", group: "Speed" },
  { name: "2 Step Box Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "2 Strict Press + 1 Push Press", mode: "weight", group: "Upper" },
  { name: "90-90 Hip Rocking", mode: "reps", group: "Mobility/Stretch" },
  { name: "ATG - Dip", mode: "reps", group: "Upper" },
  { name: "ATG DB Pull Overs", mode: "weight", group: "Upper" },
  { name: "ATG Shoulder Press", mode: "weight", group: "Upper" },
  { name: "ATG Split Squat", mode: "weight", group: "Lower" },
  { name: "Adductor Rocking", mode: "reps", group: "Mobility/Stretch" },
  { name: "Alternating Plank to Push Up", mode: "reps", group: "Bodyweight" },
  { name: "BB Front Heel Elevated Split Squat", mode: "weight", group: "Lower" },
  { name: "BB Front Squat Heels Elevated", mode: "weight", group: "Lower" },
  { name: "BB Iso Power Clean", mode: "weight", group: "Olympic" },
  { name: "BB Single Leg Hip Thruster", mode: "weight", group: "Lower" },
  { name: "BB Suitcase Deadlift", mode: "weight", group: "Lower" },
  { name: "Back Squat Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Band Assisted Pogo Hops", mode: "reps", group: "Jumps/Throws" },
  { name: "Band Resisted Broad Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Banded \"SPARTANS\"", mode: "reps", group: "Other" },
  { name: "Banded Barbell Deadlifts", mode: "weight", group: "Lower" },
  { name: "Banded Bicep Curls", mode: "weight", group: "Upper" },
  { name: "Banded Chest Fly", mode: "weight", group: "Upper" },
  { name: "Banded Chest Press", mode: "weight", group: "Upper" },
  { name: "Banded Cross Pulls", mode: "weight", group: "Upper" },
  { name: "Banded Curls", mode: "weight", group: "Upper" },
  { name: "Banded External Rotations", mode: "weight", group: "Upper" },
  { name: "Banded Good Mornings", mode: "weight", group: "Lower" },
  { name: "Banded Hamstring Curl", mode: "weight", group: "Lower" },
  { name: "Banded Hamstring Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Banded Hex Bar Deadlifts", mode: "weight", group: "Lower" },
  { name: "Banded Hip Flexor Curl", mode: "weight", group: "Lower" },
  { name: "Banded Hip Flexor Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Banded Hip Flossing", mode: "reps", group: "Mobility/Stretch" },
  { name: "Banded Internal Rotations", mode: "weight", group: "Upper" },
  { name: "Banded KB Swing", mode: "weight", group: "Lower" },
  { name: "Banded Knees Front Squat", mode: "weight", group: "Lower" },
  { name: "Banded Lateral Bounding", mode: "reps", group: "Speed" },
  { name: "Banded Lateral Shuffle", mode: "reps", group: "Speed" },
  { name: "Banded Pancake Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Banded Plyo Punches", mode: "reps", group: "Jumps/Throws" },
  { name: "Banded Power Drop Step to Punch", mode: "reps", group: "Jumps/Throws" },
  { name: "Banded Power Shuffle", mode: "reps", group: "Speed" },
  { name: "Banded Prone Figure 4 Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Banded Resisted Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Banded Reverse Squats", mode: "weight", group: "Lower" },
  { name: "Banded Row", mode: "weight", group: "Upper" },
  { name: "Banded Shin Blasters", mode: "weight", group: "Lower" },
  { name: "Banded Speed Squat", mode: "weight", group: "Lower" },
  { name: "Banded Super Front Rack Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Banded Underhand Pullaparts", mode: "weight", group: "Upper" },
  { name: "Banded X Walks", mode: "reps", group: "Mobility/Stretch" },
  { name: "Barbell Military Press", mode: "weight", group: "Upper" },
  { name: "Barbell Overhead Press", mode: "weight", group: "Upper" },
  { name: "Barbell RDL", mode: "weight", group: "Lower" },
  { name: "Barbell RFE Split Squat", mode: "weight", group: "Lower" },
  { name: "Barbell Split Squat", mode: "weight", group: "Lower" },
  { name: "Barbell Step Ups", mode: "weight", group: "Lower" },
  { name: "Barbell Tricep Extension", mode: "weight", group: "Upper" },
  { name: "Blackout Split Squats w/ KB", mode: "weight", group: "Lower" },
  { name: "Bottom Up Front Squat", mode: "weight", group: "Lower" },
  { name: "Bottoms Up Bench Press", mode: "weight", group: "Upper" },
  { name: "Box Breathing", mode: "reps", group: "Mobility/Stretch" },
  { name: "Broad Jump into Pogo Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Cable Face Pulls", mode: "weight", group: "Upper" },
  { name: "Cable Lat Row", mode: "weight", group: "Upper" },
  { name: "Cable Pancake", mode: "reps", group: "Mobility/Stretch" },
  { name: "Cable Pull Downs", mode: "weight", group: "Upper" },
  { name: "Captain Morgan Side Plank", mode: "reps", group: "Bodyweight" },
  { name: "Chaos DB Rows", mode: "weight", group: "Upper" },
  { name: "Combat Rolls", mode: "reps", group: "Bodyweight" },
  { name: "Combative Sprinting", mode: "sprint", group: "Speed" },
  { name: "Cossack Squat", mode: "reps", group: "Lower" },
  { name: "Couch Lunge Pulse", mode: "reps", group: "Mobility/Stretch" },
  { name: "Forward Fold to Partial Extension", mode: "reps", group: "Mobility/Stretch" },
  { name: "Side Bends", mode: "reps", group: "Mobility/Stretch" },
  { name: "Ankle Flexion", mode: "reps", group: "Mobility/Stretch" },
  { name: "Plantar Flexion", mode: "reps", group: "Mobility/Stretch" },
  { name: "Cat Cows", mode: "reps", group: "Mobility/Stretch" },
  { name: "Kneeling Pec Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Open Books", mode: "reps", group: "Mobility/Stretch" },
  { name: "Neck Nods", mode: "reps", group: "Mobility/Stretch" },
  { name: "Rock n' Rolls", mode: "reps", group: "Mobility/Stretch" },
  { name: "Quad Pull to Squat", mode: "reps", group: "Mobility/Stretch" },
  { name: "Squat to Stand", mode: "reps", group: "Mobility/Stretch" },
  { name: "Arm Circles", mode: "reps", group: "Mobility/Stretch" },
  { name: "Adductor Smash w/ Barbell", mode: "reps", group: "Mobility/Stretch" },
  { name: "Quad Smash w/ KB or BB", mode: "reps", group: "Mobility/Stretch" },
  { name: "Hamstring Smash w/ Ball", mode: "reps", group: "Mobility/Stretch" },
  { name: "Glute Smash w/ Ball", mode: "reps", group: "Mobility/Stretch" },
  { name: "KB Pec Smash", mode: "reps", group: "Mobility/Stretch" },
  { name: "Softball Lat Smash", mode: "reps", group: "Mobility/Stretch" },
  { name: "Softball Upper Back Smash", mode: "reps", group: "Mobility/Stretch" },
  { name: "Softball Trap/Neck Smash", mode: "reps", group: "Mobility/Stretch" },
  { name: "Quad Wall Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Pancake Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Pigeon Pose", mode: "reps", group: "Mobility/Stretch" },
  { name: "Power Marches", mode: "reps", group: "Speed" },
  { name: "Chops", mode: "reps", group: "Speed" },
  { name: "3 Count Chops", mode: "reps", group: "Speed" },
  { name: "A Skip", mode: "reps", group: "Speed" },
  { name: "Crossover Run", mode: "reps", group: "Speed" },
  { name: "Backwards Run", mode: "reps", group: "Speed" },
  { name: "Prime Times", mode: "reps", group: "Speed" },
  { name: "Tempo High Knees", mode: "reps", group: "Speed" },
  { name: "Pogo Hop to Box Jump", mode: "reps", group: "Jumps/Throws" },
  { name: "Pogo Hop to Split Stance", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Diagonal Jump to Stick", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Diagonal Jump to Double Bounce", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Broad Jump to Double Leg Landing", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Bounds", mode: "reps", group: "Jumps/Throws" },
  { name: "Triple Broad Jump Competition", mode: "reps", group: "Jumps/Throws" },
  { name: "90-90 Hip Switch", mode: "reps", group: "Mobility/Stretch" },
  { name: "90-90 Hip Extensions", mode: "reps", group: "Mobility/Stretch" },
  { name: "L-Sit Single Leg Lifts", mode: "reps", group: "Bodyweight" },
  { name: "Hip Hurdles", mode: "reps", group: "Mobility/Stretch" },
  { name: "Pogo Hops", mode: "reps", group: "Jumps/Throws" },
  { name: "Backwards Pogos", mode: "reps", group: "Jumps/Throws" },
  { name: "Lateral Pogos", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Low Pogos", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Cycle Jumps", mode: "reps", group: "Jumps/Throws" },
  { name: "Single Leg Jump to Single Leg Landing", mode: "reps", group: "Jumps/Throws" },
  { name: "30 Yard Sprint", mode: "sprint", group: "Speed" },
  { name: "Sled Sprint", mode: "sprint", group: "Speed" },
  { name: "10 Yard Sprint", mode: "sprint", group: "Speed" },
  { name: "Side Plank with Clamshell Hold", mode: "reps", group: "Bodyweight" },
  { name: "90-90 Heel Touches", mode: "reps", group: "Mobility/Stretch" },
  { name: "Hip Circles", mode: "reps", group: "Mobility/Stretch" },
  { name: "Hamstring Walkouts", mode: "reps", group: "Mobility/Stretch" },
  { name: "Split Squat Iso Hold", mode: "reps", group: "Lower" },
  { name: "Front Foot Pogos", mode: "reps", group: "Jumps/Throws" },
  { name: "Lateral Jump to SL Landing", mode: "reps", group: "Jumps/Throws" },
  { name: "Diagonal Jump to SL Landing", mode: "reps", group: "Jumps/Throws" },
  { name: "Diagonal Double Bounce", mode: "reps", group: "Jumps/Throws" },
  { name: "Crossover Step", mode: "reps", group: "Speed" },
  { name: "Lateral Shuffle", mode: "reps", group: "Speed" },
  { name: "Overspeed Deceleration", mode: "reps", group: "Speed" },
  { name: "S-Curved Sprints", mode: "sprint", group: "Speed" },
  { name: "Curved Sprint Chase", mode: "sprint", group: "Speed" },
  { name: "Pigeon Push Ups", mode: "reps", group: "Mobility/Stretch" },
  { name: "Partner Lateral Leg Raises", mode: "reps", group: "Mobility/Stretch" },
  { name: "Half Kneeling Wall Rotations", mode: "reps", group: "Mobility/Stretch" },
  { name: "Wall T-Spine Pec Opener", mode: "reps", group: "Mobility/Stretch" },
  { name: "Deep Squat Calf Raises", mode: "reps", group: "Mobility/Stretch" },
  { name: "Kick Backs", mode: "reps", group: "Mobility/Stretch" },
  { name: "Half Kneeling Dynamic Hip Openers", mode: "reps", group: "Mobility/Stretch" },
  { name: "90-90 FRC", mode: "reps", group: "Mobility/Stretch" },
  { name: "Partner Resisted Lateral Leg Raises", mode: "reps", group: "Mobility/Stretch" },
  { name: "Spider Man Stretch", mode: "reps", group: "Mobility/Stretch" },
  { name: "Quad Mans", mode: "reps", group: "Mobility/Stretch" },
  { name: "High Knees", mode: "reps", group: "Speed" },

  // Added from the Strength Training Program Design course pack.
  { name: "RDL", mode: "weight", group: "Lower", pattern: "Hinge", equipment: "Barbell" },
  { name: "Dumbbell RDL", mode: "weight", group: "Lower", pattern: "Hinge", equipment: "Dumbbell" },
  { name: "Dumbbell Split Squat", mode: "weight", group: "Lower", pattern: "Lunge", equipment: "Dumbbell" },
  { name: "Single Leg Hip Bridge", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Bodyweight" },
  { name: "Medicine Ball Scoop Toss", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Med Ball" },
  { name: "Dumbbell Incline Bench Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Dumbbell" },
  { name: "One Arm Dumbbell Row", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Dumbbell" },
  { name: "Incline Dumbbell Row", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Dumbbell" },
  { name: "Hanging Knee Raise", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Barbell Reverse Lunge", mode: "weight", group: "Lower", pattern: "Lunge", equipment: "Barbell" },
  { name: "Back Extensions", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Bodyweight" },
  { name: "Single Leg Lateral Box Hop", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Box/Bench" },
  { name: "Dumbbell Shoulder Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Dumbbell" },
  { name: "Seated Dumbbell Shoulder Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Dumbbell" },
  { name: "Barbell Bent Over Row", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Barbell" },
  { name: "Band Pallof Press", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Band" },
  { name: "Single Leg Lateral Box Jump", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Box/Bench" },
  { name: "Barbell Hip Thrust", mode: "weight", group: "Lower", pattern: "Hinge", equipment: "Barbell" },
  { name: "Shoulder Taps", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Single Leg Pistol Squat to Bench", mode: "reps", group: "Lower", pattern: "Squat", equipment: "Box/Bench" },
  { name: "Stability Ball Leg Curl", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Other" },
  { name: "Medicine Ball Slam", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Med Ball" },
  { name: "Weighted Push Ups", mode: "reps", group: "Upper", pattern: "Push", equipment: "Bodyweight" },
  { name: "Lat Pulldowns", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Cable/Machine" },
  { name: "Weighted Sit Ups", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Rear Foot Elevated Split Squat", mode: "weight", group: "Lower", pattern: "Lunge", equipment: "Dumbbell" },
  { name: "Nordic Hamstring Curl", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Bodyweight" },
  { name: "Single Leg Box Jump", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Box/Bench" },
  { name: "Ab Wheel", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Other" },
  { name: "TRX Row", mode: "reps", group: "Upper", pattern: "Pull", equipment: "Other" },
  { name: "Floor Slider Leg Curl", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Bodyweight" },
  { name: "Chin Ups", mode: "reps", group: "Upper", pattern: "Pull", equipment: "Bodyweight" },
  { name: "Side Plank", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },

  // Added from the 5x5 Workout Program (ThisIsWhyImFit.com).
  { name: "Chest Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Cable/Machine" },
  { name: "High Incline Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Barbell" },
  { name: "Side Lateral Raise", mode: "weight", group: "Upper", pattern: "Push", equipment: "Dumbbell" },
  { name: "Triceps Pushdowns", mode: "weight", group: "Upper", pattern: "Push", equipment: "Cable/Machine" },
  { name: "Kelso Shrugs", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Cable/Machine" },
  { name: "Upright Row", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Barbell" },
  { name: "Leg Extension", mode: "weight", group: "Lower", pattern: "Squat", equipment: "Cable/Machine" },
  { name: "Leg Curl", mode: "weight", group: "Lower", pattern: "Hinge", equipment: "Cable/Machine" },
  { name: "Hip Adduction", mode: "weight", group: "Lower", pattern: "Other", equipment: "Cable/Machine" },
  { name: "Wide Stance Squat or Sumo Deadlift", mode: "weight", group: "Lower", pattern: "Squat", equipment: "Barbell" },
  { name: "Close-Grip Bench", mode: "weight", group: "Upper", pattern: "Push", equipment: "Barbell" },
  { name: "Alternative Row Variation", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Cable/Machine" },
  { name: "Posterior Delt Fly", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Cable/Machine" },
  { name: "Hammer Curl", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Dumbbell" },

  // Added from DeFranco's Training program pack.
  { name: "Seated Row", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Cable/Machine" },
  { name: "Dumbbell Clean and Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Dumbbell" },
  { name: "Standing Calf Raise", mode: "weight", group: "Lower", pattern: "Other", equipment: "Cable/Machine" },
  { name: "Seated Calf Raise", mode: "weight", group: "Lower", pattern: "Other", equipment: "Cable/Machine" },
  { name: "Plate Pinch", mode: "reps", group: "Bodyweight", pattern: "Carry", equipment: "Other" },
  { name: "DB Farmers Hold", mode: "reps", group: "Bodyweight", pattern: "Carry", equipment: "Dumbbell" },
  { name: "Seated DB Curl", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Dumbbell" },
  { name: "High Box Step-up", mode: "weight", group: "Lower", pattern: "Lunge", equipment: "Box/Bench" },
  { name: "Static Hang", mode: "reps", group: "Bodyweight", pattern: "Pull", equipment: "Bodyweight" },
  { name: "Barbell Overhead Carry", mode: "reps", group: "Bodyweight", pattern: "Carry", equipment: "Barbell" },
  { name: "Treadmill Sprint", mode: "sprint", group: "Speed" },
  { name: "Push-up Plank Hold", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Farmers Walk", mode: "reps", group: "Bodyweight", pattern: "Carry", equipment: "Dumbbell" },
  { name: "Bear Crawl", mode: "reps", group: "Bodyweight", pattern: "Locomotion", equipment: "Bodyweight" },
  { name: "Flutter Kicks", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Seated Cable Row", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Cable/Machine" },
  { name: "Dumbbell Shrugs", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Dumbbell" },
  { name: "Safety Bar Box Squat", mode: "weight", group: "Lower", pattern: "Squat", equipment: "Barbell" },
  { name: "Sled Power Walk", mode: "reps", group: "Bodyweight", pattern: "Locomotion", equipment: "Sled" },
  { name: "Banded Dorsiflexion", mode: "reps", group: "Mobility/Stretch", pattern: "Other", equipment: "Band" },
  { name: "Stability Ball Crunch", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Other" },
  { name: "Dumbbell Floor Press", mode: "weight", group: "Upper", pattern: "Push", equipment: "Dumbbell" },
  { name: "Band Pull-Aparts", mode: "reps", group: "Upper", pattern: "Pull", equipment: "Band" },
  { name: "Lateral Sled Drag", mode: "reps", group: "Lower", pattern: "Locomotion", equipment: "Sled" },
  { name: "Cable Crossover", mode: "weight", group: "Upper", pattern: "Push", equipment: "Cable/Machine" },
  { name: "Eccentric Barbell Curl", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Barbell" },
  { name: "Single Arm Preacher Curl", mode: "weight", group: "Upper", pattern: "Pull", equipment: "Dumbbell" },
  { name: "Trap Bar Deadlift w/ Chains", mode: "weight", group: "Lower", pattern: "Hinge", equipment: "Barbell" },
  { name: "Double Hurdle Hop onto Box", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Box/Bench" },
  { name: "Dynamic Band-Resisted Barbell RDL", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Band" },
  { name: "Pike-up", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Other" },
  { name: "Multi-Directional Push Up Start", mode: "sprint", group: "Speed" },
  { name: "Multi-Directional Rolling Push Up Start", mode: "sprint", group: "Speed" },
  { name: "Multi-Directional Broad Jump", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Bodyweight" },
  { name: "DB Goblet 4-Way Lunge", mode: "reps", group: "Lower", pattern: "Lunge", equipment: "Dumbbell" },
  { name: "Hanging 3-Way Leg Raise", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },

  // Added from the coach's 6-Day Blended Cube Method / CrossFit program.
  { name: "Snatch", mode: "weight", group: "Olympic", pattern: "Jump/Throw", equipment: "Barbell" },
  { name: "Clean", mode: "weight", group: "Olympic", pattern: "Jump/Throw", equipment: "Barbell" },
  { name: "Power Snatch", mode: "weight", group: "Olympic", pattern: "Jump/Throw", equipment: "Barbell" },
  { name: "Clean & Jerk", mode: "weight", group: "Olympic", pattern: "Jump/Throw", equipment: "Barbell" },
  { name: "GHD Sit-up", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Other" },
  { name: "Weighted Knee Raise", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Hanging Leg Raise", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Russian Twist", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Dips", mode: "reps", group: "Upper", pattern: "Push", equipment: "Bodyweight" },
  { name: "L-Sit Hold", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Plank Hold", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Burpees", mode: "reps", group: "Bodyweight", pattern: "Locomotion", equipment: "Bodyweight" },
  { name: "Air Squat", mode: "reps", group: "Lower", pattern: "Squat", equipment: "Bodyweight" },
  { name: "Kettlebell Swing", mode: "reps", group: "Lower", pattern: "Hinge", equipment: "Kettlebell" },
  { name: "Wall Ball", mode: "reps", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Med Ball" },
  { name: "Sit-up", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "DB Snatch", mode: "weight", group: "Olympic", pattern: "Jump/Throw", equipment: "Dumbbell" },
  { name: "Toes to Bar", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "Double Under", mode: "reps", group: "Speed", pattern: "Locomotion", equipment: "Other" },
  { name: "HSPU", mode: "reps", group: "Upper", pattern: "Push", equipment: "Bodyweight" },
  { name: "Run", mode: "reps", group: "Speed", pattern: "Locomotion", equipment: "Bodyweight" },
  { name: "Row", mode: "reps", group: "Speed", pattern: "Locomotion", equipment: "Cable/Machine" },
  { name: "Ring Dip", mode: "reps", group: "Upper", pattern: "Push", equipment: "Bodyweight" },
  { name: "Muscle-Up", mode: "reps", group: "Upper", pattern: "Pull", equipment: "Bodyweight" },
  { name: "Rope Climb", mode: "reps", group: "Upper", pattern: "Pull", equipment: "Other" },
  { name: "Turkish Get-Up", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Kettlebell" },
  { name: "Overhead Squat", mode: "weight", group: "Lower", pattern: "Squat", equipment: "Barbell" },
  { name: "Squat Clean", mode: "weight", group: "Olympic", pattern: "Squat", equipment: "Barbell" },
  { name: "Hang Power Clean", mode: "weight", group: "Olympic", pattern: "Hinge", equipment: "Barbell" },
  { name: "Push Jerk", mode: "weight", group: "Upper", pattern: "Push", equipment: "Barbell" },
  { name: "Pistol Squat", mode: "reps", group: "Lower", pattern: "Squat", equipment: "Bodyweight" },
  { name: "Thruster", mode: "weight", group: "Olympic", pattern: "Squat", equipment: "Barbell" },
  { name: "Sumo Deadlift High Pull", mode: "weight", group: "Lower", pattern: "Hinge", equipment: "Barbell" },
  { name: "Box Step-Up", mode: "reps", group: "Lower", pattern: "Lunge", equipment: "Box/Bench" },
  { name: "Weighted Box Step-Up", mode: "reps", group: "Lower", pattern: "Lunge", equipment: "Box/Bench" },
  { name: "Jumping Pull-Up", mode: "reps", group: "Upper", pattern: "Pull", equipment: "Bodyweight" },
  { name: "Walking Lunge", mode: "reps", group: "Lower", pattern: "Lunge", equipment: "Bodyweight" },
  { name: "Knees to Elbows", mode: "reps", group: "Bodyweight", pattern: "Rotation/Core", equipment: "Bodyweight" },
  { name: "43ft Sprint", mode: "sprint", group: "Speed" },
  { name: "Flying 15 Yard Sprint", mode: "sprint", group: "Speed" },
  { name: "Kneeling Med Ball Throw", mode: "measure", unit: "in", group: "Jumps/Throws", pattern: "Jump/Throw", equipment: "Med Ball" },
  { name: "Safety Bar Rear Foot Elevated Split Squat", mode: "weight", group: "Lower", pattern: "Lunge", equipment: "Barbell" },
  { name: "Mile Run", mode: "sprint", group: "Speed" },
  { name: "400 Meter Run", mode: "sprint", group: "Speed" },
  { name: "Dead Hang", mode: "reps", group: "Bodyweight", pattern: "Pull", equipment: "Bodyweight" },
];

// Custom entries win over the built-in library, so a coach's edit to a
// built-in movement (saved as a same-named custom override) actually
// takes effect everywhere this is used.
const exMeta = (name, custom = []) =>
  custom.find((e) => e.name === name) ||
  LIBRARY.find((e) => e.name === name) ||
  { name, mode: "weight", group: "Other" };

// Movement categories — shared by the exercise library editor, the
// session builder's exercise picker, and the athlete-facing Library tab.
const EX_GROUPS = ["Lower", "Upper", "Olympic", "Bodyweight", "Speed", "Power", "Jumps/Throws", "Mobility/Stretch", "Other"];

/* ---------------- math ---------------- */
function epley1RM(weight, reps) {
  if (!weight || !reps) return 0;
  if (reps === 1) return Math.round(weight);
  return Math.round(weight * (1 + reps / 30));
}
const round5 = (n) => Math.max(0, Math.round(n / 5) * 5);

function toMph(dist, unit, seconds) {
  if (!dist || !seconds) return 0;
  const meters = unit === "yd" ? dist * 0.9144 : unit === "ft" ? dist * 0.3048 : dist;
  return (meters / seconds) * 2.2369362921;
}
function toFps(dist, unit, seconds) {
  if (!dist || !seconds) return 0;
  const feet = unit === "yd" ? dist * 3 : unit === "ft" ? dist : dist * 3.280839895;
  return feet / seconds;
}

const PLATES = [45, 35, 25, 10, 5, 2.5];
const PLATE_COLOR = { 45: "#3B6FD6", 35: "#E8C13B", 25: "#4CA85C", 10: "#E7E4DC", 5: "#C24A3E", 2.5: "#8A93A3" };

function plateStack(total, bar = 45) {
  const perSide = (total - bar) / 2;
  if (perSide <= 0) return { plates: [], perSide: 0, exact: total === bar };
  let rem = perSide;
  const plates = [];
  for (const p of PLATES) {
    let n = 0;
    while (rem >= p - 0.001) { rem -= p; n++; }
    if (n) plates.push({ size: p, count: n });
  }
  return { plates, perSide, exact: rem < 0.01 };
}

/* ---------------- dates / school years ---------------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
// Local calendar date, deliberately not toISOString(): in Montana that rolls
// over at 6pm and would stamp an evening lift with tomorrow's date.
function iso(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}
const today = () => iso(new Date());

function fmtDate(s) {
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtLong(s) {
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
// School year runs Aug -> Jul. Returns the calendar year it starts in.
function schoolYearStart(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
}
const syLabel = (start) => `${start}–${String(start + 1).slice(2)}`;
// A 2027 grad is a senior in the 2026-27 year.
function gradeIn(gradYear, startYear) {
  if (!gradYear) return null;
  const g = 13 - (Number(gradYear) - startYear);
  return g >= 9 && g <= 12 ? g : null;
}
const GRADE_NAME = { 9: "Freshman", 10: "Sophomore", 11: "Junior", 12: "Senior" };
const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};

/* ---------------- storage ---------------- */
async function sGet(key) {
  try {
    const r = await window.storage.get(key, true);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function sSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); return true; }
  catch { return false; }
}
async function sDelete(key) {
  try { await window.storage.delete(key, true); return true; }
  catch { return false; }
}

/* ---------------- global style ---------------- */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      .d { font-family: 'Anton', Impact, sans-serif; letter-spacing: 0.02em; font-weight: 400; }
      .b { font-family: 'Inter', system-ui, sans-serif; }
      .sc::-webkit-scrollbar { width: 8px; height: 8px; }
      .sc::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      input, select, textarea, button { font-family: 'Inter', system-ui, sans-serif; }
      input[type=number] { -moz-appearance: textfield; }
      @keyframes pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
      .pop { animation: pop .4s cubic-bezier(.34,1.56,.64,1); }
      @keyframes rise { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
      .rise { animation: rise .3s ease-out both; }
      @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(248,181,51,.5) } 100% { box-shadow: 0 0 0 8px rgba(248,181,51,0) } }
      .ring { animation: pulseRing .9s ease-out; }
      .f:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
      @media (prefers-reduced-motion: reduce) { .pop, .rise, .ring { animation: none } }
    `}</style>
  );
}

/* ---------------- signature mark ----------------
   The school's actual Spartan helmet artwork, embedded directly (not
   redrawn) so it matches the real logo exactly.
------------------------------------------------- */
const SPARTAN_HELMET_SRC = "data:image/png;base64,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";

function Helmet({ size = 32 }) {
  return (
    <img
      src={SPARTAN_HELMET_SRC}
      alt="Sentinel Spartans helmet"
      width={size}
      height={Math.round(size * (223 / 216))}
      style={{ display: "block", objectFit: "contain" }}
      draggable={false}
    />
  );
}

/* ---------------- profile photos ----------------
   Photos live inline in the students record (persisted as one shared
   key), so every upload gets center-cropped to a small square and
   re-encoded as a compressed JPEG before it's stored — a phone photo
   straight off the camera can be several MB; this keeps each one to
   roughly 10-20KB so a full roster of photos never gets close to the
   storage size limit.
------------------------------------------------- */
// Six badge treatments built around the real Sentinel helmet mark —
// same artwork every time (so it never looks "off"), varied purple/gold
// framing so teachers and students can tell their own avatar apart at
// a glance without needing separate hand-drawn logos.
const AVATAR_STYLES = [
  { id: "classic", label: "Classic", bg: C.surfaceAlt, ring: C.border },
  { id: "royal", label: "Royal", bg: C.helmet, ring: C.accent },
  { id: "gold", label: "Gold", bg: C.accent, ring: C.helmet },
  { id: "midnight", label: "Midnight", bg: C.bg, ring: C.accent },
  { id: "sunburst", label: "Sunburst", bg: `linear-gradient(135deg, ${C.accent}, ${C.helmet})`, ring: C.text },
  { id: "steel", label: "Steel", bg: C.steel, ring: C.helmet },
];
const avatarStyleFor = (person) => AVATAR_STYLES.find((s) => s.id === (person && person.avatarStyle)) || AVATAR_STYLES[0];

function compressPhoto(file, size = 240, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("That doesn't look like an image."));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Shows a person's photo if they've set one, otherwise the helmet mark
// on their chosen avatar-style badge. Works for students and teachers.
function Avatar({ person, size = 38 }) {
  const style = avatarStyleFor(person);
  const shell = {
    width: size, height: size, borderRadius: size, flexShrink: 0, overflow: "hidden",
    background: style.bg, border: `2px solid ${style.ring}`,
    display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
  };
  if (person && person.photo) {
    return (
      <div style={shell}>
        <img src={person.photo} alt="" width={size} height={size} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
      </div>
    );
  }
  return <div style={shell}><Helmet size={Math.round(size * 0.54)} /></div>;
}

// Upload/remove control, plus the six preset avatar badges as a
// no-photo-needed alternative. Compression happens before onSetPhoto
// ever sees the file. Picking a style clears any photo, and vice versa
// — "photo or Spartan avatar" is meant as an either/or choice.
// Feet + inches picker, stored as a single total-inches number so the
// rest of the app (calorie calculator, anywhere else that might use
// it) only ever has to deal with one number.
function HeightPicker({ heightIn, onChange }) {
  const ft = heightIn ? Math.floor(heightIn / 12) : "";
  const inch = heightIn ? heightIn % 12 : "";
  const set = (newFt, newInch) => {
    const f = newFt === "" ? null : Number(newFt);
    const i = newInch === "" ? 0 : Number(newInch);
    onChange(f === null ? null : f * 12 + i);
  };
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <select value={ft} onChange={(e) => set(e.target.value, inch)} className="f" style={{ ...inputCss, width: "auto", fontSize: 12, padding: "5px 6px" }}>
        <option value="">—</option>
        {[4, 5, 6, 7].map((f) => <option key={f} value={f}>{f} ft</option>)}
      </select>
      <select value={inch} onChange={(e) => set(ft === "" ? 5 : ft, e.target.value)} disabled={ft === ""} className="f" style={{ ...inputCss, width: "auto", fontSize: 12, padding: "5px 6px" }}>
        {Array.from({ length: 12 }, (_, i) => i).map((i) => <option key={i} value={i}>{i} in</option>)}
      </select>
    </div>
  );
}

function AvatarPicker({ person, size = 84, onSetPhoto, onSetStyle }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setErr(null); setBusy(true);
    try {
      const dataUrl = await compressPhoto(file);
      onSetPhoto(dataUrl);
    } catch (ex) {
      setErr(ex.message || "Couldn't use that photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <Avatar person={person} size={size} />
          <button onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} className="f"
            style={{
              position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 28,
              background: C.accent, color: C.bg, border: `2px solid ${C.surface}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }} aria-label="Change photo">
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={pick} style={{ display: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Button size="sm" variant="subtle" icon={Camera} disabled={busy} onClick={() => fileRef.current && fileRef.current.click()}>
            {busy ? "Uploading…" : person && person.photo ? "Change photo" : "Add photo"}
          </Button>
          {person && person.photo && (
            <Button size="sm" variant="ghost" icon={X} onClick={() => onSetPhoto(null)}>Remove photo</Button>
          )}
          {err && <span style={{ fontSize: 11, color: C.bad }}>{err}</span>}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 8 }}>
          Or pick a Spartan avatar
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {AVATAR_STYLES.map((s) => {
            const active = !person?.photo && (person?.avatarStyle || "classic") === s.id;
            return (
              <button key={s.id} onClick={() => onSetStyle(s.id)} className="f" aria-label={s.label}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer", padding: 2,
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 40, background: s.bg, border: `2px solid ${s.ring}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  outline: active ? `2px solid ${C.text}` : "none", outlineOffset: 2,
                }}>
                  <Helmet size={21} />
                </div>
                <span style={{ fontSize: 9.5, color: active ? C.text : C.steel }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- primitives ---------------- */
function Button({ children, onClick, variant = "primary", icon: Icon, size = "md", full, style, disabled, ...rest }) {
  const pad = size === "sm" ? "7px 11px" : size === "lg" ? "14px 20px" : "10px 16px";
  const fs = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  const v = {
    primary: { background: C.accent, color: C.bg },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    subtle: { background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.bad, border: "1px solid #4A2A33" },
  }[variant];
  return (
    <button
      className="b f" onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, justifyContent: "center",
        padding: pad, borderRadius: 9, fontWeight: 700, fontSize: fs, lineHeight: 1.2,
        cursor: disabled ? "not-allowed" : "pointer", border: "1px solid transparent",
        opacity: disabled ? 0.45 : 1, width: full ? "100%" : undefined,
        transition: "transform .12s ease", ...v, ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...rest}
    >
      {Icon && <Icon size={fs + 2} />}
      {children}
    </button>
  );
}

const inputCss = {
  padding: "10px 12px", borderRadius: 9, border: `1px solid ${C.border}`,
  background: C.surfaceAlt, color: C.text, fontSize: 15, width: "100%",
};

function Field({ label, hint, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: C.steel, display: "block", marginTop: 4 }}>{hint}</span>}
    </label>
  );
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${glow ? C.accentBorder : C.border}`,
      borderRadius: 14, padding: 18, ...style,
    }}>{children}</div>
  );
}

function Eyebrow({ children, icon: Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {Icon && <Icon size={16} color={C.accent} />}
      <span className="d" style={{ fontSize: 17, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function Tabs({ tabs, value, onChange, scroll }) {
  return (
    <div className="sc" style={{
      display: "flex", gap: 6, marginBottom: 18, borderBottom: `1px solid ${C.border}`,
      paddingBottom: 10, overflowX: scroll ? "auto" : "visible",
    }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className="b f"
          style={{
            padding: "8px 13px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
            border: `1px solid ${value === t.id ? C.accentBorder : "transparent"}`,
            background: value === t.id ? C.accentDim : "transparent",
            color: value === t.id ? C.accent : C.textDim,
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Chip({ children, tone = "dim", onClick, active }) {
  const tones = {
    dim: { bg: C.surfaceAlt, fg: C.textDim, bd: C.border },
    gold: { bg: C.accentDim, fg: C.accent, bd: C.accentBorder },
    good: { bg: "rgba(95,191,139,.14)", fg: C.good, bd: "rgba(95,191,139,.4)" },
    warn: { bg: "rgba(232,165,75,.14)", fg: C.warn, bd: "rgba(232,165,75,.4)" },
    bad: { bg: "rgba(224,133,133,.14)", fg: C.bad, bd: "rgba(224,133,133,.4)" },
  }[active ? "gold" : tone];
  // Chips often sit inside a tappable row, so a non-interactive chip has to
  // be a span — a button nested in a button is invalid markup.
  const css = {
    display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 11,
    fontWeight: 700, letterSpacing: 0.3, background: tones.bg, color: tones.fg,
    border: `1px solid ${tones.bd}`, whiteSpace: "nowrap", lineHeight: 1.4,
  };
  if (!onClick) return <span style={css}>{children}</span>;
  return <button onClick={onClick} className="b f" style={{ ...css, cursor: "pointer" }}>{children}</button>;
}

function Empty({ children, icon: Icon }) {
  return (
    <div style={{
      color: C.textDim, fontSize: 13, background: C.surface, border: `1px dashed ${C.border}`,
      borderRadius: 12, padding: 20, display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5,
    }}>
      {Icon && <Icon size={17} color={C.steel} style={{ flexShrink: 0, marginTop: 1 }} />}
      <div>{children}</div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(12,6,20,.72)", zIndex: 60,
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="rise b" style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        width: "100%", maxWidth: wide ? 640 : 440, marginTop: 40, marginBottom: 40, color: C.text,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
          <span className="d" style={{ fontSize: 17, textTransform: "uppercase" }}>{title}</span>
          <button onClick={onClose} className="f" style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 2 }}>
            <X size={19} />
          </button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

// In-app stand-in for window.confirm(), which the artifact sandbox
// silently blocks — a click on a button wired to window.confirm looks
// like it does nothing, because the browser dialog never actually
// appears and the call falls straight through as "cancelled."
function ConfirmModal({ title = "Are you sure?", body, confirmLabel = "Delete", onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: C.textDim, lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="danger" icon={Trash2} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

/* The plate stack — this app's signature. Every load renders as real plates. */
function PlateBar({ weight, bar = 45, showText }) {
  const { plates, perSide, exact } = plateStack(weight, bar);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 26 }}>
        <div style={{ width: 7, height: 4, background: C.steel, borderRadius: 1 }} />
        {plates.length === 0 && weight > 0 && (
          <span style={{ fontSize: 10, color: C.steel, marginLeft: 3 }}>{weight <= bar ? "bar only" : "—"}</span>
        )}
        {plates.map(({ size, count }) =>
          Array.from({ length: count }).map((_, i) => (
            <div key={size + "-" + i} title={`${size} lb`} style={{
              width: size >= 25 ? 5 : 4, height: 9 + size * 0.34,
              background: PLATE_COLOR[size], borderRadius: 1,
            }} />
          ))
        )}
      </div>
      {showText && perSide > 0 && (
        <span style={{ fontSize: 11, color: exact ? C.textDim : C.warn }}>
          {perSide} per side{!exact ? " (round up)" : ""}
        </span>
      )}
    </div>
  );
}

/* Small inline trend line, used on progress screens. */
function Spark({ points, w = 92, h = 30, color = C.accent }) {
  if (!points || points.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (w - 2) + 1;
    const y = h - 2 - ((p - min) / span) * (h - 4);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Stat({ label, value, unit, tone }) {
  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px" }}>
      <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div className="d" style={{ fontSize: 24, color: tone || C.text, lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 12, color: C.textDim, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

function PinPad({ onSubmit, onCancel, label = "Enter your 4-digit code", error }) {
  const [pin, setPin] = useState("");
  const push = (n) => {
    const next = (pin + n).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => { onSubmit(next); setPin(""); }, 120);
  };
  return (
    <div>
      <p style={{ color: C.textDim, fontSize: 13, marginTop: 0, marginBottom: 14 }}>{label}</p>
      <div style={{ display: "flex", gap: 9, justifyContent: "center", marginBottom: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: 40, height: 48, borderRadius: 9, background: C.surfaceAlt,
            border: `1px solid ${pin.length === i ? C.accentBorder : C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="d" style={{ fontSize: 22, color: C.accent }}>{pin[i] ? "\u2022" : ""}</span>
          </div>
        ))}
      </div>
      {error && <p style={{ color: C.bad, fontSize: 12, textAlign: "center", marginTop: 0, marginBottom: 10 }}>{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
        {["1","2","3","4","5","6","7","8","9"].map((n) => (
          <Button key={n} variant="subtle" size="lg" onClick={() => push(n)} style={{ fontSize: 20 }}>{n}</Button>
        ))}
        <Button variant="ghost" size="lg" onClick={onCancel}>Back</Button>
        <Button variant="subtle" size="lg" onClick={() => push("0")} style={{ fontSize: 20 }}>0</Button>
        <Button variant="ghost" size="lg" onClick={() => setPin(pin.slice(0, -1))}>Del</Button>
      </div>
    </div>
  );
}

/* ===============================================================
   BLOCK MODEL
   A session is a list of blocks. Two kinds live side by side:

     sets     — structured work. Each movement keeps its own sets,
                reps, target and coaching cue. Two movements in one
                block is a superset, three is a tri-set.
     circuit  — freeform rounds on the clock. Completion tracking
                rather than load tracking, because that's how a
                circuit actually runs.

   Each structured movement carries one target metric, chosen by the
   coach: percent of max, absolute load, distance, time, bar velocity
   for VBT, or jump height.
================================================================ */
const CATEGORIES = ["Warm-Up", "Strength/Power", "Speed", "Conditioning", "Accessory", "Cool-Down"];
const blockLetter = (i) => String.fromCharCode(65 + i);
const PAIR_NAME = { 2: "Superset", 3: "Tri-set", 4: "Giant set" };

const METRICS = [
  { id: "pct", label: "% of max" },
  { id: "weight", label: "Weight (lb)" },
  { id: "velocity", label: "Velocity (m/s)" },
  { id: "distance", label: "Distance" },
  { id: "time", label: "Time (sec)" },
  { id: "height", label: "Height / distance" },
  { id: "none", label: "No target" },
];
const DIST_UNITS = ["yd", "m", "ft"];

const defaultMetric = (mode) =>
  mode === "sprint" ? "distance" : mode === "measure" ? "height" : mode === "reps" ? "none" : "pct";

function blankPrescription(exercise, custom) {
  const mode = exMeta(exercise, custom).mode;
  const meta = exMeta(exercise, custom);
  return {
    id: uid(), exercise, sets: 4, reps: mode === "sprint" || mode === "measure" ? "" : 5,
    repsMax: "", rirMin: "", rirMax: "", tempo: "", restSec: "",
    metric: defaultMetric(mode),
    pct: mode === "weight" ? 70 : "", load: "",
    dist: meta.dist || "", distUnit: meta.unit || "yd",
    timeSec: "", velMin: "", velMax: "", heightIn: "",
    note: "",
  };
}

// Older sessions had a flat exercise list, then blocks without a type.
// Bring both forward so everything downstream sees the same shape.
function normalizeProgram(p) {
  if (!p) return p;
  const blocks = Array.isArray(p.blocks)
    ? p.blocks
    : [{ id: uid(), category: "Strength/Power", exercises: p.exercises || [] }];
  return {
    ...p,
    blocks: blocks.map((b) => ({
      type: "sets", rounds: 3, workSec: 40, restSec: 20, note: "",
      ...b,
      exercises: (b.exercises || []).map((e) => ({
        metric: e.metric || (e.pct ? "pct" : e.load ? "weight" : defaultMetric(exMeta(e.exercise).mode)),
        distUnit: e.distUnit || exMeta(e.exercise).unit || "yd",
        dist: e.dist != null && e.dist !== "" ? e.dist : exMeta(e.exercise).dist || "",
        velMin: "", velMax: "", timeSec: "", heightIn: "",
        repsMax: "", rirMin: "", rirMax: "", tempo: "", restSec: "",
        ...e,
      })),
    })),
  };
}

/* ---------------- measurement formatting ---------------- */
function fmtHeight(totalIn) {
  if (totalIn == null || totalIn === "") return "—";
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round((totalIn - ft * 12) * 10) / 10;
  if (ft === 0) return `${inch}"`;
  return `${ft}' ${inch}"`;
}
const sprintDist = (presc, meta) => ({
  dist: presc && presc.dist ? Number(presc.dist) : meta.dist,
  unit: presc && presc.distUnit ? presc.distUnit : meta.unit || "yd",
});
function distToMeters(dist, unit) {
  if (!dist) return 0;
  if (unit === "yd") return dist * 0.9144;
  if (unit === "ft") return dist * 0.3048;
  return dist;
}

// A range reads as "8-12"; a single value as "8"; nothing prescribed
// falls back to null so callers can show "?" or omit it entirely.
function repsRangeText(presc) {
  if (!presc.reps) return null;
  const hasRange = presc.repsMax && String(presc.repsMax) !== String(presc.reps);
  return hasRange ? `${presc.reps}-${presc.repsMax}` : `${presc.reps}`;
}
// Reps in reserve target, e.g. "1-2 RIR" or "0 RIR" — the effort
// qualifier that makes a rep range mean something specific.
function rirTargetText(presc) {
  if (presc.rirMin === "" || presc.rirMin == null) return null;
  const hasRange = presc.rirMax && String(presc.rirMax) !== String(presc.rirMin);
  return `${hasRange ? `${presc.rirMin}-${presc.rirMax}` : presc.rirMin} RIR`;
}
// RPE and RIR are two names for the same dial, run in opposite
// directions — RPE 10 (max effort) is 0 RIR, RPE 9 is roughly 1 RIR,
// and so on. Showing both next to each other means an athlete can log
// in whichever language their coach's prescription used.
const RPE_TO_RIR = { 10: 0, 9: 1, 8: 2, 7: 3, 6: 4, 5: 5 };

/* What the athlete sees on the card: the resolved target, not the math. */
function prescriptionLine(presc, meta, myMax) {
  const sets = presc.sets || 1;
  const repsTxt = repsRangeText(presc);
  const rirTxt = rirTargetText(presc);
  const base = repsTxt ? `${sets} × ${repsTxt}` : `${sets} sets`;
  let line;
  switch (presc.metric) {
    case "pct": {
      const t = presc.pct && myMax ? round5((myMax * presc.pct) / 100) : null;
      line = t != null ? `${base} @ ${t} lb` : `${base} @ ${presc.pct || "?"}% of max`;
      break;
    }
    case "weight":
      line = presc.load ? `${base} @ ${presc.load} lb` : base;
      break;
    case "velocity":
      line = `${base} @ ${presc.velMin || "?"}–${presc.velMax || "?"} m/s`;
      break;
    case "distance": {
      const { dist, unit } = sprintDist(presc, meta);
      line = dist ? `${sets} × ${dist} ${unit}` : base;
      break;
    }
    case "time":
      line = presc.timeSec ? `${sets} × ${presc.timeSec} sec` : base;
      break;
    case "height":
      line = presc.heightIn ? `${sets} × target ${fmtHeight(Number(presc.heightIn))}` : `${sets} attempts`;
      break;
    default:
      line = base;
  }
  return rirTxt ? `${line}, ${rirTxt}` : line;
}
// Tempo/rest are shown as a small secondary line under the main
// prescription, since they qualify the set rather than define it.
function prescriptionDetail(presc) {
  const parts = [];
  if (presc.tempo) parts.push(`Tempo ${presc.tempo}`);
  if (presc.restSec) parts.push(`Rest ${presc.restSec}s`);
  return parts.length ? parts.join(" · ") : null;
}

// Resolved barbell load, when there is one. Drives the plate stack.
function resolvedLoad(presc, meta, myMax) {
  if (presc.metric === "pct" && presc.pct && myMax) return round5((myMax * presc.pct) / 100);
  if (presc.metric === "weight" && presc.load) return Number(presc.load);
  return null;
}

// Which input set the athlete gets. Metric wins over the movement's
// default mode, so a coach can time a squat or load a jump if they want.
function logKind(presc, meta) {
  if (presc.metric === "height" || (presc.metric === "none" && meta.mode === "measure")) return "height";
  if (presc.metric === "time" || (presc.metric === "none" && meta.mode === "sprint")) return "time";
  if (presc.metric === "distance") return meta.mode === "measure" ? "height" : "time";
  if (meta.mode === "reps" && presc.metric === "none") return "reps";
  if (meta.mode === "measure") return "height";
  if (meta.mode === "sprint") return "time";
  if (meta.mode === "reps") return "reps";
  return "load";
}

const allPrescriptions = (program) =>
  (program.blocks || []).flatMap((b, bi) =>
    (b.exercises || []).map((e, ei) => ({ ...e, tag: `${blockLetter(bi)}${ei + 1}`, category: b.category }))
  );

/* ===============================================================
   IMPROVEMENT — what fills the bars on the athlete's home screen
   Percent change from first logged effort to best, averaged inside
   each pillar. Needs two data points before it says anything.
================================================================ */
function improvementStats(logs, custom) {
  const byEx = {};
  for (const l of logs) (byEx[l.exercise] = byEx[l.exercise] || []).push(l);
  const pillars = { strength: [], speed: [], power: [] };
  for (const [name, ls] of Object.entries(byEx)) {
    const meta = exMeta(name, custom);
    if (ls.length < 2) continue;
    const sorted = [...ls].sort((a, b) => a.date.localeCompare(b.date));
    if (meta.mode === "weight") {
      const first = epley1RM(sorted[0].weight, sorted[0].reps);
      const best = Math.max(...ls.map((l) => epley1RM(l.weight, l.reps)));
      if (first) pillars.strength.push(((best - first) / first) * 100);
    } else if (meta.mode === "reps") {
      const first = sorted[0].reps, best = Math.max(...ls.map((l) => l.reps));
      if (first) pillars.strength.push(((best - first) / first) * 100);
    } else if (meta.mode === "sprint") {
      const first = sorted[0].seconds, best = Math.min(...ls.map((l) => l.seconds));
      if (first) pillars.speed.push(((first - best) / first) * 100);
    } else {
      const first = sorted[0].value, best = Math.max(...ls.map((l) => l.value));
      if (first) pillars.power.push(((best - first) / first) * 100);
    }
  }
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  return {
    strength: avg(pillars.strength),
    speed: avg(pillars.speed),
    power: avg(pillars.power),
    counted: pillars.strength.length + pillars.speed.length + pillars.power.length,
  };
}

const GOAL = { strength: 10, speed: 4, power: 8 }; // a good semester of movement, in percent

function FillBar({ label, pct, goal, hint }) {
  const ready = pct != null;
  const fill = ready ? Math.max(0, Math.min(1, pct / goal)) : 0;
  const tone = !ready ? C.border : pct > 0 ? C.accent : C.steel;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 9 }}>
        <span style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{label}</span>
        <span className="d" style={{ fontSize: 19, color: tone, lineHeight: 1 }}>
          {ready ? `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div style={{ height: 7, background: C.surfaceAlt, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{
          height: "100%", width: `${fill * 100}%`,
          background: `linear-gradient(90deg, ${C.accent}99, ${C.accent})`,
          borderRadius: 4, transition: "width .6s cubic-bezier(.4,1.3,.5,1)",
        }} />
      </div>
      <div style={{ fontSize: 10.5, color: C.steel, marginTop: 6, lineHeight: 1.4 }}>{ready ? hint : "Log it twice to start tracking"}</div>
    </div>
  );
}

function ProgressPillars({ logs, custom }) {
  const s = useMemo(() => improvementStats(logs, custom), [logs]);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))", gap: 9 }}>
        <FillBar label="Strength" pct={s.strength} goal={GOAL.strength} hint="Estimated max, since your first log" />
        <FillBar label="Speed" pct={s.speed} goal={GOAL.speed} hint="Time cut off your sprints" />
        <FillBar label="Power" pct={s.power} goal={GOAL.power} hint="Jumps and throws" />
      </div>
      {s.counted === 0 && (
        <div style={{ fontSize: 11.5, color: C.steel, marginTop: 9, lineHeight: 1.55 }}>
          These fill as you repeat movements. Nothing to compare against yet — log a lift, a sprint, or a jump twice and the bars start moving.
        </div>
      )}
    </div>
  );
}

/* Coaching cues, so a first-timer isn't guessing at the rack. */
const CUES = {
  "Back Squat": "Bar on the shelf of your back, not your neck. Sit between your hips, knees tracking over the middle of the foot, chest tall the whole way.",
  "Front Squat": "Elbows up and stay up. The moment they drop, the bar rolls forward.",
  "Goblet Squat": "Bell tight to the chest. Great first squat pattern before you touch a barbell.",
  "Split Squat": "Back knee straight down under the hip. Front shin stays close to vertical.",
  Deadlift: "Bar over mid-foot, shoulders slightly ahead of the bar. Push the floor away instead of yanking up.",
  "Trap Bar Deadlift": "Friendlier back angle than a straight bar. Stand tall, finish with the hips under you.",
  "Romanian Deadlift": "Push the hips back, soft knees, bar dragging the thighs. Stop when the hamstrings say stop.",
  "Hip Thrust": "Ribs down, squeeze the glutes at the top. No arching the low back to get higher.",
  "Bench Press": "Feet planted, shoulder blades pinched. Bar to the lower chest, elbows about 45 degrees from the body.",
  "Incline Bench Press": "Same rules as flat, bar meets the upper chest instead.",
  "Dumbbell Bench Press": "Lets each side work on its own. Good when one shoulder is cranky.",
  "Overhead Press": "Brace the middle, press the bar past the forehead, finish with biceps by the ears.",
  "Push Press": "Short dip from the legs, then drive. Legs start it, arms finish it.",
  "Barbell Row": "Hinge to about 45 degrees and hold it. Pull to the belly button, not the chest.",
  "Pendlay Row": "Bar returns to the floor between reps. Torso stays parallel — no rocking up to help.",
  "Lat Pulldown": "Chest up, drive the elbows down and back. Don't lean away to finish the rep.",
  "Power Clean": "Slow off the floor, explode at the hip, then get the elbows around fast.",
  "Hang Clean": "Start above the knee. Teaches the finish without the pull off the floor.",
  "Clean Pull": "Same pull as a clean, no catch. Load it up and be violent at the hip.",
  "Walking Lunges": "Long enough step that the back knee drops straight down. Torso stays stacked.",
  "Pull-Up": "Full hang to chin over the bar. Bands or a partner assist counts.",
  "Push-Up": "One straight line from ear to ankle. Elbows back at 45, not flared wide.",
  Dip: "Lean slightly forward, elbows back, stop where the shoulder still feels good.",
  "Max Effort Med Ball Chest Pass": "Throw it like you mean it. Every rep is a max effort or it isn't training power.",
  "Box Jump": "Land soft, knees tracking over toes, and stand all the way up on the box before stepping down. Step down, don't jump down.",
  "Depth Jump": "Step off, don't jump off. Land and get off the ground as fast as possible — this is about ground contact time, not jump height.",
  "Hurdle Hops": "Quick, quiet feet. Minimal ground contact time between hurdles — think springs, not squats.",
  "Single-Leg Bound": "Drive the knee, extend fully at the hip, and stick each landing before the next bound.",
  "Med Ball Backwards Scoop Throw": "Load the hips low, then throw the ball up and back over your head explosively. Full extension through the hips at release.",
  "Med Ball Rotational Throw": "Rotate from the hips, not just the arms. Load, then whip the ball off the back hip.",
  "Vertical Jump": "Load fast, arms swing hard, reach with one hand.",
  "Broad Jump": "Jump for distance and stick the landing. A stumble doesn't count.",
  "40 Yard Dash": "Push out low for the first ten, then run tall. Don't pop straight up out of the stance.",
  "Pro Agility (5-10-5)": "Get the hips low into the turn. Time is won on the two changes of direction, not the straight runs.",
  "300 Yard Shuttle": "Pace the first half. Everyone dies on the back half of this one.",
};

function LibraryTab({ exercises, custom }) {
  const [q, setQ] = useState("");
  const groups = EX_GROUPS;
  const match = (n) => n.toLowerCase().includes(q.toLowerCase());
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movements" className="f" style={{ ...inputCss, marginBottom: 16 }} />
      {groups.map((g) => {
        const items = exercises.filter((n) => exMeta(n, custom).group === g && match(n));
        if (!items.length) return null;
        return (
          <div key={g} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, marginBottom: 9 }}>{g}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((n) => (
                <div key={n} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: cueFor(n, custom) ? 5 : 0 }}>{n}</div>
                  {cueFor(n, custom) && <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.55 }}>{cueFor(n, custom)}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: 11, color: C.steel, lineHeight: 1.6 }}>
        Cues are reminders, not a substitute for coaching. If a movement hurts or you&rsquo;re unsure of the setup, get your teacher&rsquo;s eyes on it before you load it.
      </p>
    </div>
  );
}

/* ===============================================================
   READINESS CHECK-IN
   Volt and TeamBuildr both gate the session behind a short wellness
   survey. Four questions, one tap each. Body weight is optional and
   never shown to other students.
================================================================ */
const READINESS_Q = [
  { id: "sleep", label: "How did you sleep?", low: "Barely", high: "Great" },
  { id: "energy", label: "Energy right now?", low: "Empty", high: "Fired up" },
  { id: "soreness", label: "How sore are you?", low: "Wrecked", high: "Fresh" },
  { id: "stress", label: "Stress today?", low: "Maxed out", high: "Calm" },
];

function readinessScore(answers) {
  const vals = READINESS_Q.map((q) => answers[q.id]).filter((v) => v);
  if (vals.length < READINESS_Q.length) return null;
  const sum = READINESS_Q.reduce((acc, q) => acc + answers[q.id], 0);
  return Math.round(((sum - 4) / 16) * 100);
}
function readinessTone(score) {
  if (score == null) return "dim";
  if (score >= 65) return "good";
  if (score >= 40) return "warn";
  return "bad";
}

function CheckInCard({ existing, onSave }) {
  const [a, setA] = useState(existing ? existing.answers : {});
  const [bw, setBw] = useState(existing && existing.bodyweight ? String(existing.bodyweight) : "");
  const [saved, setSaved] = useState(!!existing);
  const score = readinessScore(a);

  const save = () => {
    if (score == null) return;
    onSave({ date: today(), answers: a, score, bodyweight: bw ? parseFloat(bw) : null });
    setSaved(true);
  };

  if (saved) {
    const s = existing ? existing.score : score;
    return (
      <Card>
        <Eyebrow icon={Heart}>Today&rsquo;s check-in</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div className="d" style={{ fontSize: 40, color: readinessTone(s) === "good" ? C.good : readinessTone(s) === "warn" ? C.warn : C.bad, lineHeight: 1 }}>
            {s}<span style={{ fontSize: 14, color: C.textDim }}>/100</span>
          </div>
          <div style={{ fontSize: 13, color: C.textDim, flex: 1, minWidth: 200, lineHeight: 1.5 }}>
            {s >= 65 && "Green light. Go after the prescribed loads today."}
            {s >= 40 && s < 65 && "Middling day. Hit your reps, but back off 5–10% if the bar feels heavy."}
            {s < 40 && "Rough day. Tell your coach — lighter loads and solid technique beat grinding through this one."}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSaved(false)}>Redo</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card glow>
      <Eyebrow icon={Heart}>Check in before you lift</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {READINESS_Q.map((q) => (
          <div key={q.id}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{q.label}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: C.steel, width: 52, textAlign: "right" }}>{q.low}</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setA({ ...a, [q.id]: q.invert ? 6 - n : n })} className="f"
                  style={{
                    flex: 1, height: 38, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
                    border: `1px solid ${(q.invert ? 6 - n : n) === a[q.id] ? C.accentBorder : C.border}`,
                    background: (q.invert ? 6 - n : n) === a[q.id] ? C.accentDim : C.surfaceAlt,
                    color: (q.invert ? 6 - n : n) === a[q.id] ? C.accent : C.textDim,
                  }}>{n}</button>
              ))}
              <span style={{ fontSize: 10, color: C.steel, width: 52 }}>{q.high}</span>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Field label="Body weight (optional)" hint="Only your coach sees this. Used for fluid replacement and pound-for-pound.">
              <input value={bw} onChange={(e) => setBw(e.target.value)} inputMode="decimal" placeholder="lb" className="f" style={inputCss} />
            </Field>
          </div>
          <Button onClick={save} disabled={score == null} icon={Check}>Start training</Button>
        </div>
      </div>
    </Card>
  );
}

/* ===============================================================
   REST TIMER — Hevy's pattern: completing a set starts the clock.
================================================================ */
function RestTimer({ seconds, onDone, onDismiss }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds]);
  useEffect(() => {
    if (left <= 0) { onDone && onDone(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const mm = Math.floor(Math.max(0, left) / 60);
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");
  const pct = Math.max(0, Math.min(1, left / seconds));
  return (
    <div className="rise" style={{
      position: "sticky", bottom: 0, zIndex: 30, marginTop: 14,
      background: C.surfaceAlt, border: `1px solid ${C.accentBorder}`, borderRadius: 12, padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Timer size={18} color={C.accent} />
        <span className="d" style={{ fontSize: 24, color: C.accent, minWidth: 66 }}>{mm}:{ss}</span>
        <span style={{ fontSize: 12, color: C.textDim, flex: 1 }}>Rest</span>
        <Button size="sm" variant="ghost" onClick={() => setLeft((l) => l + 15)}>+15s</Button>
        <Button size="sm" variant="subtle" onClick={onDismiss}>Skip</Button>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: C.accent, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

/* ===============================================================
   ONE MOVEMENT INSIDE A SESSION
   Two states: the card you read before you start, and the set rows
   you tap through on the floor. Which inputs appear depends on the
   metric the coach attached, so a sprint asks for seconds and shows
   mph, a jump asks for feet and inches, and a VBT lift asks for m/s.
================================================================ */
function TagBadge({ children, done, small }) {
  const d = small ? 26 : 34;
  return (
    <span className="d" style={{
      width: d, height: d, borderRadius: d / 2, flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: small ? 11 : 13, letterSpacing: 0.5,
      border: `1px solid ${done ? "rgba(95,191,139,.5)" : C.border}`,
      background: done ? "rgba(95,191,139,.14)" : "transparent",
      color: done ? C.good : C.textDim,
    }}>{children}</span>
  );
}

/* The bracket that marks a superset or tri-set without flattening the
   individual prescriptions inside it. */
function PairRail({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 22, flexShrink: 0, alignSelf: "stretch" }}>
      <div style={{ flex: 1, width: 2, background: C.accentBorder, borderRadius: 1 }} />
      <span style={{
        writingMode: "vertical-rl", fontSize: 8.5, letterSpacing: 1.1, fontWeight: 700,
        color: C.accent, textTransform: "uppercase", padding: "4px 0",
      }}>{label}</span>
      <div style={{ flex: 1, width: 2, background: C.accentBorder, borderRadius: 1 }} />
    </div>
  );
}

function TargetLine({ presc, meta, myMax }) {
  const load = resolvedLoad(presc, meta, myMax);
  return (
    <>
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginTop: 3 }}>
        {prescriptionLine(presc, meta, myMax)}
      </div>
      {presc.metric === "pct" && presc.pct && load != null && (
        <div style={{ fontSize: 11, color: C.steel, marginTop: 2 }}>{presc.pct}% of your tested max</div>
      )}
      {presc.metric === "pct" && presc.pct && load == null && (
        <div style={{ fontSize: 11, color: C.warn, marginTop: 3 }}>No max on file yet — ask your teacher, or start light and log it.</div>
      )}
      {presc.metric === "velocity" && (
        <div style={{ fontSize: 11, color: C.steel, marginTop: 2 }}>Keep the bar inside this range. Slower means the weight is too heavy for today.</div>
      )}
    </>
  );
}

function PrescriptionRow({ presc, meta, myMax, last }) {
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "13px 0", borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <TagBadge>{presc.tag}</TagBadge>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.25 }}>{presc.exercise}</div>
        <TargetLine presc={presc} meta={meta} myMax={myMax} />
        {presc.note && <div style={{ fontSize: 12, color: C.textDim, marginTop: 5, lineHeight: 1.5 }}>{presc.note}</div>}
      </div>
    </div>
  );
}

function ExerciseBlock({ presc, meta, prevBest, myMax, onLog, onRest, cue }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(() =>
    Array.from({ length: presc.sets || 1 }).map(() => ({ weight: "", reps: "", secs: "", ft: "", inch: "", vel: "", rpe: null, done: false, note: null }))
  );
  const [flash, setFlash] = useState(null);

  const kind = logKind(presc, meta);
  const target = resolvedLoad(presc, meta, myMax);
  const { dist, unit } = sprintDist(presc, meta);
  const setRow = (i, patch) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const doneCount = rows.filter((r) => r.done).length;
  const allDone = doneCount === rows.length;

  const complete = (i) => {
    const r = rows[i];
    if (kind === "time") {
      const secs = parseFloat(r.secs);
      if (!Number.isFinite(secs) || secs <= 0) return;
      onLog({ exercise: presc.exercise, mode: "sprint", seconds: secs, dist, unit });
      if (dist) setRow(i, { note: `${toMph(dist, unit, secs).toFixed(1)} mph` });
    } else if (kind === "height") {
      const total = (parseFloat(r.ft) || 0) * 12 + (parseFloat(r.inch) || 0);
      if (!Number.isFinite(total) || total <= 0) return;
      onLog({ exercise: presc.exercise, mode: "measure", value: total, unit: "in" });
      setRow(i, { note: fmtHeight(total) });
    } else if (kind === "reps") {
      const reps = Number(r.reps);
      if (!Number.isInteger(reps) || reps <= 0) return;
      onLog({ exercise: presc.exercise, mode: "reps", reps, rpe: r.rpe });
    } else {
      const w = parseFloat(r.weight), reps = Number(r.reps);
      if (!Number.isFinite(w) || w <= 0 || !Number.isInteger(reps) || reps <= 0) return;
      const vel = parseFloat(r.vel) || null;
      onLog({ exercise: presc.exercise, mode: "weight", weight: w, reps, rpe: r.rpe, vel });
      if (vel && presc.velMin && presc.velMax) {
        const lo = parseFloat(presc.velMin), hi = parseFloat(presc.velMax);
        setFlash(vel < lo ? `${vel} m/s is under the range — take weight off the bar.`
          : vel > hi ? `${vel} m/s is above the range — you can add weight.`
          : `${vel} m/s is right in the window.`);
        setTimeout(() => setFlash(null), 5000);
      } else if (r.rpe) {
        setFlash(r.rpe <= 6 ? "Felt easy — add 5–10 lb next set."
          : r.rpe >= 10 ? "That was everything — drop about 10% next set."
          : r.rpe === 9 ? "Near the edge. Hold this weight."
          : "Right in the zone. Hold or add 5 lb.");
        setTimeout(() => setFlash(null), 4000);
      }
    }
    setRow(i, { done: true });
    if (onRest) onRest();
  };

  const cellCss = { ...inputCss, padding: "7px 9px", fontSize: 14, flex: 1, minWidth: 0 };

  return (
    <div style={{ background: C.surface, border: `1px solid ${allDone ? "rgba(95,191,139,.35)" : C.border}`, borderRadius: 13, overflow: "hidden", flex: 1, minWidth: 0 }}>
      <button onClick={() => setOpen(!open)} className="f" style={{
        width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 15px",
        background: "none", border: "none", color: C.text, cursor: "pointer", textAlign: "left",
      }}>
        <TagBadge done={allDone}>{presc.tag}</TagBadge>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>{presc.exercise}</div>
          <div style={{ color: C.accent, fontWeight: 700, fontSize: 13.5, marginTop: 2 }}>
            {prescriptionLine(presc, meta, myMax)}
          </div>
          {prescriptionDetail(presc) && (
            <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 1 }}>{prescriptionDetail(presc)}</div>
          )}
        </div>
        <span style={{ fontSize: 11, color: allDone ? C.good : C.steel, fontWeight: 700, flexShrink: 0 }}>{doneCount}/{rows.length}</span>
        <ChevronRight size={17} color={C.steel} style={{ flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
      </button>

      {open && (
        <div style={{ padding: "0 15px 15px" }}>
          {presc.note && (
            <div style={{ fontSize: 12, color: C.text, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "8px 10px", marginBottom: 10, lineHeight: 1.5 }}>
              {presc.note}
            </div>
          )}
          {cue && (
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10, lineHeight: 1.5 }}>{cue}</div>
          )}
          {presc.metric === "velocity" && (
            <div style={{ fontSize: 12, color: C.accent, marginBottom: 10, fontWeight: 700 }}>
              Target bar speed {presc.velMin || "?"}–{presc.velMax || "?"} m/s
            </div>
          )}
          {rirTargetText(presc) && (
            <div style={{ fontSize: 12, color: C.accent, marginBottom: 10, fontWeight: 700 }}>
              Leave {rirTargetText(presc)} in the tank on every set — stop before that gets harder to judge, not after.
            </div>
          )}
          {prevBest && (
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>
              Last time: <span style={{ color: C.text, fontWeight: 700 }}>{prevBest}</span>
            </div>
          )}
          {target != null && <div style={{ marginBottom: 12 }}><PlateBar weight={target} showText /></div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {rows.map((r, i) => (
              <div key={i}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: r.done ? "rgba(95,191,139,.08)" : C.surfaceAlt,
                  border: `1px solid ${r.done ? "rgba(95,191,139,.3)" : C.border}`,
                  borderRadius: 9, padding: "7px 9px",
                }}>
                  <span className="d" style={{ width: 18, fontSize: 14, color: C.steel, flexShrink: 0 }}>{i + 1}</span>

                  {kind === "time" && (
                    <input value={r.secs} onChange={(e) => setRow(i, { secs: e.target.value })} disabled={r.done}
                      inputMode="decimal" placeholder={dist ? `sec for ${dist} ${unit}` : "seconds"} className="f" style={cellCss} />
                  )}

                  {kind === "height" && (
                    <>
                      <input value={r.ft} onChange={(e) => setRow(i, { ft: e.target.value })} disabled={r.done}
                        inputMode="numeric" placeholder="feet" className="f" style={cellCss} />
                      <input value={r.inch} onChange={(e) => setRow(i, { inch: e.target.value })} disabled={r.done}
                        inputMode="decimal" placeholder="inches" className="f" style={cellCss} />
                    </>
                  )}

                  {kind === "reps" && (
                    <input value={r.reps} onChange={(e) => setRow(i, { reps: e.target.value })} disabled={r.done}
                      inputMode="numeric" placeholder={repsRangeText(presc) || "reps"} className="f" style={cellCss} />
                  )}

                  {kind === "load" && (
                    <>
                      <input value={r.weight} onChange={(e) => setRow(i, { weight: e.target.value })} disabled={r.done}
                        inputMode="decimal" placeholder={target != null ? String(target) : "lb"} className="f" style={cellCss} />
                      <input value={r.reps} onChange={(e) => setRow(i, { reps: e.target.value })} disabled={r.done}
                        inputMode="numeric" placeholder={repsRangeText(presc) || "reps"} className="f" style={cellCss} />
                      {presc.metric === "velocity" ? (
                        <input value={r.vel} onChange={(e) => setRow(i, { vel: e.target.value })} disabled={r.done}
                          inputMode="decimal" placeholder="m/s" className="f" style={{ ...cellCss, flex: "0 0 72px" }} />
                      ) : (
                        <select value={r.rpe || ""} onChange={(e) => setRow(i, { rpe: e.target.value ? parseInt(e.target.value, 10) : null })}
                          disabled={r.done} className="f" title="How many reps did you have left in the tank?"
                          style={{ ...inputCss, padding: "7px 6px", fontSize: 13, width: 64, flexShrink: 0 }}>
                          <option value="">RPE</option>
                          {[10, 9, 8, 7, 6, 5].map((n) => <option key={n} value={n}>{n} · {RPE_TO_RIR[n]} RIR</option>)}
                        </select>
                      )}
                    </>
                  )}

                  <button onClick={() => complete(i)} disabled={r.done} className="f" style={{
                    width: 36, height: 34, borderRadius: 8, flexShrink: 0, cursor: r.done ? "default" : "pointer",
                    border: `1px solid ${r.done ? "rgba(95,191,139,.4)" : C.accentBorder}`,
                    background: r.done ? "rgba(95,191,139,.16)" : C.accentDim,
                    color: r.done ? C.good : C.accent, display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Check size={16} /></button>
                </div>
                {r.note && (
                  <div className="pop" style={{ fontSize: 11.5, color: C.accent, fontWeight: 700, padding: "4px 0 0 26px" }}>{r.note}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10 }}>
            <Button size="sm" variant="ghost" icon={Plus}
              onClick={() => setRows([...rows, { weight: "", reps: "", secs: "", ft: "", inch: "", vel: "", rpe: null, done: false, note: null }])}>
              Add set
            </Button>
          </div>

          {flash && (
            <div className="rise" style={{ marginTop: 10, fontSize: 12, color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "8px 10px" }}>{flash}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   CIRCUIT BLOCK — rounds on the clock, completion not load
================================================================ */
function CircuitBlock({ block, letter, onLogFree }) {
  const [done, setDone] = useState({});
  const [phase, setPhase] = useState(null); // { mode: 'work'|'rest', left }
  const rounds = block.rounds || 3;

  useEffect(() => {
    if (!phase) return;
    if (phase.left <= 0) {
      if (phase.mode === "work" && block.restSec) setPhase({ mode: "rest", left: block.restSec });
      else setPhase(null);
      return;
    }
    const t = setTimeout(() => setPhase({ ...phase, left: phase.left - 1 }), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const toggle = (exId, r) => {
    const k = `${exId}:${r}`;
    setDone((d) => ({ ...d, [k]: !d[k] }));
  };
  const total = (block.exercises || []).length * rounds;
  const count = Object.values(done).filter(Boolean).length;

  return (
    <div style={{ background: C.surface, border: `1px solid ${count === total && total ? "rgba(95,191,139,.35)" : C.border}`, borderRadius: 13, padding: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 4 }}>
        <TagBadge done={count === total && total > 0}>{letter}</TagBadge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Circuit</div>
          <div style={{ color: C.accent, fontWeight: 700, fontSize: 13.5, marginTop: 2 }}>
            {rounds} rounds
            {block.workSec ? ` · ${block.workSec}s work` : ""}
            {block.restSec ? ` / ${block.restSec}s rest` : ""}
          </div>
        </div>
        <span style={{ fontSize: 11, color: count === total && total ? C.good : C.steel, fontWeight: 700 }}>{count}/{total}</span>
      </div>

      {block.note && <div style={{ fontSize: 12, color: C.textDim, margin: "8px 0 0", lineHeight: 1.5 }}>{block.note}</div>}

      {block.workSec > 0 && (
        <div style={{ marginTop: 12 }}>
          {phase ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: phase.mode === "work" ? C.accentDim : C.surfaceAlt,
              border: `1px solid ${phase.mode === "work" ? C.accentBorder : C.border}`,
              borderRadius: 10, padding: "10px 13px",
            }}>
              <span className="d" style={{ fontSize: 24, color: phase.mode === "work" ? C.accent : C.textDim, minWidth: 42 }}>{phase.left}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: phase.mode === "work" ? C.accent : C.textDim, textTransform: "uppercase", letterSpacing: 1, flex: 1 }}>
                {phase.mode}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setPhase(null)}>Stop</Button>
            </div>
          ) : (
            <Button size="sm" variant="subtle" icon={Timer} onClick={() => setPhase({ mode: "work", left: block.workSec })}>
              Start the clock
            </Button>
          )}
        </div>
      )}

      <div className="sc" style={{ overflowX: "auto", marginTop: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0 8px 7px 0", fontSize: 9.5, color: C.steel, textTransform: "uppercase", letterSpacing: 0.8 }}>Movement</th>
              {Array.from({ length: rounds }, (_, r) => (
                <th key={r} style={{ padding: "0 3px 7px", fontSize: 9.5, color: C.steel, width: 34 }}>R{r + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(block.exercises || []).map((e) => (
              <tr key={e.id}>
                <td style={{ padding: "5px 8px 5px 0", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 600 }}>{e.exercise}</div>
                  {(e.reps || e.note) && (
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>
                      {e.reps ? `${e.reps} reps` : ""}{e.reps && e.note ? " · " : ""}{e.note || ""}
                    </div>
                  )}
                </td>
                {Array.from({ length: rounds }, (_, r) => {
                  const on = done[`${e.id}:${r}`];
                  return (
                    <td key={r} style={{ textAlign: "center", padding: "5px 3px", borderTop: `1px solid ${C.border}` }}>
                      <button onClick={() => toggle(e.id, r)} className="f" aria-label={`Round ${r + 1} ${e.exercise}`} style={{
                        width: 26, height: 26, borderRadius: 7, cursor: "pointer",
                        border: `1px solid ${on ? "rgba(95,191,139,.5)" : C.border}`,
                        background: on ? "rgba(95,191,139,.18)" : C.surfaceAlt,
                        color: on ? C.good : "transparent",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                      }}><Check size={14} /></button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===============================================================
   FREE LOG — anything not on today's card
================================================================ */
// A single, reusable exercise picker: looks like a plain text field,
// but focusing it opens a live-filtered, category-grouped dropdown of
// every known movement — type to narrow it down, or just keep typing
// past the list entirely for a one-off name that isn't in the library
// yet. Matches how TrainHeroic's own exercise field behaves.
function ExerciseCombobox({ value, exercises, custom, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (q ? exercises.filter((n) => n.toLowerCase().includes(q)) : exercises).slice(0, 60);
  const grouped = {};
  matches.forEach((n) => {
    const g = exMeta(n, custom).group;
    (grouped[g] = grouped[g] || []).push(n);
  });

  const pick = (name) => { setQuery(name); onChange(name); setOpen(false); };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Type or pick a movement…"}
        className="f" style={{ ...inputCss, fontSize: 14 }}
      />
      {open && matches.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: 8, maxHeight: 280, overflowY: "auto", zIndex: 60,
          boxShadow: "0 10px 28px rgba(0,0,0,.45)",
        }}>
          {Object.entries(grouped).map(([g, names]) => (
            <div key={g}>
              <div style={{ padding: "6px 10px", fontSize: 9.5, color: C.steel, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, background: C.surfaceAlt }}>{g}</div>
              {names.map((n) => (
                <button key={n} onMouseDown={(e) => { e.preventDefault(); pick(n); }} className="f"
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.text }}>
                  {n}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      {open && !matches.length && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", zIndex: 60, fontSize: 12, color: C.steel,
          boxShadow: "0 10px 28px rgba(0,0,0,.45)",
        }}>
          No matches — keep typing to use this as a new movement name.
        </div>
      )}
    </div>
  );
}

function FreeLog({ exercises, custom, onLog, onAddExercise, bare }) {
  const [name, setName] = useState("Back Squat");
  const meta = exMeta(name, custom);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [secs, setSecs] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [msg, setMsg] = useState(null);

  const submit = () => {
    if (!name.trim()) return;
    if (meta.mode === "weight") {
      const w = parseFloat(weight), r = Number(reps);
      if (!Number.isFinite(w) || w <= 0 || !Number.isInteger(r) || r <= 0) return;
      onLog({ exercise: name, mode: "weight", weight: w, reps: r });
      setMsg(`${name} — ${w} lb × ${r}`);
      setWeight(""); setReps("");
    } else if (meta.mode === "reps") {
      const r = Number(reps);
      if (!Number.isInteger(r) || r <= 0) return;
      onLog({ exercise: name, mode: "reps", reps: r });
      setMsg(`${name} — ${r} reps`);
      setReps("");
    } else if (meta.mode === "sprint") {
      const s = parseFloat(secs);
      if (!Number.isFinite(s) || s <= 0) return;
      const mph = toMph(meta.dist, meta.unit, s);
      onLog({ exercise: name, mode: "sprint", seconds: s, dist: meta.dist, unit: meta.unit });
      setMsg(`${name} — ${s.toFixed(2)}s · ${mph.toFixed(1)} mph`);
      setSecs("");
    } else {
      const total = (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
      if (!Number.isFinite(total) || total <= 0) return;
      onLog({ exercise: name, mode: "measure", value: total, unit: "in" });
      setMsg(`${name} — ${fmtHeight(total)}`);
      setFeet(""); setInches("");
    }
    onAddExercise(name.trim());
    setTimeout(() => setMsg(null), 3000);
  };

  const Shell = bare ? React.Fragment : Card;
  return (
    <Shell>
      {!bare && <Eyebrow icon={Dumbbell}>Log anything else</Eyebrow>}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <Field label="Movement">
          <ExerciseCombobox value={name} exercises={exercises} custom={custom} onChange={setName} />
        </Field>

        {meta.mode === "weight" && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Field label="Weight (lb)"><input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" className="f" style={inputCss} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Reps"><input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" className="f" style={inputCss} /></Field></div>
          </div>
        )}
        {meta.mode === "reps" && (
          <Field label="Reps"><input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" className="f" style={inputCss} /></Field>
        )}
        {meta.mode === "sprint" && (
          <Field label="Time (seconds)" hint={`${meta.dist} ${meta.unit} — converts to mph automatically`}>
            <input value={secs} onChange={(e) => setSecs(e.target.value)} inputMode="decimal" placeholder="e.g. 5.12" className="f" style={inputCss} />
          </Field>
        )}
        {meta.mode === "measure" && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Field label="Feet"><input value={feet} onChange={(e) => setFeet(e.target.value)} inputMode="numeric" placeholder="8" className="f" style={inputCss} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Inches" hint="Either box on its own is fine"><input value={inches} onChange={(e) => setInches(e.target.value)} inputMode="decimal" placeholder="4" className="f" style={inputCss} /></Field></div>
          </div>
        )}

        {meta.mode === "weight" && parseFloat(weight) > 0 && <PlateBar weight={parseFloat(weight)} showText />}
        {meta.mode === "measure" && ((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0)) > 0 && (
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
            {fmtHeight((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0))}
            <span style={{ color: C.textDim, fontWeight: 400 }}>
              {" · "}{((parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0)).toFixed(1)} in total
            </span>
          </div>
        )}
        {meta.mode === "sprint" && parseFloat(secs) > 0 && (
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
            {toMph(meta.dist, meta.unit, parseFloat(secs)).toFixed(1)} mph
            <span style={{ color: C.textDim, fontWeight: 400 }}> · {toFps(meta.dist, meta.unit, parseFloat(secs)).toFixed(1)} ft/s</span>
          </div>
        )}

        <Button onClick={submit} full>Save</Button>
        {msg && <div className="pop" style={{ fontSize: 13, color: C.accent, textAlign: "center" }}>{msg}</div>}
      </div>
    </Shell>
  );
}

/* ===============================================================
   PROGRESS — the four-year arc
   Every log carries its school year, so a senior can see freshman
   through senior bests side by side.
================================================================ */
// Consecutive days with at least one logged set, counting back from
// today (or yesterday, so a streak survives until the day is actually
// over). Shared by the athlete's own view, leaderboards, and badges.
function computeStreak(logs) {
  const days = [...new Set(logs.map((l) => l.date))].sort().reverse();
  if (!days.length) return 0;
  if (days[0] !== today() && days[0] !== addDays(today(), -1)) return 0;
  let n = 0, cursor = days[0];
  for (const d of days) {
    if (d === cursor) { n++; cursor = addDays(cursor, -1); }
    else if (d < cursor) break;
  }
  return n;
}

function latestBodyweight(studentId, db) {
  const cis = db.checkins[studentId] || [];
  const bw = [...cis].reverse().find((c) => c.bodyweight);
  return bw ? bw.bodyweight : null;
}
function bestScoreFor(studentId, exercise, db) {
  if (db.maxes[studentId] && db.maxes[studentId][exercise]) return db.maxes[studentId][exercise].value;
  const logs = (db.logs[studentId] || []).filter((l) => l.exercise === exercise && l.mode === "weight");
  if (!logs.length) return null;
  return Math.max(...logs.map((l) => epley1RM(l.weight, l.reps)));
}
// Unlike bestScoreFor (weight-mode 1RM only), this just asks "has the
// athlete recorded anything at all for this movement" — the right bar
// for a skill/speed/power test like a sprint or vertical jump, where
// there's no single "good" number to chase, only "did you test it."
function hasResult(studentId, exercise, db) {
  if (db.maxes[studentId] && db.maxes[studentId][exercise]) return true;
  return (db.logs[studentId] || []).some((l) => l.exercise === exercise);
}
// Best (highest) logged rep count for a bodyweight reps-mode movement —
// for a timed hold like Dead Hang or Plank, "reps" is seconds held, the
// same convention already used elsewhere in the app.
function bestRepsFor(studentId, exercise, db) {
  const logs = (db.logs[studentId] || []).filter((l) => l.exercise === exercise && l.mode === "reps");
  if (!logs.length) return null;
  return Math.max(...logs.map((l) => l.reps));
}
// Best (fastest/lowest) logged time for a sprint-mode movement.
function bestSprintTime(studentId, exercise, db) {
  const logs = (db.logs[studentId] || []).filter((l) => l.exercise === exercise && l.mode === "sprint");
  if (!logs.length) return null;
  return Math.min(...logs.map((l) => l.seconds));
}

// Training-focus tracks. A student picks one focus (Me tab, or at
// sign-up) and the badge wall shows only the track built for it — a
// kid who just wants to move more shouldn't be staring at "2.5x
// bodyweight deadlift" as their only option, and a competitive athlete
// chasing combine numbers shouldn't have to wade through "logged your
// first meal" to find what's relevant to them. A few badges are
// universal and show up regardless of track.
const TRAINING_GOALS = {
  athlete: { label: "Student Athlete", desc: "Training for sport performance — speed, power, and strength that transfers to the field." },
  strength: { label: "Get Stronger", desc: "Focused on the big lifts — bench, squat, deadlift." },
  active: { label: "Just Be Active", desc: "Building the habit — consistency and variety over chasing numbers." },
};

const BADGES = [
  // ---- universal ----
  { id: "first_pr", label: "First PR", desc: "Logged your first personal best", icon: Award, goals: ["all"],
    earned: (s, db) => Object.keys(bestByExercise(db.logs[s.id] || [], db.custom)).length >= 1 },
  { id: "streak5", label: "5-Day Streak", desc: "Logged 5 days in a row", icon: Flame, goals: ["all"],
    earned: (s, db) => computeStreak(db.logs[s.id] || []) >= 5 },
  { id: "streak20", label: "20-Day Streak", desc: "Logged 20 days in a row", icon: Flame, goals: ["all"],
    earned: (s, db) => computeStreak(db.logs[s.id] || []) >= 20 },

  // ---- Student Athlete: combine-style testing + relative strength ----
  { id: "ath_sprint43", label: "43ft Sprint", desc: "Logged a 43ft sprint time", icon: Zap, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "43ft Sprint", db) },
  { id: "ath_flying15", label: "Flying 15", desc: "Logged a flying 15-yard sprint time", icon: Zap, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "Flying 15 Yard Sprint", db) },
  { id: "ath_hangclean", label: "Hang Clean Tested", desc: "Logged a hang clean max", icon: TrendingUp, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "Hang Clean", db) },
  { id: "ath_powerclean", label: "Power Clean Tested", desc: "Logged a power clean max", icon: TrendingUp, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "Power Clean", db) },
  { id: "ath_vert", label: "Vertical Jump Tested", desc: "Logged a vertical jump", icon: Zap, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "Vertical Jump", db) },
  { id: "ath_broad", label: "Broad Jump Tested", desc: "Logged a broad jump", icon: Zap, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "Broad Jump", db) },
  { id: "ath_mbthrow", label: "Med Ball Throw Tested", desc: "Logged a kneeling med ball throw for distance", icon: Zap, goals: ["athlete"],
    earned: (s, db) => hasResult(s.id, "Kneeling Med Ball Throw", db) },
  // Ratios below use the same relative-strength research already
  // backing the Standards card (women's squat/bench/deadlift standards
  // run roughly 65-75% of men's at a comparable training level, with
  // deadlift the smallest gap since hip-dominant leverages favor
  // typical female anthropometry more than squat or bench do). Men's
  // thresholds are unchanged from before; women's are scaled from them
  // rather than left at the same absolute bar, since these should
  // measure a genuinely elite achievement for either sex, not a bar
  // that's realistic for men and out of reach for women by default.
  // Both are gated on gender actually being set — same reasoning as
  // the FitnessGram badges below: "not female" was never meant to
  // silently default to the men's number.
  { id: "ath_2x_squat", label: "Back Squat — Elite BW Ratio", desc: "2× bodyweight (boys) / 1.5× bodyweight (girls) back squat", icon: TrendingUp, goals: ["athlete"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const bw = latestBodyweight(s.id, db), sq = bestScoreFor(s.id, "Back Squat", db); if (!bw || !sq) return false; return sq >= bw * (s.gender === "F" ? 1.5 : 2); } },
  { id: "ath_25x_deadlift", label: "Deadlift — Elite BW Ratio", desc: "2.5× bodyweight (boys) / 1.75× bodyweight (girls) deadlift", icon: TrendingUp, goals: ["athlete"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const bw = latestBodyweight(s.id, db), dl = bestScoreFor(s.id, "Deadlift", db); if (!bw || !dl) return false; return dl >= bw * (s.gender === "F" ? 1.75 : 2.5); } },
  { id: "ath_15x_bench", label: "Bench Press — Elite BW Ratio", desc: "1.5× bodyweight (boys) / 1× bodyweight (girls) bench press", icon: TrendingUp, goals: ["athlete"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const bw = latestBodyweight(s.id, db), b = bestScoreFor(s.id, "Bench Press", db); if (!bw || !b) return false; return b >= bw * (s.gender === "F" ? 1.0 : 1.5); } },
  { id: "ath_2x_rfess", label: "Safety Bar RFESS — Elite BW Ratio", desc: "2× bodyweight (boys) / 1.5× bodyweight (girls) safety bar rear-foot-elevated split squat", icon: TrendingUp, goals: ["athlete"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const bw = latestBodyweight(s.id, db), r = bestScoreFor(s.id, "Safety Bar Rear Foot Elevated Split Squat", db); if (!bw || !r) return false; return r >= bw * (s.gender === "F" ? 1.5 : 2); } },

  // ---- Get Stronger: the big 3 ----
  { id: "str_bench_pr", label: "Bench PR", desc: "Logged a bench press personal best", icon: Award, goals: ["strength"],
    earned: (s, db) => hasResult(s.id, "Bench Press", db) },
  { id: "str_squat_pr", label: "Squat PR", desc: "Logged a back squat personal best", icon: Award, goals: ["strength"],
    earned: (s, db) => hasResult(s.id, "Back Squat", db) },
  { id: "str_deadlift_pr", label: "Deadlift PR", desc: "Logged a deadlift personal best", icon: Award, goals: ["strength"],
    earned: (s, db) => hasResult(s.id, "Deadlift", db) },
  { id: "str_big3", label: "Big 3 Club", desc: "Logged bench, squat, and deadlift at least once", icon: Dumbbell, goals: ["strength"],
    earned: (s, db) => hasResult(s.id, "Bench Press", db) && hasResult(s.id, "Back Squat", db) && hasResult(s.id, "Deadlift", db) },
  // General fitness benchmarks below sourced from the FitnessGram
  // Healthy Fitness Zone standards (Cooper Institute) for ages 16-18 —
  // the same test used in the Presidential Youth Fitness Program.
  // Mile run and push-up thresholds are gender-specific per that
  // standard; pull-ups and dead hang use a single widely-cited general
  // milestone rather than FitnessGram's own (much lower) modified-
  // pull-up bar, since this track is about pushing past "healthy
  // minimum" toward a real strength achievement.
  // The three gender-specific ones require gender to actually be set —
  // "not female" is never treated as "must be male." A student who
  // hasn't set it, or who set "prefer not to say," simply can't earn
  // these three specific badges yet rather than silently being scored
  // against the boys' standard by default.
  { id: "str_mile", label: "Mile Run — HFZ", desc: "Ran a mile under 7:00 (boys) / 8:00 (girls) — the FitnessGram Healthy Fitness Zone for your age. Needs gender set.", icon: Flame, goals: ["strength"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const t = bestSprintTime(s.id, "Mile Run", db); if (!t) return false; return s.gender === "F" ? t <= 480 : t <= 420; } },
  { id: "str_400", label: "400m Under 90 Seconds", desc: "Ran 400 meters in under 90 seconds", icon: Flame, goals: ["strength"],
    earned: (s, db) => { const t = bestSprintTime(s.id, "400 Meter Run", db); return !!(t && t <= 90); } },
  { id: "str_pushup", label: "Push-Up — HFZ", desc: "18+ push-ups (boys) / 7+ push-ups (girls) — the FitnessGram Healthy Fitness Zone for your age. Needs gender set.", icon: TrendingUp, goals: ["strength"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const r = bestRepsFor(s.id, "Push-Up", db); if (!r) return false; return s.gender === "F" ? r >= 7 : r >= 18; } },
  { id: "str_pullup5", label: "Strict Pull-Ups", desc: "10 strict, unbroken pull-ups (boys) / 5 (girls). Needs gender set.", icon: TrendingUp, goals: ["strength"],
    earned: (s, db) => { if (s.gender !== "M" && s.gender !== "F") return false; const r = bestRepsFor(s.id, "Pull-Up", db); if (!r) return false; return s.gender === "F" ? r >= 5 : r >= 10; } },
  { id: "str_deadhang", label: "90-Second Dead Hang", desc: "Held a dead hang from a bar for 90 seconds", icon: TrendingUp, goals: ["strength"],
    earned: (s, db) => { const r = bestRepsFor(s.id, "Dead Hang", db); return !!(r && r >= 90); } },

  // ---- Just Be Active: small, reachable, habit-building ----
  { id: "act_first_set", label: "First Set Logged", desc: "Logged your very first set", icon: Dumbbell, goals: ["active"],
    earned: (s, db) => (db.logs[s.id] || []).length >= 1 },
  { id: "act_streak3", label: "3-Day Streak", desc: "Logged 3 days in a row", icon: Flame, goals: ["active"],
    earned: (s, db) => computeStreak(db.logs[s.id] || []) >= 3 },
  { id: "act_variety5", label: "Tried 5 Movements", desc: "Logged 5 different movements", icon: Layers, goals: ["active"],
    earned: (s, db) => Object.keys(bestByExercise(db.logs[s.id] || [], db.custom)).length >= 5 },
  { id: "act_10sets", label: "10 Sets Logged", desc: "Logged 10 sets total", icon: Dumbbell, goals: ["active"],
    earned: (s, db) => (db.logs[s.id] || []).length >= 10 },
  { id: "act_checkin5", label: "Checked In 5 Times", desc: "Checked in on how you're feeling 5 times", icon: Gauge, goals: ["active"],
    earned: (s, db) => (db.checkins[s.id] || []).length >= 5 },
  { id: "act_fuel1", label: "Logged a Meal", desc: "Logged your first food entry", icon: Apple, goals: ["active"],
    earned: (s, db) => (db.fuelLogs[s.id] || []).some((r) => (r.foods || []).length > 0) },
  // Same movements as the Get Stronger track, but "did you try it" —
  // no threshold to clear, just showing up to the test at all.
  { id: "act_mile_tested", label: "Mile Run Tested", desc: "Logged a mile run time", icon: Flame, goals: ["active"],
    earned: (s, db) => hasResult(s.id, "Mile Run", db) },
  { id: "act_400_tested", label: "400m Tested", desc: "Logged a 400 meter run time", icon: Flame, goals: ["active"],
    earned: (s, db) => hasResult(s.id, "400 Meter Run", db) },
  { id: "act_pushup_tested", label: "Push-Up Test Tried", desc: "Logged a push-up max attempt", icon: Dumbbell, goals: ["active"],
    earned: (s, db) => hasResult(s.id, "Push-Up", db) },
  { id: "act_pullup_tested", label: "Pull-Up Test Tried", desc: "Logged a pull-up attempt", icon: Dumbbell, goals: ["active"],
    earned: (s, db) => hasResult(s.id, "Pull-Up", db) },
  { id: "act_deadhang_tested", label: "Dead Hang Tried", desc: "Logged a dead hang time", icon: Dumbbell, goals: ["active"],
    earned: (s, db) => hasResult(s.id, "Dead Hang", db) },
];
function earnedBadges(student, db) {
  const goal = student.trainingGoal;
  const relevant = BADGES.filter((b) => b.goals.includes("all") || (goal && b.goals.includes(goal)));
  return relevant.filter((b) => b.earned(student, db));
}
// Compact badge wall — earned badges lit up in gold, the rest shown
// dim so there's always something visible to chase next. Shows only
// the track built for the athlete's own stated training focus, plus
// a handful of universal ones, so the wall always feels relevant
// instead of like a spec sheet of numbers that don't apply to them.
// Monthly participation badges — one per calendar month across a
// student's assumed 4-year span (derived from graduation year: fall of
// freshman year through spring of senior year), earned by logging on
// at least 90% of the days a session was actually posted for their
// group that month. Months with nothing posted are skipped entirely —
// "90% of zero" isn't a bar anyone can clear or fail. Only months that
// have already happened are shown; the future doesn't get graded.
// Requires both a graduation year and a group to be set, since neither
// the 4-year span nor "sessions posted for them" can be known without both.
function monthlyParticipation(student, db) {
  if (!student.gradYear || !student.groupId) return [];
  const startYear = student.gradYear - 4; // approx start of freshman fall
  const months = [];
  let y = startYear, m = 7; // August
  for (let i = 0; i < 48; i++) {
    months.push({ y, m });
    m++; if (m > 11) { m = 0; y++; }
  }
  const now = new Date();
  const loggedDates = new Set((db.logs[student.id] || []).map((l) => l.date));
  const out = [];
  for (const { y, m } of months) {
    const monthStart = new Date(y, m, 1);
    if (monthStart > now) break;
    const monthEndExclusive = new Date(y, m + 1, 1);
    const inMonth = db.schedule.filter((s) => {
      if (!s.groupIds.includes(student.groupId)) return false;
      const d = new Date(s.date + "T12:00:00");
      return d >= monthStart && d < monthEndExclusive;
    });
    const uniqueDates = [...new Set(inMonth.map((s) => s.date))];
    if (!uniqueDates.length) continue;
    const hit = uniqueDates.filter((d) => loggedDates.has(d)).length;
    const rate = hit / uniqueDates.length;
    out.push({
      id: `month-${y}-${m}`,
      label: monthStart.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      fullLabel: monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      earned: rate >= 0.9,
      hit, total: uniqueDates.length, rate,
    });
  }
  return out;
}

function BadgeWall({ student, db, onSetGoal }) {
  if (!student.trainingGoal) {
    if (!onSetGoal) {
      return <p style={{ fontSize: 12.5, color: C.steel, margin: 0, lineHeight: 1.55 }}>This athlete hasn&rsquo;t picked a training focus yet — badges will show once they do, from their own Me tab.</p>;
    }
    return (
      <div>
        <p style={{ fontSize: 12.5, color: C.textDim, marginBottom: 12, lineHeight: 1.55 }}>
          Pick what you're training for and your badges will match it.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(TRAINING_GOALS).map(([id, g]) => (
            <button key={id} onClick={() => onSetGoal(id)} className="f" style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "11px 13px",
              background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>{g.label}</span>
              <span style={{ fontSize: 11.5, color: C.steel }}>{g.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  const goal = TRAINING_GOALS[student.trainingGoal];
  const shown = BADGES.filter((b) => b.goals.includes("all") || b.goals.includes(student.trainingGoal));
  const earned = new Set(earnedBadges(student, db).map((b) => b.id));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11.5, color: C.accent, fontWeight: 700 }}>{goal.label}</span>
        {onSetGoal && (
          <button onClick={() => onSetGoal(null)} className="f" style={{ background: "none", border: "none", color: C.steel, fontSize: 11, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Change focus
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 10 }}>
        {shown.map((b) => {
          const on = earned.has(b.id);
          const Icon = b.icon;
          return (
            <div key={b.id} title={b.desc} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: on ? 1 : 0.35 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 46, display: "flex", alignItems: "center", justifyContent: "center",
                background: on ? C.accentDim : C.surfaceAlt, border: `1.5px solid ${on ? C.accentBorder : C.border}`,
              }}>
                <Icon size={20} color={on ? C.accent : C.steel} />
              </div>
              <span style={{ fontSize: 9.5, color: on ? C.text : C.steel, textAlign: "center", lineHeight: 1.3 }}>{b.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11.5, color: C.accent, fontWeight: 700, marginBottom: 4 }}>Monthly Participation</div>
        <p style={{ fontSize: 11, color: C.steel, margin: "0 0 12px", lineHeight: 1.5 }}>
          One badge per month across your 4 years — earned by logging on at least 90% of the days your group had something posted. Months with nothing scheduled don't count either way.
        </p>
        {(() => {
          const months = monthlyParticipation(student, db);
          if (!student.gradYear || !student.groupId) {
            return <p style={{ fontSize: 11.5, color: C.steel, margin: 0 }}>Needs a graduation year and a group set to track this — ask your coach if either is missing.</p>;
          }
          if (!months.length) {
            return <p style={{ fontSize: 11.5, color: C.steel, margin: 0 }}>Nothing scheduled for your group yet this month — check back once your coach posts sessions.</p>;
          }
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(66px, 1fr))", gap: 8 }}>
              {months.map((mo) => (
                <div key={mo.id} title={`${mo.fullLabel}: logged ${mo.hit} of ${mo.total} posted days (${Math.round(mo.rate * 100)}%)`}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: mo.earned ? 1 : 0.35 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    background: mo.earned ? C.accentDim : C.surfaceAlt, border: `1.5px solid ${mo.earned ? C.accentBorder : C.border}`,
                  }}>
                    <CalendarCheck size={15} color={mo.earned ? C.accent : C.steel} />
                  </div>
                  <span style={{ fontSize: 8.5, color: mo.earned ? C.text : C.steel, textAlign: "center", lineHeight: 1.2 }}>{mo.label}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// General strength-standard tiers as a multiple of bodyweight — a
// widely-used reference framework, not a target or a claim about any
// individual. Framed for a beginner audience: the bottom tier is
// genuinely attainable within a season, not "elite."
const STANDARD_TIERS = ["Beginner", "Novice", "Intermediate", "Advanced"];
const STANDARDS = {
  "Back Squat": { M: [1.0, 1.25, 1.5, 1.75], F: [0.6, 0.75, 1.0, 1.25] },
  "Bench Press": { M: [0.75, 1.0, 1.25, 1.5], F: [0.4, 0.55, 0.75, 1.0] },
  "Deadlift": { M: [1.25, 1.5, 1.75, 2.0], F: [0.75, 1.0, 1.25, 1.5] },
  "Overhead Press": { M: [0.5, 0.65, 0.8, 1.0], F: [0.3, 0.4, 0.55, 0.7] },
};
function standardTierFor(ratio, tiers) {
  let tier = -1;
  for (let i = 0; i < tiers.length; i++) if (ratio >= tiers[i]) tier = i;
  return tier;
}
function StandardsCard({ student, db }) {
  const bw = latestBodyweight(student.id, db);
  // Was: silently fell back to the men's table for anyone who wasn't
  // explicitly "F" — including students who'd never set a gender at
  // all, or who chose "prefer not to say." Now: requires gender
  // actually be set to either M or F before showing a gendered
  // comparison at all, same as the bodyweight prompt below it.
  if (student.gender !== "M" && student.gender !== "F") {
    return <p style={{ fontSize: 12.5, color: C.steel, lineHeight: 1.55 }}>These reference standards are broken out by gender. Set yours in the Me tab to see a comparison — or skip this section entirely if you'd rather not.</p>;
  }
  const gender = student.gender;
  if (!bw) {
    return <p style={{ fontSize: 12.5, color: C.steel, lineHeight: 1.55 }}>Log a body weight on a check-in to see where you land against general strength standards.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(STANDARDS).map(([exercise, byGender]) => {
        const tiers = byGender[gender];
        const best = bestScoreFor(student.id, exercise, db);
        if (!best) return (
          <div key={exercise} style={{ opacity: 0.5 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{exercise}</div>
            <div style={{ fontSize: 11.5, color: C.steel }}>No {exercise.toLowerCase()} logged yet.</div>
          </div>
        );
        const ratio = best / bw;
        const tierIdx = standardTierFor(ratio, tiers);
        const nextTier = tierIdx + 1 < tiers.length ? tiers[tierIdx + 1] : null;
        return (
          <div key={exercise}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{exercise}</span>
              <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>{tierIdx >= 0 ? STANDARD_TIERS[tierIdx] : "Building up"}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: C.surfaceAlt, overflow: "hidden", display: "flex" }}>
              {STANDARD_TIERS.map((_, i) => (
                <div key={i} style={{ flex: 1, borderRight: i < 3 ? `1px solid ${C.bg}` : "none", background: i <= tierIdx ? C.accent : "transparent" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
              {ratio.toFixed(2)}× bodyweight{nextTier ? ` · ${nextTier.toFixed(2)}× reaches ${STANDARD_TIERS[tierIdx + 1]}` : " · at the top tier"}
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: 10.5, color: C.steel, lineHeight: 1.6, margin: 0 }}>
        A general reference some coaches use, not a target or a claim about you specifically — everyone&rsquo;s timeline is different.
      </p>
    </div>
  );
}

function bestByExercise(logs, custom) {
  const map = {};
  for (const l of logs) {
    const meta = exMeta(l.exercise, custom);
    let score, display;
    if (l.mode === "weight") { score = epley1RM(l.weight, l.reps); display = `${l.weight} lb × ${l.reps}`; }
    else if (l.mode === "reps") { score = l.reps; display = `${l.reps} reps`; }
    else if (l.mode === "sprint") { score = -l.seconds; display = `${l.seconds.toFixed(2)}s`; }
    else { score = l.value; display = `${l.value} ${l.unit || ""}`; }
    if (!map[l.exercise] || score > map[l.exercise].score) {
      map[l.exercise] = { score, display, log: l, mode: meta.mode };
    }
  }
  return map;
}

function PRBoard({ logs, custom }) {
  const best = useMemo(() => bestByExercise(logs, custom), [logs]);
  const entries = Object.entries(best);
  if (!entries.length) return <Empty icon={Award}>Nothing logged yet. Your bests land here the moment you finish a set.</Empty>;

  const order = { weight: 0, reps: 1, sprint: 2, measure: 3 };
  entries.sort((a, b) => (order[a[1].mode] - order[b[1].mode]) || (b[1].score - a[1].score));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
      {entries.map(([name, b]) => (
        <div key={name} className="rise" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "13px 14px" }}>
          <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5, fontWeight: 600 }}>{name}</div>
          <div className="d" style={{ fontSize: 23, color: C.accent, lineHeight: 1 }}>
            {b.mode === "weight" ? b.log.weight : b.mode === "sprint" ? b.log.seconds.toFixed(2) : b.mode === "reps" ? b.log.reps : b.log.value}
            <span style={{ fontSize: 11, color: C.textDim, marginLeft: 3 }}>
              {b.mode === "weight" ? "lb" : b.mode === "sprint" ? "s" : b.mode === "reps" ? "reps" : b.log.unit}
            </span>
          </div>
          <div style={{ fontSize: 11, color: C.steel, marginTop: 5 }}>
            {b.mode === "weight" && `× ${b.log.reps} · est max ${epley1RM(b.log.weight, b.log.reps)}`}
            {b.mode === "sprint" && `${toMph(b.log.dist, b.log.unit, b.log.seconds).toFixed(1)} mph`}
            {(b.mode === "reps" || b.mode === "measure") && fmtDate(b.log.date)}
          </div>
        </div>
      ))}
    </div>
  );
}

function YearOverYear({ logs, custom, gradYear }) {
  const data = useMemo(() => {
    const years = {};
    for (const l of logs) {
      const y = schoolYearStart(l.date);
      years[y] = years[y] || [];
      years[y].push(l);
    }
    const yearKeys = Object.keys(years).map(Number).sort();
    const names = [...new Set(logs.map((l) => l.exercise))];
    const rows = names.map((name) => {
      const meta = exMeta(name, custom);
      const cells = yearKeys.map((y) => {
        const ls = years[y].filter((l) => l.exercise === name);
        if (!ls.length) return null;
        if (meta.mode === "weight") return Math.max(...ls.map((l) => epley1RM(l.weight, l.reps)));
        if (meta.mode === "reps") return Math.max(...ls.map((l) => l.reps));
        if (meta.mode === "sprint") return Math.min(...ls.map((l) => l.seconds));
        return Math.max(...ls.map((l) => l.value));
      });
      return { name, meta, cells };
    }).filter((r) => r.cells.filter((c) => c != null).length > 0);
    return { yearKeys, rows };
  }, [logs]);

  if (data.yearKeys.length === 0) return <Empty icon={TrendingUp}>Once you have lifts on the board, this table fills in one column per school year.</Empty>;

  const change = (row) => {
    const vals = row.cells.filter((c) => c != null);
    if (vals.length < 2) return null;
    const first = vals[0], last = vals[vals.length - 1];
    const pct = row.meta.mode === "sprint" ? ((first - last) / first) * 100 : ((last - first) / first) * 100;
    return pct;
  };

  return (
    <div>
      {data.yearKeys.length === 1 && (
        <div style={{ fontSize: 12, color: C.steel, marginBottom: 12, lineHeight: 1.5 }}>
          One year on file so far. Keep logging and this becomes a four-year record you can show a college coach.
        </div>
      )}
      <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 380 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "11px 14px", color: C.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `1px solid ${C.border}` }}>Movement</th>
              {data.yearKeys.map((y) => {
                const g = gradeIn(gradYear, y);
                return (
                  <th key={y} style={{ textAlign: "right", padding: "11px 12px", color: C.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                    {syLabel(y)}
                    {g && <div style={{ color: C.steel, fontWeight: 400, marginTop: 2 }}>{GRADE_NAME[g]}</div>}
                  </th>
                );
              })}
              <th style={{ textAlign: "right", padding: "11px 14px", color: C.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `1px solid ${C.border}` }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const pct = change(row);
              return (
                <tr key={row.name}>
                  <td style={{ padding: "11px 14px", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>
                    {row.name}
                    <div style={{ fontSize: 10, color: C.steel, fontWeight: 400 }}>
                      {row.meta.mode === "weight" ? "est max, lb" : row.meta.mode === "sprint" ? "best time, s" : row.meta.mode === "reps" ? "best reps" : row.meta.unit}
                    </div>
                  </td>
                  {row.cells.map((c, i) => (
                    <td key={i} className="d" style={{ padding: "11px 12px", textAlign: "right", fontSize: 17, color: c == null ? C.border : C.text, borderBottom: `1px solid ${C.border}` }}>
                      {c == null ? "—" : row.meta.mode === "sprint" ? c.toFixed(2) : c}
                    </td>
                  ))}
                  <td style={{ padding: "11px 14px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>
                    {pct == null ? <span style={{ color: C.border }}>&mdash;</span> : (
                      <span className="d" style={{ fontSize: 16, color: pct > 0 ? C.good : pct < 0 ? C.bad : C.textDim }}>
                        {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExerciseHistory({ logs, custom, onPick }) {
  const names = useMemo(() => [...new Set(logs.map((l) => l.exercise))].sort(), [logs]);
  const [sel, setSel] = useState(names[0] || "");
  useEffect(() => { if (!sel && names.length) setSel(names[0]); }, [names]);
  if (!names.length) return null;

  const meta = exMeta(sel, custom);
  const series = logs.filter((l) => l.exercise === sel).sort((a, b) => a.date.localeCompare(b.date));
  const points = series.map((l) =>
    meta.mode === "weight" ? epley1RM(l.weight, l.reps) : meta.mode === "sprint" ? -l.seconds : meta.mode === "reps" ? l.reps : l.value
  );

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <Eyebrow icon={BarChart3}>Movement history</Eyebrow>
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          {names.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <Spark points={points} w={140} h={40} />
        <div style={{ fontSize: 12, color: C.textDim }}>
          {series.length} {series.length === 1 ? "entry" : "entries"}
          <div style={{ color: C.steel, fontSize: 11, marginTop: 2 }}>
            {meta.mode === "weight" ? "Estimated max over time" : meta.mode === "sprint" ? "Faster is higher" : "Best result over time"}
          </div>
        </div>
      </div>
      <div className="sc" style={{ maxHeight: 260, overflowY: "auto" }}>
        {[...series].reverse().map((l) => (
          <div key={l.id} onClick={() => onPick && onPick(l)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 2px",
            borderBottom: `1px solid ${C.border}`, fontSize: 13, cursor: onPick ? "pointer" : "default",
          }}>
            <span style={{ color: C.textDim, fontSize: 12 }}>{fmtDate(l.date)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {l.mode === "weight" && <PlateBar weight={l.weight} />}
              <span style={{ fontWeight: 700, minWidth: 88, textAlign: "right" }}>
                {l.mode === "weight" && `${l.weight} × ${l.reps}`}
                {l.mode === "reps" && `${l.reps} reps`}
                {l.mode === "sprint" && `${l.seconds.toFixed(2)}s`}
                {l.mode === "measure" && `${l.value} ${l.unit || ""}`}
              </span>
              {l.rpe && <Chip>RPE {l.rpe}</Chip>}
              {onPick && <Pencil size={12} color={C.steel} />}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ===============================================================
   FUELING
   Students run their own log: their own meals, their own entries.
   A small built-in reference of common foods can auto-fill macros,
   but there's no live external food database wired in here — this
   sandbox can't make outbound calls to something like USDA FoodData
   Central or Nutritionix, so anything not in the reference list is
   typed in by hand.
================================================================ */
const DEFAULT_MEAL_SLOTS = [
  { id: "breakfast", name: "Breakfast" },
  { id: "preworkout", name: "Pre-Workout Snack" },
  { id: "postworkout", name: "Post-Workout Snack" },
  { id: "lunch", name: "Lunch" },
  { id: "snacks", name: "Snacks" },
  { id: "dinner", name: "Dinner" },
  { id: "bedtime", name: "Bedtime Snack" },
];

// Meal slots that get their own settable clock time in the title row.
// (every meal slot gets its own settable time now — see render below)


// Quarter-hour options from 5:00 AM to 11:00 PM, stored as 24h "HH:MM".
const TIME_OPTIONS = (() => {
  const out = [];
  for (let m = 5 * 60; m <= 23 * 60; m += 15) {
    const h = Math.floor(m / 60), mm = m % 60;
    out.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return out;
})();
function fmtTimeOption(value) {
  const [h, m] = value.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}
function timeToMinutes(value) {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
// Formats an arbitrary computed minute offset as a clock time, rounded
// to the nearest 5 minutes and wrapped into a normal 24h day.
function minutesToClock(mins) {
  const wrapped = ((Math.round(mins / 5) * 5) % 1440 + 1440) % 1440;
  const h = Math.floor(wrapped / 60), m = wrapped % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

// A weight-only calorie estimate built on the Mifflin-St Jeor equation
// — the most widely validated BMR formula in general use — rather than
// a single per-pound multiplier just scaled differently by sex.
// Mifflin-St Jeor genuinely differs by sex in its constant term (real
// average differences in body composition at a given weight, not just
// a slope adjustment). Height and age are fixed at typical
// high-school-athlete averages (16 y/o; 5'9" male, 5'4" female) so the
// calculator can stay weight-only in the UI — an unusually tall/short
// or older/younger athlete will be less precise, which the disclaimer
// shown alongside this already covers.
// Flags a weight goal that represents a large swing from the athlete's
// own current weight — not a comparison against any population chart
// or BMI. A 6'5" 280lb lineman holding 280 and a 5'8" 190lb athlete
// aiming for a modest cut are both judged against their own number,
// never against each other. Thresholds are asymmetric on purpose:
// aggressive cuts carry more acute health risk than aggressive gains
// for a growing teen, so the loss-direction bar is tighter.
function weightGoalConcern(currentWeight, goalWeight) {
  if (!currentWeight || !goalWeight) return null;
  const pct = ((goalWeight - currentWeight) / currentWeight) * 100;
  if (pct <= -12) return { direction: "lose", pct: Math.round(Math.abs(pct)) };
  if (pct >= 25) return { direction: "gain", pct: Math.round(pct) };
  return null;
}

function estimateCalories({ weight, goalWeight, gender, heightIn }) {
  if (!weight || !gender) return null;
  const kg = weight * 0.453592;
  const ACTIVITY = 1.725; // "very active" tier — appropriate for an athlete training regularly
  // Real height when the student has set one — a 6'5" lineman and a
  // 5'8" athlete at the same weight have genuinely different energy
  // needs, and averaging them together was always an approximation.
  // Falls back to the old population-average assumption (5'9" male,
  // 5'4" female) only when height isn't on file.
  const cm = heightIn ? heightIn * 2.54 : (gender === "F" ? 163 : 175);
  // Mifflin-St Jeor BMR:  Men: 10·kg + 6.25·cm − 5·age + 5   Women: 10·kg + 6.25·cm − 5·age − 161
  const bmr = gender === "F"
    ? 10 * kg + 6.25 * cm - 5 * 16 - 161
    : 10 * kg + 6.25 * cm - 5 * 16 + 5;
  const maintenance = Math.round(bmr * ACTIVITY);
  let kcal = maintenance;
  let direction = "maintain";
  if (goalWeight && goalWeight <= weight - 2) {
    kcal = maintenance - 400;
    direction = "lose";
  } else if (goalWeight && goalWeight >= weight + 2) {
    kcal = maintenance + 350;
    direction = "gain";
  }
  const proteinPerLb = direction === "lose" ? 1.0 : direction === "gain" ? 0.95 : 0.85;
  const protein = Math.round(weight * proteinPerLb);
  return { kcal, protein, maintenance, direction };
}

// General timing guidance, computed relative to when the athlete says
// they train. Only covers the meals whose timing genuinely shifts
// around a workout — custom meals a student adds get no suggestion.
function mealRecommendation(mealId, workoutTime) {
  // Bedtime is tied to sleep, not training time, so it always has a tip.
  if (mealId === "bedtime") {
    return "A slow-digesting protein — casein, cottage cheese, or Greek yogurt — 30–60 min before bed supports overnight recovery.";
  }
  const w = timeToMinutes(workoutTime);
  if (w == null) return null;
  switch (mealId) {
    case "preworkout":
      return `Best 30–60 min before training — around ${minutesToClock(w - 60)}–${minutesToClock(w - 30)}.`;
    case "postworkout":
      return `Best within an hour after training — around ${minutesToClock(w)}–${minutesToClock(w + 60)}.`;
    case "breakfast":
      return w < 11 * 60
        ? `You train in the morning — 2–3 hrs before works well, around ${minutesToClock(w - 180)}–${minutesToClock(w - 120)}.`
        : `Eat well before you train — a normal morning breakfast is fine.`;
    case "lunch":
      return w >= 11 * 60 && w < 17 * 60
        ? `You train midday/afternoon — 2–3 hrs before works well, around ${minutesToClock(w - 180)}–${minutesToClock(w - 120)}.`
        : `A normal midday lunch — no strict tie to today's training time.`;
    case "dinner":
      return w >= 15 * 60
        ? `You train in the afternoon/evening — keep it light beforehand, then eat your full recovery dinner within an hour or two after, around ${minutesToClock(w + 30)}–${minutesToClock(w + 120)}.`
        : `Whenever works for your family — protein and veggies for recovery.`;
    default:
      return null;
  }
}

// The fixed windows from the coach's original Sentinel Spartan Strength
// eating plan — shown as the baseline recommendation on each meal, on
// top of (not instead of) the workout-relative tip above.
const PDF_MEAL_TIMES = {
  breakfast: "Typical window: 6:30 – 7:00 AM",
  preworkout: "No separate window in your plan — First Breakfast covers this",
  postworkout: "Typical window: 9:30 – 10:00 AM",
  lunch: "Typical window: 1:30 PM",
  snacks: "Typical window: 3:30 PM",
  dinner: "Typical window: 5:00 – 6:00 PM",
  bedtime: "Typical window: 9:00 – 10:00 PM",
};

// A small built-in reference so common staples auto-fill macros when
// typed. Not a live database — just enough to cover the usual suspects.
const COMMON_FOODS = [
  { name: "Greek yogurt (1 cup)", kcal: 150, protein: 25, carbs: 9, fat: 0 },
  { name: "Oatmeal (1 cup cooked)", kcal: 158, protein: 6, carbs: 27, fat: 3 },
  { name: "Banana", kcal: 105, protein: 1, carbs: 27, fat: 0 },
  { name: "Apple", kcal: 95, protein: 0, carbs: 25, fat: 0 },
  { name: "Peanut butter toast", kcal: 280, protein: 10, carbs: 30, fat: 14 },
  { name: "Bagel with cream cheese", kcal: 360, protein: 11, carbs: 50, fat: 13 },
  { name: "Uncrustable", kcal: 210, protein: 7, carbs: 26, fat: 9 },
  { name: "Chocolate milk (1 cup)", kcal: 190, protein: 8, carbs: 30, fat: 5 },
  { name: "Protein shake (1 scoop + milk)", kcal: 200, protein: 30, carbs: 10, fat: 3 },
  { name: "Breakfast burrito", kcal: 450, protein: 20, carbs: 40, fat: 22 },
  { name: "Turkey sandwich", kcal: 350, protein: 24, carbs: 38, fat: 10 },
  { name: "Chicken breast (6 oz)", kcal: 280, protein: 52, carbs: 0, fat: 6 },
  { name: "Ground beef (6 oz, 85/15)", kcal: 430, protein: 42, carbs: 0, fat: 28 },
  { name: "White rice (1 cup cooked)", kcal: 205, protein: 4, carbs: 45, fat: 0 },
  { name: "Pasta (1 cup cooked)", kcal: 220, protein: 8, carbs: 43, fat: 1 },
  { name: "Baked potato", kcal: 160, protein: 4, carbs: 37, fat: 0 },
  { name: "Eggs (2 large)", kcal: 140, protein: 12, carbs: 1, fat: 10 },
  { name: "Cottage cheese (1 cup)", kcal: 220, protein: 25, carbs: 8, fat: 10 },
  { name: "Cheese slice", kcal: 110, protein: 7, carbs: 1, fat: 9 },
  { name: "Almonds (1 oz)", kcal: 165, protein: 6, carbs: 6, fat: 14 },
  { name: "Peanut butter (2 tbsp)", kcal: 190, protein: 8, carbs: 7, fat: 16 },
  { name: "Mixed berries (1 cup)", kcal: 65, protein: 1, carbs: 15, fat: 0 },
  { name: "Broccoli (1 cup)", kcal: 55, protein: 4, carbs: 11, fat: 0 },
  { name: "Salad with dressing", kcal: 180, protein: 3, carbs: 10, fat: 14 },
  { name: "Pizza slice", kcal: 285, protein: 12, carbs: 36, fat: 10 },
  { name: "Protein bar", kcal: 220, protein: 20, carbs: 24, fat: 8 },
  { name: "Granola bar", kcal: 140, protein: 3, carbs: 22, fat: 5 },
  { name: "Bacon (2 slices)", kcal: 90, protein: 6, carbs: 0, fat: 7 },
  { name: "Avocado (half)", kcal: 120, protein: 1, carbs: 6, fat: 11 },
  { name: "Whole milk (1 cup)", kcal: 150, protein: 8, carbs: 12, fat: 8 },

  // Expanded reference, merged in from the coach's larger food list.
  { name: "Egg white", kcal: 17, protein: 4, carbs: 0, fat: 0 },
  { name: "Sausage link", kcal: 85, protein: 4, carbs: 0, fat: 7 },
  { name: "Sausage patty", kcal: 100, protein: 5, carbs: 0, fat: 8 },
  { name: "Toast, white (1 slice)", kcal: 75, protein: 3, carbs: 14, fat: 0 },
  { name: "Toast, wheat (1 slice)", kcal: 80, protein: 4, carbs: 14, fat: 0 },
  { name: "English muffin", kcal: 130, protein: 5, carbs: 25, fat: 0 },
  { name: "Cereal (1 cup)", kcal: 120, protein: 2, carbs: 26, fat: 0 },
  { name: "Pancake (1 medium)", kcal: 90, protein: 3, carbs: 14, fat: 3 },
  { name: "Waffle", kcal: 95, protein: 3, carbs: 15, fat: 3 },
  { name: "Hash browns (1 cup)", kcal: 210, protein: 3, carbs: 25, fat: 0 },
  { name: "Muffin", kcal: 340, protein: 5, carbs: 55, fat: 12 },
  { name: "Donut", kcal: 250, protein: 3, carbs: 30, fat: 12 },
  { name: "Biscuit", kcal: 200, protein: 4, carbs: 26, fat: 8 },
  { name: "PB&J sandwich", kcal: 375, protein: 13, carbs: 48, fat: 0 },
  { name: "Ham sandwich", kcal: 360, protein: 21, carbs: 42, fat: 0 },
  { name: "Tuna sandwich", kcal: 400, protein: 25, carbs: 40, fat: 0 },
  { name: "Grilled cheese", kcal: 400, protein: 16, carbs: 34, fat: 22 },
  { name: "Chicken sandwich", kcal: 440, protein: 28, carbs: 40, fat: 0 },
  { name: "Cheeseburger", kcal: 520, protein: 28, carbs: 42, fat: 27 },
  { name: "Hot dog", kcal: 150, protein: 5, carbs: 2, fat: 13 },
  { name: "Bean & cheese burrito", kcal: 450, protein: 18, carbs: 60, fat: 0 },
  { name: "Quesadilla", kcal: 500, protein: 22, carbs: 40, fat: 0 },
  { name: "Chicken wrap", kcal: 420, protein: 25, carbs: 40, fat: 0 },
  { name: "Chicken nuggets (6)", kcal: 270, protein: 14, carbs: 16, fat: 17 },
  { name: "Mac and cheese (1 cup)", kcal: 310, protein: 12, carbs: 40, fat: 0 },
  { name: "Chili (1 cup)", kcal: 280, protein: 20, carbs: 25, fat: 0 },
  { name: "Ramen (1 pack)", kcal: 380, protein: 8, carbs: 54, fat: 0 },
  { name: "Sushi roll (1 roll)", kcal: 250, protein: 9, carbs: 38, fat: 0 },
  { name: "Chicken noodle soup (1 cup)", kcal: 120, protein: 7, carbs: 15, fat: 0 },
  { name: "Chicken thigh (4 oz)", kcal: 230, protein: 26, carbs: 0, fat: 0 },
  { name: "Steak (4 oz)", kcal: 250, protein: 32, carbs: 0, fat: 0 },
  { name: "Pork chop (4 oz)", kcal: 230, protein: 30, carbs: 0, fat: 0 },
  { name: "Salmon (4 oz)", kcal: 230, protein: 25, carbs: 0, fat: 0 },
  { name: "Tuna, canned (1 can)", kcal: 140, protein: 30, carbs: 0, fat: 0 },
  { name: "Hamburger patty (4 oz)", kcal: 280, protein: 26, carbs: 0, fat: 0 },
  { name: "Deli turkey (2 oz)", kcal: 60, protein: 10, carbs: 2, fat: 0 },
  { name: "Deli ham (2 oz)", kcal: 70, protein: 10, carbs: 1, fat: 0 },
  { name: "Tofu (4 oz)", kcal: 95, protein: 10, carbs: 3, fat: 0 },
  { name: "Black beans (1 cup)", kcal: 227, protein: 15, carbs: 41, fat: 0 },
  { name: "Lentils (1 cup)", kcal: 230, protein: 18, carbs: 40, fat: 0 },
  { name: "Brown rice (1 cup)", kcal: 215, protein: 5, carbs: 45, fat: 0 },
  { name: "French fries (medium order)", kcal: 365, protein: 4, carbs: 48, fat: 0 },
  { name: "Flour tortilla", kcal: 140, protein: 4, carbs: 24, fat: 0 },
  { name: "Bread roll", kcal: 120, protein: 4, carbs: 22, fat: 0 },
  { name: "Rice cakes (2)", kcal: 70, protein: 1, carbs: 15, fat: 0 },
  { name: "Milk, 2% (1 cup)", kcal: 122, protein: 8, carbs: 12, fat: 0 },
  { name: "Milk, whole (1 cup)", kcal: 150, protein: 8, carbs: 12, fat: 0 },
  { name: "Yogurt, regular (1 cup)", kcal: 150, protein: 9, carbs: 25, fat: 0 },
  { name: "String cheese", kcal: 80, protein: 7, carbs: 1, fat: 0 },
  { name: "Orange", kcal: 62, protein: 1, carbs: 15, fat: 0 },
  { name: "Grapes (1 cup)", kcal: 104, protein: 1, carbs: 27, fat: 0 },
  { name: "Strawberries (1 cup)", kcal: 49, protein: 1, carbs: 12, fat: 0 },
  { name: "Blueberries (1 cup)", kcal: 84, protein: 1, carbs: 21, fat: 0 },
  { name: "Watermelon (1 cup)", kcal: 46, protein: 1, carbs: 12, fat: 0 },
  { name: "Raisins (1/4 cup)", kcal: 108, protein: 1, carbs: 29, fat: 0 },
  { name: "Green beans (1 cup)", kcal: 44, protein: 2, carbs: 10, fat: 0 },
  { name: "Corn (1 cup)", kcal: 130, protein: 5, carbs: 27, fat: 0 },
  { name: "Carrots (1 cup)", kcal: 52, protein: 1, carbs: 12, fat: 0 },
  { name: "Bell pepper", kcal: 30, protein: 1, carbs: 7, fat: 0 },
  { name: "Cucumber (1 cup)", kcal: 16, protein: 1, carbs: 4, fat: 0 },
  { name: "Side salad with ranch", kcal: 180, protein: 3, carbs: 10, fat: 0 },
  { name: "Trail mix (1/4 cup)", kcal: 175, protein: 5, carbs: 16, fat: 11 },
  { name: "Chips (1 oz)", kcal: 155, protein: 2, carbs: 15, fat: 10 },
  { name: "Pretzels (1 oz)", kcal: 110, protein: 3, carbs: 23, fat: 0 },
  { name: "Cheese crackers (1 pack)", kcal: 200, protein: 4, carbs: 24, fat: 8 },
  { name: "Popcorn (3 cups)", kcal: 90, protein: 3, carbs: 18, fat: 3 },
  { name: "Hummus (2 tbsp)", kcal: 70, protein: 2, carbs: 6, fat: 3 },
  { name: "Cookie", kcal: 160, protein: 2, carbs: 21, fat: 7 },
  { name: "Ice cream (1/2 cup)", kcal: 205, protein: 4, carbs: 24, fat: 11 },
  { name: "Candy bar", kcal: 250, protein: 4, carbs: 30, fat: 12 },
  { name: "Fruit snacks (1 pack)", kcal: 80, protein: 0, carbs: 19, fat: 0 },
  { name: "Smoothie (16 oz)", kcal: 290, protein: 8, carbs: 60, fat: 0 },
  { name: "Sports drink (20 oz)", kcal: 125, protein: 0, carbs: 35, fat: 0 },
  { name: "Soda (12 oz)", kcal: 140, protein: 0, carbs: 39, fat: 0 },
  { name: "Orange juice (1 cup)", kcal: 110, protein: 2, carbs: 26, fat: 0 },
  { name: "Jam (1 tbsp)", kcal: 56, protein: 0, carbs: 14, fat: 0 },
  { name: "Honey (1 tbsp)", kcal: 64, protein: 0, carbs: 17, fat: 0 },
  { name: "Syrup (2 tbsp)", kcal: 105, protein: 0, carbs: 27, fat: 0 },
  { name: "Ranch (2 tbsp)", kcal: 130, protein: 1, carbs: 2, fat: 13 },
  { name: "Mayo (1 tbsp)", kcal: 94, protein: 0, carbs: 0, fat: 10 },
  { name: "Ketchup (1 tbsp)", kcal: 17, protein: 0, carbs: 5, fat: 0 },
  { name: "Olive oil (1 tbsp)", kcal: 119, protein: 0, carbs: 0, fat: 14 },
  { name: "Gravy (1/4 cup)", kcal: 50, protein: 1, carbs: 6, fat: 3 },

  // Costco frozen items, snacks, produce, and meat cuts.
  { name: "Kirkland Wild Sockeye Salmon (6 oz)", kcal: 220, protein: 38, carbs: 0, fat: 8 },
  { name: "Kirkland Turkey Burger (1 patty)", kcal: 200, protein: 22, carbs: 0, fat: 11 },
  { name: "Kirkland Beef Burger (1 patty)", kcal: 340, protein: 20, carbs: 0, fat: 28 },
  { name: "Columbus Turkey Burger (1 patty)", kcal: 180, protein: 30, carbs: 1, fat: 6 },
  { name: "Bibigo Chicken Dumplings (6 + sauce)", kcal: 275, protein: 16, carbs: 40, fat: 7 },
  { name: "Kirkland Three Berry Blend, frozen (1 cup)", kcal: 70, protein: 2, carbs: 16, fat: 0 },
  { name: "Costco Orange Chicken (1 cup)", kcal: 380, protein: 15, carbs: 40, fat: 18 },
  { name: "Popcorn, air-popped (3 cups)", kcal: 93, protein: 3, carbs: 19, fat: 1 },
  { name: "Tortilla chips (1 oz)", kcal: 140, protein: 2, carbs: 18, fat: 7 },
  { name: "Fruit snacks (1 pouch)", kcal: 80, protein: 0, carbs: 21, fat: 0 },
  { name: "Beef jerky (1 oz)", kcal: 116, protein: 9, carbs: 3, fat: 7 },
  { name: "String cheese (1 stick)", kcal: 80, protein: 7, carbs: 1, fat: 6 },
  { name: "Hummus with veggies (1/4 cup + veg)", kcal: 140, protein: 5, carbs: 14, fat: 8 },
  { name: "Crackers (10)", kcal: 130, protein: 2, carbs: 20, fat: 4 },
  { name: "Tortilla chips with salsa", kcal: 220, protein: 3, carbs: 32, fat: 8 },
  { name: "Dark chocolate (1 oz)", kcal: 155, protein: 2, carbs: 13, fat: 11 },
  { name: "Sweet potato, baked (1 medium)", kcal: 112, protein: 2, carbs: 26, fat: 0 },
  { name: "Spinach, raw (2 cups)", kcal: 14, protein: 2, carbs: 2, fat: 0 },
  { name: "Bell pepper (1 medium)", kcal: 30, protein: 1, carbs: 7, fat: 0 },
  { name: "Cucumber (1 cup sliced)", kcal: 16, protein: 1, carbs: 4, fat: 0 },
  { name: "Avocado (1/2)", kcal: 120, protein: 1, carbs: 6, fat: 11 },
  { name: "Mango (1 cup)", kcal: 99, protein: 1, carbs: 25, fat: 0 },
  { name: "Pineapple (1 cup)", kcal: 83, protein: 1, carbs: 22, fat: 0 },
  { name: "Cherry tomatoes (1 cup)", kcal: 27, protein: 1, carbs: 6, fat: 0 },
  { name: "Asparagus (1 cup)", kcal: 27, protein: 3, carbs: 5, fat: 0 },
  { name: "Chicken thigh, skinless (6 oz)", kcal: 280, protein: 40, carbs: 0, fat: 12 },
  { name: "Salmon fillet (6 oz)", kcal: 350, protein: 39, carbs: 0, fat: 21 },
  { name: "Pork chop (6 oz)", kcal: 340, protein: 46, carbs: 0, fat: 16 },
  { name: "Turkey breast (6 oz)", kcal: 240, protein: 51, carbs: 0, fat: 3 },
  { name: "Sirloin steak (6 oz)", kcal: 330, protein: 48, carbs: 0, fat: 14 },
  { name: "Ribeye steak (6 oz)", kcal: 470, protein: 42, carbs: 0, fat: 33 },
  { name: "Ground turkey, 93/7 (6 oz)", kcal: 280, protein: 38, carbs: 0, fat: 14 },
  { name: "Shrimp (6 oz)", kcal: 180, protein: 40, carbs: 0, fat: 2 },
  { name: "Tuna, canned in water (1 can)", kcal: 120, protein: 27, carbs: 0, fat: 1 },
  { name: "Tilapia (6 oz)", kcal: 220, protein: 46, carbs: 0, fat: 3 },
  { name: "Flank steak (6 oz)", kcal: 330, protein: 47, carbs: 0, fat: 15 },
  { name: "Chicken drumstick (2, skinless)", kcal: 240, protein: 38, carbs: 0, fat: 9 },

  // Specific branded Costco snack items.
  { name: "Nature Valley Protein Bar Variety Pack", kcal: 190, protein: 10, carbs: 11, fat: 12 },
  { name: "Pure Protein Bars Variety Pack", kcal: 200, protein: 20, carbs: 17, fat: 6 },
  { name: "Country Archer Beef Stick Minis (1 stick)", kcal: 45, protein: 4, carbs: 0, fat: 3 },
  { name: "Kirkland Signature Organic Applesauce Pouch", kcal: 45, protein: 0, carbs: 11, fat: 0 },
  { name: "Nature's Bakery Fig Bar Variety Pack (twin pack)", kcal: 200, protein: 3, carbs: 36, fat: 5 },
  { name: "MadeGood Organic Granola Minis Variety Pack", kcal: 105, protein: 1, carbs: 20, fat: 3 },
  { name: "Kirkland Signature Soft & Chewy Granola Bar", kcal: 100, protein: 1, carbs: 18, fat: 3 },
  { name: "Kirkland Signature Mini Muffin Bites", kcal: 140, protein: 2, carbs: 20, fat: 6 },
  { name: "Smucker's Uncrustables PB&J Grape", kcal: 210, protein: 7, carbs: 26, fat: 9 },
  { name: "Blue Stripes Superfruit Gummies Variety Pack", kcal: 80, protein: 0, carbs: 19, fat: 0 },
  { name: "Welch's Fruit Snacks Variety Pack", kcal: 80, protein: 0, carbs: 21, fat: 0 },
  { name: "Kellogg's Rice Krispies Treats Marshmallow Squares", kcal: 90, protein: 1, carbs: 17, fat: 2 },
  { name: "Black Forest Organic Gummy Bears", kcal: 130, protein: 0, carbs: 33, fat: 0 },
  { name: "Kirkland Signature Trail Mix Snack Pack", kcal: 150, protein: 5, carbs: 14, fat: 9 },

  // Expanded from USDA FoodData Central reference values — legumes,
  // whole grains, nuts/seeds, dairy varieties, produce, and meat/fish.
  { name: "Lentils, cooked (1 cup)", kcal: 230, protein: 18, carbs: 40, fat: 1 },
  { name: "Black beans, cooked (1 cup)", kcal: 227, protein: 15, carbs: 41, fat: 1 },
  { name: "Chickpeas, cooked (1 cup)", kcal: 269, protein: 15, carbs: 45, fat: 4 },
  { name: "Kidney beans, cooked (1 cup)", kcal: 225, protein: 15, carbs: 40, fat: 1 },
  { name: "Pinto beans, cooked (1 cup)", kcal: 245, protein: 15, carbs: 45, fat: 1 },
  { name: "Edamame, cooked (1 cup)", kcal: 189, protein: 17, carbs: 16, fat: 8 },
  { name: "Quinoa, cooked (1 cup)", kcal: 222, protein: 8, carbs: 39, fat: 4 },
  { name: "Brown rice, cooked (1 cup)", kcal: 216, protein: 5, carbs: 45, fat: 2 },
  { name: "Whole wheat bread (1 slice)", kcal: 80, protein: 4, carbs: 14, fat: 1 },
  { name: "Walnuts (1 oz)", kcal: 185, protein: 4, carbs: 4, fat: 18 },
  { name: "Cashews (1 oz)", kcal: 157, protein: 5, carbs: 9, fat: 12 },
  { name: "Chia seeds (2 tbsp)", kcal: 138, protein: 5, carbs: 12, fat: 9 },
  { name: "Sunflower seeds (1 oz)", kcal: 165, protein: 6, carbs: 7, fat: 14 },
  { name: "Pumpkin seeds (1 oz)", kcal: 151, protein: 7, carbs: 5, fat: 13 },
  { name: "2% milk (1 cup)", kcal: 122, protein: 8, carbs: 12, fat: 5 },
  { name: "Skim milk (1 cup)", kcal: 83, protein: 8, carbs: 12, fat: 0 },
  { name: "Plain nonfat Greek yogurt (1 cup)", kcal: 133, protein: 23, carbs: 9, fat: 0 },
  { name: "Kale, raw (1 cup)", kcal: 33, protein: 2, carbs: 6, fat: 0 },
  { name: "Cauliflower (1 cup)", kcal: 25, protein: 2, carbs: 5, fat: 0 },
  { name: "Zucchini (1 cup)", kcal: 20, protein: 1, carbs: 4, fat: 0 },
  { name: "Green peas (1 cup)", kcal: 118, protein: 8, carbs: 21, fat: 0 },
  { name: "Butternut squash (1 cup)", kcal: 82, protein: 2, carbs: 22, fat: 0 },
  { name: "Cod (6 oz)", kcal: 180, protein: 39, carbs: 0, fat: 2 },
  { name: "Ground pork (6 oz)", kcal: 370, protein: 34, carbs: 0, fat: 25 },
  { name: "Lamb chop (6 oz)", kcal: 410, protein: 42, carbs: 0, fat: 26 },
  { name: "Bison (6 oz)", kcal: 260, protein: 44, carbs: 0, fat: 8 },
  { name: "Halibut (6 oz)", kcal: 220, protein: 42, carbs: 0, fat: 4 },
  { name: "Egg whites (1 cup)", kcal: 126, protein: 26, carbs: 2, fat: 0 },

  // Fast food, more produce/meat, condiments, beverages, desserts, and prepared meals.
  { name: "McDonald's Big Mac", kcal: 590, protein: 25, carbs: 46, fat: 34 },
  { name: "McDonald's McChicken", kcal: 410, protein: 15, carbs: 39, fat: 22 },
  { name: "McDonald's medium fries", kcal: 320, protein: 4, carbs: 43, fat: 15 },
  { name: "McDonald's Chicken McNuggets (10 pc)", kcal: 420, protein: 23, carbs: 25, fat: 27 },
  { name: "McDonald's Egg McMuffin", kcal: 310, protein: 17, carbs: 30, fat: 13 },
  { name: "Chick-fil-A Chicken Sandwich", kcal: 420, protein: 28, carbs: 41, fat: 18 },
  { name: "Chick-fil-A Nuggets (8 count)", kcal: 250, protein: 27, carbs: 11, fat: 11 },
  { name: "Chick-fil-A Waffle Fries (medium)", kcal: 420, protein: 5, carbs: 45, fat: 24 },
  { name: "Chipotle chicken bowl (rice, beans, cheese)", kcal: 630, protein: 45, carbs: 60, fat: 22 },
  { name: "Subway 6-inch turkey sub", kcal: 280, protein: 18, carbs: 46, fat: 4 },
  { name: "Taco Bell crunchy taco", kcal: 170, protein: 8, carbs: 13, fat: 9 },
  { name: "Taco Bell bean burrito", kcal: 350, protein: 13, carbs: 54, fat: 9 },
  { name: "Wendy's Jr. Cheeseburger", kcal: 300, protein: 17, carbs: 27, fat: 13 },
  { name: "Starbucks grande latte, 2% milk", kcal: 190, protein: 13, carbs: 19, fat: 7 },
  { name: "Pear", kcal: 101, protein: 1, carbs: 27, fat: 0 },
  { name: "Peach", kcal: 59, protein: 1, carbs: 14, fat: 0 },
  { name: "Kiwi", kcal: 42, protein: 1, carbs: 10, fat: 0 },
  { name: "Cantaloupe (1 cup)", kcal: 54, protein: 1, carbs: 13, fat: 0 },
  { name: "Mushrooms (1 cup)", kcal: 21, protein: 3, carbs: 3, fat: 0 },
  { name: "Onion (1 cup)", kcal: 64, protein: 2, carbs: 15, fat: 0 },
  { name: "Brussels sprouts (1 cup)", kcal: 56, protein: 4, carbs: 11, fat: 0 },
  { name: "Cabbage (1 cup)", kcal: 22, protein: 1, carbs: 5, fat: 0 },
  { name: "Ground chicken (6 oz)", kcal: 280, protein: 36, carbs: 0, fat: 14 },
  { name: "Deli roast beef (2 oz)", kcal: 70, protein: 12, carbs: 1, fat: 2 },
  { name: "Canned chicken (1 can)", kcal: 140, protein: 27, carbs: 0, fat: 3 },
  { name: "Scallops (6 oz)", kcal: 190, protein: 36, carbs: 4, fat: 2 },
  { name: "BBQ sauce (2 tbsp)", kcal: 60, protein: 0, carbs: 15, fat: 0 },
  { name: "Mustard (1 tbsp)", kcal: 3, protein: 0, carbs: 0, fat: 0 },
  { name: "Soy sauce (1 tbsp)", kcal: 8, protein: 1, carbs: 1, fat: 0 },
  { name: "Hot sauce (1 tbsp)", kcal: 1, protein: 0, carbs: 0, fat: 0 },
  { name: "Salsa (2 tbsp)", kcal: 10, protein: 0, carbs: 2, fat: 0 },
  { name: "Italian dressing (2 tbsp)", kcal: 90, protein: 0, carbs: 3, fat: 9 },
  { name: "Caesar dressing (2 tbsp)", kcal: 160, protein: 1, carbs: 1, fat: 17 },
  { name: "Energy drink (12 oz)", kcal: 110, protein: 0, carbs: 28, fat: 0 },
  { name: "Iced tea, sweetened (16 oz)", kcal: 140, protein: 0, carbs: 36, fat: 0 },
  { name: "Lemonade (16 oz)", kcal: 180, protein: 0, carbs: 47, fat: 0 },
  { name: "Almond milk, unsweetened (1 cup)", kcal: 40, protein: 1, carbs: 2, fat: 3 },
  { name: "Oat milk (1 cup)", kcal: 120, protein: 3, carbs: 16, fat: 5 },
  { name: "Coconut water (1 cup)", kcal: 45, protein: 2, carbs: 9, fat: 0 },
  { name: "Brownie", kcal: 240, protein: 3, carbs: 32, fat: 12 },
  { name: "Cake slice", kcal: 350, protein: 4, carbs: 50, fat: 15 },
  { name: "Milkshake (16 oz)", kcal: 560, protein: 12, carbs: 90, fat: 16 },
  { name: "Fried rice (1 cup)", kcal: 330, protein: 8, carbs: 42, fat: 14 },
  { name: "Spaghetti with meat sauce (1 cup)", kcal: 330, protein: 17, carbs: 40, fat: 11 },
  { name: "Chicken alfredo (1 cup)", kcal: 480, protein: 25, carbs: 35, fat: 27 },
  { name: "Fajitas, chicken (1 plate)", kcal: 450, protein: 32, carbs: 40, fat: 18 },
  { name: "Curry with rice (1 cup)", kcal: 400, protein: 18, carbs: 45, fat: 16 },
  { name: "Gyro", kcal: 500, protein: 26, carbs: 40, fat: 26 },
  { name: "Pad thai (1 cup)", kcal: 380, protein: 15, carbs: 45, fat: 15 },
];

const USDA_CORE = `Honey|tbsp|64|0|17|0
Hummus|cup|435|12|50|21
Tofu yogurt|cup|246|9|42|5
Banana, raw|NLEA serving|112|1|29|0
Cheese, swiss|oz|108|8|2|8
Pretzels, soft|large|483|12|99|4
Potato, mashed|cup|215|4|36|7
Butter, salted|tbsp|102|0|0|12
Watermelon, raw|NLEA serving|84|2|21|0
Macaroni, cooked|cup elbow shaped|221|8|43|1
Blueberries, raw|cup|84|1|21|0
Almonds, blanched|oz|167|6|5|15
Spaghetti, cooked|cup|221|8|43|1
Strawberries, raw|NLEA serving|47|1|11|0
Bread, wheat bran|slice|89|3|17|1
Popcorn, air-popped|oz|110|4|22|1
Egg, white, raw|large|17|4|0|0
Corn, sweet, white|cup|164|5|39|1
Egg, whole, cooked|large|90|6|0|7
Milk, nonfat, fluid|cup|83|8|12|0
Peas, green, boiled|cup|134|9|25|0
Peanut butter, smooth style|2 tbsp|188|8|6|16
Walnuts, black, dried|oz|175|7|3|17
Apple, raw, with skin|NLEA serving|126|1|33|0
Orange, raw, with peel|cup|107|2|26|0
Yogurt, plain, low fat|cup (8 fl oz)|154|13|17|4
Chicken, breast, cooked|3 oz|126|25|0|3
Rice, brown, long-grain|cup|216|5|45|2
Salmon, Atlantic, farmed|3 oz|175|19|0|10
Beef, top sirloin, steak|3 oz|180|25|0|8
Avocados, raw, California|NLEA serving|50|1|3|5
Tilapia, cooked, dry heat|fillet|111|23|0|2
Pork, loin, leg cap steak|piece|307|54|0|9
Bacon, cooked, microwaved|slice raw|133|11|0|10
Chicken, drumstick, cooked|3 oz|144|23|0|5
Milk, whole, 3.25% milkfat|cup|149|8|12|8
Tuna, light, canned in water|oz|24|6|0|0
Ground beef, 80% lean, patty|serving (3 oz)|230|22|0|15
Ground beef, 90% lean, patty|serving (3 oz)|184|22|0|10
Chicken, thigh, meat and skin|serving|198|20|0|13
Shrimp, mixed species, canned|cup|128|26|0|2
Sweet potato, cooked, candied|piece (2-1/2" x 2" dia)|172|1|34|4
Lentils, mature seeds, boiled|cup|230|18|40|1
Potato, boiled, cooked in skin|1/2 cup|68|2|16|0
Turkey, breast, from whole bird|3 oz|125|26|0|2
Cereal, oats, regular and quick|cup|307|11|55|5
Potato chips, white, restructured|cup|159|2|24|6
Orange juice, canned, unsweetened|cup|117|2|27|0
English muffin, with cheese and sausage|item|365|14|27|22
Butter|tbsp|102|0|0|12
Bread, white, prepared from recipe|slice|121|3|24|1
Cheese, mozzarella, part skim milk|oz|72|7|1|4
Pineapple, raw, extra sweet variety|NLEA serving|57|1|15|0
Milk, chocolate beverage, hot cocoa|cup|192|9|27|6
Brownie|brownie (2" square)|243|3|39|10
Cheese, American, nonfat or fat free|serving|24|4|2|0
Tuna salad|cup|383|33|19|19
Taco salad|1.5 cup|279|13|24|15
Hibiscus tea|8 fl oz|88|1|18|2
Almond paste|oz|130|3|14|8
Banana chips|oz|147|1|17|10
Potato salad|cup|358|7|28|20
Corn pudding|cup|328|11|42|13
Bean beverage|cup|78|6|13|0
Potato sticks|oz|148|2|15|10
Chicken spread|serving (1 serving)|88|10|2|10
Oil, oat|tbsp|120|0|0|14
Tortilla chips, low fat, baked without fat|oz|118|3|23|2
Potato pancakes|medium 3-1/4 in. x 3-5/8 in., 5/8 in. thick.|99|2|10|6
Apple juice, canned or bottled, unsweetened|cup|114|0|28|0
Chili con carne|cup (8 fl oz)|256|25|22|8
Bread, egg|oz|81|3|14|2
Bread, rye|oz|73|2|14|1
Ham salad spread|oz|61|2|3|4
Fat, turkey|tbsp|115|0|0|13
Corn, white|cup|606|16|123|8
Bagels, egg|oz|79|3|15|1
Ham, minced|oz|75|5|0|6
Bacon, baked|slice cooked|44|3|0|4
Bagel, wheat|bagel|245|10|48|2
Orange juice drink|cup|134|0|33|0
Cheese, brie|oz|95|6|0|8
Cheese, edam|oz|101|7|0|8
Ice cream sandwich|serving|166|3|26|6
Fat, chicken|tbsp|115|0|0|13
Corn, yellow|cup|606|16|123|8
Bread, wheat|oz|77|3|14|1
Cheese, feta|oz|75|4|1|6
Cheese, blue|oz|100|6|1|8
Muffins, corn|large|424|8|71|12
Broccoli, raw|NLEA serving|50|4|10|0
Sauce, cheese|1/4 cup|110|4|4|8
Bologna, pork|slice (4" dia x 1/8" thick)|57|4|0|5
Bread, cheese|slice|196|5|22|10
Cheese, cream|oz|97|2|1|10
Milk and cereal bar|bar|103|2|18|3
Cheese, brick|oz|105|7|1|8
Cheese, gouda|oz|101|7|1|8
Cheese, colby|oz|112|7|1|9
Bread, potato|slice|85|4|15|1
Soy protein isolate|oz|96|23|2|1
Cereal, ALPEN|2/3 cup (1 NLEA serving)|194|6|42|2
Bread, raisin|oz|78|2|15|1
Bread, italian|oz|77|2|14|1
Bread, oatmeal|oz|76|2|14|1
Strudel, apple|piece|195|2|29|8
Frijoles with cheese|cup|225|11|29|8
Scrapple, pork|2 oz|119|4|8|8
Crackers, milk|1/2 oz|65|1|10|2
Cheese, tilsit|oz|96|7|0|7
Cheese, romano|oz|110|9|1|8
Puddings, rice|cup|186|6|32|4
Potato, canned|cup, whole|132|4|30|0
Bacon and beef sticks|oz|145|8|0|12
Bread, oat bran|slice|71|3|12|1
Cheese, gjetost|oz|132|3|12|8
Ham and cheese spread|oz|69|5|1|5
Potato, o'brien|cup|157|5|30|2
Potato salad with egg|1/2 cup|196|2|20|12
Bologna, turkey|serving|59|3|1|4
Cheese, fontina|oz|110|7|0|9
Cheese, caraway|oz|107|7|1|8
Cheese, gruyere|oz|117|8|0|9
Cheese, cheddar|oz|114|7|0|9
Lime juice, raw|cup|60|1|20|0
Bacon, meatless|cup|446|15|9|42
SILK Plain soy yogurt|container|150|6|22|4
SILK Peach soy Yogurt|container|160|4|32|2
Cookies, butter|oz|132|2|20|5
Sunflower seed butter|oz|175|5|7|16
Butter, whipped|stick|545|1|0|62
Sherbet, orange|bar (2.75 fl oz)|95|1|20|1
Cereal, FAMILIA|cup|473|12|90|8
Fish oil, salmon|tbsp|123|0|0|14
Bagels, oat bran|oz|72|3|15|0
Pie, egg custard|oz|60|2|6|3
Lemonade, powder|serving|68|0|18|0
Headcheese, pork|slice (1 oz) (4" x 4" x 3/32" thick)|44|4|0|3
Olive loaf, pork|slice (1 oz) (4" x 4" x 3/32" thick)|66|3|3|5
Pie, Dutch Apple|slice|397|3|61|16
Orange breakfast drink|fl oz|17|0|4|0
Cheese, cheshire|oz|110|7|1|9
Lemon juice, raw|cup|54|1|17|1
Cheese, muenster|oz|104|7|0|8
Oat bran, cooked|cup|88|7|25|2
Bread, rice bran|oz|69|2|12|1
Pastrami, turkey|package (8 oz)|316|37|8|14
Cheese, monterey|oz|106|7|0|9
Crackers, cheese|1/2 oz|69|2|8|3
Pork skins, plain|oz|154|17|0|9
Corn dogs, frozen|corndog|208|6|23|10
Sausage, meatless|slice|72|5|3|5
CAMPBELL'S Turkey Gravy|1/4 cup|25|1|3|1
Grape leaves, raw|cup|13|1|2|0
Wild rice, cooked|cup|166|6|35|1
Bread, wheat germ|oz|74|3|14|1
Biscuit, with ham|biscuit|554|19|63|26
Ham and cheese sandwich|sandwich|352|21|33|16
Egg and cheese sandwich|sandwich|340|16|26|19
Orange juice, raw|cup|112|2|26|0
Marmalade, orange|serving|49|0|13|0
Cheese, limburger|cup|438|27|1|36
Cheese, provolone|oz|100|7|1|8
Cheese, camembert|oz|85|6|0|7
Cheese, roquefort|oz|105|6|1|9
Chicken, meatless|cup|376|40|6|21
Biscuit, with egg|biscuit|373|12|32|22
Croissants, apple|oz|72|2|10|2
Muffins, oat bran|large|375|10|67|10
TACO BELL, Nachos|serving|280|4|28|17
Luxury loaf, pork|slice (1 oz) (4" x 4" x 3/32" thick)|39|5|1|1
Frankfurter, pork|link|204|10|0|18
Croissants, cheese|oz|117|3|13|6
Bread, whole-wheat|slice|81|4|14|1
Bagel chips, plain|oz|128|4|19|4
Hotdog, with chili|sandwich|296|14|31|13
Protein powder soy based|scoop|175|25|13|2
Coffeecake, cheese|oz|96|2|13|4
Taco shells, baked|oz|134|2|18|6
Yardlong bean, raw|cup slices|43|2|8|0
SILK Key Lime soy Yogurt|container|150|4|30|2
Broccoli raab, raw|cup chopped|9|1|1|0
Acerola juice, raw|cup|56|1|12|1
Cheese, neufchatel|oz|72|3|1|6
Croissants, butter|oz|115|2|13|6
Potato, hash brown|cup|413|5|55|20
Mother's loaf, pork|oz|80|3|2|6
SILK Raspberry soy yogurt|container|150|4|30|2
Ground beef, cooked|3 oz|199|21|0|12
Chickpeas (garbanzo beans, bengal gram), mature seeds|cup|269|14|45|4
Candies, peanut bar|oz|148|4|13|10
Campbell's Pork and Beans|serving|140|6|25|2
Sweet rolls, cheese|oz|102|2|12|5
Bread sticks, plain|cup, small pieces|190|6|32|4
Rice and Wheat cereal bar|bar|90|2|16|2
Frankfurter, turkey|oz|63|4|1|5
Bread, pumpernickel|oz|71|2|14|1
Grape drink, canned|fl oz|19|0|5|0
SILK Blueberry soy Yogurt|container|150|4|29|2
Soup, chicken broth|cup|15|2|1|0
Ice cream cookie sandwich|serving|197|3|32|6
Prune juice, canned|cup|182|2|45|0
Protein powder whey based|1/3 cup|113|25|2|0
Nachos, with cheese|serving|274|4|28|17
Beef sausage, cooked|serving|143|8|0|12
Biscuit with egg and steak|biscuit|410|18|21|28
SILK Strawberry soy yogurt|container|160|4|31|2
Soybean, curd cheese|cup|340|28|16|18
Bacon bits, meatless|tbsp|33|2|2|2
Carrot juice, canned|cup|94|2|22|0
Sesame butter, paste|tbsp|94|3|4|8
Potato, hashed brown|cup|471|4|46|31
Tangerine juice, raw|cup|106|1|25|0
Fruit butters, apple|cup|488|1|120|1
PACE, Red Taco Sauce|serving|8|0|2|0
Oil, corn and canola|tbsp|124|0|0|14
Frankfurter, chicken|link|100|7|1|7
Turkey bacon, cooked|oz|107|8|1|8
French toast, frozen|piece|126|4|19|4
Crackers, rusk toast|1/2 oz|58|2|10|1
Orange drink, canned|fl oz|15|0|4|0
Rice noodles, cooked|cup|190|3|42|0
Tostada shells, corn|piece|58|1|8|3
Polish sausage, pork|3 oz|277|12|1|24
Garlic bread, frozen|slice|206|5|25|10
Bread, cracked-wheat|oz|74|2|14|1
Egg, yolk, raw|oz|85|4|0|7
Cereal, KASHI GOLEAN|cup (1 NLEA serving)|148|14|30|1
Orange juice, chilled|cup|122|2|29|0
Biscuit, with sausage|item|412|11|33|27
McDONALD'S, Hamburger|sandwich|251|12|29|10
Egg, whole, raw|large|72|6|0|5
Broccoli raab, cooked|NLEA serving|28|3|3|0
Whey protein powder isolate|3 scoop|309|50|25|1
Cheese, port de salut|oz|100|7|0|8
Danish pastry, cheese|oz|106|2|10|6
Ham and cheese loaf or roll|slice (1 oz) (4" x 4" x 3/32" thick)|67|4|1|5
Corn on the cob with butter|ear|155|4|32|3
WENDY'S, French Fries|small Serving|340|4|45|16
Bologna, beef and pork|3.527 oz|308|15|6|25
Chorizo, pork and beef|oz|129|7|0|11
CYTOSPORT, Muscle Milk|14 fl oz|203|24|8|8
BURGER KING, Hamburger|sandwich|258|15|26|10
Orange Pineapple Juice Blend|8 fl oz|125|1|30|0
Pickle relish, hot dog|1/2 cup|111|2|28|1
Cookies, peanut butter|oz|135|3|17|7
Almond milk, chocolate|cup|120|2|22|3
Soup, pea, green|fl oz|20|1|3|0
Popcorn, cheese-flavor|oz|149|3|15|9
Enchilada, with cheese|enchilada|319|10|28|19
HEALTHY REQUEST Tomato juice|serving|51|2|11|0
SILK Black Cherry soy Yogurt|container|150|4|29|2
Apple, raw, gala|large|114|0|27|0
Egg substitute, powder|0.35 oz|44|6|2|1
McDONALD'S, Side Salad|item 3.1 oz|17|1|4|0
Snack, Mixed Berry Bar|bar|146|5|22|4
Turkey sausage, cooked|serving|112|14|0|6
Apple, raw, fuji|large|149|0|36|0
Egg, duck, whole|egg|130|9|1|10
Cookies, chocolate chip|serving|149|1|20|7
Cereal, amaranth flakes|cup|134|6|27|3
Poultry salad sandwich spread|oz|57|3|2|4
Egg, goose, whole|egg|266|20|2|19
Milk, goat, fluid|cup|168|9|11|10
Candies, milk chocolate|bar (1.55 oz)|235|3|26|13
NUTRI-GRAIN FRUIT AND NUT BAR|bar|129|3|21|4
Egg, white, dried|oz|100|22|1|0
Potato, raw, skin|skin|22|1|5|0
Ham, rump, heated|serving (3 oz)|150|20|0|8
Soup, stock, fish|cup|40|5|0|2
Soup, stock, beef|cup|31|5|3|0
Pulled pork in barbecue sauce|cup|418|33|47|11
TACO BELL, Bean Burrito|each burrito|387|14|58|11
Egg, whole, dried|tbsp|30|2|0|2
CLIF BAR, mixed flavors|bar|235|10|44|4
Pork, loin, whole|3 oz|203|23|0|12
Milk, sheep, fluid|cup|265|15|13|17
McDONALD'S, Cheeseburger|item 4 oz|313|15|33|14
Beef sausage, pre-cooked|serving|194|7|0|18
Blackberry juice, canned|cup|95|1|20|2
Ham, shank, heated|serving (3 oz)|118|22|0|3
Pickle relish, hamburger|1/2 cup|157|1|42|1
Salad dressing, coleslaw|tbsp|62|0|4|5
Candies, SKOR Toffee Bar|bar 1.4 oz|209|1|24|13
Chili with beans, canned|cup|287|15|30|14
Salmon, coho, wild|3 oz|156|23|0|6
Sweet potato leaves, raw|cup, chopped|15|1|3|0
Egg, turkey, whole|egg|135|11|1|9
Turkey and gravy, frozen|3 oz|57|5|4|2
Cereal, POST Bran Flakes|3/4 cup (1 NLEA serving)|97|3|24|1
Cereal, Ralston TASTEEOS|cup|111|3|21|2
Cereal, UNCLE SAM CEREAL|3/4 cup (1 NLEA serving)|190|9|36|6
Beef, flank, steak|3 oz|224|23|0|14
Beerwurst, pork and beef|serving 2 oz|155|8|2|13
Syrups, corn, dark|tbsp|57|0|16|0
Chicken roll, light meat|package|187|28|8|5
BURGER KING, Onion Rings|large|592|6|62|36
Pork, pickled pork hocks|3 oz|200|22|0|12
Soup, crab, canned|cup (8 fl oz)|76|6|10|2
Grapes, red or green (European type, such as Thompson seed|cup|104|1|27|0
Honey roll sausage, beef|oz|52|5|1|3
Ham, honey, smoked|1.94 oz (1 serving)|67|10|4|1
Quesadilla, with chicken|each quesadilla|529|27|43|27
McDONALD'S, Egg McMUFFIN|sandwich|287|17|27|12
Bread, pita, white|oz|78|3|16|0
Oriental mix, rice-based|oz|143|5|15|7
McDONALD'S, French Fries|small serving|229|2|30|11
Crisped rice bar, almond|bar (1 oz)|128|2|18|6
Rolls, dinner, egg|oz|87|3|15|2
McDONALD'S, Sausage Patty|1.5 oz|174|6|1|17
Sandwich spread, meatless|tbsp|22|1|1|1
Canadian bacon, pan-fried|slice|20|4|0|0
BURGER KING, French Fries|small serving|207|2|29|9
BURGER KING, Cheeseburger|item|380|19|32|20
Smoked link sausage, pork|link (4" long x 1-1/8" dia)|210|8|1|19
Taco salad with chili con carne|1.5 cup|290|17|27|13
TACO BELL, Nachos Supreme|serving|495|14|48|28
Milk, fluid, nonfat|cup|86|8|12|0
Milk, filled, fluid|cup|154|8|12|8
Grape juice drink, canned|fl oz|18|0|5|0
Carbonated beverage, cola|fl oz|13|0|3|0
Candies, MOUNDS Candy Bar|package 1.9 oz|258|2|31|14
Milk, fluid, 1% fat|cup|102|8|12|2
Milk, human, mature|cup|172|2|17|11
Milk, lowfat, fluid|cup|102|8|12|2
Orange, raw, navels|NLEA serving|75|1|19|0
McDONALD'S, Apple Dippers|package|33|0|8|0
Biscuit, with egg and ham|biscuit|424|19|30|26
Potato chips, reduced fat|oz|134|2|19|6
Popcorn, unpopped kernels|oz|106|3|21|1
Side dishes, potato salad|1/3 cup|108|2|13|6
Shrimp, breaded and fried|piece shrimp|52|1|5|3
Bread, egg, toasted|oz|89|3|15|2
Bread, rye, toasted|oz|81|3|15|1
Ham, rump, unheated|oz|35|7|0|1
Pasta, corn, cooked|cup|176|4|39|1
Ham, whole, roasted|cup|220|35|0|8
Pepper, banana, raw|cup|33|2|7|1
Syrups, corn, light|tbsp|62|0|17|0
Corn, sweet, yellow|cup|125|5|27|2
Potato, baked, skin|skin|115|2|27|0
Tomato, orange, raw|cup, chopped|25|2|5|0
Pork, blade, broiled|chop|265|32|1|15
Pork, enhanced, loin|3 oz|99|18|0|3
Pork, ground, cooked|3 oz|252|22|0|18
Salmon, pink, cooked|1/2 fillet|190|30|0|6
Ham, chopped, canned|oz|68|5|0|5
Beef, cured, sausage|oz|88|4|1|8
Salmon, chum, canned|3 oz|120|18|0|5
Salmon, coho, farmed|3 oz|151|21|0|7
Salmon, chum, cooked|3 oz|131|22|0|4
Salmon, pink, canned|3 oz|110|17|0|4
Noodles, egg, cooked|cup|221|7|40|3
Cereal, rice, puffed|cup|56|1|13|0
Crackers, matzo, egg|1/2 oz|56|2|11|0
Bread, roll, Mexican|piece|312|10|55|6
Cereal, KASHI Simply Maize|3/4 cup (1 NLEA serving)|100|2|22|1
Peanut butter, chunk style|2 tbsp|188|8|7|16
Yogurt, Greek, plain|container|100|17|6|1
Orange, raw, Florida|cup sections, without membranes|85|1|21|0
Candies, KIT KAT Wafer Bar|bar (1.5 oz)|218|3|27|11
Cereal, KASHI GOOD FRIENDS|cup (1 NLEA serving)|158|5|42|2
Bagel, with ham, egg|item|483|27|52|18
Sausage, turkey, hot|2 oz|88|8|3|5
Ham, whole, unheated|cup|344|26|0|26
Ham, shank, unheated|oz|35|7|0|1
CAMPBELL'S Fat Free Turkey Gravy|1/4 cup|20|1|4|0
Salad dressing, mayonnaise|tbsp|94|0|0|10
Oven-roasted chicken breast roll|serving 2 oz|75|8|1|4
Chicken, leg, cooked|3 oz|157|22|0|7
Milk shakes, thick vanilla|container (11 oz)|351|12|56|10
Pomegranate juice, bottled|cup|134|0|33|1
McDONALD'S, English Muffin|item 2 oz|162|5|25|4
Potato, baked, flesh|1/2 cup|57|1|13|0
Sauce, pizza, canned|1/4 cup|34|1|6|1
Soup, turkey, chunky|cup (8 fl oz)|135|10|14|4
Soup, tomato, canned|fl oz|17|1|3|0
Soup, cheese, canned|cup|231|10|16|15
BURGER KING, Vanilla Shake|small 12 fl oz|501|10|57|26
Soup, stock, chicken|cup|86|6|8|3
Tortilla chips, taco-flavor|oz|136|2|18|7
Noodles, egg, spinach|cup|145|6|27|2
Waffle, plain, frozen|waffle, round (4"dia)|95|2|14|3
Biscuit, with egg and bacon|biscuit|458|17|29|31
McDONALD'S, Baked Apple Pie|2.7 oz|249|2|34|12
Cereal, wheat, puffed|cup|44|2|10|0
English muffin, with butter|muffin|189|5|30|6
Sweet potato, baked in skin|large|162|4|37|0
McDONALD'S, Sausage Biscuit|item 4.1 oz|440|11|32|30
Cereal, oats, instant|cup|230|6|46|3
Chicken, wing, cooked|oz|56|8|0|3
Bread, white, toasted|oz|83|3|15|1
BURGER KING, Chicken Strips|strip|46|2|2|3
Sauce, chili, peppers|cup|49|2|12|0
Pork skins, barbecue-flavor|oz|153|16|0|9
Cereal, KASHI Berry Blossom|3/4 cup (1 NLEA serving)|99|2|26|1
Cereal, Ralston Corn Flakes|cup|111|2|27|0
Carbonated beverage, orange|fl oz|15|0|4|0
Tuna, bluefin, cooked|3 oz|156|25|0|5
Soup, chicken, canned|cup|174|12|17|6
Bread, wheat, toasted|oz|89|4|16|1
Cereal, Ralston Crispy Rice|cup|102|2|24|0
Chicken, wing, frozen|serving|181|17|3|11
Milk, producer, fluid|cup|156|8|11|9
Peppers, chili, green|cup|29|1|6|0
SILK Banana-Strawberry soy Yogurt|container|150|4|29|2
Chicken, leg, roasted|3 oz|148|21|0|7
McDONALD'S, Sausage Burrito|item 3.993 oz|296|13|24|17
Chicken, feet, boiled|oz|61|6|0|4
Chicken, back, cooked|oz|58|7|0|3
Broccoli, stalks, raw|stalk|32|3|6|0
Gravy, turkey, canned|cup|121|6|12|5
Potato chips, cheese-flavor|oz|141|2|16|8
Pork, shoulder, whole|3 oz|248|20|0|18
Pork, shoulder, blade|3 oz|220|22|0|14
Cereal, KASHI GOLEAN CRUNCH!|cup (1 NLEA serving)|193|9|39|3
Cereal, KASHI Honey Sunshine|3/4 cup (1 NLEA serving)|103|2|25|1
Roughy, orange, cooked|3 oz|89|19|0|1
Juice, apple and grape blend|8 fl oz|125|0|31|0
Tortilla chips, nacho cheese|oz|146|2|18|7
Milk shakes, thick chocolate|container (10.6 oz)|357|9|63|8
Burrito, with beans and beef|item|460|28|47|18
Cranberry juice, unsweetened|cup|116|1|31|0
McDONALD'S, Sausage McMUFFIN|item 4 oz|383|15|28|24
Candies, CARAMELLO Candy Bar|bar 1.6 oz|208|3|29|10
Tuna, skipjack, cooked|3 oz|112|24|0|1
Ham, patties, unheated|oz|89|4|0|8
Salami, cooked, turkey|serving|48|5|0|3
Sausage, Italian, pork|link, 4/lb|286|16|4|23
Sausage, chicken, beef|link|181|11|7|12
Cheese, parmesan, hard|oz|111|10|1|7
Yogurt, fruit, low fat|cup (8 fl oz)|243|10|46|3
Cheese, Mexican, blend|oz|80|7|1|6
Chicken, wing, roasted|wing, bone and skin removed|43|6|0|2
Soup, gazpacho, canned|cup (8 fl oz)|46|7|4|0
Rice, white, glutinous|cup|169|4|37|0
Milk, chocolate, fluid|cup|208|8|26|8
Granola bites, mixed flavors|package|90|1|13|4
Pork, loin, tenderloin|3 oz|122|22|0|3
Sunflower seed butter, added|oz|175|5|7|16
Tortilla chips, ranch-flavor|oz|142|2|18|7
Chicken, cooked, fried|cup, chopped or diced|307|43|2|13
Chicken, thigh, cooked|oz|56|7|0|3
CYTOSPORT, Muscle Milk light|14 fl oz|141|20|9|4
Sweet potato chips, unsalted|oz|151|1|16|9
Cereal, KASHI INDIGO MORNING|3/4 cup (1 NLEA serving)|98|2|22|1
Ham, steak, extra lean|slice|70|11|0|2
Turkey, breast, smoked|slice|27|6|0|0
Cereal, KELLOGG, SMORZ|cup (1 NLEA serving)|123|2|25|2
Cereal, KASHI, KASHI U|cup (1 NLEA serving)|207|6|43|4
Turkey, whole, roasted|3 oz|135|25|0|3
Beans, chili, barbecue|cup|245|13|43|2
Soup, escarole, canned|cup (8 fl oz)|27|2|2|2
Cheese, swiss, low fat|cup, diced|236|38|4|7
Salmon, Atlantic, wild|3 oz|155|22|0|7
Pork, leg (ham), whole|3 oz|232|23|0|15
Bread, raisin, toasted|oz|84|2|16|1
Apple, dried, sulfured|cup|209|1|57|0
Cheese, cream, low fat|cup|482|19|20|37
Cheese, cottage, lowfat|cup|168|28|7|2
Cheese, goat, soft type|oz|76|5|0|6
Lemonade-flavor drink, powder|serving|68|0|18|0
Salmon, chinook, cooked|3 oz|196|22|0|11
Salmon, sockeye, canned|3 oz|142|20|0|6
Soup, pepperpot, canned|fl oz|12|1|1|1
Milk, buttermilk, fluid|cup|98|8|12|2
Tostada, with beef and cheese|piece|315|19|23|16
Cheese substitute, mozzarella|oz|70|3|7|4
Pork and beef sausage, cooked|link (raw dimensions: 4" long x 7/8" dia), cooked|51|2|0|5
Candies, REESE'S PIECES Candy|1/4 cup|234|6|28|12
Candies, 5TH AVENUE Candy Bar|bar 2 oz|270|5|35|13
Candies, ALMOND JOY Candy Bar|package 1.76 oz|235|2|29|13
Potato chips, barbecue-flavor|oz|137|2|16|9
Sausage, Berliner, pork|oz|65|4|1|5
Tuna, yellowfin, cooked|3 oz|110|25|0|0
Salmon, chinook, smoked|3 oz|99|16|0|4
Sausage, Italian, sweet|link 3 oz|125|14|2|7
Biscuit, with egg and sausage|item|505|18|34|34
Cereal, Ralston Corn Biscuits|cup|114|2|27|0
Salad dressing, honey mustard|2 tbsp|139|0|7|12
Salad dressing, green goddess|tbsp|64|0|1|6
Salmon, sockeye, cooked|3 oz|144|22|0|6
Clam and tomato juice, canned|fl oz|14|0|3|0
Turkey Pot Pie, frozen entree|serving|699|26|70|35
Turkey, whole, enhanced|3 oz|150|22|0|7
Bread, oatmeal, toasted|oz|83|3|15|1
Lasagna, cheese, frozen|cup 1 serving|292|15|31|12
Rice, white, long-grain|cup|205|4|44|0
Cereal, KASHI Golden Goodness|1.25 cup (1 NLEA serving)|213|6|50|1
Milk, buttermilk, dried|cup|464|41|59|7
Cheese, cottage, nonfat|4 oz|81|12|8|0
Cheese, cream, fat free|tbsp|19|3|1|0
Cheese, goat, hard type|oz|128|9|1|10
Orange, raw, California|cup sections, without membranes|88|2|21|0
Chicken, thigh, roasted|thigh with skin|245|34|0|11
Rolls, dinner, oat bran|oz|67|3|11|1
Beef, tenderloin, steak|3 oz|227|22|0|15
Peppers, hot chili, red|1/2 cup, chopped or diced|30|1|7|0
Beef, chuck, clod steak|3 oz ( 1 serving )|161|25|0|6
Potato, canned, drained|cup|108|2|24|0
Pork, spareribs, cooked|3 oz|337|25|0|26
Pork, backribs, roasted|3 oz|248|20|0|18
Pork, spareribs, roasted|3 oz|307|18|0|26
Pork, enhanced, shoulder|3 oz|193|23|0|10
BURGER KING, Hash Brown Rounds|serving small|284|2|27|19
ABBOTT, EAS soy protein powder|scoop|178|21|19|2
Lemon juice, canned or bottled|cup|51|1|16|1
Burrito, with beans and cheese|each burrito|379|14|58|11
Griddle cake sandwich, sausage|item 4.744 oz|429|11|42|24
McDONALD'S, McCHICKEN Sandwich|sandwich|358|14|37|17
Chicken fillet sandwich, plain|sandwich|515|24|39|29
Croissant, with egg and cheese|croissant|368|13|24|25
McDONALD'S, Sausage McGRIDDLES|item 4.744 oz|421|11|42|24
Sausage, Italian, turkey|serving 2 oz|88|8|3|5
Broccoli, frozen, spears|1/2 cup|26|3|5|0
Chicken, rotisserie, BBQ|serving|321|13|0|30
Chicken, stewing, cooked|cup, chopped or diced|332|43|0|17
Chicken, breast, roasted|cup, chopped or diced|231|43|0|5
Salad dressing, ranch dressing|serving|126|0|2|13
Bologna, chicken, turkey|slice|83|3|2|7
Ham, chopped, not canned|slice (4-1/4" x 4-1/4" x 1/16")|38|4|1|2
Milk, reduced fat, fluid|cup|122|8|12|5
Milk, canned, evaporated|cup|338|17|25|19
Apple, raw, granny smith|large|119|1|28|0
Figs, canned, water pack|cup|131|1|35|0
Cereal, Marshmallow ALPHA-BITS|cup (1 NLEA serving)|115|2|25|1
Cheese, parmesan, grated|cup|431|38|4|29
Yogurt, vanilla, low fat|cup (8 fl oz)|208|12|34|3
Yogurt, plain, skim milk|cup (8 fl oz)|137|14|19|0
Soup, chili beef, canned|cup|149|6|24|3
Cheese, cottage, creamed|4 oz|111|13|4|5
Apple, canned, sweetened|cup slices|137|0|34|1
Apple, raw, without skin|cup slices|53|0|14|0
Salad, vegetable, tossed|3/4 cup|17|1|3|0
Cereal, QUAKER, Oat Bran|1/2 cup (1 NLEA serving)|146|7|25|3
Coconut water (liquid from coconuts)|cup|46|2|9|0
Tostada, with beans and cheese|piece|223|10|26|10
Watermelon seed kernels, dried|oz|158|8|4|13
Candies, KRACKEL Chocolate Bar|bar 2 oz|287|4|36|15
Chicken pot pie, frozen entree|pie|598|15|57|35
Frostings, cream cheese-flavor|2 tbsp creamy|137|0|22|6
CAMPBELL'S Microwavable Turkey Gravy|1/4 cup|25|1|3|1
Soup, black bean, canned|cup|114|6|19|2
Cereal, POST, ALPHA-BITS|cup (1 NLEA serving for adults)|117|3|24|1
Rice, white, short-grain|cup|242|4|53|0
Bread, pita, whole-wheat|pita, large (6-1/2" dia)|170|6|35|2
Bread, oat bran, toasted|oz|73|3|12|1
Soup, minestrone, canned|cup|127|5|21|3
Cereal, POST Raisin Bran Cereal|cup (1 NLEA serving)|189|4|46|1
Turkey, white, rotisserie|1.69 oz (1 serving)|54|6|4|1
Broccoli, frozen, chopped|cup|52|6|10|0
Chicken, canned, no broth|cup|379|52|2|17
Tea, instant, unsweetened|2 tbsp, rounded|39|1|9|0
Chicken, dark meat, thigh|3 oz|139|20|0|7
Cheese, monterey, low fat|cup, diced|413|37|1|28
Salad dressing, mayonnaise type|tbsp|57|0|4|5
ABBOTT, EAS whey protein powder|2 scoop|150|26|7|2
Cereal, Ralston Crispy Hexagons|cup|106|2|24|0
Chicken, breast, skinless|piece|284|58|0|6
Game meat, buffalo, water|3 oz|111|23|0|2
Squash, winter, spaghetti|cup|42|1|10|0
Broccoli, boiled, drained|spear (about 5" long)|13|1|3|0
Peppers, hot chili, green|1/2 cup, chopped or diced|14|1|4|0
Soup, beef noodle, canned|cup (8 fl oz)|83|5|9|3
Soup, pea, split with ham|cup|185|11|27|4
Soup, tomato rice, canned|cup|116|2|21|3
Soup, chunky beef, canned|cup|162|10|25|3
Shake, fast food, vanilla|cup (8 fl oz)|246|6|32|11
Crackers, wheat, sandwich|1/2 oz|71|1|8|4
Bread, rice bran, toasted|oz|75|3|13|1
Salad dressing, thousand island|serving (2 tbsp)|114|0|4|10
Biscuit, with egg, cheese|item|436|17|35|25
Pears, canned, water pack|cup, halves|71|0|19|0
Apple, raw, red delicious|large|153|1|37|0
Granola bars, hard, plain|bar|99|2|14|4
Cheese, muenster, low fat|slice|76|7|1|5
Pears, canned, juice pack|cup, halves|124|1|32|0
Soup, oyster stew, canned|cup (8 fl oz)|135|6|10|8
Enchilada, with cheese and beef|enchilada|323|12|30|18
McDONALD'S, Double Cheeseburger|sandwich|437|24|29|25
Hamburger; double, patty; plain|item|354|20|29|17
Turkey, canned, meat only|can (5 oz)|240|34|2|10
Bread, wheat, white wheat|slice|67|3|12|1
Rice, brown, medium-grain|cup|218|4|46|2
Rice, white, medium-grain|cup|242|4|53|0
Luncheon sausage, pork and beef|oz|74|4|0|6
Mixed vegetable and fruit juice drink|8 fl oz|72|0|18|0
Broccoli, chinese, cooked|cup|19|1|3|1
Cereal, granola, homemade|cup|597|18|65|29
Cereal, corn grits, white|cup|577|12|123|3
TACO BELL, Soft Taco with steak|item|286|15|22|15
Yogurt, plain, whole milk|cup (8 fl oz)|149|8|11|8
Cookies, peanut butter sandwich|oz|136|2|19|6
Carbonated beverage, cream soda|fl oz|16|0|4|0
Cereal, GENERAL MILLS Corn CHEX|cup (1 NLEA serving)|115|2|26|1
Carbonated beverage, grape soda|fl oz|13|0|4|0
SILK Vanilla soy Yogurt (Family size)|container|179|6|31|4
Salad dressing, caesar dressing|serving (2 tbsp)|163|1|1|17
Salad dressing, french dressing|tbsp|73|0|2|7
Pork, loin, blade (chops)|3 oz|217|23|0|13
Granola bar, QUAKER, chewy|bar|98|1|19|2
Chicken, meat only, stewed|cup, chopped or diced|248|38|0|9
Salad dressing, bacon and tomato|tbsp|49|0|0|5
Chicken, canned, meat only|can (5 oz)|234|31|0|11
Ham, separable fat, heated|3 oz|431|8|2|44
Salad dressing, russian dressing|serving (2 tbsp)|106|0|10|8
Granola bar, QUAKER, DIPPS|bar|149|2|20|6
Granola bars, soft, almond|bar|159|3|21|7
BURGER KING, French Toast Sticks|serving 5 sticks|373|6|44|19
BURGER KING, Double Cheeseburger|sandwich|457|27|28|26
Nachos, with cheese, beans|serving|486|14|48|28
Potato, hash brown, frozen|cup prepared|328|4|43|17
Tuna, white, canned in oil|3 oz|158|23|0|7
Pork, leg (ham), rump half|3 oz|178|23|0|9
Chicken, skin only, cooked|oz|115|5|0|11
Chicken, roasting, roasted|cup, chopped or diced|234|35|0|9
Tuna, light, canned in oil|oz|56|8|0|2
Cereal, KELLOGG'S CINNAMON JACKS|cup (1 NLEA serving)|111|2|24|2
WEND'YS, Crispy Chicken Sandwich|sandwich|350|15|33|18
Chicken, dark meat, cooked|cup|335|41|4|16
Salad dressing, italian dressing|tbsp|35|0|2|3
Cereal, QUAKER, corn grits|cup|166|4|35|1
CAMPBELL'S Country Style Sausage Gravy|1/4 cup|70|2|3|6
Turkey roll, light and dark meat|oz|42|5|1|2
KENTUCKY FRIED CHICKEN, Coleslaw|cup|275|2|30|16
Soup, beef broth, bouillon|cup (8 fl oz)|29|5|2|0
Soup, chicken rice, canned|cup|127|12|13|3
Cereal, corn grits, yellow|cup|579|14|124|2
Cereal, POST, GREAT GRAINS|3/4 cup (1 NLEA serving)|208|4|41|4
Cheese, parmesan, shredded|tbsp|21|2|0|1
Carbonated beverage, tonic water|fl oz|10|0|3|0
Bread, protein (includes gluten)|oz|69|3|12|1
Cereal, QUAKER, Quick Oats|1/2 cup|148|6|27|3
Waffle, buttermilk, frozen|oz|87|2|14|3
Cereal, KELLOGG, KELLOGG'S|cup (1 NLEA serving)|188|4|45|1
Spaghetti, spinach, cooked|cup|182|6|37|1
Sauce, steak, tomato based|2 Tbsp|32|0|8|0
Soup, scotch broth, canned|cup|80|5|9|3
Turkey, retail parts, wing|3 oz|144|26|0|5
Cereal, KELLOGG, SPECIAL K|3/4 cup (1 NLEA serving)|117|2|27|1
McDONALD'S, Hotcakes and Sausage|item|776|16|102|35
McDONALD'S, Fruit & Walnut Salad|item|312|5|44|13
Muffin, blueberry, low-fat|oz|72|1|14|1
Cereal, POST, GOLDEN CRISP|3/4 cup (1 NLEA serving)|103|2|24|0
Cereal, GENERAL MILLS, KIX|1.25 cup (1 NLEA serving)|107|2|25|1
Bread, wheat germ, toasted|oz|83|3|15|1
Fish sandwich, with tartar sauce|sandwich|565|23|59|27
Cheese spread, cream cheese base|oz|84|2|1|8
Crisped rice bar, chocolate chip|bar (1 oz)|113|1|20|4
Syrups, table blends, corn|tbsp|64|0|17|0
Granola bars, hard, almond|oz|140|2|18|7
Granola bars, soft, coated|oz|144|3|15|9
Apple, frozen, unsweetened|cup slices|83|0|21|1
Corn, yellow, whole kernel|cup|185|5|36|2
Potato, microwaved, cooked|skin|77|2|17|0
Beef, loin, top loin steak|3 oz|190|24|0|10
Pork, leg (ham), shank half|3 oz|197|22|0|11
Cashew butter, plain, added|oz|166|5|8|14
Ham, center slice, unheated|oz|58|6|0|4
Sandwich spread, pork, beef|oz|67|2|3|5
Candies, NESTLE, CHUNKY Bar|serving 1.4 oz bar|190|3|24|11
Sweet potato, frozen, baked|cup, cubes|176|3|41|0
Ground beef, 75% lean, loaf|serving ( 3 oz )|216|21|0|14
Ground beef, 70% lean, loaf|serving ( 3 oz )|205|20|0|13
Pie fillings, apple, canned|serving|85|0|22|0
Ground beef, 80% lean, loaf|serving ( 3 oz )|216|22|0|14
Ground beef, 95% lean, loaf|serving ( 3 oz )|148|23|0|5
Almond butter, plain, added|tbsp|98|3|3|9
Potato, red, flesh and skin|1/2 cup, diced|52|1|12|0
Potato, flesh and skin, raw|1/2 cup, diced|58|2|13|0
Peaches, canned, juice pack|cup|110|2|29|0
Croissant, with egg, cheese|sandwich|527|21|27|37
Cheese, goat, semisoft type|oz|103|6|0|8
Cheese, ricotta, whole milk|cup|428|28|8|32
Corn-based, extruded, cones|oz|145|2|18|8
Milk, indian buffalo, fluid|cup|237|9|13|17
Potato chips, plain, salted|oz|154|2|14|10
Ground beef, 90% lean, loaf|serving ( 3 oz )|182|23|0|9
Ground beef, 85% lean, loaf|serving ( 3 oz )|204|22|0|12
Tomato juice, canned, added|cup|41|2|10|0
Turkey, enhanced, dark meat|serving|134|22|0|5
Turkey, light meat, roasted|serving|125|26|0|2
Shake, fast food, chocolate|small 12 fl oz|358|10|58|10
Popcorn, microwave, low fat|oz|120|4|20|3
Corn-based, extruded, chips|oz|147|2|18|8
Cereal, POST, COCOA PEBBLES|3/4 cup (1 NLEA serving)|115|1|25|1
Cereal, GENERAL MILLS, TRIX|cup (1 NLEA serving)|123|2|27|1
Burrito, with beans, cheese|burrito|434|17|56|16
Peaches, canned, water pack|half, with liquid|24|0|6|0
Grapefruit juice, pink, raw|cup|96|1|23|0
Syrups, corn, high-fructose|tbsp|53|0|14|0
Bread, whole-wheat, toasted|oz|87|5|14|1
Muffins, corn, toaster-type|oz|98|2|16|3
Chimichanga, with beef and cheese|chimichanga|443|20|39|23
Macaroni, vegetable, cooked|cup spiral shaped|172|6|36|0
Turkey, wing, meat and skin|wing, bone removed|426|51|0|23
Bread, reduced-calorie, rye|oz|58|3|12|1
Bread, boston brown, canned|slice|88|2|20|1
Turkey, back, meat and skin|cup, chopped or diced|342|37|0|20
Cereal, wheat germ, toasted|cup|432|33|56|12
Turkey, retail parts, thigh|3 oz|135|21|0|5
Soup, tomato bisque, canned|cup (8 fl oz)|198|6|29|7
Soup, beef mushroom, canned|cup (8 fl oz)|73|6|6|3
Soup, bean with ham, canned|cup (8 fl oz)|231|13|27|8
Soup, chicken gumbo, canned|cup|56|3|8|1
Soup, chicken broth, canned|cup (8 fl oz)|39|5|1|1
FRANCO-AMERICAN Slow Roast Turkey Gravy|1/4 cup|25|1|4|0
Cereal, POST TOASTIES corn flakes|cup (1 NLEA serving)|101|2|24|0
Cereal, KASHI 7 Whole Grain Puffs|cup (1 NLEA serving)|64|2|15|0`;

const USDA_MORE = `KRAFT VELVEETA Pasteurized Process Cheese Spread|oz|85|5|3|6
KRAFT CHEEZ WHIZ Pasteurized Process Cheese Sauce|2 tbsp|91|4|3|7
BURGER KING, Premium Fish Sandwich|sandwich|572|23|59|27
TACO BELL, BURRITO SUPREME with beef|burrito|441|17|56|16
PIZZA HUT 14" Cheese Pizza, Pan Crust|slice|309|12|37|13
PIZZA HUT 12" Cheese Pizza, Pan Crust|slice|280|12|30|13
TACO BELL, BURRITO SUPREME with steak|item|454|23|50|18
BURGER KING, Original Chicken Sandwich|sandwich|569|24|52|29
PIZZA HUT 14" Sausage Pizza, Pan Crust|slice|359|14|37|17
KENTUCKY FRIED CHICKEN, Popcorn Chicken|piece|22|1|1|1
TACO BELL, BURRITO SUPREME with chicken|item|444|24|51|16
PIZZA HUT 14" Pepperoni Pizza, Pan Crust|slice|329|13|36|15
PIZZA HUT 12" Pepperoni Pizza, Pan Crust|slice|286|12|29|14
PAPA JOHN'S 14" Cheese Pizza, Thin Crust|slice|257|11|23|14
WENDY'S, Ultimate Chicken Grill Sandwich|item|403|33|42|11
PIZZA HUT 14" Cheese Pizza, Stuffed Crust|slice|321|14|35|14
WENDY'S, Homestyle Chicken Fillet Sandwich|item|492|32|50|19
LITTLE CAESARS 14" Cheese Pizza, Thin Crust|slice|148|8|11|8
PAPA JOHN'S 14" Cheese Pizza, Original Crust|slice|304|14|38|11
DOMINO'S 14" Cheese Pizza, Crunchy Thin Crust|slice|209|9|20|11
PIZZA HUT 14" Cheese Pizza, Hand-Tossed Crust|slice|289|13|35|11
PIZZA HUT 12" Cheese Pizza, Hand-Tossed Crust|slice|260|12|30|10
PIZZA HUT 14" Sausage Pizza, Hand-Tossed Crust|slice|342|14|35|16
DOMINO'S 14" Sausage Pizza, Crunchy Thin Crust|slice|249|10|20|14
BURGER KING, CROISSAN'WICH with Egg and Cheese|item|311|11|27|17
KELLOGG, KELLOGG'S RICE KRISPIES TREATS Squares|serving|91|1|18|2
PAPA JOHN'S 14" Pepperoni Pizza, Original Crust|slice|338|15|37|15
PAPA JOHN'S 14" The Works Pizza, Original Crust|slice|367|16|41|16
PIZZA HUT 12" Pepperoni Pizza, Hand-Tossed Crust|slice|269|12|30|11
PIZZA HUT 14" Cheese Pizza, THIN 'N CRISPY Crust|slice|242|11|27|10
PIZZA HUT 14" Pepperoni Pizza, Hand-Tossed Crust|slice|320|14|35|14
PIZZA HUT 12" Cheese Pizza, THIN 'N CRISPY Crust|slice|209|11|20|10
DOMINO'S 14" Pepperoni Pizza, Crunchy Thin Crust|slice|259|11|20|15
PIZZA HUT 14" Sausage Pizza, THIN 'N CRISPY Crust|slice|297|13|26|16
BURGER KING, CROISSAN'WICH with Sausage and Cheese|item|493|18|30|33
DOMINO'S 14" Cheese Pizza, Ultimate Deep Dish Crust|slice|313|13|40|12
PEPSICO QUAKER, Gatorade G2|8 fl oz|19|0|5|0
PIZZA HUT 14" Pepperoni Pizza, THIN 'N CRISPY Crust|slice|266|11|26|13
DOMINO'S 14" Sausage Pizza, Ultimate Deep Dish Crust|slice|357|14|40|16
DOMINO'S 14" Cheese Pizza, Classic Hand-Tossed Crust|slice|278|12|36|10
PIZZA HUT 12" Super Supreme Pizza, Hand-Tossed Crust|slice|309|14|32|14
PIZZA HUT 14" Super Supreme Pizza, Hand-Tossed Crust|slice|305|14|32|14
BURGER KING, WHOPPER, no cheese|item|678|31|54|37
McDONALD'S Bacon Ranch Salad with Crispy Chicken|item 11.3 oz|389|28|19|20
KELLOGG'S, SPECIAL K Protein Shake|serving|189|10|27|5
BURGER KING, WHOPPER, with cheese|item|790|35|53|48
WENDY'S, Double Stack, with cheese|sandwich|416|27|22|24
WENDY'S, Jr. Hamburger, with cheese|item|330|17|32|15
WENDY'S, CLASSIC DOUBLE, with cheese|item|747|51|36|44
KELLOGG'S SPECIAL K20, protein water mix|packet|55|5|8|0
WENDY'S, Jr. Hamburger, without cheese|item|284|15|33|10
SILK Vanilla soy yogurt (single serving size)|container|150|5|25|3
KELLOGG'S, NUTRI-GRAIN Cereal Bars, fruit|bar|120|2|26|3
PEPSICOLA, SOBE Energize Energy Juice Drinks|8 fl oz|108|0|27|0
Cheese sauce, prepared from recipe|cup|479|25|13|36
DIGIORNO Pizza, cheese topping, rising crust|slice 1/4 of pie|468|23|58|16
WENDY'S, CLASSIC SINGLE Hamburger, no cheese|item|464|28|37|23
McDONALD'S, Fruit 'n Yogurt Parfait|item 5.2 oz|156|4|31|2
DIGIORNO Pizza, supreme topping, rising crust|slice 1/4 of pie|579|27|63|24
McDONALD'S, BIG 'N TASTY with Cheese|item|573|27|40|36
McDONALD'S, Sausage Biscuit with Egg|item 5.7 oz|507|18|31|36
Chicken fillet sandwich, with cheese|sandwich|632|29|42|39
WENDY'S, CLASSIC SINGLE Hamburger, with cheese|item|522|35|34|27
McDONALD'S, Sausage McMUFFIN with Egg|item 5.8 oz|452|21|28|29
PACE, Salsa Refried Beans|serving|72|4|14|0
Potato, french fried in vegetable oil|serving small|222|2|29|10
Burrito, with fruit (apple or cherry)|burrito, large|484|5|73|20
Hamburger; single, large patty; plain|sandwich|426|23|32|23
DIGIORNO Pizza, pepperoni topping, rising crust|slice 1/4 of pie|549|26|64|21
McDONALD'S, Vanilla TRIPLE THICK Shake|12 fl oz cup child size|415|9|71|12
McDONALD'S, Bacon Egg & Cheese Biscuit|item 4.9 oz|432|19|32|27
HOT POCKETS Ham 'N Cheese Stuffed Sandwich, frozen|serving (1 hot pocket)|306|12|39|12
Hamburger; single, regular patty; plain|sandwich|232|13|25|9
McDONALD'S, QUARTER POUNDER with Cheese|item 7.1 oz|513|29|40|28
DIGIORNO Pizza, cheese topping, thin crispy crust|slice 1/4 of pie|398|21|43|16
Fortified low calorie fruit juice beverage|16.9 fl oz|19|0|3|0
McDONALD'S, Chocolate TRIPLE THICK Shake|12 fl oz cup child size|435|10|74|12
Cookies, oatmeal|oz|128|2|20|5
McDONALD'S, Caesar Salad without chicken|item 7.5 oz|94|7|9|4
Cheeseburger; single, large patty; plain|sandwich|564|32|44|29
TACO BELL, Soft Taco with beef, cheese and lettuce|each taco|210|9|21|10
DIGIORNO Pizza, supreme topping, thin crispy crust|slice 1/4 of pie|395|18|44|17
FARLEY CANDY, FARLEY Fruit Snacks, with vitamins A|pouch|89|1|21|0
Potato chips, sour-cream-and-onion-flavor|oz|151|2|15|10
Candy bits, yogurt covered with vitamin C|package|83|0|17|2
McDONALD'S, Strawberry TRIPLE THICK Shake|12 fl oz cup child size|419|9|71|12
Wonton wrappers (includes egg roll wrappers)|oz|82|3|16|0
Breakfast bar, corn flake crust with fruit|oz|107|1|21|2
Potato, baked and topped with cheese sauce|piece|474|15|46|29
Cheeseburger; triple, regular patty; plain|item|772|45|40|48
Cheeseburger; double, regular patty; plain|item|459|26|31|26
Cheeseburger; single, regular patty; plain|sandwich|280|15|26|13
DIGIORNO Pizza, pepperoni topping, thin crispy crust|slice 1/4 of pie|410|19|42|19
DIGIORNO Pizza, cheese topping, cheese stuffed crust|slice 1/4 of pie|458|22|49|19
Fish sandwich, with tartar sauce and cheese|sandwich|374|15|35|20
Tortilla chips, light (baked with less oil)|cup, crushed|293|6|46|10
PACE, Traditional Refried Beans|serving|80|5|13|0
McDONALD'S, Caesar Salad with Crispy Chicken|item 10.9 oz|349|26|19|16
Chimichanga, with beef and red chili peppers|chimichanga|424|18|46|19
McDONALD'S, Bacon Ranch Salad without chicken|item 7.8 oz|136|9|9|8
McDONALD'S, Caesar Salad with Grilled Chicken|item 10.4 oz|201|29|11|6
PACE, Spicy Jalapeno Refried Beans|serving|76|5|14|0
McDONALD'S, DOUBLE QUARTER POUNDER with Cheese|item|734|48|40|45
McDONALD'S, Vanilla Reduced Fat Ice Cream Cone|item 3.175 oz|146|4|24|4
M&M MARS, COMBOS Snacks Cheddar Cheese Pretzel|oz|131|3|19|5
McDONALD'S, McDONALDLAND Chocolate Chip Cookies|2 oz|269|3|37|13
Hamburger; single, large patty; with condiments|item|438|27|38|20
ABBOTT, ENSURE, Nutritional Shake|8 fl oz|267|10|43|6
McDONALD'S, Premium Crispy Chicken Club Sandwich|item 9 oz|635|39|57|30
Hamburger; double, regular patty; with condiments|item|576|32|39|32
Hamburger; single, regular patty; with condiments|sandwich|255|13|29|10
McDONALD'S, Premium Grilled Chicken Club Sandwich|item 7.9 oz|493|38|44|18
McDONALD'S, Bacon Ranch Salad with Grilled Chicken|item 10.8 oz|247|31|11|10
Cheeseburger; single, large patty; with condiments|item|535|30|39|29
Cheeseburger; double, large patty; with condiments|item|762|48|40|45
UNILEVER, SLIMFAST Shake Mix, powder|scoop|99|2|17|4
McDONALD'S, McCHICKEN Sandwich (without mayonnaise)|item|331|15|43|12
Potato, baked and topped with sour cream and chives|piece|393|7|50|22
McDONALD'S, Premium Crispy Chicken Classic Sandwich|item|524|28|59|20
Tostada, with beans, beef|piece|333|16|30|17
McDONALD'S, Premium Grilled Chicken Classic Sandwich|item 7 oz|366|28|45|9
McDONALD'S, Apple Dippers with Low Fat Caramel Sauce|item|99|0|23|1
Potato, baked and topped with cheese sauce and bacon|piece|451|18|44|26
Potato, baked and topped with cheese sauce and chili|piece|482|23|56|22
Cheeseburger; double, regular patty; with condiments|sandwich|437|25|28|25
Cheese, cheddar, reduced fat|slice|65|6|1|4
Granola bars, soft, uncoated|bar (1.5 oz)|193|3|29|8
Cheese, mexican, queso anejo|oz|106|6|1|8
Grapefruit juice, white, raw|cup|96|1|23|0
Enchirito, with cheese, beef|enchirito|344|18|34|16
Apricots, canned, water pack|cup, halves|66|2|16|0
Apricots, canned, juice pack|cup, halves|117|2|30|0
Apple, raw, golden delicious|large|123|1|29|0
Ice cream, light, soft serve|medium|420|10|69|11
COCA-COLA, POWERADE, lemon-lime flavored|fl oz|10|0|2|0
Ham, egg, and cheese sandwich|sandwich|347|19|31|16
Pineapple, canned, juice pack|cup, chunks|109|1|28|0
Pineapple, canned, water pack|cup, crushed, sliced, or chunks|79|1|20|0
Fruit salad, tropical, canned|cup|221|1|58|0
Potato chips, plain, unsalted|oz|152|2|15|10
Popcorn, oil-popped, unsalted|oz|142|3|16|8
Yogurt, fruit variety, nonfat|cup (8 fl oz)|233|11|47|0
Tortilla chips, yellow, plain|oz|141|2|19|6
Bagel, with egg, sausage patty|item|646|28|50|37
Chimichanga, with beef, cheese|chimichanga|364|15|38|18
Yogurt, chocolate, nonfat milk|container (6 oz)|190|6|40|0
UNILEVER, SLIMFAST Shake Mix, high protein|scoop|96|7|12|3
Hamburger, large, single patty|item|438|27|38|20
Fried Chicken, Wing, meat only|wing, wing with skin|148|18|2|7
Tangerines, canned, juice pack|cup|92|2|24|0
Hamburger, large, triple patty|sandwich|692|50|29|42
Cheese, provolone, reduced fat|oz|78|7|1|5
Cheese, mozzarella, whole milk|oz|85|6|1|6
Potato chips, fat free, salted|oz|107|3|24|0
Cheese, mexican, queso asadero|oz|101|6|1|8
Popcorn, oil-popped, microwave|oz|165|2|13|12
Grapefruit juice, white, canned|cup|94|1|22|0
Fruit salad, canned, juice pack|cup|124|1|32|0
PEPSICO QUAKER, Gatorade, G performance O 2|8 fl oz|63|0|16|0
Cheese, ricotta, part skim milk|cup|339|28|13|20
Fruit salad, canned, water pack|cup|74|1|19|0
Cereal, KASHI 7 Whole Grain Flakes|cup (1 NLEA serving)|168|6|41|1
Macaroni and Cheese, canned entree|serving|200|8|28|6
Macaroni and cheese, frozen entree|cup|204|8|24|9
Fruit salad, canned, light syrup|cup|146|1|38|0
Passion-fruit juice, purple, raw|cup|126|1|34|0
Fruit salad, canned, heavy syrup|cup|186|1|49|0
Cheese, cottage, with vegetables|cup|215|25|7|10
English muffin, with egg, cheese|item|472|22|29|30
Granola bar, KASHI GOLEAN, chewy|bar|304|13|50|6
Popcorn, microwave, 94% fat free|oz|114|3|22|2
Ice cream, soft serve, chocolate|1/2 cup|191|4|19|11
Cheese food, cold pack, American|oz|94|6|2|7
Cheese, mexican, queso chihuahua|oz|106|6|2|8
Yogurt, Greek, CHOBANI CHAMPIONS|container|99|8|13|2
Bagel, with breakfast steak, egg|item|716|40|58|36
Passion-fruit juice, yellow, raw|cup|148|2|36|0
Lemon juice, frozen, unsweetened|cup|54|1|16|1
Ice cream cones, cake or wafer-type|oz|118|2|22|2
V8 SPLASH Juice Drinks, Mango Peach|serving 8 oz|80|0|20|0
Cereal, GENERAL MILLS Cinnamon CHEX|3/4 cup (1 NLEA serving)|121|2|25|2
Cereal, KASHI 7 Whole Grain Nuggets|1/2 cup (1 NLEA serving)|206|7|47|2
Cereal, WEETABIX WHOLE WHEAT CEREAL|cup|213|7|44|2
V8 SPLASH Juice Drinks, Berry Blend|serving 8 oz|70|0|18|0
Beef broth and tomato juice, canned|fl oz|11|0|3|0
Fast Food, Pizza Chain, 14" pizza|slice|285|12|36|10
Pizza, cheese topping, thin crust|slice|180|8|20|8
Cheese, Swiss, nonfat or fat free|serving|36|8|1|0
Cheese, low fat, cheddar or colby|oz|49|7|0|2
Granola bars, hard, peanut butter|oz|137|3|18|7
Granola bar, KASHI TLC Bar, chewy|bar|150|6|19|6
Granola bar, fruit-filled, nonfat|oz|97|2|22|0
Tortilla chips, low fat, unsalted|oz|118|3|23|2
Tortilla chips, plain, white corn|oz|134|2|19|6
Granola bar, chewy, reduced sugar|bar|99|1|17|3
Cranberry-apple juice drink, bottled|fl oz|19|0|5|0
Beans, baked|cup|392|14|55|13
Cranberry-grape juice drink, bottled|fl oz|17|0|4|0
Cereal, Ralston Enriched Bran flakes|cup|130|4|34|1
V8 SPLASH Juice Drinks, Fruit Medley|serving 8 oz|80|0|19|0
Chili with beans, microwavable bowls|cup|244|14|26|9
Popcorn, air-popped, white popcorn|oz|108|3|22|1
Cheese, pasteurized process, swiss|oz|95|7|1|7
Corn-based, extruded, onion-flavor|oz|141|2|18|6
Granola bar, KASHI GOLEAN, crunchy|bar|185|8|28|4
Granola bars, hard, chocolate chip|oz|124|2|20|5
SLIMFAST, Meal replacement, High Protein Shake|bottle|171|19|2|8
Ice cream sandwich, vanilla, light|serving|140|4|30|2
Griddle cake sandwich, egg, cheese|item 6.1 oz|473|21|46|23
Popcorn, oil-popped, white popcorn|oz|142|3|16|8
Tangerine juice, canned, sweetened|cup|124|1|30|0
Juice, apple, grape and pear blend|8 fl oz|130|0|32|0
V8 SPLASH Juice Drinks, Orchard Blend|serving 8 oz|80|0|19|0
Yogurt, vanilla flavor, lowfat milk|container|146|8|24|2
Cheese, cheddar, nonfat or fat free|serving|44|9|2|0
Granola bar, KASHI TLC Bar, crunchy|2 bar|178|6|25|6
Pizza, cheese topping, rising crust|serving 4 servings per 19.7 oz package|387|18|49|13
Cranberry-apricot juice drink, bottled|fl oz|20|0|5|0
Orange and apricot juice drink, canned|fl oz|16|0|4|0
V8 SPLASH Juice Drinks, Tropical Blend|serving 8 oz|70|0|18|0
Cereal, POST SELECTS Blueberry Morning|1.25 cup (1 NLEA serving)|217|4|45|3
V8 V. FUSION Juices, Strawberry Banana|serving 8 oz|121|1|29|0
V8 SPLASH Smoothies, Strawberry Banana|serving 8 oz|91|3|20|0
Cheese, pasteurized process, pimento|oz|106|6|0|9
Cheese, low-sodium, cheddar or colby|oz|113|7|0|9
Pineapple juice, canned, unsweetened|cup|132|1|32|0
Vanilla, light, soft-serve ice cream|item|196|5|32|6
Pizza, cheese topping, regular crust|package 8 oz pizza|533|21|58|24
Tortilla chips, unsalted, white corn|cup|131|2|17|6
V8 SPLASH Juice Drinks, Strawberry Kiwi|serving 8 oz|70|0|18|0
Cereal, KASHI 7 Whole Grain Honey Puffs|cup (1 NLEA serving)|105|3|24|0
Cereal, POST SELECTS Maple Pecan Crunch|3/4 cup (1 NLEA serving)|210|4|40|4
Orange, raw, all commercial varieties|cup, sections|85|2|21|0
Corn-based, extruded, puffs or twists|oz|160|2|15|10
Snack, Pretzel, hard chocolate coated|serving|131|2|20|5
Cheese, pasteurized process, American|oz|104|5|1|9
Yogurt, frozen, flavors not chocolate|1/2 cup|71|3|13|0
Popcorn, caramel-coated, with peanuts|2 oz|228|4|46|4
Cereal, KELLOGG'S KRAVE chocolate cereal|3/4 cup (1 NLEA serving)|123|2|24|3
Spaghetti with meat sauce, frozen entree|serving|255|14|43|3
Pineapple and orange juice drink, canned|fl oz|16|0|4|0
V8 SPLASH Juice Drinks, Diet Berry Blend|serving 8 oz|10|0|3|0
V8 SPLASH Juice Drinks, Orange Pineapple|serving 8 oz|70|0|18|0
Popcorn, sugar syrup/caramel, fat-free|oz|108|1|26|0
Popcorn, microwave, low fat and sodium|oz|122|4|21|3
Fruit salad, canned, extra heavy syrup|cup|228|1|59|0
Chili con carne with beans, canned entree|cup|259|14|32|8
Chocolate syrup, prepared with whole milk|cup (8 fl oz)|254|9|36|8
V8 SPLASH Juice Drinks, Strawberry Banana|serving 8 oz|70|0|18|0
V8 SPLASH Juice Drinks, Diet Fruit Medley|serving 8 oz|10|0|3|0
Bread, Multi-Grain (includes whole-grain)|oz|75|4|12|1
Cheese food, pasteurized process, swiss|oz|92|6|1|7
Pizza, pepperoni topping, regular crust|serving|432|16|42|22
Popcorn, caramel-coated, without peanuts|oz|122|1|22|4
Granola bar, soft, milk chocolate coated|oz|152|3|15|9
Taco with beef, cheese and lettuce, soft|each taco|210|9|21|10
Cereal, KASHI GOLEAN CRISP Cinnamon Crumble|3/4 cup (1 NLEA serving)|195|10|34|4
Cereal, POST GREAT GRAINS Banana Nut Crunch|cup (1 NLEA serving)|240|6|43|6
V8 SPLASH Juice Drinks, Guava Passion Fruit|serving 8 oz|80|0|19|0
V8 SPLASH Juice Drinks, Diet Tropical Blend|serving 8 oz|10|0|3|0
Fruit punch juice drink, frozen concentrate|fl oz|62|0|15|0
Granola bar, GENERAL MILLS, NATURE VALLEY|bar|148|2|26|4
Tortilla chips, nacho-flavor, reduced fat|oz|126|2|20|4
Potato chips, fat-free, made with olestra|oz|78|2|18|0
Bread, french or vienna (includes sourdough)|oz|82|3|16|0
Cookies, vanilla sandwich with creme filling|oz|137|1|20|6
Pineapple and grapefruit juice drink, canned|fl oz|15|0|4|0
Carbonated beverage, chocolate-flavored soda|fl oz|13|0|3|0
Citrus fruit juice drink, frozen concentrate|fl oz|57|0|14|0
V8 SPLASH Juice Drinks, Diet Strawberry Kiwi|serving|10|0|3|0
Cereal, frosted oat cereal with marshmallows|3/4 cup|116|2|25|1
Salad, vegetables tossed, without dressing|1.5 cup|267|26|5|16
McDONALD'S, Bacon, Egg & Cheese McGRIDDLES|item 5.8 oz|449|20|43|22
Lime juice, canned or bottled, unsweetened|cup|52|1|16|1
Egg substitute, liquid or frozen, fat free|cup|115|24|5|0
Tortilla chips, low fat, made with olestra|oz|90|2|18|1
Cheese puffs and twists, corn based, baked|oz|122|2|20|3
Cheese food, pasteurized process, American|cup|373|19|10|29
Ice cream, bar or stick, chocolate covered|bar|166|2|12|12
Chocolate-flavored drink, whey and milk based|cup|120|2|26|1
Granola bar, with coconut, chocolate coated|oz|151|2|16|9
Grapefruit juice, white, frozen concentrate|cup|101|1|24|0
Grape juice, canned or bottled, unsweetened|cup|152|1|37|0
Popcorn, microwave, regular (butter) flavor|cup|44|1|4|3
Protein supplement, milk based, Muscle Milk|tbsp|45|5|2|2
Taco with chicken, lettuce and cheese, soft|each taco|185|13|19|6
Cheeseburger, double, regular patty and bun|sandwich|437|25|28|25
Soy sauce made from hydrolyzed vegetable protein|1/4 cup|35|4|4|0
Macaroni and cheese, box mix with cheese sauce|cup prepared|310|13|44|9
Cereal, KELLOGG'S SPECIAL K Chocolatey Delight|3/4 cup (1 NLEA serving)|118|2|25|2
Chocolate-flavor beverage mix for milk, powder|serving|88|1|20|0
Cereal, chocolate-flavored frosted puffed corn|cup|122|1|26|1
Apple juice, frozen concentrate, unsweetened|cup|112|0|28|0
Orange-grapefruit juice, canned, unsweetened|cup|106|2|25|0
McDONALD'S, Sausage, Egg & Cheese McGRIDDLES|item 7 oz|563|21|44|35
Yogurt, vanilla or lemon flavor, nonfat milk|container (6 oz)|73|7|13|0
Ice cream cone, chocolate covered, with nuts|unit|340|5|33|21
Cheese spread, pasteurized process, American|slice|99|6|3|7
Cheese product, pasteurized process, cheddar|slice 1 oz|67|5|3|4
Cereal, KELLOGG's FIBERPLUS Cinnamon Oat Crunch|3/4 cup (1 NLEA serving)|113|3|26|1
Cereal, KELLOGG'S KRAVE double chocolate cereal|3/4 cup (1 NLEA serving)|119|2|23|3
English muffins, mixed-grain (includes granola)|oz|67|3|13|0
Cereal, KELLOGG'S APPLE JACKS with marshmallows|cup (1 NLEA serving)|106|1|25|1
Cereal, KELLOGG's FIBERPLUS Berry Yogurt Crunch|cup (1 NLEA serving)|167|4|43|1
Snack, potato chips, made from dried potatoes|oz|158|1|15|11
Milk substitutes, fluid, with lauric acid oil|cup|149|4|15|8
Cheese product, pasteurized process, American|slice 3/4 oz|50|4|2|3
Orange juice, chilled, fortified with calcium|cup|117|2|28|0
Orange juice, frozen concentrate, unsweetened|cup|452|7|108|1
Cereal, KASHI GOLEAN CRISP Toasted Berry Crumble|3/4 cup (1 NLEA serving)|184|9|35|4
Tangerine juice, frozen concentrate, sweetened|cup|111|1|27|0
Yogurt parfait, lowfat, with fruit and granola|item|125|5|24|2
Taco with beef, cheese and lettuce, hard shell|each taco|156|6|14|9
Cereal, POST GREAT GRAINS Cranberry Almond Crunch|3/4 cup (1 NLEA serving)|184|4|37|3
M&M MARS, KUDOS Whole Grain Bars, peanut butter|bar|130|2|18|6
Crispy chicken, bacon, and tomato club sandwich|sandwich|696|42|61|32
Cookies, oatmeal, baked|oz|134|2|19|6
Fried Chicken, Wing, meat and skin and breading|wing, with skin|201|13|7|13
M&M MARS, KUDOS Whole Grain Bar, chocolate chip|bar|118|1|20|4
Granola bars, QUAKER OATMEAL TO GO, all flavors|bar|233|4|45|4
Milk dessert bar, frozen, made from lowfat milk|bar|100|3|22|1
Pizza, meat and vegetable topping, rising crust|serving 6 servings per 30.7 oz package|404|19|43|18
Pineapple juice, frozen concentrate, unsweetened|cup|128|1|32|0
Potato chips, made from dried potatoes, fat-free|oz|72|1|16|0
Cheese, pasteurized process, cheddar or American|slice (3/4 oz)|31|5|3|0
Pizza, meat and vegetable topping, regular crust|serving 5 servings per 24.2 oz package|395|16|36|21
Protein supplement, milk based, Muscle Milk Light|2 scoop|198|25|11|6
Cookies, oatmeal, fat-free|oz|92|2|22|0
Potato chips, made from dried potatoes, reduced fat|oz|142|1|18|7
Cookies, oatmeal, soft-type|oz|116|2|19|4
Cheeseburger; single, regular patty, with condiments|item|343|17|32|16
Bread, pumpernickel, toasted|oz|78|3|15|1
Cereal, QUAKER, KING VITAMAN|1.5 cup (1 NLEA serving)|118|2|26|1
Cereal, GENERAL MILLS, TOTAL|1.25 cup (1 NLEA serving)|190|4|45|1
Cereal, POST, FRUITY PEBBLES|3/4 cup (1 NLEA serving)|109|1|23|1
Cereal, QUAKER, hominy grits|1/4 cup|128|3|29|0
Chicken, wing, meat and skin|piece|216|20|0|14
Crackers, melba toast, plain|1/2 oz|55|2|11|0
Turkey, whole, meat and skin|3 oz|161|24|0|6
Shake, fast food, strawberry|small 12 fl oz|319|10|53|8
Orange juice, light, No pulp|8 fl oz|50|0|13|0
Crackers, melba toast, wheat|1/2 oz|53|2|11|0
Cereal, POST, Shredded Wheat|serving|155|5|36|1
Cereal, QUAKER, CAP'N CRUNCH|3/4 cup (1 NLEA serving)|107|1|23|1
Turkey, retail parts, breast|3 oz|116|25|0|2
Turkey, wing, from whole bird|3 oz|125|26|0|2
Bread, reduced-calorie, white|oz|59|2|13|1
Bread, chapati or roti, plain|piece|202|8|32|5
Turkey, from whole, dark meat|serving|147|24|0|5
Energy drink, Original, grape|16 fl oz|211|0|54|0
Egg rolls, pork, refrigerated|oz|63|3|8|2
Cookies, peanut butter, baked|oz|143|3|16|8
Cereal, MALT-O-MEAL, original|3 tbsp (1 NLEA serving)|128|4|27|0
Crackers, cheese, whole grain|serving 55 pieces|128|3|18|5
Crackers, cheese, reduced fat|serving|125|3|20|4
Cereal, QUAKER, Instant Grits|packet|100|2|21|2
Macaroni, whole-wheat, cooked|cup elbow shaped|174|8|37|1
Turkey, back, from whole bird|3 oz|147|24|0|5
Bread, reduced-calorie, wheat|oz|62|4|12|1
Pasta, homemade, made with egg|2 oz|74|3|13|1
Crackers, matzo, egg and onion|1/2 oz|56|1|11|1
Cereal, GENERAL MILLS, BASIC 4|cup (1 NLEA serving)|197|4|44|2
Cereal, MALT-O-MEAL, chocolate|3 tbsp (1 NLEA serving)|127|4|28|0
Cereal, POST, Honeycomb Cereal|1.5 cup (1 NLEA serving)|127|2|28|1
Turkey, retail parts, enhanced|3 oz|110|24|0|2
Ravioli, cheese-filled, canned|cup|186|6|33|4
Turkey, thigh, from whole bird|3 oz|134|22|0|5
Turkey roast, frozen, seasoned|cup, chopped or diced|209|29|4|8
Cereal, QUAKER, Shredded Wheat|3 biscuits (1 NLEA serving)|219|7|51|1
Burrito, beef and bean, frozen|oz|68|2|9|3
Chili, no beans, canned entree|cup|283|18|15|17
Spaghetti, whole-wheat, cooked|cup|174|8|37|1
Cookies, chocolate chip, baked|oz|139|1|19|6
Cereal, NATURE'S PATH, OPTIMUM|cup|190|8|40|2
Cereal, MALT-O-MEAL, COCO-ROOS|3/4 cup (1 NLEA serving)|119|1|26|1
Turkey, skin, from retail parts|oz|117|7|0|10
Turkey from whole, neck, cooked|serving|138|19|0|6
Cereal, POST, GRAPE-NUTS Cereal|1/2 cup (1 NLEA serving)|204|6|48|1
Cereal, GENERAL MILLS, CHEERIOS|cup (1 NLEA serving)|106|3|20|2
Cereal, CREAM OF WHEAT, instant|cup|149|4|32|1
Bread, reduced-calorie, oatmeal|oz|60|2|12|1
Turkey, retail parts, drumstick|3 oz|167|24|0|8
Ground turkey, 93% lean, 7% fat|3 oz|181|23|0|10
Cereal, GENERAL MILLS, WHEATIES|3/4 cup (1 NLEA serving)|95|2|22|1
Cereal, QUAKER, Instant Oatmeal|packet (1 NLEA serving)|158|4|34|2
Cereal, QUAKER, QUAKER OAT LIFE|1/2 cup|79|2|16|1
Cereal, POST, GRAPE-NUTS Flakes|3/4 cup (1 NLEA serving)|109|3|24|1
Candies, MR. GOODBAR Chocolate Bar|bar (2.6 oz)|393|8|40|24
Candies, WHATCHAMACALLIT Candy Bar|bar 1.7 oz|237|4|30|11
Peanut butter with omega-3, creamy|tbsp|97|4|3|9
Burrito, bean and cheese, frozen|burrito|285|9|44|8
Cereal, MALT-O-MEAL, Crispy Rice|1.25 cup (1 NLEA serving)|126|2|28|0
Egg rolls, chicken, refrigerated|oz|56|3|8|1
Cereal, GENERAL MILLS, BOO BERRY|cup (1 NLEA serving)|127|2|28|1
Pasta, fresh-refrigerated, plain|4.5 oz|369|14|70|3
Cereal, MALT-O-MEAL, Apple ZINGS|cup (1 NLEA serving)|130|2|28|1
Bread, reduced-calorie, oat bran|oz|57|2|12|1
Pie, apple, prepared from recipe|oz|75|1|10|4
Turkey sticks, breaded, battered|stick (2.25 oz)|179|9|11|11
Ground turkey, fat free, patties|oz|39|8|0|1
Cereal, QUAKER, Christmas Crunch|serving (1 NLEA serving)|103|1|22|1
Cereal, GENERAL MILLS, Rice CHEX|cup (1 NLEA serving)|101|2|23|0
Drink mix, QUAKER OATS, GATORADE|scoop powder|89|0|22|0
Ground turkey, 85% lean, 15% fat|3 oz|219|21|0|15
Cereal, GENERAL MILLS, FIBER ONE|cup (1 NLEA serving)|172|3|41|3
Cereal, GENERAL MILLS, Honey KIX|1.25 cup (1 NLEA serving)|120|2|27|1
Cereal, MALT-O-MEAL, CORN BURSTS|cup (1 NLEA serving)|119|1|28|0
Candies, REESE'S Peanut Butter Cups|package 1.6 oz 2 cups|232|5|25|14
Candies, SPECIAL DARK Chocolate Bar|bar 2.6 oz|406|4|44|24
Soy protein isolate, potassium type|oz|92|23|3|0
Turkey, enhanced, skin from whole|serving|383|19|0|34
Cookies, peanut butter, soft-type|oz|130|2|16|7
Bread, naan (Indian bread), plain|piece|262|9|45|5
Rolls, hamburger or hotdog, plain|oz|79|3|14|1
Pasta, homemade, made without egg|2 oz|71|2|14|1
Cookies, oatmeal, special dietary|oz|127|1|20|5
Cereal, farina, cooked with water|cup|127|4|26|1
Cereal, QUAKER, HONEY GRAHAM OH!S|3/4 cup (1 NLEA serving)|111|1|23|2
Taquitos, frozen, beef and cheese|piece|121|4|14|5
Cereal, GENERAL MILLS, Wheat CHEX|3/4 cup (1 NLEA serving)|162|5|39|1
Turkey patties, breaded, battered|patty (2.25 oz)|181|9|10|12
Cereal, MALT-O-MEAL, GOLDEN PUFFS|cup|147|2|33|0
Candies, SYMPHONY Milk Chocolate Bar|bar 1.5 oz|223|4|24|13
Cereal, MALT-O-MEAL, Honey BUZZERS|1.333 cup|115|2|25|1
Cereal, QUAKER, SWEET CRUNCH/QUISP|cup (1 NLEA serving)|110|1|23|2
Cereal, KELLOGG, KELLOGG'S MUESLIX|2/3 cup (1 NLEA serving)|196|5|40|3
Turkey, drumstick, from whole bird|3 oz|134|22|0|5
Cereal, KELLOGG, KELLOGG'S CRISPIX|cup (1 NLEA serving)|107|2|25|0
Cereal, GENERAL MILLS, COCOA PUFFS|3/4 cup (1 NLEA serving)|103|2|23|1
Cookies, chocolate chip, soft-type|oz|126|1|19|6
Cookies, chocolate chip, lower fat|oz|128|2|19|5
Cereal, QUAKER, QUAKER Puffed Rice|3/4 cup (1 NLEA serving)|54|1|12|0
Pasta, fresh-refrigerated, spinach|4.5 oz|370|14|71|3
Burrito, beef and bean, microwaved|oz|84|2|11|3
Cookies, peanut butter, sugar free|serving 3 cookies|152|3|15|9
Egg rolls, vegetable, refrigerated|oz|56|2|9|1
Turkey, diced, light and dark meat|oz|39|5|0|2
Turkey, light or dark meat, smoked|3 oz, boneless|177|24|0|8
Candies, REESE'S NUTRAGEOUS Candy Bar|bar 1.92 oz|279|6|28|17
Muffins, corn, prepared from recipe|oz|90|2|12|4
Bread, chapati or roti, whole wheat|piece|129|3|20|4
Cereal, QUAKER, QUAKER Puffed Wheat|cup (1 NLEA serving)|55|2|12|0
Cereal, GENERAL MILLS, LUCKY CHARMS|3/4 cup (1 NLEA serving)|103|2|22|1
Cereal, GENERAL MILLS, FRANKENBERRY|cup (1 NLEA serving)|127|2|28|1
Cereal, WHEATENA, cooked with water|cup|136|5|29|1
Cereal, GENERAL MILLS, COOKIE CRISP|3/4 cup (1 NLEA serving)|99|1|22|1
Cereal, BARBARA'S PUFFINS, original|3/4 cup (1 NLEA serving)|90|2|23|1
Beef, corned beef hash, with potato|cup|387|21|22|24
Cereal, MALT-O-MEAL, Frosted Flakes|3/4 cup (1 NLEA serving)|115|1|26|0
Cereal, oat, corn and wheat squares|cup (1 NLEA serving)|129|2|24|3
Cereal, NATURE'S PATH, OPTIMUM SLIM|cup|180|9|38|2
Bread, banana, prepared from recipe|slice|196|3|33|6
Macaroni, protein-fortified, cooked|cup small shells|189|9|36|0
Cookies, chocolate chip, higher fat|oz|139|1|19|7
Ice cream cones, sugar, rolled-type|oz|114|2|24|1
Cereal, QUAKER, QUAKER CRUNCHY BRAN|3/4 cup (1 NLEA serving)|89|2|23|1
Cereal, POST, HONEY BUNCHES OF OATS|2/3 cup (1 NLEA serving)|247|4|43|6
Frozen novelties, fruit and juice bars|bar (3 fl oz)|80|1|19|0
Candies, milk chocolate coated peanuts|cup|773|20|74|50
Candies, milk chocolate coated raisins|cup|702|7|123|27
Beans, liquid from stewed kidney beans|cup|113|4|7|8
Cereal, MALT-O-MEAL, COLOSSAL CRUNCH|3/4 cup (1 NLEA serving)|113|1|24|1
Cereal, KELLOGG, KELLOGG'S CORN POPS|cup (1 NLEA serving)|116|1|27|0
Cereal, QUAKER, Quick Oats with Iron|1/2 cup|148|6|27|3
Spaghetti, protein-fortified, cooked|cup|230|11|44|0
Cereal, QUAKER, 100% Natural Granola|1/2 cup (1 NLEA serving)|215|5|38|6
Taquitos, frozen, chicken and cheese|piece|119|4|14|5
Cereal, MALT-O-MEAL, TOOTIE FRUITIES|cup (1 NLEA serving)|128|2|28|1
Cereal, GENERAL MILLS, REESE'S PUFFS|3/4 cup (1 NLEA serving)|120|2|22|3
Cereal, GENERAL MILLS, OATMEAL CRISP|cup (1 NLEA serving)|216|5|43|4
Cereal, KELLOGG, KELLOGG'S SPECIAL K|cup (1 NLEA serving)|117|6|23|0
Pie, banana cream, prepared from mix|oz|71|1|9|4
Cereal, MUESLI, dried fruit and nuts|cup|289|8|66|4
Cereal, POST, Shredded Wheat n' Bran|1.25 cup (1 NLEA serving)|200|6|48|1
Cereal, GENERAL MILLS, COUNT CHOCULA|3/4 cup (1 NLEA serving)|103|2|23|1
KRAFT BREAKSTONE'S Reduced Fat Sour Cream|2 tbsp|47|1|2|4
Corn with red and green peppers, canned|cup|170|5|41|1
Turkey, fryer-roasters, meat and skin|3 oz|146|24|0|5
Cereal, GENERAL MILLS, GOLDEN GRAHAMS|3/4 cup (1 NLEA serving)|116|2|26|1
Cereal, GENERAL MILLS, Chocolate CHEX|3/4 cup (1 NLEA serving)|132|2|26|3
Cereal, MALT-O-MEAL, Cocoa DYNO-BITES|3/4 cup (1 NLEA serving)|117|1|26|1
Cereal, GENERAL MILLS, Honey Nut CHEX|3/4 cup (1 NLEA serving)|120|2|28|1
Cereal, GENERAL MILLS, RICE CRUNCHINS|bowl (3/4 cup) (1 NLEA serving)|80|1|17|0
Lemonade, powder, prepared with water|serving 1 cup 8 fl oz|37|0|10|0
Cereal, KELLOGG, KELLOGG'S PRODUCT 19|cup (1 NLEA serving)|112|3|25|0
Cereal, HEALTH VALLEY, FIBER 7 Flakes|3/4 cup (1 NLEA serving)|109|4|24|0
Eggnog|cup|224|12|20|11
POPEYES, Biscuit|biscuit|241|3|24|14
Candies, ROLO Caramels in Milk Chocolate|package 1 package|228|2|33|10
Pie Crust, Cookie-type, Graham Cracker|oz|142|1|18|7
Cookies, oatmeal, prepared from recipe|oz|123|2|19|5
Cereal, GENERAL MILLS, RAISIN NUT BRAN|3/4 cup (1 NLEA serving)|180|4|39|3
Cereal, GENERAL MILLS, BERRY BERRY KIX|1.25 cup (1 NLEA serving)|124|2|28|1
Cereal, GENERAL MILLS, Fruity CHEERIOS|3/4 cup (1 NLEA serving)|103|2|23|1
Cereal, POST, Honey Nut Shredded Wheat|cup (1 NLEA serving)|221|5|49|2
Cereal, KELLOGG, KELLOGG'S FROOT LOOPS|cup (1 NLEA serving)|109|2|26|1
Turkey, enhanced, dark meat from whole|serving|169|22|0|9
Cereal, MALT-O-MEAL, CINNAMON TOASTERS|3/4 cup (1 NLEA serving)|129|2|24|3
Cereal, MALT-O-MEAL, Fruity DYNO-BITES|3/4 cup|109|1|24|1
Cereal, KELLOGG, KELLOGG'S RAISIN BRAN|cup ( 1 NLEA serving)|185|5|46|2
Cereal, KELLOGG'S, FROSTED MINI-WHEATS|25 biscuits (1 NLEA serving)|193|5|47|1
Cereal, OAT BRAN FLAKES, HEALTH VALLEY|cup (1 NLEA serving)|190|5|39|2
Cereal, KELLOGG, KELLOGG'S Corn Flakes|cup (1 NLEA serving)|100|2|24|0
Bread, cornbread, prepared from recipe|piece|173|4|28|5
Tortillas, ready-to-bake or -fry, corn|oz|62|2|13|1
Almond milk, sweetened, vanilla flavor|cup|91|1|16|2
Cocoa mix, powder, prepared with water|fl oz|19|0|4|0
Cereal, KELLOGG, KELLOGG'S MINI-WHEATS|30 biscuits (1 NLEA serving)|188|6|45|1
Cereal, GENERAL MILLS, Multi-Bran CHEX|3/4 cup (1 NLEA serving)|161|4|39|2
Cereal, KELLOGG, KELLOGG'S APPLE JACKS|cup (1 NLEA serving)|105|1|25|1
KRAFT BREAKSTONE'S FREE Fat Free Sour Cream|2 tbsp|29|2|5|0
POPEYES, Coleslaw|cup|306|2|27|21
Candies, HERSHEY'S POT OF GOLD Almond Bar|bar 2.8 oz|450|10|36|30
Chicken breast tenders, breaded, cooked|piece|38|2|3|2
Turkey from whole, enhanced, light meat|serving|108|23|0|2
Turkey thigh, pre-basted, meat and skin|3 oz|133|16|0|7
Rolls, hamburger or hotdog, mixed-grain|oz|75|3|13|2
Bread, irish soda, prepared from recipe|oz|82|2|16|1
Pie, banana cream, prepared from recipe|oz|76|1|9|4
Bread, naan (Indian bread), whole wheat|piece|303|11|49|7
Crackers, standard snack-type, sandwich|1/2 oz|68|1|9|3
Coleslaw|cup|292|2|28|19
Candies, TWIZZLERS Strawberry Twists Candy|2.5 oz 2.5 oz|248|2|57|2
Cookies, chocolate chip, special dietary|oz|128|1|21|5
Carbonated beverage, reduced sugar, cola|can (8 fl oz)|71|0|18|0
Pasta with tomato sauce, no meat, canned|cup|167|5|34|1
Bread, whole-wheat, prepared from recipe|slice|128|4|24|2
Turkey breast, pre-basted, meat and skin|3 oz|107|19|0|3
Trail mix|oz|131|4|13|8
Candies, milk chocolate coated coffee beans|oz|156|2|16|9
Candies, M&M MARS Pretzel Chocolate Candies|1/4 cup|179|2|29|6
Candies, dark chocolate coated coffee beans|serving 28 pieces|216|3|24|12
Ravioli, cheese with tomato sauce, frozen|cup|176|7|28|4
Bread, protein, toasted (includes gluten)|oz|77|4|14|1
Macaroni and Cheese, canned, microwavable|7.5 oz 1 serving|285|13|30|13
Turkey, stuffing, mashed potatoes w/gravy|oz|36|2|5|1
Crackers, saltines (includes oyster, soda|1/2 oz|59|1|10|1
Taro chips|oz|141|1|19|7
Bread, paratha (Indian bread), whole wheat|piece|258|5|36|10
Beans, red, kidney|can drained solids|330|21|57|3
Beans, snap, green|cup|44|2|10|0
Beans, kidney, red|cup|225|15|40|1
Rolls, hamburger or hotdog, reduced-calorie|oz|56|2|12|1
Orange-flavor drink, breakfast type, powder|fl oz|17|0|4|0
Beans, snap, yellow|cup|44|2|10|0
Beans, snap, canned|1/2 cup|18|1|4|0
Beans, fava, in pod|cup|111|10|22|1
Nutritional shake mix, high protein, powder|serving|78|11|4|2
Carbonated beverage, cola, without caffeine|fl oz|13|0|3|0
Turkey, dark meat from whole, meat and skin|serving|175|23|0|8
Queso cotija|2 tsp|18|1|0|2
Hush puppies|piece|65|1|9|3
Candies, crispy bar with peanut butter filling|serving 1.5 oz|228|4|23|13
Soy protein concentrate, produced by acid wash|oz|94|16|9|0
Cookies, peanut butter, prepared from recipe|oz|135|3|17|7
Pie crust, cookie-type, prepared from recipe|piece (1/8 of 9" crust)|148|1|20|8
Turkey from whole, light meat, meat and skin|serving|150|25|0|5
Beans, adzuki, yokan|slice|36|0|8|0
Beans, pinto, canned|can drained solids|316|19|56|2
Carbonated beverage, cola, contains caffeine|fl oz|11|0|3|0
Beans, baked, canned|cup|239|12|54|1
Cookies, chocolate chip, prepared from recipe|oz|138|2|17|8
Cookies, oatmeal sandwich, with creme filling|cookie 1 serving|151|1|21|7
Ground turkey, fat free, pan-broiled crumbles|3 oz|128|27|0|2
Dulce de Leche|tbsp|60|1|10|1
Vegetable and fruit juice blend, 100% juice, C|serving 8 oz|113|1|27|0
Danish pastry, fruit, enriched (includes apple|oz|105|2|14|5
Beans, shellie, canned|cup|74|4|15|0
Orange-flavor drink, breakfast type, with pulp|fl oz|61|0|15|0
Cookies, chocolate sandwich, with creme filling|serving|148|1|26|4
Danish pastry, nut (includes almond, raisin nut|oz|122|2|13|7
Cookies, ladyfingers, with lemon juice and rind|oz|103|3|17|3
Bread, pound cake type, pan de torta salvadoran|serving|214|4|28|10
Toaster pastries, fruit, toasted (include apple|pastry|209|2|37|6
PREGO Pasta, Traditional Italian Sauce|serving 1/2 cup|70|2|13|2
Limeade, frozen concentrate, prepared with water|fl oz|16|0|4|0
Beans, kidney, royal red|cup|218|17|39|0
Danish pastry, fruit, unenriched (includes apple|oz|105|2|14|5
Cookies, peanut butter sandwich, special dietary|oz|152|3|14|10
Crackers, rye, sandwich-type with cheese filling|1/2 oz|68|1|9|3
Coffee substitute, cereal grain beverage, powder|6 fl oz|120|6|10|6
CAMPBELL'S SELECT Soup, Minestrone Soup|cup|100|5|20|0
Turkey, skin from whole (light and dark), roasted|serving|390|20|0|33
Carbonated beverage, lemon-lime soda, no caffeine|fl oz|13|0|3|0
Beans, mung, mature seeds|cup|15|2|3|0
Beans, navy, mature seeds|cup|70|6|14|1
Beans, pink, mature seeds|cup|252|15|47|1
Spaghetti, with meatballs in tomato sauce, canned|cup|239|11|27|10
Orange drink, breakfast type, with juice and pulp|fl oz|56|0|14|0
PREGO Pasta, Mini Meatball Italian Sauce|serving 1/2 cup|100|4|13|3
Cookies, ladyfingers, without lemon juice and rind|oz|103|3|17|3
Beans, snap, green variety|cup|36|2|8|0
Lemonade-flavor drink, powder, prepared with water|fl oz|9|0|2|0
Beans, white, mature seeds|cup|249|17|45|1
Beans, adzuki, mature seed|cup|294|17|57|0
Beans, black, mature seeds|cup|227|15|41|1
Toaster pastries, fruit (includes apple, blueberry|oz|111|1|20|3
Bread, Multi-Grain, toasted (includes whole-grain)|oz|82|4|13|1
Crackers, melba toast, rye (includes pumpernickel)|1/2 oz|55|2|11|0
Beans, pinto, mature seeds|cup|245|15|45|1
WENDY'S, Frosty Dairy Dessert|small 12 oz. cup|300|8|54|6
PREGO Pasta, Fresh Mushroom Italian Sauce|serving 1/2 cup|70|2|13|2
PREGO Pasta, Garlic Supreme Italian Sauce|serving 1/2 cup|110|2|17|4
PREGO Pasta, Zesty Mushroom Italian Sauce|serving 1/2 cup|110|2|18|4
Eggnog-flavor mix, powder, prepared with whole milk|cup (8 fl oz)|258|8|39|8
Beans, french, mature seeds|cup|228|12|42|1
Beans, adzuki, mature seeds|cup|294|17|57|0
Beans, yellow, mature seeds|cup|255|16|45|2
Beans, kidney, mature seeds|cup|53|8|8|1
Beans, lima, immature seeds|1/2 cup|88|5|16|0
Crackers, cheese, sandwich-type with cheese filling|sandwich|32|1|4|2
Beef, rib eye steak, lip-on|3 oz|176|24|0|9
CAMPBELL'S CHUNKY Soups, Pepper Steak Soup|serving|118|8|18|2
CAMPBELL'S SELECT Soup, Tomato Garden Soup|cup|100|3|21|0
Ground beef, 85% lean, patty|serving (3 oz)|212|22|0|13
Beef, loin, tenderloin steak|3 oz|179|26|0|8
Sweet potato, canned, mashed|cup|258|5|59|0
Beef, round, top round steak|3 oz|138|26|0|3
Ground beef, 95% lean, patty|serving (3 oz)|145|22|0|6
Desserts, egg custard, baked|1/2 cup|147|7|16|6
Beef, rib eye steak, lip off|3 oz|175|24|0|9
Ground beef, 70% lean, patty|serving|232|22|0|16
Ground beef, 75% lean, patty|serving (3 oz)|236|22|0|16
Horned melon (Kiwano)|cup|103|4|18|3
PREGO Pasta, Organic Mushroom Italian Sauce|serving 1/2 cup|90|2|13|3
Potato, white, flesh and skin|small (1-3/4" to 2-1/4" dia.)|63|2|14|0
Candies, fudge, peanut butter|piece|62|1|12|1
Syrups, table blends, pancake|cup|396|0|107|0
Potato, baked, flesh and skin|1/2 cup|57|2|13|0
Beef, shoulder steak, grilled|3 oz ( 1 serving )|151|24|0|5
Beans, kidney, california red|cup|219|16|40|0
Candies, NESTLE, BABY RUTH Bar|serving 2.1 oz bar|275|3|39|13
Candies, NESTLE, 100 GRAND Bar|bar (1.5 oz)|201|1|30|8
Beef, chuck eye steak, grilled|3 oz|183|24|0|10
Beef, chuck, under blade steak|3 oz|189|26|0|9
Beef, chuck, mock tender steak|3 oz (1 serving)|137|22|0|5
Beef, short loin, t-bone steak|serving|168|22|0|8
Candies, NESTLE, OH HENRY! Bar|bar 2 oz|263|4|37|13
Potato, russet, flesh and skin|1/2 cup, diced|59|2|14|0
Broccoli, flower clusters, raw|cup flowerets|20|2|4|0
Restaurant, Chinese, egg rolls|piece|222|7|24|11
PREGO Pasta, Flavored with Meat Italian Sauce|serving 1/2 cup|81|2|13|2
CAMPBELL'S CHUNKY Soups, Chicken Corn Chowder|cup|201|7|20|10
CAMPBELL'S SELECT Soup, Vegetable Medley Soup|cup|81|3|16|0
Ground beef, 70% lean, crumbles|serving (3 oz )|230|22|0|15
Beef, round, eye of round steak|3 oz|135|25|0|4
Lima beans, large, mature seeds|cup|216|15|39|1
Restaurant, Chinese, fried rice|cup|238|6|45|4
Ground beef, 90% lean, crumbles|serving ( 3 oz )|196|24|0|10
Beef, plate steak, inside skirt|3 oz|199|26|0|11
Beef, plate, inside skirt steak|3 oz ( 1 serving )|174|23|0|9
Ground beef, 80% lean, crumbles|serving ( 3 oz )|231|23|0|15
Ground beef, 85% lean, crumbles|serving ( 3 oz )|218|24|0|13
Lima beans, immature seeds, raw|cup|176|11|32|1
Ground beef, 95% lean, crumbles|serving ( 3 oz )|164|25|0|6
Beef, ribeye cap steak, grilled|3 oz|209|21|1|13
Ground beef, 75% lean, crumbles|serving ( 3 oz )|235|22|0|16
Refried beans, canned, fat-free|cup|182|12|31|1
PREGO Pasta, Mushroom and Garlic Italian Sauce|serving 1/2 cup|81|2|13|2
CAMPBELL'S CHUNKY Soups, Savory Vegetable Soup|cup|108|3|22|1
CAMPBELL'S CHUNKY Soups, Savory Pot Roast Soup|cup|120|7|20|1
CAMPBELL'S CHUNKY Soups, Steak 'N' Potato Soup|cup|120|8|18|2
Beef, plate, outside skirt steak|3 oz ( 1 serving )|198|21|0|12
Beans, small white, mature seeds|cup|254|16|46|1
Mung beans, mature seeds, boiled|cup|212|14|39|1
Beef, plate steak, outside skirt|3 oz|240|24|0|16
Restaurant, family style, shrimp|serving|397|17|27|24
Sweet potato, canned, syrup pack|cup|203|2|48|0
Potato, mashed, whole milk added|cup|174|4|37|1
Potato, french fried, shoestring|10 strip|50|1|8|2
Potato, hash brown, refrigerated|cup prepared|315|4|44|13
Pork and turkey sausage, pre-cooked|serving|195|7|2|18
Turkey ham, cured turkey thigh meat|serving|35|5|1|1
CAMPBELL'S CHUNKY Soups, Split Pea 'N' Ham Soup|cup|191|12|30|2
CAMPBELL'S CHUNKY Soups, BBQ Seasoned Pork Soup|serving|167|12|22|4
Beans, black turtle, mature seeds|cup|240|15|45|1
Beef, loin, top sirloin cap steak|3 oz|154|24|1|6
Mungo beans, mature seeds, boiled|cup|189|14|33|1
Refried beans, canned, vegetarian|cup|201|13|33|2
Sweet potato, canned, vacuum pack|cup pieces|182|3|42|0
Potato puffs, frozen, oven-heated|cup|246|3|35|12
Potato, french fried, steak fries|10 strip|203|3|36|5
Potato, french fried, cottage-cut|package (9 oz)|390|6|61|15
Winged beans, immature seeds, raw|cup slices|22|3|2|0
Candies, NESTLE, BUTTERFINGER Bar|bar king size|496|6|79|20
CAMPBELL'S CHUNKY Soups, Hearty Beef Barley Soup|cup|159|9|26|2
PREGO Pasta, Mushroom and Parmesan Italian Sauce|serving 1/2 cup|130|3|22|4
CAMPBELL'S SELECT Soup, New England Clam Chowder|cup|179|6|14|11
Potato, microwaved, cooked in skin|1/2 cup|78|2|18|0
Sweet potato, boiled, without skin|medium|115|2|27|0
Lima beans, immature seeds, boiled|cup|209|12|40|0
Ground beef patty, frozen, broiled|3 oz|251|20|0|19
Winged beans, mature seeds, boiled|cup|253|18|26|10
Mung beans, mature seeds, sprouted|cup|31|3|6|0
Lima beans, immature seeds, frozen|cup|175|10|33|1
PREGO Pasta, Diced Onion and Garlic Italian Sauce|serving 1/2 cup|120|2|18|4
CAMPBELL'S CHUNKY Soups, Hearty Bean 'N' Ham Soup|cup|181|11|30|2
Milk dessert, frozen, milk-fat free|cup|229|6|52|1
Ground beef, 70% lean, patty cooked|serving|202|19|0|13
Beans, great northern, mature seeds|cup|209|15|37|1
Restaurant, Latino, black bean soup|cup|253|12|36|6
Potato, boiled, cooked without skin|1/2 cup|67|1|16|0
Beef, short loin, porterhouse steak|serving|190|22|0|11
Hyacinth-beans, immature seeds, raw|cup|37|2|7|0
Oats|cup|607|26|103|11
CAMPBELL'S SELECT Soup, Italian-Style Wedding Soup|cup|130|7|13|5
PREGO Pasta, Roasted Garlic Parmesan Italian Sauce|serving 1/2 cup|100|3|13|1
Winged beans, immature seeds, boiled|cup|24|3|2|0
Yardlong beans, mature seeds, boiled|cup|202|14|36|1
Sweet potato leaves, cooked, steamed|cup|26|1|5|0
Frozen novelties, juice type, orange|bar|70|0|17|0
Restaurant, Latino, chicken and rice|cup|245|17|28|7
Hyacinth beans, mature seeds, boiled|cup|227|16|40|1
CAMPBELL'S SELECT Soup, Creamy Chicken Alfredo Soup|cup|220|10|15|13
CAMPBELL'S SELECT Soup, Potato Broccoli Cheese Soup|cup|149|3|15|9
PREGO Pasta, Organic Tomato and Basil Italian Sauce|serving 1/2 cup|90|2|13|3
Candies, milk chocolate, with almonds|bar (1.45 oz)|216|4|22|14
Beef, chuck, under blade center steak|3 oz|187|22|0|11
Candies, HERSHEY, KIT KAT BIG KAT Bar|bar 1.94 oz|286|3|35|15
PREGO Pasta, Chunky Garden Combination Italian Sauce|serving 1/2 cup|70|2|13|2
Potato, mashed, prepared from granules|cup|227|4|30|10
Hyacinth-beans, immature seeds, boiled|cup|44|3|8|0
Frozen yogurts, chocolate, nonfat milk|cup|199|8|37|2
Restaurant, family style, French fries|serving|491|6|63|24
Beans, cranberry (roman), mature seeds|cup|241|16|43|1
Beef, shoulder top blade steak, grilled|3 oz|167|24|0|8
Restaurant, family style, sirloin steak|serving|324|50|0|14
Candies, MARS SNACKFOOD US, SNICKERS Bar|bar (2 oz)|280|4|35|14
Succotash, canned, with cream style corn|cup|205|7|47|1
SILK Hazelnut Creamer|tbsp|20|0|3|1
Buckwheat|cup|583|22|122|6
SILK Original Creamer|tbsp|15|0|1|1
ABBOTT, ENSURE PLUS|cup|355|13|50|11
Candies, milk chocolate, with rice cereal|bar (1.4 oz)|204|3|24|12
Candies, NESTLE, BIT-O'-HONEY Candy Chews|serving 6 pieces|150|1|32|3
Succotash, canned, with whole kernel corn|cup|161|7|36|1
Candies, MARS SNACKFOOD US, MILKY WAY Bar|bar king size|470|4|73|18
Cornstarch|cup|488|0|117|0
Reddi Wip Fat Free Whipped Topping|cup|112|2|19|4
Restaurant, Chinese, shrimp and vegetables|order|469|36|27|24
KENTUCKY FRIED CHICKEN, Crispy Chicken Strips|strip|129|10|6|7
Figs, raw|large (2-1/2" dia)|47|0|12|0
Desserts, apple crisp, prepared-from-recipe|1/2 cup|227|2|44|5
Restaurant, family style, macaroni & cheese|serving|317|11|40|13
Candies, REESE's Fast Break, milk chocolate|serving 1 bar|277|5|36|13
Potato, mashed, whole milk and butter added|cup|237|4|35|9
Candies, MARS SNACKFOOD US, MARS Almond Bar|bar (1.76 oz)|234|4|31|12
Cracker meal|cup|440|11|93|2
Phyllo dough|oz|85|2|15|2
Plums, raw|NLEA serving|69|1|17|0
Pears, raw|large|131|1|35|0
Limes, raw|NLEA serving|20|0|7|0
Rowal, raw|1/2 cup|127|3|27|2
Lima beans, thin seeded (baby), mature seeds|cup|229|15|42|1
Candies, MARS SNACKFOOD US, 3 MUSKETEERS Bar|serving 2.13 oz bar|262|2|47|8
Potato, scalloped, home-prepared with butter|cup|216|7|26|9
Potato, french fried, crinkle or regular cut|3 oz|128|2|20|4
Feijoa, raw|cup 1/2" chunks|113|2|26|1
Mangos, raw|cup pieces|99|1|25|1
PEPSICO, SoBe Lifewater|8 fl oz|12|0|3|0
Broadbeans (fava beans), mature seeds, boiled|cup|187|13|33|1
Broadbeans (fava beans), mature seeds, canned|cup|182|14|32|1
Separable fat (from ham and arm picnic), roasted|oz|168|2|0|18
Pummelo, raw|cup, sections|72|1|18|0
Soursop, raw|cup, pulp|148|2|38|1
Rhubarb, raw|stalk|11|0|2|0
Litchis, raw|cup|125|2|31|1
Carissa, raw|cup slices|93|1|20|2
Loquats, raw|large|9|0|2|0
Abiyuch, raw|1/2 cup|79|2|20|0
Acerola, raw|cup|31|0|8|0
Pitanga, raw|cup|57|1|13|1
Papayas, raw|cup 1" pieces|62|1|16|0
Peaches, raw|NLEA serving|57|1|14|0
Potato, mashed, whole milk and margarine added|cup|237|4|36|9
Candies, MARS SNACKFOOD US, SNICKERS MUNCH bar|serving 1.42 oz bar|214|6|18|14
Candies, confectioner's coating, peanut butter|oz|150|5|13|8
Frozen novelties, juice type, juice with cream|2.5 oz|82|1|17|1
KRAFT, CORNNUTS, plain|cup|379|7|61|13
SILK French Vanilla Creamer|tbsp|20|0|3|1
Chocolate syrup|serving 2 tbsp|109|1|25|0
Apricots, raw|cup, halves|74|2|17|1
Hotdog, plain|sandwich|242|10|18|14
Separable fat (from ham and arm picnic), unheated|oz|164|2|0|17
Candies, MARS SNACKFOOD US, DOVE Milk Chocolate|serving 5 pieces|218|2|24|13
Candies, MARS SNACKFOOD US, SNICKERS Almond bar|serving 1.76 oz bar|236|3|32|11
Candies, NESTLE, CRUNCH Bar and Dessert Topping|bar 1.55 oz|220|2|30|11
Potato, scalloped, home-prepared with margarine|cup|216|7|26|9
Jackfruit, raw|cup, sliced|157|3|38|1
Java-plum, raw|cup|81|1|21|0
Pineapple, raw|cup, chunks|82|1|22|0
Sapodilla, raw|cup, pulp|200|1|48|3
Carambola, raw|cup, cubes|41|1|9|0
Cherimoya, raw|cup, pieces|120|2|28|1
Plantains, raw|medium|218|2|57|1
Tamarinds, raw|cup, pulp|287|3|75|1
HOUSE FOODS Premium Firm Tofu|2 oz|48|6|1|2
HOUSE FOODS Premium Soft Tofu|2 oz|33|3|2|2
Crabapples, raw|cup slices|84|0|22|0
Sundae, caramel|sundae|304|7|49|9
Tangerines, raw|NLEA serving|58|1|14|0
Breadfruit, raw|cup|227|2|60|0
Mulberries, raw|cup|60|2|14|0
Nectarines, raw|NLEA serving|62|2|15|0
Frozen novelties, juice type, POPSICLE SCRIBBLERS|serving 1.2 fl oz pop|27|0|6|0
Restaurant, family style, spaghetti and meatballs|cup|228|10|21|11
Raspberries, raw|cup|64|2|15|1
Cranberries, raw|cup, whole|46|0|12|0
Clementines, raw|fruit|35|1|9|0
Candies, MARS SNACKFOOD US, MILKY WAY Midnight Bar|serving 1.76 oz bar|222|2|36|9
Candies, MARS SNACKFOOD US, COCOAVIA Chocolate Bar|serving 0.78 oz bar|119|1|14|6
Restaurant, Latino, arroz con leche (rice pudding)|serving|413|9|70|10
Potato, french fried, salt not added in processing|package (9 oz)|382|6|63|12
Sour cream, light|cup|313|8|16|24
Oheloberries, raw|cup|39|0|10|0
Elderberries, raw|cup|106|1|27|1
Pomegranates, raw|1/2 cup arils (seed/juice sacs)|72|2|16|1
Sundae, hot fudge|sundae|284|6|48|9
Gooseberries, raw|cup|66|1|15|1
Plantains, cooked|cup slices|179|1|48|0
Blackberries, raw|cup|62|2|14|1
Sugar-apples, raw|cup, pulp|235|5|59|1
Raisins, seedless|small box (1.5 oz)|129|1|34|0
Frozen novelties, ice cream type, vanilla ice cream|bar|172|5|20|8
Restaurant, family style, chili with meat and beans|serving|286|23|8|18
Entrees, crab cake|cake|160|11|5|10
Dates, deglet noor|cup, chopped|415|4|110|1
Prickly pears, raw|cup|61|1|14|1
Pita chips, salted|oz|130|3|19|4
Sundae, strawberry|sundae|268|6|45|8
MONSTER energy drink, low carb|8 fl oz|12|0|3|0
Peanut butter, smooth, vitamin and mineral fortified|2 tbsp|189|8|6|16
Peanut butter, chunky, vitamin and mineral fortified|2 tbsp|190|8|6|16
Bacon, pre-sliced, pan-fried|slice|54|4|0|4
Candies, MARS SNACKFOOD US, TWIX Caramel Cookie Bars|package (2 oz)|286|3|37|14
POPEYES, Fried Chicken, Mild|wing, with skin|201|11|8|14
Tuna, white, canned in water|3 oz|109|20|0|2
McDONALD'S, BIG MAC|item 7.6 oz|563|26|44|33
Groundcherries, raw|cup|74|3|16|1
Trail mix, tropical|oz|125|2|19|5
Beef sticks, smoked|oz|156|6|2|14
Trail mix, unsalted|oz|131|4|13|8
Pear nectar, canned|cup|150|0|39|0
Melon balls, frozen|cup, unthawed|57|2|14|0
Guava sauce, cooked|cup|86|1|23|0
Shrimp, mixed species, cooked|3 oz|206|18|10|10
Mango nectar, canned|cup|128|0|33|0
Guava nectar, canned|cup|143|0|37|0
Sour cream, fat free|cup|170|7|36|0
Peach nectar, canned|cup|134|1|35|0
Loganberries, frozen|cup, unthawed|81|2|19|0
Sausage, summer, pork and beef|oz|121|6|0|11
FRITOLAY, SUNCHIPS, multigrain|oz|141|2|19|6
Bologna, pork, turkey and beef|oz|95|3|2|8
Sausage, Polish, pork and beef|serving 2.67 oz|229|9|2|20
Turkey, pork, and beef sausage|3 oz|86|7|10|2
Turkey ham, sliced, extra lean|cup pieces|171|27|4|5
Bologna, pork and turkey, lite|serving 2 oz|118|7|2|9
Papaya nectar, canned|cup|142|0|36|0
Durian, raw or frozen|cup, chopped or diced|357|4|66|13
Apricot nectar, canned|cup|141|1|36|0
Plantain chips, salted|oz|151|1|18|8
Chimichanga, with beef|chimichanga|425|20|43|20
McDONALD'S, Hash Brown|2 oz|147|1|15|9
Ham -- water added, rump, heated|serving (3 oz)|103|18|1|3
Bratwurst, pork, beef and turkey|serving 2.33 oz|123|10|1|9
Sausage, turkey, breakfast links|2 oz, 2 links|132|9|1|10
Hi-C Flashin' Fruit Punch|6.75 fl oz|90|0|25|0
Sour cream, reduced fat|cup|416|16|16|32
Tamarind nectar, canned|cup|143|0|37|0
Salad dressing, peppercorn dressing|tbsp|76|0|0|8
Soup, beef broth or bouillon canned|cup|17|3|0|0
Ham -- water added, shank, heated|serving (3 oz)|109|18|1|4
Sausage, chicken and beef, smoked|cup pieces|407|26|0|33
Kielbasa, Polish, turkey and beef|serving 2 oz|127|7|2|10
Ham -- water added, whole, heated|3 oz|99|15|1|4
Ham -- water added, slice, heated|slice|225|36|3|8
Clams, breaded and fried|3/4 cup|451|13|39|26
Cookies, animal crackers|box|299|4|50|9
McDONALD'S, BIG 'N TASTY|item|524|25|38|32
McDONALD'S, FILET-O-FISH|sandwich|378|15|35|20
Guanabana nectar, canned|cup|148|0|38|0
Sausage, Polish, beef with chicken|serving 5 pieces|142|10|2|11
Turkey breast, sliced, prepackaged|slice|15|2|0|0
Ham -- water added, rump, unheated|3 oz|81|13|0|3
Poi|cup|269|1|65|0
Cornnuts, barbecue-flavor|oz|124|3|20|4
McDONALD'S, BIG BREAKFAST|item 9.5 oz|767|27|47|52
Dessert topping, powdered|1.5 oz|248|2|23|17
Ham and water product, rump, heated|serving (3 oz)|111|18|1|4
Ham, extra lean and regular, canned|cup|202|25|0|10
Ham -- water added, slice, unheated|3 oz|81|15|1|2
Pork sausage, link/patty, pan-fried|serving|156|9|1|13
Turkey breast, sliced, oven roasted|serving|34|6|1|0
Thuringer, cervelat, summer sausage|2 oz 1 serving|203|10|2|17
Ham, sliced, packaged (96% fat free|slice|30|4|0|1
Ham -- water added, whole, unheated|3 oz|94|15|1|3
Ham -- water added, shank, unheated|3 oz|77|16|0|2
Miso|cup|547|32|73|16
McDONALD'S, Barbeque Sauce|package|46|0|10|0
Cream substitute, powdered|cup|512|4|52|33
Ham and water product, slice, heated|slice|170|21|6|7
Luncheon meat, pork with ham, minced|2 oz 1 NLEA serving|176|8|3|15
Ham and water product, whole, heated|serving (3 oz)|105|12|4|5
Ham and water product, shank, heated|serving (3 oz)|112|18|1|4
FRITOLAY, SUNCHIPS, Multigrain Snack|oz|139|2|19|6
Ham, extra lean and regular, roasted|cup|231|31|1|11
Okara|cup|94|4|15|2
Natto|cup|371|31|25|19
Soy chips or crisps, salted|oz|109|8|15|2
McDONALD'S, QUARTER POUNDER|item|417|24|38|20
Pork sausage, link/patty, reduced fat|oz|227|18|0|17
Ham, extra lean and regular, unheated|cup|227|26|3|12
Ham with natural juices, rump, heated|serving (3 oz)|116|20|0|4
Ham and water product, rump, unheated|oz|30|5|0|1
New england brand sausage, pork, beef|oz|46|5|1|2
Catsup|cup|269|3|63|0
Pecans|oz (19 halves)|196|3|4|20
Kanpyo|1/2 cup|70|2|18|0
Tempeh|cup|320|31|16|18
Soup, SWANSON Chicken Broth 99% Fat Free|serving 1 cup 8 oz|9|1|0|0
Dessert topping, pressurized|cup|185|1|11|16
McDONALD'S, Hot Fudge Sundae|item 6.314 oz|333|7|54|11
Ham and water product, slice, unheated|3 oz|88|12|2|3
Ham with natural juices, slice, heated|slice|321|58|3|9
Pork sausage, link/patty, fully cooked|serving|206|8|0|19
Chicken breast, oven-roasted, fat-free|serving 2 slices|33|7|1|0
Ham with natural juices, whole, heated|serving (3 oz)|96|18|1|3
Ham and water product, shank, unheated|3 oz|96|15|1|4
Ham with natural juices, shank, heated|serving (3 oz)|123|21|0|4
Ham and water product, whole, unheated|3 oz|99|12|3|4
Jellies|serving 1 tbsp|56|0|15|0
Almonds|cup, sliced|533|20|20|46
Parsley|cup chopped|22|2|4|0
Yucca (cassava) chips, salted|oz|146|0|20|7
McDONALD'S, Hot Mustard Sauce|package|53|1|8|2
McDONALD'S, Strawberry Sundae|item 6.279 oz|281|6|50|7
SILK Nog, soymilk|1/2 cup|90|3|15|2
PREGO Pasta, Tomato, Basil and Garlic Italian Sauce|serving 1/2 cup|80|2|12|2
SUNKIST, SUNKIST Fruit Roll, strawberry|roll|72|0|17|0
Ham with natural juices, rump, unheated|3 oz|104|19|0|3
Cheesecake commercially prepared|oz|91|2|7|6
Molasses|serving 1 tbsp|58|0|15|0
Flaxseed|tbsp, whole|55|2|3|4
McDONALD'S, Creamy Ranch Sauce|1.5 oz|201|0|2|22
McDONALD'S, Hot Caramel Sundae|item 6.42 oz|342|6|61|9
McDONALD'S, Warm Cinnamon Roll|3.7 oz|418|8|56|19
Beef jerky, chopped and formed|oz|116|9|3|7
Onion rings, breaded and fried|package (18 onion rings)|481|4|51|30
SILK Chai, soymilk|cup|129|6|19|4
Ham with natural juices, whole, unheated|oz|31|6|0|1
Ham with natural juices, slice, unheated|3 oz|105|21|0|2
Ham with natural juices, shank, unheated|3 oz|110|21|0|3
Salad dressing, KRAFT Mayo Light Mayonnaise|tbsp|50|0|1|5
McDONALD'S, Spicy Buffalo Sauce|1.5 oz|61|0|1|7
SILK Plain, soymilk|cup|100|7|8|4
McDONALD'S, Sweet 'N Sour Sauce|package|48|0|11|0
SILK Mocha, soymilk|cup|141|5|22|4
Chicken breast, deli, rotisserie seasoned|slice|12|2|0|0
Chicken breast, fat-free, mesquite flavor|serving 2 slices|34|7|1|0
McDONALD'S, McDONALDLAND Cookies|2 oz|255|4|42|9
SILK Coffee, soymilk|cup|151|5|25|4
McDONALD'S, Low Fat Caramel Sauce|0.8 oz|66|0|15|1
McDONALD'S, Peanuts (for Sundaes)|0.3 oz|45|2|1|4
SILK Vanilla, soymilk|cup|100|6|10|4
Sausage, smoked link sausage, pork and beef|3 oz|272|10|2|24
GENERAL MILLS, CHEX MIX, traditional flavor|cup|199|4|35|5
WENDY'S, DAVE'S Hot 'N Juicy 1/4 LB, single|sandwich|576|29|38|34
Sausage, pork and beef, with cheddar cheese|12 oz serving 2.7 oz|228|10|2|20
POPEYES, Mild Chicken Strips, analyzed 2006|strip|146|10|10|7
Pie, pecan|slice|541|6|79|22
Pie, peach|oz|63|0|9|3
Ham, regular (approximately 13% fat), canned|cup|316|29|1|21
Turkey sausage, reduced fat, brown and serve|cup|261|22|14|13
Ham, sliced, regular (approximately 11% fat)|slice|46|5|1|2
POPEYES, Spicy Chicken Strips, analyzed 2006|strip|134|10|10|6
Swisswurst, pork and beef, with swiss cheese|serving 2.7 oz|236|10|1|21
Turkey and pork sausage, bulk, patty or link|oz|86|6|0|6
Turkey breast, low salt, prepackaged or deli|2 oz|66|13|2|0
Meat extender|cup|275|34|34|3
SILK Chocolate, soymilk|cup|141|5|23|4
Pie, cherry|oz|74|1|11|3
Ham, regular (approximately 11% fat), roasted|cup|249|32|0|13
Ham with natural juices, spiral slice, heated|slice|202|32|2|7
SILK Plus Fiber, soymilk|cup|100|6|14|4
Pie, pumpkin|slice|323|5|46|13
Cake, sponge|oz|82|2|17|1
Ham, extra lean (approximately 4% fat), canned|cup|168|26|0|6
Spinach souffle|cup|230|11|8|18
Vegetarian stew|cup|304|42|17|7
SILK Unsweetened, soymilk|cup|80|7|4|4
SILK Light Plain, soymilk|cup|70|6|8|2
McDONALD'S, Deluxe Warm Cinnamon Roll|5.7 oz|595|9|84|26
Salad dressing, blue or roquefort cheese dressing|tbsp|73|0|1|8
McDONALD'S, Tangy Honey Mustard Sauce|1.5 oz|72|1|12|2
Rolls, french|oz|79|2|14|1
PACE, Diced Green Chilies|serving|8|0|2|0
Spelt, cooked|cup|246|11|51|2
Ham with natural juices, spiral slice, unheated|oz spiral slice|31|6|0|1
Ham, extra lean (approximately 5% fat), roasted|cup|203|29|2|8
McDONALD'S, McFLURRY with OREO cookies|16 fl oz cup large|804|19|124|28
McDONALD'S, NEWMAN'S OWN Cobb Dressing|2 fl oz|122|1|10|9
Millet, cooked|cup|207|6|41|2
Quinoa, cooked|cup|222|8|39|4
Pie, blueberry|oz|66|0|10|3
Bulgur, cooked|cup|151|6|34|0
SILK Very Vanilla, soymilk|cup|129|6|19|4
Cookies, sugar|serving|144|1|20|6
Ham with natural juices, spiral slice, meat only|slice|183|33|2|6
Macaroni and cheese loaf, chicken, pork and beef|slice|87|4|4|6
Pork sausage rice links, brown and serve, cooked|2 links 1 NLEA serving|183|6|1|17
McDONALD'S, NEWMAN'S OWN Ranch Dressing|2 fl oz|175|2|9|15
P REGO Pasta, Roasted Garlic and Herb Italian Sauce|serving 1/2 cup|90|2|13|3
Cake, angelfood|piece (1/12 of 12 oz cake)|72|2|16|0
Croutons, plain|cup|122|4|22|2
SILK Light Vanilla, soymilk|cup|80|6|10|2
Cake, fruitcake|piece|139|1|26|4
Crackers, wheat|serving|141|3|21|5
Jams and preserves|tbsp|56|0|14|0
Vegetarian fillets|fillet|246|20|8|15
Cookies, fortune|oz|107|1|24|1
Couscous, cooked|cup, cooked|176|6|36|0
Energy drink, AMP|serving|110|1|29|0
Cocoa mix, powder|serving (3 heaping tsp or 1 envelope)|111|2|23|1
Cookies, fig bars|oz|99|1|20|2
Cookies, molasses|oz|122|2|21|4
SILK Light Chocolate, soymilk|cup|119|5|22|2
Coffeecake, fruit|oz|88|2|15|3
Cookies, brownies|oz|115|1|18|5
KENTUCKY FRIED CHICKEN, Fried Chicken, EXTRA CRISPY|wing, with skin|229|14|8|16
SILK Plus Omega-3 DHA, soymilk|cup|109|7|8|5
Pie, coconut creme|oz|84|1|10|5
Croutons, seasoned|cup|186|4|25|7
Pears, raw, bosc|large|147|1|35|0
Hazelnuts or filberts|cup, ground|471|11|12|46
Puff pastry, frozen|oz|156|2|13|11
Pie, lemon meringue|oz|76|0|13|2
Rolls, pumpernickel|medium (2-1/2" dia)|100|4|19|1
McDONALD'S, BIG MAC (without Big Mac Sauce)|item|468|26|42|23
Oil, cooking and salad, ENOVA|tbsp (1 NLEA serving)|124|0|0|14
Oil, peanut, salad or cooking|tbsp|119|0|0|14
Whey, acid, fluid|cup|59|2|13|0
Pears, asian, raw|fruit 2-1/4" high x 2-1/2" dia|51|1|13|0
Vegetable chips, made from garden vegetables|oz|134|2|17|7
Danish pastry, lemon|oz|105|2|14|5
Pie, chocolate creme|oz|100|1|11|6
Pie, coconut custard|oz|74|2|9|4
Cookies, gingersnaps|oz|118|2|22|3
Sapote, mamey, raw|cup 1" pieces|217|2|56|1
Oil, soybean, salad or cooking|tbsp|120|0|0|14
Whey, sweet, fluid|cup|66|2|13|1
McDONALD'S, BIG 'N TASTY (without mayonnaise)|item|419|24|38|20
Biscuits, mixed grain|oz|75|2|13|2
Energy Drink, Monster|serving|101|0|27|0
Crackers, whole-wheat|serving|120|3|20|4
Guavas, common, raw|cup|112|4|24|2
Melons, casaba, raw|cup, cubes|48|2|11|0
Cherries, sour, red|cup|189|2|49|0
Figs, dried, stewed|cup|277|4|71|1
Amaranth grain, cooked|cup|251|9|46|4
Energy drink, ROCKSTAR|serving (1 NLEA serving, 8 fl oz)|139|1|30|0
Cake, boston cream pie|oz|71|1|12|2
English muffins, wheat|oz|63|2|13|1
SILK Plus for Bone Health, soymilk|cup|100|6|11|4
Salad dressing, caesar, fat-free|2 tbsp (1 NLEA serving)|45|0|10|0
Salad dressing, buttermilk, lite|serving (2 tbsp)|61|0|6|4
Oil, safflower, salad or cooking|tbsp|120|0|0|14
Kiwifruit, gold, raw|cup, sliced|112|2|26|1
Pears, raw, bartlett|large|143|1|34|0
Cherries, sweet, raw|NLEA serving|88|2|22|0
McDONALD'S, NEWMAN'S OWN Creamy Caesar Dressing|2 fl oz|188|2|4|19
McDONALD'S, FILET-O-FISH (without tartar sauce)|item|301|16|38|9
Bagels, cinnamon-raisin|oz|78|3|16|0
Danish pastry, cinnamon|oz|114|2|13|6
Breakfast tart, low fat|tart|193|2|40|3
Cherries, tart, dried|1/4 cup|133|0|32|0
Pears, raw, red anjou|large|138|1|33|0
Salad Dressing, mayonnaise, light|tbsp (1 NLEA serving)|47|0|1|5
Salad dressing, poppyseed, creamy|2 tbsp|132|0|8|11
Plums, canned, purple|cup, pitted|102|1|28|0
Cream, sour, cultured|cup|444|5|7|45
Pretzels, hard, plain|oz|109|3|23|1
Kiwifruit, green, raw|NLEA serving|90|2|22|1
Melons, honeydew, raw|NLEA serving|48|1|12|0
Danish pastry, raspberry|oz|105|2|14|5
Beef stew, canned entree|cup (1 serving)|194|9|15|11
Energy Drink, sugar free|8 fl oz|10|1|1|0
Avocados, raw, Florida|fruit without skin and seeds|365|7|24|31
Grapefruit, raw, white|cup sections, with juice|76|2|19|0
Currants, zante, dried|cup|408|6|107|0
Cherries, sour, canned|cup|71|1|18|0
Fruit punch drink, canned|fl oz|15|0|4|0
Cookies, chocolate wafers|oz|123|2|21|4
Salad dressing, caesar, low calorie|tbsp|16|0|3|1
Rhubarb, frozen, cooked|cup|278|1|75|0
Peaches, spiced, canned|cup, whole|182|1|49|0
Plantains, green, fried|cup|365|2|58|14
Melons, cantaloupe, raw|NLEA serving|46|1|11|0
Cherries, sweet, frozen|cup, thawed|231|3|58|0
Cherries, sweet, canned|cup|210|2|54|0
Peaches, frozen, sliced|cup, thawed|235|2|60|0
Guavas, strawberry, raw|cup|168|1|42|2
Pears, raw, green anjou|large|160|1|38|0
Pretzels, soft, unsalted|large|493|12|102|4
UNILEVER, SLIMFAST, meal replacement|bottle|168|10|23|6
Cream, sour, reduced fat|cup|327|7|10|29
Raspberries, frozen, red|cup, unthawed|258|2|65|0
Peaches, dried, sulfured|cup|199|3|51|1
Raspberries, canned, red|cup|233|2|60|0
Plantains, yellow, fried|cup|399|2|69|13
Beef Pot Pie, frozen entree|pie, cooked (average weight)|590|19|59|30
Energy drink, FULL THROTTLE|serving 8 fluid oz|110|1|29|0
Blueberries, wild, frozen|cup, frozen|80|0|19|0
Persimmons, japanese, raw|fruit (2-1/2" dia)|118|1|31|0
Apricots, dried, sulfured|cup, halves|313|4|81|1
Pineapple, frozen, chunks|cup, chunks|211|1|54|0
Lemons, raw, without peel|NLEA serving|17|1|5|0
NESTLE, Boost plus, nutritional drink|bottle|327|13|41|13
Blueberries, wild, canned|cup|341|2|90|1
Vegetarian meatloaf or patties|slice|110|12|4|5
Surimi|oz|28|4|2|0
McDONALD'S, Hotcakes (with 2 pats margarine & syrup)|item|601|9|102|18
English muffins, whole-wheat|oz|58|2|12|1
Passion-fruit, purple, raw|cup|229|5|55|2
Pears, canned, heavy syrup|cup|149|0|38|0
Nance, frozen, unsweetened|cup without pits, thawed|82|1|19|1
V8 V. FUSION Juices, Tropical|serving 8 oz|121|1|28|0
Rolls, hard (includes kaiser)|oz|83|3|15|1
Crackers, standard snack-type|cup crushed|265|4|32|14
Papaya, canned, heavy syrup|piece|80|0|22|0
Breakfast bars, oats, sugar|bar|200|4|29|8
Cream, fluid, half and half|cup|315|7|10|28
Apricots, frozen, sweetened|cup|237|2|61|0
Soy sauce made from soy (tamari)|tbsp|11|2|1|0
QUAKER OATS, Propel Zero, fruit-flavored|bottle 12 fl oz in packages of 8|18|0|4|0
Peaches, canned, heavy syrup|cup|160|1|41|0
Grapefruit, sections, canned|cup|88|1|22|0
Currants, red and white, raw|cup|63|2|16|0
Cream, fluid, heavy whipping|tbsp|52|0|0|6
Cream, fluid, light whipping|tbsp|44|0|0|5
Rambutan, canned, syrup pack|cup|175|1|45|0
Lasagna with meat sauce, frozen|piece side|166|9|19|6
V8 V. FUSION Juices, Acai Berry|serving 8 oz|111|0|27|0
Salad Dressing, mayonnaise-like, fat-free|tbsp|13|0|2|0
Plums, dried (prunes), stewed|cup, pitted|265|2|70|0
Jackfruit, canned, syrup pack|cup, drained|164|1|43|0
Grapefruit, raw, pink and red|NLEA serving|65|1|16|0
Blueberries, dried, sweetened|1/4 cup|127|1|32|1
Cranberries, dried, sweetened|1/3 cup|123|0|33|0
Apricots, canned, heavy syrup|cup, whole|151|1|39|0
Currants, european black, raw|cup|71|2|17|0
Cream, whipped, cream topping|cup|154|2|8|13
Applesauce, canned, sweetened|cup|194|0|51|0
Chocolate-flavored hazelnut spread|serving 2 TBSP|200|2|23|11
V8 V. FUSION Juices, Peach Mango|serving 8 oz|121|1|28|0
V8 SPLASH Smoothies, Peach Mango|serving 8 oz|91|3|19|0
Yam, raw|cup, cubes|177|2|42|0
Chocolate powder, no sugar added|2 tbsp|41|1|7|1
Cream, half and half, fat free|2 tbsp|17|1|3|0
Blueberries, frozen, sweetened|cup, thawed|196|1|50|0
Kale, raw|cup, chopped|33|3|6|1
Dock, raw|cup, chopped|29|3|4|1
Taro, raw|cup, sliced|116|2|28|0
Okra, raw|cup|33|2|7|0
Carob-flavor beverage mix, powder|tbsp|45|0|11|0
McDONALD'S, Biscuit, large size|item 3.2 oz|310|6|39|14
Fried Chicken, Thigh, meat only|thigh, thigh without skin|153|19|0|8
Salad dressing, ranch dressing, reduced fat|serving (2 tbsp)|59|0|6|4
Eggs, scrambled, frozen mixture|oz|37|4|2|2
Cream substitute, liquid, light|cup|172|2|22|8
Onion, raw|large|60|2|14|0
Beets, raw|cup|58|2|13|0
Hush puppies, prepared from recipe|cup|512|12|70|20
Leeks, raw|cup|54|1|13|0
Eppaw, raw|cup|150|5|32|2
Fried Chicken, Breast, meat only|breast, without skin|207|37|1|6
Salad dressing, french dressing, reduced fat|serving (2 tbsp)|67|0|9|4
Whipped topping, frozen, low fat|cup|168|2|18|10
Tofu, fried|oz|77|5|3|6
Acorns, raw|oz|110|2|12|7
Celery, raw|NLEA serving|18|1|3|0
Borage, raw|cup (1" pieces)|19|2|3|1
Garlic, raw|cup|203|9|45|1
McDONALD'S, Biscuit, regular size|item 2.7 oz|261|5|33|12
Cream substitute, powdered, light|cup|405|2|69|15
V8 SPLASH Smoothies, Tropical Colada|serving 8 oz|101|3|21|0
Lean Pockets, Meatballs & Mozzarella|each|307|13|41|10
Taro, cooked|cup slices|187|1|46|0
Nopales, raw|cup, sliced|14|1|3|0
Syrups, malt|tbsp|67|1|15|0
Cassava, raw|cup|330|3|78|1
Cabbage, raw|cup, chopped|22|1|5|0
Turnips, raw|large|51|2|12|0
Salsify, raw|cup slices|109|4|25|0
Pumpkin, raw|cup (1" cubes)|30|1|8|0
Carrots, raw|medium|25|1|6|0
Salad Dressing, coleslaw dressing, reduced fat|tbsp|56|0|7|3
Sesame sticks, wheat-based, salted|oz|153|3|13|10
Cream substitute, flavored, liquid|tbsp|38|0|5|2
Radishes, raw|cup slices|19|1|4|0
Waxgourd, raw|cup, cubes|17|0|4|0
Celeriac, raw|cup|66|2|14|0
Collards, raw|cup, chopped|12|1|2|0
Eggplant, raw|cup, cubes|20|1|5|0
Kohlrabi, raw|cup|36|2|8|0
Purslane, raw|cup|9|1|2|0
Pepeao, dried|cup|72|1|19|0
Parsnips, raw|cup slices|100|2|24|0
Onion, canned|1/2 cup, chopped or diced|21|1|4|0
Energy Drink, sugar-free with guarana|16 fl oz|19|0|5|0
Fruit punch drink, frozen concentrate|fl oz|56|0|14|0
Syrups, maple|serving 1/4 cup|216|0|56|0
Sugars, maple|oz|100|0|26|0
Acorns, dried|oz|144|2|15|9
Candies, hard|oz|112|0|28|0
Fried Chicken, Drumstick, meat only|drumstick, bone and skin removed|69|10|0|3
Dessert topping, semi solid, frozen|cup|238|1|17|19
Toaster pastries, brown-sugar-cinnamon|oz|117|1|19|4
Strawberry-flavor beverage mix, powder|serving (2-3 heaping tsp)|86|0|22|0
Asparagus, raw|cup|27|3|5|0
Keikitos (muffins), Latino bakery item|piece|196|3|22|11
Jew's ear, raw|cup slices|25|0|7|0
Cornsalad, raw|cup|12|1|2|0
Arrowroot, raw|cup, sliced|78|5|16|0
Arrowhead, raw|large|25|1|5|0
Rutabagas, raw|medium|143|4|33|1
Butterbur, raw|cup|13|0|3|0
Salad dressing, french dressing, reduced calorie|tbsp|32|0|4|2
Cream substitute, flavored, powdered|4 tsp|58|0|9|3
Sesame sticks, wheat-based, unsalted|oz|153|3|13|10
Soy sauce made from soy and wheat (shoyu)|cup|135|21|13|2
Roast beef spread|serving .25 cup|127|9|2|9
Liverwurst spread|1/4 cup|168|7|3|14
Tomatillos, raw|medium|11|0|2|0
Pumpkin, canned|cup|83|3|20|1
Pimento, canned|cup|44|2|10|1
Peanuts, boiled|cup, shelled|572|24|38|40
Walnuts, glazed|oz|140|2|13|10
Pilinuts, dried|oz (15 kernels)|204|3|1|23
Edamame, frozen|cup|189|17|15|8
Lotus root, raw|root (9-1/2" long)|85|3|20|0
Artichokes, raw|artichoke, large|76|5|17|0
Coffeecake, cinnamon with crumb topping|oz|119|2|13|7
Nopales, cooked|cup|22|2|5|0
Salad dressing, italian dressing, reduced calorie|tbsp|28|0|1|3
Fruit leather, pieces, with vitamin C|serving|78|0|18|1
Cashew nuts, raw|oz|157|5|9|12
Beechnuts, dried|oz|163|2|10|14
Taro leaves, raw|cup|12|1|2|0
Taro shoots, raw|shoot|9|1|2|0
Beet greens, raw|cup|8|1|2|0
Ginger root, raw|1/4 cup slices (1" dia)|19|0|4|0
Cauliflower, raw|cup chopped (1/2" pieces)|27|2|5|0
Lasagna with meat & sauce, frozen entree|piece side|169|9|19|6
Pine nuts, dried|oz (167 kernels)|191|4|4|19
Lotus seeds, raw|oz|25|1|5|0
Ginkgo nuts, raw|oz|52|1|11|0
Cookies, sugar wafers with creme filling|oz|142|1|20|7
Walnuts, english|cup, ground|523|12|11|52
Pretzels, hard, confectioner's coating|oz|130|2|20|5
Salad dressing, thousand island dressing, fat-free|tbsp|21|0|5|0
Tomato, sun-dried|cup|139|8|30|2
Eggplant, pickled|cup|67|1|13|1
Tree fern, cooked|1/2 cup, chopped|28|0|8|0
Burdock root, raw|cup (1" pieces)|85|2|20|0
Chia seeds, dried|oz|138|5|12|9
Puddings, tapioca|oz|37|1|6|1
Puddings, vanilla|oz|37|0|6|1
Butternuts, dried|oz|174|7|3|16
Coconut meat, raw|piece (2" x 2" x 1/2")|159|2|7|15
Candies, caramels|piece|39|0|8|1
Syrups, grenadine|tsp|18|0|4|0
Swamp cabbage, raw|cup, chopped|11|2|2|0
Chicory roots, raw|1/2 cup (1" pieces)|32|1|8|0
Turnip greens, raw|cup, chopped|18|1|4|0
Lotus seeds, dried|cup|106|5|21|1
Hickorynuts, dried|oz|186|4|5|18
Cake, cherry fudge with chocolate frosting|oz|75|1|11|4
Cheesecake prepared from mix, no-bake type|oz|78|2|10|4
Sauerkraut, canned|cup|27|1|6|0
Bamboo shoots, raw|cup (1/2" slices)|41|4|8|0
Ginkgo nuts, dried|oz|99|3|20|1
Ginkgo nuts, canned|cup (78 kernels)|172|4|34|2
Pistachio nuts, raw|oz (49 kernels)|159|6|8|13
Drumstick pods, raw|cup slices|37|2|8|0
Ice creams, vanilla|serving 1/2 cup|137|2|16|7
Puddings, chocolate|oz|40|1|6|1
Candies, jellybeans|10 small|41|0|10|0
Taro shoots, cooked|cup slices|20|1|4|0
Toppings, pineapple|2 tbsp|106|0|28|0
Mustard greens, raw|cup, chopped|15|2|3|0
Meatballs, meatless|cup|284|30|12|13
Macadamia nuts, raw|oz (10-12 kernels)|204|2|4|22
Entrees, fish fillet, battered or breaded|fillet|211|13|15|11
Cinnamon buns, frosted (includes honey buns)|bun|283|3|32|16
Pastry, Pastelitos de Guava (guava pastries)|piece|326|5|41|16
Peanuts, oil-roasted|oz shelled (32 nuts)|170|8|4|15
Fruit leather, rolls|large|78|0|18|1
Toppings, strawberry|serving|102|0|26|0
Mustard spinach, raw|cup, chopped|33|3|6|0
Pickle relish, sweet|cup|318|1|86|1
Rolls, dinner, rye|medium|103|4|19|1
Drumstick leaves, raw|cup, chopped|13|2|2|0
Yautia (tannier), raw|cup, sliced|132|2|32|0
Fruit leather, pieces|oz|102|0|24|1
Ice creams, chocolate|1/2 cup (4 fl oz)|143|2|19|7
Frankfurter, meatless|cup, sliced|326|28|11|19
Fish sticks, meatless|stick|81|6|2|5
Candies, butterscotch|oz|111|0|26|1
Candies, marshmallows|cup of miniature|159|1|41|0
Breadfruit seeds, raw|oz|54|2|8|2
Pokeberry shoots, raw|cup|37|4|6|1
Yambean (jicama), raw|cup|49|1|12|0
Brussels sprouts, raw|cup|38|3|8|0
Dandelion greens, raw|cup, chopped|25|2|5|0
Turnip greens, canned|1/2 cup|16|2|3|0
Frostings, coconut-nut|2 tbsp|152|0|18|8
Candies, sesame crunch|oz|146|3|14|9
Hearts of palm, canned|piece|9|1|2|0
Ice creams, strawberry|1/2 cup (4 fl oz)|127|2|18|6
Rolls, dinner, wheat|roll (1 oz)|76|2|13|2
Rolls, dinner, plain|oz|90|2|15|2
Malabar spinach, cooked|cup|10|1|1|0
Pumpkin pie mix, canned|cup|281|3|71|0
Toppings, nuts in syrup|2 tbsp|184|2|24|9
Peas and onions, canned|cup|61|4|10|0
Hominy, canned, white|cup|119|2|24|2
Cake, pound, fat-free|oz|80|2|17|0
Cookies, sugar, baked|oz|137|1|19|6
Crackers, rye, wafers|1/2 oz|47|1|11|0
Breadnut tree seeds, raw|oz (8-14 seeds)|62|2|13|0
Breadfruit seeds, boiled|oz|48|2|9|1
Candies, white chocolate|bar (3 oz)|458|5|50|27
Candies, sweet chocolate|oz|144|1|17|10
Coffeecake, creme-filled with chocolate frosting|oz|94|1|15|3
Bagels, plain, toasted|oz|82|3|16|0
Waffles, plain, frozen|oz|81|2|12|3
Hominy, canned, yellow|cup|115|2|23|1
Pie, fried pies, lemon|oz|90|1|12|5
Crackers, matzo, plain|1/2 oz|56|1|12|0
Pie, fried pies, fruit|oz|90|1|12|5
Noodles, flat, crunchy|cup|234|5|23|14
Chrysanthemum leaves, raw|cup, chopped|12|2|2|0
Jerusalem-artichokes, raw|cup slices|110|3|26|0
Breadfruit seeds, roasted|oz|59|2|11|1
Frozen yogurts, chocolate|cup|221|5|38|6
Pancakes, plain, frozen|oz|68|2|12|1
Noodles, japanese, soba|cup|113|6|24|0
Barley, pearled, cooked|cup|193|4|44|1
Pie, fried pies, cherry|oz|90|1|12|5
Lard|tbsp|115|0|0|13
Noodles, japanese, somen|cup|231|7|48|0
Fried Chicken, Thigh, meat and skin and breading|thigh, with skin|398|25|13|28
Jams and preserves, apricot|tbsp|48|0|13|0
Toppings, marshmallow cream|oz|91|0|22|0
Fried Chicken, Breast, meat and skin and breading|breast, with skin|501|44|16|30
Crackers, crispbread, rye|1/2 oz|52|1|12|0
Crackers, wheat, low salt|1/2 oz|67|1|9|3
Cornmeal, degermed, white|cup|581|11|125|3
Candies, semisweet chocolate|serving|70|1|9|4
Cookies, raisin, soft-type|oz|114|1|19|4
Cookies, shortbread, pecan|oz|154|1|16|9
Puff pastry, frozen, baked|oz|158|2|13|11
Rolls, dinner, whole-wheat|medium (2-1/2" dia)|96|3|18|2
Cookies, shortbread, plain|oz|142|2|18|7
Cornmeal, degermed, yellow|cup|581|11|125|3
Lasagna, Vegetable, frozen|serving|316|16|32|14
Vegetable chips, HAIN CELESTIAL GROUP, TERRA CHIPS|oz|147|1|16|8
Lemon grass (citronella), raw|cup|66|1|17|0
Safflower seed kernels, dried|oz|147|5|10|11
Sunflower seed kernels, dried|cup|818|29|28|72
Coffee, instant, with sugar|serving 2 tbsp|60|1|10|2
Chicken, meat only, roasted|cup, chopped or diced|266|40|0|10
Noodles, chinese, chow mein|1.5 oz|197|4|29|8
Chicken, dark meat, roasted|cup, chopped or diced|287|38|0|14
Duck, domesticated, roasted|cup, chopped or diced|281|33|0|16
Chicken, stewing, dark meat|cup, chopped or diced|361|39|0|21
Chicken, light meat, cooked|cup|269|46|1|8
Chicken, leg, meat and skin|3 oz|156|20|0|8
Chicken, neck, meat and skin|neck, bone removed|172|10|4|12
Chicken, nuggets, white meat|serving|214|12|13|13
Chicken, stewing, light meat|cup, chopped or diced|298|46|0|11
Chicken, roasting, dark meat|cup, chopped or diced|249|33|0|12
Chicken, back, meat and skin|3 oz|219|19|0|15
Chicken, light meat, roasted|cup, chopped or diced|242|43|0|6
Hazelnuts or filberts, blanched|oz|178|4|5|17
Sesame meal, partially defatted|oz|161|5|7|14
Sunflower seed kernels, toasted|oz|175|5|6|16
Candies, YORK Peppermint Pattie|patty 1.5 oz|165|1|35|3
Chicken, dark meat, drumstick|drumstick with skin|163|26|0|6
Chicken, roasting, light meat|cup, chopped or diced|214|38|0|6
Chicken patty, frozen, cooked|patty|172|9|8|12
Chicken, breast, meat and skin|oz|52|8|0|2
Energy drink, RED BULL, niacin|can 8.4 fl oz|116|1|28|0
Cocoa mix, low calorie, powder|packet (0.675 oz)|68|5|11|1
Chicken, meat and skin, cooked|3 oz|246|19|8|15
Chicken, capons, meat and skin|3 oz|195|25|0|10
Toppings, butterscotch or caramel|2 tbsp|103|1|27|0
Chicken, meat and skin, roasted|cup, chopped or diced|335|38|0|19
Chicken, stewing, meat and skin|3 oz|242|23|0|16
Chicken, roasting, meat and skin|3 oz|190|20|0|11
Chicken tenders, breaded, frozen|piece|52|3|4|3
Sunflower seed kernels, oil roasted|oz|168|6|6|14
Duck, domesticated, meat and skin|cup, chopped or diced|472|27|0|40
Malted drink mix, natural, powder|cup (8 fl oz)|228|10|28|8
Cocoa mix, with aspartame, powder|fl oz|9|0|2|0
Chicken, drumstick, meat and skin|oz|61|8|0|3
Chicken, dark meat, meat and skin|3 oz|253|19|8|16
Goose, domesticated, meat and skin|cup, chopped or diced|427|35|0|31
Energy drink, RED BULL, sugar free|serving 8.3 fl oz can|12|1|2|0
Tea, instant, sweetened with sugar|cup (8 fl oz)|91|0|22|0
Energy drink, VAULT, citrus flavor|oz|15|0|4|0
Energy drink, ROCKSTAR, sugar free|8 fl oz (1 serving)|10|1|2|0
Duck, young duckling, domesticated|3 oz|172|21|0|9
Lemonade, frozen concentrate, pink|fl oz|70|0|18|0
Feet, pickled|oz|40|3|0|3
Bologna, beef|slice|90|3|1|8
Cisco, smoked|oz|50|5|0|3
Chicken, cornish game hens, roasted|3 oz|114|20|0|3
Pumpkin and squash seed kernels, dried|oz|158|9|3|14
Haddock, smoked|3 oz|99|21|0|1
Candies, sweet chocolate coated fondant|patty, large|157|1|35|4
Cottonseed kernels, roasted (glandless)|tbsp|51|3|2|4
Safflower seed meal, partially defatted|oz|97|10|14|1
Chicken, nuggets, dark and white meat|serving|229|11|15|14
Mackerel, salted|cup, cooked|415|25|0|34
Pumpkin and squash seed kernels, roasted|oz|163|8|4|14
Beef, rib, eye|3 oz|225|23|0|14
Sesame seed kernels, dried (decorticated)|tbsp|50|2|1|5
Frankfurter, meat|serving (1 hot dog)|151|5|2|13
Sablefish, smoked|oz|73|5|0|6
Frozen novelties, Fat Free FUDGESICLE bars|serving 1 pop|65|3|14|0
Peas, green, raw|cup|117|8|21|1
Fish sticks, frozen|piece (4" x 2" x 1/2")|158|6|12|9
Chicken, cornish game hens, meat and skin|3 oz|220|19|0|16
Tomato, red, ripe|large|28|1|7|0
Onion, sweet, raw|NLEA serving|47|1|11|0
Wasabi, root, raw|cup, sliced|142|6|31|1
Cabbage, red, raw|cup, chopped|28|1|7|0
Kale, scotch, raw|cup, chopped|28|2|6|0
Fennel, bulb, raw|cup, sliced|27|1|6|0
Candies, M&M MARS 3 MUSKETEERS Truffle Crisp|serving|167|2|20|9
Frozen yogurts, flavors other than chocolate|cup|221|5|38|6
Pate, truffle flavor|serving 2 oz|183|6|4|16
Tomato, green, raw|large|42|2|9|0
Jute, potherb, raw|cup|10|1|2|0
Cress, garden, raw|cup|16|1|3|0
Carrots, baby, raw|NLEA serving|30|0|7|0
Lebanon bologna, beef|oz|49|5|0|3
Taro, tahitian, raw|cup slices|55|4|9|1
Squash, winter, raw|cup, cubes|39|1|10|0
Tomato, yellow, raw|cup, chopped|21|1|4|0
Squash, summer, raw|medium|31|2|7|0
Peppers, sweet, red|small|23|1|4|0
Chayote, fruit, raw|cup (1" pieces)|25|1|6|0
Peas, green, canned|cup|114|7|21|1
Peas, green, frozen|1/2 cup|62|4|11|0
Onion, frozen, whole|cup|59|2|14|0
Beef, rib, back ribs|3 oz|254|24|0|18
Soybeans, green, raw|cup|376|33|28|17
Beef, loin, top loin|3 oz|224|22|0|14
Okra, frozen, boiled|1/2 cup slices|27|2|6|0
Beef, rib, shortribs|3 oz|400|18|0|36
Beef, brisket, whole|3 oz|247|23|0|17
Yam, boiled, drained|cup, cubes|158|2|37|0
Taro, leaves, cooked|cup|35|4|6|1
Beef, round, knuckle|3 oz|160|23|0|7
Kale, frozen, boiled|cup, chopped|39|4|7|1
Kale, scotch, boiled|cup, chopped|36|2|7|0
Chard, swiss, boiled|cup, chopped|35|3|7|0
Cottonseed meal, partially defatted (glandless)|oz|104|14|11|1
Kielbasa, fully grilled|3 oz|286|11|4|25
Conch, baked or broiled|cup, sliced|165|33|2|2
Beef, round, full cut|3 oz|162|25|0|6
Peppers, sweet, green|small|15|1|3|0
Peppers, serrano, raw|cup, chopped|34|2|7|0
Squash, winter, baked|cup, cubes|76|2|18|1
Cucumber, peeled, raw|medium|24|1|4|0
Kale, boiled, drained|cup, chopped|36|2|7|0
Cabbage, napa, cooked|cup|13|1|2|0
Mushrooms, morel, raw|cup|20|2|3|0
Mushrooms, enoki, raw|cup whole|24|2|5|0
Mushrooms, white, raw|cup, whole|21|3|3|0
Squash, winter, acorn|cup, cubes|56|1|15|0
Cress, garden, boiled|cup|31|3|5|1
Okra, boiled, drained|1/2 cup slices|18|2|4|0
Fireweed, leaves, raw|cup, chopped|24|1|4|1
Jute, potherb, boiled|cup|32|3|6|0
Frozen novelties, No Sugar Added CREAMSICLE Pops|serving 1 pop|32|2|6|0
Beef, chuck, top blade|3 oz ( 1 serving )|184|22|0|10
Beef, round, tip round|3 oz|160|23|0|7
Beef, round, top round|3 oz|178|30|0|5
Gefiltefish, sweet recipe|piece|35|4|3|1
Bologna, meat and poultry|slice|94|3|2|8
Corned beef loaf, jellied|slice (1 oz) (4" x 4" x 3/32" thick)|43|6|0|2
Chestnuts, chinese, raw|oz|64|1|14|0
Beef, chuck, clod roast|3 oz ( 1 serving )|145|22|0|6
Beef, chuck, short ribs|3 oz|212|24|0|13
Candies, fudge, vanilla|oz|109|0|23|2
Beef, tenderloin, roast|3 oz|275|20|0|21
Sweetener, syrup, agave|1/4 cup|170|0|42|0
Candies, halavah, plain|oz|133|4|17|6
Beef, cured, corned beef|3 oz|213|15|0|16
Beef, brisket, flat half|3 oz|238|25|0|15
Beef, chuck, blade roast|3 oz|215|26|0|11
Chestnuts, european, raw|cup|309|4|66|3
Pine nuts, pinyon, dried|oz|178|3|6|17
Chestnuts, japanese, raw|oz|44|1|10|0
Lasagna with meat & sauce, low-fat, frozen entree|oz|29|2|4|1
Candies, fudge, chocolate|oz|131|1|19|5
Chestnuts, chinese, dried|oz|103|2|23|0
Beef, round, eye of round|3 oz|177|24|0|8
Beef, round, bottom round|3 oz|190|28|0|8
Beef, brisket, point half|3 oz|304|20|0|24
Desserts, rennin, tablets|package (0.35 oz)|8|0|2|0
Ice creams, vanilla, rich|1/2 cup|266|4|24|17
Frostings, vanilla, creamy|0.083 package|159|0|26|6
Beef, chuck, arm pot roast|3 oz|252|25|0|16
Beef, chuck, shoulder clod|serving (3 oz)|154|22|0|6
Sesame seeds, whole, dried|tbsp|52|2|2|4
Chestnuts, european, dried|oz|106|2|22|1
Pecans, oil roasted, added|oz (15 halves)|203|3|4|21
Restaurant, Latino, tamale|piece|309|6|44|12
Ice creams, vanilla, light|serving 1/2 cup|137|4|22|4
Beef, round, outside round|serving (3 oz)|162|23|0|7
Beef, short loin, top loin|3 oz|236|22|0|16
Ice creams, chocolate, rich|cup|377|7|31|25
Desserts, mousse, chocolate|1/2 cup|454|8|32|32
Candies, carob, unsweetened|oz|153|2|16|9
Puddings, vanilla, fat free|serving 3.5 oz shelf stable|88|2|20|0
Puddings, tapioca, fat free|container refrigerated 4 oz|105|2|24|0
Chestnuts, chinese, roasted|oz|68|1|15|0
Beef, ribeye filet, grilled|fillet|269|39|0|12
Beef, rib eye roast, lip-on|3 oz|204|23|0|12
Almonds, oil roasted, added|oz (28 almonds)|170|6|5|16
Beef, loin, tenderloin roast|3 oz|156|23|0|7
Beef, chuck for stew, cooked|3 oz|162|28|0|6
Chestnuts, european, roasted|cup|350|4|76|3
Chestnuts, japanese, roasted|oz|57|1|13|0
Beef, round, top round roast|3 oz|136|25|0|4
Beef, rib, whole (ribs 6-12)|3 oz|286|19|0|23
Pie fillings, canned, cherry|1/8 can|85|0|21|0
Ice creams, chocolate, light|serving|127|3|18|5
Frostings, chocolate, creamy|2 tbsp creamy|163|0|26|7
Candies, REESE'S, FAST BREAK|2 oz bar|265|5|34|13
Puddings, chocolate, fat free|serving 4 oz|105|2|24|0
Syrups, chocolate, fudge-type|2 tbsp|133|2|24|3
Ice creams, vanilla, fat free|1/2 cup|92|3|20|0
Brazilnuts, dried, unblanched|oz (6 kernels)|186|4|4|19
Beef, loin, top sirloin filet|fillet|207|37|0|6
Restaurant, Latino, empanadas|piece|298|10|28|16
Candies, nougat, with almonds|piece|56|0|13|0
Beef, shank crosscuts, cooked|3 oz|171|29|0|5
Beef, top loin filet, grilled|fillet|263|40|0|12
Fat, duck|tbsp|113|0|0|13
Oil, palm|tbsp|120|0|0|14
Beef, round, bottom round roast|3 oz|144|24|0|4
Beef, loin, bottom sirloin butt|serving|155|23|0|7
Frozen novelties, ice type, pop|serving 1.75 fl oz pop|41|0|10|0
Pie fillings, blueberry, canned|serving|273|1|67|0
Desserts, flan, caramel custard|1/2 cup|222|7|35|6
Cashew nuts, oil roasted, added|oz (18 kernels)|164|5|8|14
Beef, rib, large end (ribs 6-9)|3 oz|316|19|0|26
Fat, goose|tbsp|115|0|0|13
Frozen novelties, ice type, lime|1/2 cup (4 fl oz)|127|0|32|0
Coconut cream, canned, sweetened|tbsp|68|0|10|3
Oil, canola|tbsp|124|0|0|14
Oil, walnut|tbsp|120|0|0|14
Candies, fudge, vanilla with nuts|oz|123|1|21|4
Frozen novelties, ice type, fruit|bar|12|0|3|0
Pie fillings, cherry, low calorie|serving|45|1|10|0
Oil, avocado|tbsp|124|0|0|14
Oil, babassu|tbsp|120|0|0|14
Oil, coconut|tbsp|117|0|0|14
Almonds, honey roasted, unblanched|oz|168|5|8|14
Sisymbrium sp. seeds, whole, dried|cup|235|9|43|3
Restaurant, family style, coleslaw|serving|172|1|13|13
Candies, NESTLE, AFTER EIGHT Mints|piece|36|0|7|1
Restaurant, family style, fish fillet|serving|495|30|38|24
Mixed nuts, oil roasted, with peanuts|oz|172|6|6|15
Restaurant, Chinese, kung pao chicken|order|779|59|42|42
Restaurant, family style, hash browns|serving|244|3|33|11
Restaurant, Chinese, chicken chow mein|order|513|41|50|17
Restaurant, Chinese, vegetable lo mein|cup|165|6|27|3
Sunflower seed kernels, toasted, added|oz|175|5|6|16
Chestnuts, chinese, boiled and steamed|oz|43|1|10|0
Chestnuts, european, boiled and steamed|oz|37|1|8|0
Chestnuts, japanese, boiled and steamed|oz|16|0|4|0
Pumpkin and squash seeds, whole, roasted|cup|285|12|34|12
Restaurant, Chinese, vegetable chow mein|cup|84|3|11|3
Restaurant, Chinese, beef and vegetables|order|603|41|42|30
Mixed nuts, oil roasted, without peanuts|oz|174|4|6|16
Sesame seeds, whole, roasted and toasted|oz|160|5|7|14
Restaurant, family style, chicken tenders|serving|607|38|39|33
Restaurant, family style, chicken fingers|piece|114|7|7|6
Crab, blue, canned|cup|112|24|0|1
Crab, blue, cooked|oz|24|5|0|0
Pout, ocean, cooked|3 oz|87|18|0|1
Crab, queen, cooked|3 oz|98|20|0|1
Restaurant, Chinese, chicken and vegetables|cup|145|12|8|7
Mussel, blue, cooked|3 oz|146|20|6|4
Cod, Pacific, cooked|3 oz|72|16|0|0
Trout, rainbow, wild|3 oz|128|20|0|5
Cod, Atlantic, canned|3 oz|89|19|0|1
Oyster, eastern, wild|3 oz|87|10|5|3
Cod, Atlantic, cooked|3 oz|89|19|0|1
Pike, walleye, cooked|3 oz|101|21|0|1
Sucker, white, cooked|3 oz|101|18|0|2
Bass, striped, cooked|3 oz|105|19|0|2
Carp, cooked, dry heat|3 oz|138|19|0|6
Smelt, rainbow, cooked|3 oz|105|19|0|3
Spot, cooked, dry heat|3 oz|134|20|0|5
Mackerel, jack, canned|cup|296|44|0|12
Ling, cooked, dry heat|3 oz|94|21|0|1
Mackerel, king, cooked|3 oz|114|22|0|2
Scup, cooked, dry heat|3 oz|115|21|0|3
Crab, blue, crab cakes|cake|93|12|0|4
Catfish, channel, wild|3 oz|89|16|0|2
Trout, rainbow, farmed|3 oz|143|20|0|6
Pike, northern, cooked|3 oz|96|21|0|1
Cusk, cooked, dry heat|3 oz|95|21|0|1
Shad, american, cooked|3 oz|214|18|0|15
Restaurant, Latino, pupusas del cerdo (pupusas|piece|283|14|28|13
Restaurant, Latino, pupusas con queso (pupusas|piece|300|14|26|16
Oyster, eastern, farmed|3 oz|67|6|6|2
Oyster, Pacific, cooked|3 oz|139|16|8|4
Oyster, eastern, cooked|3 oz|169|8|10|11
Pollock, Alaska, cooked|3 oz|94|20|0|1
Crab, dungeness, cooked|3 oz|94|19|1|1
Mullet, striped, cooked|3 oz|128|21|0|4
Octopus, common, cooked|3 oz|139|25|4|2
Oyster, eastern, canned|3 oz|58|6|3|2
Herring, Pacific, cooked|3 oz|212|18|0|15
Catfish, channel, cooked|3 oz|195|15|7|11
Catfish, channel, farmed|3 oz|122|16|0|6
Burbot, cooked, dry heat|3 oz|98|21|0|1
Drum, freshwater, cooked|3 oz|130|19|0|5
Pompano, florida, cooked|3 oz|179|20|0|10
Jellyfish, dried, salted|cup|21|3|0|1
Turbot, european, cooked|3 oz|104|18|0|3
Scallop, cooked, steamed|3 oz|94|18|5|1
Restaurant, Latino, pupusas con frijoles (pupusas|piece|289|7|40|11
Restaurant, family style, fried mozzarella sticks|piece|101|5|8|6
Croaker, Atlantic, cooked|3 oz|188|16|6|11
Lobster, northern, cooked|cup|129|28|0|1
Mackerel, spanish, cooked|3 oz|134|20|0|5
Pollock, Atlantic, cooked|3 oz|100|21|0|1
Herring, Atlantic, cooked|3 oz|173|20|0|10
Haddock, cooked, dry heat|3 oz|76|17|0|0
Crab, alaska king, cooked|3 oz|82|16|0|1
Lingcod, cooked, dry heat|3 oz|93|19|0|1
Herring, Atlantic, pickled|cup|367|20|14|25
Mackerel, Atlantic, cooked|3 oz|223|20|0|15
Eel, mixed species, cooked|3 oz|201|20|0|13
Bluefish, cooked, dry heat|3 oz|135|22|0|5
Milkfish, cooked, dry heat|3 oz|162|22|0|7
Monkfish, cooked, dry heat|3 oz|82|16|0|2
Halibut, greenland, cooked|3 oz|203|16|0|15
Veal, rib, cooked|3 oz|213|28|0|11
Veal, rib, roasted|3 oz|194|20|0|12
Veal, loin, cooked|3 oz|241|26|0|15
Veal, shoulder, arm|3 oz|201|29|0|9
Veal, breast, whole|3 oz|226|23|0|14
Lamb, domestic, leg|3 oz|219|22|0|14
Lamb, domestic, rib|3 oz|307|19|0|25
Veal, loin, roasted|3 oz|184|21|0|10
Game meat, elk, loin|serving ( 3 oz )|142|26|0|3
Lamb, domestic, loin|3 oz|269|21|0|20
Lamb, ground, broiled|3 oz|241|21|0|17
Veal, shoulder, blade|3 oz|191|27|0|9
Game meat, elk, round|serving ( 3 oz )|133|26|0|2
Veal, sirloin, cooked|3 oz|214|27|0|11
Veal, ground, broiled|3 oz|146|21|0|6
Game meat, deer, loin|serving ( 3 oz )|128|26|0|2
Game meat, boar, wild|3 oz|136|24|0|4
Veal, sirloin, roasted|3 oz|172|21|0|9
Game meat, elk, ground|serving ( 3 oz )|164|23|0|7
Game meat, deer, ground|patty|174|25|0|8
Game meat, bison, chuck|serving ( 3 oz )|164|29|0|5`;

function parseFoodTier(blob, tier) {
  const out = [];
  for (const line of blob.split("\n")) {
    if (!line) continue;
    const p = line.split("|");
    if (p.length < 6) continue;
    out.push({
      name: `${p[0]} (${p[1]})`,
      kcal: +p[2], protein: +p[3], carbs: +p[4], fat: +p[5],
      tier,
    });
  }
  return out;
}

// Hand-written quick picks stay first — they use the words students
// actually type ("Chocolate milk", "PB&J") rather than USDA's
// comma-inverted descriptions.
const FOOD_INDEX = (() => {
  const seen = new Set();
  const out = [];
  const push = (f, tier) => {
    const key = f.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...f, tier });
  };
  COMMON_FOODS.forEach((f) => push(f, 0));
  parseFoodTier(USDA_CORE, 1).forEach((f) => push(f, 1));
  parseFoodTier(USDA_MORE, 2).forEach((f) => push(f, 2));
  return out;
})();

/* Ranked search. With a few thousand entries a plain substring filter
   buries the obvious answer, so score matches: a name starting with
   the query beats a word starting with it, which beats a match buried
   mid-word. Quick picks and core foods win ties, then shorter names. */
function foodMatches(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored = [];
  for (const f of FOOD_INDEX) {
    const n = f.name.toLowerCase();
    const at = n.indexOf(q);
    if (at < 0) continue;
    let s = at === 0 ? 100 : /[\s(,\-]/.test(n[at - 1]) ? 70 : 30;
    s -= f.tier * 12;
    s -= Math.min(24, n.length / 3);
    s -= Math.min(10, at / 6);
    scored.push({ f, s });
    if (scored.length > 900) break;
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.f);
}

// Compact numeric field used inside the optional "+ nutrition" row.
function MacroInput({ label, value, onChange }) {
  return (
    <div style={{ flex: 1, minWidth: 56 }}>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" placeholder="0"
        className="f" style={{ ...inputCss, fontSize: 12, padding: "6px 7px", textAlign: "center" }} />
      <div style={{ fontSize: 9.5, color: C.steel, textAlign: "center", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

// A target-vs-actual bar — used for protein and water.
function MacroBar({ label, value, target, unit = "" }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : null;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: C.textDim }}>{label}</span>
        <span style={{ fontWeight: 700 }}>
          {Math.round(value)}{unit}{target ? <span style={{ color: C.textDim, fontWeight: 500 }}> / {target}{unit}</span> : ""}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.surfaceAlt, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${target ? pct : Math.min(100, value > 0 ? 100 : 0)}%`, background: C.accent, borderRadius: 3, transition: "width 0.2s ease" }} />
      </div>
    </div>
  );
}

// The visual calorie dial, Cronometer-style: a ring that fills as
// calories are logged, split into protein/carb/fat colored arcs sized
// by their share of calories. Center shows the running total.
const MACRO_COLORS = { protein: "#F2C14E", carbs: "#6FA8DC", fat: "#C9A0DC" };
function CalorieDial({ kcal, target, protein, carbs, fat, size = 172 }) {
  const stroke = 15;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const scale = target || 3000; // visual scale only when no real target is set
  const frac = Math.max(0, Math.min(1, kcal / scale));
  const filledLen = frac * circumference;

  const pCal = protein * 4, cCal = carbs * 4, fCal = fat * 9;
  const macroTotal = pCal + cCal + fCal;
  const segments = macroTotal > 0
    ? [
        { color: MACRO_COLORS.protein, len: (pCal / macroTotal) * filledLen },
        { color: MACRO_COLORS.carbs, len: (cCal / macroTotal) * filledLen },
        { color: MACRO_COLORS.fat, len: (fCal / macroTotal) * filledLen },
      ].filter((s) => s.len > 0.01)
    : filledLen > 0 ? [{ color: C.accent, len: filledLen }] : [];

  let cursor = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.surfaceAlt} strokeWidth={stroke} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {segments.map((s, i) => {
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
                strokeDasharray={`${s.len} ${circumference - s.len}`} strokeDashoffset={-cursor} strokeLinecap="butt" />
            );
            cursor += s.len;
            return el;
          })}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {target ? (
          <>
            <span className="d" style={{ fontSize: 26, lineHeight: 1, color: C.text }}>
              {Math.round(kcal)}<span style={{ color: C.textDim, fontSize: 20 }}> / {target}</span>
            </span>
            <span style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>kcal today</span>
          </>
        ) : (
          <>
            <span className="d" style={{ fontSize: 30, lineHeight: 1, color: C.text }}>{Math.round(kcal)}</span>
            <span style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>kcal today — no target set</span>
          </>
        )}
      </div>
    </div>
  );
}

// Today's running totals against optional daily targets, led by the
// calorie dial — the "diary summary" every Cronometer screen leads with.
function DailyNutritionSummary({ foods, targets, onSetTargets, suggestedProtein, bodyweight, gender, onSetGender, weightGoal, onSetWeightGoal, heightIn, onWeightConcern }) {
  const [editing, setEditing] = useState(false);
  const [cal, setCal] = useState(targets && targets.calories ? String(targets.calories) : "");
  const [pro, setPro] = useState(targets && targets.protein ? String(targets.protein) : "");
  const [calcWeight, setCalcWeight] = useState(bodyweight ? String(bodyweight) : "");
  const [calcGoal, setCalcGoal] = useState(weightGoal ? String(weightGoal) : "");
  const [justApplied, setJustApplied] = useState(false);

  const totals = useMemo(() => foods.reduce((acc, f) => ({
    kcal: acc.kcal + (Number(f.kcal) || 0),
    protein: acc.protein + (Number(f.protein) || 0),
    carbs: acc.carbs + (Number(f.carbs) || 0),
    fat: acc.fat + (Number(f.fat) || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 }), [foods]);

  const estimate = useMemo(
    () => estimateCalories({ weight: Number(calcWeight) || null, goalWeight: Number(calcGoal) || null, gender, heightIn }),
    [calcWeight, calcGoal, gender, heightIn]
  );

  // Weight goal flags: checked against current weight the same way
  // either direction, on every path that can set a goal (manual save
  // or one-tap "use this estimate"). Never blocks setting the goal —
  // that's the student's call — but always shows a caring inline note
  // and, when a coach-notify callback is wired up, raises a flag on
  // their board too, so a concerning number doesn't just sit in a
  // settings field unnoticed.
  const [concern, setConcern] = useState(null);
  const checkGoal = (goalNum) => {
    const currentWeight = bodyweight || Number(calcWeight) || null;
    const c = weightGoalConcern(currentWeight, goalNum);
    if (c) {
      setConcern(c);
      if (onWeightConcern) onWeightConcern({ ...c, currentWeight, goalWeight: goalNum });
    } else {
      setConcern(null);
    }
  };

  const save = () => {
    onSetTargets({ calories: cal ? Number(cal) : undefined, protein: pro ? Number(pro) : undefined });
    if (calcGoal) { onSetWeightGoal(Number(calcGoal)); checkGoal(Number(calcGoal)); }
    setEditing(false);
  };

  const useEstimate = () => {
    if (!estimate) return;
    setCal(String(estimate.kcal));
    setPro(String(estimate.protein));
    // Apply immediately — the dial reads the saved target, not the
    // input field, so this can't wait on a separate Save click.
    onSetTargets({ calories: estimate.kcal, protein: estimate.protein });
    if (calcGoal) { onSetWeightGoal(Number(calcGoal)); checkGoal(Number(calcGoal)); }
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2500);
  };

  const legend = [
    { key: "protein", label: "Protein", g: totals.protein },
    { key: "carbs", label: "Carbs", g: totals.carbs },
    { key: "fat", label: "Fat", g: totals.fat },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow icon={Gauge}>Today's nutrition</Eyebrow>
        <button onClick={() => { setEditing(!editing); setCal(targets && targets.calories ? String(targets.calories) : ""); setPro(targets && targets.protein ? String(targets.protein) : ""); }}
          className="f" style={{ background: "none", border: "none", color: C.accent, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
          {editing ? "Close" : "Set targets"}
        </button>
      </div>

      {(targets && (targets.calories || targets.protein)) && (
        <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
          Daily target: {targets.calories ? <strong style={{ color: C.text }}>{targets.calories} kcal</strong> : "no calorie target"}
          {targets.protein ? <> · <strong style={{ color: C.text }}>{targets.protein}g protein</strong></> : ""}
        </div>
      )}

      {editing && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 100 }}>
              <Field label="Calorie target"><input value={cal} onChange={(e) => setCal(e.target.value)} inputMode="numeric" placeholder="e.g. 2800" className="f" style={inputCss} /></Field>
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <Field label="Protein target (g)" hint={suggestedProtein ? `Suggested ~${suggestedProtein}g` : undefined}>
                <input value={pro} onChange={(e) => setPro(e.target.value)} inputMode="numeric" placeholder={suggestedProtein ? String(suggestedProtein) : "e.g. 140"} className="f" style={inputCss} />
              </Field>
            </div>
            <Button size="sm" icon={Check} onClick={save}>Save</Button>
          </div>

          <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 10 }}>
              Not sure what to set? Estimate it
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
              <div style={{ width: 100 }}>
                <Field label="Weight (lb)"><input value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} inputMode="numeric" className="f" style={inputCss} /></Field>
              </div>
              <div style={{ width: 100 }}>
                <Field label="Goal weight" hint="Optional"><input value={calcGoal} onChange={(e) => setCalcGoal(e.target.value)} inputMode="numeric" placeholder="Same" className="f" style={inputCss} /></Field>
              </div>
              <div style={{ width: 140 }}>
                <Field label="Gender">
                  <select value={gender || ""} onChange={(e) => onSetGender(e.target.value || null)} className="f" style={inputCss}>
                    <option value="">Not set</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </Field>
              </div>
            </div>
            {concern && (
              <div style={{ background: "rgba(224,133,133,.1)", border: "1px solid rgba(224,133,133,.35)", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                <p style={{ fontSize: 12.5, color: C.text, margin: 0, lineHeight: 1.55 }}>
                  {concern.direction === "lose"
                    ? `That's a big cut from your current weight — about ${concern.pct}%. This doesn't look like enough fuel for training to hold up well.`
                    : `That's a big jump from your current weight — about ${concern.pct}%. That pace of gain is worth planning out with someone, not just chasing a number.`}
                  {" "}Talk to your coach before locking this in — they'd rather help you get there safely than have you figure it out alone.
                </p>
              </div>
            )}
            {!gender ? (
              <p style={{ fontSize: 12, color: C.steel, margin: 0, lineHeight: 1.5 }}>Set gender above — the estimate is calculated differently for males and females.</p>
            ) : !estimate ? (
              <p style={{ fontSize: 12, color: C.steel, margin: 0, lineHeight: 1.5 }}>Enter your weight to see an estimate.</p>
            ) : (
              <div>
                <p style={{ fontSize: 12.5, color: C.textDim, margin: "0 0 10px", lineHeight: 1.55 }}>
                  Maintenance is roughly <strong style={{ color: C.text }}>{estimate.maintenance} kcal/day</strong>.
                  {estimate.direction === "lose" && <> A moderate, gradual pace toward your goal weight puts you around <strong style={{ color: C.accent }}>{estimate.kcal} kcal</strong> and <strong style={{ color: C.accent }}>{estimate.protein}g protein</strong> — extra protein protects muscle while eating in a deficit.</>}
                  {estimate.direction === "gain" && <> A moderate, gradual pace toward your goal weight puts you around <strong style={{ color: C.accent }}>{estimate.kcal} kcal</strong> and <strong style={{ color: C.accent }}>{estimate.protein}g protein</strong> to support the gain.</>}
                  {estimate.direction === "maintain" && <> To hold steady, aim for around <strong style={{ color: C.accent }}>{estimate.kcal} kcal</strong> and <strong style={{ color: C.accent }}>{estimate.protein}g protein</strong>.</>}
                </p>
                <Button size="sm" variant="subtle" onClick={useEstimate}>Use this estimate</Button>
                {justApplied && (
                  <span className="pop" style={{ marginLeft: 10, fontSize: 12, color: C.good, fontWeight: 600 }}>
                    Applied — dial updated
                  </span>
                )}
              </div>
            )}
            <p style={{ fontSize: 10.5, color: C.steel, margin: "10px 0 0", lineHeight: 1.5 }}>
              Uses a standard BMR formula (Mifflin-St Jeor) with typical height and age for a high schooler, since this calculator only asks for weight — if you're notably taller/shorter or older/younger than average, your real number will differ some. A rough estimate either way, not medical advice. For a real weight goal, loop in your athletic trainer, coach, or a doctor, especially if you're still growing.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <CalorieDial kcal={totals.kcal} target={targets && targets.calories} protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
        <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
          <MacroBar label="Protein" value={totals.protein} target={targets && targets.protein} unit="g" />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {legend.map((l) => (
              <div key={l.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim }}>
                  <span style={{ width: 8, height: 8, borderRadius: 8, background: MACRO_COLORS[l.key], display: "inline-block" }} />
                  {l.label}
                </span>
                <strong style={{ color: C.text }}>{Math.round(l.g)}g</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!totals.kcal && !totals.protein && !totals.carbs && !totals.fat && (
        <p style={{ fontSize: 11.5, color: C.steel, marginTop: 12, lineHeight: 1.5 }}>
          Add calories or macros to any food entry below (tap &ldquo;+ nutrition&rdquo;) to fill in the dial.
        </p>
      )}
    </Card>
  );
}

// Actual logged water (not just the countdown timer) — quick-add
// buttons plus a running total against the rough daily target.
function WaterLog({ entries, targetOz, onAdd, onDelete }) {
  const [custom, setCustom] = useState("");
  const total = entries.reduce((a, w) => a + (Number(w.oz) || 0), 0);
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
      <MacroBar label="Water logged" value={total} target={targetOz} unit=" oz" />
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
        {[8, 16, 24].map((oz) => (
          <Button key={oz} size="sm" variant="subtle" onClick={() => onAdd(oz)}>+{oz} oz</Button>
        ))}
        <input value={custom} onChange={(e) => setCustom(e.target.value)} inputMode="numeric" placeholder="oz"
          className="f" style={{ ...inputCss, width: 64, fontSize: 12, padding: "6px 8px" }} />
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => { const v = parseFloat(custom); if (v > 0) { onAdd(v); setCustom(""); } }}>Add</Button>
      </div>
      {entries.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {[...entries].sort((a, b) => a.time.localeCompare(b.time)).map((w) => (
            <span key={w.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 5px 4px 10px", fontSize: 11.5 }}>
              {w.oz} oz
              <button onClick={() => onDelete(w.id)} className="f" style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", display: "flex", padding: 2 }} aria-label="Remove">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Free-type log for a single student-defined meal — includes an
// optional macro row, a built-in-reference autocomplete that auto-fills
// macros for common foods, and tap-to-relog chips from this athlete's
// own frequent entries.
function MealFoodLog({ foods, history, onAdd, onDelete }) {
  const [text, setText] = useState("");
  const [showMacros, setShowMacros] = useState(false);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  const reset = () => { setText(""); setKcal(""); setProtein(""); setCarbs(""); setFat(""); setShowMacros(false); setShowSuggest(false); };

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd({
      text: t,
      kcal: kcal ? Number(kcal) : undefined,
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
    });
    reset();
  };

  const applySuggestion = (f) => {
    setText(f.name);
    setKcal(String(f.kcal));
    setProtein(String(f.protein));
    setCarbs(String(f.carbs));
    setFat(String(f.fat));
    setShowMacros(true);
    setShowSuggest(false);
  };

  const quickAdd = (f) => onAdd({ text: f.text, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat });

  const suggestions = showSuggest ? foodMatches(text) : [];

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
      {history && history.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {history.map((f) => (
            <button key={f.text} onClick={() => quickAdd(f)} className="f"
              style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 10px", fontSize: 11.5, color: C.textDim, cursor: "pointer" }}>
              + {f.text}
            </button>
          ))}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && !showMacros && submit()}
            placeholder="What did you actually have?" className="f" style={{ ...inputCss, flex: 1, fontSize: 12.5, padding: "7px 9px" }} />
          <Button size="sm" variant="ghost" onClick={() => setShowMacros(!showMacros)} aria-label="Add nutrition info">
            {showMacros ? "− nutrition" : "+ nutrition"}
          </Button>
          <Button size="sm" icon={Plus} onClick={submit}>Add</Button>
        </div>
        {suggestions.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", zIndex: 20 }}>
            {suggestions.map((f) => (
              <button key={f.name} onMouseDown={() => applySuggestion(f)} className="f"
                style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "8px 10px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 12 }}>
                <span>{f.name}</span>
                <span style={{ color: C.steel }}>{f.kcal} kcal</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {showMacros && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <MacroInput label="kcal" value={kcal} onChange={setKcal} />
          <MacroInput label="protein g" value={protein} onChange={setProtein} />
          <MacroInput label="carbs g" value={carbs} onChange={setCarbs} />
          <MacroInput label="fat g" value={fat} onChange={setFat} />
        </div>
      )}
      {foods.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
          {foods.map((f) => {
            const hasMacro = f.kcal || f.protein || f.carbs || f.fat;
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12.5, padding: "6px 9px", background: C.surfaceAlt, borderRadius: 7 }}>
                <span style={{ minWidth: 0, overflowWrap: "break-word" }}>
                  {f.text}
                  {hasMacro && (
                    <span style={{ color: C.steel, fontSize: 10.5 }}>
                      {" — "}
                      {[f.kcal ? `${f.kcal} kcal` : null, f.protein ? `${f.protein}p` : null, f.carbs ? `${f.carbs}c` : null, f.fat ? `${f.fat}f` : null].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, color: C.steel }}>{new Date(f.time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                  <button onClick={() => onDelete(f.id)} className="f" style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", display: "flex", padding: 2 }} aria-label={`Remove ${f.text}`}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// A student's own list of meals for the day — no coach-prescribed
// plan, just whatever slots they want (Breakfast/Lunch/Dinner/Snacks
// to start, freely renamed, added to, or removed).
function MealSlotsManager({ slots, onChange }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const add = () => {
    const n = name.trim();
    if (!n) return;
    onChange([...slots, { id: uid(), name: n }]);
    setName(""); setAdding(false);
  };
  const remove = (id) => onChange(slots.filter((s) => s.id !== id));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
      {!adding ? (
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAdding(true)}>Add a meal</Button>
      ) : (
        <>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. Post-Workout" className="f" style={{ ...inputCss, width: 180, fontSize: 13, padding: "7px 9px" }} />
          <Button size="sm" icon={Check} onClick={add}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setName(""); }}>Cancel</Button>
        </>
      )}
    </div>
  );
}

// Sourced from a high-school-ready fueling lesson plan built around
// real sports-dietitian guidance (signs of under-fueling, the
// "baseball rule" for building a plate, key micronutrients for a
// growing athlete's body, and cycle-aware fueling for female
// athletes). Kept as expandable reference cards rather than a wall of
// text, since this lives inside a tab a student is already using to
// log food, not a place to read a full article.
function FuelEducation({ gender }) {
  const [open, setOpen] = useState(null);
  const sections = [
    {
      id: "mindset", icon: Heart, title: "Fueling, not dieting",
      body: "Social media diet culture treats food as something to earn or restrict. Athletic fueling flips that: food is energy, full stop. Sports science has a real term for this — Energy Availability, the fuel left over for your body to actually grow, repair, and function after training burns its share. Run that too low for too long and you get RED-S (Relative Energy Deficiency in Sport) — a real, documented condition, not a vague worry. Under-fueling is a far bigger risk to a young athlete than eating \"too much.\"",
    },
    {
      id: "timing", icon: Timer, title: "Nutrient timing: before & after training",
      body: "Before a hard session, your body wants carbs it can access fast — fruit, toast, a granola bar — to top off the energy you're about to burn. Heavy fat or protein sitting in your stomach right before training just slows you down. After training is when protein earns its keep: aim to eat within a couple hours so your body has the raw material to actually repair and adapt, not just refuel.",
    },
    {
      id: "signs", icon: AlertTriangle, title: "Signs you're under-fueling",
      body: "Fatigue that stacks up and doesn't go away with a good night's sleep. Performance that's flat or slipping while teammates keep improving. Injuries — especially bone stress injuries — that keep coming back or take forever to heal. Any of these on their own is worth a second look; more than one together is worth talking to your coach.",
    },
    {
      id: "plate", icon: ClipboardList, title: "Build a plate: the baseball rule",
      body: "For most meals, aim for three baseball-sized portions: Carbs (rice, pasta, bread, sweet potato) for energy. Protein (chicken, beef, fish, eggs) for muscle repair. Color (fruits and vegetables) for recovery and vitamins. Add a serving of healthy fat — avocado, olive oil, nuts — to round it out. Always eat something before and after training; skipping is worse than eating something imperfect.",
    },
    {
      id: "micros", icon: Award, title: "Micronutrient MVPs",
      body: "Iron — prevents anemia and fatigue; red meat, poultry, beans, fortified grains. Calcium — builds bone density (most of it is laid down before age 18); dairy, fortified plant milk, yogurt. Vitamin D — works with calcium for bone and immune health; fortified foods, eggs, sunlight. Omega-3s — reduce inflammation and support recovery; salmon, walnuts.",
    },
    ...(gender === "F" ? [{
      id: "cycle", icon: Calendar, title: "Fueling around your cycle",
      body: "Estrogen and progesterone are the same hormones that build muscle, recover tissue, and build bone — your cycle isn't separate from your training. Missing periods for multiple months in a row is a real warning sign your body isn't getting enough energy, not something to shake off — it can affect bone health long-term. In the 1-2 weeks before your period (higher progesterone), soreness runs higher and carb access gets harder: aim for 25-30g protein right after training, keep carb-rich snacks on hand for energy and cravings, and lean on antioxidant-rich foods like berries and salmon for recovery.",
    }] : []),
    {
      id: "onthego", icon: Apple, title: "On-the-go fueling",
      body: "Under-fueling because you forgot food is worse than eating something packaged. Shelf-stable chocolate milk covers carbs, protein, and electrolytes in one grab. Trail mix, dried fruit, or a pre-made smoothie all travel well. Stuck at a gas station before a game? Beef jerky plus dried fruit gets you protein and something in the \"color\" category.",
    },
  ];

  return (
    <Card>
      <Eyebrow icon={BookOpen}>Fueling 101</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sections.map((s) => {
          const isOpen = open === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} style={{ borderRadius: 10, overflow: "hidden", background: C.surfaceAlt }}>
              <button onClick={() => setOpen(isOpen ? null : s.id)} className="f" style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%", background: "none", border: "none",
                padding: "10px 12px", cursor: "pointer", color: C.text, textAlign: "left",
              }}>
                <Icon size={15} color={C.accent} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{s.title}</span>
                {isOpen ? <ChevronUp size={14} color={C.steel} /> : <ChevronDown size={14} color={C.steel} />}
              </button>
              {isOpen && (
                <div style={{ padding: "0 12px 12px", fontSize: 12.5, color: C.textDim, lineHeight: 1.6 }}>
                  {s.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FuelTab({ bodyweight, mealSlots, onSetMealSlots, workoutTime, onSetWorkoutTime, record, targets, onSetTargets, mealHistory, onAddFood, onDeleteFood, onAddWater, onDeleteWater, gender, onSetGender, weightGoal, onSetWeightGoal, heightIn, onWeightConcern }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [nudge, setNudge] = useState(null);
  const interval = 20 * 60;
  const foods = record ? record.foods : [];
  const water = record ? record.water || [] : [];
  const slots = mealSlots && mealSlots.length ? mealSlots : DEFAULT_MEAL_SLOTS;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running && elapsed > 0 && elapsed % interval === 0) {
      setNudge("Water break — a few good pulls off the bottle before your next set.");
      setTimeout(() => setNudge(null), 20000);
    }
  }, [elapsed, running]);

  const setSlotTime = (id, time) => onSetMealSlots(slots.map((s) => (s.id === id ? { ...s, time } : s)));

  const mm = Math.floor(elapsed / 60), ss = String(elapsed % 60).padStart(2, "0");
  const perLb = bodyweight ? Math.round(bodyweight * 0.5) : null;
  const suggestedProtein = bodyweight ? Math.round(bodyweight * 0.9) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card glow={running}>
        <Eyebrow icon={Droplets}>Hydration</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span className="d" style={{ fontSize: 30, color: running ? C.accent : C.textDim, minWidth: 78 }}>{mm}:{ss}</span>
          <div style={{ flex: 1, minWidth: 180, fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
            Timer nudges you every 20 minutes while this screen is open.
          </div>
          <Button variant={running ? "subtle" : "primary"} onClick={() => { setRunning(!running); if (running) setElapsed(0); }}>
            {running ? "Stop" : "Start"}
          </Button>
        </div>
        {nudge && <div className="pop" style={{ marginTop: 12, fontSize: 13, color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 9, padding: "10px 12px" }}>{nudge}</div>}
        <WaterLog entries={water} targetOz={perLb} onAdd={onAddWater} onDelete={onDeleteWater} />
      </Card>

      <DailyNutritionSummary foods={foods} targets={targets} onSetTargets={onSetTargets} suggestedProtein={suggestedProtein}
        bodyweight={bodyweight} gender={gender} onSetGender={onSetGender} weightGoal={weightGoal} onSetWeightGoal={onSetWeightGoal} heightIn={heightIn} onWeightConcern={onWeightConcern} />

      <FuelEducation gender={gender} />

      <Card>
        <Eyebrow icon={Timer}>What time do you train?</Eyebrow>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={workoutTime || ""} onChange={(e) => onSetWorkoutTime(e.target.value || null)} className="f" style={{ ...inputCss, width: "auto" }}>
            <option value="">Not set</option>
            {TIME_OPTIONS.map((t) => <option key={t} value={t}>{fmtTimeOption(t)}</option>)}
          </select>
          <span style={{ fontSize: 11.5, color: C.steel }}>Drives the timing suggestions on your meals below.</span>
        </div>
      </Card>

      <div>
        <Eyebrow icon={Apple}>Your meals</Eyebrow>
        <MealSlotsManager slots={slots} onChange={onSetMealSlots} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {slots.map((slot) => {
            const guide = PDF_MEAL_TIMES[slot.id];
            const rec = mealRecommendation(slot.id, workoutTime);
            return (
              <div key={slot.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 15 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="d" style={{ fontSize: 15, color: C.accent, textTransform: "uppercase" }}>{slot.name}</span>
                    <select value={slot.time || ""} onChange={(e) => setSlotTime(slot.id, e.target.value || null)} className="f"
                      style={{ ...inputCss, width: "auto", fontSize: 12, padding: "5px 8px" }}>
                      <option value="">Set time</option>
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{fmtTimeOption(t)}</option>)}
                    </select>
                  </div>
                  {!DEFAULT_MEAL_SLOTS.find((d) => d.id === slot.id) && (
                    <button onClick={() => onSetMealSlots(slots.filter((s) => s.id !== slot.id))} className="f"
                      style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", display: "flex", padding: 3 }} aria-label={`Remove ${slot.name}`}>
                      <X size={13} />
                    </button>
                  )}
                </div>
                {guide && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: C.textDim, lineHeight: 1.5 }}>{guide}</p>}
                {rec && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: C.steel, lineHeight: 1.5, fontStyle: "italic" }}>Based on your training time: {rec}</p>}
                <MealFoodLog
                  foods={foods.filter((f) => f.mealId === slot.id)}
                  history={mealHistory ? mealHistory[slot.id] : null}
                  onAdd={(entry) => onAddFood(slot.id, entry)}
                  onDelete={onDeleteFood}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 11, color: C.steel, lineHeight: 1.6, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
        Nutrition values on common foods are typical estimates from a small built-in reference, not a live database — always fine to type your own numbers or skip them. This is self-tracking, not medical or dietary advice. If you have questions about supplements, allergies, or an existing condition, talk to your athletic trainer, school nurse, or doctor.
      </div>
    </div>
  );
}

/* ===============================================================
   FIX A LOGGED ENTRY
   Fat fingers happen. Athletes can correct or remove anything they
   logged; the entry keeps its original date so history stays honest.
================================================================ */
function LogEditor({ log, meta, onSave, onDelete, onClose }) {
  const [weight, setWeight] = useState(log.mode === "weight" ? String(log.weight ?? "") : "");
  const [reps, setReps] = useState(log.reps != null ? String(log.reps) : "");
  const [secs, setSecs] = useState(log.mode === "sprint" ? String(log.seconds ?? "") : "");
  const [ft, setFt] = useState(log.mode === "measure" ? String(Math.floor((log.value || 0) / 12)) : "");
  const [inch, setInch] = useState(log.mode === "measure" ? String(Math.round(((log.value || 0) % 12) * 10) / 10) : "");
  const [vel, setVel] = useState(log.vel != null ? String(log.vel) : "");
  const [rpe, setRpe] = useState(log.rpe || "");
  const [confirm, setConfirm] = useState(false);

  const save = () => {
    if (log.mode === "weight") {
      const w = parseFloat(weight), r = Number(reps);
      if (!Number.isFinite(w) || w <= 0 || !Number.isInteger(r) || r <= 0) return;
      onSave({ weight: w, reps: r, rpe: rpe ? parseInt(rpe, 10) : null, vel: parseFloat(vel) || null });
    } else if (log.mode === "reps") {
      const r = Number(reps);
      if (!Number.isInteger(r) || r <= 0) return;
      onSave({ reps: r, rpe: rpe ? parseInt(rpe, 10) : null });
    } else if (log.mode === "sprint") {
      const s = parseFloat(secs);
      if (!Number.isFinite(s) || s <= 0) return;
      onSave({ seconds: s });
    } else {
      const total = (parseFloat(ft) || 0) * 12 + (parseFloat(inch) || 0);
      if (!Number.isFinite(total) || total <= 0) return;
      onSave({ value: total });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ fontSize: 13, color: C.textDim }}>
        <span style={{ color: C.text, fontWeight: 700 }}>{log.exercise}</span> · logged {fmtDate(log.date)}
      </div>

      {log.mode === "weight" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 92 }}><Field label="Weight (lb)"><input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" className="f" style={inputCss} /></Field></div>
          <div style={{ flex: 1, minWidth: 78 }}><Field label="Reps"><input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" className="f" style={inputCss} /></Field></div>
          <div style={{ flex: 1, minWidth: 78 }}>
            <Field label="RPE / RIR">
              <select value={rpe} onChange={(e) => setRpe(e.target.value)} className="f" style={inputCss}>
                <option value="">—</option>
                {[10, 9, 8, 7, 6, 5].map((n) => <option key={n} value={n}>{n} · {RPE_TO_RIR[n]} RIR</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}
      {log.mode === "weight" && log.vel != null && (
        <Field label="Bar speed (m/s)"><input value={vel} onChange={(e) => setVel(e.target.value)} inputMode="decimal" className="f" style={inputCss} /></Field>
      )}
      {log.mode === "reps" && (
        <Field label="Reps"><input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" className="f" style={inputCss} /></Field>
      )}
      {log.mode === "sprint" && (
        <Field label="Time (seconds)" hint={log.dist ? `${log.dist} ${log.unit} — mph recalculates automatically` : undefined}>
          <input value={secs} onChange={(e) => setSecs(e.target.value)} inputMode="decimal" className="f" style={inputCss} />
        </Field>
      )}
      {log.mode === "measure" && (
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Feet"><input value={ft} onChange={(e) => setFt(e.target.value)} inputMode="numeric" className="f" style={inputCss} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Inches"><input value={inch} onChange={(e) => setInch(e.target.value)} inputMode="decimal" className="f" style={inputCss} /></Field></div>
        </div>
      )}

      {log.mode === "weight" && parseFloat(weight) > 0 && <PlateBar weight={parseFloat(weight)} showText />}
      {log.mode === "sprint" && parseFloat(secs) > 0 && log.dist && (
        <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
          {toMph(log.dist, log.unit, parseFloat(secs)).toFixed(1)} mph
        </div>
      )}
      {log.mode === "measure" && ((parseFloat(ft) || 0) * 12 + (parseFloat(inch) || 0)) > 0 && (
        <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
          {fmtHeight((parseFloat(ft) || 0) * 12 + (parseFloat(inch) || 0))}
        </div>
      )}

      <Button full icon={Check} onClick={save}>Save correction</Button>

      {!confirm ? (
        <Button full variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>Delete this entry</Button>
      ) : (
        <div style={{ background: C.surfaceAlt, border: "1px solid #4A2A33", borderRadius: 10, padding: 13 }}>
          <div style={{ fontSize: 13, marginBottom: 11, lineHeight: 1.5 }}>Delete this entry for good? Your teacher will no longer see it.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="danger" onClick={onDelete}>Yes, delete</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Keep it</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   WEEK STRIP — scrub the week, dots mark days with a session
================================================================ */
function WeekStrip({ selDate, onSelect, markedDates }) {
  const anchor = new Date(selDate + "T12:00:00");
  const weekStart = new Date(anchor);
  weekStart.setDate(anchor.getDate() - anchor.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return iso(d);
  });
  const monthLabel = anchor.toLocaleDateString(undefined, { month: "short", year: "2-digit" }).toUpperCase();

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => onSelect(addDays(selDate, -7))} className="f" aria-label="Previous week"
          style={{ background: "none", border: "none", color: C.steel, cursor: "pointer", padding: 4, display: "flex" }}>
          <ChevronLeft size={19} />
        </button>
        <span className="d" style={{ fontSize: 20, letterSpacing: 0.5 }}>{monthLabel.replace(" ", " \u2019")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {selDate !== today() && (
            <button onClick={() => onSelect(today())} className="b f" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5, padding: "5px 10px", borderRadius: 7,
              background: "transparent", border: `1px solid ${C.accentBorder}`, color: C.accent, cursor: "pointer",
            }}>TODAY</button>
          )}
          <button onClick={() => onSelect(addDays(selDate, 7))} className="f" aria-label="Next week"
            style={{ background: "none", border: "none", color: C.steel, cursor: "pointer", padding: 4, display: "flex" }}>
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {days.map((d) => {
          const dt = new Date(d + "T12:00:00");
          const isSel = d === selDate;
          const isToday = d === today();
          const marked = markedDates.includes(d);
          return (
            <button key={d} onClick={() => onSelect(d)} className="f" style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0 9px",
              background: isSel ? C.accentDim : "transparent", cursor: "pointer",
              border: `1px solid ${isSel ? C.accentBorder : "transparent"}`, borderRadius: 10,
            }}>
              <span style={{ fontSize: 9.5, letterSpacing: 0.6, color: C.steel, fontWeight: 700 }}>
                {dt.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3).toUpperCase()}
              </span>
              <span className="d" style={{ fontSize: 19, color: isSel ? C.accent : isToday ? C.text : C.textDim, lineHeight: 1 }}>
                {dt.getDate()}
              </span>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: marked ? (isSel ? C.accent : C.steel) : "transparent" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===============================================================
   STUDENT SHELL
================================================================ */
function StudentView({ student, db, onBack, onLog, onCheckIn, onComment, onAddExercise, onUpdateLog, onDeleteLog, onPatchStudent, onAddFuelFood, onDeleteFuelFood, onAddWater, onDeleteWater, onReportInjury, onNewPR, onFlagWeightConcern }) {
  const [tab, setTab] = useState("train");
  const [selDate, setSelDate] = useState(today());
  const [activeDate, setActiveDate] = useState(null);
  const [rest, setRest] = useState(null);
  const [restKey, setRestKey] = useState(0);
  const [prToast, setPrToast] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [hurt, setHurt] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const [draft, setDraft] = useState("");
  const [fixing, setFixing] = useState(null);

  const logs = db.logs[student.id] || [];
  const checkins = db.checkins[student.id] || [];
  const comments = db.comments[student.id] || [];
  const maxes = db.maxes[student.id] || {};
  const group = db.groups.find((g) => g.id === student.groupId);
  const klass = db.classes.find((c) => c.id === student.classId);
  const myGoals = (db.goals || []).filter((g) => {
    const kind = g.scope.slice(0, g.scope.indexOf(":"));
    const id = g.scope.slice(g.scope.indexOf(":") + 1);
    return kind === "class" ? id === student.classId : id === student.groupId;
  });
  const myAnnouncements = (db.announcements || []).filter((a) => {
    const kind = a.scope.slice(0, a.scope.indexOf(":"));
    const id = a.scope.slice(a.scope.indexOf(":") + 1);
    return kind === "class" ? id === student.classId : id === student.groupId;
  }).sort((a, b) => b.date.localeCompare(a.date));
  const todaysTest = (db.testingDays || []).find((t) => t.date === selDate);
  const todaysCheckIn = checkins.find((c) => c.date === today());
  const lastBw = [...checkins].reverse().find((c) => c.bodyweight);
  const isToday = selDate === today();
  const started = activeDate === selDate;

  const myFuelLogs = db.fuelLogs[student.id] || [];

  // Frequent foods per meal — Cronometer-style quick re-log, built from
  // this athlete's own history rather than any external food database.
  const mealHistory = useMemo(() => {
    const byMeal = {};
    for (const rec of myFuelLogs) {
      for (const f of rec.foods || []) {
        if (!f.mealId || !f.text) continue;
        byMeal[f.mealId] = byMeal[f.mealId] || {};
        const key = f.text.trim().toLowerCase();
        const existing = byMeal[f.mealId][key];
        if (!existing || f.time > existing.time) {
          byMeal[f.mealId][key] = { text: f.text.trim(), kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat, time: f.time, count: (existing ? existing.count : 0) + 1 };
        } else {
          existing.count += 1;
        }
      }
    }
    const out = {};
    for (const mealId of Object.keys(byMeal)) {
      out[mealId] = Object.values(byMeal[mealId]).sort((a, b) => b.count - a.count).slice(0, 4);
    }
    return out;
  }, [myFuelLogs]);

  const myScheduled = useMemo(
    () => (student.groupId ? db.schedule.filter((s) => s.groupIds.includes(student.groupId)) : []),
    [db.schedule, student.groupId]
  );
  const markedDates = useMemo(() => myScheduled.map((s) => s.date), [myScheduled]);

  const session = useMemo(() => {
    const entry = myScheduled.find((s) => s.date === selDate);
    if (!entry) return null;
    const program = db.programs.find((p) => p.id === entry.programId);
    return program ? normalizeProgram(program) : null;
  }, [myScheduled, db.programs, selDate]);

  const effectiveMax = useCallback((name) => {
    if (maxes[name]) return maxes[name].value;
    const rel = logs.filter((l) => l.exercise === name && l.mode === "weight");
    if (!rel.length) return null;
    return Math.max(...rel.map((l) => epley1RM(l.weight, l.reps)));
  }, [maxes, logs]);

  const prevBest = useCallback((name) => {
    const rel = logs.filter((l) => l.exercise === name);
    if (!rel.length) return null;
    const last = [...rel].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (last.mode === "weight") return `${last.weight} lb × ${last.reps}`;
    if (last.mode === "reps") return `${last.reps} reps`;
    if (last.mode === "sprint") return `${last.seconds.toFixed(2)}s`;
    return `${last.value} ${last.unit || ""}`;
  }, [logs]);

  const handleLog = (entry) => {
    const before = bestByExercise(logs, db.custom)[entry.exercise];
    onLog(student.id, { ...entry, date: selDate });
    const score = entry.mode === "weight" ? epley1RM(entry.weight, entry.reps)
      : entry.mode === "reps" ? entry.reps
      : entry.mode === "sprint" ? -entry.seconds
      : entry.value;
    if (!before || score > before.score) {
      setPrToast(entry.exercise);
      setTimeout(() => setPrToast(null), 3200);
      const display = entry.mode === "weight" ? `${entry.weight} lb × ${entry.reps}`
        : entry.mode === "reps" ? `${entry.reps} reps`
        : entry.mode === "sprint" ? `${entry.seconds.toFixed(2)}s`
        : `${entry.value} ${entry.unit || ""}`;
      onNewPR(student.id, { exercise: entry.exercise, display });
    }
  };

  const streak = computeStreak(logs);

  const dayLogs = logs.filter((l) => l.date === selDate);
  const dayComment = comments.find((c) => c.date === selDate);

  const NAV = [
    { id: "train", label: "Training", icon: Dumbbell },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "fuel", label: "Fuel", icon: Apple },
    { id: "me", label: "Me", icon: User },
  ];

  return (
    <div className="b" style={{ minHeight: "100vh", background: C.bg, color: C.text, paddingBottom: 84 }}>
      {/* header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <Avatar person={student} size={38} />
              <div style={{ minWidth: 0 }}>
                <div className="d" style={{ fontSize: 18, textTransform: "uppercase", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.name}</div>
                <div style={{ fontSize: 11, color: C.steel, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {[klass && klass.name, group && group.name].filter(Boolean).join(" · ") || "No class yet"}
                </div>
              </div>
            </div>
            {streak > 1 && <Chip tone="gold">{streak}-day streak</Chip>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "18px 16px 0" }}>
        {tab === "train" && (
          <div>
            <WeekStrip selDate={selDate} onSelect={(d) => { setSelDate(d); setRest(null); }} markedDates={markedDates} />

            {todaysTest && (
              <div style={{ marginBottom: 16, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 11, padding: "13px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <Award size={16} color={C.accent} />
                  <span className="d" style={{ fontSize: 15, color: C.accent, textTransform: "uppercase" }}>Testing Day</span>
                </div>
                <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>
                  Today&rsquo;s testing: <strong>{todaysTest.exercises.join(", ")}</strong>. Warm up properly, take your time between attempts, and log your best make — that becomes your new tested max.
                </p>
              </div>
            )}

            {myAnnouncements.length > 0 && (
              <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {myAnnouncements.map((a) => (
                  <div key={a.id} style={{ display: "flex", gap: 9, alignItems: "flex-start", background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, padding: "10px 13px" }}>
                    <MessageSquare size={15} color={C.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 13, color: C.text }}>{a.text}</div>
                      <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 2 }}>{fmtDate(a.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {myGoals.length > 0 && (
              <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {myGoals.map((g) => (
                  <div key={g.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Award size={13} color={C.accent} />
                      <span style={{ fontSize: 10.5, color: C.accent, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>Team goal</span>
                    </div>
                    <GoalProgressBar goal={g} db={db} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                <Eyebrow icon={TrendingUp}>How I'm moving</Eyebrow>
                <button onClick={() => setTab("progress")} className="b f" style={{ background: "none", border: "none", color: C.accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Details
                </button>
              </div>
              <ProgressPillars logs={logs} custom={db.custom} />
            </div>

            {isToday && (
              <div style={{ marginBottom: 14 }}>
                <CheckInCard existing={todaysCheckIn} onSave={(c) => onCheckIn(student.id, c)} />
              </div>
            )}

            <button onClick={() => setHurt({ exercise: null })} className="b f" style={{
              display: "flex", alignItems: "center", gap: 9, background: "none",
              border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px",
              color: C.textDim, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16, width: "100%",
            }}>
              <AlertTriangle size={16} color={C.warn} />
              Report an Injury
            </button>

            {session ? (
              <div>
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 11, background: C.surfaceAlt, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Helmet size={32} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="d" style={{ fontSize: 21, lineHeight: 1.15, textTransform: "uppercase" }}>{session.name}</div>
                    <div style={{ fontSize: 12, color: C.steel, marginTop: 3 }}>{fmtLong(selDate)}</div>
                  </div>
                </div>

                {session.notes && (
                  <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.55, marginTop: 0, marginBottom: 16 }}>{session.notes}</p>
                )}

                {!started ? (
                  <Button size="lg" full onClick={() => setActiveDate(selDate)} style={{ marginBottom: 12 }}>
                    {dayLogs.length ? "Keep going" : "Start session"}
                  </Button>
                ) : (
                  <Button size="lg" variant="subtle" full onClick={() => setActiveDate(null)} style={{ marginBottom: 12 }}>
                    Done for now
                  </Button>
                )}

                <button onClick={() => { setDraft(dayComment ? dayComment.text : ""); setShowComment(true); }} className="b f" style={{
                  background: "none", border: "none", color: C.accent, fontWeight: 700, fontSize: 14,
                  cursor: "pointer", padding: "4px 0", marginBottom: 18, display: "block",
                }}>
                  {dayComment ? "Edit your note to coach" : "Comment on session"}
                </button>

                {dayComment && (
                  <div style={{ fontSize: 12.5, color: C.textDim, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", marginBottom: 18, lineHeight: 1.55 }}>
                    {dayComment.text}
                  </div>
                )}

                {session.blocks.map((block, bi) => {
                  if (block.type === "note") {
                    return (
                      <div key={block.id} style={{
                        marginBottom: 22, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 12, padding: 14,
                      }}>
                        <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: 1.3, fontWeight: 700, marginBottom: 6 }}>
                          Coach&rsquo;s Note
                        </div>
                        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{block.text}</div>
                      </div>
                    );
                  }
                  const isCircuit = block.type === "circuit";
                  const pairing = !isCircuit && block.exercises.length > 1 ? PAIR_NAME[block.exercises.length] || "Giant set" : null;
                  return (
                    <div key={block.id} style={{ marginBottom: 22 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: started ? 9 : 2, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: C.steel, textTransform: "uppercase", letterSpacing: 1.3, fontWeight: 700 }}>
                          {block.category}
                        </span>
                        {pairing && <Chip tone="gold">{pairing}</Chip>}
                      </div>

                      {isCircuit ? (
                        <CircuitBlock block={block} letter={blockLetter(bi)} />
                      ) : started ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          {pairing && <PairRail label={pairing} />}
                          <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minWidth: 0 }}>
                            {block.exercises.map((e, ei) => (
                              <ExerciseBlock
                                key={e.id}
                                presc={{ ...e, tag: `${blockLetter(bi)}${ei + 1}` }}
                                meta={exMeta(e.exercise, db.custom)}
                                prevBest={prevBest(e.exercise)}
                                myMax={effectiveMax(e.exercise)}
                                cue={cueFor(e.exercise, db.custom)}
                                onLog={handleLog}
                                onRest={null}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          {pairing && <PairRail label={pairing} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {block.exercises.map((e, ei) => (
                              <PrescriptionRow key={e.id}
                                presc={{ ...e, tag: `${blockLetter(bi)}${ei + 1}` }}
                                meta={exMeta(e.exercise, db.custom)}
                                myMax={effectiveMax(e.exercise)}
                                last={ei === block.exercises.length - 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {started && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    {[60, 90, 120, 180].map((s) => (
                      <Button key={s} size="sm" variant="ghost" icon={Timer}
                        onClick={() => { setRest(s); setRestKey((k) => k + 1); }}>
                        {s < 120 ? `${s}s` : `${s / 60} min`}
                      </Button>
                    ))}
                  </div>
                )}

                <button onClick={() => setShowAdd(true)} className="b f" style={{
                  display: "flex", alignItems: "center", gap: 11, background: "none", border: "none",
                  color: C.text, fontWeight: 700, fontSize: 15, cursor: "pointer", padding: "6px 0 20px",
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, border: `1px solid ${C.accentBorder}`, color: C.accent, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={17} />
                  </span>
                  Add movement
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Empty icon={ClipboardList}>
                  {!student.groupId
                    ? "You're not in a training group yet. Ask your teacher to add you to one and your assigned sessions will show up here."
                    : isToday
                      ? "Nothing on the board for your group today. Log whatever you're working on."
                      : `Nothing scheduled for ${fmtDate(selDate)}.`}
                </Empty>
                <FreeLog exercises={db.exercises} custom={db.custom} onLog={handleLog} onAddExercise={onAddExercise} />
              </div>
            )}

            {dayLogs.length > 0 && (
              <Card style={{ marginBottom: 20 }}>
                <Eyebrow icon={Check}>Logged {isToday ? "today" : fmtDate(selDate)}</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayLogs.map((l) => (
                    <button key={l.id} onClick={() => setFixing(l)} className="b f" style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                      fontSize: 13, background: "none", border: "none", color: C.text,
                      padding: "7px 0", cursor: "pointer", textAlign: "left", width: "100%",
                    }}>
                      <span style={{ color: C.textDim, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.exercise}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontWeight: 700 }}>
                          {l.mode === "weight" && `${l.weight} × ${l.reps}`}
                          {l.mode === "reps" && `${l.reps} reps`}
                          {l.mode === "sprint" && `${l.seconds.toFixed(2)}s${l.dist ? ` · ${toMph(l.dist, l.unit, l.seconds).toFixed(1)} mph` : ""}`}
                          {l.mode === "measure" && fmtHeight(l.value)}
                        </span>
                        <Pencil size={13} color={C.steel} />
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.steel, marginTop: 9, lineHeight: 1.5 }}>
                  Tap any entry to fix a typo or remove it.
                </div>
              </Card>
            )}

            {rest != null && (
              <div style={{ position: "sticky", bottom: 78, zIndex: 32 }}>
                <RestTimer key={restKey} seconds={rest} onDone={() => setRest(null)} onDismiss={() => setRest(null)} />
              </div>
            )}
          </div>
        )}

        {tab === "progress" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
              <Stat label="Sets logged" value={logs.length} />
              <Stat label="Days trained" value={new Set(logs.map((l) => l.date)).size} />
              <Stat label="School years" value={new Set(logs.map((l) => schoolYearStart(l.date))).size} />
              {lastBw && <Stat label="Body weight" value={lastBw.bodyweight} unit="lb" />}
            </div>
            <div>
              <Eyebrow icon={Award}>Personal bests</Eyebrow>
              <PRBoard logs={logs} custom={db.custom} />
            </div>
            <Card>
              <Eyebrow icon={TrendingUp}>Where I stand</Eyebrow>
              <StandardsCard student={student} db={db} />
            </Card>
            <div>
              <Eyebrow icon={GraduationCap}>Year over year</Eyebrow>
              <YearOverYear logs={logs} custom={db.custom} gradYear={student.gradYear} />
            </div>
            <ExerciseHistory logs={logs} custom={db.custom} onPick={setFixing} />
          </div>
        )}

        {tab === "library" && <LibraryTab exercises={db.exercises} custom={db.custom} />}

        {tab === "fuel" && (
          <FuelTab
            bodyweight={lastBw ? lastBw.bodyweight : null}
            mealSlots={student.mealSlots}
            onSetMealSlots={(slots) => onPatchStudent(student.id, { mealSlots: slots })}
            workoutTime={student.workoutTime}
            onSetWorkoutTime={(t) => onPatchStudent(student.id, { workoutTime: t })}
            record={myFuelLogs.find((r) => r.date === today())}
            targets={student.nutritionTargets}
            onSetTargets={(t) => onPatchStudent(student.id, { nutritionTargets: t })}
            mealHistory={mealHistory}
            onAddFood={(mealId, entry) => onAddFuelFood(student.id, today(), mealId, entry)}
            onDeleteFood={(id) => onDeleteFuelFood(student.id, today(), id)}
            onAddWater={(oz) => onAddWater(student.id, today(), oz)}
            onDeleteWater={(id) => onDeleteWater(student.id, today(), id)}
            gender={student.gender}
            onSetGender={(g) => onPatchStudent(student.id, { gender: g })}
            weightGoal={student.weightGoal}
            onSetWeightGoal={(w) => onPatchStudent(student.id, { weightGoal: w })}
            heightIn={student.heightIn}
            onWeightConcern={(flag) => onFlagWeightConcern(student.id, flag)}
          />
        )}

        {tab === "me" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <Eyebrow icon={User}>My details</Eyebrow>
              <div style={{ marginBottom: 16 }}>
                <AvatarPicker person={student} size={84}
                  onSetPhoto={(photo) => onPatchStudent(student.id, { photo })}
                  onSetStyle={(avatarStyle) => onPatchStudent(student.id, { avatarStyle, photo: null })} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13 }}>
                {[
                  ["Name", student.name],
                  ["Class", klass ? klass.name : "Not assigned"],
                  ["Group", group ? group.name : "Not assigned"],
                  ["Graduating", student.gradYear || "Not set"],
                  ["Sign-in code", student.pin || "Ask your teacher if you need a reset"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textDim }}>{k}</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.textDim }}>Gender</span>
                  <select value={student.gender || ""} onChange={(e) => onPatchStudent(student.id, { gender: e.target.value || null })}
                    className="f" style={{ ...inputCss, width: "auto", fontSize: 12, padding: "5px 8px" }}>
                    <option value="">Prefer not to say</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingBottom: 8 }}>
                  <span style={{ color: C.textDim }}>Height</span>
                  <HeightPicker heightIn={student.heightIn} onChange={(h) => onPatchStudent(student.id, { heightIn: h })} />
                </div>
              </div>
            </Card>

            <Card>
              <Eyebrow icon={Award}>Badges</Eyebrow>
              <p style={{ fontSize: 12.5, color: C.textDim, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
                Earned automatically from what you've logged — no leaderboard spot required.
              </p>
              <BadgeWall student={student} db={db} onSetGoal={(g) => onPatchStudent(student.id, { trainingGoal: g })} />
            </Card>

            <Card>
              <Eyebrow icon={student.hideFromLeaderboard ? EyeOff : Eye}>Leaderboard visibility</Eyebrow>
              <p style={{ fontSize: 12.5, color: C.textDim, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
                Control whether your name shows up on the class leaderboards and the TV display. Your lifts are still logged and visible to your coach either way.
              </p>
              <Button variant={student.hideFromLeaderboard ? "subtle" : "primary"} icon={student.hideFromLeaderboard ? EyeOff : Eye}
                onClick={() => onPatchStudent(student.id, { hideFromLeaderboard: !student.hideFromLeaderboard })}>
                {student.hideFromLeaderboard ? "Hidden from leaderboards — tap to show yourself" : "Visible on leaderboards — tap to hide yourself"}
              </Button>
            </Card>

            <Card>
              <Eyebrow icon={Gauge}>My tested maxes</Eyebrow>
              {Object.keys(maxes).length === 0 ? (
                <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.55 }}>
                  Nothing tested yet. Until your teacher records a max, percentage-based sessions use the best estimate from the sets you&rsquo;ve logged.
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.entries(maxes).map(([k, v]) => <Chip key={k} tone="gold">{k}: {v.value} lb</Chip>)}
                </div>
              )}
            </Card>

            <Button variant="ghost" full icon={ChevronLeft} onClick={onBack}>Sign out</Button>
          </div>
        )}
      </div>

      {/* bottom nav */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
        background: C.surface, borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5,1fr)" }}>
          {NAV.map((n) => {
            const on = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className="b f" style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer",
                color: on ? C.accent : C.textDim,
                borderTop: `2px solid ${on ? C.accent : "transparent"}`, marginTop: -1,
              }}>
                <n.icon size={19} />
                <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add a movement" onClose={() => setShowAdd(false)}>
          <FreeLog exercises={db.exercises} custom={db.custom}
            onLog={(e) => { handleLog(e); setShowAdd(false); }}
            onAddExercise={onAddExercise} bare />
        </Modal>
      )}

      {hurt && (
        <Modal title="Report an Injury" onClose={() => setHurt(null)}>
          <p style={{ fontSize: 13, color: C.textDim, marginTop: -6, marginBottom: 16 }}>Where is the pain?</p>
          <InjuryFlow student={student} exercise={hurt.exercise}
            onSend={(r) => onReportInjury(student.id, r)}
            onClose={() => setHurt(null)} />
        </Modal>
      )}

      {fixing && (
        <Modal title="Fix an entry" onClose={() => setFixing(null)}>
          <LogEditor
            log={fixing}
            meta={exMeta(fixing.exercise, db.custom)}
            onSave={(patch) => { onUpdateLog(student.id, fixing.id, patch); setFixing(null); }}
            onDelete={() => { onDeleteLog(student.id, fixing.id); setFixing(null); }}
            onClose={() => setFixing(null)}
          />
        </Modal>
      )}

      {showComment && (
        <Modal title="Note to your coach" onClose={() => setShowComment(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label={`About ${fmtDate(selDate)}`} hint="Only your teacher sees this. Good place for a tweaked shoulder or a rack that was taken.">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} className="f"
                placeholder="How did it go?" style={{ ...inputCss, resize: "vertical" }} />
            </Field>
            <Button full icon={Check} disabled={!draft.trim()}
              onClick={() => { onComment(student.id, selDate, draft.trim()); setShowComment(false); }}>Send to coach</Button>
          </div>
        </Modal>
      )}

      {prToast && (
        <div className="pop" style={{
          position: "fixed", left: 16, right: 16, bottom: 92, zIndex: 50, maxWidth: 420, margin: "0 auto",
          background: C.accent, color: C.bg, borderRadius: 12, padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 14,
          boxShadow: "0 8px 30px rgba(0,0,0,.4)",
        }}>
          <Flame size={19} /> New best on {prToast}
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   COACH: SESSION EDITOR
   Used from the Sessions tab and straight from the Planner, so a
   session can be written on the day it's needed without being
   pre-built. Blocks are either structured sets or a freeform
   circuit, and both can sit in the same session.
================================================================ */
function MetricFields({ row, meta, patch }) {
  const cell = { ...inputCss, fontSize: 14 };
  switch (row.metric) {
    case "pct":
      return <Field label="% of max"><input value={row.pct} onChange={(e) => patch({ pct: parseInt(e.target.value, 10) || "" })} inputMode="numeric" placeholder="70" className="f" style={cell} /></Field>;
    case "weight":
      return <Field label="Weight (lb)"><input value={row.load} onChange={(e) => patch({ load: parseInt(e.target.value, 10) || "" })} inputMode="numeric" placeholder="135" className="f" style={cell} /></Field>;
    case "velocity":
      return (
        <>
          <Field label="Min m/s"><input value={row.velMin} onChange={(e) => patch({ velMin: e.target.value })} inputMode="decimal" placeholder="0.75" className="f" style={cell} /></Field>
          <Field label="Max m/s"><input value={row.velMax} onChange={(e) => patch({ velMax: e.target.value })} inputMode="decimal" placeholder="0.95" className="f" style={cell} /></Field>
        </>
      );
    case "distance":
      return (
        <>
          <Field label="Distance"><input value={row.dist} onChange={(e) => patch({ dist: parseFloat(e.target.value) || "" })} inputMode="decimal" placeholder="40" className="f" style={cell} /></Field>
          <Field label="Unit">
            <select value={row.distUnit} onChange={(e) => patch({ distUnit: e.target.value })} className="f" style={cell}>
              {DIST_UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </>
      );
    case "time":
      return <Field label="Time (sec)"><input value={row.timeSec} onChange={(e) => patch({ timeSec: parseFloat(e.target.value) || "" })} inputMode="decimal" placeholder="30" className="f" style={cell} /></Field>;
    case "height":
      return <Field label="Target (inches)" hint="Leave blank for an open attempt"><input value={row.heightIn} onChange={(e) => patch({ heightIn: parseFloat(e.target.value) || "" })} inputMode="decimal" placeholder="24" className="f" style={cell} /></Field>;
    default:
      return null;
  }
}

function SessionEditor({ db, value, onChange, onSave, onCancel, saveLabel = "Save session" }) {
  const editing = value;
  const set = (patch) => onChange({ ...editing, ...patch });

  const patchBlock = (bid, patch) =>
    set({ blocks: editing.blocks.map((b) => (b.id === bid ? { ...b, ...patch } : b)) });
  const addBlock = (type) =>
    set({ blocks: [...editing.blocks, type === "note"
      ? { id: uid(), type: "note", text: "", exercises: [] }
      : { id: uid(), type, category: type === "circuit" ? "Conditioning" : "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "", exercises: [] }] });
  const dropBlock = (bid) => set({ blocks: editing.blocks.filter((b) => b.id !== bid) });

  const addRow = (bid) => {
    const b = editing.blocks.find((x) => x.id === bid);
    const row = b.type === "circuit"
      ? { id: uid(), exercise: "Push-Up", reps: 10, note: "" }
      : blankPrescription("Back Squat", db.custom);
    patchBlock(bid, { exercises: [...b.exercises, row] });
  };
  const patchRow = (bid, rid, patch) => {
    const b = editing.blocks.find((x) => x.id === bid);
    patchBlock(bid, { exercises: b.exercises.map((e) => (e.id === rid ? { ...e, ...patch } : e)) });
  };
  const dropRow = (bid, rid) => {
    const b = editing.blocks.find((x) => x.id === bid);
    patchBlock(bid, { exercises: b.exercises.filter((e) => e.id !== rid) });
  };
  const movementCount = editing.blocks.reduce((n, b) => n + b.exercises.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Field label="Session name">
          <input value={editing.name} onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Spartan Speed and Strength (Adv)" className="f" style={inputCss} />
        </Field>
      </div>
      <div style={{ marginBottom: 18 }}>
        <Field label="Notes for the class">
          <textarea value={editing.notes} onChange={(e) => set({ notes: e.target.value })} rows={2}
            placeholder="Cues, warm-up, anything you'd write on the whiteboard" className="f" style={{ ...inputCss, resize: "vertical" }} />
        </Field>
      </div>

      {editing.blocks.map((block, bi) => {
        if (block.type === "note") {
          return (
            <div key={block.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, flexWrap: "wrap" }}>
                <TagBadge>{blockLetter(bi)}</TagBadge>
                <Chip tone="dim">Note</Chip>
                <span style={{ fontSize: 11.5, color: C.steel }}>Free text — posts and shows on the TV display</span>
                {editing.blocks.length > 1 && (
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => dropBlock(block.id)} aria-label="Remove note" style={{ marginLeft: "auto" }} />
                )}
              </div>
              <textarea value={block.text} onChange={(e) => patchBlock(block.id, { text: e.target.value })} rows={3}
                placeholder="Anything you want the team to see — an announcement, a focus cue, a reminder about Friday..."
                className="f" style={{ ...inputCss, resize: "vertical" }} />
            </div>
          );
        }
        const isCircuit = block.type === "circuit";
        const pairing = !isCircuit && block.exercises.length > 1 ? PAIR_NAME[block.exercises.length] || "Giant set" : null;
        return (
          <div key={block.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 13, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12, flexWrap: "wrap" }}>
              <TagBadge>{blockLetter(bi)}</TagBadge>
              <select value={block.category} onChange={(e) => patchBlock(block.id, { category: e.target.value })} className="f"
                style={{ ...inputCss, fontSize: 13, flex: 1, minWidth: 120 }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <Chip tone={isCircuit ? "good" : "dim"}>{isCircuit ? "Circuit" : pairing || "Sets"}</Chip>
              {editing.blocks.length > 1 && (
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => dropBlock(block.id)} aria-label="Remove block" />
              )}
            </div>

            {isCircuit && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(88px,1fr))", gap: 8, marginBottom: 12 }}>
                <Field label="Rounds"><input value={block.rounds} onChange={(e) => patchBlock(block.id, { rounds: parseInt(e.target.value, 10) || "" })} inputMode="numeric" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
                <Field label="Work (sec)"><input value={block.workSec} onChange={(e) => patchBlock(block.id, { workSec: parseInt(e.target.value, 10) || "" })} inputMode="numeric" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
                <Field label="Rest (sec)"><input value={block.restSec} onChange={(e) => patchBlock(block.id, { restSec: parseInt(e.target.value, 10) || "" })} inputMode="numeric" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {block.exercises.map((row, ei) => (
                <div key={row.id} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span className="d" style={{ fontSize: 13, color: C.accent, width: 26, flexShrink: 0 }}>
                      {isCircuit ? ei + 1 : `${blockLetter(bi)}${ei + 1}`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ExerciseCombobox value={row.exercise} exercises={db.exercises} custom={db.custom}
                        onChange={(name) => patchRow(block.id, row.id,
                          isCircuit ? { exercise: name } : { exercise: name, metric: defaultMetric(exMeta(name, db.custom).mode), dist: exMeta(name, db.custom).dist || "", distUnit: exMeta(name, db.custom).unit || "yd" })} />
                    </div>
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => dropRow(block.id, row.id)} aria-label="Remove movement" />
                  </div>

                  {isCircuit ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 8 }}>
                      <Field label="Reps (optional)"><input value={row.reps} onChange={(e) => patchRow(block.id, row.id, { reps: parseInt(e.target.value, 10) || "" })} inputMode="numeric" placeholder="or leave blank" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
                      <Field label="Cue"><input value={row.note} onChange={(e) => patchRow(block.id, row.id, { note: e.target.value })} placeholder="optional" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(92px,1fr))", gap: 8 }}>
                        <Field label="Sets"><input value={row.sets} onChange={(e) => patchRow(block.id, row.id, { sets: parseInt(e.target.value, 10) || "" })} inputMode="numeric" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
                        <Field label="Reps"><input value={row.reps} onChange={(e) => patchRow(block.id, row.id, { reps: parseInt(e.target.value, 10) || "" })} inputMode="numeric" placeholder="—" className="f" style={{ ...inputCss, fontSize: 14 }} /></Field>
                        <Field label="Reps to (optional)" hint="Range instead of fixed">
                          <input value={row.repsMax} onChange={(e) => patchRow(block.id, row.id, { repsMax: parseInt(e.target.value, 10) || "" })} inputMode="numeric" placeholder="e.g. 12" className="f" style={{ ...inputCss, fontSize: 14 }} />
                        </Field>
                        <Field label="Measure">
                          <select value={row.metric} onChange={(e) => patchRow(block.id, row.id, { metric: e.target.value })} className="f" style={{ ...inputCss, fontSize: 14 }}>
                            {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                          </select>
                        </Field>
                        <MetricFields row={row} meta={exMeta(row.exercise, db.custom)} patch={(p) => patchRow(block.id, row.id, p)} />
                        <Field label="RIR target (optional)" hint="Reps in reserve">
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <input value={row.rirMin} onChange={(e) => patchRow(block.id, row.id, { rirMin: e.target.value.replace(/[^0-9]/g, "") })} inputMode="numeric" placeholder="1" className="f" style={{ ...inputCss, fontSize: 14, minWidth: 0 }} />
                            <span style={{ color: C.steel, fontSize: 12, flexShrink: 0 }}>to</span>
                            <input value={row.rirMax} onChange={(e) => patchRow(block.id, row.id, { rirMax: e.target.value.replace(/[^0-9]/g, "") })} inputMode="numeric" placeholder="2" className="f" style={{ ...inputCss, fontSize: 14, minWidth: 0 }} />
                          </div>
                        </Field>
                        <Field label="Tempo (optional)" hint="e.g. 31X0">
                          <input value={row.tempo} onChange={(e) => patchRow(block.id, row.id, { tempo: e.target.value })} placeholder="ecc-pause-con-pause" className="f" style={{ ...inputCss, fontSize: 14 }} />
                        </Field>
                        <Field label="Rest (sec, optional)" hint="Overrides the block's rest">
                          <input value={row.restSec} onChange={(e) => patchRow(block.id, row.id, { restSec: parseInt(e.target.value, 10) || "" })} inputMode="numeric" placeholder="—" className="f" style={{ ...inputCss, fontSize: 14 }} />
                        </Field>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <input value={row.note} onChange={(e) => patchRow(block.id, row.id, { note: e.target.value })}
                          placeholder="Coaching point for this movement" className="f" style={{ ...inputCss, fontSize: 13 }} />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: block.exercises.length ? 10 : 0 }}>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => addRow(block.id)}>
                {isCircuit
                  ? "Add station"
                  : block.exercises.length
                    ? `Pair another movement (${blockLetter(bi)}${block.exercises.length + 1})`
                    : "Add movement"}
              </Button>
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 4 }}>
        <Button variant="ghost" icon={Layers} onClick={() => addBlock("sets")}>Add sets block</Button>
        <Button variant="ghost" icon={Repeat} onClick={() => addBlock("circuit")}>Add circuit</Button>
        <Button variant="ghost" icon={MessageSquare} onClick={() => addBlock("note")}>Add a note</Button>
      </div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 12 }}>
        <Button icon={Check} disabled={!editing.name.trim() || !movementCount} onClick={onSave}>{saveLabel}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      <p style={{ fontSize: 12, color: C.steel, marginTop: 16, lineHeight: 1.6 }}>
        Movements in one sets block are paired: two is a superset, three a tri-set, and each keeps its own sets, reps, target and coaching point. Start a new block when the work changes.
        The <em>measure</em> column is per movement, so one session can hold a percentage-based squat, a 40-yard sprint in seconds, a jump in inches, and a velocity range for the bar.
        Reps and RIR target are both optional ranges: fill in only <em>Reps</em> for a fixed target like the old 3×10, or add <em>Reps to</em> and an RIR target for something like 3×8-12 @ 1-2 RIR — the athlete works within the range and logs how many reps they actually had left, using the same effort picker as RPE (RPE 10 is 0 RIR, RPE 9 is about 1, and so on).
        <em>Tempo</em> uses the standard four-number notation (eccentric-pause-concentric-pause, e.g. 31X0), and a per-movement <em>Rest</em> overrides the block's rest just for that exercise — leave either blank to use the block default.
      </p>
    </div>
  );
}

function blankSession() {
  return {
    id: uid(), name: "", notes: "",
    blocks: [{ id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "", exercises: [] }],
  };
}

// Premade sessions built from the coach's own TrainHeroic warm-ups and
// programs — available to import from the Sessions screen, never auto-added.
const STARTER_SESSIONS = [
  {
    id: "starter-cf15-crossfit-benchmarks-—-max-strength-(group-1)",
    name: "CrossFit Benchmarks — Max Strength (Group 1)",
    notes: "From CrossFit's own '15 Benchmarks' athlete-profile framework — Group 1: tests for maximal or near-maximal strength and power. Work up to a true 1-rep max on each, resting as needed between attempts. Log each as a tested max afterward.",
    blocks: [
    {
      id: "w1", type: "sets", category: "Strength/Power", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Back Squat", sets: 1, reps: 1, note: "Work up to a true 1-rep max" },
        { id: "w1-1", exercise: "Deadlift", sets: 1, reps: 1, note: "Work up to a true 1-rep max" },
        { id: "w1-2", exercise: "Clean & Jerk", sets: 1, reps: 1, note: "Work up to a true 1-rep max" },
        { id: "w1-3", exercise: "Snatch", sets: 1, reps: 1, note: "Work up to a true 1-rep max" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-l1-benchmark",
    name: "L1 Benchmark",
    notes: "CrossFit's '15 Benchmarks' — Group 2 (glycolytic strength/stamina/endurance). 3 rounds for time. Rx: 65/95 lb.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 3, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Thruster", reps: 15, note: "65/95 lb" },
        { id: "w1-1", exercise: "Burpees", reps: 12, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-fight-gone-bad",
    name: "Fight Gone Bad",
    notes: "CrossFit's '15 Benchmarks' — Group 3 (aerobic pathway). 3 rounds, 1 minute per station, move straight to the next station, 1 minute rest between rounds. Score = total reps across all 3 rounds. Rx: 20/14 lb ball, 75/55 lb barbell, 20-in box.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 3, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Wall Ball", reps: 0, note: "1 min, 20/14 lb" },
        { id: "w1-1", exercise: "Sumo Deadlift High Pull", reps: 0, note: "1 min, 75/55 lb" },
        { id: "w1-2", exercise: "Box Jump", reps: 0, note: "1 min, 20 in" },
        { id: "w1-3", exercise: "Push Press", reps: 0, note: "1 min, 75/55 lb" },
        { id: "w1-4", exercise: "Row", reps: 0, note: "1 min, for calories" },
        { id: "w1-5", exercise: "Row", reps: 0, note: "1 min REST — repeat sequence 2 more times" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-filthy-fifty",
    name: "Filthy Fifty",
    notes: "CrossFit's '15 Benchmarks' — Group 3 (aerobic pathway). 50 reps of each movement, for time, in order. Rx: 24/20-in box, 35/26 lb kettlebell, 45/35 lb barbell, 20/14 lb ball.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Box Jump", reps: 50, note: "24/20 in" },
        { id: "w1-1", exercise: "Jumping Pull-Up", reps: 50, note: "" },
        { id: "w1-2", exercise: "Kettlebell Swing", reps: 50, note: "35/26 lb" },
        { id: "w1-3", exercise: "Walking Lunge", reps: 50, note: "" },
        { id: "w1-4", exercise: "Knees to Elbows", reps: 50, note: "" },
        { id: "w1-5", exercise: "Push Press", reps: 50, note: "45/35 lb" },
        { id: "w1-6", exercise: "Back Extensions", reps: 50, note: "" },
        { id: "w1-7", exercise: "Wall Ball", reps: 50, note: "20/14 lb" },
        { id: "w1-8", exercise: "Burpees", reps: 50, note: "" },
        { id: "w1-9", exercise: "Double Under", reps: 50, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-chad-1000x",
    name: "Chad 1000X",
    notes: "CrossFit's '15 Benchmarks' — Group 3 (aerobic pathway). Traditionally programmed every Nov. 11 in honor of Medal of Honor recipient Charles \"Chad\" Read. For time. Rx: 45/35 lb ruck or weight vest, 20-in box.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Weighted Box Step-Up", reps: 1000, note: "45/35 lb ruck or vest, 20-in box" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-run-5k",
    name: "Run 5K",
    notes: "CrossFit's '15 Benchmarks' — Group 3 (aerobic pathway). For time.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "5 kilometers" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-max-pull-ups",
    name: "Max Pull-Ups",
    notes: "CrossFit's '15 Benchmarks' — Group 4 (phosphocreatine/glycolytic, strength & muscular endurance). Max unbroken (or total) reps.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Pull-Up", reps: 0, note: "Max reps" }
      ],
    }
    ],
  },
  {
    id: "starter-cf15-sprint-400m",
    name: "Sprint 400m",
    notes: "CrossFit's '15 Benchmarks' — Group 4 (phosphocreatine/glycolytic, relative strength & muscular endurance). For time, all-out.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "400 meters, all-out" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-angie",
    name: "Angie",
    notes: "Girls WOD — For time. First posted Sept. 2003, one of the original six benchmarks.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Pull-Up", reps: 100, note: "" },
        { id: "w1-1", exercise: "Push-Up", reps: 100, note: "" },
        { id: "w1-2", exercise: "Sit-up", reps: 100, note: "" },
        { id: "w1-3", exercise: "Air Squat", reps: 100, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-barbara",
    name: "Barbara",
    notes: "Girls WOD — 5 rounds for time, rest 3 min between rounds. One of the original six benchmarks.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Pull-Up", reps: 20, note: "" },
        { id: "w1-1", exercise: "Push-Up", reps: 30, note: "" },
        { id: "w1-2", exercise: "Sit-up", reps: 40, note: "" },
        { id: "w1-3", exercise: "Air Squat", reps: 50, note: "Rest 3 min after each round" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-chelsea",
    name: "Chelsea",
    notes: "Girls WOD — EMOM for 30 minutes. One of the original six benchmarks.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 30, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Pull-Up", reps: 5, note: "" },
        { id: "w1-1", exercise: "Push-Up", reps: 10, note: "" },
        { id: "w1-2", exercise: "Air Squat", reps: 15, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-diane",
    name: "Diane",
    notes: "Girls WOD — 21-15-9 reps for time. Rx: 225/155 lb deadlift.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Deadlift", reps: 0, note: "21-15-9, 225/155 lb" },
        { id: "w1-1", exercise: "HSPU", reps: 0, note: "21-15-9" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-elizabeth",
    name: "Elizabeth",
    notes: "Girls WOD — 21-15-9 reps for time. Rx: 135/95 lb squat clean.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Squat Clean", reps: 0, note: "21-15-9, 135/95 lb" },
        { id: "w1-1", exercise: "Ring Dip", reps: 0, note: "21-15-9" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-fran",
    name: "Fran",
    notes: "Girls WOD — 21-15-9 reps for time. Rx: 95/65 lb thruster. The quintessential CrossFit benchmark.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Thruster", reps: 0, note: "21-15-9 THRUSTERS, 95/65 lb — use Thruster if in your library, logged here as closest match" },
        { id: "w1-1", exercise: "Pull-Up", reps: 0, note: "21-15-9" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-grace",
    name: "Grace",
    notes: "Girls WOD — 30 reps for time. Rx: 135/95 lb.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Clean & Jerk", reps: 30, note: "135/95 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-helen",
    name: "Helen",
    notes: "Girls WOD — 3 rounds for time. Rx: 53/35 lb kettlebell.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 3, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "400m" },
        { id: "w1-1", exercise: "Kettlebell Swing", reps: 21, note: "53/35 lb" },
        { id: "w1-2", exercise: "Pull-Up", reps: 12, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-isabel",
    name: "Isabel",
    notes: "Girls WOD — 30 reps for time. Rx: 135/95 lb.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Snatch", reps: 30, note: "135/95 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-jackie",
    name: "Jackie",
    notes: "Girls WOD — For time. Rx: 45/35 lb thruster.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Row", reps: 0, note: "1000m" },
        { id: "w1-1", exercise: "Thruster", reps: 50, note: "Thrusters, 45/35 lb" },
        { id: "w1-2", exercise: "Pull-Up", reps: 30, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-karen",
    name: "Karen",
    notes: "Girls WOD — For time. Rx: 20/14 lb ball.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Wall Ball", reps: 150, note: "20/14 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-linda",
    name: "Linda",
    notes: "Girls WOD — a.k.a. '3 Bars of Death.' 10-9-8-7-6-5-4-3-2-1 reps for time.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Deadlift", reps: 0, note: "10-9-8-...-1, 1.5x bodyweight" },
        { id: "w1-1", exercise: "Bench Press", reps: 0, note: "10-9-8-...-1, 1x bodyweight" },
        { id: "w1-2", exercise: "Squat Clean", reps: 0, note: "10-9-8-...-1, 0.75x bodyweight" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-mary",
    name: "Mary",
    notes: "Girls WOD — AMRAP 20 minutes.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "HSPU", reps: 5, note: "" },
        { id: "w1-1", exercise: "Pistol Squat", reps: 10, note: "" },
        { id: "w1-2", exercise: "Pull-Up", reps: 15, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-nancy",
    name: "Nancy",
    notes: "Girls WOD — 5 rounds for time. Rx: 95/65 lb.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "400m" },
        { id: "w1-1", exercise: "Overhead Squat", reps: 15, note: "95/65 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-annie",
    name: "Annie",
    notes: "Girls WOD — 50-40-30-20-10 reps for time.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Double Under", reps: 0, note: "50-40-30-20-10" },
        { id: "w1-1", exercise: "Sit-up", reps: 0, note: "50-40-30-20-10" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-cindy",
    name: "Cindy",
    notes: "Girls WOD — AMRAP 20 minutes. First posted Dec. 2004.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Pull-Up", reps: 5, note: "" },
        { id: "w1-1", exercise: "Push-Up", reps: 10, note: "" },
        { id: "w1-2", exercise: "Air Squat", reps: 15, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-kelly",
    name: "Kelly",
    notes: "Girls WOD — 5 rounds for time. Rx: 24/20-in box, 20/14 lb ball.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "400m" },
        { id: "w1-1", exercise: "Box Jump", reps: 30, note: "24/20 in" },
        { id: "w1-2", exercise: "Wall Ball", reps: 30, note: "20/14 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-lynne",
    name: "Lynne",
    notes: "Girls WOD — 5 rounds, NOT for time — max reps each round.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Bench Press", reps: 0, note: "Max reps at bodyweight" },
        { id: "w1-1", exercise: "Pull-Up", reps: 0, note: "Max reps" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-nicole",
    name: "Nicole",
    notes: "Girls WOD — AMRAP 20 minutes.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "400m" },
        { id: "w1-1", exercise: "Pull-Up", reps: 0, note: "Max reps" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-amanda",
    name: "Amanda",
    notes: "Girls WOD — 9-7-5 reps for time. Rx: 135/95 lb.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Muscle-Up", reps: 0, note: "9-7-5" },
        { id: "w1-1", exercise: "Snatch", reps: 0, note: "9-7-5, 135/95 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-jt",
    name: "JT",
    notes: "Hero WOD — 21-15-9 reps for time. First posted July 6, 2005.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "HSPU", reps: 0, note: "21-15-9" },
        { id: "w1-1", exercise: "Ring Dip", reps: 0, note: "21-15-9" },
        { id: "w1-2", exercise: "Push-Up", reps: 0, note: "21-15-9" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-michael",
    name: "Michael",
    notes: "Hero WOD — 3 rounds for time. First posted July 15, 2005.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 3, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "800m" },
        { id: "w1-1", exercise: "Back Extensions", reps: 50, note: "" },
        { id: "w1-2", exercise: "Sit-up", reps: 50, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-murph",
    name: "Murph",
    notes: "Hero WOD — For time, honoring Lt. Michael Murphy. Partition the middle three as needed. Wear a 20/14 lb vest if you have one. First posted Aug. 18, 2005.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "1 mile" },
        { id: "w1-1", exercise: "Pull-Up", reps: 100, note: "" },
        { id: "w1-2", exercise: "Push-Up", reps: 200, note: "" },
        { id: "w1-3", exercise: "Air Squat", reps: 300, note: "" },
        { id: "w1-4", exercise: "Run", reps: 0, note: "1 mile" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-daniel",
    name: "Daniel",
    notes: "Hero WOD — For time. Rx: 95/65 lb. First posted June 15, 2006.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Pull-Up", reps: 50, note: "" },
        { id: "w1-1", exercise: "Run", reps: 0, note: "400m" },
        { id: "w1-2", exercise: "Thruster", reps: 21, note: "Thrusters, 95/65 lb" },
        { id: "w1-3", exercise: "Run", reps: 0, note: "800m" },
        { id: "w1-4", exercise: "Thruster", reps: 21, note: "Thrusters, 95/65 lb" },
        { id: "w1-5", exercise: "Run", reps: 0, note: "400m" },
        { id: "w1-6", exercise: "Pull-Up", reps: 50, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-josh",
    name: "Josh",
    notes: "Hero WOD — For time. Rx: 95/65 lb. First posted Feb. 26, 2007.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Overhead Squat", reps: 21, note: "95/65 lb" },
        { id: "w1-1", exercise: "Pull-Up", reps: 42, note: "" },
        { id: "w1-2", exercise: "Overhead Squat", reps: 15, note: "" },
        { id: "w1-3", exercise: "Pull-Up", reps: 30, note: "" },
        { id: "w1-4", exercise: "Overhead Squat", reps: 9, note: "" },
        { id: "w1-5", exercise: "Pull-Up", reps: 18, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-jason",
    name: "Jason",
    notes: "Hero WOD — For time. First posted Aug. 2, 2007.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Air Squat", reps: 100, note: "" },
        { id: "w1-1", exercise: "Muscle-Up", reps: 5, note: "" },
        { id: "w1-2", exercise: "Air Squat", reps: 75, note: "" },
        { id: "w1-3", exercise: "Muscle-Up", reps: 10, note: "" },
        { id: "w1-4", exercise: "Air Squat", reps: 50, note: "" },
        { id: "w1-5", exercise: "Muscle-Up", reps: 15, note: "" },
        { id: "w1-6", exercise: "Air Squat", reps: 25, note: "" },
        { id: "w1-7", exercise: "Muscle-Up", reps: 20, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-badger",
    name: "Badger",
    notes: "Hero WOD — 3 rounds for time. Rx: 95/65 lb. First posted Dec. 19, 2007.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 3, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Squat Clean", reps: 30, note: "95/65 lb" },
        { id: "w1-1", exercise: "Pull-Up", reps: 30, note: "" },
        { id: "w1-2", exercise: "Run", reps: 0, note: "800m" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-nate",
    name: "Nate",
    notes: "Hero WOD — AMRAP 20 minutes. Rx: 70/53 lb kettlebell. First posted Feb. 12, 2008.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Muscle-Up", reps: 2, note: "" },
        { id: "w1-1", exercise: "HSPU", reps: 4, note: "" },
        { id: "w1-2", exercise: "Kettlebell Swing", reps: 8, note: "70/53 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-randy",
    name: "Randy",
    notes: "Hero WOD — For time. Rx: 75/55 lb. First posted Feb. 13, 2008.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Power Snatch", reps: 75, note: "75/55 lb" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-tommy-v",
    name: "Tommy V",
    notes: "Hero WOD — For time. Rx: 115/75 lb, 15-ft rope. First posted March 12, 2008.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Thruster", reps: 21, note: "Thrusters, 115/75 lb" },
        { id: "w1-1", exercise: "Rope Climb", reps: 12, note: "15 ft" },
        { id: "w1-2", exercise: "Thruster", reps: 15, note: "Thrusters" },
        { id: "w1-3", exercise: "Rope Climb", reps: 9, note: "" },
        { id: "w1-4", exercise: "Thruster", reps: 9, note: "Thrusters" },
        { id: "w1-5", exercise: "Rope Climb", reps: 6, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-griff",
    name: "Griff",
    notes: "Hero WOD — For time. First posted June 9, 2008.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "800m" },
        { id: "w1-1", exercise: "Run", reps: 0, note: "400m backwards" },
        { id: "w1-2", exercise: "Run", reps: 0, note: "800m" },
        { id: "w1-3", exercise: "Run", reps: 0, note: "400m backwards" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-dt",
    name: "DT",
    notes: "Hero WOD — 5 rounds for time. Rx: 155/105 lb. First posted April 14, 2009.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Deadlift", reps: 12, note: "155/105 lb" },
        { id: "w1-1", exercise: "Hang Power Clean", reps: 9, note: "" },
        { id: "w1-2", exercise: "Push Jerk", reps: 6, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-hansen",
    name: "Hansen",
    notes: "Hero WOD — 5 rounds for time. Rx: 70/53 lb kettlebell. First posted May 2, 2009.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Kettlebell Swing", reps: 30, note: "70/53 lb" },
        { id: "w1-1", exercise: "Burpees", reps: 30, note: "" },
        { id: "w1-2", exercise: "GHD Sit-up", reps: 30, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-the-seven",
    name: "The Seven",
    notes: "Hero WOD — 7 rounds for time. Rx: 135 lb thruster, 245 lb deadlift, 70/53 lb kettlebell. First posted May 30, 2010.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 7, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "HSPU", reps: 7, note: "" },
        { id: "w1-1", exercise: "Thruster", reps: 7, note: "Thrusters, 135/95 lb" },
        { id: "w1-2", exercise: "Hanging Knee Raise", reps: 7, note: "Knees-to-elbows" },
        { id: "w1-3", exercise: "Deadlift", reps: 7, note: "245/165 lb" },
        { id: "w1-4", exercise: "Burpees", reps: 7, note: "" },
        { id: "w1-5", exercise: "Kettlebell Swing", reps: 7, note: "70/53 lb" },
        { id: "w1-6", exercise: "Pull-Up", reps: 7, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-jerry",
    name: "Jerry",
    notes: "Hero WOD — For time. First posted May 9, 2010.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Run", reps: 0, note: "1 mile" },
        { id: "w1-1", exercise: "Row", reps: 0, note: "2000m" },
        { id: "w1-2", exercise: "Run", reps: 0, note: "1 mile" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-danny",
    name: "Danny",
    notes: "Hero WOD — AMRAP 20 minutes. Rx: 115/75 lb, 24/20-in box. First posted April 16, 2009.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Box Jump", reps: 30, note: "24/20 in" },
        { id: "w1-1", exercise: "Push Press", reps: 20, note: "115/75 lb" },
        { id: "w1-2", exercise: "Pull-Up", reps: 30, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-erin",
    name: "Erin",
    notes: "Hero WOD — 5 rounds for time. Rx: 40/30 lb dumbbells. First posted Oct. 9, 2008.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "DB Snatch", reps: 15, note: "40/30 lb, split clean" },
        { id: "w1-1", exercise: "Pull-Up", reps: 21, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-ryan",
    name: "Ryan",
    notes: "Hero WOD — 5 rounds for time. First posted Oct. 8, 2008.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 5, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Muscle-Up", reps: 7, note: "" },
        { id: "w1-1", exercise: "Burpees", reps: 21, note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-arnie",
    name: "Arnie",
    notes: "Hero WOD — For time, single kettlebell. Rx: 70/53 lb. First posted May 29, 2010.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Turkish Get-Up", reps: 21, note: "Right arm, 70/53 lb" },
        { id: "w1-1", exercise: "Kettlebell Swing", reps: 50, note: "" },
        { id: "w1-2", exercise: "Overhead Squat", reps: 21, note: "Left arm" },
        { id: "w1-3", exercise: "Kettlebell Swing", reps: 50, note: "" },
        { id: "w1-4", exercise: "Overhead Squat", reps: 21, note: "Right arm" },
        { id: "w1-5", exercise: "Kettlebell Swing", reps: 50, note: "" },
        { id: "w1-6", exercise: "Turkish Get-Up", reps: 21, note: "Left arm" }
      ],
    }
    ],
  },
  {
    id: "starter-wod-bull",
    name: "Bull",
    notes: "Hero WOD — 2 rounds for time. Rx: 135/95 lb. First posted Dec. 26, 2010.",
    blocks: [
    {
      id: "w1", type: "circuit", category: "Bodyweight", rounds: 2, workSec: 0, restSec: 0, note: "",
      exercises: [
        { id: "w1-0", exercise: "Double Under", reps: 200, note: "" },
        { id: "w1-1", exercise: "Overhead Squat", reps: 50, note: "135/95 lb" },
        { id: "w1-2", exercise: "Pull-Up", reps: 50, note: "" },
        { id: "w1-3", exercise: "Run", reps: 0, note: "1 mile" }
      ],
    }
    ],
  },
  {
    id: "starter-satam-mobility",
    name: "Saturday AM Mobility",
    notes: "General mobility flow.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "b1-0", exercise: "Forward Fold to Partial Extension", reps: 3, note: "" },
        { id: "b1-1", exercise: "Side Bends", reps: 3, note: "each side" },
        { id: "b1-2", exercise: "Ankle Flexion", reps: "", note: "20 sec" },
        { id: "b1-3", exercise: "Plantar Flexion", reps: "", note: "20 sec" },
        { id: "b1-4", exercise: "Cat Cows", reps: 5, note: "each" },
        { id: "b1-5", exercise: "Kneeling Pec Stretch", reps: 5, note: "each" },
        { id: "b1-6", exercise: "Open Books", reps: 5, note: "each" },
        { id: "b1-7", exercise: "Neck Nods", reps: 3, note: "each" },
        { id: "b1-8", exercise: "Rock n' Rolls", reps: 5, note: "each" },
        { id: "b1-9", exercise: "Quad Pull to Squat", reps: 5, note: "each" },
        { id: "b1-10", exercise: "Squat to Stand", reps: 5, note: "each" },
        { id: "b1-11", exercise: "Arm Circles", reps: 10, note: "each direction" }
      ],
    }
    ],
  },
  {
    id: "starter-soft-tissue",
    name: "Soft Tissue Work",
    notes: "Pre-lift soft tissue prep — foam roller/ball/barbell smash work.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Lower Body",
      exercises: [
        { id: "b1-0", exercise: "Adductor Smash w/ Barbell", reps: "", note: "1 min each side, in squat rack" },
        { id: "b1-1", exercise: "Quad Smash w/ KB or BB", reps: "", note: "1 min each side" },
        { id: "b1-2", exercise: "Hamstring Smash w/ Ball", reps: "", note: "1 min each side, tennis or soft ball" },
        { id: "b1-3", exercise: "Glute Smash w/ Ball", reps: "", note: "1 min each side, tennis or soft ball" }
      ],
    },
    {
      id: "b2",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Upper Body",
      exercises: [
        { id: "b2-0", exercise: "KB Pec Smash", reps: "", note: "1 min each side" },
        { id: "b2-1", exercise: "Softball Lat Smash", reps: "", note: "1 min each side" },
        { id: "b2-2", exercise: "Softball Upper Back Smash", reps: "", note: "1 min each side" },
        { id: "b2-3", exercise: "Softball Trap/Neck Smash", reps: "", note: "1 min each side" }
      ],
    }
    ],
  },
  {
    id: "starter-warmup-circuit",
    name: "Warm Up Circuit",
    notes: "General field warm-up — stretch into dynamics into plyos.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "b1-0", exercise: "Quad Wall Stretch", reps: "", note: "" },
        { id: "b1-1", exercise: "Pancake Stretch", reps: "", note: "" },
        { id: "b1-2", exercise: "Pigeon Pose", reps: "", note: "" },
        { id: "b1-3", exercise: "Power Marches", reps: "", note: "10 yards" },
        { id: "b1-4", exercise: "Chops", reps: "", note: "10 yards" },
        { id: "b1-5", exercise: "3 Count Chops", reps: "", note: "10 yards" },
        { id: "b1-6", exercise: "A Skip", reps: "", note: "10 yards" },
        { id: "b1-7", exercise: "Crossover Run", reps: "", note: "15 yards" },
        { id: "b1-8", exercise: "Backwards Run", reps: "", note: "15 yards" },
        { id: "b1-9", exercise: "Prime Times", reps: "", note: "10 yards" },
        { id: "b1-10", exercise: "Tempo High Knees", reps: "", note: "10 yards" },
        { id: "b1-11", exercise: "Pogo Hop to Box Jump", reps: "", note: "10 yards" },
        { id: "b1-12", exercise: "Pogo Hop to Split Stance", reps: "", note: "forward/backward/right/left" },
        { id: "b1-13", exercise: "Single Leg Diagonal Jump to Stick", reps: "", note: "" },
        { id: "b1-14", exercise: "Single Leg Diagonal Jump to Double Bounce", reps: "", note: "" },
        { id: "b1-15", exercise: "Single Leg Broad Jump to Double Leg Landing", reps: "", note: "right/left" },
        { id: "b1-16", exercise: "Single Leg Bounds", reps: "", note: "right/left" },
        { id: "b1-17", exercise: "Triple Broad Jump Competition", reps: "", note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-summer-mon",
    name: "Summer Warm Up — Monday",
    notes: "Hips/mobility into pogos into dynamics into sprint work.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Hips / Glutes / Mobility",
      exercises: [
        { id: "b1-0", exercise: "90-90 Hip Switch", reps: 10, note: "each way, with hands support" },
        { id: "b1-1", exercise: "90-90 Hip Extensions", reps: 10, note: "each leg" },
        { id: "b1-2", exercise: "L-Sit Single Leg Lifts", reps: 10, note: "each leg, hands on ground in front of hips" },
        { id: "b1-3", exercise: "Hip Hurdles", reps: 10, note: "each leg" }
      ],
    },
    {
      id: "b2",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Pogos --> Jumps",
      exercises: [
        { id: "b2-0", exercise: "Pogo Hops", reps: "", note: "10 yards" },
        { id: "b2-1", exercise: "Backwards Pogos", reps: "", note: "10 yards" },
        { id: "b2-2", exercise: "Lateral Pogos", reps: "", note: "10 yards each way" },
        { id: "b2-3", exercise: "Single Leg Low Pogos", reps: "", note: "10 yards each leg" },
        { id: "b2-4", exercise: "Single Leg Cycle Jumps", reps: "", note: "10 yards each leg" },
        { id: "b2-5", exercise: "Single Leg Broad Jump to Double Leg Landing", reps: 5, note: "each leg" },
        { id: "b2-6", exercise: "Single Leg Jump to Single Leg Landing", reps: 5, note: "each leg" }
      ],
    },
    {
      id: "b3",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Dynamics",
      exercises: [
        { id: "b3-0", exercise: "A Skip", reps: "", note: "10 yards" },
        { id: "b3-1", exercise: "Prime Times", reps: "", note: "10 yards" },
        { id: "b3-2", exercise: "Tempo High Knees", reps: "", note: "10 yards" },
        { id: "b3-3", exercise: "Box Jump", reps: 5, note: "" }
      ],
    },
    {
      id: "b4",
      type: "circuit",
      category: "Speed",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Sprint Work",
      exercises: [
        { id: "b4-0", exercise: "30 Yard Sprint", reps: "", note: "x4, 2:00 rest between reps" },
        { id: "b4-1", exercise: "Sled Sprint", reps: "", note: "4-6 plates" },
        { id: "b4-2", exercise: "10 Yard Sprint", reps: "", note: "x3, 1:00 rest between reps" },
        { id: "b4-3", exercise: "10 Yard Sprint", reps: "", note: "x2, 1:00 rest between reps" }
      ],
    }
    ],
  },
  {
    id: "starter-summer-tue",
    name: "Summer Warm Up — Tuesday",
    notes: "Hips/mobility/prep into plyos into banded sprint work.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 2,
      workSec: 0,
      restSec: 0,
      note: "Hips (x2)",
      exercises: [
        { id: "b1-0", exercise: "Side Plank with Clamshell Hold", reps: "", note: ":15 sec each side" },
        { id: "b1-1", exercise: "Captain Morgan Side Plank", reps: "", note: ":30 sec each side" },
        { id: "b1-2", exercise: "Cossack Squat", reps: 5, note: "each side" }
      ],
    },
    {
      id: "b2",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Mobility",
      exercises: [
        { id: "b2-0", exercise: "90-90 Heel Touches", reps: 10, note: "each side, foot/heel doesn't touch ground" },
        { id: "b2-1", exercise: "90-90 Hip Switch", reps: 5, note: "each way" },
        { id: "b2-2", exercise: "Hip Circles", reps: "", note: "10 each way, slow" },
        { id: "b2-3", exercise: "Hamstring Walkouts", reps: "", note: ":30 sec" }
      ],
    },
    {
      id: "b3",
      type: "circuit",
      category: "Warm-Up",
      rounds: 2,
      workSec: 0,
      restSec: 0,
      note: "Prep (x2 each side)",
      exercises: [
        { id: "b3-0", exercise: "Split Squat Iso Hold", reps: "", note: ":30 sec, then 10 split squats, then front foot pogos :20 sec" }
      ],
    },
    {
      id: "b4",
      type: "circuit",
      category: "Jumps/Throws",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Plyos",
      exercises: [
        { id: "b4-0", exercise: "Lateral Jump to SL Landing", reps: 5, note: "each leg" },
        { id: "b4-1", exercise: "Diagonal Jump to SL Landing", reps: 5, note: "each leg" },
        { id: "b4-2", exercise: "Diagonal Double Bounce", reps: 5, note: "each leg" },
        { id: "b4-3", exercise: "Crossover Step", reps: 5, note: "each way, violent" }
      ],
    },
    {
      id: "b5",
      type: "circuit",
      category: "Speed",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Banded",
      exercises: [
        { id: "b5-0", exercise: "Lateral Shuffle", reps: "", note: "10 yards each way, banded" },
        { id: "b5-1", exercise: "Overspeed Deceleration", reps: "", note: "partner band assisted — jog 5 yd, decel 5 yd" }
      ],
    },
    {
      id: "b6",
      type: "circuit",
      category: "Speed",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Run the Hoop",
      exercises: [
        { id: "b6-0", exercise: "S-Curved Sprints", reps: "", note: "x3, 15 yard, come to balance" },
        { id: "b6-1", exercise: "Curved Sprint Chase", reps: "", note: "x3 each way, big toe in the ground, come to balance" }
      ],
    }
    ],
  },
  {
    id: "starter-summer-wed",
    name: "Summer Warm Up — Day 3",
    notes: "In the wrestling room — hips, T-spine, ankles.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Hips",
      exercises: [
        { id: "b1-0", exercise: "90-90 Hip Switch", reps: "", note: "" },
        { id: "b1-1", exercise: "Pigeon Push Ups", reps: "", note: "" },
        { id: "b1-2", exercise: "Partner Lateral Leg Raises", reps: "", note: "partner pushes foot down, other resists" },
        { id: "b1-3", exercise: "Rock n' Rolls", reps: "", note: "" },
        { id: "b1-4", exercise: "Cossack Squat", reps: "", note: "" }
      ],
    },
    {
      id: "b2",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "T-Spine",
      exercises: [
        { id: "b2-0", exercise: "Half Kneeling Wall Rotations", reps: "", note: "" },
        { id: "b2-1", exercise: "Wall T-Spine Pec Opener", reps: "", note: "" }
      ],
    },
    {
      id: "b3",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "Ankles",
      exercises: [
        { id: "b3-0", exercise: "Deep Squat Calf Raises", reps: "", note: "" },
        { id: "b3-1", exercise: "ATG Split Squat", reps: "", note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-summer-thu",
    name: "Summer Warm Up — Day 4",
    notes: "Hips into plyos into dynamics.",
    blocks: [
    {
      id: "b1",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "b1-0", exercise: "Kick Backs", reps: "", note: "" },
        { id: "b1-1", exercise: "Hip Circles", reps: "", note: "" },
        { id: "b1-2", exercise: "Half Kneeling Dynamic Hip Openers", reps: "", note: "3 positions" },
        { id: "b1-3", exercise: "90-90 Hip Switch", reps: "", note: "" },
        { id: "b1-4", exercise: "90-90 FRC", reps: "", note: "heel-knee-kick out-kick in-knee-heel" },
        { id: "b1-5", exercise: "Partner Resisted Lateral Leg Raises", reps: "", note: "" },
        { id: "b1-6", exercise: "Spider Man Stretch", reps: "", note: "" },
        { id: "b1-7", exercise: "Quad Mans", reps: "", note: "" },
        { id: "b1-8", exercise: "Pogos", reps: "", note: "" },
        { id: "b1-9", exercise: "Box Jump", reps: "", note: "" },
        { id: "b1-10", exercise: "Single Leg Cycle Jumps", reps: "", note: "" },
        { id: "b1-11", exercise: "High Knees", reps: "", note: "" },
        { id: "b1-12", exercise: "Prime Times", reps: "", note: "" }
      ],
    }
    ],
  },
  {
    id: "starter-2026-summer-day2",
    name: "2026 Summer — Day 2",
    notes: "Transcribed from a TrainHeroic screenshot — double check weights/supersets before running live.",
    blocks: [
    {
      id: "a",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "a-0", exercise: "Field Prep", reps: "", note: "" }
      ],
    },
    {
      id: "b",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "b-0", exercise: "Barbell Split Squat", sets: 5, reps: 5, metric: "none", note: "Safety Bar Split Squat" },
        { id: "b-1", exercise: "Front Squat", sets: 5, reps: 5, metric: "pct", pct: 65, note: "For weight" }
      ],
    },
    {
      id: "c",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "c-0", exercise: "Push-Up", sets: 4, reps: "8,6,6,5", metric: "none", note: "Weighted push-up, working to a max added load" },
        { id: "c-1", exercise: "Barbell RDL", sets: 5, reps: 6, metric: "none", note: "Working sets 135/185/205/255 lb" }
      ],
    },
    {
      id: "d",
      type: "sets",
      category: "Accessory",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "d-0", exercise: "Barbell Row", sets: 5, reps: 15, metric: "weight", load: 25, note: "45 Degree Back Ext Row — for weight" }
      ],
    }
    ],
  },
  {
    id: "starter-2026-summer-day3",
    name: "2026 Summer — Day 3",
    notes: "Transcribed from a TrainHeroic screenshot — double check weights/supersets before running live.",
    blocks: [
    {
      id: "a",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "a-0", exercise: "Combative Sprinting", reps: "", note: "Change of direction" }
      ],
    },
    {
      id: "b",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "b-0", exercise: "Bench Press", sets: 6, reps: 5, metric: "none" }
      ],
    },
    {
      id: "c",
      type: "sets",
      category: "Accessory",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "c-0", exercise: "ATG Shoulder Press", sets: 3, reps: 12, metric: "none", note: "Prone PVC Press over hurdle" },
        { id: "c-1", exercise: "Turkish Get Up", sets: 3, reps: 2, metric: "none" }
      ],
    },
    {
      id: "d",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "d-0", exercise: "Deadlift", sets: 6, reps: 5, metric: "none" },
        { id: "d-1", exercise: "Med Ball Backwards Scoop Throw", sets: 6, reps: 3, metric: "none" }
      ],
    }
    ],
  },
  {
    id: "starter-2026-summer-day4",
    name: "2026 Summer — Day 4",
    notes: "Transcribed from a TrainHeroic screenshot — double check weights/supersets before running live.",
    blocks: [
    {
      id: "a",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "a-0", exercise: "Prime Times", reps: "", note: "Circuit prep" }
      ],
    },
    {
      id: "b",
      type: "sets",
      category: "Accessory",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "b-0", exercise: "Pull-Up", sets: 10, reps: 1, metric: "none", note: "Neutral grip" },
        { id: "b-1", exercise: "Chaos DB Rows", sets: 10, reps: 5, metric: "weight", load: 55, note: "Incline bench DB row" },
        { id: "b-2", exercise: "Banded X Walks", sets: 10, reps: 2, metric: "none", note: "Dynamic banded trunk rotations with med ball" }
      ],
    },
    {
      id: "c",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "c-0", exercise: "Barbell Split Squat", sets: 5, reps: 5, metric: "weight", load: 55, note: "Barbell lunge" },
        { id: "c-1", exercise: "Barbell Row", sets: 5, reps: 10, metric: "weight", load: 25, note: "45 Degree Back Extension" },
        { id: "c-2", exercise: "Plyo Push Up to Box", sets: 5, reps: 3, metric: "none" }
      ],
    }
    ],
  },
  {
    id: "starter-2026-summer-day5",
    name: "2026 Summer — Day 5",
    notes: "Transcribed from a TrainHeroic screenshot — double check weights/supersets before running live.",
    blocks: [
    {
      id: "a",
      type: "circuit",
      category: "Warm-Up",
      rounds: 1,
      workSec: 0,
      restSec: 0,
      note: "",
      exercises: [
        { id: "a-0", exercise: "Field Prep", reps: "", note: "" },
        { id: "a-1", exercise: "Prime Times", reps: "", note: "Circuit" }
      ],
    },
    {
      id: "c",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "c-0", exercise: "Barbell Split Squat", sets: 6, reps: 3, metric: "none", note: "Safety Bar Dead Stop Squat, ~1.5 sec pause" }
      ],
    },
    {
      id: "d",
      type: "sets",
      category: "Accessory",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "d-0", exercise: "Chaos DB Rows", sets: 5, reps: 12, metric: "weight", load: 45, note: "DB Incline Bench Press" }
      ],
    },
    {
      id: "e",
      type: "sets",
      category: "Strength/Power",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "e-0", exercise: "1 Power Clean + 1 Hang Clean + 1 Front Squat", sets: 6, reps: 3, metric: "weight", load: 95, note: "Power Snatch" }
      ],
    },
    {
      id: "f",
      type: "sets",
      category: "Conditioning",
      rounds: 3,
      workSec: 40,
      restSec: 20,
      note: "",
      exercises: [
        { id: "f-0", exercise: "BB Suitcase Deadlift", sets: 3, reps: 1, metric: "time", note: "Farmers carry, 45 sec" }
      ],
    }
    ],
  },
  {
    id: "starter-warmup-coursepack",
    name: "Sample Warmup (Course Pack)",
    notes: "General warmup from the Program Design Templates course pack.",
    blocks: [
      {
        id: "cw1", type: "circuit", category: "Warm-Up", rounds: 1, workSec: 0, restSec: 0, note: "",
        exercises: [
          { id: "cw1-0", exercise: "Bodyweight Squat", reps: 10, note: "2 sets" },
          { id: "cw1-1", exercise: "Jumping Jacks", reps: 10, note: "2 sets" },
          { id: "cw1-2", exercise: "Standing Forward Lunge", reps: 5, note: "1 set, each leg" },
          { id: "cw1-3", exercise: "Standing Lateral Lunge", reps: 5, note: "1 set, each leg" },
          { id: "cw1-4", exercise: "Lying Straight Leg Raise", reps: 10, note: "each leg, can do without a band" },
          { id: "cw1-5", exercise: "Side Knee Raise", reps: 10, note: "each side (fire hydrants)" },
          { id: "cw1-6", exercise: "Dynamic Pigeons", reps: 5, note: "each side, 2-3 sec hold" },
          { id: "cw1-7", exercise: "Spiderman and Reach", reps: 5, note: "each side, elbow lunge" },
          { id: "cw1-8", exercise: "Yoga Push Ups", reps: 10, note: "" },
          { id: "cw1-9", exercise: "Prone W's", reps: 10, note: "" },
          { id: "cw1-10", exercise: "Prone Handcuffs", reps: 10, note: "" },
        ],
      },
    ],
  },
];

function ProgramBuilder({ db, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [pickingStarters, setPickingStarters] = useState(false);
  const [checkedStarters, setCheckedStarters] = useState([]);

  if (editing) {
    return (
      <SessionEditor db={db} value={editing} onChange={setEditing}
        onSave={() => { onSave(editing); setEditing(null); }}
        onCancel={() => setEditing(null)} />
    );
  }

  const classPrograms = db.programs.filter((p) => !p.isPersonal);
  const existingNames = new Set(classPrograms.map((p) => p.name));
  const importStarters = () => {
    for (const starterId of checkedStarters) {
      const starter = STARTER_SESSIONS.find((s) => s.id === starterId);
      if (!starter) continue;
      // Fresh ids throughout so re-importing later, or editing one copy,
      // never collides with another.
      const reid = (block) => ({
        ...block, id: uid(),
        exercises: block.exercises.map((e) => ({ ...e, id: uid() })),
      });
      onSave({ ...starter, id: uid(), blocks: starter.blocks.map(reid) });
    }
    setCheckedStarters([]);
    setPickingStarters(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <Eyebrow icon={ClipboardList}>Saved sessions</Eyebrow>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="subtle" icon={Download} onClick={() => setPickingStarters(true)}>Starter sessions</Button>
          <Button icon={Plus} onClick={() => setEditing(blankSession())}>New session</Button>
        </div>
      </div>
      {!classPrograms.length ? (
        <Empty icon={ClipboardList}>No sessions saved yet. Build one here to reuse it, write one straight onto a day from the Planner, or bring in the starter sessions above.</Empty>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {classPrograms.map(normalizeProgram).map((p) => (
            <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(JSON.parse(JSON.stringify(p)))}>Edit</Button>
                  <Button size="sm" variant="ghost" icon={Copy} onClick={() => onSave({ ...JSON.parse(JSON.stringify(p)), id: uid(), name: p.name + " (copy)" })} aria-label="Duplicate" />
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => onDelete(p.id)} aria-label="Delete" />
                </div>
              </div>
              {p.blocks.map((b, bi) => (
                b.type === "note" ? (
                  <div key={b.id} style={{ marginBottom: 7, fontSize: 12.5, color: C.textDim, lineHeight: 1.6, fontStyle: "italic" }}>
                    <span style={{ color: C.accent, fontWeight: 700, fontStyle: "normal" }}>Note:</span> {b.text || "(empty)"}
                  </div>
                ) : (
                <div key={b.id} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 9.5, color: C.steel, textTransform: "uppercase", letterSpacing: 1.1, fontWeight: 700, marginBottom: 3 }}>
                    {b.category}
                    {b.type === "circuit" ? ` · circuit, ${b.rounds} rounds` : b.exercises.length > 1 ? ` · ${(PAIR_NAME[b.exercises.length] || "giant set").toLowerCase()}` : ""}
                  </div>
                  {b.exercises.map((e, ei) => (
                    <div key={e.id} style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6 }}>
                      <span style={{ color: C.accent, fontWeight: 700 }}>{b.type === "circuit" ? ei + 1 : `${blockLetter(bi)}${ei + 1}`}</span>{" "}
                      {e.exercise}
                      {b.type === "circuit"
                        ? e.reps ? ` — ${e.reps} reps` : ""
                        : ` — ${prescriptionLine(e, exMeta(e.exercise, db.custom), null)}`}
                    </div>
                  ))}
                </div>
                )
              ))}
            </div>
          ))}
        </div>
      )}

      {pickingStarters && (
        <Modal title="Starter sessions" onClose={() => { setPickingStarters(false); setCheckedStarters([]); }} wide>
          <p style={{ fontSize: 12.5, color: C.textDim, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
            Built from your TrainHeroic warm-ups and programs. Pick any number to bring in as your own editable sessions — nothing changes until you tap Import.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {STARTER_SESSIONS.map((s) => {
              const already = existingNames.has(s.name);
              const checked = checkedStarters.includes(s.id);
              const movementCount = s.blocks.reduce((n, b) => n + b.exercises.length, 0);
              return (
                <label key={s.id} className="f" style={{
                  display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                  background: checked ? C.accentDim : C.surfaceAlt, border: `1px solid ${checked ? C.accentBorder : C.border}`,
                  borderRadius: 10, cursor: "pointer",
                }}>
                  <input type="checkbox" checked={checked} style={{ marginTop: 3 }}
                    onChange={() => setCheckedStarters(checked ? checkedStarters.filter((id) => id !== s.id) : [...checkedStarters, s.id])} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                      {s.name}
                      {already && <span style={{ color: C.steel, fontWeight: 500, fontSize: 11 }}> — you already have a session with this name</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{s.blocks.length} block{s.blocks.length === 1 ? "" : "s"} · {movementCount} movement{movementCount === 1 ? "" : "s"}</div>
                    {s.notes && <div style={{ fontSize: 11.5, color: C.steel, marginTop: 3, lineHeight: 1.5 }}>{s.notes}</div>}
                  </div>
                </label>
              );
            })}
          </div>
          <Button icon={Check} disabled={!checkedStarters.length} onClick={importStarters}>
            Import {checkedStarters.length || ""} session{checkedStarters.length === 1 ? "" : "s"}
          </Button>
        </Modal>
      )}
    </div>
  );
}

/* ===============================================================
   COACH: LIBRARY
   Where movements and sessions live. Create an exercise, put it in a
   category, give it points of performance, tag it — then build
   sessions from it and drop those onto the Planner.
================================================================ */
const EX_MODES = [
  { id: "weight", label: "Loaded (lb × reps)" },
  { id: "reps", label: "Body weight (reps)" },
  { id: "sprint", label: "Timed (seconds)" },
  { id: "measure", label: "Measured (height / distance)" },
];
const MODE_LABEL = { weight: "Loaded", reps: "Body weight", sprint: "Timed", measure: "Measured" };

// A custom cue wins over the built-in one.
const cueFor = (name, custom) => {
  const c = (custom || []).find((e) => e.name === name);
  return (c && c.cue) || CUES[name] || null;
};

/* ===============================================================
   SOMETHING HURTS
   Two jobs, in this order: get a human involved, and stop the athlete
   loading a hurt joint in the meantime.

   Deliberate limits — this does not diagnose, does not rate severity
   on a scale, and never suggests working through pain. Sharp or new
   pain and anything head or chest related skips substitutions
   entirely and goes straight to "stop and find your teacher."
================================================================ */
const BODY_AREAS = [
  { id: "shoulder", label: "Shoulder" },
  { id: "elbow", label: "Elbow or wrist" },
  { id: "lowback", label: "Low back" },
  { id: "hip", label: "Hip or groin" },
  { id: "knee", label: "Knee" },
  { id: "hamstring", label: "Hamstring or quad" },
  { id: "ankle", label: "Ankle or foot" },
  { id: "head", label: "Head or neck" },
  { id: "chest", label: "Chest or breathing" },
  { id: "other", label: "Somewhere else" },
];

// Movements that usually load the area, and ones that usually don't.
// Framed as a starting point for a conversation, not a prescription.
const AREA_SWAPS = {
  shoulder: { avoid: ["Overhead Press", "Push Press", "Bench Press", "Incline Bench Press", "Dip", "Power Clean"], ok: ["Trap Bar Deadlift", "Goblet Squat", "Hip Thrust", "Split Squat", "Romanian Deadlift"] },
  elbow: { avoid: ["Bench Press", "Bicep Curl", "Tricep Extension", "Pull-Up", "Power Clean", "Front Squat"], ok: ["Trap Bar Deadlift", "Hip Thrust", "Goblet Squat", "Split Squat", "Back Squat"] },
  lowback: { avoid: ["Deadlift", "Back Squat", "Barbell Row", "Power Clean", "Clean Pull", "Romanian Deadlift"], ok: ["Hip Thrust", "Goblet Squat", "Dumbbell Bench Press", "Lat Pulldown", "Push-Up"] },
  hip: { avoid: ["Split Squat", "Back Squat", "Broad Jump", "40 Yard Dash", "300 Yard Shuttle"], ok: ["Bench Press", "Lat Pulldown", "Overhead Press", "Barbell Row"] },
  knee: { avoid: ["Back Squat", "Front Squat", "Split Squat", "Broad Jump", "Vertical Jump", "40 Yard Dash"], ok: ["Romanian Deadlift", "Hip Thrust", "Bench Press", "Barbell Row", "Lat Pulldown"] },
  hamstring: { avoid: ["Romanian Deadlift", "Deadlift", "40 Yard Dash", "100 Meter", "Broad Jump", "300 Yard Shuttle"], ok: ["Bench Press", "Overhead Press", "Lat Pulldown", "Barbell Row"] },
  ankle: { avoid: ["40 Yard Dash", "Broad Jump", "Vertical Jump", "Split Squat", "300 Yard Shuttle"], ok: ["Bench Press", "Barbell Row", "Lat Pulldown", "Hip Thrust"] },
  other: { avoid: [], ok: [] },
};

function InjuryFlow({ student, exercise, onSend, onClose }) {
  const [area, setArea] = useState(null);
  const [kind, setKind] = useState(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const urgent = area && (area === "head" || area === "chest" || kind === "sharp");
  const swaps = area && AREA_SWAPS[area];

  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Check size={20} color={C.good} />
          <span className="d" style={{ fontSize: 19, textTransform: "uppercase" }}>Sent to your teacher</span>
        </div>
        <p style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
          It shows on their screen right away. Go tell them in person too &mdash; a message is not a substitute for someone putting eyes on you.
        </p>
        <Button full onClick={onClose}>Done</Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {exercise && (
        <div style={{ fontSize: 12.5, color: C.steel }}>While doing <span style={{ color: C.text, fontWeight: 700 }}>{exercise}</span></div>
      )}

      <div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {BODY_AREAS.map((a) => (
            <Chip key={a.id} active={area === a.id} onClick={() => setArea(a.id)}>{a.label}</Chip>
          ))}
        </div>
      </div>

      {area && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 9 }}>What does it feel like?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { id: "sharp", label: "Sharp, stabbing, or it gave out", sub: "Also pick this if it's swollen or you can't move it normally" },
              { id: "sore", label: "Sore, tight, or achy", sub: "The kind that showed up gradually" },
            ].map((k) => (
              <button key={k.id} onClick={() => setKind(k.id)} className="b f" style={{
                textAlign: "left", padding: "11px 13px", borderRadius: 10, cursor: "pointer",
                background: kind === k.id ? C.accentDim : C.surfaceAlt,
                border: `1px solid ${kind === k.id ? C.accentBorder : C.border}`, color: C.text,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{k.label}</div>
                <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{k.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {area && kind && (
        <>
          {urgent ? (
            <div style={{ background: "rgba(224,133,133,.12)", border: "1px solid rgba(224,133,133,.45)", borderRadius: 11, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={17} color={C.bad} />
                <span style={{ fontWeight: 700, fontSize: 14, color: C.bad }}>Stop lifting and go find your teacher now</span>
              </div>
              <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
                {area === "head"
                  ? "Head and neck symptoms need your athletic trainer today, before you do anything else. Don't drive yourself anywhere and don't wait to see if it settles down."
                  : area === "chest"
                    ? "Chest pain or trouble breathing needs an adult right now. Tell your teacher immediately."
                    : "Sharp pain isn't something to train around or swap your way out of. Your teacher or athletic trainer needs to look at it before you load it again."}
              </p>
              <p style={{ fontSize: 12, color: C.steel, lineHeight: 1.6, margin: "10px 0 0" }}>
                Not going to suggest replacement movements for this one on purpose.
              </p>
            </div>
          ) : swaps && swaps.ok.length ? (
            <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 9 }}>Talk to your teacher before you change anything</div>
              <p style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6, margin: "0 0 12px" }}>
                They may want you to skip today entirely. If they clear you to keep training, these are the usual places to start.
              </p>
              <div style={{ fontSize: 10, color: C.bad, textTransform: "uppercase", letterSpacing: 0.9, fontWeight: 700, marginBottom: 6 }}>Usually loads a sore {BODY_AREAS.find((a) => a.id === area).label.toLowerCase()}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                {swaps.avoid.map((n) => <Chip key={n} tone="bad">{n}</Chip>)}
              </div>
              <div style={{ fontSize: 10, color: C.good, textTransform: "uppercase", letterSpacing: 0.9, fontWeight: 700, marginBottom: 6 }}>Usually doesn&rsquo;t</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {swaps.ok.map((n) => <Chip key={n} tone="good">{n}</Chip>)}
              </div>
              <p style={{ fontSize: 11.5, color: C.steel, lineHeight: 1.6, margin: "12px 0 0" }}>
                General patterns, not advice about your body. Nothing here should hurt while you do it &mdash; if it does, stop.
              </p>
            </div>
          ) : (
            <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 11, padding: 14, fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
              Tell your teacher what&rsquo;s going on and let them decide what you do today.
            </div>
          )}

          <Field label="Anything else they should know?" hint="Optional. When it started, what makes it worse.">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="f"
              placeholder="Started during warm-ups, hurts most on the way down" style={{ ...inputCss, resize: "vertical" }} />
          </Field>

          <Button full icon={MessageSquare} onClick={() => { onSend({ area, kind, exercise: exercise || null, note: note.trim(), urgent: !!urgent }); setSent(true); }}>
            Tell my teacher
          </Button>
        </>
      )}

      <p style={{ fontSize: 11, color: C.steel, lineHeight: 1.6, margin: 0 }}>
        This app isn&rsquo;t a medical anything. For an injury, the people who can actually help are your athletic trainer, the school nurse, and your doctor.
      </p>
    </div>
  );
}

function InjuryBoard({ db, teacherId, onAck }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const rows = useMemo(() => {
    const out = [];
    for (const s of myStudents) {
      for (const r of db.injuries[s.id] || []) out.push({ ...r, student: s });
    }
    return out.sort((a, b) => (a.status === "open" ? -1 : 1) - (b.status === "open" ? -1 : 1) || b.date.localeCompare(a.date));
  }, [myStudents, db.injuries]);

  const open = rows.filter((r) => r.status === "open");
  if (!rows.length) return null;

  return (
    <Card style={{ borderColor: open.length ? "rgba(224,133,133,.45)" : C.border }}>
      <Eyebrow icon={AlertTriangle}>{open.length ? `${open.length} open injury report${open.length > 1 ? "s" : ""}` : "Injury reports"}</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.slice(0, 12).map((r) => {
          const area = BODY_AREAS.find((a) => a.id === r.area);
          return (
            <div key={r.id} style={{
              background: r.status === "open" ? "rgba(224,133,133,.08)" : C.surfaceAlt,
              border: `1px solid ${r.status === "open" ? "rgba(224,133,133,.3)" : C.border}`,
              borderRadius: 10, padding: "11px 13px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {r.student.name} · {area ? area.label : r.area}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 3 }}>
                    {fmtDate(r.date)}
                    {r.exercise ? ` · during ${r.exercise}` : ""}
                    {r.kind === "sharp" ? " · sharp / gave out" : " · sore or tight"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {r.urgent && <Chip tone="bad">See trainer</Chip>}
                  {r.status === "open"
                    ? <Button size="sm" variant="ghost" onClick={() => onAck(r.student.id, r.id)}>Mark seen</Button>
                    : <Chip tone="good">Seen</Chip>}
                </div>
              </div>
              {r.note && <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 8, lineHeight: 1.55 }}>{r.note}</div>}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11.5, color: C.steel, margin: "12px 0 0", lineHeight: 1.6 }}>
        &ldquo;Mark seen&rdquo; is a note to yourself that you followed up. It isn&rsquo;t a clearance, and it doesn&rsquo;t replace whatever your school&rsquo;s injury reporting process already requires.
      </p>
    </Card>
  );
}

// Same shape and reasoning as InjuryBoard — a caring flag the app
// raises on its own when a weight goal represents a large swing from
// the athlete's own current weight, surfaced to a coach the same way
// an injury report is, so a concerning number doesn't just disappear
// into a settings field nobody ever looks at again.
function WeightConcernBoard({ db, teacherId, onAck }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const rows = useMemo(() => {
    const out = [];
    for (const s of myStudents) {
      for (const r of db.weightConcerns[s.id] || []) out.push({ ...r, student: s });
    }
    return out.sort((a, b) => (a.status === "open" ? -1 : 1) - (b.status === "open" ? -1 : 1) || b.date.localeCompare(a.date));
  }, [myStudents, db.weightConcerns]);

  const open = rows.filter((r) => r.status === "open");
  if (!rows.length) return null;

  return (
    <Card style={{ borderColor: open.length ? "rgba(224,133,133,.45)" : C.border }}>
      <Eyebrow icon={AlertTriangle}>{open.length ? `${open.length} weight goal${open.length > 1 ? "s" : ""} worth a check-in` : "Weight goal flags"}</Eyebrow>
      <p style={{ fontSize: 11.5, color: C.steel, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
        Raised automatically when a goal is a large swing from an athlete's current weight — not a diagnosis, just a nudge to check in.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.slice(0, 12).map((r) => (
          <div key={r.id} style={{
            background: r.status === "open" ? "rgba(224,133,133,.08)" : C.surfaceAlt,
            border: `1px solid ${r.status === "open" ? "rgba(224,133,133,.3)" : C.border}`,
            borderRadius: 10, padding: "11px 13px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.student.name}</div>
                <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 3 }}>
                  {fmtDate(r.date)} · wants to {r.direction} {r.pct}% of current bodyweight · {r.currentWeight} → {r.goalWeight} lb
                </div>
              </div>
              {r.status === "open"
                ? <Button size="sm" variant="ghost" onClick={() => onAck(r.student.id, r.id)}>Mark seen</Button>
                : <Chip tone="good">Seen</Chip>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const MOVEMENT_PATTERNS = ["Squat", "Hinge", "Push", "Pull", "Lunge", "Carry", "Rotation/Core", "Jump/Throw", "Locomotion", "Other"];
const EQUIPMENT_OPTIONS = ["Barbell", "Dumbbell", "Kettlebell", "Band", "Cable/Machine", "Med Ball", "Bodyweight", "Box/Bench", "Sled", "Other"];

function ExerciseLibrary({ db, onSaveExercise, onDeleteExercise, onHideExercise, onRestoreExercise }) {
  const [q, setQ] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [patternFilter, setPatternFilter] = useState("");
  const [equipFilter, setEquipFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmHide, setConfirmHide] = useState(null);

  const blank = () => ({ name: "", group: "Lower", mode: "weight", dist: "", unit: "yd", cue: "", tags: "", pattern: "", equipment: "", video: "" });

  const rows = useMemo(() => {
    return db.exercises
      .map((n) => {
        const meta = exMeta(n, db.custom);
        const mine = db.custom.find((e) => e.name === n);
        const isBuiltin = !!LIBRARY.find((e) => e.name === n);
        return { name: n, meta, isBuiltin, override: isBuiltin && !!mine, custom: !isBuiltin, mine, tags: mine && mine.tags ? mine.tags : [], cue: cueFor(n, db.custom) };
      })
      .filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
      .filter((r) => !groupFilter || r.meta.group === groupFilter)
      .filter((r) => !patternFilter || r.meta.pattern === patternFilter)
      .filter((r) => !equipFilter || r.meta.equipment === equipFilter)
      .sort((a, b) => (b.custom - a.custom) || a.name.localeCompare(b.name));
  }, [db.exercises, db.custom, q, groupFilter, patternFilter, equipFilter]);

  const hidden = db.hiddenBuiltins || [];

  const openEdit = (r) => {
    const m = r.mine;
    setEditing({
      original: r.name, builtin: r.isBuiltin,
      name: r.name, group: (m && m.group) || r.meta.group || "Other", mode: (m && m.mode) || r.meta.mode || "weight",
      dist: (m && m.dist) || r.meta.dist || "", unit: (m && m.unit) || r.meta.unit || "yd",
      cue: (m && m.cue) || r.cue || "", tags: ((m && m.tags) || []).join(", "),
      pattern: (m && m.pattern) || r.meta.pattern || "", equipment: (m && m.equipment) || r.meta.equipment || "",
      video: (m && m.video) || r.meta.video || "",
    });
  };

  const save = () => {
    const name = editing.name.trim();
    if (!name) return;
    onSaveExercise({
      name,
      group: editing.group,
      mode: editing.mode,
      dist: editing.mode === "sprint" && editing.dist ? Number(editing.dist) : undefined,
      unit: editing.mode === "sprint" ? editing.unit : editing.mode === "measure" ? "in" : undefined,
      cue: editing.cue.trim() || undefined,
      tags: editing.tags.split(",").map((t) => t.trim()).filter(Boolean),
      pattern: editing.pattern || undefined,
      equipment: editing.equipment || undefined,
      video: editing.video.trim() || undefined,
    }, editing.original);
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movements" className="f"
          style={{ ...inputCss, flex: 1, minWidth: 150, fontSize: 13, padding: "8px 10px" }} />
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          <option value="">All categories</option>
          {EX_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={patternFilter} onChange={(e) => setPatternFilter(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          <option value="">All patterns</option>
          {MOVEMENT_PATTERNS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={equipFilter} onChange={(e) => setEquipFilter(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          <option value="">All equipment</option>
          {EQUIPMENT_OPTIONS.map((eq) => <option key={eq}>{eq}</option>)}
        </select>
        <Button icon={Plus} onClick={() => setEditing(blank())}>Create movement</Button>
      </div>

      <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
          <thead>
            <tr>
              {["Movement", "Category", "Measured as", "Tags", ""].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "11px 12px", color: C.textDim, fontSize: 9.5,
                  textTransform: "uppercase", letterSpacing: 0.7, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Helmet size={20} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700 }}>{r.name}</span>
                        {r.isBuiltin && <span style={{ fontSize: 9.5, color: C.steel, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.override ? "built-in · edited" : "built-in"}</span>}
                        {r.meta.video && <a href={r.meta.video} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "flex", color: C.accent }} aria-label="Watch demo video"><Play size={13} /></a>}
                      </div>
                      {r.cue && <div style={{ fontSize: 11, color: C.steel, marginTop: 2, lineHeight: 1.45 }}>{r.cue.length > 90 ? r.cue.slice(0, 90) + "…" : r.cue}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <Chip>{r.meta.group}</Chip>
                    {r.meta.pattern && <Chip tone="gold">{r.meta.pattern}</Chip>}
                    {r.meta.equipment && <Chip>{r.meta.equipment}</Chip>}
                  </div>
                </td>
                <td style={{ padding: "10px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                  {MODE_LABEL[r.meta.mode]}
                  {r.meta.mode === "sprint" && r.meta.dist ? ` · ${r.meta.dist} ${r.meta.unit}` : ""}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {r.tags.map((t) => <Chip key={t} tone="gold">{t}</Chip>)}
                    {!r.tags.length && <span style={{ color: C.border }}>—</span>}
                  </div>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
                    {r.override && (
                      <Button size="sm" variant="ghost" onClick={() => onDeleteExercise(r.name)}>Revert</Button>
                    )}
                    {r.isBuiltin ? (
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmHide(r.name)} aria-label="Delete" />
                    ) : (
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => onDeleteExercise(r.name)} aria-label="Delete" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hidden.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 7 }}>Removed from the library</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {hidden.map((name) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 6px 5px 12px" }}>
                <span style={{ fontSize: 12, color: C.textDim }}>{name}</span>
                <Button size="sm" variant="ghost" onClick={() => onRestoreExercise(name)}>Restore</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11.5, color: C.steel, marginTop: 12, lineHeight: 1.6 }}>
        {rows.length} of {db.exercises.length} movements. Editing a built-in movement saves your own version of its category, cues, or default distance; removing one just hides it from pickers everywhere — nothing is lost, and it can be restored above at any time. Anything you create or change here shows up in the session builder and the athletes&rsquo; Library tab.
      </p>

      {editing && (
        <Modal title={editing.original ? "Edit movement" : "Create movement"} onClose={() => setEditing(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Name" hint={editing.builtin ? "Built-in movement names can't be changed" : "How it reads on the athlete's card"}>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} disabled={editing.builtin}
                placeholder="e.g. 1 Power Clean + 1 Hang Clean + 1 Front Squat" className="f" style={{ ...inputCss, opacity: editing.builtin ? 0.6 : 1 }} />
            </Field>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 130 }}>
                <Field label="Category">
                  <select value={editing.group} onChange={(e) => setEditing({ ...editing, group: e.target.value })} className="f" style={inputCss}>
                    {EX_GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Field label="Measured as">
                  <select value={editing.mode} onChange={(e) => setEditing({ ...editing, mode: e.target.value })} className="f" style={inputCss}>
                    {EX_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 130 }}>
                <Field label="Movement pattern" hint="Optional">
                  <select value={editing.pattern} onChange={(e) => setEditing({ ...editing, pattern: e.target.value })} className="f" style={inputCss}>
                    <option value="">Not set</option>
                    {MOVEMENT_PATTERNS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ flex: 1, minWidth: 130 }}>
                <Field label="Equipment" hint="Optional">
                  <select value={editing.equipment} onChange={(e) => setEditing({ ...editing, equipment: e.target.value })} className="f" style={inputCss}>
                    <option value="">Not set</option>
                    {EQUIPMENT_OPTIONS.map((eq) => <option key={eq}>{eq}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            {editing.mode === "sprint" && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Default distance" hint="Editable per session later">
                    <input value={editing.dist} onChange={(e) => setEditing({ ...editing, dist: e.target.value })} inputMode="decimal" placeholder="40" className="f" style={inputCss} />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Unit">
                    <select value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="f" style={inputCss}>
                      {DIST_UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}
            <Field label="Points of performance" hint="Shows on the athlete's screen when they open the movement">
              <textarea value={editing.cue} onChange={(e) => setEditing({ ...editing, cue: e.target.value })} rows={3}
                placeholder="Two or three cues, in the words you'd use on the floor" className="f" style={{ ...inputCss, resize: "vertical" }} />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                placeholder="Sprint/Speed, Testing" className="f" style={inputCss} />
            </Field>
            <Field label="Demo video link" hint="Optional — YouTube, Vimeo, or any URL. Shows as a play icon next to the movement name.">
              <input value={editing.video} onChange={(e) => setEditing({ ...editing, video: e.target.value })}
                placeholder="https://..." className="f" style={inputCss} />
            </Field>
            <Button full icon={Check} disabled={!editing.name.trim()} onClick={save}>
              {editing.original ? "Save changes" : "Add to library"}
            </Button>
          </div>
        </Modal>
      )}

      {confirmHide && (
        <ConfirmModal
          title="Remove movement?"
          body={`Remove "${confirmHide}" from the library? It'll disappear from pickers everywhere, but nothing is lost — restore it any time from the list below the table.`}
          confirmLabel="Remove"
          onConfirm={() => onHideExercise(confirmHide)}
          onClose={() => setConfirmHide(null)}
        />
      )}
    </div>
  );
}

/* ===============================================================
   COACH: TRAINING CYCLES — multi-week block templates. Build the
   sequence once, apply it to any group starting from any date, and it
   writes the whole thing onto the Planner in one shot.
================================================================ */
// Full multi-week program templates built from the coach's own
// Strength Training Program Design course pack. Each bundle imports as
// its own saved sessions plus one Program (Cycle) tying them together —
// available from Library > Programs, never auto-added.
const STARTER_PROGRAM_BUNDLES = [
  {
    id: "bundle-cube-crossfit-6day", name: "6-Day Blended Cube Method / CrossFit (Weeks 1-9)", notes: "Your own 6-day Cube-style strength program blended with CrossFit conditioning. Each lift (Squat, Bench, Deadlift, Olympic, Press, Clean) rotates through Heavy / Explosive / Repetition days, offset per lift so no two lifts peak in the same week — Squat and Clean run Heavy-Explosive-Repetition, Bench and the Olympic lift run Explosive-Repetition-Heavy, Deadlift and Press run Repetition-Heavy-Explosive. Wave 1 (weeks 1-3) is transcribed exactly from your document. Wave 2 (weeks 4-6) uses your explicit Week 4 numbers, with weeks 5-6 continuing the same rotation at Wave 2's sets/reps/%. Wave 3 (weeks 7-9) applies your note's +5% instruction on top of Wave 2, keeping Wave 2's set/rep scheme. Conditioning pieces cycle through the 4 distinct WOD sets your document specifies (your Week 4 set, plus your three Wave 1 weekly sets), since that's the full set of WODs given — weeks that reuse a set are noted as such. Weeks 10-12 (Peak/PR phase) aren't included since your document references that as being defined in a separate doc I don't have yet.",
    sessions: [
    {
      name: "Wk1 Squat — Heavy", notes: "Wave 1, week 1 of 3. Main lift is a heavy day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 5, metric: "pct", pct: 80, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 10 minutes",
          exercises: [
          { id: uid(), exercise: "Air Squat", reps: 10, note: "Goblet squat" },
          { id: uid(), exercise: "Burpees", reps: 10, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk1 Bench — Explosive", notes: "Wave 1, week 1 of 3. Main lift is a explosive day at 65%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 8, reps: 3, metric: "pct", pct: 65, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "5 rounds for time",
          exercises: [
          { id: uid(), exercise: "Run", reps: 0, note: "200m" },
          { id: uid(), exercise: "Push-Up", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk1 Deadlift — Repetition", notes: "Wave 1, week 1 of 3. Main lift is a repetition day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 2, reps: 8, metric: "pct", pct: 70, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "12 min EMOM, alternating minutes",
          exercises: [
          { id: uid(), exercise: "Kettlebell Swing", reps: 15, note: "odd minutes" },
          { id: uid(), exercise: "Box Jump", reps: 12, note: "even minutes" }
          ],
        }
      ],
    },
    {
      name: "Wk1 Oly — Explosive", notes: "Wave 1, week 1 of 3. Main lift is a explosive day at 65%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 8, reps: 3, metric: "pct", pct: 65, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "Descending ladder 10-9-8...1, for time",
          exercises: [
          { id: uid(), exercise: "Power Snatch", reps: 0, note: "10-9-8...1, light weight" },
          { id: uid(), exercise: "Wall Ball", reps: 0, note: "10-9-8...1" }
          ],
        }
      ],
    },
    {
      name: "Wk1 Press — Repetition", notes: "Wave 1, week 1 of 3. Main lift is a repetition day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 2, reps: 10, metric: "pct", pct: 70, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 8 minutes",
          exercises: [
          { id: uid(), exercise: "Pull-Up", reps: 5, note: "" },
          { id: uid(), exercise: "Push-Up", reps: 10, note: "" },
          { id: uid(), exercise: "Air Squat", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk1 Clean — Heavy", notes: "Wave 1, week 1 of 3. Main lift is a heavy day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 2, reps: 5, metric: "pct", pct: 80, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time — 'Grace' style",
          exercises: [
          { id: uid(), exercise: "Clean & Jerk", reps: 30, note: "Moderate weight" }
          ],
        }
      ],
    },
    {
      name: "Wk2 Squat — Explosive", notes: "Wave 1, week 2 of 3. Main lift is a explosive day at 65%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 8, reps: 3, metric: "pct", pct: 65, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "4 rounds for time",
          exercises: [
          { id: uid(), exercise: "Run", reps: 0, note: "400m" },
          { id: uid(), exercise: "Air Squat", reps: 20, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk2 Bench — Repetition", notes: "Wave 1, week 2 of 3. Main lift is a repetition day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 10, metric: "pct", pct: 70, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "DB Snatch", reps: 12, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 12, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk2 Deadlift — Heavy", notes: "Wave 1, week 2 of 3. Main lift is a heavy day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 2, reps: 5, metric: "pct", pct: 80, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "21-15-9 for time",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 0, note: "21-15-9, 50% of 1RM" },
          { id: uid(), exercise: "Toes to Bar", reps: 0, note: "21-15-9" }
          ],
        }
      ],
    },
    {
      name: "Wk2 Oly — Repetition", notes: "Wave 1, week 2 of 3. Main lift is a repetition day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 2, reps: 10, metric: "pct", pct: 70, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "15 min EMOM, rotating exercises",
          exercises: [
          { id: uid(), exercise: "Wall Ball", reps: 10, note: "" },
          { id: uid(), exercise: "Burpees", reps: 10, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 10, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk2 Press — Heavy", notes: "Wave 1, week 2 of 3. Main lift is a heavy day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 2, reps: 5, metric: "pct", pct: 80, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "Death by — add 1 rep each minute until failure",
          exercises: [
          { id: uid(), exercise: "Burpees", reps: 0, note: "1 rep min 1, 2 reps min 2, etc." }
          ],
        }
      ],
    },
    {
      name: "Wk2 Clean — Explosive", notes: "Wave 1, week 2 of 3. Main lift is a explosive day at 65%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 8, reps: 3, metric: "pct", pct: 65, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "5 rounds for time",
          exercises: [
          { id: uid(), exercise: "Power Clean", reps: 15, note: "Light weight" },
          { id: uid(), exercise: "Box Jump", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk3 Squat — Repetition", notes: "Wave 1, week 3 of 3. Main lift is a repetition day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 10, metric: "pct", pct: 70, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Row", reps: 0, note: "1000m" },
          { id: uid(), exercise: "Air Squat", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk3 Bench — Heavy", notes: "Wave 1, week 3 of 3. Main lift is a heavy day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 5, metric: "pct", pct: 80, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 10 minutes",
          exercises: [
          { id: uid(), exercise: "Pull-Up", reps: 5, note: "" },
          { id: uid(), exercise: "Push-Up", reps: 10, note: "" },
          { id: uid(), exercise: "Air Squat", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk3 Deadlift — Explosive", notes: "Wave 1, week 3 of 3. Main lift is a explosive day at 65%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 8, reps: 3, metric: "pct", pct: 65, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 5, note: "" },
          { id: uid(), exercise: "HSPU", reps: 10, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk3 Oly — Heavy", notes: "Wave 1, week 3 of 3. Main lift is a heavy day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 2, reps: 5, metric: "pct", pct: 80, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Snatch", reps: 50, note: "Light weight" },
          { id: uid(), exercise: "Burpees", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk3 Press — Explosive", notes: "Wave 1, week 3 of 3. Main lift is a explosive day at 65%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 8, reps: 3, metric: "pct", pct: 65, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "3 rounds for time",
          exercises: [
          { id: uid(), exercise: "Row", reps: 0, note: "500m" },
          { id: uid(), exercise: "Kettlebell Swing", reps: 21, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk3 Clean — Repetition", notes: "Wave 1, week 3 of 3. Main lift is a repetition day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 2, reps: 10, metric: "pct", pct: 70, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 15 minutes",
          exercises: [
          { id: uid(), exercise: "Power Clean", reps: 5, note: "" },
          { id: uid(), exercise: "Front Squat", reps: 10, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk4 Squat — Heavy", notes: "Wave 2, week 1 of 3. Main lift is a heavy day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 3, metric: "pct", pct: 85, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 12 },
          { id: uid(), exercise: "Farmers Walk", sets: 4, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "'Annie' — 50-40-30-20-10, for time",
          exercises: [
          { id: uid(), exercise: "Double Under", reps: 0, note: "50-40-30-20-10" },
          { id: uid(), exercise: "Sit-up", reps: 0, note: "50-40-30-20-10" }
          ],
        }
      ],
    },
    {
      name: "Wk4 Bench — Explosive", notes: "Wave 2, week 1 of 3. Main lift is a explosive day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 5, reps: 2, metric: "pct", pct: 70, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 10 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 20 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", reps: 10, note: "" },
          { id: uid(), exercise: "DB Snatch", reps: 10, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 10, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk4 Deadlift — Repetition", notes: "Wave 2, week 1 of 3. Main lift is a repetition day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 2, reps: 6, metric: "pct", pct: 80, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 10 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 20 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "5 rounds for time",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 15, note: "Moderate weight" },
          { id: uid(), exercise: "Burpees", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk4 Oly — Explosive", notes: "Wave 2, week 1 of 3. Main lift is a explosive day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 5, reps: 2, metric: "pct", pct: 70, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "L-Sit Hold", sets: 3, reps: 0, note: "30 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 15 minutes",
          exercises: [
          { id: uid(), exercise: "Wall Ball", reps: 15, note: "" },
          { id: uid(), exercise: "Pull-Up", reps: 10, note: "" },
          { id: uid(), exercise: "Snatch", reps: 5, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk4 Press — Repetition", notes: "Wave 2, week 1 of 3. Main lift is a repetition day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 2, reps: 8, metric: "pct", pct: 80, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 4, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Run", reps: 0, note: "800m" },
          { id: uid(), exercise: "Air Squat", reps: 50, note: "" },
          { id: uid(), exercise: "Run", reps: 0, note: "400m" },
          { id: uid(), exercise: "Air Squat", reps: 25, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk4 Clean — Heavy", notes: "Wave 2, week 1 of 3. Main lift is a heavy day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 2, reps: 3, metric: "pct", pct: 85, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 6 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 20 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "Chipper — for time",
          exercises: [
          { id: uid(), exercise: "Clean & Jerk", reps: 50, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 50, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk5 Squat — Explosive", notes: "Wave 2, week 2 of 3. Main lift is a explosive day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 5, reps: 2, metric: "pct", pct: 70, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "4 rounds for time",
          exercises: [
          { id: uid(), exercise: "Run", reps: 0, note: "400m" },
          { id: uid(), exercise: "Air Squat", reps: 20, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk5 Bench — Repetition", notes: "Wave 2, week 2 of 3. Main lift is a repetition day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 8, metric: "pct", pct: 80, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "DB Snatch", reps: 12, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 12, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk5 Deadlift — Heavy", notes: "Wave 2, week 2 of 3. Main lift is a heavy day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 2, reps: 3, metric: "pct", pct: 85, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "21-15-9 for time",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 0, note: "21-15-9, 50% of 1RM" },
          { id: uid(), exercise: "Toes to Bar", reps: 0, note: "21-15-9" }
          ],
        }
      ],
    },
    {
      name: "Wk5 Oly — Repetition", notes: "Wave 2, week 2 of 3. Main lift is a repetition day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 2, reps: 8, metric: "pct", pct: 80, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "15 min EMOM, rotating exercises",
          exercises: [
          { id: uid(), exercise: "Wall Ball", reps: 10, note: "" },
          { id: uid(), exercise: "Burpees", reps: 10, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 10, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk5 Press — Heavy", notes: "Wave 2, week 2 of 3. Main lift is a heavy day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 2, reps: 3, metric: "pct", pct: 85, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "Death by — add 1 rep each minute until failure",
          exercises: [
          { id: uid(), exercise: "Burpees", reps: 0, note: "1 rep min 1, 2 reps min 2, etc." }
          ],
        }
      ],
    },
    {
      name: "Wk5 Clean — Explosive", notes: "Wave 2, week 2 of 3. Main lift is a explosive day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 5, reps: 2, metric: "pct", pct: 70, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "5 rounds for time",
          exercises: [
          { id: uid(), exercise: "Power Clean", reps: 15, note: "Light weight" },
          { id: uid(), exercise: "Box Jump", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk6 Squat — Repetition", notes: "Wave 2, week 3 of 3. Main lift is a repetition day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 8, metric: "pct", pct: 80, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Row", reps: 0, note: "1000m" },
          { id: uid(), exercise: "Air Squat", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk6 Bench — Heavy", notes: "Wave 2, week 3 of 3. Main lift is a heavy day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 3, metric: "pct", pct: 85, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 10 minutes",
          exercises: [
          { id: uid(), exercise: "Pull-Up", reps: 5, note: "" },
          { id: uid(), exercise: "Push-Up", reps: 10, note: "" },
          { id: uid(), exercise: "Air Squat", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk6 Deadlift — Explosive", notes: "Wave 2, week 3 of 3. Main lift is a explosive day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 5, reps: 2, metric: "pct", pct: 70, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 5, note: "" },
          { id: uid(), exercise: "HSPU", reps: 10, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk6 Oly — Heavy", notes: "Wave 2, week 3 of 3. Main lift is a heavy day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 2, reps: 3, metric: "pct", pct: 85, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Snatch", reps: 50, note: "Light weight" },
          { id: uid(), exercise: "Burpees", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk6 Press — Explosive", notes: "Wave 2, week 3 of 3. Main lift is a explosive day at 70%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 5, reps: 2, metric: "pct", pct: 70, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "3 rounds for time",
          exercises: [
          { id: uid(), exercise: "Row", reps: 0, note: "500m" },
          { id: uid(), exercise: "Kettlebell Swing", reps: 21, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk6 Clean — Repetition", notes: "Wave 2, week 3 of 3. Main lift is a repetition day at 80%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 2, reps: 8, metric: "pct", pct: 80, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 15 minutes",
          exercises: [
          { id: uid(), exercise: "Power Clean", reps: 5, note: "" },
          { id: uid(), exercise: "Front Squat", reps: 10, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk7 Squat — Heavy", notes: "Wave 3, week 1 of 3. Main lift is a heavy day at 90%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 3, metric: "pct", pct: 90, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 10 minutes",
          exercises: [
          { id: uid(), exercise: "Air Squat", reps: 10, note: "Goblet squat" },
          { id: uid(), exercise: "Burpees", reps: 10, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk7 Bench — Explosive", notes: "Wave 3, week 1 of 3. Main lift is a explosive day at 75%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 5, reps: 2, metric: "pct", pct: 75, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "5 rounds for time",
          exercises: [
          { id: uid(), exercise: "Run", reps: 0, note: "200m" },
          { id: uid(), exercise: "Push-Up", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk7 Deadlift — Repetition", notes: "Wave 3, week 1 of 3. Main lift is a repetition day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 2, reps: 6, metric: "pct", pct: 85, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "12 min EMOM, alternating minutes",
          exercises: [
          { id: uid(), exercise: "Kettlebell Swing", reps: 15, note: "odd minutes" },
          { id: uid(), exercise: "Box Jump", reps: 12, note: "even minutes" }
          ],
        }
      ],
    },
    {
      name: "Wk7 Oly — Explosive", notes: "Wave 3, week 1 of 3. Main lift is a explosive day at 75%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 5, reps: 2, metric: "pct", pct: 75, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "Descending ladder 10-9-8...1, for time",
          exercises: [
          { id: uid(), exercise: "Power Snatch", reps: 0, note: "10-9-8...1, light weight" },
          { id: uid(), exercise: "Wall Ball", reps: 0, note: "10-9-8...1" }
          ],
        }
      ],
    },
    {
      name: "Wk7 Press — Repetition", notes: "Wave 3, week 1 of 3. Main lift is a repetition day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 2, reps: 8, metric: "pct", pct: 85, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 8 minutes",
          exercises: [
          { id: uid(), exercise: "Pull-Up", reps: 5, note: "" },
          { id: uid(), exercise: "Push-Up", reps: 10, note: "" },
          { id: uid(), exercise: "Air Squat", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk7 Clean — Heavy", notes: "Wave 3, week 1 of 3. Main lift is a heavy day at 90%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 2, reps: 3, metric: "pct", pct: 90, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time — 'Grace' style",
          exercises: [
          { id: uid(), exercise: "Clean & Jerk", reps: 30, note: "Moderate weight" }
          ],
        }
      ],
    },
    {
      name: "Wk8 Squat — Explosive", notes: "Wave 3, week 2 of 3. Main lift is a explosive day at 75%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 5, reps: 2, metric: "pct", pct: 75, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "4 rounds for time",
          exercises: [
          { id: uid(), exercise: "Run", reps: 0, note: "400m" },
          { id: uid(), exercise: "Air Squat", reps: 20, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk8 Bench — Repetition", notes: "Wave 3, week 2 of 3. Main lift is a repetition day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 8, metric: "pct", pct: 85, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "DB Snatch", reps: 12, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 12, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk8 Deadlift — Heavy", notes: "Wave 3, week 2 of 3. Main lift is a heavy day at 90%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 2, reps: 3, metric: "pct", pct: 90, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "21-15-9 for time",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 0, note: "21-15-9, 50% of 1RM" },
          { id: uid(), exercise: "Toes to Bar", reps: 0, note: "21-15-9" }
          ],
        }
      ],
    },
    {
      name: "Wk8 Oly — Repetition", notes: "Wave 3, week 2 of 3. Main lift is a repetition day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 2, reps: 8, metric: "pct", pct: 85, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "15 min EMOM, rotating exercises",
          exercises: [
          { id: uid(), exercise: "Wall Ball", reps: 10, note: "" },
          { id: uid(), exercise: "Burpees", reps: 10, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 10, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk8 Press — Heavy", notes: "Wave 3, week 2 of 3. Main lift is a heavy day at 90%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 2, reps: 3, metric: "pct", pct: 90, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "Death by — add 1 rep each minute until failure",
          exercises: [
          { id: uid(), exercise: "Burpees", reps: 0, note: "1 rep min 1, 2 reps min 2, etc." }
          ],
        }
      ],
    },
    {
      name: "Wk8 Clean — Explosive", notes: "Wave 3, week 2 of 3. Main lift is a explosive day at 75%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 5, reps: 2, metric: "pct", pct: 75, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "5 rounds for time",
          exercises: [
          { id: uid(), exercise: "Power Clean", reps: 15, note: "Light weight" },
          { id: uid(), exercise: "Box Jump", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk9 Squat — Repetition", notes: "Wave 3, week 3 of 3. Main lift is a repetition day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 8, metric: "pct", pct: 85, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Extension", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Row", reps: 0, note: "1000m" },
          { id: uid(), exercise: "Air Squat", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk9 Bench — Heavy", notes: "Wave 3, week 3 of 3. Main lift is a heavy day at 90%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 3, metric: "pct", pct: 90, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 3, reps: 12 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 10 minutes",
          exercises: [
          { id: uid(), exercise: "Pull-Up", reps: 5, note: "" },
          { id: uid(), exercise: "Push-Up", reps: 10, note: "" },
          { id: uid(), exercise: "Air Squat", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk9 Deadlift — Explosive", notes: "Wave 3, week 3 of 3. Main lift is a explosive day at 75%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 5, reps: 2, metric: "pct", pct: 75, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Leg Curl", sets: 3, reps: 12 },
          { id: uid(), exercise: "Weighted Knee Raise", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 12 minutes",
          exercises: [
          { id: uid(), exercise: "Deadlift", reps: 5, note: "" },
          { id: uid(), exercise: "HSPU", reps: 10, note: "" },
          { id: uid(), exercise: "Box Jump", reps: 15, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk9 Oly — Heavy", notes: "Wave 3, week 3 of 3. Main lift is a heavy day at 90%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Snatch", sets: 2, reps: 3, metric: "pct", pct: 90, note: "Heavy day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 3, reps: 20 },
          { id: uid(), exercise: "Plank Hold", sets: 3, reps: 0, note: "60 sec" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "For time",
          exercises: [
          { id: uid(), exercise: "Snatch", reps: 50, note: "Light weight" },
          { id: uid(), exercise: "Burpees", reps: 50, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk9 Press — Explosive", notes: "Wave 3, week 3 of 3. Main lift is a explosive day at 75%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Overhead Press", sets: 5, reps: 2, metric: "pct", pct: 75, note: "Explosive day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 15 },
          { id: uid(), exercise: "Farmers Walk", sets: 3, reps: 0, note: "40m" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "3 rounds for time",
          exercises: [
          { id: uid(), exercise: "Row", reps: 0, note: "500m" },
          { id: uid(), exercise: "Kettlebell Swing", reps: 21, note: "" }
          ],
        }
      ],
    },
    {
      name: "Wk9 Clean — Repetition", notes: "Wave 3, week 3 of 3. Main lift is a repetition day at 85%.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Clean", sets: 2, reps: 8, metric: "pct", pct: 85, note: "Repetition day" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "GHD Sit-up", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 1, workSec: 0, restSec: 0, note: "AMRAP 15 minutes",
          exercises: [
          { id: uid(), exercise: "Power Clean", reps: 5, note: "" },
          { id: uid(), exercise: "Front Squat", reps: 10, note: "" },
          { id: uid(), exercise: "Sit-up", reps: 15, note: "" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 1 }, { sessionIndex: 2, dayOffset: 2 }, { sessionIndex: 3, dayOffset: 3 }, { sessionIndex: 4, dayOffset: 4 }, { sessionIndex: 5, dayOffset: 5 }, { sessionIndex: 6, dayOffset: 7 }, { sessionIndex: 7, dayOffset: 8 }, { sessionIndex: 8, dayOffset: 9 }, { sessionIndex: 9, dayOffset: 10 }, { sessionIndex: 10, dayOffset: 11 }, { sessionIndex: 11, dayOffset: 12 }, { sessionIndex: 12, dayOffset: 14 }, { sessionIndex: 13, dayOffset: 15 }, { sessionIndex: 14, dayOffset: 16 }, { sessionIndex: 15, dayOffset: 17 }, { sessionIndex: 16, dayOffset: 18 }, { sessionIndex: 17, dayOffset: 19 }, { sessionIndex: 18, dayOffset: 21 }, { sessionIndex: 19, dayOffset: 22 }, { sessionIndex: 20, dayOffset: 23 }, { sessionIndex: 21, dayOffset: 24 }, { sessionIndex: 22, dayOffset: 25 }, { sessionIndex: 23, dayOffset: 26 }, { sessionIndex: 24, dayOffset: 28 }, { sessionIndex: 25, dayOffset: 29 }, { sessionIndex: 26, dayOffset: 30 }, { sessionIndex: 27, dayOffset: 31 }, { sessionIndex: 28, dayOffset: 32 }, { sessionIndex: 29, dayOffset: 33 }, { sessionIndex: 30, dayOffset: 35 }, { sessionIndex: 31, dayOffset: 36 }, { sessionIndex: 32, dayOffset: 37 }, { sessionIndex: 33, dayOffset: 38 }, { sessionIndex: 34, dayOffset: 39 }, { sessionIndex: 35, dayOffset: 40 }, { sessionIndex: 36, dayOffset: 42 }, { sessionIndex: 37, dayOffset: 43 }, { sessionIndex: 38, dayOffset: 44 }, { sessionIndex: 39, dayOffset: 45 }, { sessionIndex: 40, dayOffset: 46 }, { sessionIndex: 41, dayOffset: 47 }, { sessionIndex: 42, dayOffset: 49 }, { sessionIndex: 43, dayOffset: 50 }, { sessionIndex: 44, dayOffset: 51 }, { sessionIndex: 45, dayOffset: 52 }, { sessionIndex: 46, dayOffset: 53 }, { sessionIndex: 47, dayOffset: 54 }, { sessionIndex: 48, dayOffset: 56 }, { sessionIndex: 49, dayOffset: 57 }, { sessionIndex: 50, dayOffset: 58 }, { sessionIndex: 51, dayOffset: 59 }, { sessionIndex: 52, dayOffset: 60 }, { sessionIndex: 53, dayOffset: 61 }],
  },
  {
    id: "bundle-defranco-sb911", name: "SB911 — Strength / Mass / Power (9 Weeks)", notes: "A genuine 3-phase conjugate-method program from the DeFranco Insider SB911 tracker — Strength (weeks 1-3, 2 days/week, work up to a true max 5), Mass (weeks 4-6, 4 days/week, work up to a max 3, high-volume accessory), and Power (weeks 7-9, 4 days/week, work up to a max single, dynamic-effort/explosive work). Each phase's 4-day structure repeats across its 3 weeks by design — the 'work up to a true max' top sets are self-progressing even with an identical prescription, since a real top set naturally climbs as the weeks go on. Main-lift variation choices (bench/squat/deadlift) are pulled from the program's real exercise-variation pool.",
    sessions: [
    {
      name: "SB911 Strength — Max Effort Upper", notes: "Strength phase, week 1 of 3 — same structure repeats for weeks 2-3. The top set is autoregulated: work up to a genuine max 5, which naturally climbs across the 3 weeks even with an identical prescription.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Close-Grip Bench", sets: 1, reps: 5, note: "Multiple warm-up sets, work up to a true max set of 5" },
          { id: uid(), exercise: "Close-Grip Bench", sets: 1, reps: 0, note: "AMRAP — drop weight 10% from the top set above, same movement" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Push-Up", sets: 3, reps: 12, note: "Feet elevated" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 3, reps: 10 },
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 0, note: "Iso-hold Y-W-T's, 10-20 sec at each position" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Side Lateral Raise", sets: 3, reps: 12 },
          { id: uid(), exercise: "Seated DB Curl", sets: 3, reps: 10 }
          ],
        }
      ],
    },
    {
      name: "SB911 Strength — Max Effort Lower", notes: "Strength phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 1, reps: 5, note: "Multiple warm-up sets, work up to a true max set of 5" },
          { id: uid(), exercise: "Front Squat", sets: 1, reps: 0, note: "AMRAP — drop weight 10% from the top set above, same movement" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", sets: 3, reps: 8, note: "Bulgarian split squat" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 0, note: "RKC-style — 5-10 sec max tension, 5-10 sec relaxed, repeat" }
          ],
        }
      ],
    },
    {
      name: "SB911 Strength — Eccentric Upper", notes: "Strength phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Incline Bench Press", sets: 1, reps: 0, note: "6 sec lowering on every rep" },
          { id: uid(), exercise: "Dumbbell Incline Bench Press", sets: 1, reps: 0, note: "AMRAP at 50% of the heaviest weight used above" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Crossover", sets: 3, reps: 12, note: "Tricep-focused cable extension" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 6, note: "Weighted pull-up" },
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 12, note: "With external rotation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Side Lateral Raise", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Upper Body Challenge",
          exercises: [
          { id: uid(), exercise: "Eccentric Barbell Curl", sets: 1, reps: 100, note: "Empty barbell — Upper Body Challenge. Slow, controlled tempo throughout." }
          ],
        }
      ],
    },
    {
      name: "SB911 Strength — Eccentric Lower", notes: "Strength phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", sets: 1, reps: 0, note: "6 sec lowering — Bulgarian split squat" },
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", sets: 1, reps: 0, note: "ALAP deep lunge hold, bodyweight — beat your time" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Hip Thrust", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cossack Squat", sets: 2, reps: 10, note: "Per side — hold onto a bench or rack" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 0 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Lower Body Challenge",
          exercises: [
          { id: uid(), exercise: "Farmers Walk", sets: 1, reps: 0, note: "AFAP in 4 minutes, 50% bodyweight in each hand — Lower Body Challenge" }
          ],
        }
      ],
    },
    {
      name: "SB911 Mass — Max Effort Upper / High Volume", notes: "Mass phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Incline Bench Press", sets: 1, reps: 3, note: "Partial range — work up to a true max set of 3" },
          { id: uid(), exercise: "Incline Bench Press", sets: 1, reps: 0, note: "AMRAP — drop weight 10% from the top set above, same movement" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", sets: 1, reps: 50, note: "~60% of the top weight above" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset — precede with a prone DB row iso-hold",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10, note: "Prone DB rows" },
          { id: uid(), exercise: "Posterior Delt Fly", sets: 3, reps: 12, note: "Prone DB posterior flyes" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Triceps Pushdowns", sets: 1, reps: 100, note: "Rest-pause technique" }
          ],
        }
      ],
    },
    {
      name: "SB911 Mass — Max Effort Lower / High Volume", notes: "Mass phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 1, reps: 3, note: "Work up to a true max set of 3" },
          { id: uid(), exercise: "RDL", sets: 1, reps: 0, note: "AMRAP — drop weight 10% from the top set above, same movement" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset — all four in rotation",
          exercises: [
          { id: uid(), exercise: "Wide Stance Squat or Sumo Deadlift", sets: 3, reps: 8, note: "Choose your RDL variation for the day" },
          { id: uid(), exercise: "Barbell Split Squat", sets: 3, reps: 8 },
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 6, note: "Choose a pull-up variation" },
          { id: uid(), exercise: "Back Extensions", sets: 3, reps: 12, note: "Iso-hold on the last rep of each set, 30 sec" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 12, note: "With external rotation" }
          ],
        }
      ],
    },
    {
      name: "SB911 Mass — Isometric Upper / High Volume", notes: "Mass phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", sets: 3, reps: 6, note: "3 sec pause at the bottom of every rep" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 8, note: "Choose a lat pulldown variation — iso-hold the last rep of each set, ALAP" },
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 10, note: "Choose a face pull variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Weighted Push Ups", sets: 3, reps: 10, note: "Wide grip, 5 sec eccentric" },
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Upper Body Challenge",
          exercises: [
          { id: uid(), exercise: "Eccentric Barbell Curl", sets: 1, reps: 50, note: "30-40% bodyweight, rest-pause — Upper Body Challenge" }
          ],
        }
      ],
    },
    {
      name: "SB911 Mass — Isometric Lower / High Volume", notes: "Mass phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", sets: 3, reps: 6, note: "3 sec pause at the bottom — Bulgarian split squat" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Trap Bar Deadlift w/ Chains", sets: 3, reps: 8, note: "Or your preferred deadlift variation" },
          { id: uid(), exercise: "Dumbbell Shrugs", sets: 3, reps: 12, note: "Choose a shrug variation" },
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Stability Ball Crunch", sets: 3, reps: 15 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Lower Body Challenge",
          exercises: [
          { id: uid(), exercise: "Goblet Squat", sets: 1, reps: 10, note: "1½ rep — focus on mobility" },
          { id: uid(), exercise: "Goblet Squat", sets: 1, reps: 0, note: "AMRAP at 30-40% bodyweight — Lower Body Challenge" }
          ],
        }
      ],
    },
    {
      name: "SB911 Power — Max Effort Upper", notes: "Power phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 1, reps: 1, note: "Swiss bar or standard bar — work up to a true max single" },
          { id: uid(), exercise: "Bench Press", sets: 1, reps: 0, note: "AMRAP — drop weight 10% from the top set above, same movement" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Push-Up", sets: 3, reps: 12, note: "Sliders — flye pattern" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 5, note: "Weighted chin-up" },
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 12, note: "With external rotation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Side Lateral Raise", sets: 3, reps: 7, note: "DeFranco Shoulder Series 2.0 — 7 iso-dyn lat raise, 7 Cuban press, 7 curl-lat raise-extend" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Hammer Curl", sets: 3, reps: 10 }
          ],
        }
      ],
    },
    {
      name: "SB911 Power — Max Effort Lower", notes: "Power phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Wide Stance Squat or Sumo Deadlift", sets: 1, reps: 1, note: "Work up to a true max single" },
          { id: uid(), exercise: "Wide Stance Squat or Sumo Deadlift", sets: 1, reps: 0, note: "AMRAP — drop weight 10% from the top set above, same movement" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Step Ups", sets: 3, reps: 8 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8, note: "Hip-dominant variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 12 }
          ],
        }
      ],
    },
    {
      name: "SB911 Power — Dynamic Effort (Explosive) Upper", notes: "Power phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Weighted Push Ups", sets: 5, reps: 3, note: "Plyo push-up — explosive intent on every rep" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Superset",
          exercises: [
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 6, note: "Choose a pull-up/chin-up variation" },
          { id: uid(), exercise: "Lat Pulldown", sets: 3, reps: 10, note: "Choose a lat pulldown variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cable Crossover", sets: 3, reps: 12, note: "Machine flye pattern" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Posterior Delt Fly", sets: 3, reps: 12 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Upper Body Challenge",
          exercises: [
          { id: uid(), exercise: "Push-Up", sets: 1, reps: 0, note: "AMRAP in 4 minutes — Upper Body Challenge" }
          ],
        }
      ],
    },
    {
      name: "SB911 Power — Dynamic Effort (Explosive) Lower", notes: "Power phase, week 1 of 3 — same structure repeats for weeks 2-3.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Jumps/Throws", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Box Jump", sets: 5, reps: 3, note: "Explosive intent on every rep" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 5, reps: 2, note: "Speed deadlift — 50-75% of 1RM, move it fast" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8, note: "Hip-dominant variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Farmers Walk", sets: 1, reps: 0, note: "Forward/backward — 5-10 yards forward, stop, 5-10 yards back = 1 rep" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Lower Body Challenge",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 1, reps: 0, note: "AMRAP, bodyweight on the bar — Lower Body Challenge" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 1 }, { sessionIndex: 2, dayOffset: 3 }, { sessionIndex: 3, dayOffset: 4 }, { sessionIndex: 0, dayOffset: 7 }, { sessionIndex: 1, dayOffset: 8 }, { sessionIndex: 2, dayOffset: 10 }, { sessionIndex: 3, dayOffset: 11 }, { sessionIndex: 0, dayOffset: 14 }, { sessionIndex: 1, dayOffset: 15 }, { sessionIndex: 2, dayOffset: 17 }, { sessionIndex: 3, dayOffset: 18 }, { sessionIndex: 4, dayOffset: 21 }, { sessionIndex: 5, dayOffset: 22 }, { sessionIndex: 6, dayOffset: 24 }, { sessionIndex: 7, dayOffset: 25 }, { sessionIndex: 4, dayOffset: 28 }, { sessionIndex: 5, dayOffset: 29 }, { sessionIndex: 6, dayOffset: 31 }, { sessionIndex: 7, dayOffset: 32 }, { sessionIndex: 4, dayOffset: 35 }, { sessionIndex: 5, dayOffset: 36 }, { sessionIndex: 6, dayOffset: 38 }, { sessionIndex: 7, dayOffset: 39 }, { sessionIndex: 8, dayOffset: 42 }, { sessionIndex: 9, dayOffset: 43 }, { sessionIndex: 10, dayOffset: 45 }, { sessionIndex: 11, dayOffset: 46 }, { sessionIndex: 8, dayOffset: 49 }, { sessionIndex: 9, dayOffset: 50 }, { sessionIndex: 10, dayOffset: 52 }, { sessionIndex: 11, dayOffset: 53 }, { sessionIndex: 8, dayOffset: 56 }, { sessionIndex: 9, dayOffset: 57 }, { sessionIndex: 10, dayOffset: 59 }, { sessionIndex: 11, dayOffset: 60 }],
  },
  {
    id: "bundle-defranco-titan-p1", name: "Titan 12-Week Program — Phase 1 (Weeks 1-4)", notes: "DeFranco's Titan program — 3 full-body-adjacent days/week built around undulating main lifts (Deadlift, Bench Press, Heavy Back), each paired with a dropset, an E2MOM circuit, weakpoint training, and a finisher. This is Phase 1 (Option 1: keep your main lifts the same throughout). Phase 2 (Weeks 5-8) repeats this exact structure with the deadlift % up 5% and bench/row % up 2.5% from Week 1's numbers; Phase 3 (Weeks 9-12) repeats it again with deadlift up 10% and bench/row up 5%. Percentages are estimated from the program's own calculator formulas (roughly 91% for a 3RM, 86% for a 5RM, 83% for a 6RM, 79% for an 8RM) — resolves against each athlete's tested max for that lift.",
    sessions: [
    {
      name: "Titan Week 1 — Workout 1 (Deadlift)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 8, reps: 3, metric: "pct", pct: 91 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Goblet Squat", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight. Rest 120 sec after your last deadlift set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. Perform the rep count, rest the remainder of the 2-min block, then move to the next exercise. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Overhead Press", reps: 8, note: "Military Press Variation" },
          { id: uid(), exercise: "Lat Pulldown", reps: 10, note: "" },
          { id: uid(), exercise: "Seated Row", reps: 10, note: "" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — calves and grip.",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Seated Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Plate Pinch", sets: 3, reps: 0, note: "ALAP — as long as possible" },
          { id: uid(), exercise: "DB Farmers Hold", sets: 3, reps: 0, note: "ALAP — as long as possible" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 90 sec between rounds. Nasal breathing only.",
          exercises: [
          { id: uid(), exercise: "Treadmill Sprint", reps: 0, note: "8 sec, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "30 sec" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 1 — Workout 2 (Bench Press)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 4, reps: 6, metric: "pct", pct: 83 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", sets: 1, reps: 0, note: "Incline. AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last bench set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Back Squat", reps: 8, note: "" },
          { id: uid(), exercise: "Romanian Deadlift", reps: 10, note: "Or rack pull / back raise variation" },
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", reps: 8, note: "Per leg — or a lunge/heavy prowler variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — Gun Show.",
          exercises: [
          { id: uid(), exercise: "Seated DB Curl", sets: 3, reps: 5, note: "45° angle, 5 sec iso-hold each rep" },
          { id: uid(), exercise: "Tricep Extension", sets: 1, reps: 100, note: "Rest-pause technique — rest as short as possible before continuing." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 5, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec overhead" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec front rack" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec at sides" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 1 — Workout 3 (Heavy Back)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 3, reps: 8, metric: "pct", pct: 79, note: "Or your favorite heavy back variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last row set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Dumbbell Clean and Press", reps: 8, note: "" },
          { id: uid(), exercise: "Hip Thrust", reps: 15, note: "10-20 reps — or a DB/KB swing variation" },
          { id: uid(), exercise: "Weighted Push Ups", reps: 15, note: "10-20 reps — weighted push-up variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — lower and upper body mobility.",
          exercises: [
          { id: uid(), exercise: "Cossack Squat", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "High Box Step-up", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 0, note: "ALAP with 5 long breaths" },
          { id: uid(), exercise: "Barbell Overhead Carry", sets: 3, reps: 0, note: "40 yards" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Bear Crawl", reps: 0, note: "20 feet, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "10 sec, no rest" },
          { id: uid(), exercise: "Flutter Kicks", reps: 50, note: "Alternating reps" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 2 — Workout 1 (Deadlift)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 5, reps: 5, metric: "pct", pct: 86 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Goblet Squat", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight. Rest 120 sec after your last deadlift set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. Perform the rep count, rest the remainder of the 2-min block, then move to the next exercise. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Overhead Press", reps: 8, note: "Military Press Variation" },
          { id: uid(), exercise: "Lat Pulldown", reps: 10, note: "" },
          { id: uid(), exercise: "Seated Row", reps: 10, note: "" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — calves and grip.",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Seated Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Plate Pinch", sets: 3, reps: 0, note: "ALAP — as long as possible" },
          { id: uid(), exercise: "DB Farmers Hold", sets: 3, reps: 0, note: "ALAP — as long as possible" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 90 sec between rounds. Nasal breathing only.",
          exercises: [
          { id: uid(), exercise: "Treadmill Sprint", reps: 0, note: "8 sec, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "30 sec" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 2 — Workout 2 (Bench Press)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 8, reps: 3, metric: "pct", pct: 91 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", sets: 1, reps: 0, note: "Incline. AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last bench set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Back Squat", reps: 8, note: "" },
          { id: uid(), exercise: "Romanian Deadlift", reps: 10, note: "Or rack pull / back raise variation" },
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", reps: 8, note: "Per leg — or a lunge/heavy prowler variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — Gun Show.",
          exercises: [
          { id: uid(), exercise: "Seated DB Curl", sets: 3, reps: 5, note: "45° angle, 5 sec iso-hold each rep" },
          { id: uid(), exercise: "Tricep Extension", sets: 1, reps: 100, note: "Rest-pause technique — rest as short as possible before continuing." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 5, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec overhead" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec front rack" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec at sides" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 2 — Workout 3 (Heavy Back)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 4, reps: 6, metric: "pct", pct: 83, note: "Or your favorite heavy back variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last row set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Dumbbell Clean and Press", reps: 8, note: "" },
          { id: uid(), exercise: "Hip Thrust", reps: 15, note: "10-20 reps — or a DB/KB swing variation" },
          { id: uid(), exercise: "Weighted Push Ups", reps: 15, note: "10-20 reps — weighted push-up variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — lower and upper body mobility.",
          exercises: [
          { id: uid(), exercise: "Cossack Squat", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "High Box Step-up", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 0, note: "ALAP with 5 long breaths" },
          { id: uid(), exercise: "Barbell Overhead Carry", sets: 3, reps: 0, note: "40 yards" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Bear Crawl", reps: 0, note: "20 feet, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "10 sec, no rest" },
          { id: uid(), exercise: "Flutter Kicks", reps: 50, note: "Alternating reps" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 3 — Workout 1 (Deadlift)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 3, reps: 8, metric: "pct", pct: 79 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Goblet Squat", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight. Rest 120 sec after your last deadlift set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. Perform the rep count, rest the remainder of the 2-min block, then move to the next exercise. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Overhead Press", reps: 8, note: "Military Press Variation" },
          { id: uid(), exercise: "Lat Pulldown", reps: 10, note: "" },
          { id: uid(), exercise: "Seated Row", reps: 10, note: "" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — calves and grip.",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Seated Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Plate Pinch", sets: 3, reps: 0, note: "ALAP — as long as possible" },
          { id: uid(), exercise: "DB Farmers Hold", sets: 3, reps: 0, note: "ALAP — as long as possible" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 90 sec between rounds. Nasal breathing only.",
          exercises: [
          { id: uid(), exercise: "Treadmill Sprint", reps: 0, note: "8 sec, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "30 sec" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 3 — Workout 2 (Bench Press)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 5, reps: 5, metric: "pct", pct: 86 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", sets: 1, reps: 0, note: "Incline. AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last bench set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Back Squat", reps: 8, note: "" },
          { id: uid(), exercise: "Romanian Deadlift", reps: 10, note: "Or rack pull / back raise variation" },
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", reps: 8, note: "Per leg — or a lunge/heavy prowler variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — Gun Show.",
          exercises: [
          { id: uid(), exercise: "Seated DB Curl", sets: 3, reps: 5, note: "45° angle, 5 sec iso-hold each rep" },
          { id: uid(), exercise: "Tricep Extension", sets: 1, reps: 100, note: "Rest-pause technique — rest as short as possible before continuing." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 5, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec overhead" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec front rack" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec at sides" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 3 — Workout 3 (Heavy Back)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 8, reps: 3, metric: "pct", pct: 91, note: "Or your favorite heavy back variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last row set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Dumbbell Clean and Press", reps: 8, note: "" },
          { id: uid(), exercise: "Hip Thrust", reps: 15, note: "10-20 reps — or a DB/KB swing variation" },
          { id: uid(), exercise: "Weighted Push Ups", reps: 15, note: "10-20 reps — weighted push-up variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — lower and upper body mobility.",
          exercises: [
          { id: uid(), exercise: "Cossack Squat", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "High Box Step-up", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 0, note: "ALAP with 5 long breaths" },
          { id: uid(), exercise: "Barbell Overhead Carry", sets: 3, reps: 0, note: "40 yards" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Bear Crawl", reps: 0, note: "20 feet, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "10 sec, no rest" },
          { id: uid(), exercise: "Flutter Kicks", reps: 50, note: "Alternating reps" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 4 — Workout 1 (Deadlift)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 4, reps: 6, metric: "pct", pct: 83 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Goblet Squat", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight. Rest 120 sec after your last deadlift set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. Perform the rep count, rest the remainder of the 2-min block, then move to the next exercise. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Overhead Press", reps: 8, note: "Military Press Variation" },
          { id: uid(), exercise: "Lat Pulldown", reps: 10, note: "" },
          { id: uid(), exercise: "Seated Row", reps: 10, note: "" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — calves and grip.",
          exercises: [
          { id: uid(), exercise: "Standing Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Seated Calf Raise", sets: 4, reps: 20 },
          { id: uid(), exercise: "Plate Pinch", sets: 3, reps: 0, note: "ALAP — as long as possible" },
          { id: uid(), exercise: "DB Farmers Hold", sets: 3, reps: 0, note: "ALAP — as long as possible" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 90 sec between rounds. Nasal breathing only.",
          exercises: [
          { id: uid(), exercise: "Treadmill Sprint", reps: 0, note: "8 sec, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "30 sec" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 4 — Workout 2 (Bench Press)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 8, metric: "pct", pct: 79 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Bench Press", sets: 1, reps: 0, note: "Incline. AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last bench set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Back Squat", reps: 8, note: "" },
          { id: uid(), exercise: "Romanian Deadlift", reps: 10, note: "Or rack pull / back raise variation" },
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", reps: 8, note: "Per leg — or a lunge/heavy prowler variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — Gun Show.",
          exercises: [
          { id: uid(), exercise: "Seated DB Curl", sets: 3, reps: 5, note: "45° angle, 5 sec iso-hold each rep" },
          { id: uid(), exercise: "Tricep Extension", sets: 1, reps: 100, note: "Rest-pause technique — rest as short as possible before continuing." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 5, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec overhead" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec front rack" },
          { id: uid(), exercise: "Farmers Walk", reps: 0, note: "30 sec at sides" }
          ],
        }
      ],
    },
    {
      name: "Titan Week 4 — Workout 3 (Heavy Back)", notes: "Pyramid up in weight across your working sets to hit the target % on the last set(s). Dropset immediately after, then the E2MOM block, weakpoint work, and finisher.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 5, reps: 5, metric: "pct", pct: 86, note: "Or your favorite heavy back variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 1, reps: 0, note: "AMRAP with ~30% of bodyweight in each hand. Rest 120 sec after your last row set, then hit this dropset." }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 4, workSec: 0, restSec: 0, note: "E2MOM — Every 2 Minutes On the Minute. 4 rounds = 24 min total.",
          exercises: [
          { id: uid(), exercise: "Dumbbell Clean and Press", reps: 8, note: "" },
          { id: uid(), exercise: "Hip Thrust", reps: 15, note: "10-20 reps — or a DB/KB swing variation" },
          { id: uid(), exercise: "Weighted Push Ups", reps: 15, note: "10-20 reps — weighted push-up variation" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "Weakpoint training — lower and upper body mobility.",
          exercises: [
          { id: uid(), exercise: "Cossack Squat", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "High Box Step-up", sets: 3, reps: 6, note: "5-8 reps per leg" },
          { id: uid(), exercise: "Static Hang", sets: 3, reps: 0, note: "ALAP with 5 long breaths" },
          { id: uid(), exercise: "Barbell Overhead Carry", sets: 3, reps: 0, note: "40 yards" }
          ],
        },
        {
          id: uid(), type: "circuit", category: "Conditioning", rounds: 10, workSec: 0, restSec: 0, note: "Finisher — rest 120 sec between rounds.",
          exercises: [
          { id: uid(), exercise: "Bear Crawl", reps: 0, note: "20 feet, no rest" },
          { id: uid(), exercise: "Push-up Plank Hold", reps: 0, note: "10 sec, no rest" },
          { id: uid(), exercise: "Flutter Kicks", reps: 50, note: "Alternating reps" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 2 }, { sessionIndex: 2, dayOffset: 4 }, { sessionIndex: 3, dayOffset: 7 }, { sessionIndex: 4, dayOffset: 9 }, { sessionIndex: 5, dayOffset: 11 }, { sessionIndex: 6, dayOffset: 14 }, { sessionIndex: 7, dayOffset: 16 }, { sessionIndex: 8, dayOffset: 18 }, { sessionIndex: 9, dayOffset: 21 }, { sessionIndex: 10, dayOffset: 23 }, { sessionIndex: 11, dayOffset: 25 }],
  },
  {
    id: "bundle-defranco-cushing", name: "Brian Cushing In-Season Week", notes: "A real NFL linebacker's in-season training week from DeFranco's Insider program — 4 days, built to maintain strength and stay healthy through a season without piling on fatigue. Monday/Thursday are full-body-leaning, Tuesday is the heaviest lower day, Friday is intentionally light (arms and recovery).",
    sessions: [
    {
      name: "Cushing In-Season — Monday (Recovery / Upper Strength)", notes: "Warm-up: foam roll full body, supine bilateral internal rotation stretch 60s, side-lying windmills x10/side, Y-handcuffs x10, prone shoulder rotations w/ band x10, mini band face pull + external rotation x10, static lat stretch 20s/side, then Prowler Tempos (45lb) w/ push-ups & band pull-aparts x6 reps.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 3, metric: "pct", pct: 70, note: "Plus 2 chains per side (% doesn't include chains). Last set 3+." },
          { id: uid(), exercise: "Banded Underhand Pullaparts", sets: 1, reps: 70, note: "70 total reps" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Seated Cable Row", sets: 3, reps: 11, note: "3x10-12" },
          { id: uid(), exercise: "Cable Face Pulls", sets: 3, reps: 11, note: "3x10-12" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Side Lateral Raise", sets: 3, reps: 11, note: "2-3x10-12, thumbs up" },
          { id: uid(), exercise: "Dumbbell Shrugs", sets: 3, reps: 13, note: "2-3x12-15" }
          ],
        }
      ],
    },
    {
      name: "Cushing In-Season — Tuesday (Lower Body)", notes: "Warm-up: DeFranco's Limber 11, weighted calf/Achilles stretch 30-60s each side holding a 35lb DB, banded ankle mobility drills, TKE's 3x15 each leg, box jumps 60-70% max height 3x5.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Safety Bar Box Squat", sets: 4, reps: 3, note: "Plus 2 chains per side (% doesn't include chains). 55%x3, 60%x3, 65%x3, 70%x3 — ramp up across the 4 sets." }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Sled Power Walk", sets: 5, reps: 0, note: "4-6 sets x 30 yards, upright power walk" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Banded Dorsiflexion", sets: 3, reps: 15, note: "Each foot" },
          { id: uid(), exercise: "Band Pallof Press", sets: 3, reps: 0, note: "Anti-rotation alphabet w/ band, 3 sets each side" },
          { id: uid(), exercise: "Stability Ball Crunch", sets: 3, reps: 15 }
          ],
        }
      ],
    },
    {
      name: "Cushing In-Season — Thursday (Full Body)", notes: "Warm-up: foam roll full body, kneeling hip flexor/quad stretch w/ band (rear foot elevated) x10 glute contractions each side, rocking frog groin stretch w/ band x10 each side, seated piriformis/glute stretch 30s each side, banded pec stretch 30s each side, static lat stretch 30s each side, prone shoulder rotations w/ band x10, bilateral external rotation w/ band x10, TKE's 2x20 each leg.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Floor Press", sets: 3, reps: 8, note: "Palms in. Last set 8+." },
          { id: uid(), exercise: "Band Pull-Aparts", sets: 1, reps: 100, note: "100 total reps" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Cossack Squat", sets: 3, reps: 8, note: "With chain around neck — or Lateral Sled Drag 3x30yd" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Lat Pulldown", sets: 3, reps: 11, note: "3x10-12" },
          { id: uid(), exercise: "Cable Crossover", sets: 3, reps: 11, note: "3x10-12" },
          { id: uid(), exercise: "Side Lateral Raise", sets: 3, reps: 6, note: "Side-lying, 3 sec iso-hold at top" }
          ],
        }
      ],
    },
    {
      name: "Cushing In-Season — Friday (Arms / Recovery)", notes: "Light warm-up of choice, conclude w/ TKE's 2x20 and band pull-aparts 2x20. A lighter day intentionally — arms and recovery work only.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Eccentric Barbell Curl", sets: 2, reps: 5, note: "6 sec lowering" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Single Arm Preacher Curl", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Banded Curls", sets: 1, reps: 100, note: "100 total reps" },
          { id: uid(), exercise: "Triceps Pushdowns", sets: 1, reps: 100, note: "Banded, 100 total reps" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Push-up Plank Hold", sets: 2, reps: 0, note: "Plank series, 2 sets" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 1 }, { sessionIndex: 2, dayOffset: 3 }, { sessionIndex: 3, dayOffset: 4 }],
  },
  {
    id: "bundle-defranco-thunder-lightning", name: "Thunder & Lightning", notes: "A single lower body strength/power session from DeFranco's Insider program.",
    sessions: [
    {
      name: "Thunder & Lightning — Lower Body Strength/Power", notes: "Warm-up: DeFranco's 'Best Lower Body Warm-up Ever 2.0'.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Trap Bar Deadlift w/ Chains", sets: 30, reps: 1, note: "1 rep every 30 sec for 15 min straight. Athletes in the source video used ~55% bar weight + 4 chains per side, with a thick-handled trap bar for added grip work." }
          ],
        },
        {
          id: uid(), type: "sets", category: "Jumps/Throws", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Double Hurdle Hop onto Box", sets: 5, reps: 2 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Reverse Lunge", sets: 3, reps: 6, note: "Band-resisted knee lift, front foot elevated. Stand on a 4in box for greater ROM." }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dynamic Band-Resisted Barbell RDL", sets: 3, reps: 0, note: "10 sec AMRAP" },
          { id: uid(), exercise: "Pike-up", sets: 3, reps: 15, note: "Feet on a stability ball" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }],
  },
  {
    id: "bundle-defranco-unloaded20", name: "Unloaded 20", notes: "A single full-body bodyweight strength workout from DeFranco's Insider program — no equipment needed.",
    sessions: [
    {
      name: "Unloaded 20 — Full Body Bodyweight", notes: "Warm-up: segmented catcamels x5, standing spinal rotations x5 each way, neck rotations x5 each way, standing hip rotations x5 each way each side, standing shoulder rotations x5 each way each side, scap rotations x5 each way, jumping jacks 2x10sec, bodyweight squats x10, seal jacks 2x10sec, tin man kicks x10 each leg, push-ups x10, band TKEs x15 each leg, band face pulls x15, rolling V-sit x10.",
      blocks: [
        {
          id: uid(), type: "circuit", category: "Bodyweight", rounds: 1, workSec: 0, restSec: 0, note: "Straight through, bodyweight only.",
          exercises: [
          { id: uid(), exercise: "1 1/2 Rep Goblet Squats", reps: 20, note: "Bodyweight only" },
          { id: uid(), exercise: "Romanian Deadlift", reps: 20, note: "Overhead Good Morning variation, bodyweight" },
          { id: uid(), exercise: "Single Leg Pistol Squat to Bench", reps: 10, note: "Per leg" },
          { id: uid(), exercise: "Single Leg RDL", reps: 10, note: "Per leg" },
          { id: uid(), exercise: "Push-Up", reps: 20, note: "Yoga push-up" },
          { id: uid(), exercise: "Pull-Up", reps: 20, note: "" },
          { id: uid(), exercise: "Cossack Squat", reps: 10, note: "Standing hip rotations over foam roller, per leg" },
          { id: uid(), exercise: "Hanging Knee Raise", reps: 20, note: "YTWL variation, each position" },
          { id: uid(), exercise: "Stability Ball Crunch", reps: 10, note: "McGill sit-up, each side" },
          { id: uid(), exercise: "Flutter Kicks", reps: 10, note: "Opposite ankle touch, each side" },
          { id: uid(), exercise: "Hanging 3-Way Leg Raise", reps: 20, note: "V-ups" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }],
  },
  {
    id: "bundle-defranco-gamespeed", name: "Gamespeed", notes: "A single speed/agility session from DeFranco's Insider program — multi-directional starts and change of direction work.",
    sessions: [
    {
      name: "Gamespeed — Multi-Directional Speed", notes: "Warm-up: catcamels x15, ankle mobility flow 1-2min, 90-90 hip mobility flow 2-3min, frog rocking mobility 1-2min, face the wall squats x10, hip hinges x10, walking lunge 10yd fwd & back, high knee run 2x10yd, standing hip circles x10 each way each leg, gate skips 10yd fwd & back, leg swings 10 reps fwd & sideways each leg, tin man skip 2x10yd, side lunge x10 each way.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Speed", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Multi-Directional Push Up Start", sets: 2, reps: 0, note: "2x10 yards each direction — linear, lateral, reverse. Rest = walk back to the start." }
          ],
        },
        {
          id: uid(), type: "sets", category: "Speed", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Multi-Directional Rolling Push Up Start", sets: 2, reps: 0, note: "2x10 yards each direction. Rest = walk back to the start." }
          ],
        },
        {
          id: uid(), type: "sets", category: "Jumps/Throws", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Multi-Directional Broad Jump", sets: 5, reps: 0, note: "5 rounds each way — 1 way = forward/left/forward/right/forward" },
          { id: uid(), exercise: "Med Ball Rotational Throw", sets: 5, reps: 5, note: "Against a wall, each side, 10lb med ball" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "DB Goblet 4-Way Lunge", sets: 4, reps: 0, note: "4 sets x 2 cycles each side" },
          { id: uid(), exercise: "Hanging 3-Way Leg Raise", sets: 4, reps: 0, note: "4 sets x 3 cycles" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }],
  },
  {
    id: "bundle-5x5-thisiswhyimfit", name: "5x5 Workout Program (This Is Why I'm Fit)", notes: "A 7-day rotating split (train/rest/train/rest/train/rest/train) — Chest, Back, Legs, then a full-body Auxiliary day. Main lifts are 5 sets of 5: the first 3 sets are a warm-up ramp with reps in reserve, the last 2 are working sets pushed close to failure. Accessory work is 5 sets of 6-8. Progressive overload — add weight when you can, especially early on.",
    sessions: [
    {
      name: "Day 1 — Chest", notes: "Sets 1-3 are warm-ups — leave several reps in the tank, resting 1-2 min between them. Sets 4-5 are your working sets — rest 3-5 min before each and push the last set(s) to failure or close to it. Add weight from last time when you can.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Chest Press", sets: 5, reps: 5, note: "Smith Machine, Chest Press Machine, Barbell, or Dumbbells" },
          { id: uid(), exercise: "High Incline Press", sets: 5, reps: 5, note: "Smith Machine, Chest Press Machine, Barbell, or Dumbbells" },
          { id: uid(), exercise: "Side Lateral Raise", sets: 5, reps: 6, repsMax: 8, note: "Cables (cuffs preferred), Dumbbells, or Side Lateral Machine" },
          { id: uid(), exercise: "Triceps Pushdowns", sets: 5, reps: 6, repsMax: 8, note: "Seated Triceps Machine, or Cable Machine (straight/EZ Curl/V Bar)" }
          ],
        }
      ],
    },
    {
      name: "Day 3 — Back", notes: "Sets 1-3 are warm-ups — leave several reps in the tank, resting 1-2 min between them. Sets 4-5 are your working sets — rest 3-5 min before each and push the last set(s) to failure or close to it. Add weight from last time when you can.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Deadlift", sets: 5, reps: 5, note: "Or a Row variation — Barbell, Trap Bar, or Seated Row Machine" },
          { id: uid(), exercise: "Lat Pulldown", sets: 5, reps: 6, repsMax: 8, note: "Cables (shoulder width or wider), or Pulldown Machine" },
          { id: uid(), exercise: "Kelso Shrugs", sets: 5, reps: 6, repsMax: 8, note: "Smith Machine, or T-Bar Row Machine" },
          { id: uid(), exercise: "Upright Row", sets: 5, reps: 6, repsMax: 8, note: "Cable Machine, Barbell, or Dumbbells" }
          ],
        }
      ],
    },
    {
      name: "Day 5 — Legs", notes: "Sets 1-3 are warm-ups — leave several reps in the tank, resting 1-2 min between them. Sets 4-5 are your working sets — rest 3-5 min before each and push the last set(s) to failure or close to it. Add weight from last time when you can.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 5, reps: 5, note: "Or Leg Press variation — Pendulum, Belt Squat, Hack, or Leg Sled" },
          { id: uid(), exercise: "Leg Extension", sets: 5, reps: 6, repsMax: 8, note: "Leg Extension Machine" },
          { id: uid(), exercise: "Leg Curl", sets: 5, reps: 6, repsMax: 8, note: "Leg Curl Machine (seated preferred)" },
          { id: uid(), exercise: "Hip Adduction", sets: 5, reps: 6, repsMax: 8, note: "Hip Adduction Machine, or Cables with Ankle Cuff" }
          ],
        }
      ],
    },
    {
      name: "Day 7 — Auxiliary", notes: "Sets 1-3 are warm-ups — leave several reps in the tank, resting 1-2 min between them. Sets 4-5 are your working sets — rest 3-5 min before each and push the last set(s) to failure or close to it. Add weight from last time when you can.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Wide Stance Squat or Sumo Deadlift", sets: 5, reps: 5, note: "Belt Squat, Barbell, or Leg Press (needs a wide-enough platform)" },
          { id: uid(), exercise: "Close-Grip Bench", sets: 5, reps: 5, note: "Smith Machine, Chest Press Machine (narrow grip), or Barbell" },
          { id: uid(), exercise: "Alternative Row Variation", sets: 5, reps: 5, note: "T-Bar Row Machine, Seated Row Machine (chest support), or Pulldowns" },
          { id: uid(), exercise: "Posterior Delt Fly", sets: 5, reps: 6, repsMax: 8, note: "Cable Machine (unilateral or both arms, cuffs recommended), or Posterior Fly Machine" },
          { id: uid(), exercise: "Hammer Curl", sets: 5, reps: 6, repsMax: 8, note: "Cable Machine (rope attachment), or Dumbbells" },
          { id: uid(), exercise: "Triceps Pushdowns", sets: 5, reps: 6, repsMax: 8, note: "Seated Triceps Machine, or Cable Machine (attachment of choice)" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 2 }, { sessionIndex: 2, dayOffset: 4 }, { sessionIndex: 3, dayOffset: 6 }],
  },
  {
    id: "bundle-2day-lu", name: "2 Day Lower / Upper", notes: "From the Program Design Templates course pack — a classic 2x/week split.",
    sessions: [
    {
      name: "Lower Body (2-Day L/U)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 3, reps: 5 },
          { id: uid(), exercise: "Box Jump", sets: 3, reps: 4 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Dumbbell Split Squat", sets: 2, reps: 8, note: "each leg" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Single Leg Hip Bridge", sets: 3, reps: 10, note: "each leg" },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 30, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Upper Body (2-Day L/U)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 5 },
          { id: uid(), exercise: "Medicine Ball Scoop Toss", sets: 3, reps: 4, note: "each way" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 8 },
          { id: uid(), exercise: "Dumbbell Incline Bench Press", sets: 3, reps: 8 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10, note: "each arm" },
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 10 }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 3 }],
  },
  {
    id: "bundle-2day-tb", name: "2 Day Total Body", notes: "From the Program Design Templates course pack.",
    sessions: [
    {
      name: "Total Body Day 1 (2-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 3, reps: 5 },
          { id: uid(), exercise: "Box Jump", sets: 4, reps: 3 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 6 },
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 8, note: "each arm" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 20, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Total Body Day 2 (2-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Reverse Lunge", sets: 3, reps: 6, note: "each leg" },
          { id: uid(), exercise: "Medicine Ball Scoop Toss", sets: 3, reps: 5, note: "each side" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Incline Bench Press", sets: 4, reps: 6 },
          { id: uid(), exercise: "Chin Ups", sets: 4, reps: 8 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Extensions", sets: 3, reps: 10 },
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 10 }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 3 }],
  },
  {
    id: "bundle-3day-lut", name: "3 Day Lower / Upper / Total", notes: "From the Program Design Templates course pack.",
    sessions: [
    {
      name: "Lower Body (3-Day L/U/T)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 3, reps: 5 },
          { id: uid(), exercise: "Box Jump", sets: 3, reps: 4 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Dumbbell Split Squat", sets: 2, reps: 8, note: "each leg" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Single Leg Hip Bridge", sets: 3, reps: 10, note: "each leg" },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 30, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Upper Body (3-Day L/U/T)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 5 },
          { id: uid(), exercise: "Medicine Ball Scoop Toss", sets: 3, reps: 4, note: "each way" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 8 },
          { id: uid(), exercise: "Dumbbell Incline Bench Press", sets: 2, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10, note: "each arm" },
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 10 }
          ],
        }
      ],
    },
    {
      name: "Total Body (3-Day L/U/T)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Reverse Lunge", sets: 3, reps: 6, note: "each leg" },
          { id: uid(), exercise: "Single Leg Lateral Box Hop", sets: 3, reps: 4, note: "each way" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell Shoulder Press", sets: 3, reps: 8 },
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Extensions", sets: 3, reps: 10 },
          { id: uid(), exercise: "Band Pallof Press", sets: 3, reps: 8, note: "each way" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 2 }, { sessionIndex: 2, dayOffset: 4 }],
  },
  {
    id: "bundle-3day-tb", name: "3 Day Total Body", notes: "From the Program Design Templates course pack.",
    sessions: [
    {
      name: "Total Body Day 1 (3-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 3, reps: 6 },
          { id: uid(), exercise: "Box Jump", sets: 3, reps: 5 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 6 },
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 8, note: "each arm" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 20, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Total Body Day 2 (3-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Reverse Lunge", sets: 3, reps: 6, note: "each leg" },
          { id: uid(), exercise: "Medicine Ball Scoop Toss", sets: 3, reps: 5, note: "each side" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Incline Bench Press", sets: 3, reps: 8 },
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Extensions", sets: 3, reps: 10 },
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 12 }
          ],
        }
      ],
    },
    {
      name: "Total Body Day 3 (3-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 8 },
          { id: uid(), exercise: "Single Leg Lateral Box Jump", sets: 4, reps: 3, note: "each leg" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Seated Dumbbell Shoulder Press", sets: 3, reps: 10 },
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Hip Thrust", sets: 3, reps: 8 },
          { id: uid(), exercise: "Shoulder Taps", sets: 3, reps: 5, note: "each arm" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 2 }, { sessionIndex: 2, dayOffset: 4 }],
  },
  {
    id: "bundle-4day-lu", name: "4 Day Lower / Upper", notes: "From the Program Design Templates course pack.",
    sessions: [
    {
      name: "Lower Body A (4-Day L/U)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 3, reps: 5 },
          { id: uid(), exercise: "Box Jump", sets: 3, reps: 4 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Dumbbell Split Squat", sets: 2, reps: 8, note: "each leg" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Single Leg Hip Bridge", sets: 3, reps: 10, note: "each leg" },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 30, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Upper Body A (4-Day L/U)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 5 },
          { id: uid(), exercise: "Medicine Ball Scoop Toss", sets: 3, reps: 4, note: "each way" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 8 },
          { id: uid(), exercise: "Dumbbell Incline Bench Press", sets: 2, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10, note: "each arm" },
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 12 }
          ],
        }
      ],
    },
    {
      name: "Lower Body B (4-Day L/U)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Reverse Lunge", sets: 3, reps: 6, note: "each leg" },
          { id: uid(), exercise: "Single Leg Lateral Box Hop", sets: 3, reps: 4, note: "each way" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Extensions", sets: 3, reps: 12 },
          { id: uid(), exercise: "Single Leg Pistol Squat to Bench", sets: 2, reps: 10, note: "each leg" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Stability Ball Leg Curl", sets: 3, reps: 10 },
          { id: uid(), exercise: "Band Pallof Press", sets: 3, reps: 8, note: "each way" }
          ],
        }
      ],
    },
    {
      name: "Upper Body B (4-Day L/U)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Incline Bench Press", sets: 3, reps: 8 },
          { id: uid(), exercise: "Medicine Ball Slam", sets: 3, reps: 5 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Incline Dumbbell Row", sets: 4, reps: 8 },
          { id: uid(), exercise: "Weighted Push Ups", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Lat Pulldowns", sets: 3, reps: 10 },
          { id: uid(), exercise: "Weighted Sit Ups", sets: 3, reps: 10 }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 1 }, { sessionIndex: 2, dayOffset: 3 }, { sessionIndex: 3, dayOffset: 4 }],
  },
  {
    id: "bundle-4day-tb", name: "4 Day Total Body", notes: "From the Program Design Templates course pack.",
    sessions: [
    {
      name: "Total Body Day 1 (4-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 3, reps: 6 },
          { id: uid(), exercise: "Box Jump", sets: 3, reps: 5 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 6 },
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 8, note: "each arm" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Dumbbell RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 20, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Total Body Day 2 (4-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Reverse Lunge", sets: 3, reps: 6, note: "each leg" },
          { id: uid(), exercise: "Medicine Ball Scoop Toss", sets: 3, reps: 5, note: "each side" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Incline Bench Press", sets: 3, reps: 8 },
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Extensions", sets: 3, reps: 10 },
          { id: uid(), exercise: "Hanging Knee Raise", sets: 3, reps: 12 }
          ],
        }
      ],
    },
    {
      name: "Total Body Day 3 (4-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 8 },
          { id: uid(), exercise: "Single Leg Lateral Box Jump", sets: 4, reps: 3, note: "each leg" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Seated Dumbbell Shoulder Press", sets: 3, reps: 10 },
          { id: uid(), exercise: "Barbell Bent Over Row", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Hip Thrust", sets: 3, reps: 8 },
          { id: uid(), exercise: "Shoulder Taps", sets: 3, reps: 5, note: "each arm" }
          ],
        }
      ],
    },
    {
      name: "Total Body Day 4 (4-Day TB)", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Rear Foot Elevated Split Squat", sets: 3, reps: 6, note: "each leg" },
          { id: uid(), exercise: "Medicine Ball Slam", sets: 3, reps: 5 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Weighted Push Ups", sets: 3, reps: 10 },
          { id: uid(), exercise: "Incline Dumbbell Row", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Accessory", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Nordic Hamstring Curl", sets: 3, reps: 8 },
          { id: uid(), exercise: "Band Pallof Press", sets: 3, reps: 8, note: "each way" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 1 }, { sessionIndex: 2, dayOffset: 3 }, { sessionIndex: 3, dayOffset: 4 }],
  },
  {
    id: "bundle-trisets", name: "3 Day Total Body Tri-Sets", notes: "From the Tri-Set Builder course material — two tri-sets per day (six exercises), built for small-school logistics: limited racks, mixed group sizes, short periods.",
    sessions: [
    {
      name: "Tri-Set Day 1", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Front Squat", sets: 5, reps: 5 },
          { id: uid(), exercise: "Box Jump", sets: 3, reps: 5 },
          { id: uid(), exercise: "One Arm Dumbbell Row", sets: 3, reps: 10, note: "each arm" }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Bench Press", sets: 5, reps: 5 },
          { id: uid(), exercise: "Dumbbell RDL", sets: 3, reps: 8 },
          { id: uid(), exercise: "Side Plank", sets: 3, reps: 30, note: "seconds, each side" }
          ],
        }
      ],
    },
    {
      name: "Tri-Set Day 2", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Barbell Split Squat", sets: 3, reps: 8, note: "each leg" },
          { id: uid(), exercise: "Medicine Ball Slam", sets: 3, reps: 5 },
          { id: uid(), exercise: "Dumbbell Incline Bench Press", sets: 3, reps: 10 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Chin Ups", sets: 3, reps: 8 },
          { id: uid(), exercise: "Single Leg Hip Bridge", sets: 3, reps: 15, note: "each leg" },
          { id: uid(), exercise: "Ab Wheel", sets: 3, reps: 8 }
          ],
        }
      ],
    },
    {
      name: "Tri-Set Day 3", notes: "",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 5, reps: 5 },
          { id: uid(), exercise: "Single Leg Box Jump", sets: 3, reps: 4, note: "each leg" },
          { id: uid(), exercise: "Dumbbell Shoulder Press", sets: 2, reps: 12 }
          ],
        },
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "TRX Row", sets: 3, reps: 12 },
          { id: uid(), exercise: "Floor Slider Leg Curl", sets: 3, reps: 10 },
          { id: uid(), exercise: "Shoulder Taps", sets: 3, reps: 5, note: "each arm" }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 2 }, { sessionIndex: 2, dayOffset: 4 }],
  },
  {
    id: "bundle-12wk-mainlifts", name: "12-Week Main Lift Progression (Squat/Bench/Trap Bar)", notes: "Percentage-based progression from the Semester-Long Strength Progression course material — good for solid intermediates who have a tested max or can judge % by feel. Weeks marked 'add 5-10 lb' repeat the prior week's % as a starting point; adjust up from there based on how the bar moved.",
    sessions: [
    {
      name: "Week 1 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 8, metric: "pct", pct: 60, note: "60-65% — start at 60% and go by feel" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 8, metric: "pct", pct: 60, note: "60-65% — start at 60% and go by feel" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 8, metric: "pct", pct: 60, note: "60-65% — start at 60% and go by feel" }
          ],
        }
      ],
    },
    {
      name: "Week 2 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 8, metric: "pct", pct: 60, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 8, metric: "pct", pct: 60, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 8, metric: "pct", pct: 60, note: "Add 5-10 lb from last week's working weight" }
          ],
        }
      ],
    },
    {
      name: "Week 3 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 8, metric: "pct", pct: 60, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 8, metric: "pct", pct: 60, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 8, metric: "pct", pct: 60, note: "Add 5-10 lb from last week's working weight" }
          ],
        }
      ],
    },
    {
      name: "Week 4 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 6, metric: "pct", pct: 72, note: "70-75%" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 6, metric: "pct", pct: 72, note: "70-75%" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 6, metric: "pct", pct: 72, note: "70-75%" }
          ],
        }
      ],
    },
    {
      name: "Week 5 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 6, metric: "pct", pct: 72, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 6, metric: "pct", pct: 72, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 6, metric: "pct", pct: 72, note: "Add 5-10 lb from last week's working weight" }
          ],
        }
      ],
    },
    {
      name: "Week 6 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 6, metric: "pct", pct: 72, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 6, metric: "pct", pct: 72, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 6, metric: "pct", pct: 72, note: "Add 5-10 lb from last week's working weight" }
          ],
        }
      ],
    },
    {
      name: "Week 7 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 4, metric: "pct", pct: 82, note: "80-85%" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 4, metric: "pct", pct: 82, note: "80-85%" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 4, metric: "pct", pct: 82, note: "80-85%" }
          ],
        }
      ],
    },
    {
      name: "Week 8 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 4, metric: "pct", pct: 82, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 4, metric: "pct", pct: 82, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 4, metric: "pct", pct: 82, note: "Add 5-10 lb from last week's working weight" }
          ],
        }
      ],
    },
    {
      name: "Week 9 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 3, reps: 4, metric: "pct", pct: 82, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Bench Press", sets: 3, reps: 4, metric: "pct", pct: 82, note: "Add 5-10 lb from last week's working weight" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 3, reps: 4, metric: "pct", pct: 82, note: "Add 5-10 lb from last week's working weight" }
          ],
        }
      ],
    },
    {
      name: "Week 10 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 2, reps: 2, metric: "pct", pct: 90, note: "Move each rep fast" },
          { id: uid(), exercise: "Bench Press", sets: 2, reps: 2, metric: "pct", pct: 90, note: "Move each rep fast" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 2, reps: 2, metric: "pct", pct: 90, note: "Move each rep fast" }
          ],
        }
      ],
    },
    {
      name: "Week 11 — Main Lifts", notes: "Can take the last set to positive failure if it's easy.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 1, reps: 1, metric: "pct", pct: 80, note: "One fast rep — prime and prep to test" },
          { id: uid(), exercise: "Bench Press", sets: 1, reps: 1, metric: "pct", pct: 80, note: "One fast rep — prime and prep to test" },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 1, reps: 1, metric: "pct", pct: 80, note: "One fast rep — prime and prep to test" }
          ],
        }
      ],
    },
    {
      name: "Week 12 — Test Week", notes: "Test week — see how the block paid off.",
      blocks: [
        {
          id: uid(), type: "sets", category: "Strength/Power", rounds: 3, workSec: 40, restSec: 20, note: "",
          exercises: [
          { id: uid(), exercise: "Back Squat", sets: 1, reps: 1, note: "Work up to a 1, 2, or 3-rep max." },
          { id: uid(), exercise: "Bench Press", sets: 1, reps: 1, note: "Work up to a 1, 2, or 3-rep max." },
          { id: uid(), exercise: "Trap Bar Deadlift", sets: 1, reps: 1, note: "Work up to a 1, 2, or 3-rep max." }
          ],
        }
      ],
    }
    ],
    schedule: [{ sessionIndex: 0, dayOffset: 0 }, { sessionIndex: 1, dayOffset: 7 }, { sessionIndex: 2, dayOffset: 14 }, { sessionIndex: 3, dayOffset: 21 }, { sessionIndex: 4, dayOffset: 28 }, { sessionIndex: 5, dayOffset: 35 }, { sessionIndex: 6, dayOffset: 42 }, { sessionIndex: 7, dayOffset: 49 }, { sessionIndex: 8, dayOffset: 56 }, { sessionIndex: 9, dayOffset: 63 }, { sessionIndex: 10, dayOffset: 70 }, { sessionIndex: 11, dayOffset: 77 }],
  },
];

function emptyCycle() {
  return { id: uid(), name: "", notes: "", items: [{ id: uid(), dayOffset: 0, programId: "" }] };
}

function ApplyCycleModal({ cycle, db, teacherId, onApply, onClose }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const [startDate, setStartDate] = useState(today());
  const [groupIds, setGroupIds] = useState([]);
  const span = cycle.items.length ? Math.max(...cycle.items.map((i) => i.dayOffset)) : 0;

  return (
    <Modal title={`Apply "${cycle.name}"`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 12.5, color: C.textDim, margin: 0, lineHeight: 1.55 }}>
          Writes {cycle.items.filter((i) => i.programId).length} sessions onto the Planner, spread across {span + 1} days starting from the date below. Doesn&rsquo;t touch anything already scheduled.
        </p>
        <Field label="Start date">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="f" style={inputCss} />
        </Field>
        <div>
          <span style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>Assign to</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {myGroups.map((g) => (
              <Chip key={g.id} active={groupIds.includes(g.id)}
                onClick={() => setGroupIds(groupIds.includes(g.id) ? groupIds.filter((x) => x !== g.id) : [...groupIds, g.id])}>
                {g.name}
              </Chip>
            ))}
            {!myGroups.length && <span style={{ fontSize: 12, color: C.steel }}>No groups yet — add one from Roster first.</span>}
          </div>
        </div>
        <Button icon={Check} disabled={!groupIds.length} onClick={() => { onApply(cycle, startDate, groupIds); onClose(); }}>
          Apply to Planner
        </Button>
      </div>
    </Modal>
  );
}

// One starter-program card with its own inline "apply" step — picking
// a template and scheduling it is one flow, not import-then-hunt-for-
// it-then-apply. Reused from both Library > Programs and the Planner
// itself, so "get a template onto the calendar" never needs a detour.
function StarterProgramPicker({ db, teacherId, handlers, defaultDate, defaultGroupIds, onDone }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const [applying, setApplying] = useState(null);
  const [startDate, setStartDate] = useState(defaultDate || today());
  const [groupIds, setGroupIds] = useState(defaultGroupIds || []);
  const [repeatWeeks, setRepeatWeeks] = useState(8);

  const importAndApply = (bundle, weeks) => {
    const newSessionIds = bundle.sessions.map((s) => {
      const id = uid();
      const reidBlocks = s.blocks.map((b) => ({ ...b, id: uid(), exercises: b.exercises.map((e) => ({ ...e, id: uid() })) }));
      handlers.saveProgram({ id, name: s.name, notes: s.notes || "", blocks: reidBlocks });
      return id;
    });
    // Repeats the bundle's own weekly pattern — same underlying sessions
    // reused across every week, not N duplicate copies. If a coach later
    // wants week 5 to look different, editing that one day from the
    // Planner already makes a personal copy just for that day without
    // touching any other week.
    const items = [];
    for (let w = 0; w < weeks; w++) {
      bundle.schedule.forEach((it) => {
        items.push({ id: uid(), dayOffset: it.dayOffset + w * 7, programId: newSessionIds[it.sessionIndex] });
      });
    }
    const newCycle = {
      id: uid(), name: weeks > 1 ? `${bundle.name} (${weeks} weeks)` : bundle.name,
      notes: bundle.notes || "", items,
    };
    handlers.saveCycle(newCycle);
    handlers.applyCycle(newCycle, startDate, groupIds);
    onDone();
  };

  if (applying) {
    const span = applying.schedule.length ? Math.max(...applying.schedule.map((it) => it.dayOffset)) : 0;
    const cycleWeeks = Math.ceil((span + 1) / 7);
    const canRepeat = cycleWeeks <= 1; // a bundle that already spans multiple weeks (like a phased block) has its own built-in progression — repeating it verbatim would just replay the same numbers
    const weeks = canRepeat ? repeatWeeks : 1;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => setApplying(null)} className="f" style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: C.accent, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0, alignSelf: "flex-start" }}>
          <ChevronLeft size={14} /> Back to templates
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{applying.name}</div>
          <p style={{ fontSize: 12.5, color: C.textDim, margin: "4px 0 0", lineHeight: 1.55 }}>
            {canRepeat
              ? `Writes ${applying.sessions.length} sessions per week onto the Planner, repeated for as many weeks as you set below.`
              : `Writes ${applying.sessions.length} sessions straight onto the Planner, spread across ${span + 1} days starting from the date below — this one already has its own multi-week progression built in, so it applies once as designed.`}
          </p>
        </div>
        {canRepeat && (
          <Field label="Repeat for how many weeks?" hint="Same sessions each week, reused — not separate copies. Edit any single day from the Planner later without affecting the rest.">
            <input value={repeatWeeks} onChange={(e) => setRepeatWeeks(Math.max(1, parseInt(e.target.value, 10) || 1))} inputMode="numeric" className="f" style={inputCss} />
          </Field>
        )}
        <Field label="Start date">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="f" style={inputCss} />
        </Field>
        <div>
          <span style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>Assign to</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {myGroups.map((g) => (
              <Chip key={g.id} active={groupIds.includes(g.id)}
                onClick={() => setGroupIds(groupIds.includes(g.id) ? groupIds.filter((x) => x !== g.id) : [...groupIds, g.id])}>
                {g.name}
              </Chip>
            ))}
            {!myGroups.length && <span style={{ fontSize: 12, color: C.steel }}>No groups yet — add one from Roster first.</span>}
          </div>
        </div>
        <Button icon={Check} disabled={!groupIds.length} onClick={() => importAndApply(applying, weeks)}>
          Add to Planner
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 12.5, color: C.textDim, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
        Full multi-week templates from a Strength Training Program Design course pack — splits, a tri-set structure, and a 12-week percentage-based main lift progression. Pick one, set a start date and group, and it goes straight onto the Planner — it's also saved to your Programs list for reuse.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STARTER_PROGRAM_BUNDLES.map((b) => {
          const span = b.schedule.length ? Math.max(...b.schedule.map((it) => it.dayOffset)) : 0;
          return (
            <button key={b.id} onClick={() => { setApplying(b); setRepeatWeeks(8); }} className="f" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 13px",
              background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{b.name}</div>
                <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{b.sessions.length} sessions · spans {Math.ceil((span + 1) / 7)} week{Math.ceil((span + 1) / 7) === 1 ? "" : "s"}</div>
              </div>
              <ChevronRight size={16} color={C.steel} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CycleBuilder({ db, teacherId, handlers }) {
  const [editing, setEditing] = useState(null);
  const [applying, setApplying] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pickingStarters, setPickingStarters] = useState(false);

  const patchItem = (id, patch) => setEditing({ ...editing, items: editing.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const dropItem = (id) => setEditing({ ...editing, items: editing.items.filter((it) => it.id !== id) });
  const addItem = () => {
    const last = editing.items[editing.items.length - 1];
    setEditing({ ...editing, items: [...editing.items, { id: uid(), dayOffset: last ? last.dayOffset + 1 : 0, programId: "" }] });
  };

  if (editing) {
    const canSave = editing.name.trim() && editing.items.some((i) => i.programId);
    return (
      <div>
        <Eyebrow icon={Layers}>{db.cycles.find((c) => c.id === editing.id) ? "Edit program" : "New program"}</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Program name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. 4-Week Hypertrophy Block" className="f" style={inputCss} /></Field>
          <Field label="Notes" hint="Optional">
            <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} className="f" style={{ ...inputCss, resize: "vertical" }} />
          </Field>

          <div>
            <span style={{ fontSize: 12, color: C.textDim, display: "block", marginBottom: 8 }}>
              Sequence — each row is a day since the program starts (0 = the first day). Skip weekends by leaving a gap in the numbers.
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {editing.items.map((it, i) => (
                <div key={it.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 90, flexShrink: 0 }}>
                    <input value={it.dayOffset} onChange={(e) => patchItem(it.id, { dayOffset: parseInt(e.target.value, 10) || 0 })}
                      inputMode="numeric" placeholder="Day #" className="f" style={{ ...inputCss, fontSize: 13, padding: "8px 10px" }} title="Day offset from program start" />
                  </div>
                  <select value={it.programId} onChange={(e) => patchItem(it.id, { programId: e.target.value })} className="f" style={{ ...inputCss, flex: 1, fontSize: 13 }}>
                    <option value="">Pick a saved session…</option>
                    {db.programs.filter((p) => !p.isPersonal).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => dropItem(it.id)} aria-label="Remove day" />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" icon={Plus} onClick={addItem} style={{ marginTop: 8 }}>Add day</Button>
            {!db.programs.length && (
              <p style={{ fontSize: 11.5, color: C.warn, marginTop: 8 }}>No saved sessions yet — build some under the Sessions tab first, then come back here.</p>
            )}
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <Button icon={Check} disabled={!canSave} onClick={() => { handlers.saveCycle(editing); setEditing(null); }}>Save program</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <Eyebrow icon={Layers}>Programs</Eyebrow>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="subtle" icon={Download} onClick={() => setPickingStarters(true)}>Starter programs</Button>
          <Button icon={Plus} onClick={() => setEditing(emptyCycle())}>New program</Button>
        </div>
      </div>
      {!db.cycles.length ? (
        <Empty icon={Layers}>No programs built yet. A program is a reusable multi-week sequence of sessions — build one, or bring in a starter template above, then apply it to any group whenever you're ready to start it.</Empty>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {db.cycles.map((c) => {
            const filled = c.items.filter((i) => i.programId);
            const span = c.items.length ? Math.max(...c.items.map((i) => i.dayOffset)) : 0;
            return (
              <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 15 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>{filled.length} sessions · spans {Math.ceil((span + 1) / 7)} week{Math.ceil((span + 1) / 7) === 1 ? "" : "s"}</div>
                    {c.notes && <div style={{ fontSize: 12, color: C.steel, marginTop: 4, lineHeight: 1.5 }}>{c.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Button size="sm" variant="subtle" onClick={() => setApplying(c)}>Apply</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing({ ...c })}>Edit</Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDelete(c)} aria-label="Delete program" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pickingStarters && (
        <Modal title="Starter programs" onClose={() => setPickingStarters(false)} wide>
          <StarterProgramPicker db={db} teacherId={teacherId} handlers={handlers} onDone={() => setPickingStarters(false)} />
        </Modal>
      )}
      {applying && (
        <ApplyCycleModal cycle={applying} db={db} teacherId={teacherId} onApply={handlers.applyCycle} onClose={() => setApplying(null)} />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Delete program?"
          body={`Delete "${confirmDelete.name}"? This only removes the template — any sessions already applied to the Planner stay right where they are.`}
          confirmLabel="Delete program"
          onConfirm={() => handlers.deleteCycle(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function CoachLibrary({ db, teacherId, handlers }) {
  const [view, setView] = useState("exercises");
  return (
    <div>
      <Tabs scroll value={view} onChange={setView} tabs={[
        { id: "exercises", label: "Movements" },
        { id: "sessions", label: "Sessions" },
        { id: "cycles", label: "Programs" },
      ]} />
      {view === "exercises" && (
        <ExerciseLibrary db={db} onSaveExercise={handlers.saveExercise} onDeleteExercise={handlers.deleteExercise}
          onHideExercise={handlers.hideExercise} onRestoreExercise={handlers.restoreExercise} />
      )}
      {view === "sessions" && (
        <>
          <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 14, lineHeight: 1.6 }}>
            Sessions saved here can be dropped onto any day from the Planner. You can also write one straight onto a day if it&rsquo;s a one-off.
          </p>
          <ProgramBuilder db={db} onSave={handlers.saveProgram} onDelete={handlers.deleteProgram} />
        </>
      )}
      {view === "cycles" && (
        <>
          <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 14, lineHeight: 1.6 }}>
            Build a multi-week block once — a sequence of saved sessions on specific days — then apply it to a group starting from any date, and it fills in the Planner for you.
          </p>
          <CycleBuilder db={db} teacherId={teacherId} handlers={handlers} />
        </>
      )}
    </div>
  );
}

/* ===============================================================
   TV DISPLAY — full-screen readout of a session for a gym TV/monitor.
   Big type, high contrast, sets/reps/notes only — nothing a lifter
   needs to squint at from across the room.
================================================================ */
function TVDisplay({ db, program, date, groupNames, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="b" style={{
      position: "fixed", inset: 0, zIndex: 300, background: C.bg, color: C.text,
      overflowY: "auto", padding: "36px 5vw 80px",
    }}>
      <button onClick={onClose} className="f" style={{
        position: "fixed", top: 20, right: 24, zIndex: 310,
        background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10,
        color: C.text, padding: "10px 16px", fontSize: 15, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <X size={20} /> Exit
      </button>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
          <Helmet size={58} />
          <div>
            <div style={{ fontSize: 15, letterSpacing: 3, color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>
              Sentinel Spartans
            </div>
            <div className="d" style={{ fontSize: 46, textTransform: "uppercase", lineHeight: 1.05 }}>{program.name}</div>
          </div>
        </div>
        <div style={{ fontSize: 19, color: C.textDim, marginBottom: 40 }}>
          {fmtLong(date)}{groupNames.length ? ` · ${groupNames.join(", ")}` : ""}
        </div>

        {program.blocks.map((b, bi) => {
          if (b.type === "note") {
            return (
              <div key={b.id} style={{
                marginBottom: 44, background: C.surfaceAlt, border: `2px solid ${C.accentBorder}`, borderRadius: 16,
                padding: "26px 30px", maxWidth: 900,
              }}>
                <div style={{ fontSize: 15, color: C.accent, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>
                  Coach&rsquo;s Note
                </div>
                <div style={{ fontSize: 26, color: C.text, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{b.text}</div>
              </div>
            );
          }
          return (
          <div key={b.id} style={{ marginBottom: 44 }}>
            <div style={{ fontSize: 16, color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>
              {b.category}
              {b.type === "circuit" ? ` · Circuit, ${b.rounds} rounds` : b.exercises.length > 1 ? ` · ${(PAIR_NAME[b.exercises.length] || "Giant set")}` : ""}
            </div>
            {b.note && <div style={{ fontSize: 18, color: C.textDim, marginBottom: 16, lineHeight: 1.5, maxWidth: 900 }}>{b.note}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {b.exercises.map((e, ei) => {
                const meta = exMeta(e.exercise, db.custom);
                const cue = e.note || cueFor(e.exercise, db.custom);
                return (
                  <div key={e.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
                      <span className="d" style={{ fontSize: 32 }}>
                        {b.type === "circuit" ? `${ei + 1}.` : `${blockLetter(bi)}${ei + 1}.`} {e.exercise}
                      </span>
                      <span style={{ fontSize: 27, color: C.accent, fontWeight: 700 }}>
                        {b.type === "circuit" ? (e.reps ? `${e.reps} reps` : "") : prescriptionLine(e, meta, null)}
                      </span>
                    </div>
                    {cue && <div style={{ fontSize: 19, color: C.textDim, marginTop: 8, lineHeight: 1.5, maxWidth: 900 }}>{cue}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
        })}

        <p style={{ fontSize: 13, color: C.steel, marginTop: 20 }}>Press Esc or tap Exit to close.</p>
      </div>
    </div>
  );
}

/* ===============================================================
   TV LEADERBOARD — live-refreshing, full-screen ranking by class or
   across the whole room. Re-polls shared storage on an interval so it
   catches sets logged from other phones while it's sitting on a wall.
================================================================ */
function useLiveData(keys, intervalMs = 20000) {
  const [data, setData] = useState({});
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries = await Promise.all(keys.map(async (k) => [k, await sGet(K(k))]));
      if (!cancelled) setData(Object.fromEntries(entries));
    };
    load();
    const t = setInterval(load, intervalMs);
    return () => { cancelled = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return data;
}

// Same scoring as the coach's Leaderboards tab, minus pound-for-pound —
// that board is explicitly kept off student-facing screens since it
// makes bodyweight inferable from a ranking, and a TV on the wall is
// about as student-facing as a screen gets.
function rankByExercise(students, logsByStudent, exercise, mode, meta) {
  const out = [];
  for (const s of students) {
    const logs = (logsByStudent[s.id] || []).filter((l) => l.exercise === exercise);
    if (!logs.length) continue;
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    let best, first, label;
    if (meta.mode === "weight") {
      const e = logs.map((l) => epley1RM(l.weight, l.reps));
      best = Math.max(...e);
      first = epley1RM(sorted[0].weight, sorted[0].reps);
      label = `${best} lb`;
    } else if (meta.mode === "sprint") {
      best = Math.min(...logs.map((l) => l.seconds));
      first = sorted[0].seconds;
      label = `${best.toFixed(2)}s`;
    } else {
      best = Math.max(...logs.map((l) => (meta.mode === "reps" ? l.reps : l.value)));
      first = meta.mode === "reps" ? sorted[0].reps : sorted[0].value;
      label = meta.mode === "reps" ? `${best} reps` : `${best} ${meta.unit || ""}`;
    }
    const improve = first ? (meta.mode === "sprint" ? ((first - best) / first) * 100 : ((best - first) / first) * 100) : 0;
    out.push({ student: s, best, label, improve, sessions: logs.length });
  }
  if (mode === "improve") out.sort((a, b) => b.improve - a.improve);
  else out.sort((a, b) => (meta.mode === "sprint" ? a.best - b.best : b.best - a.best));
  return out;
}

function TVLeaderboard({ db, teacherId, initialExercise, onClose }) {
  const [exercise, setExercise] = useState(initialExercise || "Back Squat");
  const [mode, setMode] = useState("load");
  const [scope, setScope] = useState("overall");
  const live = useLiveData(["students", "classes", "groups", "logs"], 20000);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const students = live.students || db.students;
  const classes = live.classes || db.classes;
  const logsByStudent = live.logs || db.logs;

  const myClasses = classes.filter((c) => c.teacherId === teacherId);
  const myStudents = students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const meta = exMeta(exercise, db.custom);

  const pool = scope === "overall" ? myStudents : myStudents.filter((s) => s.classId === scope);
  const rows = useMemo(() => rankByExercise(pool, logsByStudent, exercise, mode, meta),
    [pool, logsByStudent, exercise, mode, meta]);

  return (
    <div className="b" style={{
      position: "fixed", inset: 0, zIndex: 300, background: C.bg, color: C.text,
      overflowY: "auto", padding: "36px 5vw 80px",
    }}>
      <button onClick={onClose} className="f" style={{
        position: "fixed", top: 20, right: 24, zIndex: 310,
        background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10,
        color: C.text, padding: "10px 16px", fontSize: 15, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <X size={20} /> Exit
      </button>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
          <Helmet size={58} />
          <div>
            <div style={{ fontSize: 15, letterSpacing: 3, color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>
              Sentinel Spartans
            </div>
            <div className="d" style={{ fontSize: 46, textTransform: "uppercase", lineHeight: 1.05 }}>Leaderboard</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <select value={exercise} onChange={(e) => setExercise(e.target.value)} className="f"
            style={{ ...inputCss, width: "auto", fontSize: 15, padding: "9px 12px" }}>
            {db.exercises.map((n) => <option key={n}>{n}</option>)}
          </select>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="f"
            style={{ ...inputCss, width: "auto", fontSize: 15, padding: "9px 12px" }}>
            <option value="overall">Overall — all classes</option>
            {myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "load", label: meta.mode === "sprint" ? "Fastest" : "Top load" },
              { id: "improve", label: "Most improved" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className="f" style={{
                padding: "9px 16px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${mode === m.id ? C.accentBorder : C.border}`,
                background: mode === m.id ? C.accentDim : "transparent",
                color: mode === m.id ? C.accent : C.textDim,
              }}>{m.label}</button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: C.steel, marginLeft: "auto" }}>
            {scope === "overall" ? `All ${myClasses.length} classes` : "Refreshes automatically"}
          </span>
        </div>

        {!rows.length ? (
          <div style={{ fontSize: 22, color: C.textDim, marginTop: 60, textAlign: "center" }}>
            Nothing logged on {exercise} yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
            {rows.map((r, i) => (
              <div key={r.student.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
                padding: "18px 6px", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 0 }}>
                  <span className="d" style={{ width: 54, textAlign: "center", fontSize: 30, color: i === 0 ? C.accent : C.textDim, flexShrink: 0 }}>{i + 1}</span>
                  <Avatar person={r.student} size={52} />
                  <span className="d" style={{ fontSize: 28, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.student.name}</span>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {mode === "improve" ? (
                    <span className="d" style={{ fontSize: 30, color: r.improve > 0 ? C.good : C.textDim }}>{r.improve > 0 ? "+" : ""}{r.improve.toFixed(0)}%</span>
                  ) : (
                    <span className="d" style={{ fontSize: 30, color: C.accent }}>{r.label}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 13, color: C.steel, marginTop: 24 }}>Press Esc or tap Exit to close. Updates automatically as sets get logged.</p>
      </div>
    </div>
  );
}


/* ===============================================================
   COACH: PLANNER — months of programming, and sessions written
   straight onto the day without pre-building them
================================================================ */
// One "already scheduled" row inside a Planner day — collapsed it's
// just the name and group, tap to see every movement and its target,
// same as an athlete would see it. Edit opens a copy just for this day.
// Marks a date as a max-testing event — the athlete's screen switches
// into test mode, and the coach gets a one-tap leaderboard reveal for
// each tested lift once the numbers are in.
function TestingDayToggle({ date, db, onSetTestingDay }) {
  const existing = db.testingDays.find((t) => t.date === date);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState(existing ? existing.exercises : []);
  const [addName, setAddName] = useState("");

  if (!editing && !existing) {
    return (
      <Button size="sm" variant="ghost" icon={Award} onClick={() => { setPicked([]); setEditing(true); }}>
        Mark as Testing Day
      </Button>
    );
  }

  if (existing && !editing) {
    return (
      <div style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.accent }}>Testing Day — {existing.exercises.join(", ") || "no lifts picked"}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button size="sm" variant="ghost" onClick={() => { setPicked(existing.exercises); setEditing(true); }}>Edit</Button>
            <Button size="sm" variant="ghost" icon={X} onClick={() => onSetTestingDay(date, [], false)} aria-label="Remove" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 12px" }}>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Which lifts are being tested?</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {picked.map((n) => (
          <Chip key={n} tone="gold" onClick={() => setPicked(picked.filter((x) => x !== n))}>{n} ✕</Chip>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <select value={addName} onChange={(e) => { if (e.target.value && !picked.includes(e.target.value)) setPicked([...picked, e.target.value]); setAddName(""); }}
          className="f" style={{ ...inputCss, flex: 1, fontSize: 13 }}>
          <option value="">Add a lift…</option>
          {db.exercises.filter((n) => !picked.includes(n)).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <Button size="sm" icon={Check} disabled={!picked.length} onClick={() => { onSetTestingDay(date, picked, true); setEditing(false); }}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function ScheduledEntryRow({ s, db, onPreview, onRemove, onEdit, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const p = db.programs.find((x) => x.id === s.programId);
  const norm = p ? normalizeProgram(p) : null;
  return (
    <div style={{ background: C.surfaceAlt, borderRadius: 9, padding: "9px 11px", marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <button onClick={() => p && setOpen(!open)} className="f" style={{ background: "none", border: "none", textAlign: "left", flex: 1, minWidth: 0, cursor: p ? "pointer" : "default", color: C.text, padding: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p ? p.name : "Deleted session"}</span>
            {p && (open ? <ChevronUp size={13} color={C.steel} style={{ flexShrink: 0 }} /> : <ChevronDown size={13} color={C.steel} style={{ flexShrink: 0 }} />)}
          </div>
          <div style={{ fontSize: 11, color: C.textDim }}>
            {s.groupIds.map((g) => { const gg = db.groups.find((x) => x.id === g); return gg ? gg.name : null; }).filter(Boolean).join(", ")}
          </div>
        </button>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {p && <Button size="sm" variant="ghost" icon={Pencil} onClick={() => onEdit(s, p)} aria-label="Edit" />}
          {p && <Button size="sm" variant="subtle" icon={Monitor} onClick={() => onPreview(s)}>Preview</Button>}
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => onRemove(s.id)} aria-label="Remove" />
        </div>
      </div>
      {open && norm && (
        <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
          {norm.notes && <div style={{ fontSize: 11.5, color: C.textDim, fontStyle: "italic", lineHeight: 1.5 }}>{norm.notes}</div>}
          {norm.blocks.map((b) => (
            b.type === "note" ? (
              <div key={b.id} style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 3 }}>Note</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{b.text}</div>
              </div>
            ) : (
            <div key={b.id}>
              <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 3 }}>
                {b.category}{b.type === "circuit" ? ` · Circuit × ${b.rounds}` : ""}
              </div>
              {b.note && <div style={{ fontSize: 11, color: C.steel, marginBottom: 4, lineHeight: 1.45 }}>{b.note}</div>}
              {b.exercises.map((e) => (
                <div key={e.id} style={{ padding: "3px 0" }}>
                  <div style={{ fontSize: 12, color: C.textDim, display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.exercise}</span>
                    <span style={{ color: C.text, flexShrink: 0, fontWeight: 600 }}>
                      {b.type === "circuit" ? (e.reps ? `${e.reps} reps` : "—") : prescriptionLine(e, exMeta(e.exercise, db.custom), null)}
                    </span>
                  </div>
                  {e.note && <div style={{ fontSize: 10.5, color: C.steel, marginTop: 1, lineHeight: 1.4 }}>{e.note}</div>}
                </div>
              ))}
            </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function Planner({ db, teacherId, onAssign, onUnassign, onSaveProgram, onRepointSchedule, onSaveCycle, onApplyCycle, onSetTestingDay }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [picking, setPicking] = useState(null);
  const [programId, setProgramId] = useState("");
  const [groupIds, setGroupIds] = useState([]);
  const [repeat, setRepeat] = useState(0);
  const [draft, setDraft] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [scope, setScope] = useState("");
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [usingStarter, setUsingStarter] = useState(false);
  const [viewMode, setViewMode] = useState("month");
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return iso(d);
  });

  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => {
    const c = db.classes.find((x) => x.id === g.classId);
    return c && c.teacherId === teacherId;
  });

  // "class:<id>" or "group:<id>" — mirrors the athlete-scope pattern used
  // in Reports, but scoped to schedule entries instead of students.
  const scopeKind = scope.slice(0, scope.indexOf(":"));
  const scopeId = scope.slice(scope.indexOf(":") + 1);
  const scopeLabel = !scope ? "All my classes"
    : scopeKind === "class" ? ((myClasses.find((c) => c.id === scopeId) || {}).name || "Class")
    : ((myGroups.find((g) => g.id === scopeId) || {}).name || "Group");
  const inScope = (s) => {
    if (!scope) return true;
    if (scopeKind === "class") {
      const classGroupIds = myGroups.filter((g) => g.classId === scopeId).map((g) => g.id);
      return s.groupIds.some((g) => classGroupIds.includes(g));
    }
    return s.groupIds.includes(scopeId);
  };

  const first = new Date(cursor.y, cursor.m, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const dateFor = (day) => iso(new Date(cursor.y, cursor.m, day, 12));
  const assignmentsOnDate = (d) => db.schedule.filter((s) => s.date === d && s.groupIds.some((g) => myGroups.find((mg) => mg.id === g)) && inScope(s));
  const assignmentsOn = (day) => assignmentsOnDate(dateFor(day));

  const shift = (n) => {
    let m = cursor.m + n, y = cursor.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setCursor({ y, m });
  };

  const close = () => { setPicking(null); setProgramId(""); setGroupIds([]); setRepeat(0); setDraft(null); };

  const scheduleProgram = (pid) => {
    const dates = [picking];
    for (let i = 1; i <= repeat; i++) dates.push(addDays(picking, 7 * i));
    dates.forEach((d) => onAssign({ id: uid(), date: d, programId: pid, groupIds: [...groupIds] }));
    close();
  };

  return (
    <div>
      <button onClick={() => setTeamsOpen(true)} className="f" style={{
        display: "flex", alignItems: "center", gap: 7, background: C.surfaceAlt, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: "6px 12px 6px 10px", color: C.text, fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: 12,
      }}>
        <Users size={13} color={C.accent} />
        {scopeLabel}
        <ChevronDown size={13} color={C.steel} />
      </button>

      <Tabs value={viewMode} onChange={setViewMode} tabs={[{ id: "month", label: "Month" }, { id: "week", label: "Week — full detail" }]} />

      {viewMode === "month" ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, marginTop: 14 }}>
            <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => shift(-1)} aria-label="Previous month" />
            <span className="d" style={{ fontSize: 19, textTransform: "uppercase" }}>{monthLabel}</span>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => shift(1)} aria-label="Next month" />
          </div>

          {!myGroups.length && <div style={{ marginBottom: 14 }}><Empty icon={Users}>Create a class and at least one training group first, then you can schedule sessions here.</Empty></div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 10, color: C.steel, fontWeight: 700, padding: "4px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={"pad" + i} />;
              const d = dateFor(day);
              const items = assignmentsOn(day);
              const isToday = d === today();
              return (
                <button key={d} onClick={() => setPicking(d)} className="f" style={{
                  minHeight: 62, borderRadius: 8, cursor: "pointer", padding: "5px 4px", textAlign: "left",
                  background: items.length ? C.accentDim : C.surface,
                  border: `1px solid ${isToday ? C.accentBorder : C.border}`,
                  color: C.text, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden",
                }}>
                  <span className="d" style={{ fontSize: 13, color: isToday ? C.accent : C.textDim }}>{day}</span>
                  {items.slice(0, 2).map((s) => {
                    const p = db.programs.find((x) => x.id === s.programId);
                    return <span key={s.id} style={{ fontSize: 9, color: C.accent, fontWeight: 700, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{p ? p.name : "?"}</span>;
                  })}
                  {items.length > 2 && <span style={{ fontSize: 9, color: C.steel }}>+{items.length - 2}</span>}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week" />
            <span className="d" style={{ fontSize: 16, textTransform: "uppercase", textAlign: "center" }}>{fmtLong(weekStart)} – {fmtDate(addDays(weekStart, 6))}</span>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week" />
          </div>

          {!myGroups.length && <div style={{ marginBottom: 14 }}><Empty icon={Users}>Create a class and at least one training group first, then you can schedule sessions here.</Empty></div>}

          <div className="sc" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => {
              const items = assignmentsOnDate(d);
              const isToday = d === today();
              const dLabel = new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" });
              return (
                <div key={d} style={{
                  minWidth: 240, flex: "0 0 240px", background: C.surface, border: `1px solid ${isToday ? C.accentBorder : C.border}`,
                  borderRadius: 12, padding: 12, display: "flex", flexDirection: "column",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.steel, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{dLabel}</div>
                      <div className="d" style={{ fontSize: 16, color: isToday ? C.accent : C.text }}>{fmtDate(d)}</div>
                    </div>
                    <button onClick={() => setPicking(d)} className="f" style={{ background: "none", border: "none", color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                      + Add
                    </button>
                  </div>
                  {!items.length ? (
                    <span style={{ fontSize: 11.5, color: C.steel }}>Nothing scheduled</span>
                  ) : (
                    items.map((s) => (
                      <ScheduledEntryRow key={s.id} s={s} db={db} defaultOpen
                        onPreview={setPreviewing} onRemove={onUnassign}
                        onEdit={(entry, program) => {
                          const clone = normalizeProgram(JSON.parse(JSON.stringify(program)));
                          clone.id = uid();
                          setEditingEntry({ entry, draft: clone });
                        }} />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {picking && (
        <Modal title={fmtLong(picking)} onClose={close} wide={!!draft}>
          {draft ? (
            <div>
              <div style={{ fontSize: 12, color: C.steel, marginBottom: 14, lineHeight: 1.55 }}>
                Writing this straight onto {fmtDate(picking)}. It saves to your Sessions list too, so you can reuse it later.
              </div>
              {!groupIds.length && (
                <div style={{ marginBottom: 14 }}>
                  <Field label="Groups running it">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {myGroups.map((g) => (
                        <Chip key={g.id} active={groupIds.includes(g.id)}
                          onClick={() => setGroupIds(groupIds.includes(g.id) ? groupIds.filter((x) => x !== g.id) : [...groupIds, g.id])}>
                          {g.name}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                </div>
              )}
              {groupIds.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.textDim }}>For:</span>
                  {groupIds.map((id) => {
                    const g = myGroups.find((x) => x.id === id);
                    return g ? <Chip key={id} tone="gold">{g.name}</Chip> : null;
                  })}
                  <Button size="sm" variant="ghost" onClick={() => setGroupIds([])}>Change</Button>
                </div>
              )}
              <SessionEditor db={db} value={draft} onChange={setDraft} saveLabel="Save and schedule"
                onSave={() => { onSaveProgram(draft); scheduleProgram(draft.id); }}
                onCancel={() => setDraft(null)} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TestingDayToggle date={picking} db={db} onSetTestingDay={onSetTestingDay} />

              {db.schedule.filter((s) => s.date === picking).length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 7 }}>Already scheduled</div>
                  {db.schedule.filter((s) => s.date === picking).map((s) => (
                    <ScheduledEntryRow key={s.id} s={s} db={db}
                      onPreview={setPreviewing} onRemove={onUnassign}
                      onEdit={(entry, program) => {
                        const clone = normalizeProgram(JSON.parse(JSON.stringify(program)));
                        clone.id = uid();
                        setEditingEntry({ entry, draft: clone });
                      }} />
                  ))}
                </div>
              )}

              <Field label="Groups running it">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {myGroups.map((g) => (
                    <Chip key={g.id} active={groupIds.includes(g.id)}
                      onClick={() => setGroupIds(groupIds.includes(g.id) ? groupIds.filter((x) => x !== g.id) : [...groupIds, g.id])}>
                      {g.name}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Repeat weekly" hint="Fills the same weekday forward — how you build a month or a whole quarter at once.">
                <select value={repeat} onChange={(e) => setRepeat(parseInt(e.target.value, 10) || 0)} className="f" style={inputCss}>
                  <option value={0}>Just this day</option>
                  <option value={3}>+3 more weeks</option>
                  <option value={7}>+7 more weeks</option>
                  <option value={11}>+11 more weeks (a quarter)</option>
                  <option value={17}>+17 more weeks (a semester)</option>
                </select>
              </Field>

              <Button full icon={Plus} disabled={!groupIds.length} onClick={() => setDraft(blankSession())}>
                Write a new session for this day
              </Button>

              <Button full variant="subtle" icon={Download} onClick={() => setUsingStarter(true)}>
                Use a starter program
              </Button>

              {db.programs.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 10, color: C.steel, textTransform: "uppercase", letterSpacing: 1 }}>or reuse one</span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>
                  <Field label="Saved session">
                    <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="f" style={inputCss}>
                      <option value="">Choose a session…</option>
                      {db.programs.filter((p) => !p.isPersonal).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </Field>
                  <Button variant="subtle" full icon={Check} disabled={!programId || !groupIds.length} onClick={() => scheduleProgram(programId)}>
                    Schedule it
                  </Button>
                </>
              )}
            </div>
          )}
        </Modal>
      )}

      {previewing && (() => {
        const p = db.programs.find((x) => x.id === previewing.programId);
        if (!p) return null;
        const groupNames = previewing.groupIds
          .map((g) => { const gg = db.groups.find((x) => x.id === g); return gg ? gg.name : null; })
          .filter(Boolean);
        return (
          <TVDisplay db={db} program={normalizeProgram(p)} date={previewing.date} groupNames={groupNames} onClose={() => setPreviewing(null)} />
        );
      })()}

      {teamsOpen && (
        <Modal title="Teams & classes" onClose={() => setTeamsOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button onClick={() => { setScope(""); setTeamsOpen(false); }} className="f" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", borderRadius: 9,
              background: !scope ? C.accentDim : "transparent", border: `1px solid ${!scope ? C.accentBorder : "transparent"}`,
              color: C.text, fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left",
            }}>
              All my classes
            </button>
            {!myClasses.length && <Empty icon={Users}>No classes yet — add one from Roster first.</Empty>}
            {myClasses.map((c) => {
              const groupsInClass = myGroups.filter((g) => g.classId === c.id);
              const classActive = scope === `class:${c.id}`;
              return (
                <div key={c.id}>
                  <button onClick={() => { setScope(`class:${c.id}`); setTeamsOpen(false); }} className="f" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 13px", borderRadius: 9,
                    background: classActive ? C.accentDim : "transparent", border: `1px solid ${classActive ? C.accentBorder : "transparent"}`,
                    color: C.text, fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", marginTop: 6,
                  }}>
                    {c.name}
                    <span style={{ fontSize: 11, color: C.steel, fontWeight: 500 }}>All groups</span>
                  </button>
                  {groupsInClass.map((g) => {
                    const groupActive = scope === `group:${g.id}`;
                    return (
                      <button key={g.id} onClick={() => { setScope(`group:${g.id}`); setTeamsOpen(false); }} className="f" style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 13px 9px 26px", borderRadius: 9,
                        background: groupActive ? C.accentDim : "transparent", border: `1px solid ${groupActive ? C.accentBorder : "transparent"}`,
                        color: C.textDim, fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left",
                      }}>
                        <span style={{ width: 4, height: 4, borderRadius: 4, background: C.steel, flexShrink: 0 }} />
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {editingEntry && (
        <Modal title={`Edit "${editingEntry.draft.name}"`} onClose={() => setEditingEntry(null)} wide>
          <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
            This saves your own copy just for {fmtDate(editingEntry.entry.date)} — the original session, and any other day using it, stays exactly as it was.
          </p>
          <SessionEditor db={db} value={editingEntry.draft} onChange={(v) => setEditingEntry({ ...editingEntry, draft: v })}
            saveLabel="Save copy for this day"
            onSave={() => {
              onSaveProgram(editingEntry.draft);
              onRepointSchedule(editingEntry.entry.id, editingEntry.draft.id);
              setEditingEntry(null);
            }}
            onCancel={() => setEditingEntry(null)} />
        </Modal>
      )}

      {usingStarter && (
        <Modal title="Use a starter program" onClose={() => setUsingStarter(false)} wide>
          <StarterProgramPicker db={db} teacherId={teacherId}
            handlers={{ saveProgram: onSaveProgram, saveCycle: onSaveCycle, applyCycle: onApplyCycle }}
            defaultDate={picking} defaultGroupIds={groupIds}
            onDone={() => { setUsingStarter(false); close(); }} />
        </Modal>
      )}
    </div>
  );
}

/* ===============================================================
   COACH: ROSTER — classes, groups, students
================================================================ */
// Lets a coach require a code before a student's self-registration
// into this specific class succeeds — optional, off unless set.
function ClassJoinCode({ klass, onPatchClass }) {
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(klass && klass.joinCode ? klass.joinCode : "");
  if (!klass) return null;
  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px" }}>
      {!editing ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: C.textDim }}>
            {klass.joinCode
              ? <>Class code required to self-join: <strong style={{ color: C.text }}>{klass.joinCode}</strong></>
              : "No class code set — anyone can add themselves to this class from the sign-in screen."}
          </span>
          <Button size="sm" variant="ghost" onClick={() => { setCode(klass.joinCode || ""); setEditing(true); }}>
            {klass.joinCode ? "Change" : "Set a code"}
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Field label="Class code" hint="Share this with your own students only. Leave blank to allow open self sign-up.">
              <input value={code} onChange={(e) => setCode(e.target.value)} className="f" style={inputCss} />
            </Field>
          </div>
          <Button size="sm" icon={Check} onClick={() => { onPatchClass(klass.id, { joinCode: code.trim() || null }); setEditing(false); }}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

function Roster({ db, teacherId, onAddClass, onPatchClass, onDeleteClass, onAddGroup, onDeleteGroup, onAddStudent, onPatchStudent, onDeleteStudent }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const [selClass, setSelClass] = useState(myClasses[0] ? myClasses[0].id : null);
  const [newClass, setNewClass] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [adding, setAdding] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkGroup, setBulkGroup] = useState("");
  const [nsName, setNsName] = useState("");
  const [nsGrad, setNsGrad] = useState("");
  const [nsGroup, setNsGroup] = useState("");
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(false);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(null);

  useEffect(() => {
    if (!selClass && myClasses.length) setSelClass(myClasses[0].id);
    if (selClass && !myClasses.find((c) => c.id === selClass)) setSelClass(myClasses[0] ? myClasses[0].id : null);
  }, [db.classes]);

  const groups = db.groups.filter((g) => g.classId === selClass);
  const students = db.students.filter((s) => s.classId === selClass);
  const startYear = schoolYearStart(today());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <Eyebrow icon={GraduationCap}>My classes</Eyebrow>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {myClasses.map((c) => (
            <Chip key={c.id} active={c.id === selClass} onClick={() => setSelClass(c.id)}>
              {c.name} · {db.students.filter((s) => s.classId === c.id).length}
            </Chip>
          ))}
          {!myClasses.length && <span style={{ fontSize: 13, color: C.textDim }}>No classes yet.</span>}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="New class, e.g. 3rd Period Weights" className="f" style={inputCss} />
          <Button icon={Plus} onClick={() => { if (newClass.trim()) { onAddClass(newClass.trim()); setNewClass(""); } }}>Add</Button>
        </div>
      </div>

      {selClass && (
        <>
          <ClassJoinCode klass={myClasses.find((c) => c.id === selClass)} onPatchClass={onPatchClass} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <Eyebrow icon={Users}>Training groups</Eyebrow>
              <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDeleteClass(true)}>Delete class</Button>
            </div>
            <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 11, lineHeight: 1.55 }}>
              Groups are how you give different students different work in the same period &mdash; split by sport, by training age, or however you run the room.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {groups.map((g) => (
                <span key={g.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 6px 4px 11px", fontSize: 12, fontWeight: 700 }}>
                  {g.name}
                  <span style={{ color: C.steel, fontWeight: 400 }}>{db.students.filter((s) => s.groupId === g.id).length}</span>
                  <button onClick={() => onDeleteGroup(g.id)} className="f" style={{ background: "none", border: "none", color: C.bad, cursor: "pointer", padding: 2, display: "flex" }} aria-label={`Delete ${g.name}`}><X size={13} /></button>
                </span>
              ))}
              {!groups.length && <span style={{ fontSize: 13, color: C.textDim }}>No groups in this class yet.</span>}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="New group, e.g. Football, or Beginners" className="f" style={inputCss} />
              <Button icon={Plus} onClick={() => { if (newGroup.trim()) { onAddGroup(selClass, newGroup.trim()); setNewGroup(""); } }}>Add</Button>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
              <Eyebrow icon={User}>Students</Eyebrow>
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="sm" variant="ghost" icon={Users} onClick={() => setBulkAdding(true)}>Bulk add</Button>
                <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>Add student</Button>
              </div>
            </div>
            {!students.length ? (
              <Empty icon={User}>Nobody on this roster yet. Add students here, or let them add themselves from the sign-in screen.</Empty>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {students.map((s, i) => {
                  const grade = gradeIn(s.gradYear, startYear);
                  return (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: i === students.length - 1 ? "none" : `1px solid ${C.border}`, flexWrap: "wrap" }}>
                      <Avatar person={s} size={32} />
                      <div style={{ flex: 1, minWidth: 130 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.steel }}>
                          {grade ? GRADE_NAME[grade] : "Grade not set"}{s.gradYear ? ` · class of ${s.gradYear}` : ""} · code {s.pin}
                        </div>
                      </div>
                      <select value={s.gender || ""} onChange={(e) => onPatchStudent(s.id, { gender: e.target.value || null })} className="f"
                        style={{ ...inputCss, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                        <option value="">Gender —</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                      <HeightPicker heightIn={s.heightIn} onChange={(h) => onPatchStudent(s.id, { heightIn: h })} />
                      <select value={s.groupId || ""} onChange={(e) => onPatchStudent(s.id, { groupId: e.target.value || null })} className="f"
                        style={{ ...inputCss, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                        <option value="">No group</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      {s.hideFromLeaderboard && <EyeOff size={14} color={C.textDim} aria-label="Hidden from leaderboards" />}
                      <Button size="sm" variant="danger" icon={Trash2} aria-label={`Remove ${s.name}`}
                        onClick={() => setConfirmDeleteStudent(s)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {adding && (
        <Modal title="Add student" onClose={() => setAdding(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Name"><input value={nsName} onChange={(e) => setNsName(e.target.value)} className="f" style={inputCss} /></Field>
            <Field label="Graduation year" hint="Drives the year-over-year view and their grade label.">
              <select value={nsGrad} onChange={(e) => setNsGrad(e.target.value)} className="f" style={inputCss}>
                <option value="">Not set</option>
                {[1, 2, 3, 4].map((n) => {
                  const y = startYear + n;
                  return <option key={y} value={y}>{y} &mdash; {GRADE_NAME[13 - n]}</option>;
                })}
              </select>
            </Field>
            <Field label="Group">
              <select value={nsGroup} onChange={(e) => setNsGroup(e.target.value)} className="f" style={inputCss}>
                <option value="">No group</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Button full icon={Check} disabled={!nsName.trim()}
              onClick={() => { onAddStudent({ name: nsName.trim(), classId: selClass, groupId: nsGroup || null, gradYear: nsGrad ? Number(nsGrad) : null }); setNsName(""); setNsGrad(""); setNsGroup(""); setAdding(false); }}>
              Add to roster
            </Button>
          </div>
        </Modal>
      )}

      {bulkAdding && (
        <Modal title="Bulk add students" onClose={() => { setBulkAdding(false); setBulkText(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Names" hint="One per line. Everyone goes into the group you pick below — you can move individuals later.">
              <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={8}
                placeholder={"Jordan Smith\nTaylor Reyes\nCasey Nguyen"} className="f" style={{ ...inputCss, resize: "vertical", fontFamily: "inherit" }} />
            </Field>
            <Field label="Group">
              <select value={bulkGroup} onChange={(e) => setBulkGroup(e.target.value)} className="f" style={inputCss}>
                <option value="">No group</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            {(() => {
              const names = bulkText.split("\n").map((n) => n.trim()).filter(Boolean);
              return (
                <>
                  <p style={{ fontSize: 12, color: C.steel, margin: 0 }}>{names.length} student{names.length === 1 ? "" : "s"} ready to add.</p>
                  <Button full icon={Check} disabled={!names.length}
                    onClick={() => {
                      names.forEach((name) => onAddStudent({ name, classId: selClass, groupId: bulkGroup || null, gradYear: null }));
                      setBulkText(""); setBulkGroup(""); setBulkAdding(false);
                    }}>
                    Add {names.length || ""} to roster
                  </Button>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      {confirmDeleteClass && (
        <ConfirmModal
          title="Delete class?"
          body="Students stay in the app but lose their class assignment. This can't be undone."
          confirmLabel="Delete class"
          onConfirm={() => onDeleteClass(selClass)}
          onClose={() => setConfirmDeleteClass(false)}
        />
      )}

      {confirmDeleteStudent && (
        <ConfirmModal
          title="Remove student?"
          body={`Remove ${confirmDeleteStudent.name} from the roster? This permanently deletes their logged history, check-ins, tested maxes, and Fuel tab data. This can't be undone.`}
          confirmLabel={`Remove ${confirmDeleteStudent.name}`}
          onConfirm={() => onDeleteStudent(confirmDeleteStudent.id)}
          onClose={() => setConfirmDeleteStudent(null)}
        />
      )}
    </div>
  );
}

/* ===============================================================
   COACH: ATHLETE DETAIL — including tested maxes
================================================================ */
// Shows what an athlete has actually checked off and typed in on their
// Fuel tab, most recent day first, so a coach can see it without asking.
function FuelHistory({ db, student }) {
  const slots = student.mealSlots && student.mealSlots.length ? student.mealSlots : DEFAULT_MEAL_SLOTS;
  const mealTitle = (id) => (slots.find((m) => m.id === id) || {}).name || "Meal";
  const records = [...(db.fuelLogs[student.id] || [])]
    .filter((r) => (r.foods && r.foods.length) || (r.water && r.water.length))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!records.length) {
    return <Empty icon={Apple}>Nothing logged on the Fuel tab yet.</Empty>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {records.slice(0, 14).map((r) => {
        const foods = r.foods || [];
        const totals = foods.reduce((acc, f) => ({
          kcal: acc.kcal + (Number(f.kcal) || 0),
          protein: acc.protein + (Number(f.protein) || 0),
        }), { kcal: 0, protein: 0 });
        const waterOz = (r.water || []).reduce((a, w) => a + (Number(w.oz) || 0), 0);
        return (
          <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.textDim, fontWeight: 700 }}>{fmtDate(r.date)}</span>
              {(totals.kcal > 0 || totals.protein > 0 || waterOz > 0) && (
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: C.steel }}>
                  {totals.kcal > 0 && <span>{Math.round(totals.kcal)} kcal</span>}
                  {totals.protein > 0 && <span>{Math.round(totals.protein)}g protein</span>}
                  {waterOz > 0 && <span>{Math.round(waterOz)} oz water</span>}
                </div>
              )}
            </div>
            {foods.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[...foods].sort((a, b) => a.time.localeCompare(b.time)).map((f) => {
                  const hasMacro = f.kcal || f.protein || f.carbs || f.fat;
                  return (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12.5, padding: "6px 9px", background: C.surfaceAlt, borderRadius: 7 }}>
                      <span style={{ minWidth: 0, overflowWrap: "break-word" }}>
                        <span style={{ color: C.accent, fontWeight: 600 }}>{mealTitle(f.mealId)}: </span>
                        {f.text}
                        {hasMacro && (
                          <span style={{ color: C.steel, fontSize: 10.5 }}>
                            {" — "}
                            {[f.kcal ? `${f.kcal} kcal` : null, f.protein ? `${f.protein}p` : null, f.carbs ? `${f.carbs}c` : null, f.fat ? `${f.fat}f` : null].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 10.5, color: C.steel, flexShrink: 0 }}>
                        {new Date(f.time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AthleteDetail({ db, student, onBack, onSetMax }) {
  const logs = db.logs[student.id] || [];
  const checkins = db.checkins[student.id] || [];
  const maxes = db.maxes[student.id] || {};
  const [maxEx, setMaxEx] = useState("Back Squat");
  const [maxVal, setMaxVal] = useState("");
  const lastBw = [...checkins].reverse().find((c) => c.bodyweight);
  const weightLifts = db.exercises.filter((n) => exMeta(n, db.custom).mode === "weight");

  const suggested = useMemo(() => {
    const rel = logs.filter((l) => l.exercise === maxEx && l.mode === "weight");
    if (!rel.length) return null;
    return Math.max(...rel.map((l) => epley1RM(l.weight, l.reps)));
  }, [logs, maxEx]);

  return (
    <div>
      <button onClick={onBack} className="f" style={{ display: "flex", alignItems: "center", gap: 3, color: C.textDim, background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 14 }}>
        <ChevronLeft size={16} /> All athletes
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar person={student} size={40} />
        <h2 className="d" style={{ fontSize: 26, textTransform: "uppercase", margin: 0 }}>{student.name}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(112px,1fr))", gap: 9, marginBottom: 18 }}>
        <Stat label="Sets logged" value={logs.length} />
        <Stat label="Days trained" value={new Set(logs.map((l) => l.date)).size} />
        {lastBw && <Stat label="Body weight" value={lastBw.bodyweight} unit="lb" />}
        {checkins.length > 0 && <Stat label="Avg readiness" value={Math.round(checkins.reduce((a, c) => a + c.score, 0) / checkins.length)} />}
      </div>

      <Card style={{ marginBottom: 18 }}>
        <Eyebrow icon={Award}>Badges</Eyebrow>
        <BadgeWall student={student} db={db} />
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <Eyebrow icon={Gauge}>Tested maxes</Eyebrow>
        <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
          Percentage-based prescriptions run off these. With no tested max on file, the app falls back to the best estimate from logged sets.
        </p>
        {Object.keys(maxes).length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.entries(maxes).map(([k, v]) => <Chip key={k} tone="gold">{k}: {v.value} lb</Chip>)}
          </div>
        )}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 150 }}>
            <Field label="Movement">
              <select value={maxEx} onChange={(e) => setMaxEx(e.target.value)} className="f" style={inputCss}>
                {weightLifts.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 96 }}>
            <Field label="Max (lb)" hint={suggested ? `Logged sets suggest ${suggested}` : undefined}>
              <input value={maxVal} onChange={(e) => setMaxVal(e.target.value)} inputMode="numeric" className="f" style={inputCss} />
            </Field>
          </div>
          <Button icon={Check} onClick={() => { const v = parseFloat(maxVal); if (v) { onSetMax(student.id, maxEx, v); setMaxVal(""); } }}>Save</Button>
        </div>
      </Card>

      <div style={{ marginBottom: 18 }}>
        <Eyebrow icon={Award}>Personal bests</Eyebrow>
        <PRBoard logs={logs} custom={db.custom} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <Eyebrow icon={GraduationCap}>Year over year</Eyebrow>
        <YearOverYear logs={logs} custom={db.custom} gradYear={student.gradYear} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <ExerciseHistory logs={logs} custom={db.custom} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <Eyebrow icon={Apple}>Fueling</Eyebrow>
        <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
          What this athlete has checked off and typed in on their own Fuel tab.
        </p>
        <FuelHistory db={db} student={student} />
      </div>

      <ExportPanel
        rows={[
          ["Date", "School year", "Movement", "Type", "Weight (lb)", "Reps", "Est. 1RM", "Seconds", "Distance", "Unit", "MPH", "Height (in)", "Velocity (m/s)", "RPE"],
          ...[...logs].sort((a, b) => a.date.localeCompare(b.date)).map((l) => [
            l.date, syLabel(schoolYearStart(l.date)), l.exercise, l.mode,
            l.mode === "weight" ? l.weight : "",
            l.mode === "weight" || l.mode === "reps" ? l.reps : "",
            l.mode === "weight" ? epley1RM(l.weight, l.reps) : "",
            l.mode === "sprint" ? l.seconds : "",
            l.mode === "sprint" ? l.dist || "" : "",
            l.mode === "sprint" ? l.unit || "" : l.mode === "measure" ? "in" : "",
            l.mode === "sprint" && l.dist ? toMph(l.dist, l.unit, l.seconds).toFixed(2) : "",
            l.mode === "measure" ? l.value : "",
            l.vel || "", l.rpe || "",
          ]),
        ]}
        filename={`${student.name.replace(/\s+/g, "-").toLowerCase()}-log.csv`}
        note="Every entry this athlete has logged, oldest first."
      />
    </div>
  );
}

/* ===============================================================
   COACH: LEADERBOARDS
   Three boards, on purpose. Raw load rewards the biggest kids;
   pound-for-pound and most-improved give everyone else a real shot.
================================================================ */
// Shared ranking logic — used by the coach's Boards screen and by the
// TV leaderboard, so both always agree on how a board is sorted.
// Exercises a specific pool of students has actually logged, for
// scoping a report's movement dropdown to what's relevant instead of
// the full global library — picking "Back Squat" for a group that
// only does goblet squats silently shows nothing, which reads as "this
// group isn't training" rather than "wrong movement selected."
function loggedExercisesFor(students, db) {
  const set = new Set();
  for (const s of students) for (const l of (db.logs[s.id] || [])) set.add(l.exercise);
  return [...set].sort();
}

function rankStudents(students, db, exercise, mode) {
  const meta = exMeta(exercise, db.custom);
  const out = [];
  for (const s of students) {
    if (s.hideFromLeaderboard) continue;
    const logs = (db.logs[s.id] || []).filter((l) => l.exercise === exercise);
    if (!logs.length) continue;
    const checkins = db.checkins[s.id] || [];
    const bw = [...checkins].reverse().find((c) => c.bodyweight);
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    // Baseline is the average of the first up-to-3 logged efforts, not
    // a single early data point — one lucky (or rough) first set
    // shouldn't be able to swing a percentage this hard. Rep-based
    // movements also get a floor on the denominator: going from 2 to 8
    // pull-ups is a real jump, but as a raw percentage (+300%) it can
    // dominate "Most Improved" in a way that isn't comparable to a
    // lift moving from 200 to 260 lb, so tiny starting rep counts get
    // floored rather than left free to blow the math up.
    const baseCount = Math.min(3, sorted.length);
    const baseSlice = sorted.slice(0, baseCount);
    let best, first, label;
    if (meta.mode === "weight") {
      const e = logs.map((l) => epley1RM(l.weight, l.reps));
      best = Math.max(...e);
      first = baseSlice.reduce((a, l) => a + epley1RM(l.weight, l.reps), 0) / baseCount;
      label = `${best} lb`;
    } else if (meta.mode === "sprint") {
      best = Math.min(...logs.map((l) => l.seconds));
      first = baseSlice.reduce((a, l) => a + l.seconds, 0) / baseCount;
      label = `${best.toFixed(2)}s`;
    } else {
      const key = meta.mode === "reps" ? "reps" : "value";
      best = Math.max(...logs.map((l) => l[key]));
      first = baseSlice.reduce((a, l) => a + l[key], 0) / baseCount;
      if (meta.mode === "reps") first = Math.max(first, 3);
      label = meta.mode === "reps" ? `${best} reps` : `${best} ${meta.unit || ""}`;
    }
    const improve = first ? (meta.mode === "sprint" ? ((first - best) / first) * 100 : ((best - first) / first) * 100) : 0;
    const p4p = bw && meta.mode === "weight" ? best / bw.bodyweight : null;
    out.push({ student: s, best, label, improve, p4p, sessions: logs.length });
  }
  if (mode === "load") out.sort((a, b) => (meta.mode === "sprint" ? a.best - b.best : b.best - a.best));
  if (mode === "p4p") out.sort((a, b) => (b.p4p || -1) - (a.p4p || -1));
  if (mode === "improve") out.sort((a, b) => b.improve - a.improve);
  return out;
}

// Polls storage for the two most dynamic pieces of data — logs and
// check-ins — while a TV screen is open, since a coach's browser has
// no way to know a student logged a set from their own phone otherwise.
function useLiveTraining(active, pollMs = 20000) {
  const [data, setData] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  useEffect(() => {
    if (!active) return;
    let live = true;
    const load = async () => {
      const [ci, st, prf, tc] = await Promise.all([sGet(K("checkins")), sGet(K("students")), sGet(K("prFeed")), sGet(K("teachers"))]);
      if (!live) return;
      // Logs are sharded per person now — fetch each shard for whoever
      // could be on this board (every student plus every teacher, since
      // staff can log their own training too).
      const allIds = [...new Set([...(st || []).map((x) => x.id), ...(tc || []).map((x) => x.id)])];
      const shardResults = await Promise.all(allIds.map((id) => sGet(K("logs:" + id))));
      if (!live) return;
      const logsObj = {};
      allIds.forEach((id, i) => { if (shardResults[i] && shardResults[i].length) logsObj[id] = shardResults[i]; });
      setData({ logs: logsObj, checkins: ci || {}, students: st || [], prFeed: prf || [] });
      setUpdatedAt(new Date());
    };
    load();
    const t = setInterval(load, pollMs);
    return () => { live = false; clearInterval(t); };
  }, [active, pollMs]);
  return { data, updatedAt };
}

// Flashes full-screen the moment a new PR lands in the shared feed
// while a TV is open — the kind of thing that makes a room actually
// look up. Only reacts to PRs recorded after the overlay mounted, so
// walking up to an already-running TV never dumps a backlog on screen.
function PRCelebration({ prFeed, students }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const seenRef = useRef(null);

  useEffect(() => {
    if (seenRef.current === null) {
      seenRef.current = new Set(prFeed.map((p) => p.id));
      return;
    }
    const fresh = prFeed.filter((p) => !seenRef.current.has(p.id));
    if (fresh.length) {
      fresh.forEach((p) => seenRef.current.add(p.id));
      setQueue((q) => [...q, ...fresh]);
    }
  }, [prFeed]);

  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), 5000);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;
  const student = students.find((s) => s.id === current.studentId);
  return (
    <div className="pop" style={{
      position: "fixed", inset: 0, zIndex: 400, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(26,14,43,0.94)",
      pointerEvents: "none",
    }}>
      <Flame size={64} color={C.accent} />
      <div className="d" style={{ fontSize: 15, letterSpacing: 4, color: C.accent, textTransform: "uppercase" }}>New PR</div>
      <div className="d" style={{ fontSize: 52, textTransform: "uppercase", textAlign: "center", padding: "0 20px" }}>{student ? student.name : "Someone"}</div>
      <div style={{ fontSize: 22, color: C.text, fontWeight: 700 }}>{current.exercise}</div>
      <div className="d" style={{ fontSize: 30, color: C.accent }}>{current.display}</div>
    </div>
  );
}

// Full-screen leaderboard for a TV/monitor: every one of the coach's
// classes gets its own board, plus one combined board across all of
// them. Polls storage live so a set logged from a student's own phone
// shows up here without anyone touching the TV.
function LeaderboardTVDisplay({ db, teacherId, exercise, mode, splitGender, onClose }) {
  const { data: live, updatedAt } = useLiveTraining(true, 8000);
  const liveDb = live ? { ...db, logs: live.logs, checkins: live.checkins, students: live.students, prFeed: live.prFeed } : db;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const myClasses = liveDb.classes.filter((c) => c.teacherId === teacherId);
  const myStudents = liveDb.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const meta = exMeta(exercise, liveDb.custom);
  const modeLabel = mode === "improve" ? "Most Improved" : mode === "p4p" ? "Pound for Pound" : meta.mode === "sprint" ? "Fastest" : "Top Load";

  const board = (students, limit, gender) => {
    const filtered = gender ? students.filter((s) => s.gender === gender) : students;
    return rankStudents(filtered, liveDb, exercise, mode).slice(0, limit);
  };
  const scoreText = (r) =>
    mode === "improve" ? `${r.improve > 0 ? "+" : ""}${r.improve.toFixed(0)}%`
    : mode === "p4p" ? (r.p4p ? `${r.p4p.toFixed(2)}×` : "—")
    : r.label;

  const BoardTable = ({ title, rows, gold }) => (
    <div style={{ background: C.surface, border: `1px solid ${gold ? C.accentBorder : C.border}`, borderRadius: 14, padding: "18px 20px", minWidth: 0 }}>
      <div className="d" style={{ fontSize: gold ? 24 : 19, color: gold ? C.accent : C.text, textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      {!rows.length ? (
        <div style={{ fontSize: 14, color: C.steel }}>No one has logged {exercise} yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((r, i) => (
            <div key={r.student.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: gold ? "10px 0" : "7px 0", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span className="d" style={{ width: gold ? 30 : 22, textAlign: "center", fontSize: gold ? 20 : 15, color: i === 0 ? C.accent : C.textDim, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: gold ? 19 : 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.student.name}</span>
              </div>
              <span className="d" style={{ fontSize: gold ? 20 : 16, color: C.accent, flexShrink: 0 }}>{scoreText(r)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Build the class-level board list flat, so split-by-gender just
  // doubles up entries instead of needing separate render branches.
  const classBoards = myClasses.flatMap((c) => {
    const inClass = liveDb.students.filter((s) => s.classId === c.id);
    return splitGender
      ? [
          { key: `${c.id}-m`, title: `${c.name} — Male`, rows: board(inClass, 6, "M") },
          { key: `${c.id}-f`, title: `${c.name} — Female`, rows: board(inClass, 6, "F") },
        ]
      : [{ key: c.id, title: c.name, rows: board(inClass, 6) }];
  });

  return (
    <div className="b" style={{ position: "fixed", inset: 0, zIndex: 300, background: C.bg, color: C.text, overflowY: "auto", padding: "36px 5vw 60px" }}>
      <button onClick={onClose} className="f" style={{
        position: "fixed", top: 20, right: 24, zIndex: 310,
        background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10,
        color: C.text, padding: "10px 16px", fontSize: 15, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <X size={20} /> Exit
      </button>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6, flexWrap: "wrap" }}>
          <Helmet size={54} />
          <div>
            <div style={{ fontSize: 14, letterSpacing: 3, color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>
              Sentinel Spartans
            </div>
            <div className="d" style={{ fontSize: 42, textTransform: "uppercase", lineHeight: 1.05 }}>{exercise} — {modeLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 15, color: C.textDim, flexWrap: "wrap" }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: C.good, display: "inline-block" }} />
          Live{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" })}` : "…"}
        </div>
        {splitGender && (
          <div style={{ fontSize: 13, color: C.steel, marginBottom: 26 }}>Split by gender — athletes without a gender on file aren&rsquo;t shown here.</div>
        )}
        {!splitGender && <div style={{ marginBottom: 26 }} />}

        {splitGender ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 30 }}>
            <BoardTable title="Overall — Male" rows={board(myStudents, 10, "M")} gold />
            <BoardTable title="Overall — Female" rows={board(myStudents, 10, "F")} gold />
          </div>
        ) : (
          <div style={{ marginBottom: 30 }}>
            <BoardTable title="Overall — All Classes" rows={board(myStudents, 10)} gold />
          </div>
        )}

        {classBoards.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            {classBoards.map((b) => <BoardTable key={b.key} title={b.title} rows={b.rows} />)}
          </div>
        )}

        <p style={{ fontSize: 13, color: C.steel, marginTop: 28 }}>Press Esc or tap Exit to close. Refreshes automatically every 8 seconds.</p>
      </div>
      <PRCelebration prFeed={liveDb.prFeed || []} students={liveDb.students} />
    </div>
  );
}

// Shared athlete-scope picker for every report: all my athletes, a
// whole class, a single group, or one individual athlete — one control
// instead of a bare group-only dropdown.
function ScopeSelect({ myClasses, myGroups, myStudents, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="f"
      style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
      <option value="">All my athletes</option>
      {myClasses.length > 1 && (
        <optgroup label="Classes">
          {myClasses.map((c) => <option key={c.id} value={`class:${c.id}`}>{c.name}</option>)}
        </optgroup>
      )}
      {myGroups.length > 0 && (
        <optgroup label="Groups">
          {myGroups.map((g) => {
            const cls = myClasses.find((c) => c.id === g.classId);
            const label = myClasses.length > 1 && cls ? `${cls.name} — ${g.name}` : g.name;
            return <option key={g.id} value={`group:${g.id}`}>{label}</option>;
          })}
        </optgroup>
      )}
      {myStudents.length > 0 && (
        <optgroup label="Individual athletes">
          {[...myStudents].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
            <option key={s.id} value={`athlete:${s.id}`}>{s.name}</option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
function applyScope(students, scope) {
  if (!scope) return students;
  const i = scope.indexOf(":");
  const kind = scope.slice(0, i), id = scope.slice(i + 1);
  if (kind === "class") return students.filter((s) => s.classId === id);
  if (kind === "group") return students.filter((s) => s.groupId === id);
  if (kind === "athlete") return students.filter((s) => s.id === id);
  return students;
}

// Exercise-independent, unlike every other board — ranked by
// consecutive days logging anything at all. The board a kid who's
// never going to top a strength leaderboard can still win.
function rankByStreak(students, db) {
  return students
    .filter((s) => !s.hideFromLeaderboard)
    .map((s) => ({ student: s, streak: computeStreak(db.logs[s.id] || []), sessions: (db.logs[s.id] || []).length }))
    .filter((r) => r.streak > 0)
    .sort((a, b) => b.streak - a.streak);
}

function Boards({ db, teacherId }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const [mode, setMode] = useState("load");
  const [exercise, setExercise] = useState("Back Squat");
  const [scope, setScope] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [splitGender, setSplitGender] = useState(false);
  const [tvOpen, setTvOpen] = useState(false);

  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const meta = exMeta(exercise, db.custom);
  const pool = applyScope(myStudents, scope)
    .filter((s) => (genderFilter ? s.gender === genderFilter : true));

  const rows = useMemo(
    () => (mode === "streak" ? rankByStreak(pool, db) : rankStudents(pool, db, exercise, mode)),
    [pool, exercise, mode, db.logs, db.checkins, db.custom]
  );
  const exerciseOptions = useMemo(() => {
    const scoped = loggedExercisesFor(pool, db);
    return scoped.length ? scoped : db.exercises;
  }, [pool, db.logs, db.exercises]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {mode !== "streak" && (
          <select value={exercise} onChange={(e) => setExercise(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
            {exerciseOptions.map((n) => <option key={n}>{n}</option>)}
          </select>
        )}
        <ScopeSelect myClasses={myClasses} myGroups={myGroups} myStudents={myStudents} value={scope} onChange={setScope} />
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          <option value="">All genders</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textDim, cursor: "pointer" }}>
          <input type="checkbox" checked={splitGender} onChange={(e) => setSplitGender(e.target.checked)} />
          Split TV by gender
        </label>
        <Button size="sm" variant="subtle" icon={Monitor} disabled={mode === "p4p" || mode === "streak"} onClick={() => setTvOpen(true)} style={{ marginLeft: "auto" }}>
          Display on TV
        </Button>
      </div>

      <Tabs value={mode} onChange={setMode} tabs={[
        { id: "load", label: meta.mode === "sprint" ? "Fastest" : "Top load" },
        { id: "p4p", label: "Pound for pound" },
        { id: "improve", label: "Most improved" },
        { id: "streak", label: "Consistency" },
      ]} />

      {mode === "p4p" && (
        <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12, lineHeight: 1.55 }}>
          Coach-only board. Needs a body weight on file, and it stays off student screens and the TV display so nobody&rsquo;s weight is inferable from a ranking.
        </p>
      )}
      {mode === "improve" && (
        <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12, lineHeight: 1.55 }}>
          Percentage gain from first logged effort to best. The board a beginner can actually win.
        </p>
      )}
      {mode === "streak" && (
        <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12, lineHeight: 1.55 }}>
          Consecutive days logging anything at all — not tied to one exercise. Doesn&rsquo;t need a specific lift picked above.
        </p>
      )}

      {!rows.length ? (
        <Empty icon={BarChart3}>{mode === "streak" ? "Nobody has an active streak in this selection yet." : `Nothing logged on ${exercise} yet for this selection.`}</Empty>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={r.student.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 14px", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span className="d" style={{ width: 22, textAlign: "center", fontSize: 16, color: i === 0 ? C.accent : C.textDim }}>{i + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.student.name}</div>
                  <div style={{ fontSize: 11, color: C.steel }}>{r.sessions} logged</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                {mode === "streak" ? (
                  <span className="d" style={{ fontSize: 18, color: C.accent, display: "flex", alignItems: "center", gap: 5 }}><Flame size={16} />{r.streak} day{r.streak === 1 ? "" : "s"}</span>
                ) : mode === "improve" ? (
                  <span className="d" style={{ fontSize: 18, color: r.improve > 0 ? C.good : C.textDim }}>{r.improve > 0 ? "+" : ""}{r.improve.toFixed(0)}%</span>
                ) : mode === "p4p" ? (
                  <span className="d" style={{ fontSize: 18, color: r.p4p ? C.accent : C.border }}>{r.p4p ? r.p4p.toFixed(2) + "×" : "no weight"}</span>
                ) : (
                  <span className="d" style={{ fontSize: 18, color: C.accent }}>{r.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tvOpen && (
        <LeaderboardTVDisplay db={db} teacherId={teacherId} exercise={exercise} mode={mode === "p4p" ? "load" : mode} splitGender={splitGender} onClose={() => setTvOpen(false)} />
      )}
    </div>
  );
}

/* ===============================================================
   COACH: REPORTS
   Three views. The first mirrors the team 1RM progress report the
   staff already reads: one row per athlete, first effort against
   best effort, difference in pounds and percent.
================================================================ */
function toDelimited(rows, sep) {
  return rows.map((r) => r.map((c) => {
    const s = c == null ? "" : String(c);
    if (sep === "," && /[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s.replace(/\t/g, " ");
  }).join(sep)).join("\n");
}

function splitName(full) {
  const parts = String(full || "").trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { last: parts[parts.length - 1], first: parts.slice(0, -1).join(" ") };
}

function ExportPanel({ rows, filename, note }) {
  const [msg, setMsg] = useState(null);
  const tsv = useMemo(() => toDelimited(rows, "\t"), [rows]);
  const csv = useMemo(() => toDelimited(rows, ","), [rows]);
  const areaRef = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tsv);
      setMsg("Copied. Paste straight into a Google Sheet — it lands in columns.");
    } catch {
      if (areaRef.current) { areaRef.current.focus(); areaRef.current.select(); }
      setMsg("Clipboard is blocked here. The grid below is selected — copy it manually, then paste into Sheets.");
    }
    setTimeout(() => setMsg(null), 9000);
  };

  const download = () => {
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMsg("CSV downloaded. In Sheets: File, then Import, then upload it.");
    } catch {
      setMsg("Download is blocked here — use Copy for Sheets instead.");
    }
    setTimeout(() => setMsg(null), 9000);
  };

  return (
    <Card>
      <Eyebrow icon={Table}>Send to a spreadsheet</Eyebrow>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Button size="sm" icon={Copy} onClick={copy}>Copy for Sheets</Button>
        <Button size="sm" variant="ghost" icon={Download} onClick={download}>Download CSV</Button>
      </div>
      {msg && <div className="rise" style={{ fontSize: 12, color: C.accent, marginBottom: 12, lineHeight: 1.5 }}>{msg}</div>}
      <textarea ref={areaRef} readOnly value={tsv} rows={5} onFocus={(e) => e.target.select()} className="f sc"
        style={{ ...inputCss, fontSize: 11, fontFamily: "ui-monospace, monospace", resize: "vertical", whiteSpace: "pre", overflowX: "auto" }} />
      <p style={{ fontSize: 11, color: C.steel, marginTop: 10, lineHeight: 1.6 }}>
        {Math.max(0, rows.length - 1)} {rows.length === 2 ? "row" : "rows"}. {note || "This is a copy-and-paste export, not a live link — a Sheet that refreshes on its own would need the Google Sheets API and a hosted backend."}
      </p>
    </Card>
  );
}

/* ---- view 1: progress on one movement, whole roster ---- */
const RANGES = [
  { id: "all", label: "All time", days: null },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "This quarter", days: 90 },
  { id: "365", label: "This year", days: 365 },
];

// Monday of the week a date falls in — the bucket key for weekly
// volume trends, so a training week reads as one bar regardless of
// which day of the week an athlete actually logged.
function weekKey(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return iso(monday);
}
function shortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
// Total tonnage (weight × reps, summed across sets) — the standard
// stand-in for how much work was actually done, independent of 1RM.
function computeVolume(logs, since) {
  const rel = logs.filter((l) => l.mode === "weight" && (!since || l.date >= since));
  const byWeek = {};
  let total = 0, sets = 0;
  for (const l of rel) {
    const v = (Number(l.weight) || 0) * (Number(l.reps) || 0);
    total += v; sets += 1;
    const wk = weekKey(l.date);
    byWeek[wk] = (byWeek[wk] || 0) + v;
  }
  return { total, sets, byWeek };
}

/* ===============================================================
   SHARED TEAM/CLASS GOALS — a target the whole group works toward
   together. Progress is computed live from data that already exists
   (volume, training days, attendance) rather than tracked separately.
================================================================ */
function goalScopeStudents(goal, db) {
  const kind = goal.scope.slice(0, goal.scope.indexOf(":"));
  const id = goal.scope.slice(goal.scope.indexOf(":") + 1);
  if (kind === "class") {
    const classGroupIds = db.groups.filter((g) => g.classId === id).map((g) => g.id);
    return db.students.filter((s) => classGroupIds.includes(s.groupId));
  }
  return db.students.filter((s) => s.groupId === id);
}
function goalProgress(goal, db) {
  const students = goalScopeStudents(goal, db);
  let current = 0;
  if (goal.type === "volume") {
    current = Math.round(students.reduce((a, s) => a + computeVolume(db.logs[s.id] || [], null).total, 0));
  } else if (goal.type === "sessions") {
    current = students.reduce((a, s) => a + new Set((db.logs[s.id] || []).map((l) => l.date)).size, 0);
  } else if (goal.type === "attendance") {
    let present = 0, marked = 0;
    students.forEach((s) => (db.attendance[s.id] || []).forEach((a) => { marked++; if (a.present) present++; }));
    current = marked ? Math.round((present / marked) * 100) : 0;
  }
  return { current, target: goal.target, pct: goal.target ? Math.min(100, (current / goal.target) * 100) : 0 };
}
const GOAL_TYPES = {
  volume: { label: "Total volume (lb)", unit: "lb" },
  sessions: { label: "Training days logged", unit: "days" },
  attendance: { label: "Attendance rate", unit: "%" },
};

function GoalProgressBar({ goal, db }) {
  const p = goalProgress(goal, db);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
        <span style={{ fontWeight: 700 }}>{goal.name}</span>
        <span style={{ color: C.textDim }}>{p.current.toLocaleString()} / {p.target.toLocaleString()} {GOAL_TYPES[goal.type].unit}</span>
      </div>
      <div style={{ height: 9, borderRadius: 5, background: C.surfaceAlt, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p.pct}%`, background: p.pct >= 100 ? C.good : C.accent, borderRadius: 5, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

// Coach-facing goal CRUD, shown on the daily driver screen (CoachToday)
// so setting and checking a team goal never needs a separate tab.
function GoalsPanel({ db, teacherId, onSaveGoal, onDeleteGoal }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myGoals = db.goals.filter((g) => {
    const kind = g.scope.slice(0, g.scope.indexOf(":"));
    const id = g.scope.slice(g.scope.indexOf(":") + 1);
    return kind === "class" ? myClasses.find((c) => c.id === id) : myGroups.find((x) => x.id === id);
  });
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("volume");
  const [target, setTarget] = useState("");
  const [scope, setScope] = useState("");

  const save = () => {
    if (!name.trim() || !target || !scope) return;
    onSaveGoal({ id: uid(), name: name.trim(), type, target: Number(target), scope });
    setName(""); setTarget(""); setScope(""); setCreating(false);
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: myGoals.length || creating ? 12 : 0 }}>
        <Eyebrow icon={Award}>Team goals</Eyebrow>
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => setCreating(!creating)}>{creating ? "Cancel" : "New goal"}</Button>
      </div>

      {creating && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, background: C.surfaceAlt, borderRadius: 10, padding: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Goal name — e.g. November Volume Push" className="f" style={{ ...inputCss, fontSize: 13 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={type} onChange={(e) => setType(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13 }}>
              {Object.entries(GOAL_TYPES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
            </select>
            <input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Target" className="f" style={{ ...inputCss, width: 100, fontSize: 13 }} />
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13 }}>
              <option value="">Which group?</option>
              {myClasses.length > 1 && myClasses.map((c) => <option key={c.id} value={`class:${c.id}`}>{c.name} (whole class)</option>)}
              {myGroups.map((g) => <option key={g.id} value={`group:${g.id}`}>{g.name}</option>)}
            </select>
          </div>
          <Button size="sm" icon={Check} disabled={!name.trim() || !target || !scope} onClick={save}>Save goal</Button>
        </div>
      )}

      {myGoals.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myGoals.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}><GoalProgressBar goal={g} db={db} /></div>
              <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onDeleteGoal(g.id)} aria-label="Delete goal" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// A note the coach can push straight to a class or group's Training
// tab — "no lift Friday, pep rally" — without needing a separate app.
function AnnouncementsPanel({ db, teacherId, onSaveAnnouncement, onDeleteAnnouncement }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myAnnouncements = db.announcements
    .filter((a) => {
      const kind = a.scope.slice(0, a.scope.indexOf(":"));
      const id = a.scope.slice(a.scope.indexOf(":") + 1);
      return kind === "class" ? myClasses.find((c) => c.id === id) : myGroups.find((x) => x.id === id);
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  const [creating, setCreating] = useState(false);
  const [text, setText] = useState("");
  const [scope, setScope] = useState("");

  const save = () => {
    if (!text.trim() || !scope) return;
    onSaveAnnouncement({ id: uid(), text: text.trim(), scope, date: today(), teacherId });
    setText(""); setScope(""); setCreating(false);
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: myAnnouncements.length || creating ? 12 : 0 }}>
        <Eyebrow icon={MessageSquare}>Announcements</Eyebrow>
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => setCreating(!creating)}>{creating ? "Cancel" : "New"}</Button>
      </div>

      {creating && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, background: C.surfaceAlt, borderRadius: 10, padding: 12 }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="No lift Friday — pep rally schedule" className="f" style={{ ...inputCss, resize: "vertical" }} />
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13 }}>
            <option value="">Who sees this?</option>
            {myClasses.length > 1 && myClasses.map((c) => <option key={c.id} value={`class:${c.id}`}>{c.name} (whole class)</option>)}
            {myGroups.map((g) => <option key={g.id} value={`group:${g.id}`}>{g.name}</option>)}
          </select>
          <Button size="sm" icon={Check} disabled={!text.trim() || !scope} onClick={save}>Post</Button>
        </div>
      )}

      {myAnnouncements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myAnnouncements.map((a) => {
            const kind = a.scope.slice(0, a.scope.indexOf(":"));
            const id = a.scope.slice(a.scope.indexOf(":") + 1);
            const label = kind === "class" ? (myClasses.find((c) => c.id === id) || {}).name : (myGroups.find((g) => g.id === id) || {}).name;
            return (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, background: C.surfaceAlt, borderRadius: 9, padding: "9px 12px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5 }}>{a.text}</div>
                  <div style={{ fontSize: 10.5, color: C.steel, marginTop: 3 }}>{label} · {fmtDate(a.date)}</div>
                </div>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onDeleteAnnouncement(a.id)} aria-label="Delete announcement" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// Simple bar trend, sized for a coach report rather than an inline
// sparkline — used for weekly volume, but generic over any {label,value} series.
function TrendChart({ series, height = 130, color = C.accent, valueFmt }) {
  if (!series || !series.length) return <div style={{ fontSize: 12, color: C.steel }}>Not enough data yet for a trend.</div>;
  const max = Math.max(...series.map((s) => s.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, overflowX: "auto", padding: "0 2px 2px" }}>
      {series.map((s, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 30, flex: series.length < 10 ? 1 : "0 0 auto" }}>
          <span style={{ fontSize: 9.5, color: C.textDim, whiteSpace: "nowrap" }}>{valueFmt ? valueFmt(s.value) : s.value}</span>
          <div style={{
            width: 22, height: Math.max(3, (s.value / max) * (height - 40)),
            background: color, borderRadius: "3px 3px 0 0",
          }} />
          <span style={{ fontSize: 9, color: C.steel, whiteSpace: "nowrap" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- coach-facing volume load tracking ---- */
function VolumeReport({ db, teacherId }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const [scope, setScope] = useState("");
  const [range, setRange] = useState("90");

  const from = useMemo(() => {
    const r = RANGES.find((x) => x.id === range);
    return r && r.days ? addDays(today(), -r.days) : null;
  }, [range]);

  const pool = applyScope(myStudents, scope);

  const rows = useMemo(() => pool.map((s) => {
    const v = computeVolume(db.logs[s.id] || [], from);
    return { student: s, ...v };
  }).sort((a, b) => b.total - a.total), [pool, db.logs, from]);

  // Aggregate weekly totals across the whole selection for the trend chart.
  const weeklySeries = useMemo(() => {
    const combined = {};
    for (const r of rows) {
      for (const [wk, v] of Object.entries(r.byWeek)) combined[wk] = (combined[wk] || 0) + v;
    }
    return Object.entries(combined)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([wk, v]) => ({ label: shortDate(wk), value: Math.round(v) }));
  }, [rows]);

  const exportRows = useMemo(() => [
    ["Last name", "First name", "Total volume (lb)", "Sets logged", "Avg volume per set"],
    ...rows.map((r) => {
      const nm = splitName(r.student.name);
      return [nm.last, nm.first, Math.round(r.total), r.sets, r.sets ? Math.round(r.total / r.sets) : ""];
    }),
  ], [rows]);

  const teamTotal = rows.reduce((a, r) => a + r.total, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ScopeSelect myClasses={myClasses} myGroups={myGroups} myStudents={myStudents} value={scope} onChange={setScope} />
        <select value={range} onChange={(e) => setRange(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {!rows.some((r) => r.sets) ? (
        <Empty icon={Activity}>No loaded sets logged in this selection and window yet. Volume only counts weighted work — bodyweight, timed, and measured movements aren&rsquo;t tonnage.</Empty>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 9 }}>
            <Stat label="Total volume" value={Math.round(teamTotal).toLocaleString()} unit="lb" />
            <Stat label="Athletes with data" value={rows.filter((r) => r.sets).length} />
            <Stat label="Total sets logged" value={rows.reduce((a, r) => a + r.sets, 0)} />
          </div>

          <Card>
            <Eyebrow icon={Activity}>Weekly volume trend</Eyebrow>
            <TrendChart series={weeklySeries} valueFmt={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
          </Card>

          <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 480 }}>
              <thead>
                <tr>
                  {[{ h: "Athlete", a: "left" }, { h: "Total volume", a: "right" }, { h: "Sets logged", a: "right" }, { h: "Avg / set", a: "right" }].map((c) => (
                    <th key={c.h} style={{
                      textAlign: c.a, padding: "11px 12px", color: C.textDim, fontSize: 9.5,
                      textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}`,
                    }}>{c.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student.id}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.student.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.sets ? Math.round(r.total).toLocaleString() : <span style={{ color: C.border }}>—</span>}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.sets || <span style={{ color: C.border }}>—</span>}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.sets ? Math.round(r.total / r.sets) : <span style={{ color: C.border }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 11.5, color: C.steel, lineHeight: 1.6 }}>
            Volume load is total tonnage — weight × reps, summed across every logged set of loaded work. It's a workload signal, not a quality one: a big jump week-to-week is worth a look, whether that's a good sign (progressive overload) or a bad one (piling on too fast).
          </div>

          <ExportPanel rows={exportRows} filename="volume-load.csv" />
        </>
      )}
    </div>
  );
}

/* ---- attendance + adherence: who showed up, who did the work ---- */
function studentAssignedDates(schedule, groupId, from, upTo) {
  if (!groupId) return [];
  const dates = new Set();
  for (const s of schedule) {
    if (s.groupIds.includes(groupId) && (!from || s.date >= from) && s.date <= upTo) dates.add(s.date);
  }
  return [...dates];
}

function AttendanceReport({ db, teacherId, handlers }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const [scope, setScope] = useState("");
  const [range, setRange] = useState("30");
  const [takeDate, setTakeDate] = useState(today());

  const from = useMemo(() => {
    const r = RANGES.find((x) => x.id === range);
    return r && r.days ? addDays(today(), -r.days) : null;
  }, [range]);

  const pool = applyScope(myStudents, scope);

  const rows = useMemo(() => pool.map((s) => {
    const assignedDates = studentAssignedDates(db.schedule, s.groupId, from, today());
    const marks = (db.attendance[s.id] || []).filter((a) => (!from || a.date >= from) && a.date <= today());
    const present = marks.filter((a) => a.present).length;
    const logged = new Set((db.logs[s.id] || []).map((l) => l.date));
    const completedDays = assignedDates.filter((d) => logged.has(d)).length;
    return {
      student: s,
      assigned: assignedDates.length,
      marked: marks.length, present,
      attendanceRate: marks.length ? present / marks.length : null,
      completionRate: assignedDates.length ? completedDays / assignedDates.length : null,
    };
  }).sort((a, b) => (a.attendanceRate ?? 1) - (b.attendanceRate ?? 1)), [pool, db.schedule, db.attendance, db.logs, from]);

  const exportRows = useMemo(() => [
    ["Last name", "First name", "Sessions assigned", "Days marked", "Days present", "Attendance %", "Completion %"],
    ...rows.map((r) => {
      const nm = splitName(r.student.name);
      return [nm.last, nm.first, r.assigned, r.marked, r.present,
        r.attendanceRate == null ? "" : Math.round(r.attendanceRate * 100),
        r.completionRate == null ? "" : Math.round(r.completionRate * 100)];
    }),
  ], [rows]);

  const takePool = scope ? pool : (myGroups[0] ? myStudents.filter((s) => s.groupId === myGroups[0].id) : []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Eyebrow icon={CalendarCheck}>Take attendance</Eyebrow>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <input type="date" value={takeDate} onChange={(e) => setTakeDate(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }} />
          {!scope && <span style={{ fontSize: 11.5, color: C.steel, alignSelf: "center" }}>Pick a group or class below to take attendance for a specific roster.</span>}
        </div>
        {!takePool.length ? (
          <Empty icon={Users}>No group selected yet — use the filter below to pick who you're taking attendance for.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {takePool.map((s) => {
              const mark = (db.attendance[s.id] || []).find((a) => a.date === takeDate);
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", background: C.surfaceAlt, borderRadius: 9 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button size="sm" variant={mark && mark.present ? "primary" : "ghost"} onClick={() => handlers.markAttendance(s.id, takeDate, true)}>Present</Button>
                    <Button size="sm" variant={mark && !mark.present ? "danger" : "ghost"} onClick={() => handlers.markAttendance(s.id, takeDate, false)}>Absent</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ScopeSelect myClasses={myClasses} myGroups={myGroups} myStudents={myStudents} value={scope} onChange={setScope} />
        <select value={range} onChange={(e) => setRange(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {!rows.length ? (
        <Empty icon={CalendarCheck}>No athletes in this selection yet.</Empty>
      ) : (
        <>
          <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
              <thead>
                <tr>
                  {[{ h: "Athlete", a: "left" }, { h: "Assigned", a: "right" }, { h: "Attendance", a: "right" }, { h: "Completion", a: "right" }].map((c) => (
                    <th key={c.h} style={{
                      textAlign: c.a, padding: "11px 12px", color: C.textDim, fontSize: 9.5,
                      textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}`,
                    }}>{c.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student.id}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.student.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.assigned || <span style={{ color: C.border }}>—</span>}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>
                      {r.attendanceRate == null ? <span style={{ color: C.border }}>not taken</span> : (
                        <span style={{ fontWeight: 700, color: r.attendanceRate >= 0.9 ? C.good : r.attendanceRate >= 0.75 ? C.warn : C.bad }}>{Math.round(r.attendanceRate * 100)}%</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>
                      {r.completionRate == null ? <span style={{ color: C.border }}>—</span> : (
                        <span style={{ fontWeight: 700, color: r.completionRate >= 0.9 ? C.good : r.completionRate >= 0.75 ? C.warn : C.bad }}>{Math.round(r.completionRate * 100)}%</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 11.5, color: C.steel, lineHeight: 1.6 }}>
            <strong style={{ color: C.textDim }}>Attendance</strong> comes only from marks you take above — an athlete with no marks shows &ldquo;not taken,&rdquo; not 0%.{" "}
            <strong style={{ color: C.textDim }}>Completion</strong> compares assigned session days against days they logged anything at all, so it's a workout-completion signal even on days you never took roll.
          </div>

          <ExportPanel rows={exportRows} filename="attendance-adherence.csv" />
        </>
      )}
    </div>
  );
}

function ProgressReport({ db, teacherId }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const [exercise, setExercise] = useState("Bench Press");
  const [scope, setScope] = useState("");
  const [range, setRange] = useState("all");

  const meta = exMeta(exercise, db.custom);
  const from = useMemo(() => {
    const r = RANGES.find((x) => x.id === range);
    return r && r.days ? addDays(today(), -r.days) : null;
  }, [range]);

  const metricLabel = meta.mode === "weight" ? "Est. 1RM (lb)"
    : meta.mode === "sprint" ? "Best time (s)"
    : meta.mode === "measure" ? "Best (in)" : "Best reps";
  const lowerIsBetter = meta.mode === "sprint";

  const score = (l) =>
    l.mode === "weight" ? epley1RM(l.weight, l.reps)
    : l.mode === "sprint" ? l.seconds
    : l.mode === "reps" ? l.reps : l.value;

  const rows = useMemo(() => {
    const pool = applyScope(myStudents, scope);
    return pool.map((s) => {
      let ls = (db.logs[s.id] || []).filter((l) => l.exercise === exercise);
      if (from) ls = ls.filter((l) => l.date >= from);
      if (!ls.length) return null;
      const sorted = [...ls].sort((a, b) => a.date.localeCompare(b.date));
      // Baseline is the average of the first up-to-3 efforts, not one
      // single early data point — same reasoning as the leaderboard's
      // Most Improved fix, so the two reports can't quietly disagree.
      const baseCount = Math.min(3, sorted.length);
      const firstVal = sorted.slice(0, baseCount).reduce((a, l) => a + score(l), 0) / baseCount;
      const lastVal = lowerIsBetter
        ? Math.min(...ls.map(score))
        : Math.max(...ls.map(score));
      const lastLog = [...ls].sort((a, b) => b.date.localeCompare(a.date))[0];
      const diff = lowerIsBetter ? firstVal - lastVal : lastVal - firstVal;
      const pct = firstVal ? (diff / firstVal) * 100 : 0;
      const nm = splitName(s.name);
      return {
        student: s, first: nm.first, last: nm.last,
        firstDate: sorted[0].date, lastDate: lastLog.date,
        firstVal, lastVal, diff, pct, entries: ls.length,
      };
    }).filter(Boolean).sort((a, b) => b.pct - a.pct);
  }, [myStudents, scope, exercise, from, db.logs]);

  const exerciseOptions = useMemo(() => {
    const pool = applyScope(myStudents, scope);
    const scoped = loggedExercisesFor(pool, db);
    return scoped.length ? scoped : db.exercises;
  }, [myStudents, scope, db.logs, db.exercises]);

  const dec = (v) => (meta.mode === "sprint" ? v.toFixed(2) : Math.round(v));

  const exportRows = useMemo(() => [
    ["Movement", "Last name", "First name", "First date", "Last date", `First ${metricLabel}`, `Best ${metricLabel}`, "Difference", "Difference (%)", "Entries"],
    ...rows.map((r) => [
      exercise, r.last, r.first, r.firstDate, r.lastDate,
      dec(r.firstVal), dec(r.lastVal),
      (r.diff >= 0 ? "+" : "") + dec(r.diff),
      (r.pct >= 0 ? "+" : "") + r.pct.toFixed(0) + "%",
      r.entries,
    ]),
  ], [rows, exercise, metricLabel]);

  const improved = rows.filter((r) => r.pct > 0).length;
  const avgPct = rows.length ? rows.reduce((a, r) => a + r.pct, 0) / rows.length : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ScopeSelect myClasses={myClasses} myGroups={myGroups} myStudents={myStudents} value={scope} onChange={setScope} />
        <select value={exercise} onChange={(e) => setExercise(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          {exerciseOptions.map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {!rows.length ? (
        <Empty icon={BarChart3}>
          Nobody has logged {exercise} in this window yet. Try a wider date range, or a movement the group has actually been doing.
        </Empty>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 9 }}>
            <Stat label="Athletes" value={rows.length} />
            <Stat label="Improved" value={improved} tone={C.good} />
            <Stat label="Flat or down" value={rows.length - improved} tone={rows.length - improved ? C.warn : undefined} />
            <Stat label="Group average" value={`${avgPct > 0 ? "+" : ""}${avgPct.toFixed(1)}%`} tone={avgPct > 0 ? C.good : C.bad} />
          </div>

          <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 720 }}>
              <thead>
                <tr>
                  {[
                    { h: "Last name", a: "left" }, { h: "First name", a: "left" },
                    { h: "First date", a: "left" }, { h: "Last date", a: "left" },
                    { h: `First ${metricLabel}`, a: "right" }, { h: `Best ${metricLabel}`, a: "right" },
                    { h: "Difference", a: "right" }, { h: "Difference (%)", a: "right" },
                  ].map((c) => (
                    <th key={c.h} style={{
                      textAlign: c.a, padding: "11px 12px", color: C.textDim, fontSize: 9.5,
                      textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap",
                      borderBottom: `1px solid ${C.border}`,
                    }}>{c.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student.id}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.last || "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.first}</td>
                    <td style={{ padding: "10px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.firstDate}</td>
                    <td style={{ padding: "10px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.lastDate}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{dec(r.firstVal)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{dec(r.lastVal)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}`, color: r.diff > 0 ? C.good : r.diff < 0 ? C.bad : C.textDim }}>
                      {r.diff > 0 ? "+" : ""}{dec(r.diff)}
                    </td>
                    <td className="d" style={{ padding: "10px 12px", textAlign: "right", fontSize: 15, borderBottom: `1px solid ${C.border}`, color: r.pct > 0 ? C.good : r.pct < 0 ? C.bad : C.textDim }}>
                      {r.pct > 0 ? "+" : ""}{r.pct.toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 11.5, color: C.steel, lineHeight: 1.6 }}>
            {meta.mode === "weight"
              ? "Estimated 1RM uses the Epley formula on logged sets, so a single heavy triple counts. It's an estimate, not a tested max."
              : lowerIsBetter
                ? "Faster counts as improvement, so a positive percentage means time came off."
                : "Compares the first logged effort in the window against the best one."}
            {" "}A negative number often means the athlete logged a light technique day rather than losing strength — worth a glance at their history before you read anything into it.
          </div>

          <ExportPanel rows={exportRows} filename={`${exercise.replace(/\s+/g, "-").toLowerCase()}-progress.csv`} />
        </>
      )}
    </div>
  );
}

/* ---- view 2: everyone, every pillar ---- */
function GroupSummary({ db, teacherId }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const [scope, setScope] = useState("");
  const pool = applyScope(myStudents, scope);

  const rows = useMemo(() => pool.map((s) => {
    const logs = db.logs[s.id] || [];
    const cis = db.checkins[s.id] || [];
    const imp = improvementStats(logs, db.custom);
    const bw = [...cis].reverse().find((c) => c.bodyweight);
    const g = db.groups.find((x) => x.id === s.groupId);
    return {
      student: s, group: g ? g.name : "—", sets: logs.length,
      days: new Set(logs.map((l) => l.date)).size,
      readiness: cis.length ? Math.round(cis.reduce((a, c) => a + c.score, 0) / cis.length) : null,
      bodyweight: bw ? bw.bodyweight : null,
      strength: imp.strength, speed: imp.speed, power: imp.power,
      last: logs.length ? [...logs].sort((a, b) => b.date.localeCompare(a.date))[0].date : null,
    };
  }).sort((a, b) => b.sets - a.sets), [pool, db.logs, db.checkins]);

  const exportRows = useMemo(() => [
    ["Last name", "First name", "Grad year", "Group", "Sets logged", "Days trained", "Avg readiness", "Body weight (lb)", "Strength change %", "Speed change %", "Power change %", "Last logged"],
    ...rows.map((r) => {
      const nm = splitName(r.student.name);
      return [nm.last, nm.first, r.student.gradYear || "", r.group, r.sets, r.days,
        r.readiness == null ? "" : r.readiness, r.bodyweight == null ? "" : r.bodyweight,
        r.strength == null ? "" : r.strength.toFixed(1),
        r.speed == null ? "" : r.speed.toFixed(1),
        r.power == null ? "" : r.power.toFixed(1), r.last || ""];
    }),
  ], [rows]);

  const pct = (v) => (v == null ? <span style={{ color: C.border }}>—</span> :
    <span style={{ color: v > 0 ? C.good : v < 0 ? C.bad : C.textDim }}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ScopeSelect myClasses={myClasses} myGroups={myGroups} myStudents={myStudents} value={scope} onChange={setScope} />
      {!rows.length ? <Empty icon={Users}>No students in this selection yet.</Empty> : (
        <>
          <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 640 }}>
              <thead>
                <tr>
                  {["Student", "Group", "Sets", "Days", "Readiness", "Strength", "Speed", "Power", "Last"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i < 2 ? "left" : "right", padding: "11px 12px", color: C.textDim,
                      fontSize: 9.5, textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap",
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student.id}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.student.name}</td>
                    <td style={{ padding: "10px 12px", color: C.textDim, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.group}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.sets}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.days}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.readiness == null ? <span style={{ color: C.border }}>—</span> : r.readiness}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{pct(r.strength)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{pct(r.speed)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{pct(r.power)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: C.textDim, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.last ? fmtDate(r.last) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ExportPanel rows={exportRows} filename="weight-room-group.csv" />
        </>
      )}
    </div>
  );
}

/* ===============================================================
   COACH: FUEL REPORT
   Built to answer one question: is this athlete eating enough to
   train? Sorted so the under-fuelled float to the top, since that's
   the problem that actually shows up in a high school weight room.

   Adapted to read from db.fuelLogs (this app's day-record fueling
   data) rather than a flat meal log — the range/enough-or-not logic
   and the safety framing are carried over unchanged.
================================================================ */
function fuelRange(bodyweight, trained) {
  if (!bodyweight) return null;
  const lo = trained ? bodyweight * 18 : bodyweight * 15;
  const hi = trained ? bodyweight * 23 : bodyweight * 19;
  const r50 = (n) => Math.round(n / 50) * 50;
  return { low: r50(lo), high: r50(hi), protein: Math.round(bodyweight * 0.7) };
}

function FuelReport({ db, teacherId }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const [scope, setScope] = useState("");
  const [days, setDays] = useState(14);
  const [openId, setOpenId] = useState(null);

  const since = addDays(today(), -days);
  const pool = applyScope(myStudents, scope);

  const rows = useMemo(() => pool.map((s) => {
    const records = (db.fuelLogs[s.id] || []).filter((r) => r.date >= since && r.foods && r.foods.length);
    const cis = db.checkins[s.id] || [];
    const bw = [...cis].reverse().find((c) => c.bodyweight);
    const logs = db.logs[s.id] || [];
    const dayList = records.map((r) => {
      const trained = logs.some((l) => l.date === r.date);
      const range = fuelRange(bw ? bw.bodyweight : null, trained);
      const kcal = r.foods.reduce((a, f) => a + (Number(f.kcal) || 0), 0);
      const p = r.foods.reduce((a, f) => a + (Number(f.protein) || 0), 0);
      return {
        date: r.date, trained, range, kcal, p,
        enough: range ? kcal >= range.low : null,
        post: r.foods.some((f) => f.mealId === "postworkout"),
      };
    }).sort((a, b) => b.date.localeCompare(a.date));

    const rated = dayList.filter((d) => d.enough != null);
    const trainingDays = dayList.filter((d) => d.trained);
    return {
      student: s, bodyweight: bw ? bw.bodyweight : null,
      logged: dayList.length,
      avgKcal: dayList.length ? Math.round(dayList.reduce((a, d) => a + d.kcal, 0) / dayList.length) : null,
      avgProtein: dayList.length ? Math.round(dayList.reduce((a, d) => a + d.p, 0) / dayList.length) : null,
      enoughRate: rated.length ? rated.filter((d) => d.enough).length / rated.length : null,
      postRate: trainingDays.length ? trainingDays.filter((d) => d.post).length / trainingDays.length : null,
      days: dayList,
    };
  }), [pool, db.fuelLogs, db.checkins, db.logs, since]);

  // Under-fuelled first, then never-logged, then everyone else.
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const rank = (r) => (r.enoughRate != null && r.enoughRate < 0.5 ? 0 : r.logged === 0 ? 2 : 1);
    return rank(a) - rank(b) || (a.enoughRate ?? 1) - (b.enoughRate ?? 1);
  }), [rows]);

  const short = rows.filter((r) => r.enoughRate != null && r.enoughRate < 0.5);
  const exportRows = useMemo(() => [
    ["Last name", "First name", "Days logged", "Avg calories", "Avg protein (g)", "% of days fuelled enough", "% of training days with food after", "Body weight on file"],
    ...sorted.map((r) => {
      const nm = splitName(r.student.name);
      return [nm.last, nm.first, r.logged, r.avgKcal ?? "", r.avgProtein ?? "",
        r.enoughRate == null ? "" : Math.round(r.enoughRate * 100),
        r.postRate == null ? "" : Math.round(r.postRate * 100),
        r.bodyweight ?? ""];
    }),
  ], [sorted]);

  const openRow = sorted.find((r) => r.student.id === openId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ScopeSelect myClasses={myClasses} myGroups={myGroups} myStudents={myStudents} value={scope} onChange={setScope} />
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10) || 14)} className="f"
          style={{ ...inputCss, width: "auto", fontSize: 13, padding: "8px 10px" }}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {short.length > 0 && (
        <Card style={{ borderColor: "rgba(232,165,75,.45)" }}>
          <Eyebrow icon={AlertTriangle}>Worth a quiet word</Eyebrow>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 11 }}>
            {short.map((r) => <Chip key={r.student.id} tone="warn">{r.student.name}</Chip>)}
          </div>
          <p style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
            These athletes came in under their range on most of the days they logged. Usually that means a skipped breakfast or no lunch, and the fix is a snack in a backpack. If it looks like more than that &mdash; weight dropping, avoiding food, training hard on nothing &mdash; that goes to your athletic trainer or the school nurse, not a coaching conversation.
          </p>
        </Card>
      )}

      {!rows.length ? (
        <Empty icon={Apple}>No athletes in this selection.</Empty>
      ) : (
        <>
          <div className="sc" style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <table className="b" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 620 }}>
              <thead>
                <tr>
                  {[{ h: "Athlete", a: "left" }, { h: "Days logged", a: "right" }, { h: "Avg calories", a: "right" },
                    { h: "Avg protein", a: "right" }, { h: "Fuelled enough", a: "right" }, { h: "Ate after training", a: "right" }, { h: "", a: "right" }].map((c) => (
                    <th key={c.h} style={{
                      textAlign: c.a, padding: "11px 12px", color: C.textDim, fontSize: 9.5,
                      textTransform: "uppercase", letterSpacing: 0.7, whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}`,
                    }}>{c.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.student.id}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{r.student.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}`, color: r.logged ? C.text : C.border }}>{r.logged || "—"}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.avgKcal ?? <span style={{ color: C.border }}>—</span>}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>{r.avgProtein != null ? `${r.avgProtein}g` : <span style={{ color: C.border }}>—</span>}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>
                      {r.enoughRate == null ? <span style={{ color: C.border }}>—</span> : (
                        <span style={{ color: r.enoughRate >= 0.7 ? C.good : r.enoughRate >= 0.5 ? C.warn : C.bad, fontWeight: 700 }}>
                          {Math.round(r.enoughRate * 100)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>
                      {r.postRate == null ? <span style={{ color: C.border }}>—</span> : `${Math.round(r.postRate * 100)}%`}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>
                      {r.logged > 0 && <Button size="sm" variant="ghost" onClick={() => setOpenId(r.student.id)}>Days</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 11.5, color: C.steel, lineHeight: 1.6 }}>
            Ranges are estimated from body weight and whether the athlete trained that day, so an athlete with no body weight on file shows dashes rather than a guess. &ldquo;Fuelled enough&rdquo; means they reached the bottom of their range &mdash; there is no upper limit being tracked, on purpose.
          </div>

          <ExportPanel rows={exportRows} filename="fuel-report.csv" note="One row per athlete over the selected window." />

          <div style={{ fontSize: 11.5, color: C.steel, lineHeight: 1.65, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <strong style={{ color: C.textDim }}>Before you lean on this.</strong> Food logging that a coach can see is a known trigger for disordered eating in teenagers, and a co-ed lifting class is exactly the population where that shows up. That&rsquo;s why this report is built around eating <em>enough</em>, has no upper limit, no weight goals, and no ranking by calories. Keep it that way: use it to catch the kid who trains on no breakfast, not to comment on anyone&rsquo;s food choices or body. Students are told you can see their log. If something here worries you, the referral is your athletic trainer or school nurse.
          </div>
        </>
      )}

      {openRow && (
        <Modal title={openRow.student.name} onClose={() => setOpenId(null)} wide>
          <FuelHistory db={db} student={openRow.student} />
        </Modal>
      )}
    </div>
  );
}

function ReportsTab({ db, teacherId, handlers }) {
  const [view, setView] = useState("progress");
  return (
    <div>
      <Tabs scroll value={view} onChange={setView} tabs={[
        { id: "progress", label: "% Improvement" },
        { id: "summary", label: "Group summary" },
        { id: "boards", label: "Leaderboards" },
        { id: "volume", label: "Volume" },
        { id: "attendance", label: "Attendance" },
        { id: "fuel", label: "Fuel report" },
      ]} />
      {view === "progress" && <ProgressReport db={db} teacherId={teacherId} />}
      {view === "summary" && <GroupSummary db={db} teacherId={teacherId} />}
      {view === "boards" && <Boards db={db} teacherId={teacherId} />}
      {view === "volume" && <VolumeReport db={db} teacherId={teacherId} />}
      {view === "attendance" && <AttendanceReport db={db} teacherId={teacherId} handlers={handlers} />}
      {view === "fuel" && <FuelReport db={db} teacherId={teacherId} />}
    </div>
  );
}

/* ===============================================================
   COACH: TODAY — readiness board and who has trained
================================================================ */
function CoachToday({ db, teacherId, onAck, onAckWeightConcern, onSaveGoal, onDeleteGoal, onSaveAnnouncement, onDeleteAnnouncement }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacherId);
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const rows = myStudents.map((s) => {
    const ci = (db.checkins[s.id] || []).find((c) => c.date === today());
    const sets = (db.logs[s.id] || []).filter((l) => l.date === today()).length;
    const group = db.groups.find((g) => g.id === s.groupId);
    return { s, ci, sets, group };
  });
  const flagged = rows.filter((r) => r.ci && r.ci.score < 40);
  const checked = rows.filter((r) => r.ci);
  const avg = checked.length ? Math.round(checked.reduce((a, r) => a + r.ci.score, 0) / checked.length) : null;

  const notes = myStudents
    .map((s) => {
      const c = (db.comments[s.id] || []).find((x) => x.date === today());
      return c ? { student: s, text: c.text } : null;
    })
    .filter(Boolean);

  const scheduled = db.schedule.filter((s) => s.date === today() && s.groupIds.some((g) => db.groups.find((x) => x.id === g && myClasses.find((c) => c.id === x.classId))));
  const todaysTest = (db.testingDays || []).find((t) => t.date === today());
  const [revealExercise, setRevealExercise] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(118px,1fr))", gap: 9 }}>
        <Stat label="On roster" value={myStudents.length} />
        <Stat label="Checked in" value={checked.length} />
        <Stat label="Group readiness" value={avg == null ? "—" : avg} tone={avg == null ? undefined : avg >= 65 ? C.good : avg >= 40 ? C.warn : C.bad} />
        <Stat label="Training now" value={rows.filter((r) => r.sets > 0).length} />
      </div>

      {scheduled.length > 0 && (
        <Card>
          <Eyebrow icon={ClipboardList}>On the board today</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {scheduled.map((s) => {
              const p = db.programs.find((x) => x.id === s.programId);
              return (
                <div key={s.id} style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>{p ? p.name : "Deleted session"}</span>
                  <span style={{ color: C.textDim }}>
                    {" — "}
                    {s.groupIds.map((g) => { const gg = db.groups.find((x) => x.id === g); return gg ? gg.name : null; }).filter(Boolean).join(", ")}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {todaysTest && (
        <Card style={{ borderColor: C.accentBorder }}>
          <Eyebrow icon={Award}>Testing Day</Eyebrow>
          <p style={{ fontSize: 12.5, color: C.textDim, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
            Numbers are coming in live from every athlete&rsquo;s phone. Open a lift on the TV when you&rsquo;re ready for the reveal.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {todaysTest.exercises.map((ex) => (
              <Button key={ex} size="sm" variant="subtle" icon={Monitor} onClick={() => setRevealExercise(ex)}>{ex}</Button>
            ))}
          </div>
        </Card>
      )}

      <InjuryBoard db={db} teacherId={teacherId} onAck={onAck} />

      <WeightConcernBoard db={db} teacherId={teacherId} onAck={onAckWeightConcern} />

      <GoalsPanel db={db} teacherId={teacherId} onSaveGoal={onSaveGoal} onDeleteGoal={onDeleteGoal} />

      <AnnouncementsPanel db={db} teacherId={teacherId} onSaveAnnouncement={onSaveAnnouncement} onDeleteAnnouncement={onDeleteAnnouncement} />

      {flagged.length > 0 && (
        <Card style={{ borderColor: "rgba(224,133,133,.4)" }}>
          <Eyebrow icon={AlertTriangle}>Worth a conversation</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {flagged.map((r) => (
              <div key={r.s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{r.s.name}</span>
                <Chip tone="bad">readiness {r.ci.score}</Chip>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.steel, margin: "12px 0 0", lineHeight: 1.55 }}>
            Low scores usually mean sleep or a hard practice yesterday, not an injury. Two questions and a lighter day is often the whole fix.
          </p>
        </Card>
      )}

      {notes.length > 0 && (
        <Card>
          <Eyebrow icon={MessageSquare}>Notes from athletes today</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.map((n) => (
              <div key={n.student.id} style={{ fontSize: 13, lineHeight: 1.55 }}>
                <span style={{ fontWeight: 700 }}>{n.student.name}</span>
                <div style={{ color: C.textDim, marginTop: 2 }}>{n.text}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <Eyebrow icon={Heart}>Check-ins today</Eyebrow>
        {!rows.length ? (
          <Empty icon={Users}>No students on your roster yet.</Empty>
        ) : (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
            {rows.map((r, i) => (
              <div key={r.s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.s.name}</div>
                  <div style={{ fontSize: 11, color: C.steel }}>{r.group ? r.group.name : "No group"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.sets > 0 && <Chip tone="good">{r.sets} sets</Chip>}
                  {r.ci ? <Chip tone={readinessTone(r.ci.score)}>{r.ci.score}</Chip> : <Chip>not checked in</Chip>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {revealExercise && (
        <LeaderboardTVDisplay db={db} teacherId={teacherId} exercise={revealExercise} mode="load" splitGender={false} onClose={() => setRevealExercise(null)} />
      )}
    </div>
  );
}

/* ===============================================================
   COACH SHELL
================================================================ */
// Shared secret that gates the self-service "New teacher" form on the
// sign-in screen. Any signed-in coach can view or rotate it.
function CoachAccessCode({ teacherCode, onSetTeacherCode }) {
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(teacherCode || "");
  return !editing ? (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{teacherCode || "Not set"}</span>
      <Button size="sm" variant="ghost" onClick={() => { setCode(teacherCode || ""); setEditing(true); }}>Change</Button>
    </div>
  ) : (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="f" style={inputCss} />
      </div>
      <Button size="sm" icon={Check} disabled={!code.trim()} onClick={() => { onSetTeacherCode(code.trim()); setEditing(false); }}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
    </div>
  );
}

function SubstituteCode({ teacher, onPatchTeacher }) {
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(teacher.subCode || "");
  const gen = () => String(1000 + Math.floor(Math.random() * 9000));
  return !editing ? (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{teacher.subCode || "Not set"}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="ghost" onClick={() => onPatchTeacher(teacher.id, { subCode: gen() })}>Generate new</Button>
        <Button size="sm" variant="ghost" onClick={() => { setCode(teacher.subCode || ""); setEditing(true); }}>Change</Button>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="f" style={inputCss} />
      </div>
      <Button size="sm" icon={Check} disabled={!code.trim()} onClick={() => { onPatchTeacher(teacher.id, { subCode: code.trim() }); setEditing(false); }}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
    </div>
  );
}

// A deliberately small view for a substitute — today's sessions (full
// content, viewable, not editable), the roster, and attendance-taking.
// No roster edits, no library, no reports, no codes or settings.
function SubView({ teacher, db, onBack, onMarkAttendance }) {
  const myClasses = db.classes.filter((c) => c.teacherId === teacher.id);
  const myGroups = db.groups.filter((g) => myClasses.find((c) => c.id === g.classId));
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));
  const scheduled = db.schedule.filter((s) => s.date === today() && s.groupIds.some((g) => myGroups.find((x) => x.id === g)));
  const [previewing, setPreviewing] = useState(null);
  const [rosterGroup, setRosterGroup] = useState("");

  const rosterStudents = rosterGroup ? myStudents.filter((s) => s.groupId === rosterGroup) : myStudents;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Helmet size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>Substitute view</div>
            <div className="d" style={{ fontSize: 19, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teacher.name}&rsquo;s classes</div>
          </div>
        </div>
        <Button variant="ghost" onClick={onBack}>Exit</Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Eyebrow icon={ClipboardList}>Today — {fmtLong(today())}</Eyebrow>
        {!scheduled.length ? (
          <Empty icon={ClipboardList}>Nothing scheduled today for these classes.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scheduled.map((s) => {
              const p = db.programs.find((x) => x.id === s.programId);
              const groupNames = s.groupIds.map((g) => (myGroups.find((x) => x.id === g) || {}).name).filter(Boolean);
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surfaceAlt, borderRadius: 9, padding: "10px 12px", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p ? p.name : "Deleted session"}</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>{groupNames.join(", ")}</div>
                  </div>
                  {p && <Button size="sm" variant="subtle" icon={Monitor} onClick={() => setPreviewing(s)}>View</Button>}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <Eyebrow icon={Users}>Roster &amp; attendance</Eyebrow>
        <select value={rosterGroup} onChange={(e) => setRosterGroup(e.target.value)} className="f" style={{ ...inputCss, width: "auto", fontSize: 13, marginBottom: 12 }}>
          <option value="">All groups</option>
          {myGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {!rosterStudents.length ? (
          <Empty icon={Users}>No students in this selection.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rosterStudents.map((s) => {
              const mark = (db.attendance[s.id] || []).find((a) => a.date === today());
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: C.surfaceAlt, borderRadius: 9, padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <Avatar person={s} size={30} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Button size="sm" variant={mark && mark.present ? "primary" : "ghost"} onClick={() => onMarkAttendance(s.id, today(), true)}>Present</Button>
                    <Button size="sm" variant={mark && !mark.present ? "danger" : "ghost"} onClick={() => onMarkAttendance(s.id, today(), false)}>Absent</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {previewing && (() => {
        const p = db.programs.find((x) => x.id === previewing.programId);
        if (!p) return null;
        const groupNames = previewing.groupIds.map((g) => (myGroups.find((x) => x.id === g) || {}).name).filter(Boolean);
        return <TVDisplay db={db} program={normalizeProgram(p)} date={previewing.date} groupNames={groupNames} onClose={() => setPreviewing(null)} />;
      })()}
    </div>
  );
}

// A teacher's own personal training + nutrition log — reuses the exact
// same logging, fueling, and progress components a student uses, keyed
// to the teacher's own id instead of a student id. Storage-wise this is
// completely safe to share: leaderboards and reports only ever iterate
// db.students, so a teacher's own log entries (keyed by teacher.id)
// never surface in any student-facing view.
// A compact, generic month grid — click a day to act on it, day cells
// show whatever small labels the caller hands back for that date.
// Reused for both the read-only "all classes" view and the teacher's
// own interactive personal calendar.
function MonthCalendarMini({ cursor, setCursor, itemsForDate, onDayClick }) {
  const first = new Date(cursor.y, cursor.m, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const dateFor = (day) => iso(new Date(cursor.y, cursor.m, day, 12));
  const shift = (n) => {
    let m = cursor.m + n, y = cursor.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setCursor({ y, m });
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => shift(-1)} aria-label="Previous month" />
        <span className="d" style={{ fontSize: 15, textTransform: "uppercase" }}>{monthLabel}</span>
        <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => shift(1)} aria-label="Next month" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: C.steel, fontWeight: 700, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={"pad" + i} />;
          const d = dateFor(day);
          const items = itemsForDate(d);
          const isToday = d === today();
          return (
            <button key={d} onClick={() => onDayClick(d)} className="f" style={{
              minHeight: 58, borderRadius: 8, cursor: "pointer", padding: "5px 4px", textAlign: "left",
              background: items.length ? C.accentDim : C.surface,
              border: `1px solid ${isToday ? C.accentBorder : C.border}`,
              color: C.text, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden",
            }}>
              <span className="d" style={{ fontSize: 12, color: isToday ? C.accent : C.textDim }}>{day}</span>
              {items.slice(0, 2).map((label, idx) => (
                <span key={idx} style={{ fontSize: 8.5, color: C.accent, fontWeight: 700, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{label}</span>
              ))}
              {items.length > 2 && <span style={{ fontSize: 8.5, color: C.steel }}>+{items.length - 2}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// A read-only block/exercise breakdown for view-only calendar day
// modals — same rendering as ScheduledEntryRow's expanded state, minus
// any edit/remove affordances, since nothing here should be actionable.
function SessionContentView({ program, db }) {
  const norm = normalizeProgram(program);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {norm.notes && <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", lineHeight: 1.5 }}>{norm.notes}</div>}
      {norm.blocks.map((b) => (
        b.type === "note" ? (
          <div key={b.id} style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10.5, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>Note</div>
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{b.text}</div>
          </div>
        ) : (
        <div key={b.id}>
          <div style={{ fontSize: 10.5, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>
            {b.category}{b.type === "circuit" ? ` · Circuit × ${b.rounds}` : ""}
          </div>
          {b.note && <div style={{ fontSize: 11.5, color: C.steel, marginBottom: 4 }}>{b.note}</div>}
          {b.exercises.map((e) => (
            <div key={e.id} style={{ padding: "3px 0" }}>
              <div style={{ fontSize: 12.5, color: C.textDim, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{e.exercise}</span>
                <span style={{ color: C.text, fontWeight: 600 }}>
                  {b.type === "circuit" ? (e.reps ? `${e.reps} reps` : "—") : prescriptionLine(e, exMeta(e.exercise, db.custom), null)}
                </span>
              </div>
              {e.note && <div style={{ fontSize: 10.5, color: C.steel, marginTop: 1 }}>{e.note}</div>}
            </div>
          ))}
        </div>
        )
      ))}
    </div>
  );
}

// Same idea as StarterProgramPicker, but for a teacher's own personal
// calendar instead of the student-facing Planner — no groups involved,
// everything imported gets tagged private to this teacher, and single
// WODs schedule to one day while multi-week bundles fill out several.
function PersonalStarterPicker({ db, teacher, handlers, defaultDate, onDone }) {
  const [mode, setMode] = useState("sessions"); // "sessions" | "programs"
  const [applyingSession, setApplyingSession] = useState(null);
  const [applyingBundle, setApplyingBundle] = useState(null);
  const [date, setDate] = useState(defaultDate || today());
  const [repeatWeeks, setRepeatWeeks] = useState(8);

  const importSession = (starter) => {
    const id = uid();
    const reidBlocks = starter.blocks.map((b) => ({ ...b, id: uid(), exercises: b.exercises.map((e) => ({ ...e, id: uid() })) }));
    handlers.saveProgram({ id, name: starter.name, notes: starter.notes || "", blocks: reidBlocks, isPersonal: true, ownerId: teacher.id });
    handlers.assignPersonal(teacher.id, { id: uid(), date, programId: id });
    onDone();
  };

  const importBundle = (bundle, weeks) => {
    const newSessionIds = bundle.sessions.map((s) => {
      const id = uid();
      const reidBlocks = s.blocks.map((b) => ({ ...b, id: uid(), exercises: b.exercises.map((e) => ({ ...e, id: uid() })) }));
      handlers.saveProgram({ id, name: s.name, notes: s.notes || "", blocks: reidBlocks, isPersonal: true, ownerId: teacher.id });
      return id;
    });
    for (let w = 0; w < weeks; w++) {
      bundle.schedule.forEach((it) => {
        handlers.assignPersonal(teacher.id, { id: uid(), date: addDays(date, it.dayOffset + w * 7), programId: newSessionIds[it.sessionIndex] });
      });
    }
    onDone();
  };

  if (applyingSession) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => setApplyingSession(null)} className="f" style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: C.accent, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0, alignSelf: "flex-start" }}>
          <ChevronLeft size={14} /> Back to templates
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{applyingSession.name}</div>
        <Field label="Which day?">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="f" style={inputCss} />
        </Field>
        <Button icon={Check} onClick={() => importSession(applyingSession)}>Add to my calendar</Button>
      </div>
    );
  }

  if (applyingBundle) {
    const span = applyingBundle.schedule.length ? Math.max(...applyingBundle.schedule.map((it) => it.dayOffset)) : 0;
    const cycleWeeks = Math.ceil((span + 1) / 7);
    const canRepeat = cycleWeeks <= 1;
    const weeks = canRepeat ? repeatWeeks : 1;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => setApplyingBundle(null)} className="f" style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: C.accent, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0, alignSelf: "flex-start" }}>
          <ChevronLeft size={14} /> Back to templates
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{applyingBundle.name}</div>
          <p style={{ fontSize: 12.5, color: C.textDim, margin: "4px 0 0", lineHeight: 1.55 }}>
            {canRepeat
              ? `Writes ${applyingBundle.sessions.length} sessions per week onto your calendar, repeated for as many weeks as you set below.`
              : `Writes ${applyingBundle.sessions.length} sessions onto your calendar, spread across ${span + 1} days — this one already has its own multi-week progression built in, so it applies once as designed.`}
          </p>
        </div>
        {canRepeat && (
          <Field label="Repeat for how many weeks?">
            <input value={repeatWeeks} onChange={(e) => setRepeatWeeks(Math.max(1, parseInt(e.target.value, 10) || 1))} inputMode="numeric" className="f" style={inputCss} />
          </Field>
        )}
        <Field label="Start date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="f" style={inputCss} />
        </Field>
        <Button icon={Check} onClick={() => importBundle(applyingBundle, weeks)}>Add to my calendar</Button>
      </div>
    );
  }

  return (
    <div>
      <Tabs value={mode} onChange={setMode} tabs={[{ id: "sessions", label: "Single sessions" }, { id: "programs", label: "Multi-week programs" }]} />
      <p style={{ fontSize: 12, color: C.steel, margin: "12px 0 14px", lineHeight: 1.55 }}>
        {mode === "sessions"
          ? "Warmups, CrossFit WODs, and other one-off sessions — pick one and a day for it."
          : "Full multi-week programs — pick one and a start date."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
        {mode === "sessions" ? STARTER_SESSIONS.map((s) => (
          <button key={s.id} onClick={() => setApplyingSession(s)} className="f" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 13px",
            background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
            <ChevronRight size={15} color={C.steel} style={{ flexShrink: 0 }} />
          </button>
        )) : STARTER_PROGRAM_BUNDLES.map((b) => (
          <button key={b.id} onClick={() => setApplyingBundle(b)} className="f" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 13px",
            background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{b.name}</div>
              <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{b.sessions.length} sessions</div>
            </div>
            <ChevronRight size={16} color={C.steel} style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StaffLogView({ teacher, db, handlers }) {
  const [tab, setTab] = useState("train");
  const [editingSession, setEditingSession] = useState(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(null);
  const [personalCursor, setPersonalCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [classCursor, setClassCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [pickingPersonalDay, setPickingPersonalDay] = useState(null);
  const [dayDraft, setDayDraft] = useState(null);
  const [pickingPersonalStarter, setPickingPersonalStarter] = useState(false);
  const [personalStarterDate, setPersonalStarterDate] = useState(null);
  const [viewingClassDay, setViewingClassDay] = useState(null);
  const logs = db.logs[teacher.id] || [];
  const fuelLogs = db.fuelLogs[teacher.id] || [];
  const streak = computeStreak(logs);
  const todaysLogs = logs.filter((l) => l.date === today());
  const mySessions = db.programs.filter((p) => p.isPersonal && p.ownerId === teacher.id);

  const handleLog = (entry) => handlers.addLog(teacher.id, { ...entry, date: today() });

  const mealHistory = useMemo(() => {
    const byMeal = {};
    for (const rec of fuelLogs) {
      for (const f of rec.foods || []) {
        if (!f.mealId || !f.text) continue;
        byMeal[f.mealId] = byMeal[f.mealId] || {};
        const key = f.text.trim().toLowerCase();
        const existing = byMeal[f.mealId][key];
        if (!existing || f.time > existing.time) {
          byMeal[f.mealId][key] = { text: f.text.trim(), kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat, time: f.time, count: (existing ? existing.count : 0) + 1 };
        } else {
          existing.count += 1;
        }
      }
    }
    const out = {};
    for (const mealId of Object.keys(byMeal)) {
      out[mealId] = Object.values(byMeal[mealId]).sort((a, b) => b.count - a.count).slice(0, 4);
    }
    return out;
  }, [fuelLogs]);

  return (
    <div>
      <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 14, lineHeight: 1.6 }}>
        Your own training and nutrition log — logged permanently under your own account, completely separate from any class roster and never visible on a student leaderboard or report.
      </p>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "train", label: "Train" },
        { id: "progress", label: "Progress" },
        { id: "fuel", label: "Fuel" },
        { id: "sessions", label: "Sessions" },
      ]} />

      {tab === "train" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {streak > 1 && (
            <div style={{ display: "inline-flex", alignSelf: "flex-start" }}>
              <Chip tone="gold"><Flame size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{streak}-day streak</Chip>
            </div>
          )}
          <FreeLog exercises={db.exercises} custom={db.custom} onLog={handleLog} onAddExercise={handlers.addExercise} />
          {todaysLogs.length > 0 && (
            <div>
              <Eyebrow icon={ClipboardList}>Logged today</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {todaysLogs.map((l) => {
                  const meta = exMeta(l.exercise, db.custom);
                  const display = l.mode === "weight" ? `${l.weight} lb × ${l.reps}`
                    : l.mode === "reps" ? `${l.reps} reps`
                    : l.mode === "sprint" ? `${l.seconds.toFixed(2)}s`
                    : `${l.value} ${l.unit || ""}`;
                  return (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", background: C.surfaceAlt, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                      <span>{l.exercise}</span>
                      <span style={{ color: C.accent, fontWeight: 700 }}>{display}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "progress" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <Eyebrow icon={Award}>Personal bests</Eyebrow>
            <PRBoard logs={logs} custom={db.custom} />
          </div>
          <div>
            <Eyebrow icon={TrendingUp}>Movement history</Eyebrow>
            <ExerciseHistory logs={logs} custom={db.custom} />
          </div>
        </div>
      )}

      {tab === "fuel" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <Eyebrow icon={Gauge}>My weight</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input value={teacher.bodyweight || ""} onChange={(e) => handlers.patchTeacher(teacher.id, { bodyweight: e.target.value ? Number(e.target.value) : null })}
                inputMode="numeric" placeholder="lb" className="f" style={{ ...inputCss, width: 90 }} />
              <span style={{ fontSize: 12, color: C.textDim }}>Used for suggested protein and water targets below.</span>
            </div>
          </Card>
          <FuelTab
            bodyweight={teacher.bodyweight || null}
            mealSlots={teacher.mealSlots}
            onSetMealSlots={(slots) => handlers.patchTeacher(teacher.id, { mealSlots: slots })}
            workoutTime={teacher.workoutTime}
            onSetWorkoutTime={(t) => handlers.patchTeacher(teacher.id, { workoutTime: t })}
            record={fuelLogs.find((r) => r.date === today())}
            targets={teacher.nutritionTargets}
            onSetTargets={(t) => handlers.patchTeacher(teacher.id, { nutritionTargets: t })}
            mealHistory={mealHistory}
            onAddFood={(mealId, entry) => handlers.addFuelFood(teacher.id, today(), mealId, entry)}
            onDeleteFood={(id) => handlers.deleteFuelFood(teacher.id, today(), id)}
            onAddWater={(oz) => handlers.addWater(teacher.id, today(), oz)}
            onDeleteWater={(id) => handlers.deleteWater(teacher.id, today(), id)}
            gender={teacher.gender}
            onSetGender={(g) => handlers.patchTeacher(teacher.id, { gender: g })}
            weightGoal={teacher.weightGoal}
            onSetWeightGoal={(w) => handlers.patchTeacher(teacher.id, { weightGoal: w })}
            heightIn={teacher.heightIn}
          />
        </div>
      )}

      {tab === "sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow icon={Lock}>My calendar</Eyebrow>
              <Button size="sm" variant="subtle" icon={Download} onClick={() => { setPersonalStarterDate(null); setPickingPersonalStarter(true); }}>Starter templates</Button>
            </div>
            <p style={{ fontSize: 11.5, color: C.steel, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
              Your own training calendar — completely separate from the Planner, never visible to students. Tap any day to write a session right there — a CrossFit-style WOD or a full weightlifting session — pick from what you've already built, or bring in a starter template above.
            </p>
            <MonthCalendarMini cursor={personalCursor} setCursor={setPersonalCursor}
              itemsForDate={(d) => (db.personalSchedule[teacher.id] || []).filter((e) => e.date === d).map((e) => { const p = mySessions.find((x) => x.id === e.programId); return p ? p.name : "?"; })}
              onDayClick={(d) => { setDayDraft(null); setPickingPersonalDay(d); }} />
          </div>

          <div>
            <Eyebrow icon={Users}>All classes' calendar</Eyebrow>
            <p style={{ fontSize: 11.5, color: C.steel, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
              Every session scheduled anywhere across your classes, synced from the Planner — view-only here. Tap a day to see the full session. Edit or schedule from the Planner itself.
            </p>
            <MonthCalendarMini cursor={classCursor} setCursor={setClassCursor}
              itemsForDate={(d) => {
                const myGroupIds = db.groups.filter((g) => db.classes.find((c) => c.id === g.classId && c.teacherId === teacher.id)).map((g) => g.id);
                return db.schedule.filter((s) => s.date === d && s.groupIds.some((g) => myGroupIds.includes(g))).map((s) => { const p = db.programs.find((x) => x.id === s.programId); return p ? p.name : "?"; });
              }}
              onDayClick={(d) => setViewingClassDay(d)} />
          </div>

          {mySessions.length > 0 && (
            <div>
              <Eyebrow icon={ClipboardList}>Manage my session templates</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mySessions.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: C.surfaceAlt, borderRadius: 9, padding: "9px 12px" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditingSession(p)} aria-label="Edit" />
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDeleteSession(p)} aria-label="Delete" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pickingPersonalDay && (() => {
        const dayEntries = (db.personalSchedule[teacher.id] || []).filter((e) => e.date === pickingPersonalDay);
        return (
          <Modal title={fmtLong(pickingPersonalDay)} onClose={() => { setPickingPersonalDay(null); setDayDraft(null); }} wide={!!dayDraft}>
            {dayDraft ? (
              <div>
                <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 14, lineHeight: 1.55 }}>
                  Build it however you need — a CrossFit-style WOD (circuit blocks, AMRAP/for-time) or a full weightlifting session with supersets and %-of-max. Saves to your personal templates and goes straight onto this day.
                </p>
                <SessionEditor db={db} value={dayDraft} onChange={setDayDraft}
                  saveLabel="Save and schedule this day"
                  onSave={() => {
                    handlers.saveProgram({ ...dayDraft, isPersonal: true, ownerId: teacher.id });
                    handlers.assignPersonal(teacher.id, { id: uid(), date: pickingPersonalDay, programId: dayDraft.id });
                    setDayDraft(null);
                  }}
                  onCancel={() => setDayDraft(null)} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {dayEntries.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dayEntries.map((e) => {
                      const p = mySessions.find((x) => x.id === e.programId);
                      return (
                        <div key={e.id} style={{ background: C.surfaceAlt, borderRadius: 9, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: p ? 8 : 0 }}>
                            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p ? p.name : "Deleted session"}</span>
                            <Button size="sm" variant="danger" icon={Trash2} onClick={() => handlers.unassignPersonal(teacher.id, e.id)} aria-label="Remove" />
                          </div>
                          {p && <SessionContentView program={p} db={db} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button full icon={Plus} onClick={() => setDayDraft(blankSession())}>
                  Write a new session for this day
                </Button>
                <Button full variant="subtle" icon={Download} onClick={() => { setPersonalStarterDate(pickingPersonalDay); setPickingPersonalDay(null); setPickingPersonalStarter(true); }}>
                  Use a starter template
                </Button>
                {mySessions.length > 0 && (
                  <Field label="Or add one of my existing sessions">
                    <select value="" onChange={(ev) => { if (ev.target.value) { handlers.assignPersonal(teacher.id, { id: uid(), date: pickingPersonalDay, programId: ev.target.value }); } }} className="f" style={inputCss}>
                      <option value="">Pick one of my sessions…</option>
                      {mySessions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </Field>
                )}
              </div>
            )}
          </Modal>
        );
      })()}

      {viewingClassDay && (() => {
        const myGroupIds = db.groups.filter((g) => db.classes.find((c) => c.id === g.classId && c.teacherId === teacher.id)).map((g) => g.id);
        const dayEntries = db.schedule.filter((s) => s.date === viewingClassDay && s.groupIds.some((g) => myGroupIds.includes(g)));
        return (
          <Modal title={fmtLong(viewingClassDay)} onClose={() => setViewingClassDay(null)}>
            {!dayEntries.length ? (
              <Empty icon={ClipboardList}>Nothing scheduled this day.</Empty>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dayEntries.map((s) => {
                  const p = db.programs.find((x) => x.id === s.programId);
                  const groupNames = s.groupIds.map((g) => (db.groups.find((x) => x.id === g) || {}).name).filter(Boolean).join(", ");
                  return (
                    <div key={s.id} style={{ background: C.surfaceAlt, borderRadius: 9, padding: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p ? p.name : "Deleted session"}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginBottom: p ? 8 : 0 }}>{groupNames}</div>
                      {p && <SessionContentView program={p} db={db} />}
                    </div>
                  );
                })}
              </div>
            )}
          </Modal>
        );
      })()}

      {pickingPersonalStarter && (
        <Modal title="Starter templates" onClose={() => setPickingPersonalStarter(false)} wide>
          <PersonalStarterPicker db={db} teacher={teacher} handlers={handlers} defaultDate={personalStarterDate}
            onDone={() => setPickingPersonalStarter(false)} />
        </Modal>
      )}

      {editingSession && (
        <Modal title={db.programs.find((p) => p.id === editingSession.id) ? "Edit personal session" : "New personal session"} onClose={() => setEditingSession(null)} wide>
          <SessionEditor db={db} value={editingSession} onChange={setEditingSession}
            saveLabel="Save personal session"
            onSave={() => { handlers.saveProgram({ ...editingSession, isPersonal: true, ownerId: teacher.id }); setEditingSession(null); }}
            onCancel={() => setEditingSession(null)} />
        </Modal>
      )}

      {confirmDeleteSession && (
        <ConfirmModal
          title="Delete personal session?"
          body={`Delete "${confirmDeleteSession.name}"? This can't be undone.`}
          confirmLabel="Delete session"
          onConfirm={() => handlers.deleteProgram(confirmDeleteSession.id)}
          onClose={() => setConfirmDeleteSession(null)}
        />
      )}
    </div>
  );
}

function CoachView({ teacher, db, onBack, handlers }) {
  const [tab, setTab] = useState("today");
  const [athlete, setAthlete] = useState(null);
  const [newTeacher, setNewTeacher] = useState("");
  const [newPin, setNewPin] = useState("");

  const myClasses = db.classes.filter((c) => c.teacherId === teacher.id);
  const myStudents = db.students.filter((s) => myClasses.find((c) => c.id === s.classId));

  return (
    <div className="b" style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10 }}>
          <button onClick={onBack} className="f" style={{ display: "flex", alignItems: "center", gap: 3, color: C.textDim, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
            <ChevronLeft size={16} /> Sign out
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: C.textDim }}>{teacher.name}</span>
            <Avatar person={teacher} size={30} />
          </div>
        </div>

        <h1 className="d" style={{ fontSize: 30, textTransform: "uppercase", margin: "0 0 18px", lineHeight: 1 }}>Coach view</h1>

        <Tabs scroll value={tab} onChange={(t) => { setTab(t); setAthlete(null); }} tabs={[
          { id: "today", label: "Today" },
          { id: "roster", label: "Roster" },
          { id: "planner", label: "Planner" },
          { id: "library", label: "Library" },
          { id: "athletes", label: "Athletes" },
          { id: "reports", label: "Reports" },
          { id: "mylog", label: "My Log" },
          { id: "staff", label: "Staff" },
        ]} />

        {tab === "today" && <CoachToday db={db} teacherId={teacher.id} onAck={handlers.ackInjury} onAckWeightConcern={handlers.ackWeightConcern} onSaveGoal={handlers.saveGoal} onDeleteGoal={handlers.deleteGoal} onSaveAnnouncement={handlers.saveAnnouncement} onDeleteAnnouncement={handlers.deleteAnnouncement} />}

        {tab === "mylog" && <StaffLogView teacher={teacher} db={db} handlers={handlers} />}

        {tab === "roster" && (
          <Roster db={db} teacherId={teacher.id}
            onAddClass={(name) => handlers.addClass(teacher.id, name)}
            onPatchClass={handlers.patchClass}
            onDeleteClass={handlers.deleteClass}
            onAddGroup={handlers.addGroup}
            onDeleteGroup={handlers.deleteGroup}
            onAddStudent={handlers.addStudent}
            onPatchStudent={handlers.patchStudent}
            onDeleteStudent={handlers.deleteStudent}
          />
        )}

        {tab === "library" && <CoachLibrary db={db} teacherId={teacher.id} handlers={handlers} />}

        {tab === "planner" && <Planner db={db} teacherId={teacher.id} onAssign={handlers.assign} onUnassign={handlers.unassign} onSaveProgram={handlers.saveProgram} onRepointSchedule={handlers.repointSchedule} onSaveCycle={handlers.saveCycle} onApplyCycle={handlers.applyCycle} onSetTestingDay={handlers.setTestingDay} />}

        {tab === "athletes" && (
          athlete ? (
            <AthleteDetail db={db} student={athlete} onBack={() => setAthlete(null)} onSetMax={handlers.setMax} />
          ) : !myStudents.length ? (
            <Empty icon={User}>Add a class and some students on the Roster tab first.</Empty>
          ) : (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              {myStudents.map((s, i) => {
                const logs = db.logs[s.id] || [];
                const group = db.groups.find((g) => g.id === s.groupId);
                return (
                  <button key={s.id} onClick={() => setAthlete(s)} className="f" style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    color: C.text, borderBottom: i === myStudents.length - 1 ? "none" : `1px solid ${C.border}`,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: C.steel }}>{group ? group.name : "No group"} · {logs.length} sets logged</div>
                    </div>
                    <ChevronRight size={16} color={C.steel} />
                  </button>
                );
              })}
            </div>
          )
        )}

        {tab === "reports" && <ReportsTab db={db} teacherId={teacher.id} handlers={handlers} />}

        {tab === "staff" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <Eyebrow icon={User}>Your profile</Eyebrow>
              <AvatarPicker person={teacher} size={84}
                onSetPhoto={(photo) => handlers.patchTeacher(teacher.id, { photo })}
                onSetStyle={(avatarStyle) => handlers.patchTeacher(teacher.id, { avatarStyle, photo: null })} />
            </Card>
            <div>
              <Eyebrow icon={Users}>Teachers using this weight room</Eyebrow>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {db.teachers.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", padding: "11px 14px", borderBottom: i === db.teachers.length - 1 ? "none" : `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar person={t} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}{t.id === teacher.id ? " (you)" : ""}</div>
                        <div style={{ fontSize: 11, color: C.steel }}>
                          {db.classes.filter((c) => c.teacherId === t.id).length} classes · code {t.pin}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card>
              <Eyebrow icon={Lock}>Coach access code</Eyebrow>
              <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
                Required on the sign-in screen before anyone can create a new teacher account there. Adding a teacher from right here on this page doesn&rsquo;t need it &mdash; that path is already limited to people who can sign in as a coach.
              </p>
              <CoachAccessCode teacherCode={db.teacherCode} onSetTeacherCode={handlers.setTeacherCode} />
            </Card>
            <Card>
              <Eyebrow icon={Copy}>Substitute code</Eyebrow>
              <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
                Give this to a sub for the day. It opens a limited view of just your classes &mdash; today&rsquo;s sessions and roster, attendance-taking &mdash; with no access to rosters, reports, or anything else. Doesn&rsquo;t need to change often; hand it out fresh each time if you'd rather.
              </p>
              <SubstituteCode teacher={teacher} onPatchTeacher={handlers.patchTeacher} />
            </Card>
            <Card>
              <Eyebrow icon={Plus}>Add a teacher</Eyebrow>
              <p style={{ fontSize: 12, color: C.steel, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
                Each teacher builds their own classes, groups, and sessions. Saved sessions are shared across staff so you can borrow each other&rsquo;s work; rosters and athlete data stay with whoever owns the class.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 2, minWidth: 150 }}>
                  <Field label="Name"><input value={newTeacher} onChange={(e) => setNewTeacher(e.target.value)} className="f" style={inputCss} /></Field>
                </div>
                <div style={{ flex: 1, minWidth: 96 }}>
                  <Field label="4-digit code"><input value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className="f" style={inputCss} /></Field>
                </div>
                <Button icon={Check} disabled={!newTeacher.trim() || newPin.length !== 4}
                  onClick={() => { handlers.addTeacher(newTeacher.trim(), newPin); setNewTeacher(""); setNewPin(""); }}>Add</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===============================================================
   SIGN IN
================================================================ */
function SignIn({ db, loading, onStudent, onTeacher, onAddStudent, onAddTeacher, onSub }) {
  const [role, setRole] = useState(null);
  const [pending, setPending] = useState(null);
  const [pinError, setPinError] = useState(null);
  const [query, setQuery] = useState("");
  const [station, setStation] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [nsName, setNsName] = useState("");
  const [nsClass, setNsClass] = useState("");
  const [nsGroup, setNsGroup] = useState("");
  const [nsGrad, setNsGrad] = useState("");
  const [nsPin, setNsPin] = useState("");
  const [nsGoal, setNsGoal] = useState("");
  const [nsClassCode, setNsClassCode] = useState("");
  const [nsClassCodeError, setNsClassCodeError] = useState(null);
  const [ntName, setNtName] = useState("");
  const [ntPin, setNtPin] = useState("");
  const [ntSetupCode, setNtSetupCode] = useState("");
  const [ntEntryCode, setNtEntryCode] = useState("");
  const [ntCodeError, setNtCodeError] = useState(null);
  const [ntUnlocked, setNtUnlocked] = useState(false);
  const [subEntryCode, setSubEntryCode] = useState("");
  const [subError, setSubError] = useState(null);

  const startYear = schoolYearStart(today());
  const filtered = db.students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const tryPin = (pin) => {
    if (pending.kind === "student") {
      if (pin === pending.person.pin) onStudent(pending.person);
      else { setPinError("That code doesn't match. Ask your teacher if you forgot it."); }
    } else {
      if (pin === pending.person.pin) onTeacher(pending.person);
      else setPinError("Wrong code.");
    }
  };

  const wrap = (children) => (
    <div className="b" style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 18px 40px" }}>
      <Helmet size={54} />
      <div style={{ fontSize: 11, letterSpacing: 3.2, color: C.accent, fontWeight: 700, marginTop: 13, textTransform: "uppercase" }}>Sentinel Spartans</div>
      <span className="d" style={{ fontSize: 32, textTransform: "uppercase", marginBottom: 26, lineHeight: 1.1 }}>Performance</span>
      <div style={{ width: "100%", maxWidth: 440 }}>{children}</div>
    </div>
  );

  if (loading) return wrap(<div style={{ color: C.textDim, textAlign: "center", fontSize: 13 }}>Loading the room…</div>);

  if (pending) {
    return wrap(
      <Card>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div className="d" style={{ fontSize: 21, textTransform: "uppercase" }}>{pending.person.name}</div>
        </div>
        <PinPad onSubmit={tryPin} onCancel={() => { setPending(null); setPinError(null); }} error={pinError} />
      </Card>
    );
  }

  if (!role) {
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <p style={{ color: C.textDim, fontSize: 14, textAlign: "center", margin: "0 0 8px", lineHeight: 1.55 }}>
          Log your lifts, sprints, and check-ins. Your numbers follow you all four years.
        </p>
        <Button size="lg" icon={Dumbbell} full onClick={() => setRole("student")}>I&rsquo;m a student</Button>
        <Button size="lg" variant="ghost" icon={Users} full onClick={() => setRole("teacher")}>I&rsquo;m a teacher</Button>
        <Button size="lg" variant="ghost" icon={Copy} full onClick={() => setRole("sub")}>I&rsquo;m a substitute</Button>
        <p style={{ fontSize: 11, color: C.steel, textAlign: "center", lineHeight: 1.6, marginTop: 10 }}>
          Your code keeps your log off other students&rsquo; screens. Your teacher can see your training, check-ins, and body weight &mdash; that&rsquo;s the point of the class. Nothing here is a secure vault, so don&rsquo;t put anything in it you wouldn&rsquo;t hand your coach on paper.
        </p>
      </div>
    );
  }

  if (role === "teacher") {
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {!db.teachers.length ? (
          <Card glow>
            <Eyebrow icon={GraduationCap}>Set up the first teacher</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <Field label="Your name"><input value={ntName} onChange={(e) => setNtName(e.target.value)} className="f" style={inputCss} /></Field>
              <Field label="Pick a 4-digit code" hint="Your own sign-in code, just for you.">
                <input value={ntPin} onChange={(e) => setNtPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className="f" style={inputCss} />
              </Field>
              <Field label="Set a coach access code" hint="Anyone adding a teacher account after you will need this. Share it only with other coaches — write it down somewhere safe.">
                <input value={ntSetupCode} onChange={(e) => setNtSetupCode(e.target.value)} className="f" style={inputCss} placeholder="e.g. a word or short phrase" />
              </Field>
              <Button full icon={Check} disabled={!ntName.trim() || ntPin.length !== 4 || !ntSetupCode.trim()}
                onClick={() => onAddTeacher(ntName.trim(), ntPin, true, ntSetupCode.trim())}>Create and sign in</Button>
            </div>
          </Card>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {db.teachers.map((t) => (
                <button key={t.id} onClick={() => setPending({ kind: "teacher", person: t })} className="f" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 15px",
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
                  fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}><GraduationCap size={16} color={C.steel} />{t.name}</span>
                  <Lock size={14} color={C.steel} />
                </button>
              ))}
            </div>
            <Card>
              <Eyebrow icon={Plus}>New teacher</Eyebrow>
              {!ntUnlocked ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <Field label="Coach access code" hint="Ask an existing teacher for this.">
                      <input value={ntEntryCode} onChange={(e) => { setNtEntryCode(e.target.value); setNtCodeError(null); }} className="f" style={inputCss} />
                    </Field>
                  </div>
                  <Button disabled={!ntEntryCode.trim()} onClick={() => {
                    if (ntEntryCode === db.teacherCode) { setNtUnlocked(true); setNtCodeError(null); }
                    else setNtCodeError("That code doesn't match.");
                  }}>Continue</Button>
                  {ntCodeError && <p style={{ width: "100%", fontSize: 12, color: C.bad, margin: 0 }}>{ntCodeError}</p>}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 2, minWidth: 130 }}><Field label="Name"><input value={ntName} onChange={(e) => setNtName(e.target.value)} className="f" style={inputCss} /></Field></div>
                  <div style={{ flex: 1, minWidth: 92 }}><Field label="Code"><input value={ntPin} onChange={(e) => setNtPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className="f" style={inputCss} /></Field></div>
                  <Button disabled={!ntName.trim() || ntPin.length !== 4} onClick={() => { onAddTeacher(ntName.trim(), ntPin, false); setNtName(""); setNtPin(""); setNtUnlocked(false); setNtEntryCode(""); }}>Add</Button>
                </div>
              )}
            </Card>
          </>
        )}
        <Button variant="ghost" full onClick={() => setRole(null)}>Back</Button>
      </div>
    );
  }

  if (role === "sub") {
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <Eyebrow icon={Copy}>Substitute sign-in</Eyebrow>
          <p style={{ fontSize: 12.5, color: C.textDim, marginTop: -4, marginBottom: 12, lineHeight: 1.55 }}>
            Enter the code the regular teacher gave you. You&rsquo;ll see today&rsquo;s sessions and the roster &mdash; nothing else.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <input value={subEntryCode} onChange={(e) => { setSubEntryCode(e.target.value); setSubError(null); }} className="f" style={inputCss} placeholder="Substitute code" />
            </div>
            <Button disabled={!subEntryCode.trim()} onClick={() => {
              const t = db.teachers.find((x) => x.subCode && x.subCode === subEntryCode.trim());
              if (t) { onSub(t); } else setSubError("That code doesn't match any teacher.");
            }}>Continue</Button>
          </div>
          {subError && <p style={{ fontSize: 12, color: C.bad, marginTop: 8 }}>{subError}</p>}
        </Card>
        <Button variant="ghost" full onClick={() => setRole(null)}>Back</Button>
      </div>
    );
  }

  return wrap(
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find your name" className="f" style={inputCss} />

      <div className="sc" style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
        {!db.students.length && <Empty icon={User}>Nobody on the roster yet. Add yourself below, or ask your teacher to build the class list.</Empty>}
        {filtered.map((s) => {
          const group = db.groups.find((g) => g.id === s.groupId);
          return (
            <button key={s.id} onClick={() => (station ? onStudent(s) : setPending({ kind: "student", person: s }))} className="f" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
              fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}><User size={16} color={C.steel} />{s.name}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {group && <Chip tone="gold">{group.name}</Chip>}
                {!station && <Lock size={13} color={C.steel} />}
              </span>
            </button>
          );
        })}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: C.textDim, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", cursor: "pointer", lineHeight: 1.5 }}>
        <input type="checkbox" checked={station} onChange={(e) => setStation(e.target.checked)} style={{ accentColor: C.accent, width: 16, height: 16, flexShrink: 0 }} />
        <span><strong style={{ color: C.text }}>Station mode</strong> &mdash; skip codes on a shared weight-room tablet so athletes can tap in and out between sets.</span>
      </label>

      <Button variant="ghost" icon={Plus} full onClick={() => setShowAdd(true)}>Add me to the roster</Button>
      <Button variant="ghost" full onClick={() => setRole(null)}>Back</Button>

      {showAdd && (
        <Modal title="Add me to the roster" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Your name"><input value={nsName} onChange={(e) => setNsName(e.target.value)} className="f" style={inputCss} /></Field>
            <Field label="Class period">
              <select value={nsClass} onChange={(e) => { setNsClass(e.target.value); setNsGroup(""); setNsClassCode(""); setNsClassCodeError(null); }} className="f" style={inputCss}>
                <option value="">Not sure yet</option>
                {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            {nsClass && db.classes.find((c) => c.id === nsClass) && db.classes.find((c) => c.id === nsClass).joinCode && (
              <Field label="Class code" hint="Your teacher gives you this for your class period.">
                <input value={nsClassCode} onChange={(e) => { setNsClassCode(e.target.value); setNsClassCodeError(null); }} className="f" style={inputCss} />
                {nsClassCodeError && <span style={{ fontSize: 11.5, color: C.bad, marginTop: 4, display: "block" }}>{nsClassCodeError}</span>}
              </Field>
            )}
            {nsClass && (
              <Field label="Group" hint="Leave blank if your teacher hasn't told you yet.">
                <select value={nsGroup} onChange={(e) => setNsGroup(e.target.value)} className="f" style={inputCss}>
                  <option value="">No group</option>
                  {db.groups.filter((g) => g.classId === nsClass).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="When do you graduate?">
              <select value={nsGrad} onChange={(e) => setNsGrad(e.target.value)} className="f" style={inputCss}>
                <option value="">Not set</option>
                {[1, 2, 3, 4].map((n) => {
                  const y = startYear + n;
                  return <option key={y} value={y}>{y} &mdash; {GRADE_NAME[13 - n]}</option>;
                })}
              </select>
            </Field>
            <Field label="Pick a 4-digit code" hint="Keeps your log on your screen. Your teacher can always see your training.">
              <input value={nsPin} onChange={(e) => setNsPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className="f" style={inputCss} />
            </Field>
            <Field label="What are you training for?" hint="Sets which badges you'll see — change it anytime from your Me tab.">
              <select value={nsGoal} onChange={(e) => setNsGoal(e.target.value)} className="f" style={inputCss}>
                <option value="">Not sure yet</option>
                {Object.entries(TRAINING_GOALS).map(([id, g]) => <option key={id} value={id}>{g.label}</option>)}
              </select>
            </Field>
            <Button full icon={Check} disabled={!nsName.trim() || nsPin.length !== 4}
              onClick={() => {
                const cls = db.classes.find((c) => c.id === nsClass);
                if (cls && cls.joinCode && nsClassCode.trim() !== cls.joinCode) {
                  setNsClassCodeError("That code doesn't match. Check with your teacher.");
                  return;
                }
                onAddStudent({ name: nsName.trim(), classId: nsClass || null, groupId: nsGroup || null, gradYear: nsGrad ? Number(nsGrad) : null, pin: nsPin, trainingGoal: nsGoal || null }, true);
                setShowAdd(false);
              }}>Save and start</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ===============================================================
   ROOT
================================================================ */
export default function App() {
  const [view, setView] = useState("signin");
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [subTeacher, setSubTeacher] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [custom, setCustom] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [logs, setLogs] = useState({});
  const [checkins, setCheckins] = useState({});
  const [maxes, setMaxes] = useState({});
  const [comments, setComments] = useState({});
  const [fuelLogs, setFuelLogs] = useState({});
  const [hiddenBuiltins, setHiddenBuiltins] = useState([]);
  const [injuries, setInjuries] = useState({});
  const [weightConcerns, setWeightConcerns] = useState({});
  const [teacherCode, setTeacherCodeState] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [cycles, setCycles] = useState([]);
  const [prFeed, setPrFeed] = useState([]);
  const [goals, setGoals] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [testingDays, setTestingDays] = useState([]);
  const [personalSchedule, setPersonalSchedule] = useState({});

  useEffect(() => {
    (async () => {
      const [t, c, g, s, cu, p, sc, ci, mx, cm, fl, hb, inj, tc, att, cyc, prf, gl, an, td, ps, wc] = await Promise.all([
        sGet(K("teachers")), sGet(K("classes")), sGet(K("groups")), sGet(K("students")),
        sGet(K("custom")), sGet(K("programs")), sGet(K("schedule")),
        sGet(K("checkins")), sGet(K("maxes")), sGet(K("comments")), sGet(K("fuelLogs")),
        sGet(K("hiddenBuiltins")), sGet(K("injuries")), sGet(K("teacherCode")),
        sGet(K("attendance")), sGet(K("cycles")), sGet(K("prFeed")), sGet(K("goals")), sGet(K("announcements")), sGet(K("testingDays")),
        sGet(K("personalSchedule")), sGet(K("weightConcerns")),
      ]);
      setTeachers(t || []); setClasses(c || []); setGroups(g || []); setStudents(s || []);
      setCustom(cu || []); setPrograms((p || []).map(normalizeProgram)); setSchedule(sc || []);
      setCheckins(ci || {}); setMaxes(mx || {}); setComments(cm || {}); setFuelLogs(fl || {});
      setHiddenBuiltins(hb || []);
      setInjuries(inj || {});
      setWeightConcerns(wc || {});
      setTeacherCodeState(tc || null);
      setAttendance(att || {});
      setCycles(cyc || []);
      setPrFeed(prf || []);
      setGoals(gl || []);
      setAnnouncements(an || []);
      setPersonalSchedule(ps || {});
      setTestingDays(td || []);

      // Logs are sharded one key per person (student or teacher) instead
      // of one combined key for the whole school — the combined key is
      // exactly what let a single storage value grow past the 5MB cap at
      // real scale, silently discarding new sets past that point with no
      // warning to the athlete. One-time migration below: if an older,
      // pre-sharded "logs" key is still present, split it into per-person
      // shards and remove the old key so nothing ever writes to it again.
      const legacyLogs = await sGet(K("logs"));
      let logsObj = {};
      if (legacyLogs && Object.keys(legacyLogs).length) {
        await Promise.all(Object.entries(legacyLogs).map(([id, arr]) => sSet(K("logs:" + id), arr)));
        await sDelete(K("logs"));
        logsObj = legacyLogs;
      } else {
        const allIds = [...new Set([...(s || []).map((x) => x.id), ...(t || []).map((x) => x.id)])];
        const shardResults = await Promise.all(allIds.map((id) => sGet(K("logs:" + id))));
        allIds.forEach((id, i) => { if (shardResults[i] && shardResults[i].length) logsObj[id] = shardResults[i]; });
      }
      setLogs(logsObj);

      const identity = window.sentinelIdentity;
      if (identity?.role === 'student') { setStudent((s || []).find(p => p.id === identity.id)); setView('student'); }
      if (identity?.role === 'sub') { setSubTeacher((t || []).find(p => p.id === identity.id)); setView('sub'); }
      if (identity?.role === 'teacher') { setTeacher((t || []).find(p => p.id === identity.id)); setView('coach'); }
      setLoading(false);
    })();
  }, []);

  // Hidden built-ins drop out of the picker lists everywhere; custom
  // overrides of a built-in take its place instead of duplicating it.
  const exercises = useMemo(() => {
    const libNames = LIBRARY.map((e) => e.name).filter((n) => !hiddenBuiltins.includes(n));
    return [...new Set([...libNames, ...custom.map((e) => e.name)])];
  }, [custom, hiddenBuiltins]);

  const db = { teachers, classes, groups, students, custom, programs, schedule, logs, checkins, maxes, comments, fuelLogs, hiddenBuiltins, injuries, weightConcerns, teacherCode, attendance, cycles, prFeed, goals, announcements, testingDays, personalSchedule, exercises };

  // Was: fire the save and never check whether it worked. sSet swallows
  // its own errors and returns false on failure (e.g. the 5MB per-key
  // cap), so a student could log a set, see it appear, and have it
  // silently vanish on next load — no error, nothing to catch it.
  // Now: still update the UI immediately (so logging still feels
  // instant), but actually await the write and surface a persistent,
  // impossible-to-miss banner the moment one fails, instead of quietly
  // pretending everything saved.
  const persist = (key, value, setter) => {
    setter(value);
    sSet(K(key), value).then((ok) => {
      if (!ok) setSaveError({ key, at: new Date() });
    });
  };

  /* ---- students ---- */
  const nextPin = () => String(1000 + Math.floor(Math.random() * 9000));

  // Same fix as assign/saveProgram: Bulk Add calls this once per pasted
  // name, all in one synchronous action — a stale-closure read of
  // `students` meant only the last name in the list ever got saved.
  const addStudent = (data, signIn) => {
    const existing = students.find((s) => s.name.toLowerCase() === data.name.toLowerCase());
    if (existing) { if (signIn) { setStudent(existing); setView("student"); } return; }
    const s = { id: uid(), pin: data.pin || nextPin(), ...data };
    setStudents((prev) => {
      const next = [...prev, s];
      sSet(K("students"), next);
      return next;
    });
    if (signIn) { setStudent(s); setView("student"); }
  };
  // Uses React's functional setState form deliberately: when two patches
  // fire back-to-back in the same handler (e.g. setting a calorie target
  // and a weight goal together), each must build on the other's result,
  // not on the students array captured when the click started — otherwise
  // the second write silently discards the first.
  const patchStudent = (id, patch) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      sSet(K("students"), next);
      return next;
    });
  };
  const deleteStudent = (id) => {
    persist("students", students.filter((s) => s.id !== id), setStudents);
    setLogs((prev) => { const { [id]: _l, ...rest } = prev; return rest; });
    sDelete(K("logs:" + id));
    const { [id]: _c, ...restCheckins } = checkins; persist("checkins", restCheckins, setCheckins);
    const { [id]: _m, ...restMaxes } = maxes; persist("maxes", restMaxes, setMaxes);
    const { [id]: _cm, ...restComments } = comments; persist("comments", restComments, setComments);
    const { [id]: _fl, ...restFuel } = fuelLogs; persist("fuelLogs", restFuel, setFuelLogs);
    const { [id]: _a, ...restAttendance } = attendance; persist("attendance", restAttendance, setAttendance);
    const { [id]: _i, ...restInjuries } = injuries; persist("injuries", restInjuries, setInjuries);
    const { [id]: _w, ...restConcerns } = weightConcerns; persist("weightConcerns", restConcerns, setWeightConcerns);
    persist("prFeed", prFeed.filter((entry) => entry.studentId !== id), setPrFeed);
  };

  /* ---- teachers ---- */
  const addTeacher = (name, pin, signIn, newTeacherCode) => {
    const t = { id: uid(), name, pin };
    persist("teachers", [...teachers, t], setTeachers);
    // The very first teacher account also sets the shared code that
    // gates every teacher account created after it.
    if (newTeacherCode) { setTeacherCodeState(newTeacherCode); sSet(K("teacherCode"), newTeacherCode); }
    if (signIn) { setTeacher(t); setView("coach"); }
  };
  const setTeacherCode = (code) => { setTeacherCodeState(code); sSet(K("teacherCode"), code); };
  const patchTeacher = (id, patch) => {
    setTeachers((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      sSet(K("teachers"), next);
      return next;
    });
  };

  /* ---- classes & groups ---- */
  const addClass = (teacherId, name) => persist("classes", [...classes, { id: uid(), teacherId, name }], setClasses);
  const patchClass = (id, patch) => persist("classes", classes.map((c) => (c.id === id ? { ...c, ...patch } : c)), setClasses);
  const deleteClass = (id) => {
    persist("classes", classes.filter((c) => c.id !== id), setClasses);
    const gone = groups.filter((g) => g.classId === id).map((g) => g.id);
    persist("groups", groups.filter((g) => g.classId !== id), setGroups);
    persist("students", students.map((s) => (s.classId === id ? { ...s, classId: null, groupId: null } : s)), setStudents);
    persist("schedule", schedule.map((x) => ({ ...x, groupIds: x.groupIds.filter((g) => !gone.includes(g)) })).filter((x) => x.groupIds.length), setSchedule);
  };
  const addGroup = (classId, name) => persist("groups", [...groups, { id: uid(), classId, name }], setGroups);
  const deleteGroup = (id) => {
    persist("groups", groups.filter((g) => g.id !== id), setGroups);
    persist("students", students.map((s) => (s.groupId === id ? { ...s, groupId: null } : s)), setStudents);
    persist("schedule", schedule.map((x) => ({ ...x, groupIds: x.groupIds.filter((g) => g !== id) })).filter((x) => x.groupIds.length), setSchedule);
  };

  /* ---- exercises ---- */
  const addExercise = (name) => {
    if (exercises.includes(name)) return;
    persist("custom", [...custom, { name, mode: "weight", group: "Other" }], setCustom);
  };
  // Library create/edit. `original` is the previous name when renaming.
  const saveExercise = (ex, original) => {
    const clean = Object.fromEntries(Object.entries(ex).filter(([, v]) => v !== undefined));
    let next;
    if (original) {
      const existing = custom.find((e) => e.name === original);
      if (existing) {
        next = custom.map((e) => (e.name === original ? { ...e, ...clean } : e));
      } else {
        // First edit to a built-in — add a same-named override rather
        // than mapping over a custom record that doesn't exist yet.
        next = [...custom, clean];
      }
      if (original !== clean.name) {
        // keep logs and prescriptions pointing at the renamed movement
        for (const [personId, entries] of Object.entries(logs)) {
          if (entries.some((entry) => entry.exercise === original)) {
            persistLogShard(personId, (current) => current.map((entry) => entry.exercise === original ? { ...entry, exercise: clean.name } : entry));
          }
        }
        const renamedMaxes = Object.fromEntries(Object.entries(maxes).map(([personId, values]) => {
          const { [original]: previousMax, ...otherMaxes } = values;
          return [personId, previousMax ? { ...otherMaxes, [clean.name]: previousMax } : values];
        }));
        persist("maxes", renamedMaxes, setMaxes);
        persist("testingDays", testingDays.map((day) => ({ ...day, exercises: day.exercises.map((name) => name === original ? clean.name : name) })), setTestingDays);
        if (LIBRARY.some((entry) => entry.name === original) && !hiddenBuiltins.includes(original)) {
          persist("hiddenBuiltins", [...hiddenBuiltins, original], setHiddenBuiltins);
        }
        persist("programs", programs.map((p) => ({
          ...normalizeProgram(p),
          blocks: normalizeProgram(p).blocks.map((b) => ({
            ...b, exercises: b.exercises.map((e) => (e.exercise === original ? { ...e, exercise: clean.name } : e)),
          })),
        })), setPrograms);
      }
    } else if (custom.find((e) => e.name === clean.name)) {
      next = custom.map((e) => (e.name === clean.name ? { ...e, ...clean } : e));
    } else {
      next = [...custom, clean];
    }
    persist("custom", next, setCustom);
  };
  const deleteExercise = (name) => persist("custom", custom.filter((e) => e.name !== name), setCustom);
  // "Deleting" a built-in just hides it from pickers — the LIBRARY
  // constant itself is never touched, so it can always be restored.
  const hideExercise = (name) => persist("hiddenBuiltins", [...hiddenBuiltins, name], setHiddenBuiltins);
  const restoreExercise = (name) => persist("hiddenBuiltins", hiddenBuiltins.filter((n) => n !== name), setHiddenBuiltins);

  /* ---- programs & schedule ---- */
  // Functional setState form, same reasoning as patchStudent/patchTeacher:
  // importing a starter program calls this once per session in a row
  // (up to a dozen times for a big bundle), all within one synchronous
  // action. Reading `programs` from the outer closure meant every call
  // but the last one built its next array from the same stale snapshot —
  // so only the final session in a bundle ever actually got saved, and
  // every other day silently pointed at a program that never existed.
  const saveProgram = (program) => {
    setPrograms((prev) => {
      const exists = prev.find((p) => p.id === program.id);
      const next = exists ? prev.map((p) => (p.id === program.id ? program : p)) : [program, ...prev];
      sSet(K("programs"), next);
      return next;
    });
  };
  const deleteProgram = (id) => {
    persist("programs", programs.filter((p) => p.id !== id), setPrograms);
    persist("schedule", schedule.filter((s) => s.programId !== id), setSchedule);
  };
  // Same fix as saveProgram/patchStudent: "Repeat weekly" calls this once
  // per date in a row (up to 18 times for a semester), all in one
  // synchronous action — a stale-closure read of `schedule` meant only
  // the last date in the run ever actually got scheduled.
  const assign = (entry) => {
    setSchedule((prev) => {
      const next = [...prev, entry];
      sSet(K("schedule"), next);
      return next;
    });
  };
  const unassign = (id) => persist("schedule", schedule.filter((s) => s.id !== id), setSchedule);
  const repointSchedule = (scheduleId, programId) =>
    persist("schedule", schedule.map((s) => (s.id === scheduleId ? { ...s, programId } : s)), setSchedule);

  /* ---- training data ---- */
  // Writes only the one person's shard, functional-setState form (same
  // race-condition guard as saveProgram/assign/addStudent — safe even
  // if this is ever called several times in a row in one action) and
  // the same visible-failure guard as persist().
  const persistLogShard = (id, updater) => {
    setLogs((prev) => {
      const nextArr = updater(prev[id] || []);
      sSet(K("logs:" + id), nextArr).then((ok) => { if (!ok) setSaveError({ key: "logs:" + id, at: new Date() }); });
      return { ...prev, [id]: nextArr };
    });
  };
  const addLog = (studentId, entry) => {
    const rec = { id: uid(), date: today(), ...entry };
    persistLogShard(studentId, (prevArr) => [...prevArr, rec]);
  };
  const saveCheckIn = (studentId, checkin) => {
    const mine = (checkins[studentId] || []).filter((c) => c.date !== checkin.date);
    const next = { ...checkins, [studentId]: [...mine, { id: uid(), ...checkin }] };
    persist("checkins", next, setCheckins);
  };
  const updateLog = (studentId, logId, patch) => {
    persistLogShard(studentId, (prevArr) => prevArr.map((l) => (l.id === logId ? { ...l, ...patch } : l)));
  };
  const deleteLog = (studentId, logId) => {
    persistLogShard(studentId, (prevArr) => prevArr.filter((l) => l.id !== logId));
  };
  const saveComment = (studentId, date, text) => {
    const mine = (comments[studentId] || []).filter((c) => c.date !== date);
    const next = { ...comments, [studentId]: [...mine, { id: uid(), date, text }] };
    persist("comments", next, setComments);
  };
  const setMax = (studentId, exercise, value) => {
    const next = { ...maxes, [studentId]: { ...(maxes[studentId] || {}), [exercise]: { value, date: today() } } };
    persist("maxes", next, setMaxes);
  };

  /* ---- fueling: each student's own free-typed food log (with optional
     macros, Cronometer-style) and actual logged water ---- */
  const dayFuelRec = (studentId, date) => (fuelLogs[studentId] || []).find((r) => r.date === date);
  const writeFuelRec = (studentId, date, patch) => {
    const mine = fuelLogs[studentId] || [];
    const rec = mine.find((r) => r.date === date);
    const nextRec = {
      id: rec ? rec.id : uid(), date,
      foods: rec ? rec.foods : [], water: rec ? rec.water || [] : [],
      ...patch,
    };
    const others = mine.filter((r) => r.date !== date);
    persist("fuelLogs", { ...fuelLogs, [studentId]: [...others, nextRec] }, setFuelLogs);
  };
  const addFuelFood = (studentId, date, mealId, payload) => {
    const rec = dayFuelRec(studentId, date);
    const entry = typeof payload === "string" ? { text: payload } : payload;
    const foods = [...(rec ? rec.foods : []), { id: uid(), time: new Date().toISOString(), mealId, ...entry }];
    writeFuelRec(studentId, date, { foods });
  };
  const deleteFuelFood = (studentId, date, foodId) => {
    const rec = dayFuelRec(studentId, date);
    if (!rec) return;
    writeFuelRec(studentId, date, { foods: rec.foods.filter((f) => f.id !== foodId) });
  };
  const addWater = (studentId, date, oz) => {
    const rec = dayFuelRec(studentId, date);
    const water = [...(rec && rec.water ? rec.water : []), { id: uid(), oz, time: new Date().toISOString() }];
    writeFuelRec(studentId, date, { water });
  };
  const deleteWater = (studentId, date, waterId) => {
    const rec = dayFuelRec(studentId, date);
    if (!rec) return;
    writeFuelRec(studentId, date, { water: (rec.water || []).filter((w) => w.id !== waterId) });
  };

  /* ---- injuries: student reports, coach acknowledges ---- */
  const reportInjury = (studentId, report) => {
    const rec = { id: uid(), date: today(), status: "open", ...report };
    persist("injuries", { ...injuries, [studentId]: [...(injuries[studentId] || []), rec] }, setInjuries);
  };
  const ackInjury = (studentId, injuryId) =>
    persist("injuries", {
      ...injuries,
      [studentId]: (injuries[studentId] || []).map((r) => (r.id === injuryId ? { ...r, status: "ack" } : r)),
    }, setInjuries);

  /* ---- weight-goal safety flags: raised automatically when a goal
     represents a large swing from the student's own current weight,
     acknowledged by a coach the same way an injury report is ---- */
  const flagWeightConcern = (studentId, flag) => {
    const rec = { id: uid(), date: today(), status: "open", ...flag };
    persist("weightConcerns", { ...weightConcerns, [studentId]: [...(weightConcerns[studentId] || []), rec] }, setWeightConcerns);
  };
  const ackWeightConcern = (studentId, flagId) =>
    persist("weightConcerns", {
      ...weightConcerns,
      [studentId]: (weightConcerns[studentId] || []).map((r) => (r.id === flagId ? { ...r, status: "ack" } : r)),
    }, setWeightConcerns);

  /* ---- attendance: one present/absent mark per student per date ---- */
  const markAttendance = (studentId, date, present) => {
    const mine = attendance[studentId] || [];
    const exists = mine.find((a) => a.date === date);
    const next = exists
      ? mine.map((a) => (a.date === date ? { ...a, present } : a))
      : [...mine, { id: uid(), date, present }];
    persist("attendance", { ...attendance, [studentId]: next }, setAttendance);
  };

  /* ---- training cycles: multi-week templates that generate schedule
     entries in one shot when applied ---- */
  const saveCycle = (cycle) => {
    const exists = cycles.find((c) => c.id === cycle.id);
    const next = exists ? cycles.map((c) => (c.id === cycle.id ? cycle : c)) : [...cycles, cycle];
    persist("cycles", next, setCycles);
  };
  const deleteCycle = (id) => persist("cycles", cycles.filter((c) => c.id !== id), setCycles);
  const applyCycle = (cycle, startDate, groupIds) => {
    const entries = cycle.items.map((it) => ({
      id: uid(), date: addDays(startDate, it.dayOffset), programId: it.programId, groupIds,
    }));
    persist("schedule", [...schedule, ...entries], setSchedule);
  };

  /* ---- PR feed: a durable record of every PR, so the TV display can
     catch and celebrate one live instead of it only ever being a toast
     on the athlete's own screen ---- */
  const recordPR = (studentId, entry) => {
    const rec = { id: uid(), studentId, exercise: entry.exercise, display: entry.display, time: new Date().toISOString() };
    // Keep the feed bounded — this only ever needs to cover "did
    // anything happen in roughly the last few minutes of class."
    persist("prFeed", [...prFeed, rec].slice(-100), setPrFeed);
  };

  /* ---- shared team/class goals — a target the whole group works
     toward together, not an individual leaderboard spot ---- */
  const saveGoal = (goal) => {
    const exists = goals.find((g) => g.id === goal.id);
    const next = exists ? goals.map((g) => (g.id === goal.id ? goal : g)) : [...goals, goal];
    persist("goals", next, setGoals);
  };
  const deleteGoal = (id) => persist("goals", goals.filter((g) => g.id !== id), setGoals);

  /* ---- announcements: a coach broadcast to a class or group, shown
     on the athlete's Training tab until it expires ---- */
  const saveAnnouncement = (a) => persist("announcements", [...announcements, a], setAnnouncements);
  const deleteAnnouncement = (id) => persist("announcements", announcements.filter((a) => a.id !== id), setAnnouncements);

  /* ---- testing days: mark a scheduled date as a max-test event so
     the athlete's screen and the coach's TV both switch into that mode ---- */
  const setTestingDay = (date, exercises, on) => {
    if (on) persist("testingDays", [...testingDays.filter((t) => t.date !== date), { id: uid(), date, exercises }], setTestingDays);
    else persist("testingDays", testingDays.filter((t) => t.date !== date), setTestingDays);
  };

  /* ---- a teacher's own personal calendar — completely separate from
     student scheduling, keyed to the teacher's own id ---- */
  const assignPersonal = (teacherId, entry) => {
    const mine = personalSchedule[teacherId] || [];
    persist("personalSchedule", { ...personalSchedule, [teacherId]: [...mine, entry] }, setPersonalSchedule);
  };
  const unassignPersonal = (teacherId, id) => {
    const mine = personalSchedule[teacherId] || [];
    persist("personalSchedule", { ...personalSchedule, [teacherId]: mine.filter((e) => e.id !== id) }, setPersonalSchedule);
  };

  const handlers = {
    addClass, patchClass, deleteClass, addGroup, deleteGroup, addStudent, patchStudent, deleteStudent,
    saveProgram, deleteProgram, assign, unassign, repointSchedule, setMax, addTeacher, patchTeacher, setTeacherCode,
    saveExercise, deleteExercise, hideExercise, restoreExercise, ackInjury,
    flagWeightConcern, ackWeightConcern,
    markAttendance, saveCycle, deleteCycle, applyCycle,
    recordPR, saveGoal, deleteGoal, saveAnnouncement, deleteAnnouncement, setTestingDay,
    addLog, addExercise, addFuelFood, deleteFuelFood, addWater, deleteWater,
    assignPersonal, unassignPersonal,
  };

  // Keep the signed-in records fresh when the underlying lists change.
  const liveStudent = student ? students.find((s) => s.id === student.id) || student : null;
  const liveTeacher = teacher ? teachers.find((t) => t.id === teacher.id) || teacher : null;
  const liveSubTeacher = subTeacher ? teachers.find((t) => t.id === subTeacher.id) || subTeacher : null;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg }}>
      <GlobalStyle />
      {saveError && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
          background: C.bad, color: "#fff", padding: "12px 16px", fontSize: 13.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", textAlign: "center",
        }}>
          <AlertTriangle size={17} style={{ flexShrink: 0 }} />
          <span>Your last change didn&rsquo;t save — you may be offline, or storage is full. Don&rsquo;t close this tab. Try the action again, and tell your coach if this keeps happening.</span>
          <button onClick={() => setSaveError(null)} className="f" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, color: "#fff", padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
            Dismiss
          </button>
        </div>
      )}
      {view === "signin" && (
        <SignIn
          db={db} loading={loading}
          onStudent={(s) => { setStudent(s); setView("student"); }}
          onTeacher={(t) => { setTeacher(t); setView("coach"); }}
          onAddStudent={addStudent}
          onAddTeacher={addTeacher}
          onSub={(t) => { setSubTeacher(t); setView("sub"); }}
        />
      )}
      {view === "student" && liveStudent && (
        <StudentView
          student={liveStudent} db={db}
          onBack={() => { if (window.sentinelLogout) { window.sentinelLogout().catch(() => window.location.reload()); return; } setStudent(null); setView("signin"); }}
          onLog={addLog} onCheckIn={saveCheckIn} onComment={saveComment} onAddExercise={addExercise}
          onUpdateLog={updateLog} onDeleteLog={deleteLog} onPatchStudent={patchStudent}
          onAddFuelFood={addFuelFood} onDeleteFuelFood={deleteFuelFood}
          onAddWater={addWater} onDeleteWater={deleteWater}
          onReportInjury={reportInjury}
          onNewPR={recordPR}
          onFlagWeightConcern={flagWeightConcern}
        />
      )}
      {view === "coach" && liveTeacher && (
        <CoachView
          teacher={liveTeacher} db={db}
          onBack={() => { if (window.sentinelLogout) { window.sentinelLogout().catch(() => window.location.reload()); return; } setTeacher(null); setView("signin"); }}
          handlers={handlers}
        />
      )}
      {view === "sub" && liveSubTeacher && (
        <SubView
          teacher={liveSubTeacher} db={db}
          onBack={() => { if (window.sentinelLogout) { window.sentinelLogout().catch(() => window.location.reload()); return; } setSubTeacher(null); setView("signin"); }}
          onMarkAttendance={markAttendance}
        />
      )}
    </div>
  );
}

export function WelcomeScreen({ onRole }) {
  const wrap = (children) => (
    <div className="b" style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 18px 40px" }}>
      <Helmet size={54} />
      <div style={{ fontSize: 11, letterSpacing: 3.2, color: C.accent, fontWeight: 700, marginTop: 13, textTransform: "uppercase" }}>Sentinel Spartans</div>
      <span className="d" style={{ fontSize: 32, textTransform: "uppercase", marginBottom: 26, lineHeight: 1.1 }}>Performance</span>
      <div style={{ width: "100%", maxWidth: 440 }}><GlobalStyle />{children}</div>
    </div>
  );


    return wrap(
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <p style={{ color: C.textDim, fontSize: 14, textAlign: "center", margin: "0 0 8px", lineHeight: 1.55 }}>
          Log your lifts, sprints, and check-ins. Your numbers follow you all four years.
        </p>
        <Button size="lg" icon={Dumbbell} full onClick={() => onRole("student")}>I&rsquo;m a student</Button>
        <Button size="lg" variant="ghost" icon={Users} full onClick={() => onRole("teacher")}>I&rsquo;m a teacher</Button>
        <Button size="lg" variant="ghost" icon={Copy} full onClick={() => onRole("sub")}>I&rsquo;m a substitute</Button>
        <p style={{ fontSize: 11, color: C.steel, textAlign: "center", lineHeight: 1.6, marginTop: 10 }}>
          Your code keeps your log off other students&rsquo; screens. Your teacher can see your training, check-ins, and body weight &mdash; that&rsquo;s the point of the class. Nothing here is a secure vault, so don&rsquo;t put anything in it you wouldn&rsquo;t hand your coach on paper.
        </p>
      </div>
    );
}

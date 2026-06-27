/**
 * Mock data for the Orios Portal homepage.
 * This file provides placeholder data for development.
 * Replace with real API calls when the backend is ready.
 */

export const mockStats = {
  classesToday: 4,
  pendingTasks: 3,
  upcomingEvents: 2,
  totalNotes: 24,
};

export const mockCountdowns = [
  {
    id: 1,
    title: "EEE 1201 Midterm",
    type: "exam",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    subject: "EEE 1201",
  },
  {
    id: 2,
    title: "PHY Lab Report 4",

    type: "lab",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    subject: "PHY 1201",
  },
  {
    id: 3,
    title: "MATH Assignment 3",
    type: "assignment",
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
    subject: "MATH 1201",
  },
];

export const mockSchedule = [
  {
    id: 1,
    time: "9:00",
    subject: "EEE 1201",
    teacher: "Dr. Rahman",
    room: "Room 301",
    type: "lecture",
  },
  {
    id: 2,
    time: "10:00",
    subject: "PHY 1201",
    teacher: "Prof. Ahmed",
    room: "Room 205",
    type: "lecture",
  },
  {
    id: 3,
    time: "11:30",
    subject: "CSE 1201",
    teacher: "Ms. Fatima",
    room: "Lab 4",
    type: "lab",
  },
  {
    id: 4,
    time: "2:00",
    subject: "MATH 1201",
    teacher: "Dr. Khan",
    room: "Room 102",
    type: "lecture",
  },
];

export const mockFeatures = [
  {
    title: "Notes",
    description: "Subject-wise notes, links, docs, and resources.",
    href: "/notes",
    icon: "FileText",
  },
  {
    title: "Assignments",
    description: "Track assignments with due dates and status.",
    href: "/assignments",
    icon: "ClipboardList",
  },
  {
    title: "Lab Reports",
    description: "Manage lab reports organized by subject.",
    href: "/lab-reports",
    icon: "FlaskConical",
  },
  {
    title: "Calendar",
    description: "Events, routine, and important dates.",
    href: "/calendar",
    icon: "Calendar",
  },
  {
    title: "Teachers",
    description: "Contact info and details for all teachers.",
    href: "/teachers",
    icon: "GraduationCap",
  },
  {
    title: "File Sharing",
    description: "Share and download class materials.",
    href: "/files",
    icon: "FolderOpen",
  },
];

export const mockNotes = [
  {
    id: 1,
    title: "Circuit Analysis Basics",
    subject: "EEE 1201",
    type: "pdf",
    date: "2025-06-20",
    description: "Introduction to Kirchhoff's laws and Ohm's law with examples.",
  },
  {
    id: 2,
    title: "AC vs DC Circuits",
    subject: "EEE 1201",
    type: "pdf",
    date: "2025-06-18",
    description: "Comparison of AC and DC circuit behavior and applications.",
  },
  {
    id: 3,
    title: "Thevenin's Theorem Notes",
    subject: "EEE 1201",
    type: "doc",
    date: "2025-06-15",
    description: "Step-by-step guide to solving circuits using Thevenin's theorem.",
  },
  {
    id: 4,
    title: "Newton's Laws of Motion",
    subject: "PHY 1201",
    type: "pdf",
    date: "2025-06-22",
    description: "Detailed notes on all three laws with real-world examples.",
  },
  {
    id: 5,
    title: "Wave Optics Reference",
    subject: "PHY 1201",
    type: "link",
    url: "https://example.com/wave-optics",
    date: "2025-06-19",
    description: "External resource covering diffraction and interference.",
  },
  {
    id: 6,
    title: "Rotational Mechanics Diagrams",
    subject: "PHY 1201",
    type: "image",
    date: "2025-06-14",
    description: "Free body diagrams for torque and angular momentum problems.",
  },
  {
    id: 7,
    title: "Integration Techniques",
    subject: "MATH 1201",
    type: "pdf",
    date: "2025-06-21",
    description: "Covers substitution, by-parts, and partial fractions.",
  },
  {
    id: 8,
    title: "Differential Equations Cheat Sheet",
    subject: "MATH 1201",
    type: "doc",
    date: "2025-06-17",
    description: "Quick reference for solving first and second order ODEs.",
  },
  {
    id: 9,
    title: "Matrix Operations",
    subject: "MATH 1201",
    type: "pdf",
    date: "2025-06-12",
    description: "Determinants, inverses, eigenvalues, and eigenvectors.",
  },
  {
    id: 10,
    title: "Intro to C Programming",
    subject: "CSE 1201",
    type: "pdf",
    date: "2025-06-23",
    description: "Variables, data types, control structures, and functions in C.",
  },
  {
    id: 11,
    title: "Data Structures Overview",
    subject: "CSE 1201",
    type: "link",
    url: "https://example.com/dsa",
    date: "2025-06-16",
    description: "Arrays, linked lists, stacks, and queues explained.",
  },
  {
    id: 12,
    title: "Pointer Arithmetic Notes",
    subject: "CSE 1201",
    type: "doc",
    date: "2025-06-10",
    description: "Understanding pointers, memory allocation, and arrays in C.",
  },
];

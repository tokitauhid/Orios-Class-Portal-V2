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

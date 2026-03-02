// API Base URL Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// JWT Token Key
export const TOKEN_KEY = 'workout_jwt_token';
export const USER_KEY = 'workout_user';

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
  },
  WORKOUTS: {
    CALENDAR: '/workouts/calendar',
  },
  METRICS: {
    GET: '/metrics',
    SET_GOAL: '/metrics/goal',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Pages
export const PAGES = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  ERROR: 'error',
};

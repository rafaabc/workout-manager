import Calendar from '../../../src/components/calendar.js';
import apiService from '../../../src/services/apiService.js';

// Mock apiService
jest.mock('../../../src/services/apiService.js', () => ({
  __esModule: true,
  default: {
    getWorkoutsByMonth: jest.fn(),
    markWorkout: jest.fn(),
    unmarkWorkout: jest.fn(),
  },
}));

describe('Calendar', () => {
  let calendar;
  let onWorkoutChange;

  beforeEach(() => {
    // Set up DOM container
    document.body.innerHTML = '<div id="calendar-container"></div>';
    onWorkoutChange = jest.fn();
    calendar = new Calendar('calendar-container', onWorkoutChange);
    jest.restoreAllMocks();
    // Reset apiService mocks
    apiService.getWorkoutsByMonth.mockReset();
    apiService.markWorkout.mockReset();
    apiService.unmarkWorkout.mockReset();
  });

  // ====== Constructor ======
  describe('constructor', () => {
    test('should initialize with correct default values', () => {
      // Assert
      expect(calendar.container).toBe('calendar-container');
      expect(calendar.workouts).toEqual([]);
      expect(calendar.isLoading).toBe(false);
      expect(calendar.currentDate).toBeInstanceOf(Date);
    });
  });

  // ====== hasWorkout ======
  describe('hasWorkout', () => {
    test('should return true when day has a workout', () => {
      // Arrange
      calendar.workouts = [{ day: 5, month: 3, year: 2026 }];

      // Act
      const result = calendar.hasWorkout(5);

      // Assert
      expect(result).toBe(true);
    });

    test('should return false when day has no workout', () => {
      // Arrange
      calendar.workouts = [{ day: 5, month: 3, year: 2026 }];

      // Act
      const result = calendar.hasWorkout(10);

      // Assert
      expect(result).toBe(false);
    });

    test('should return false when workouts list is empty', () => {
      // Arrange
      calendar.workouts = [];

      // Act
      const result = calendar.hasWorkout(1);

      // Assert
      expect(result).toBe(false);
    });

    test('should handle numeric string comparison', () => {
      // Arrange
      calendar.workouts = [{ day: 15, month: 3, year: 2026 }];

      // Act
      const result = calendar.hasWorkout('15');

      // Assert
      expect(result).toBe(true);
    });
  });

  // ====== getFirstDayOfMonth ======
  describe('getFirstDayOfMonth', () => {
    test('should return correct first day for a known month', () => {
      // Arrange — March 2026 starts on Sunday (0)
      calendar.currentDate = new Date(2026, 2, 1); // March 2026

      // Act
      const firstDay = calendar.getFirstDayOfMonth();

      // Assert
      expect(firstDay).toBe(new Date(2026, 2, 1).getDay());
    });

    test('should return a value between 0 and 6', () => {
      // Act
      const firstDay = calendar.getFirstDayOfMonth();

      // Assert
      expect(firstDay).toBeGreaterThanOrEqual(0);
      expect(firstDay).toBeLessThanOrEqual(6);
    });
  });

  // ====== getDaysInMonth ======
  describe('getDaysInMonth', () => {
    test('should return 31 for January', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 0, 1); // January

      // Act
      const days = calendar.getDaysInMonth();

      // Assert
      expect(days).toBe(31);
    });

    test('should return 28 for February in a non-leap year', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 1, 1); // February 2026 (non-leap)

      // Act
      const days = calendar.getDaysInMonth();

      // Assert
      expect(days).toBe(28);
    });

    test('should return 29 for February in a leap year', () => {
      // Arrange
      calendar.currentDate = new Date(2028, 1, 1); // February 2028 (leap year)

      // Act
      const days = calendar.getDaysInMonth();

      // Assert
      expect(days).toBe(29);
    });

    test('should return 30 for April', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 3, 1); // April

      // Act
      const days = calendar.getDaysInMonth();

      // Assert
      expect(days).toBe(30);
    });
  });

  // ====== Month Navigation ======
  describe('previousMonth', () => {
    test('should navigate to the previous month', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 5, 15); // June 2026
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.previousMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(4); // May
      expect(calendar.currentDate.getFullYear()).toBe(2026);
    });

    test('should navigate from January to December of previous year', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 0, 15); // January 2026
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.previousMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(11); // December
      expect(calendar.currentDate.getFullYear()).toBe(2025);
    });
  });

  describe('nextMonth', () => {
    test('should navigate to the next month', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 5, 15); // June 2026
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.nextMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(6); // July
      expect(calendar.currentDate.getFullYear()).toBe(2026);
    });

    test('should navigate from December to January of next year', () => {
      // Arrange
      calendar.currentDate = new Date(2025, 11, 15); // December 2025
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.nextMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(0); // January
      expect(calendar.currentDate.getFullYear()).toBe(2026);
    });
  });

  describe('goToCurrentMonth', () => {
    test('should reset to current date', () => {
      // Arrange
      calendar.currentDate = new Date(2020, 0, 1); // Far in the past
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });
      const now = new Date();

      // Act
      calendar.goToCurrentMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(now.getMonth());
      expect(calendar.currentDate.getFullYear()).toBe(now.getFullYear());
    });
  });

  // ====== loadWorkouts ======
  describe('loadWorkouts', () => {
    test('should load workouts and render calendar', async () => {
      // Arrange
      const workouts = [
        { day: 1, month: 3, year: 2026 },
        { day: 5, month: 3, year: 2026 },
      ];
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts });
      calendar.currentDate = new Date(2026, 2, 1); // March 2026

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(apiService.getWorkoutsByMonth).toHaveBeenCalledWith(3, 2026);
      expect(calendar.workouts).toHaveLength(2);
      expect(calendar.isLoading).toBe(false);
    });

    test('should handle array response format', async () => {
      // Arrange
      const workouts = [{ day: 10, month: 3, year: 2026 }];
      apiService.getWorkoutsByMonth.mockResolvedValue(workouts);
      calendar.currentDate = new Date(2026, 2, 1);

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(calendar.workouts).toHaveLength(1);
      expect(calendar.workouts[0].day).toBe(10);
    });

    test('should normalize workout data to numbers', async () => {
      // Arrange
      const workouts = [{ day: '5', month: '3', year: '2026' }];
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts });
      calendar.currentDate = new Date(2026, 2, 1);

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(calendar.workouts[0].day).toBe(5);
      expect(calendar.workouts[0].month).toBe(3);
      expect(calendar.workouts[0].year).toBe(2026);
    });

    test('should handle empty workouts response', async () => {
      // Arrange
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(calendar.workouts).toEqual([]);
      expect(calendar.isLoading).toBe(false);
    });

    test('should show error on API failure', async () => {
      // Arrange
      apiService.getWorkoutsByMonth.mockRejectedValue(new Error('Server error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(calendar.isLoading).toBe(false);
      consoleSpy.mockRestore();
    });

    test('should set isLoading to false after successful load', async () => {
      // Arrange
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(calendar.isLoading).toBe(false);
    });

    test('should set isLoading to false after failed load', async () => {
      // Arrange
      apiService.getWorkoutsByMonth.mockRejectedValue(new Error('fail'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await calendar.loadWorkouts();

      // Assert
      expect(calendar.isLoading).toBe(false);
    });
  });

  // ====== toggleWorkout ======
  describe('toggleWorkout', () => {
    test('should mark workout when day has no workout', async () => {
      // Arrange
      calendar.workouts = [];
      calendar.currentDate = new Date(2026, 2, 1); // March 2026
      apiService.markWorkout.mockResolvedValue({ message: 'marked' });
      apiService.getWorkoutsByMonth.mockResolvedValue({
        workouts: [{ day: 5, month: 3, year: 2026 }],
      });

      // Act
      await calendar.toggleWorkout(5);

      // Assert
      expect(apiService.markWorkout).toHaveBeenCalledWith(5, 3, 2026);
      expect(onWorkoutChange).toHaveBeenCalled();
    });

    test('should unmark workout when day already has a workout', async () => {
      // Arrange
      calendar.workouts = [{ day: 5, month: 3, year: 2026 }];
      calendar.currentDate = new Date(2026, 2, 1); // March 2026
      apiService.unmarkWorkout.mockResolvedValue({ message: 'unmarked' });
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      await calendar.toggleWorkout(5);

      // Assert
      expect(apiService.unmarkWorkout).toHaveBeenCalledWith(5, 3, 2026);
      expect(onWorkoutChange).toHaveBeenCalled();
    });

    test('should show error when toggle fails', async () => {
      // Arrange
      calendar.workouts = [];
      calendar.currentDate = new Date(2026, 2, 1);
      apiService.markWorkout.mockRejectedValue(new Error('Conflict: only one workout per day'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await calendar.toggleWorkout(5);

      // Assert
      expect(onWorkoutChange).not.toHaveBeenCalled();
    });

    test('should not show error popup on network error (handled globally)', async () => {
      // Arrange
      calendar.workouts = [];
      calendar.currentDate = new Date(2026, 2, 1);
      apiService.markWorkout.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await calendar.toggleWorkout(5);

      // Assert
      expect(onWorkoutChange).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ====== render ======
  describe('render', () => {
    test('should render calendar with month title and navigation buttons', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 2, 1); // March 2026
      calendar.workouts = [];

      // Act
      calendar.render();

      // Assert
      const container = document.getElementById('calendar-container');
      expect(container.innerHTML).toContain('March');
      expect(container.innerHTML).toContain('2026');
      expect(document.getElementById('prevBtn')).not.toBeNull();
      expect(document.getElementById('nextBtn')).not.toBeNull();
      expect(document.getElementById('todayBtn')).not.toBeNull();
    });

    test('should render day headers (Sun-Sat)', () => {
      // Arrange
      calendar.workouts = [];

      // Act
      calendar.render();

      // Assert
      const container = document.getElementById('calendar-container');
      expect(container.innerHTML).toContain('Sun');
      expect(container.innerHTML).toContain('Mon');
      expect(container.innerHTML).toContain('Sat');
    });

    test('should render correct number of day cells', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 2, 1); // March 2026 (31 days)
      calendar.workouts = [];

      // Act
      calendar.render();

      // Assert
      const grid = document.getElementById('calendarGrid');
      const dayCells = grid.querySelectorAll('.calendar-day:not(.empty)');
      expect(dayCells.length).toBe(31);
    });

    test('should mark days with workouts', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 2, 1); // March 2026
      calendar.workouts = [
        { day: 1, month: 3, year: 2026 },
        { day: 15, month: 3, year: 2026 },
      ];

      // Act
      calendar.render();

      // Assert
      const grid = document.getElementById('calendarGrid');
      const workoutDays = grid.querySelectorAll('.calendar-day.workout');
      expect(workoutDays.length).toBe(2);
    });

    test('should not crash when container does not exist', () => {
      // Arrange
      document.body.innerHTML = ''; // Remove container
      calendar.workouts = [];
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert (should not throw)
      expect(() => calendar.render()).not.toThrow();
      consoleSpy.mockRestore();
    });

    test('should render empty cells before first day of month', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 2, 1); // March 2026
      calendar.workouts = [];

      // Act
      calendar.render();

      // Assert
      const grid = document.getElementById('calendarGrid');
      const emptyCells = grid.querySelectorAll('.calendar-day.empty');
      const firstDay = new Date(2026, 2, 1).getDay();
      expect(emptyCells.length).toBe(firstDay);
    });
  });

  // ====== showError ======
  describe('showError', () => {
    test('should append error message to container', () => {
      // Arrange
      calendar.render();
      calendar.workouts = [];

      // Act
      calendar.showError('Something went wrong');

      // Assert
      const errorDiv = document.querySelector('.error-message');
      expect(errorDiv).not.toBeNull();
      expect(errorDiv.textContent).toBe('Something went wrong');
    });

    test('should not crash when container does not exist', () => {
      // Arrange
      document.body.innerHTML = '';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert
      expect(() => calendar.showError('error')).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  // ====== Navigation integration (year boundary) ======
  describe('year boundary navigation', () => {
    test('should correctly navigate from December 2025 to January 2026', () => {
      // Arrange
      calendar.currentDate = new Date(2025, 11, 15); // December 2025
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.nextMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(0);
      expect(calendar.currentDate.getFullYear()).toBe(2026);
    });

    test('should correctly navigate from January 2026 to December 2025', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 0, 15); // January 2026
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.previousMonth();

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(11);
      expect(calendar.currentDate.getFullYear()).toBe(2025);
    });

    test('should navigate multiple months forward across year boundary', () => {
      // Arrange
      calendar.currentDate = new Date(2025, 10, 15); // November 2025
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.nextMonth(); // December 2025
      calendar.nextMonth(); // January 2026

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(0);
      expect(calendar.currentDate.getFullYear()).toBe(2026);
    });

    test('should navigate multiple months backward across year boundary', () => {
      // Arrange
      calendar.currentDate = new Date(2026, 1, 15); // February 2026
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      calendar.previousMonth(); // January 2026
      calendar.previousMonth(); // December 2025

      // Assert
      expect(calendar.currentDate.getMonth()).toBe(11);
      expect(calendar.currentDate.getFullYear()).toBe(2025);
    });
  });

  // ====== One workout per day rule ======
  describe('one workout per day rule', () => {
    test('should call markWorkout for a day without workout', async () => {
      // Arrange
      calendar.workouts = [];
      calendar.currentDate = new Date(2026, 2, 1);
      apiService.markWorkout.mockResolvedValue({ message: 'marked' });
      apiService.getWorkoutsByMonth.mockResolvedValue({
        workouts: [{ day: 10, month: 3, year: 2026 }],
      });

      // Act
      await calendar.toggleWorkout(10);

      // Assert
      expect(apiService.markWorkout).toHaveBeenCalledTimes(1);
      expect(apiService.unmarkWorkout).not.toHaveBeenCalled();
    });

    test('should call unmarkWorkout for a day that already has a workout', async () => {
      // Arrange
      calendar.workouts = [{ day: 10, month: 3, year: 2026 }];
      calendar.currentDate = new Date(2026, 2, 1);
      apiService.unmarkWorkout.mockResolvedValue({ message: 'unmarked' });
      apiService.getWorkoutsByMonth.mockResolvedValue({ workouts: [] });

      // Act
      await calendar.toggleWorkout(10);

      // Assert
      expect(apiService.unmarkWorkout).toHaveBeenCalledTimes(1);
      expect(apiService.markWorkout).not.toHaveBeenCalled();
    });
  });
});

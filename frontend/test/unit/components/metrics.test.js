import Metrics from '../../../src/components/metrics.js';
import apiService from '../../../src/services/apiService.js';

// Mock apiService
jest.mock('../../../src/services/apiService.js', () => ({
  __esModule: true,
  default: {
    getMetrics: jest.fn(),
    setGoal: jest.fn(),
  },
}));

describe('Metrics', () => {
  let metrics;

  beforeEach(() => {
    document.body.innerHTML = '<div id="metrics-container"></div>';
    metrics = new Metrics('metrics-container');
    jest.restoreAllMocks();
    apiService.getMetrics.mockReset();
    apiService.setGoal.mockReset();
  });

  // ====== Constructor ======
  describe('constructor', () => {
    test('should initialize with correct default values', () => {
      // Assert
      expect(metrics.container).toBe('metrics-container');
      expect(metrics.metrics).toBeNull();
      expect(metrics.isLoading).toBe(false);
    });
  });

  // ====== calculateTotalWorkouts ======
  describe('calculateTotalWorkouts', () => {
    test('should return 0 when metrics is null', () => {
      // Arrange
      metrics.metrics = null;

      // Act
      const total = metrics.calculateTotalWorkouts();

      // Assert
      expect(total).toBe(0);
    });

    test('should return 0 when monthlyData is missing', () => {
      // Arrange
      metrics.metrics = {};

      // Act
      const total = metrics.calculateTotalWorkouts();

      // Assert
      expect(total).toBe(0);
    });

    test('should return 0 when all months have zero workouts', () => {
      // Arrange
      metrics.metrics = {
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      const total = metrics.calculateTotalWorkouts();

      // Assert
      expect(total).toBe(0);
    });

    test('should sum workouts across all months', () => {
      // Arrange
      metrics.metrics = {
        monthlyData: [
          { totalWorkouts: 10 },
          { totalWorkouts: 15 },
          { totalWorkouts: 20 },
          { totalWorkouts: 0 },
          { totalWorkouts: 5 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
        ],
      };

      // Act
      const total = metrics.calculateTotalWorkouts();

      // Assert
      expect(total).toBe(50);
    });

    test('should handle months with missing totalWorkouts field', () => {
      // Arrange
      metrics.metrics = {
        monthlyData: [{ totalWorkouts: 10 }, {}, { totalWorkouts: 5 }],
      };

      // Act
      const total = metrics.calculateTotalWorkouts();

      // Assert
      expect(total).toBe(15);
    });
  });

  // ====== calculateAnnualProgress ======
  describe('calculateAnnualProgress', () => {
    test('should return 0 when metrics is null', () => {
      // Arrange
      metrics.metrics = null;

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(0);
    });

    test('should return 0 when goal is 0', () => {
      // Arrange
      metrics.metrics = {
        goal: 0,
        monthlyData: [{ totalWorkouts: 10 }],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(0);
    });

    test('should return 0 when goal is not set', () => {
      // Arrange
      metrics.metrics = {
        monthlyData: [{ totalWorkouts: 10 }],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(0);
    });

    test('should calculate correct progress percentage', () => {
      // Arrange — 100 workouts out of 200 goal = 50%
      metrics.metrics = {
        goal: 200,
        monthlyData: [
          { totalWorkouts: 20 },
          { totalWorkouts: 20 },
          { totalWorkouts: 20 },
          { totalWorkouts: 20 },
          { totalWorkouts: 20 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
        ],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(50);
    });

    test('should calculate 100% when goal is fully met', () => {
      // Arrange — 200 workouts out of 200 goal
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      // Override to make total = 200
      metrics.metrics.monthlyData = [
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 20 },
        { totalWorkouts: 10 },
        { totalWorkouts: 10 },
        { totalWorkouts: 10 },
        { totalWorkouts: 10 },
      ];

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(100);
    });

    test('should handle progress exceeding 100%', () => {
      // Arrange — 300 workouts out of 200 goal = 150%
      metrics.metrics = {
        goal: 200,
        monthlyData: [
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
        ],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(150);
    });

    test('should round progress to nearest integer', () => {
      // Arrange — 1 workout out of 3 goal = 33.33...%
      metrics.metrics = {
        goal: 3,
        monthlyData: [{ totalWorkouts: 1 }],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(33);
    });

    test('should calculate progress with default goal of 200', () => {
      // Arrange — simulating default goal scenario: 50/200 = 25%
      metrics.metrics = {
        goal: 200,
        monthlyData: [
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
          { totalWorkouts: 0 },
        ],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(25);
    });
  });

  // ====== calculateMonthlyProgress ======
  describe('calculateMonthlyProgress', () => {
    test('should return 0 when metrics is null', () => {
      // Arrange
      metrics.metrics = null;

      // Act
      const progress = metrics.calculateMonthlyProgress(0);

      // Assert
      expect(progress).toBe(0);
    });

    test('should return 0 when monthlyData is missing', () => {
      // Arrange
      metrics.metrics = {};

      // Act
      const progress = metrics.calculateMonthlyProgress(0);

      // Assert
      expect(progress).toBe(0);
    });

    test('should return 0 when month index is out of range', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: [{ totalWorkouts: 10 }],
      };

      // Act
      const progress = metrics.calculateMonthlyProgress(5);

      // Assert
      expect(progress).toBe(0);
    });

    test('should return 0 when goal is 0', () => {
      // Arrange
      metrics.metrics = {
        goal: 0,
        monthlyData: [{ totalWorkouts: 10 }],
      };

      // Act
      const progress = metrics.calculateMonthlyProgress(0);

      // Assert
      expect(progress).toBe(0);
    });

    test('should calculate correct monthly progress', () => {
      // Arrange — goal 240 => monthly goal = 20; 15 workouts => 75%
      metrics.metrics = {
        goal: 240,
        monthlyData: [{ totalWorkouts: 15 }],
      };

      // Act
      const progress = metrics.calculateMonthlyProgress(0);

      // Assert
      expect(progress).toBe(75);
    });

    test('should handle monthly progress exceeding 100%', () => {
      // Arrange — goal 120 => monthly goal = 10; 15 workouts => 150%
      metrics.metrics = {
        goal: 120,
        monthlyData: [{ totalWorkouts: 15 }],
      };

      // Act
      const progress = metrics.calculateMonthlyProgress(0);

      // Assert
      expect(progress).toBe(150);
    });
  });

  // ====== loadMetrics ======
  describe('loadMetrics', () => {
    test('should load metrics and render', async () => {
      // Arrange
      const metricsData = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      apiService.getMetrics.mockResolvedValue(metricsData);

      // Act
      await metrics.loadMetrics();

      // Assert
      expect(apiService.getMetrics).toHaveBeenCalled();
      expect(metrics.metrics).toEqual(metricsData);
      expect(metrics.isLoading).toBe(false);
    });

    test('should show error on API failure', async () => {
      // Arrange
      apiService.getMetrics.mockRejectedValue(new Error('Server error'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await metrics.loadMetrics();

      // Assert
      expect(metrics.isLoading).toBe(false);
    });

    test('should set isLoading to false after failure', async () => {
      // Arrange
      apiService.getMetrics.mockRejectedValue(new Error('fail'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await metrics.loadMetrics();

      // Assert
      expect(metrics.isLoading).toBe(false);
    });
  });

  // ====== render ======
  describe('render', () => {
    test('should render metrics panel with goal and progress', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      metrics.render();

      // Assert
      const container = document.getElementById('metrics-container');
      expect(container.innerHTML).toContain('Annual Metrics');
      expect(container.innerHTML).toContain('200');
      expect(container.innerHTML).toContain('0%');
    });

    test('should render "Unable to load metrics" when metrics is null', () => {
      // Arrange
      metrics.metrics = null;

      // Act
      metrics.render();

      // Assert
      const container = document.getElementById('metrics-container');
      expect(container.innerHTML).toContain('Unable to load metrics');
    });

    test('should render all 12 months in the table', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      metrics.render();

      // Assert
      const rows = document.querySelectorAll('#metricsTableBody tr');
      expect(rows.length).toBe(12);
    });

    test('should display month names in the table', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      metrics.render();

      // Assert
      const container = document.getElementById('metrics-container');
      expect(container.innerHTML).toContain('January');
      expect(container.innerHTML).toContain('December');
    });

    test('should render goal input with current goal value', () => {
      // Arrange
      metrics.metrics = {
        goal: 150,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      metrics.render();

      // Assert
      const goalInput = document.getElementById('goalInput');
      expect(goalInput).not.toBeNull();
      expect(goalInput.value).toBe('150');
    });

    test('should render total workouts correctly', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: [
          { totalWorkouts: 10 },
          { totalWorkouts: 20 },
          ...new Array(10).fill({ totalWorkouts: 0 }),
        ],
      };

      // Act
      metrics.render();

      // Assert
      const container = document.getElementById('metrics-container');
      expect(container.innerHTML).toContain('30'); // total workouts
    });

    test('should render Save Goal button', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      metrics.render();

      // Assert
      const saveBtn = document.getElementById('saveGoalBtn');
      expect(saveBtn).not.toBeNull();
      expect(saveBtn.textContent).toBe('Save Goal');
    });

    test('should not crash when container does not exist', () => {
      // Arrange
      document.body.innerHTML = '';
      metrics.metrics = { goal: 200, monthlyData: new Array(12).fill({ totalWorkouts: 0 }) };
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert
      expect(() => metrics.render()).not.toThrow();
    });
  });

  // ====== handleSaveGoal ======
  describe('handleSaveGoal', () => {
    test('should save valid goal and reload metrics', async () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      metrics.render();
      document.getElementById('goalInput').value = '250';
      apiService.setGoal.mockResolvedValue({ goal: 250 });
      apiService.getMetrics.mockResolvedValue({
        goal: 250,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      });
      const dispatchSpy = jest.spyOn(globalThis, 'dispatchEvent');

      // Act
      await metrics.handleSaveGoal();

      // Assert
      expect(apiService.setGoal).toHaveBeenCalledWith(250);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    });

    test('should show error for invalid goal', async () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      metrics.render();
      document.getElementById('goalInput').value = '-5';

      // Act
      await metrics.handleSaveGoal();

      // Assert
      const errorDiv = document.getElementById('goalError');
      expect(errorDiv.style.display).toBe('block');
      expect(errorDiv.textContent).toBe('Goal must be a positive number');
      expect(apiService.setGoal).not.toHaveBeenCalled();
    });

    test('should show error for non-numeric goal', async () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      metrics.render();
      document.getElementById('goalInput').value = 'abc';

      // Act
      await metrics.handleSaveGoal();

      // Assert
      const errorDiv = document.getElementById('goalError');
      expect(errorDiv.style.display).toBe('block');
      expect(apiService.setGoal).not.toHaveBeenCalled();
    });

    test('should show error when API call fails', async () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      metrics.render();
      document.getElementById('goalInput').value = '300';
      apiService.setGoal.mockRejectedValue(new Error('Failed to save goal'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await metrics.handleSaveGoal();

      // Assert
      const errorDiv = document.getElementById('goalError');
      expect(errorDiv.style.display).toBe('block');
      expect(errorDiv.textContent).toBe('Failed to save goal');
    });

    test('should show error for zero goal', async () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      metrics.render();
      document.getElementById('goalInput').value = '0';

      // Act
      await metrics.handleSaveGoal();

      // Assert
      const errorDiv = document.getElementById('goalError');
      expect(errorDiv.style.display).toBe('block');
      expect(apiService.setGoal).not.toHaveBeenCalled();
    });
  });

  // ====== showError ======
  describe('showError', () => {
    test('should append error message to container', () => {
      // Act
      metrics.showError('Something went wrong');

      // Assert
      const errorDiv = document.querySelector('.error-message');
      expect(errorDiv).not.toBeNull();
      expect(errorDiv.textContent).toBe('Something went wrong');
    });

    test('should not crash when container does not exist', () => {
      // Arrange
      document.body.innerHTML = '';
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert
      expect(() => metrics.showError('error')).not.toThrow();
    });
  });

  // ====== refresh ======
  describe('refresh', () => {
    test('should reload metrics', async () => {
      // Arrange
      const metricsData = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };
      apiService.getMetrics.mockResolvedValue(metricsData);

      // Act
      await metrics.refresh();

      // Assert
      expect(apiService.getMetrics).toHaveBeenCalled();
      expect(metrics.metrics).toEqual(metricsData);
    });
  });

  // ====== Annual progress formula ======
  describe('annual progress formula: (workouts / goal) * 100', () => {
    test('should calculate 25% for 50 workouts with goal of 200', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: [
          { totalWorkouts: 25 },
          { totalWorkouts: 25 },
          ...new Array(10).fill({ totalWorkouts: 0 }),
        ],
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(25);
    });

    test('should calculate 0% with empty workout list', () => {
      // Arrange
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 0 }),
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(0);
    });

    test('should calculate 150% when exceeding goal', () => {
      // Arrange — 300 workouts / 200 goal
      metrics.metrics = {
        goal: 200,
        monthlyData: new Array(12).fill({ totalWorkouts: 25 }),
      };

      // Act
      const progress = metrics.calculateAnnualProgress();

      // Assert
      expect(progress).toBe(150);
    });
  });
});

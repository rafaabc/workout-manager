import * as metricsService from '../services/metricsService.js';

export function getMetrics(req, res) {
  try {
    const metrics = metricsService.getMetrics(req.user.username);
    res.json(metrics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function setGoal(req, res) {
  try {
    const { goal } = req.body;
    const updated = metricsService.setGoal(req.user.username, goal);
    res.status(200).json({ message: 'Annual goal set', goal: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

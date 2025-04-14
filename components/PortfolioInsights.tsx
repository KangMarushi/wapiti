import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Balance,
  Timeline,
} from '@mui/icons-material';
import { PortfolioAnalysis } from '../types/types';

interface SimulationResult {
  futureValue: number;
  totalInvestment: number;
  expectedReturn: number;
  monthlyBreakdown: {
    month: number;
    value: number;
  }[];
}

const PortfolioInsights: React.FC = () => {
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // What-if simulator state
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [duration, setDuration] = useState<number>(12);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch('/api/portfolio/analysis');
      if (!response.ok) throw new Error('Failed to fetch portfolio analysis');
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = () => {
    // Assuming 12% annual return for simulation
    const annualReturn = 0.12;
    const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;

    let totalValue = analysis?.totalValue || 0;
    const monthlyBreakdown = [];

    for (let month = 1; month <= duration; month++) {
      totalValue = totalValue * (1 + monthlyReturn) + monthlyInvestment;
      monthlyBreakdown.push({
        month,
        value: totalValue,
      });
    }

    const totalInvestment = (analysis?.totalValue || 0) + monthlyInvestment * duration;
    const expectedReturn = totalValue - totalInvestment;

    setSimulationResult({
      futureValue: totalValue,
      totalInvestment,
      expectedReturn,
      monthlyBreakdown,
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!analysis) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      {/* Portfolio Overview */}
      <Box>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Portfolio Overview
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 50%', maxWidth: { md: '25%' } }}>
                <Typography variant="subtitle2">Total Value</Typography>
                <Typography variant="h6">₹{analysis.totalValue.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 50%', maxWidth: { md: '25%' } }}>
                <Typography variant="subtitle2">Total Cost</Typography>
                <Typography variant="h6">₹{analysis.totalCost.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 50%', maxWidth: { md: '25%' } }}>
                <Typography variant="subtitle2">Overall Return</Typography>
                <Typography
                  variant="h6"
                  color={analysis.overallReturn >= 0 ? 'success.main' : 'error.main'}
                >
                  ₹{analysis.overallReturn.toLocaleString()} ({analysis.overallReturnPercentage.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* Insights and What-if Simulator */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Insights */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Portfolio Insights
              </Typography>

              {analysis.insights.overexposure.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle1" color="warning.main">
                    <Warning /> Concentration Risks
                  </Typography>
                  <List>
                    {analysis.insights.overexposure.map((insight, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={insight} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {analysis.insights.rebalancingSuggestions.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle1" color="info.main">
                    <Balance /> Rebalancing Suggestions
                  </Typography>
                  <List>
                    {analysis.insights.rebalancingSuggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle1" color="success.main">
                  <TrendingUp /> Top Performers
                </Typography>
                <List>
                  {analysis.insights.topPerformers.map((performer, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={performer} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography variant="subtitle1" color="error.main">
                  <TrendingDown /> Underperformers
                </Typography>
                <List>
                  {analysis.insights.underperformers.map((performer, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={performer} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Box>
        {/* What-if Simulator */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <Timeline /> What-if Simulator
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ width: '100%', flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                  <TextField
                    fullWidth
                    label="Monthly Investment (₹)"
                    type="number"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Box>
                <Box sx={{ width: '100%', flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                  <TextField
                    fullWidth
                    label="Duration (months)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 1, max: 120 } }}
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={runSimulation}
                    fullWidth
                  >
                    Calculate Future Value
                  </Button>
                </Box>
              </Box>

              {simulationResult && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Simulation Results
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ width: '100%', flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
                      <Typography variant="subtitle2">Future Value</Typography>
                      <Typography variant="body1">
                        ₹{simulationResult.futureValue.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
                      <Typography variant="subtitle2">Total Investment</Typography>
                      <Typography variant="body1">
                        ₹{simulationResult.totalInvestment.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
                      <Typography variant="subtitle2">Expected Return</Typography>
                      <Typography variant="body1" color="success.main">
                        ₹{simulationResult.expectedReturn.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioInsights;
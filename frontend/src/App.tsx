import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { Brightness4, Brightness7, SwapHoriz } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

interface Currency {
  code: string;
  name: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [historicalRates, setHistoricalRates] = useState<number[]>([]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    direction: 'rtl',
  });

  useEffect(() => {
    fetchSupportedCurrencies();
  }, []);

  const fetchSupportedCurrencies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/supported-currencies');
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post('http://localhost:8000/convert', {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: parseFloat(amount),
      });
      setConvertedAmount(response.data.converted_amount);
      setRate(response.data.rate);
    } catch (error) {
      console.error('Error converting currency:', error);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <Typography variant="h4" align="center" gutterBottom>
            محول العملات
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="المبلغ"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>من</InputLabel>
                <Select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  label="من"
                >
                  {Object.entries(currencies).map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {code} - {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconButton onClick={swapCurrencies} color="primary">
                <SwapHoriz />
              </IconButton>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>إلى</InputLabel>
                <Select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  label="إلى"
                >
                  {Object.entries(currencies).map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {code} - {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConvert}
              size="large"
            >
              تحويل
            </Button>
          </Box>

          {convertedAmount !== null && rate !== null && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {amount} {fromCurrency} = {convertedAmount} {toCurrency}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                1 {fromCurrency} = {rate} {toCurrency}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;

import {
    Box, Container, Typography, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, ThemeProvider, createTheme
} from '@mui/material';
import {useState, useEffect} from 'react';
import {Delete, Done} from '@mui/icons-material';
import ExpenseTable from "../components/ExpenseTable.jsx";
import {v4} from 'uuid';


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontSize: 16,
    }
});

const LOCAL_STORAGE_KEY = 'money-mike-state';

const loadState = () => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Failed to load from localStorage", e);
        return null;
    }
};

const saveState = (state) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }
};

function calculateActualBalance(available, future, budgeted) {
    const unpaidFuture = future.filter(e => !e.paid).reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = budgeted.filter(e => !e.paid).reduce((sum, e) => sum + (e.amount - e.used), 0);
    return available - unpaidFuture - remainingBudget;
}

export default function LandingPage() {
    const initialState = loadState();

    const [availableBalance, setAvailableBalance] = useState(initialState?.availableBalance ?? 2000);
    const [futureExpenses, setFutureExpenses] = useState(
        initialState?.futureExpenses ?? [
            {id: v4(), name: 'Dog Walker', amount: 500, date: 3, paid: false},
            {id: v4(), name: 'Insurance', amount: 500, date: 15, paid: false}
        ]
    );
    const [budgetedExpenses, setBudgetedExpenses] = useState(
        initialState?.budgetedExpenses ?? [
            {id: v4(), name: 'New Shoes', amount: 500, used: 0, paid: false}
        ]
    );
    const [pastExpenses, setPastExpenses] = useState(
        initialState?.pastExpenses ?? [
            {id: v4(), name: 'Groceries', amount: 1000, date: 10}
        ]
    );

    useEffect(() => {
        saveState({availableBalance, futureExpenses, budgetedExpenses, pastExpenses});
    }, [availableBalance, futureExpenses, budgetedExpenses, pastExpenses]);

    const actualBalance = calculateActualBalance(availableBalance, futureExpenses, budgetedExpenses);

    const markAsPaid = (id, type) => {
        if (type === 'future') {
            setFutureExpenses(prev => {
                const paidItem = prev.find(e => e.id === id);
                if (!paidItem) return prev;
                setPastExpenses(past => {
                    const exists = past.find(e => e.id === id);
                    if (exists) return past;
                    return [...past, {...paidItem, paid: true}];
                });
                return prev.filter(e => e.id !== id);
            });
        } else {
            setBudgetedExpenses(prev => prev.map(e => e.id === id ? {...e, paid: true} : e));
        }
    };

    const onRemove = (id, type) => {
        if (type === 'future') {
            setFutureExpenses(prev => prev.filter(e => e.id !== id))
        } else if (type === 'budget') {
            setBudgetedExpenses(prev => prev.filter(e => e.id !== id));
        } else {
            setPastExpenses(prev => prev.filter(e => e.id !== id));
        }
    }

    const updateBudgetUsed = (id, used) => {
        setBudgetedExpenses(prev => prev.map(e => e.id === id ? {...e, used: Number(used)} : e));
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Container maxWidth="md" sx={{py: 6}}>
                {
                    actualBalance > 0 ? (
                        <Typography variant="h2" align="center" gutterBottom>
                            You're doing a great job!
                        </Typography>
                    ) : (
                        <Typography variant="h4" align="center" gutterBottom>
                            You fucking donkey. Don't spend money.
                        </Typography>
                    )
                }

                {/* Actual Balance */}
                <Paper elevation={3} sx={{p: 4, my: 4, textAlign: 'center'}}>
                    <Typography variant="h5">Actual Balance</Typography>
                    <Typography variant="h3" color="primary">R{actualBalance}</Typography>
                </Paper>

                {/* Editable Available Balance */}
                <Box sx={{my: 4, backgroundColor: 'background.paper', p: 2, borderRadius: 2}}>
                    <TextField
                        fullWidth
                        label="Available Balance on Banking App"
                        type="number"
                        variant="outlined"
                        size="medium"
                        slotProps={{
                            htmlInput: {
                                type: 'number',
                                style: {fontSize: 20},
                            },
                            inputLabel: {
                                style: {color: "#666",},
                            },
                            input: {
                                sx: {
                                    color: 'text.primary',
                                    backgroundColor: 'background.default',
                                    '& fieldset': {
                                        borderColor: 'divider',
                                    },
                                },
                            },
                        }}
                        sx={{input: {color: 'text.primary'}}}
                        value={availableBalance}
                        onChange={(e) => setAvailableBalance(Number(e.target.value))}
                    />
                </Box>

                {/* Future Expenses */}
                <Typography variant="h5" sx={{mt: 6, mb: 2}}>Future Expenses</Typography>
                <ExpenseTable
                    items={futureExpenses}
                    type="future"
                    markAsPaid={markAsPaid}
                    addItem={(entry) => setFutureExpenses(prev => [...prev, entry])}
                    onRemove={onRemove}
                />

                {/* Budgeted Expenses */}
                <Typography variant="h5" sx={{mt: 6, mb: 2}}>Budgeted Expenses</Typography>
                <ExpenseTable
                    items={budgetedExpenses}
                    type="budget"
                    markAsPaid={markAsPaid}
                    updateBudgetUsed={updateBudgetUsed}
                    addItem={(entry) => setBudgetedExpenses(prev => [...prev, entry])}
                    onRemove={onRemove}
                />

                {/* Past Expenses */}
                <Typography variant="h5" sx={{mt: 6, mb: 2, color: 'gray'}}>Past Expenses</Typography>
                <ExpenseTable
                    items={pastExpenses}
                    type="past"
                    onRemove={onRemove}
                />
            </Container>
        </ThemeProvider>
    );
}

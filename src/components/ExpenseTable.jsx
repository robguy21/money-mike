// import React, {useState} from "react";
import {
    Box, Container, Typography, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, ThemeProvider, createTheme
} from '@mui/material';
import React, {useState} from 'react';
import {Add, Delete, Done, ViewColumn} from '@mui/icons-material';
import {v4} from "uuid";

export default function ExpenseTable({items, type, markAsPaid, onRemove, updateBudgetUsed, addItem}) {
    const [newEntry, setNewEntry] = useState({name: '', amount: '', date: '', used: ''});

    const handleAdd = () => {
        if (!newEntry.name || !newEntry.amount) return;
        const id = Date.now(); // simple unique ID
        const entry = {
            id: v4(),
            name: newEntry.name,
            amount: Number(newEntry.amount),
            ...(type === 'future' && {date: Number(newEntry.date || 1), paid: false}),
            ...(type === 'budget' && {used: Number(newEntry.used || 0), paid: false}),
        };
        addItem(entry);
        setNewEntry({name: '', amount: '', date: '', used: ''});
    };

    return (
        <TableContainer component={Paper}>
            <Table size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontSize: 18}} width={"70%"}>Amount</TableCell>
                        {type !== 'budget' ? (
                            <TableCell sx={{fontSize: 18}} width={"15%"}>Date</TableCell>
                        ) : (
                            <TableCell sx={{fontSize: 18}} width={"15%"}>Used</TableCell>
                        )}
                        <TableCell width={"15%"}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {/* First Row: Full-width Name */}
                            <TableRow sx={{
                                backgroundColor: index % 2 === 0 ? 'background.default' : 'grey.800',
                                ...(item.paid && {opacity: 0.4})
                            }}>
                                <TableCell colSpan={3} sx={{fontSize: 18, fontWeight: 'bold'}}>
                                    {item.name}
                                </TableCell>
                            </TableRow>

                            {/* Second Row: Amount, Date/Used, Actions */}
                            <TableRow sx={{
                                backgroundColor: index % 2 === 0 ? 'background.default' : 'grey.800',
                                ...(item.paid && {opacity: 0.4})
                            }}>
                                {/* Amount */}
                                <TableCell sx={{fontSize: 16, width: '33%'}} colSpan={1}>
                                    R{item.amount}
                                </TableCell>

                                {/* Date or Used Input */}
                                {type !== 'budget' ? (
                                    <TableCell sx={{fontSize: 16, width: '33%'}}>
                                        {item.date || '-'}
                                    </TableCell>
                                ) : (
                                    <TableCell sx={{width: '33%'}}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={item.used}
                                            onChange={(e) => updateBudgetUsed?.(item.id, e.target.value)}
                                            slotProps={{
                                                htmlInput: {
                                                    min: 0,
                                                    max: item.amount,
                                                    style: {fontSize: 16},
                                                },
                                            }}
                                            sx={{width: '100%'}}
                                        />
                                    </TableCell>
                                )}

                                {/* Actions */}
                                <TableCell sx={{width: '33%'}}>
                                    <div style={{display: "flex"}}>
                                        {!item.paid && type !== 'past' && (
                                            <IconButton onClick={() => markAsPaid(item.id, type)} size="large">
                                                <Done fontSize="medium"/>
                                            </IconButton>
                                        )}
                                        <IconButton size="large" onClick={() => onRemove(item.id, type)}>
                                            <Delete fontSize="medium"/>
                                        </IconButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}

                    {/* Add Row */}
                    {type !== 'past' && (
                        <>
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <TextField
                                        placeholder="New name"
                                        size="small"
                                        fullWidth={true}
                                        value={newEntry.name}
                                        onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        placeholder="R0"
                                        size="small"
                                        value={newEntry.amount}
                                        onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                                    />
                                </TableCell>
                                <TableCell>
                                    {type === 'future' ? (
                                        <TextField
                                            type="number"
                                            placeholder="Day"
                                            size="small"
                                            value={newEntry.date}
                                            onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                                        />
                                    ) : (
                                        <TextField
                                            type="number"
                                            placeholder="Used"
                                            size="small"
                                            value={newEntry.used}
                                            onChange={(e) => setNewEntry({...newEntry, used: e.target.value})}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={handleAdd}>
                                        <Add/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

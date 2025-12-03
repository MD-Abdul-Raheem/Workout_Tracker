import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, DumbbellIcon } from './Icon';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    completedDates: string[]; // Array of date strings "YYYY-M-D"
    onSelectDate?: (date: Date) => void;
    onOpenWorkout?: (date: Date) => void;
}

export const CalendarModal = ({ isOpen, onClose, completedDates = [], onSelectDate, onOpenWorkout }: CalendarModalProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Reset to today whenever the modal is opened
    useEffect(() => {
        if (isOpen) {
            setCurrentDate(new Date());
            setSelectedDate(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const today = new Date();

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sun

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        setSelectedDate(date);
        if (onSelectDate) {
            onSelectDate(date);
        }
    };

    const handleOpenClick = () => {
        if (selectedDate && onOpenWorkout) {
            onOpenWorkout(selectedDate);
        }
    };

    const days = [];
    
    // Fill empty slots for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Fill days of the month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isSelected = selectedDate?.toDateString() === dateObj.toDateString();
        
        // Check if this specific date is in the completed list
        // Format key to match what App.tsx produces: "YYYY-M-D"
        const dateKey = `${year}-${month}-${d}`;
        const hasWorkout = completedDates.includes(dateKey);

        days.push(
            <div 
                key={d} 
                onClick={() => handleDateClick(d)}
                className="flex flex-col items-center justify-center h-10 w-10 mx-auto cursor-pointer group relative"
            >
                <div className={`
                    w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full transition-all relative z-10
                    ${isSelected 
                        ? 'bg-white text-black scale-110 shadow-lg' 
                        : isToday 
                            ? 'bg-zinc-800 text-white border border-zinc-600' 
                            : 'text-zinc-400 group-hover:bg-zinc-900 group-hover:text-zinc-200'
                    }
                `}>
                    {d}
                </div>
                {hasWorkout && (
                    <div className={`w-1 h-1 rounded-full mt-1 z-20 ${isSelected || isToday ? 'bg-green-400' : 'bg-green-600 shadow-[0_0_4px_rgba(34,197,94,0.6)]'}`}></div>
                )}
            </div>
        );
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const selectedDateDisplay = selectedDate 
        ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : "Select a date";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
             <div className="bg-black w-full max-w-sm border border-zinc-800 p-6 shadow-[0px_10px_40px_-10px_rgba(255,255,255,0.1)] rounded-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-white">
                        <ChevronLeftIcon className="w-5 h-5 rotate-0" />
                    </button>
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">{monthNames[month]} {year}</h3>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-white">
                        <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-6">
                    {days}
                </div>

                <div className="text-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 mb-6">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">SELECTED DATE</p>
                     <p className="text-white font-bold text-sm">{selectedDateDisplay}</p>
                </div>
                
                {selectedDate && (
                    <button 
                        onClick={handleOpenClick}
                        className="w-full mb-3 bg-white text-black font-black text-xs uppercase tracking-widest py-4 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 btn-shine"
                    >
                        <DumbbellIcon className="w-4 h-4" />
                        Open Workout
                    </button>
                )}
                
                <button 
                    onClick={onClose} 
                    className="w-full bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800"
                >
                    Close Calendar
                </button>
             </div>
        </div>
    );
}
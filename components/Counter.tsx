import React from 'react';

interface CounterProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  unit?: string;
}

export const Counter: React.FC<CounterProps> = ({ 
  label, 
  value, 
  onChange, 
  step = 1, 
  min = 0,
  unit = '' 
}) => {
  
  const decrease = () => {
    const newValue = value - step;
    if (newValue >= min) {
      // Fix float precision issues
      onChange(parseFloat(newValue.toFixed(2)));
    }
  };

  const increase = () => {
    const newValue = value + step;
    // Fix float precision issues
    onChange(parseFloat(newValue.toFixed(2)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(0); // or handle empty state if parent allows
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= min) {
      onChange(num);
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">{label}</span>
      <div className="flex items-center h-11 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
        <button 
          onClick={decrease}
          className="w-10 h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-zinc-300 text-zinc-900 dark:text-zinc-100 transition-colors text-lg font-medium border-r border-zinc-200 dark:border-zinc-800"
          type="button"
          tabIndex={-1}
        >
          −
        </button>
        <div className="flex-1 flex items-center justify-center relative bg-transparent h-full">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            className="w-full h-full text-center font-bold text-zinc-900 dark:text-white bg-transparent outline-none appearance-none m-0 p-0 text-base"
          />
          {unit && <span className="absolute right-2 text-xs text-zinc-400 pointer-events-none">{unit}</span>}
        </div>
        <button 
          onClick={increase}
          className="w-10 h-full flex items-center justify-center bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 active:bg-zinc-700 text-white dark:text-black transition-colors text-lg font-medium"
          type="button"
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  );
};
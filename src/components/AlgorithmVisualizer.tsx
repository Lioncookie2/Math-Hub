import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Code2 } from 'lucide-react';

export const AlgorithmVisualizer = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bubble' | 'selection' | 'linear'>('bubble');
  const [isRunning, setIsRunning] = useState(false);
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);

  const resetArray = () => {
    setArray([64, 34, 25, 12, 22, 11, 90]);
    setIsRunning(false);
  };

  const runAlgorithm = async () => {
    setIsRunning(true);
    const newArray = [...array];
    
    if (selectedAlgorithm === 'bubble') {
      // Bubble sort visualization
      for (let i = 0; i < newArray.length - 1; i++) {
        for (let j = 0; j < newArray.length - i - 1; j++) {
          if (newArray[j] > newArray[j + 1]) {
            [newArray[j], newArray[j + 1]] = [newArray[j + 1], newArray[j]];
            setArray([...newArray]);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    } else if (selectedAlgorithm === 'selection') {
      // Selection sort visualization
      for (let i = 0; i < newArray.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < newArray.length; j++) {
          if (newArray[j] < newArray[minIdx]) {
            minIdx = j;
          }
        }
        [newArray[i], newArray[minIdx]] = [newArray[minIdx], newArray[i]];
        setArray([...newArray]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else if (selectedAlgorithm === 'linear') {
      // Linear search visualization
      const target = 25;
      for (let i = 0; i < newArray.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (newArray[i] === target) {
          break;
        }
      }
    }
    
    setIsRunning(false);
  };

  const getCodeExample = () => {
    if (selectedAlgorithm === 'bubble') {
      return `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`;
    } else if (selectedAlgorithm === 'selection') {
      return `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`;
    } else {
      return `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`;
    }
  };

  const maxValue = Math.max(...array);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Algoritme Visualiserer</h1>
        <p className="text-gray-400">Visualiser hvordan sorterings- og søkealgoritmer fungerer</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Algorithm Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Velg Algoritme</h2>
          <div className="space-y-2">
            {(['bubble', 'selection', 'linear'] as const).map((algo) => (
              <button
                key={algo}
                onClick={() => {
                  setSelectedAlgorithm(algo);
                  resetArray();
                }}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedAlgorithm === algo
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 bg-surface/30 text-gray-400 hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">
                  {algo === 'bubble' && 'Bubble Sort'}
                  {algo === 'selection' && 'Selection Sort'}
                  {algo === 'linear' && 'Linear Search'}
                </div>
                <div className="text-sm mt-1">
                  {algo === 'bubble' && 'Sammenligner og bytter naboelementer'}
                  {algo === 'selection' && 'Finner minimum og plasserer det riktig'}
                  {algo === 'linear' && 'Søker lineært gjennom arrayet'}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={runAlgorithm}
              disabled={isRunning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              Kjør Algoritme
            </button>
            <button
              onClick={resetArray}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-white/10 hover:border-white/20 text-white rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Code Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Python Kode
          </h2>
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 font-mono text-sm">
            <pre className="text-gray-300 overflow-x-auto">
              {getCodeExample()}
            </pre>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Visualisering</h2>
        <div className="bg-surface/30 border border-white/10 rounded-xl p-8">
          <div className="flex items-end justify-center gap-2 h-64">
            {array.map((value, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  height: `${(value / maxValue) * 100}%`,
                }}
                className="bg-gradient-to-t from-primary to-secondary rounded-t-lg min-w-[40px] flex items-end justify-center text-white font-semibold text-sm pb-2"
              >
                {value}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


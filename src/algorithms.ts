import type { Process } from './components/ProcessTable.vue'

export type AlgorithmName =
  | 'Round Robin'
  | 'Preemptive SJF'
  | 'Non-preemptive SJF'
  | 'Preemptive Priority'
  | 'Non-preemptive Priority'
  | 'First Come First Serve'

export type ProcessFragment = {
  name: string
  duration: number
  number: number
  start: number
}
export type Algorithm = {
  name: AlgorithmName
  quantum?: number
}
export const schedule = (processes: Array<Process>, selectedAlgorithm: Algorithm) => {
  switch (selectedAlgorithm.name) {
    case 'First Come First Serve':
      return firstComeFirstServe(processes)
    case 'Round Robin':
      return roundRobin(processes, selectedAlgorithm.quantum as number)
    case 'Preemptive SJF':
      return preemptiveShortestJobFirst(processes)
    case 'Non-preemptive SJF':
      return nonPreemptiveShortestJobFirst(processes)
    case 'Preemptive Priority':
      return preemptivePriorty(processes)
    case 'Non-preemptive Priority':
      return nonPreemptivePriority(processes)
  }
}
const firstComeFirstServe = (processes: Array<Process>) => {
  return processes
    .sort((a, b) => a.arrival_time - b.arrival_time)
    .map((process) => ({
      name: process.name,
      duration: process.burst_time,
      start: process.arrival_time,
      number: process.number
    }))
}

const preemptiveShortestJobFirst = (processes: Array<Process>) => {
  const fragments: ProcessFragment[] = []
  let fragment
  const totalBurstTime = processes.reduce((acc, process) => acc + process.burst_time, 0)
  for (let i = 0; i < totalBurstTime; i++) {
    fragment = processes
      .filter((process) => process.arrival_time <= i)
      .sort((a, b) => a.burst_time - b.burst_time)
      .find((process) => process.burst_time > 0)
    if (fragment) {
      const fragment_idx = processes.findIndex((frag) => frag.name == fragment.name)
      fragments[fragment_idx].duration -= 1
      fragments.push({ name: fragment.name, duration: 1, start: i, number: fragment.number })
    }
  }
  return fragments
}
const nonPreemptiveShortestJobFirst = (processes: Array<Process>) => {
  const readyQueue: ProcessFragment[] = []
  const fragments: ProcessFragment[] = []
  let fragment
  const totalBurstTime = processes.reduce((acc, process) => acc + process.burst_time, 0)

  return fragments
}
const preemptivePriorty = (processes: Array<Process>) => {
  const readyQueue: ProcessFragment[] = []
  const fragments: ProcessFragment[] = []
  let fragment
  const totalBurstTime = processes.reduce((acc, process) => acc + process.burst_time, 0)

  return fragments
}
const nonPreemptivePriority = (processes: Array<Process>) => {
  const readyQueue: ProcessFragment[] = []
  const fragments: ProcessFragment[] = []
  let fragment
  const totalBurstTime = processes.reduce((acc, process) => acc + process.burst_time, 0)

  return fragments
}

const roundRobin = (processes: Array<Process>, quantum: number) => {
  let readyQueue = processes.map((process) => ({
    name: process.name,
    duration: process.burst_time,
    start: process.arrival_time,
    number: process.number
  }))
  const fragments = []
  let fragment
  const totalBurstTime = processes.reduce((acc, process) => acc + process.burst_time, 0)
  for (let i = 0; i < totalBurstTime; i++) {
    fragment = readyQueue.find((fragment) => fragment.start === i)

    while (fragment) {
      if (fragment.duration > quantum) {
        fragments.push({ ...fragment, duration: quantum })
        readyQueue = readyQueue.slice(1)
        readyQueue.push({
          ...fragment,
          duration: fragment.duration - quantum,
          start: (readyQueue[readyQueue.length - 1]?.start ?? 0) + quantum
        })
      } else {
        fragments.push(fragment)
        readyQueue = readyQueue.slice(1)
      }
      fragment = readyQueue.find((fragment) => fragment.start === i)
      console.log(fragment)
    }
    // fragments.push({ name: 'idle', duration: 1 })
  }

  return fragments
}

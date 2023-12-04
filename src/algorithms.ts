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
  number?: number
  idle?: boolean
  start?: number
}
export type Algorithm = {
  name: AlgorithmName
  quantum?: number
}
export const schedule = (processes: Array<Process>, selectedAlgorithm: Algorithm, tick: number) => {
  switch (selectedAlgorithm.name) {
    case 'First Come First Serve':
      return firstComeFirstServe(processes)
    case 'Round Robin':
      return roundRobin(processes,tick, selectedAlgorithm.quantum as number)
    case 'Preemptive SJF':
      return preemptiveShortestJobFirst(processes, tick)
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

export const getTotalBurstTime = (processes: Array<Process>) =>
  processes.reduce((acc, process) => acc + process.burst_time, 0)

const preemptiveShortestJobFirst = (processes: Array<Process>, totalBurst: int) => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0

  while (tick < totalBurst) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)

        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number
        }))
    )

    const oldReadyQueue = [...readyQueue]
    readyQueue.sort((a, b) => a.duration - b.duration)
    const hasChanged = JSON.stringify(oldReadyQueue) !== JSON.stringify(readyQueue)

    if (readyQueue.length <= 0) {
      idleDuration++
    } else {
      if (idleDuration > 0) {
        fragments.push({ duration: idleDuration, name: 'idle', idle: true })
        idleDuration = 0
      }
      readyQueue[0].duration--
      fragmentDuration++
      if (hasChanged) {
        fragments.push({ ...oldReadyQueue[0], duration: fragmentDuration - 1 })
        fragmentDuration = 1
      }
      if (readyQueue[0].duration === 0) {
        fragments.push({ ...readyQueue[0], duration: fragmentDuration })
        fragmentDuration = 0
        readyQueue.shift()
      }
    }
    tick++
  }
  fragments.push({ ...readyQueue[0], duration: fragmentDuration })
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

const roundRobin = (processes: Array<Process>, totalBurst:number, quantum: number) => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  const idleDuration = 0
  let tick = 0;
  while (tick < totalBurst) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)

        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number
        }))
    )

    console.log(readyQueue.map((proc) => proc.name + ":" + proc.duration))
    fragmentDuration++;
    readyQueue[0].duration--;
    if (fragmentDuration === quantum || readyQueue[0].duration === 0) {
      fragments.push({ ...readyQueue[0], duration: fragmentDuration })
      fragmentDuration = 0
      if (readyQueue[0].duration > 0) {
        readyQueue.push(readyQueue[0])
      }
      readyQueue.shift()
    } 

    tick++
  }
  return fragments;
}

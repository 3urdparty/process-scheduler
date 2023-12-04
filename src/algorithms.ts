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
  priority?: number
}
export type Algorithm = {
  name: AlgorithmName
  quantum?: number
  merge?: boolean
}
export const schedule = (
  processes: Array<Process>,
  selectedAlgorithm: Algorithm,
  tick: number
): ProcessFragment[] => {
  let fragments: ProcessFragment[] = []
  const filtered_processes = processes.filter((process) => process.burst_time > 0)
  switch (selectedAlgorithm.name) {
    case 'First Come First Serve':
      fragments = firstComeFirstServe(processes)
      break
    case 'Round Robin':
      fragments = roundRobin(filtered_processes, tick, selectedAlgorithm.quantum as number)
      break
    case 'Preemptive SJF':
      fragments = preemptiveShortestJobFirst(processes, tick)
      break
    case 'Non-preemptive SJF':
      fragments = nonPreemptiveShortestJobFirst(processes, tick)
      break
    case 'Preemptive Priority':
      fragments = preemptivePriorty(processes)
      break
    case 'Non-preemptive Priority':
      fragments = nonPreemptivePriority(processes, tick)
      break
  }
  if (selectedAlgorithm.merge) {
    fragments = mergeFragments(fragments)
  }
  return fragments
}

const firstComeFirstServe = (processes: Array<Process>) => {
  return []
}

export const getTotalBurstTime = (processes: Array<Process>) =>
  processes.reduce((acc, process) => acc + process.burst_time, 0)

const algo = (
  processes: Array<Process>,
  totalBurst: number,
preemptive: boolean,
  prioritizer: (a: Process, b:Process) => number
): ProcessFragment[] => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0

  while (tick < totalBurst || readyQueue.length > 0) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)
        .sort(prioritizer)
        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number
        }))
    )

    const oldReadyQueue = [...readyQueue]
    // readyQueue.sort((a, b) => a.duration - b.duration)
    if (readyQueue.length <= 0) {
      idleDuration++
      console.log('idle')
    } else {
      if (idleDuration > 0) {
        fragments.push({ duration: idleDuration, name: 'idle', idle: true })
        idleDuration = 0
      }
      fragmentDuration++
      readyQueue[0].duration--
      if (readyQueue[0].duration === 0) {
        fragments.push({ ...readyQueue[0], duration: fragmentDuration })
        readyQueue.shift()
        fragmentDuration = 0
      }
    }
    tick++
  }

  return fragments
}

const preemptiveShortestJobFirst = (processes: Array<Process>, totalBurst: number) => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0

  while (tick < totalBurst || readyQueue.length > 0) {
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
  return fragments
}
const nonPreemptiveShortestJobFirst = (processes: Array<Process>, totalBurst: number) => {
  return algo(processes, totalBurst, false, (a, b) => a.burst_time - b.burst_time)
}
const preemptivePriorty = (processes: Array<Process>) => {
  const readyQueue: ProcessFragment[] = []
  const fragments: ProcessFragment[] = []
  let fragment
  const totalBurstTime = processes.reduce((acc, process) => acc + process.burst_time, 0)

  return fragments
}
const nonPreemptivePriority = (processes: Array<Process>, totalBurst: number) => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0

  while (tick < totalBurst || readyQueue.length > 0) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)
        .sort((a, b) => a.priority - b.priority)
        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number
        }))
    )

    const oldReadyQueue = [...readyQueue]
    // readyQueue.sort((a, b) => a.duration - b.duration)
    if (readyQueue.length <= 0) {
      idleDuration++
      console.log('idle')
    } else {
      if (idleDuration > 0) {
        fragments.push({ duration: idleDuration, name: 'idle', idle: true })
        idleDuration = 0
      }
      fragmentDuration++
      readyQueue[0].duration--
      if (readyQueue[0].duration === 0) {
        fragments.push({ ...readyQueue[0], duration: fragmentDuration })
        readyQueue.shift()
        fragmentDuration = 0
      }
    }
    tick++
  }

  return fragments
}

const roundRobin = (processes: Array<Process>, totalBurst: number, quantum: number) => {
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
    if (readyQueue.length <= 0) {
      idleDuration++
    } else {
      if (idleDuration > 0) {
        fragments.push({ duration: idleDuration, name: 'idle', idle: true })
        idleDuration = 0
      }
      fragmentDuration++
      readyQueue[0].duration--
      if (fragmentDuration === quantum || readyQueue[0].duration === 0) {
        fragments.push({ ...readyQueue[0], duration: fragmentDuration })
        fragmentDuration = 0
        if (readyQueue[0].duration > 0) {
          readyQueue.push(readyQueue[0])
        }
        readyQueue.shift()
      }
    }

    tick++
  }
  return fragments
}

const mergeFragments = (fragments: ProcessFragment[]): ProcessFragment[] => {
  const mergedFragments: ProcessFragment[] = []
  let currentFragment: ProcessFragment = fragments[0]
  for (let i = 1; i < fragments.length; i++) {
    if (fragments[i].name === currentFragment.name) {
      currentFragment.duration += fragments[i].duration
    } else {
      mergedFragments.push(currentFragment)
      currentFragment = fragments[i]
    }
  }
  if (currentFragment) {
    mergedFragments.push(currentFragment)
  }
  console.log(mergedFragments.map((proc) => proc))
  return [...mergedFragments]
}

import type { Algorithm, Process, ProcessFragment } from './types'

// decides which scheduling algorithm the use and then returns the scheduled fragments
export const schedule = (
  processes: Array<Process>, // processes to be scheduled
  selectedAlgorithm: Algorithm, // the selected algorithm
  tick: number, // the current tick
  merge: boolean = false // whether to merge the fragments or not
): ProcessFragment[] => {
  let fragments: ProcessFragment[] = []
  const filtered = processes.filter((process) => process.burst_time > 0) // gets rid of processes with no burst time
  switch (selectedAlgorithm.name) {
    case 'First Come First Serve':
      fragments = nonPreemptiveAlgorithm(filtered, tick)
      break
    case 'Round Robin':
      fragments = roundRobin(filtered, tick, selectedAlgorithm.quantum as number)
      break
    case 'Preemptive SJF':
      fragments = preemptiveAlgorithm(filtered, tick, (a, b) => a.duration - b.duration)
      break
    case 'Non-preemptive SJF':
      fragments = nonPreemptiveAlgorithm(filtered, tick, (a, b) => a.duration - b.duration)
      break
    case 'Preemptive Priority':
      fragments = preemptiveAlgorithm(filtered, tick, (a, b) => a.priority - b.priority)
      break
    case 'Non-preemptive Priority':
      fragments = nonPreemptiveAlgorithm(filtered, tick, (a, b) => a.priority - b.priority)
      break
  }
  if (merge) {
    fragments = mergeFragments(fragments)
  }
  return fragments
}

// gets the total burst time of all processes
export const getTotalBurstTime = (processes: Array<Process>) =>
  processes.reduce((acc, process) => acc + process.burst_time, 0)

// schedules the processes using the non-preemptive algorithm, and returns the fragments
// the prioritizer function is used to sort the ready queue
const nonPreemptiveAlgorithm = (
  processes: Array<Process>,
  totalBurst: number,
  prioritizer?: (a: ProcessFragment, b: ProcessFragment) => number
): ProcessFragment[] => {
  const fragments: ProcessFragment[] = [] // final fragments
  let readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed
  let remaining: ProcessFragment[] = processes.map((proc) => ({
    name: proc.name,
    duration: proc.burst_time,
    start: proc.arrival_time,
    number: proc.number,
    priority: proc.priority
  })) // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0

  while (remaining.length > 0 && tick < totalBurst) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)

        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number,
          priority: proc.priority
        }))
    )

    if (prioritizer) readyQueue = readyQueue.sort(prioritizer)
    console.log(readyQueue.map((proc) => proc.name + ' ' + proc.duration))
    if (readyQueue.length <= 0) {
      idleDuration++
    } else {
      if (idleDuration > 0) {
        fragments.push({
          duration: idleDuration,
          name: 'idle',
          idle: true,
          priority: 0,
          start: tick + 1
        })
        idleDuration = 0
      }
      fragmentDuration++
      readyQueue[0].duration--
      if (readyQueue[0].duration === 0) {
        fragments.push({
          ...readyQueue[0],
          duration: fragmentDuration,
          start: tick + 1 - fragmentDuration
        })
        remaining = remaining.filter((proc) => proc.name != readyQueue[0].name)
        readyQueue.shift()
        fragmentDuration = 0
      }
    }
    tick++
  }
  if (readyQueue.length > 0) {
    fragments.push({
      ...readyQueue[0],
      duration: fragmentDuration + 1,
      start: tick - fragmentDuration
    })
  }
  return fragments
}
const preemptiveAlgorithm = (
  processes: Array<Process>,
  totalBurst: number,
  prioritizer: (a: ProcessFragment, b: ProcessFragment) => number
): ProcessFragment[] => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed
  let remaining: ProcessFragment[] = processes.map((proc) => ({
    name: proc.name,
    duration: proc.burst_time,
    start: proc.arrival_time,
    number: proc.number,
    priority: proc.priority
  })) // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0

  while (remaining.length > 0 && tick < totalBurst) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)
        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number,
          priority: proc.priority
        }))
    )

    const oldReadyQueue = [...readyQueue]
    readyQueue.sort(prioritizer)
    const hasChanged = JSON.stringify(oldReadyQueue) !== JSON.stringify(readyQueue)

    if (readyQueue.length <= 0) {
      idleDuration++
    } else {
      if (idleDuration > 0) {
        fragments.push({
          duration: idleDuration,
          name: 'idle',
          idle: true,
          priority: 0,
          start: tick + 1
        })
        idleDuration = 0
      }
      readyQueue[0].duration--
      fragmentDuration++
      if (hasChanged) {
        fragments.push({
          ...oldReadyQueue[0],
          duration: fragmentDuration - 1,
          start: tick - fragmentDuration + 1
        })
        fragmentDuration = 1
      }
      if (readyQueue[0].duration === 0) {
        fragments.push({
          ...readyQueue[0],
          duration: fragmentDuration,
          start: tick + 1 - fragmentDuration
        })
        remaining = remaining.filter((proc) => proc.name != readyQueue[0].name)

        fragmentDuration = 0
        readyQueue.shift()
      }
    }
    tick++
  }
  if (readyQueue.length > 0) {
    fragments.push({ ...readyQueue[0], duration: fragmentDuration + 1, start: tick - fragmentDuration })
  }

  return fragments
}

const roundRobin = (processes: Array<Process>, totalBurst: number, quantum: number) => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let remaining: ProcessFragment[] = processes.map((proc) => ({
    name: proc.name,
    duration: proc.burst_time,
    start: proc.arrival_time,
    number: proc.number,
    priority: proc.priority
  })) // represents the process ready queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let tick = 0
  while (remaining.length > 0 && tick < totalBurst) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)

        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          number: proc.number,
          priority: proc.priority
        }))
    )

    if (readyQueue.length <= 0) {
      idleDuration++
    } else {
      if (idleDuration > 0) {
        fragments.push({
          duration: idleDuration,
          name: 'idle',
          idle: true,
          priority: 0,
          start: tick + 1
        })
        idleDuration = 0
      }
      fragmentDuration++
      readyQueue[0].duration--
      if (fragmentDuration === quantum || readyQueue[0].duration === 0) {
        fragments.push({
          ...readyQueue[0],
          duration: fragmentDuration,
          start: tick + 1 - fragmentDuration
        })

        fragmentDuration = 0
        if (readyQueue[0].duration > 0) {
          readyQueue.push(readyQueue[0])
        } else {
          remaining = remaining.filter((proc) => proc.name != readyQueue[0].name)
        }
        readyQueue.shift()
      }
    }

    tick++
  }
  if (readyQueue.length > 0) {
    fragments.push({ ...readyQueue[0], duration: fragmentDuration+ 1, start: tick - fragmentDuration })
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
  return [...mergedFragments]
}

export const calculateTurnaroundTime = (process: Process) =>
  process.finish_time - process.arrival_time
export const calculateWaitingTime = (process: Process) =>
  process.finish_time - process.arrival_time - process.burst_time

export const calculateFinishTime = (process: Process) => {}

import type { Process, ProcessFragment } from '../types'
export const preemptiveAlgorithm = (
  processes: Array<Process>,
  totalBurst: number,
  prioritizer?: (a: ProcessFragment, b: ProcessFragment) => number
): ProcessFragment[] => {
  const fragments: ProcessFragment[] = [] // final fragments
  let readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  // Used to track if there are any more processes that are not yet scheduled
  let remaining: ProcessFragment[] = processes.map((proc) => ({
    name: proc.name,
    duration: proc.burst_time,
    start: proc.arrival_time,
    priority: proc.priority
  }))

  // Used to keep track of the currently executing process, if any
  // allowing us to sort the ready queue by priority without losing track of the current process
  let currentFragment: ProcessFragment | null = null // initilized to null, because there is no current process

  // tracks the duration for which the current process has been executing
  let fragmentDuration = 0

  // tracks the duration of the idle process
  let idleDuration = 0

  // tracks the current tick, used as a counter
  let tick = 0

  // loops until all processes are scheduled or the tick reaches the total burst time
  while (remaining.length > 0 && tick < totalBurst) {
    // adds processes that have arrived to the ready queue
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)
        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          priority: proc.priority
        }))
    )

    // if there are no processes in the ready queue, then the CPU is idle
    if (readyQueue.length <= 0) {
      idleDuration++ // increments the idle duration
    } else {
      // if the CPU was idle, then we add an idle fragment to the fragments array
      if (idleDuration > 0) {
        fragments.push({
          duration: idleDuration,
          name: 'idle',
          idle: true,
          priority: 0,
          start: tick + 1
        })
        idleDuration = 0 // resets the idle duration
      }

      // sorts the ready queue by priority, so the next process to be executed is at the start
      readyQueue.sort(prioritizer)
      console.log('tick', tick)
      console.table(readyQueue)

      // if there is no current process, then we set the current process to the first process in the ready queue
      if (currentFragment == null) currentFragment = readyQueue[0]
      else if (currentFragment != readyQueue[0]) {
        // if the current process is not the first process in the ready queue, then we preempt the current process
        fragments.push({
          ...currentFragment,
          duration: fragmentDuration,
          start: tick - fragmentDuration,
          remaining: currentFragment.duration
        })

        // resets the fragment duration
        fragmentDuration = 0

        readyQueue = readyQueue.filter((proc) => proc.name != currentFragment?.name)

        readyQueue.push(currentFragment)
        // sets the current process to the first process in the ready queue
        currentFragment = readyQueue[0]
      }

      // increments the fragment duration
      fragmentDuration++
      // decrements the current process duration, to be able to detect when it reaches 0
      currentFragment.duration--
      // if the current process duration reaches 0, then we add the current process to the fragments array
      if (currentFragment.duration === 0) {
        // adds the current process to the fragments array
        fragments.push({
          ...currentFragment,
          duration: fragmentDuration,
          start: tick + 1 - fragmentDuration,
          remaining: currentFragment.duration
        })

        // removes the current process from the remaining processes
        remaining = remaining.filter((proc) => proc.name != currentFragment?.name)

        // removed the current process from the ready queue
        readyQueue = readyQueue.filter((proc) => proc.name != currentFragment?.name)

        // resets the current fragment
        currentFragment = null

        // resets the fragment duration preparing for the next proces
        fragmentDuration = 0
      } else {
        // if the current process duration is not 0, then we add it to the ready queue
        readyQueue.push(currentFragment)
      }
    }

    // increments the tick
    tick++
  }

  // if there is a current process, then we add it to the fragments array
  if (readyQueue.length > 0) {
    fragments.push({
      ...readyQueue[0],
      duration: fragmentDuration + 1,
      start: tick - fragmentDuration
    })
  }
  return fragments
}

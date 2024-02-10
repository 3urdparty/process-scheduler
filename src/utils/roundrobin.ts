import type { Process, ProcessFragment } from '../types'

export const roundRobin = (processes: Array<Process>, totalBurst: number, quantum: number) => {
  const fragments: ProcessFragment[] = [] // final fragments
  const readyQueue: ProcessFragment[] = [] // represents the process ready queue, for processes that can be executed

  let remaining: ProcessFragment[] = processes.map((proc) => ({
    name: proc.name,
    duration: proc.burst_time,
    start: proc.arrival_time,

    priority: proc.priority
  })) // represents the process readyv queue, for processes that can be executed

  let fragmentDuration = 0
  let idleDuration = 0
  let toPreempt = null
  let tick = 0
  while (remaining.length > 0 && tick < totalBurst) {
    readyQueue.push(
      ...processes
        .filter((process) => process.arrival_time === tick)
        .map((proc) => ({
          name: proc.name,
          duration: proc.burst_time,
          start: proc.arrival_time,
          priority: proc.priority
        }))
        .sort((a, b) => a.priority - b.priority)
    )

    if (toPreempt) {
      readyQueue.push(toPreempt)
      toPreempt = null
    }

    if (readyQueue.length <= 0) {
      idleDuration++
    } else {
      console.table(readyQueue)
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
        if (readyQueue[0].duration > 0) {
          toPreempt = readyQueue[0]
        } else {
          remaining = remaining.filter((proc) => proc.name != readyQueue[0].name)
        }
        fragments.push({
          ...readyQueue[0],
          duration: fragmentDuration,
          start: tick - fragmentDuration + 1,
          remaining: readyQueue[0].duration
        })

        fragmentDuration = 0

        readyQueue.shift()
      }
    }

    tick++
  }
  if (readyQueue.length > 0) {
    fragments.push({
      ...readyQueue[0],
      duration: fragmentDuration + 1,
      start: tick - fragmentDuration,
      remaining: readyQueue[0].duration
    })
  }
  return fragments
}

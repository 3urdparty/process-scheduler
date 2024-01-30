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
  idle?: boolean
  start: number
  priority: number
  remaining?: number
}
export type Algorithm = {
  name: AlgorithmName
  quantum?: number
}
export type Process = {
  name: string
  arrival_time: number
  finish_time: number
  burst_time: number
  priority: number
}

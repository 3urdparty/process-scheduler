// store.js
import { createGlobalState, useStorage } from '@vueuse/core'
import { reactive, ref } from 'vue'
import { type Algorithm, type Process } from './types'
export const useGlobalState = createGlobalState(() => {
  // state
  const merge = ref(true) // whether to merge processes;

  const algorithms = reactive<Algorithm[]>([
    // the algorithms
    { name: 'Round Robin', quantum: 5 },
    { name: 'Preemptive SJF' },
    { name: 'Non-preemptive SJF' },
    { name: 'Preemptive Priority' },
    { name: 'Non-preemptive Priority' },
    { name: 'First Come First Serve' }
  ])

  const selectedAlgorithm = ref(algorithms[0]) // the selected algorithm

  const stepping = ref(false) // whether the playback is stepping
  const step = ref(0) // the current step
  const totalStep = ref(0) // the total step

  // adds a process to the processes array
  const addProcess = () => {
    const length = processes.value.length
    processes.value.push({
      number: length + 1,
      name: 'Process ' + (length + 1),
      arrival_time: 0,
      burst_time: 10,
      finish_time: (processes.value[length - 1]?.finish_time ?? 0) + 5,
      priority: 0
    })
  }

  const processes = useStorage<Process[]>('processes', []) // stores the processes
  const editing = ref(false) // whether the user is editing the processes

  const setTotalStep = (num: number) => {
    // sets the total step
    totalStep.value = num
  }

  const setStep = (num: number) => {
    // sets the current step
    step.value = num
  }
  const scale = ref(2) // the scale of each process in the GANTT chart
  return {
    algorithms,
    merge,
    selectedAlgorithm,
    step,
    stepping,
    totalStep,
    processes,
    editing,
    addProcess,
    setTotalStep,
    setStep,
    scale
  }
})

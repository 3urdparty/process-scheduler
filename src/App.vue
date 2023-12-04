<script setup lang="ts">
import { provide, reactive, ref, type InjectionKey, type Ref } from 'vue'
import ComboBox from './components/ComboBox.vue'
import EditToggle from './components/EditToggle.vue'
import PlayBack, { type PlaybackStatus } from './components/PlayBack.vue'
import ProcessGANTT from './components/ProcessGANTT.vue'
import ProcessTable from './components/ProcessTable.vue'
import type { Algorithm, Process } from './types'

const processes = reactive<Process[]>([]) // stores the processes
const editing = ref(false) // whether the user is editing the processes

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
const playbackStatus = reactive<PlaybackStatus>({
  // the playback status
  stepping: false,
  step: 0,
  totalStep: 0
})

// adds a process to the processes array
const addProcess = () => {
  processes.push({
    number: processes.length + 1,
    name: 'Process ' + (processes.length + 1),
    arrival_time: 0,
    burst_time: 10,
    finish_time: (processes[processes.length - 1]?.finish_time ?? 0) + 5,
    priority: 0
  })
}

const scale = ref(2) // the scale of each process in the GANTT chart
const setTotalStep = (num: number) => {
  // sets the total step
  playbackStatus.totalStep = num
}

const setStep = (num: number) => {
  // sets the current step
  playbackStatus.step = num
}
provide(ScaleInjectionKey, scale)
provide(PlayBackInjectionKey, { playback: playbackStatus, setTotalStep, setStep })
provide(MergeInjectionKey, merge)
</script>

<template>
  <div class="space-y-8 mt-8">
    <div class="flex gap-2 justify-between items-center px-8">
      <!-- Edit Button -->
      <label class="text-violet-500 flex gap-3">
        <EditToggle v-model="editing" />
        {{ editing ? 'Editing Enabled' : 'Editing Disabled' }}
      </label>

      <div class="flex items-center gap-2">
        <!-- Add Process Button -->
        <button
          class="bg-violet-400 text-white p-1.5 rounded-md shadow-sm px-3 focus hover:opacity-75 active:bg-violet-700 transition-all"
          @click="addProcess"
        >
          Add Process
        </button>

        <!-- Select Algorithm Combobox -->
        <ComboBox :options="algorithms" v-model="selectedAlgorithm" class="w-60" />

        <!-- Select duration of Quantum -->
        <input
          type="number"
          v-model="algorithms[0].quantum"
          v-if="selectedAlgorithm.name == 'Round Robin'"
          class="w-14 px-2 py-1.5 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
        />

        <!-- Merge Concurrent identical Processes checkbox -->
        <label>
          <input
            type="checkbox"
            v-model="merge"
            class="py-1.5 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all accent-indigo-400"
          />
          Merge Processes
        </label>
      </div>
    </div>
    <div class="px-3 space-y-3">
      <!-- Process GANTT  -->
      <div class="bg-slate-100 rounded-md pt-3">
        <ProcessGANTT v-model="processes" class="px-8" :selected-algorithm="selectedAlgorithm" />
      </div>
      <!-- Playback Controls -->
      <PlayBack v-model="playbackStatus" />
    </div>

    <!-- Process table -->
    <ProcessTable v-model="processes" class="mx-8" :editing="editing" />
  </div>
</template>

<script lang="ts">
// Injection keys
export const PlayBackInjectionKey = Symbol('PLAYBACK') as InjectionKey<{
  playback: PlaybackStatus
  setTotalStep: (step: number) => void
  setStep: (step: number) => void
}>
export const ScaleInjectionKey = Symbol('SCALE') as InjectionKey<Ref<number>>
export const MergeInjectionKey = Symbol('MERGE') as InjectionKey<Ref<boolean>>
</script>

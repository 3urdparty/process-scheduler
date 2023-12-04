<script setup lang="ts">
import { MergeInjectionKey, PlayBackInjectionKey, ScaleInjectionKey } from '@/App.vue'
import { schedule } from '@/algorithms'
import type { Algorithm, Process } from '@/types'
import { InformationCircleIcon } from '@heroicons/vue/24/solid'
import { get, reactify } from '@vueuse/core'
import { computed, inject, watch, type Ref } from 'vue'
import type { PlaybackStatus } from './PlayBack.vue'

// Props
interface Props {
  modelValue: Array<Process>
  selectedAlgorithm: Algorithm
}
const props = defineProps<Props>()

// Injects
const scale = inject(ScaleInjectionKey) as Ref<number>
const merge = inject(MergeInjectionKey) as Ref<boolean>
const { playback, setTotalStep, setStep } = inject(PlayBackInjectionKey) as {
  playback: PlaybackStatus
  setTotalStep: (step: number) => void
  setStep: (step: number) => void
}

// Computed values
const step = computed(() => playback.step) // the current step
const selectedAlgorithm = computed(() => props.selectedAlgorithm) // the selected algorithm
const processFragments = reactify(schedule)(props.modelValue, selectedAlgorithm, step, merge) // the process fragments
const totalBurstTime = computed(() =>
  // the total burst time
  props.modelValue.reduce((acc, curr) => acc + curr.burst_time, 0)
)
const interruptingProcesses = computed(() =>
  // the interrupting processes, for use in highlighting interrupting Processes in the GANTT chart
  props.modelValue.filter(
    (proc) =>
      !(
        get(processFragments)
          .map((process) => process.start)
          .includes(proc.arrival_time) || proc.arrival_time === 0
      )
  )
)

watch(
  // watches the processFragments and updates the total step
  totalBurstTime,
  (newVal) => {
    setTotalStep(newVal)
    setStep(newVal)
  }
)
</script>
<template>
  <div class="py-4 overflow-x-scroll overflow-y-hidden scrollbar-none h-24">
    <div class="flex h-12 items-center w-fit relative" v-if="processFragments.length > 0">
      <!-- To mark interrupting processes -->
      <div
        v-for="(i, idx) in interruptingProcesses"
        :key="idx"
        class="absolute z-10 -bottom-5 -left-1 text-sm text-slate-900 flex flex-col items-center"
        :style="{ left: `${i.arrival_time * scale}rem` }"
      >
        <div class="bg-indigo-400 h-3 w-0.5 rounded-full"></div>
        {{ i.number }}
      </div>

      <!-- Represents the processes in action -->
      <div
        v-for="(process, idx) in processFragments"
        v-show="process.duration > 0"
        :key="idx"
        class="relative px-2 whitespace-nowrap border border-stone-300 py-1.5 transition transform h-10"
        :class="{
          'rounded-l-md': idx === 0,
          'rounded-r-md': idx === processFragments.length - 1,
          'bg-slate-200': process.idle,
          'bg-white': !process.idle
        }"
        :style="{ width: `${process.duration * scale}rem` }"
      >
        <div class="overflow-clip pointer-events-none select-none" v-show="!process.idle">
          <!-- Shows the process name, shortened if out of space -->
          {{ process.duration < 4 ? 'P' + process.number : process.name }}
        </div>
        <div
          class="overflow-clip pointer-events-none select-none absolute -top-6 left-2 text-sm text-slate-400"
        >
          <!-- Shows the `Px(y)` notation-->
          {{ `P${process.start}(${process.duration})` }}
        </div>

        <!-- Process Fragment finish time -->
        <span
          class="absolute -left-1 -bottom-10 text-sm font-light text-slate-400 h-full truncate pointer-events-none select-none"
        >
          {{ processFragments.slice(0, idx).reduce((acc, curr) => acc + curr.duration, 0) }}
        </span>
      </div>

      <!-- Total burst time -->
      <span
        class="absolute -right-1 -bottom-11 text-sm font-light text-slate-400 h-full pointer-events-none select-none"
        v-if="processFragments.length > 0"
      >
        {{ processFragments.reduce((acc, curr) => acc + curr.duration, 0) }}
      </span>
    </div>
    <!-- In case no processes are found -->
    <div class="pt-2 gap-1 text-slate-500 flex items-center" v-else>
      <InformationCircleIcon class="w-5" />
      No Processes Found...
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalState } from '@/GlobalState'
import { schedule } from '@/algorithms'
import { InformationCircleIcon, PlayCircleIcon } from '@heroicons/vue/24/solid'
import { get, reactify } from '@vueuse/core'

import { computed, watch } from 'vue'

const {
  setStep,
  setTotalStep,
  step,
  selectedAlgorithm,
  processes,
  merge,
  scale,
  stepping,
  totalStep
} = useGlobalState()
// Computed values

const processFragments = reactify(schedule)(processes, selectedAlgorithm, step, merge) // the process fragments
const totalBurstTime = computed(() =>
  // the total burst time
  processes.value.reduce((acc, curr) => acc + curr.burst_time, 0)
)
const interruptingProcesses = computed(() =>
  // the interrupting processes, for use in highlighting interrupting Processes in the GANTT chart
  processes.value.filter(
    (proc) =>
      !(
        get(processFragments)
          .map((process) => process.start)
          .includes(proc.arrival_time) || proc.arrival_time === 0
      )
  )
)

watch(
  // watches the step and sets the step to the total burst time if it exceeds it
  totalBurstTime,
  (newVal, oldVal) => {
    setTotalStep(newVal)

    setTimeout(() => {
      step.value = newVal
    }, 1)
  },
  { immediate: true }
)

watch(
  // watches the selectedAlgorithm and resets the step
  processFragments,
  () => {
    processes.value.forEach((proc) => {
      const fragment = get(processFragments).find((p) => p.name === proc.name)
      if (!fragment) return
      const index =
        get(processFragments).length -
        get(processFragments)
          .toReversed()
          .findIndex((p) => p.name === proc.name) -
        1
      const finish_time = get(processFragments)[index].duration + get(processFragments)[index].start

      proc.finish_time = finish_time
    })
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

    <div class="pt-2 gap-1 text-slate-500 flex items-center" v-else-if="processes.length > 0">
      <PlayCircleIcon class="w-5" />
      Press the play button to start the simulation
    </div>

    <div class="pt-2 gap-1 text-slate-500 flex items-center" v-else>
      <InformationCircleIcon class="w-5" />
      No Processes Found...
    </div>
  </div>
</template>

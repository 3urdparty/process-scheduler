<script setup lang="ts">
import { useGlobalState } from '@/stores/global'
import { schedule } from '@/utils/algorithms'
import { InformationCircleIcon, PlayCircleIcon } from '@heroicons/vue/24/solid'
import { get, reactify } from '@vueuse/core'

import { computed, watch } from 'vue'

const { setTotalStep, step, selectedAlgorithm, processes, merge, scale } = useGlobalState()
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
  (newVal) => {
    setTotalStep(newVal)

    setTimeout(() => {
      step.value = newVal
    }, 1)
  },
  { immediate: true }
)

watch([selectedAlgorithm, processes, processFragments], ([, processes, processFragments]) => {
  for (let i = 0; i < processes.length; i++) {
    let finishTime = 0
    for (let j = 0; j < processFragments.length; j++) {
      if (processFragments[j].name === processes[i].name) {
        finishTime = processFragments[j].start + processFragments[j].duration
      }
    }
    processes[i].finish_time = finishTime
  }
})
</script>
<template>
  <div class="py-4 overflow-x-scroll overflow-y-hidden scrollbar-none h-24">
    <div class="flex h-12 items-center w-fit relative" v-if="processFragments.length > 0">
      <!-- To mark interrupting processes -->
      <div
        v-for="(i, idx) in interruptingProcesses"
        v-show="i.arrival_time <= step"
        :key="idx"
        class="absolute z-10 top-10 text-sm text-slate-900 flex flex-col items-center"
        :style="{ left: `${i.arrival_time * scale - 0.09}rem` }"
      >
        <div class="bg-indigo-400 h-2 w-[2.5px] rounded-full"></div>
        <div class="-mt-0.5 text-xs" v-if="scale > 1">
          {{ i.arrival_time }}
        </div>
        <div class="-mt-0.5 text-xs text-slate-400" v-if="scale > 1">
          {{ i.name }}
        </div>
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
          {{ process.name }}
        </div>
        <div
          class="overflow-clip pointer-events-none select-none absolute -top-6 -right-2 text-sm text-slate-400"
          v-if="process.duration * scale > 2"
        >
          <!-- Shows the `Px(y)` notation-->
          {{ `${process.name}(${process.remaining})` }}
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

<script setup lang="ts">
import { PlayBackInjectionKey, ScaleInjectionKey } from '@/App.vue'
import { schedule, type Algorithm } from '@/algorithms'
import { InformationCircleIcon } from '@heroicons/vue/24/solid'
import { get, reactify } from '@vueuse/core'
import { computed, inject, watch, type Ref } from 'vue'
import type { PlaybackStatus } from './PlayBack.vue'
import type { Process } from './ProcessTable.vue'
interface Props {
  modelValue: Array<Process>
  selectedAlgorithm: Algorithm
}
const props = defineProps<Props>()

const scale = inject(ScaleInjectionKey) as Ref<number>
const { playback, setTotalStep, setStep } = inject(PlayBackInjectionKey) as {
  playback: PlaybackStatus
  setTotalStep: (step: number) => void
  setStep: (step: number) => void
}
const step = computed(() => playback.step)
const selectedAlgorithm = computed(() => props.selectedAlgorithm)
const processFragments = reactify(schedule)(props.modelValue, selectedAlgorithm, step)
const totalBurstTime = computed(() =>
  props.modelValue.reduce((acc, curr) => acc + curr.burst_time, 0)
)
watch(
  totalBurstTime,
  () => {
    setTotalStep(get(totalBurstTime))
    setStep(get(totalBurstTime))
  },
  { immediate: true }
)
watch(props.selectedAlgorithm, (oldProps, newProps) => {}, { immediate: true })
</script>
<template>
  <div class="pb-4 overflow-x-scroll overflow-y-hidden scrollbar-none h-20">
    <div class="flex h-12 items-center w-fit relative" v-if="processFragments.length > 0">
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
          {{ process.duration < 4 ? 'P' + process.number : process.name }}
        </div>
        <span
          class="absolute -left-1 -bottom-10 text-sm font-light text-slate-400 h-full truncate pointer-events-none select-none"
          :style="{ width: `${process.duration * 1}rem` }"
        >
          {{ processFragments.slice(0, idx).reduce((acc, curr) => acc + curr.duration, 0) }}
        </span>
      </div>
      <span
        class="absolute -right-1 -bottom-11 text-sm font-light text-slate-400 h-full pointer-events-none select-none"
        v-if="processFragments.length > 0"
      >
        {{ processFragments.reduce((acc, curr) => acc + curr.duration, 0) }}
      </span>
    </div>
    <div class="pt-2 gap-1 text-slate-500 flex items-center" v-else>
      <InformationCircleIcon class="w-5" />
      No Processes Found...
    </div>
  </div>
</template>

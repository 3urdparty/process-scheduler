<script setup lang="ts">
import { schedule, type Algorithm } from '@/algorithms'
import type { Process } from './ProcessTable.vue'
interface Props {
  modelValue: Array<Process>
  selectedAlgorithm: Algorithm
}
const props = defineProps<Props>()

// const processFragments = computed<ProcessFragment[]>(() =>
//   schedule(props.modelValue, props.selectedAlgorithm)
// )
</script>
<template>
  <div class="pb-4 overflow-x-scroll overflow-y-hidden scrollbar-none h-20">
    <div class="flex h-12 items-center w-fit relative">
      <div
        v-for="(process, idx) in schedule(props.modelValue, props.selectedAlgorithm)"
        v-show="process.duration > 0"
        :key="idx"
        class="relative px-2 whitespace-nowrap border border-stone-300 py-1.5 transition transform"
        :style="{ width: `${process.duration * 1.5}rem` }"
      >
        <div class="overflow-clip pointer-events-none select-none">
          {{ process.duration < 4 ? process.number : process.name }}
        </div>
        <span
          class="absolute -left-1 -bottom-10 text-sm font-light text-slate-400 h-full truncate pointer-events-none select-none"
          :style="{ width: `${process.duration * 1}rem` }"
        >
          {{
            schedule(props.modelValue, props.selectedAlgorithm)
              .slice(0, idx)
              .reduce((acc, curr) => acc + curr.duration, 0)
          }}
        </span>
      </div>
      <span
        class="absolute -right-1 -bottom-11 text-sm font-light text-slate-400 h-full pointer-events-none select-none"
      >
        {{
          schedule(props.modelValue, props.selectedAlgorithm).reduce(
            (acc, curr) => acc + curr.duration,
            0
          )
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalState } from '@/stores/global'
import { BackwardIcon, ForwardIcon, PlayIcon, StopIcon } from '@heroicons/vue/24/solid'
import { useIntervalFn } from '@vueuse/core'

const { step, stepping, totalStep } = useGlobalState()
const { pause, resume } = useIntervalFn(
  () => {
    if (step.value == totalStep.value) {
      stepping.value = false
      pause()
    } else {
      step.value++
    }
  },
  150,
  { immediate: false }
)

const controls = [
  {
    name: 'step-backward',
    icon: BackwardIcon,
    action: () => step.value--,
    disabled: () => step.value == 0
  },
  {
    name: 'pause',
    icon: StopIcon,
    action: () => {
      stepping.value = false
      pause()
    },
    disabled: () => !stepping.value
  },
  {
    name: 'play',
    icon: PlayIcon,
    action: () => {
      stepping.value = true
      resume()
    },
    disabled: () => stepping.value || step.value == totalStep.value
  },
  {
    name: 'step-forward',
    icon: ForwardIcon,
    action: () => step.value++,
    disabled: () => step.value == totalStep.value
  }
]
</script>
<template>
  <div class="space-y-2 px-2">
    <input
      type="range"
      class="range pr-6 accent-violet-500 block w-full"
      :min="0"
      :max="totalStep"
      v-model="step"
    />
    <div class="flex items-center gap-2 justify-center">
      <button
        @click="control.action"
        v-for="(control, idx) in controls"
        :key="idx"
        class="border rounded-md shadow-sm p-1 w-10 h-full disabled:opacity-50"
        :disabled="control.disabled()"
      >
        <component :is="control.icon" class="text-indigo-400" />
      </button>
    </div>
  </div>
</template>

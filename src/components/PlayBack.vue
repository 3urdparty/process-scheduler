<script setup lang="ts">
import { BackwardIcon, ForwardIcon, PlayIcon, StopIcon } from '@heroicons/vue/24/solid'
import { get, useIntervalFn, useVModel } from '@vueuse/core'

interface Props {
  modelValue: PlaybackStatus
}
interface Emits {
  (e: 'update:modelValue', value: PlaybackStatus): true
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const status = useVModel(props, 'modelValue', emit)
const { pause, resume } = useIntervalFn(
  () => {
    if (get(status).step == get(status).totalStep) {
      get(status).stepping = false
      pause()
    } else {
      get(status).step++
    }
  },
  150,
  { immediate: false }
)
const controls = [
  {
    name: 'step-backward',
    icon: BackwardIcon,
    action: () => get(status).step--,
    disabled: () => get(status).step == 0
  },
  {
    name: 'pause',
    icon: StopIcon,
    action: () => {
      get(status).stepping = false
      pause()
    },
    disabled: () => !get(status).stepping
  },
  {
    name: 'play',
    icon: PlayIcon,
    action: () => {
      get(status).stepping = true
      resume()
    },
    disabled: () => get(status).stepping || get(status).step == get(status).totalStep
  },
  {
    name: 'step-forward',
    icon: ForwardIcon,
    action: () => get(status).step++,
    disabled: () => get(status).step == get(status).totalStep
  }
]
</script>
<template>
  <div class="space-y-2 px-2">
    <input
      type="range"
      class="range pr-6 accent-violet-500 block w-full"
      min="0"
      :max="get(status).totalStep"
      v-model="get(status).step"
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
<script lang="ts">
export type PlaybackStatus = {
  stepping: boolean
  step: number
  totalStep: number
}
</script>

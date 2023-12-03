<template>
  <Switch
    v-model="enabled"
    :class="[
      enabled ? 'bg-indigo-600' : 'bg-gray-200',
      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
    ]"
  >
    <span class="sr-only">Use setting</span>
    <span
      :class="[
        enabled ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
      ]"
    >
      <span
        :class="[
          enabled ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
          'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <CheckIcon class="text-indigo-500 p-1" />
      </span>
      <span
        :class="[
          enabled ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
          'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <PencilIcon class="text-indigo-500 p-1" />
      </span>
    </span>
  </Switch>
</template>
<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { CheckIcon, PencilIcon } from '@heroicons/vue/24/solid'
import { useVModel } from '@vueuse/core'
interface Props {
  modelValue: boolean
}
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}
const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const enabled = useVModel(props, 'modelValue', emits)
</script>

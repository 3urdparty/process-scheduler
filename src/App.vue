<script setup lang="ts">
import { type Algorithm } from '@/algorithms'
import { reactive, ref } from 'vue'
import ComboBox from './components/ComboBox.vue'
import EditToggle from './components/EditToggle.vue'
import ProcessGANTT from './components/ProcessGANTT.vue'
import ProcessTable, { type Process } from './components/ProcessTable.vue'
const processes = reactive<Process[]>([])
const editing = ref(false)

const addProcess = () => {
  processes.push({
    number: processes.length + 1,
    name: 'Process ' + (processes.length + 1),
    arrival_time: processes[processes.length - 1]?.finish_time ?? 0,
    burst_time: 10,
    finish_time: (processes[processes.length - 1]?.finish_time ?? 0) + 5
  })
}
const algorithms = reactive<Algorithm[]>([
  { name: 'Round Robin', quantum: 5 },
  { name: 'Preemptive SJF' },
  { name: 'Non-preemptive SJF' },
  { name: 'Preemptive Priority' },
  { name: 'Non-preemptive Priority' },
  { name: 'First Come First Serve' }
])

const selectedAlgorithm = ref(algorithms[0])
</script>

<template>
  <div class="space-y-8 mt-8">
    <div class="flex gap-2 justify-between items-center px-8">
      <div class="flex gap-2">
        <span class="text-violet-500">
          {{ editing ? 'Editing Enabled' : 'Editing Disabled' }}
        </span>
        <EditToggle v-model="editing" />
      </div>

      <div class="flex items-center gap-2">
        <button
          class="bg-violet-400 text-white p-1.5 rounded-md shadow-sm px-3 focus hover:opacity-75 active:bg-violet-700 transition-all"
          @click="addProcess"
        >
          Add Process
        </button>
        <ComboBox :options="algorithms" v-model="selectedAlgorithm" class="w-60" />
        <input
          type="number"
          v-model="algorithms[0].quantum"
          v-if="selectedAlgorithm.name == 'Round Robin'"
          class="w-14 px-2 py-1.5 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
        />
      </div>
    </div>
    <ProcessGANTT v-model="processes" class="px-8" :selected-algorithm="selectedAlgorithm" />
    <ProcessTable v-model="processes" class="mx-8" :editing="editing" />
  </div>
</template>

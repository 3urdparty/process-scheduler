<template>
  <!-- This example requires Tailwind CSS v2.0+ -->

  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  v-for="(column, idx) in columns"
                  :key="idx"
                >
                  {{ column.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(process, processIdx) in modelValue"
                :key="process.name"
                :class="processIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
              >
                <td
                  class="pl-0.5 whitespace-nowrap text-sm font-medium text-gray-900"
                  v-for="(column, idx) in columns"
                  :key="idx"
                >
                  <input
                    v-if="!column.editable"
                    :value="column.getter ? column.getter(process) : 0"
                    class="w-full h-full px-6 py-4 bg-transparent"
                  />
                  <input
                    v-else-if="column.type === 'text'"
                    :disabled="!(column.editable && props.editing)"
                    v-model.lazy="process[column.field as keyof Process]"
                    type="text"
                    class="w-full h-full px-6 py-4 bg-transparent"
                  />
                  <input
                    v-else-if="column.type === 'number'"
                    :disabled="!(column.editable && props.editing)"
                    min="0"
                    v-model.number="process[column.field as keyof Process]"
                    type="number"
                    class="w-full h-full px-6 py-4 bg-transparent"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type Process = {
  name: string
  number: number
  arrival_time: number
  finish_time: number
  burst_time: number
  priority: number
}

interface Props {
  modelValue: Array<Process>
  editing: Boolean
}

const props = defineProps<Props>()
const columns = [
  { name: 'Process', field: 'name', editable: true, type: 'text' },
  { name: 'Arrival Time', field: 'arrival_time', editable: true, type: 'number' },
  { name: 'Burst Time', field: 'burst_time', editable: true, type: 'number' },
  { name: 'Finish Time', field: 'finish_time', editable: false, type: 'number' },
  { name: 'Priority', field: 'priority', editable: true, type: 'number' },
  {
    name: 'Turnaround Time',
    field: 'turnaround_time',
    editable: false,
    type: 'number',
    getter: (process: Process) => process.finish_time - process.arrival_time
  },
  {
    name: 'Waiting Time',
    field: 'waiting_time',
    editable: false,
    type: 'number',
    getter: (process: Process) => process.finish_time - process.arrival_time - process.burst_time
  }
]
const headers = [
  'Process',
  'Arrival Time',
  'Finish Time',
  'Burst Time',
  'Turnaround Time',
  'Waiting Time'
]
</script>

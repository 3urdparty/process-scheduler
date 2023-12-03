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
                  v-for="(header, idx) in [
                    'Process',
                    'Arrival Time',
                    'Finish Time',
                    'Burst Time',
                    'Turnaround Time',
                    'Waiting Time'
                  ]"
                  :key="idx"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(process, processIdx) in modelValue"
                :key="process.name"
                :class="processIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
              >
                <td class="px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                  <input v-model.lazy="process.name" class="w-full h-full px-4 bg-transparent" />
                </td>
                <td
                  class="pl-0.5 whitespace-nowrap text-sm font-medium text-gray-900"
                  v-for="attribute in ['arrival_time', 'finish_time', 'burst_time']"
                  :key="attribute"
                >
                  <input
                    :disabled="!props.editing"
                    v-model.number="process[attribute]"
                    type="number"
                    class="w-full h-full px-6 py-4 bg-transparent"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ process.finish_time - process.arrival_time }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ process.finish_time - process.arrival_time - process.burst_time }}
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
}

interface Props {
  modelValue: Array<Process>
  editing: Boolean
}

const props = defineProps<Props>()
const headers = [
  'Process',
  'Arrival Time',
  'Finish Time',
  'Burst Time',
  'Turnaround Time',
  'Waiting Time'
]
</script>

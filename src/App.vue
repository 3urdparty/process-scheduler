<script setup lang="ts">
import { ArrowUturnLeftIcon, PlusIcon } from '@heroicons/vue/24/solid'
import { useFavicon } from '@vueuse/core'
import { ref } from 'vue'
import { useGlobalState } from '@/stores/global'
import ComboBox from './components/ComboBox.vue'
import EditToggle from './components/EditToggle.vue'
import PlayBack from './components/PlayBack.vue'
import ProcessGANTT from './components/ProcessGANTT.vue'
import ProcessTable from './components/ProcessTable.vue'

const merge = ref(true) // whether to merge processes;

const { algorithms, selectedAlgorithm, scale, editing, addProcess, processes } = useGlobalState()
useFavicon('/src/assets/favicon-32x32.png')
</script>

<template>
  <div class="space-y-8 mt-8">
    Test
    <div class="items-center">
      <img src="/src/assets/logo.png" class="w-32" />
      <h1 class="text-4xl font-bold pl-8 text-violet-800">Process Scheduler</h1>
      <p class="text-lg font-light pl-9 text-violet-400">
        Courtesy of
        <a href="https://github.com/3urdparty/" class="text-violet-700/80 font-medium">@3urdparty</a
        >, find the source code
        <a
          class="text-violet-700/80 font-medium underline"
          href="https://github.com/3urdparty/process-scheduler"
          >here</a
        >
      </p>
    </div>
    <div class="flex gap-2 justify-between items-center px-8">
      <!-- Edit Button -->
      <label class="text-violet-500 flex gap-3">
        <EditToggle v-model="editing" />
        {{ editing ? 'Editing Enabled' : 'Editing Disabled' }}
      </label>

      <div class="flex items-center gap-2">
        <!-- Select Algorithm Combobox -->
        <ComboBox :options="algorithms" v-model="selectedAlgorithm" class="w-60" />

        <!-- Select duration of Quantum -->
        <input
          type="number"
          v-model="algorithms[0].quantum"
          v-if="selectedAlgorithm.name == 'Round Robin'"
          class="w-14 px-2 py-1.5 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
        />

        <!-- Merge Concurrent identical Processes checkbox -->
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            v-model="merge"
            class="py-1.5 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all accent-indigo-400"
          />
          Merge Processes
        </label>

        <label class="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="3"
            v-model="scale"
            class="py-1.5 border w-14 border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all accent-indigo-400"
          />
          Scale
        </label>
      </div>
    </div>
    <div class="px-3 space-y-3">
      <!-- Process GANTT  -->
      <div class="bg-slate-100 rounded-md pt-3">
        <ProcessGANTT v-model="processes" class="px-8" :selected-algorithm="selectedAlgorithm" />
      </div>
      <!-- Playback Controls -->
      <PlayBack />
    </div>

    <div class="flex mx-8 gap-2">
      <button
        class="bg-violet-400 text-white p-1.5 rounded-md shadow-sm gap-2 px-2 focus hover:opacity-75 active:bg-violet-700 transition-all flex items-center"
        @click="addProcess"
      >
        <PlusIcon class="w-6 h-6 text-white" />
        Add Process
      </button>
      <button
        class="bg-violet-400 text-white p-1.5 rounded-md shadow-sm gap-2 px-2 focus hover:opacity-75 active:bg-violet-700 transition-all flex items-center"
        @click="processes = []"
      >
        <ArrowUturnLeftIcon class="w-5 h-5 text-white" />
        Reset
      </button>
    </div>
    <!-- Process table -->
    <ProcessTable class="mx-8" />
  </div>
</template>

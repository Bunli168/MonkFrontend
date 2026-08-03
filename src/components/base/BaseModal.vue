<template>
	<Dialog v-model:visible="localVisible" :maximizable="maximizable" :modal="modal" :closable="showCloseButton"
		:appendTo="appendToResolved" :style="{ width: dialogWidth }" :breakpoints="{ '991px': '75vw', '767px': '90vw', '575px': '95vw' }" :contentClass="contentClass" :contentStyle="contentStyle" @hide="onHide">

		<template #header>
			<div v-if="$slots.title || title">
				<h5 class="modal-title">
					<slot name="title">{{ title }}</slot>
				</h5>
			</div>
		</template>

		<div class="modal-body">
			<slot></slot>
		</div>

		<template #footer v-if="$slots.footer">
			<slot name="footer"></slot>
		</template>

	</Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	modal: {
		type: Boolean,
		default: true
	},
	maximizable: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: ''
	},
	staticBackdrop: {
		type: Boolean,
		default: true
	},
	centered: {
		type: Boolean,
		default: true
	},
	size: {
		type: String,
		default: 'md'
	},
	showCloseButton: {
		type: Boolean,
		default: true
	},
	contentClass: {
		type: String,
		default: ''
	},
	contentStyle: {
		type: [String, Object],
		default: ''
	}
});

const emit = defineEmits(['update:modelValue', 'close']);

const appendToResolved = ref(props.staticBackdrop ? document.body : document.body);

const localVisible = computed({
	get: () => props.modelValue,
	set: (v) => emit('update:modelValue', v)
});

const dialogWidth = computed(() => {
	switch (props.size) {
		case 'sm':
			return '420px';
		case 'lg':
			return '900px';
		case 'xl':
			return '1100px';
		default:
			return '680px';
	}
});

function onHide() {
	emit('update:modelValue', false);
	emit('close');
}
</script>

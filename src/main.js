import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/variables.css'
import './assets/css/main.css'

import App from './App.vue'
import router from './router'
import { gsap } from 'gsap'
import CSSPlugin from 'gsap/CSSPlugin'
import { getAuthImageUrl } from './utils/imageUrl'

if (CSSPlugin) {
    gsap.registerPlugin(CSSPlugin)
}

const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
    console.error(err, info);
    document.body.innerHTML = '<div style="color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;"><h1>Vue Error</h1><p>' + err.message + '</p><pre>' + err.stack + '</pre><p>Info: ' + info + '</p></div>';
};

app.config.globalProperties.$authImg = getAuthImageUrl;

import BaseInput from './components/base/BaseInput.vue'
import BaseButton from './components/base/BaseButton.vue'
import BaseModal from './components/base/BaseModal.vue'
import BasePagination from './components/base/BasePagination.vue'
import BaseTable from './components/base/BaseTable.vue'
import BaseStat from './components/base/BaseStat.vue'
import BaseDrawer from './components/base/BaseDrawer.vue'
import BaseToast from './components/base/BaseToast.vue'
import BaseSelect from './components/base/BaseSelect.vue'
import BaseSelectButton from './components/base/BaseSelectButton.vue'
import BaseDatePicker from './components/base/BaseDatePicker.vue'
import BaseToggle from './components/base/BaseToggle.vue'
import BaseFileUpload from './components/base/BaseFileUpload.vue'
import BaseAvatarUpload from './components/base/BaseAvatarUpload.vue'
import BasePopOver from './components/base/BasePopOver.vue'
import BaseFilter from './components/base/BaseFilter.vue'
import BaseActionMenu from './components/base/BaseActionMenu.vue'
import BaseBadge from './components/base/BaseBadge.vue'

app.component('BaseInput', BaseInput);
app.component('BaseButton', BaseButton)
app.component('BaseModal', BaseModal)
app.component('BasePagination', BasePagination)
app.component('BaseTable', BaseTable)
app.component('BaseStat', BaseStat)
app.component('BaseDrawer', BaseDrawer)
app.component('BaseToast', BaseToast)
app.component('BaseSelect', BaseSelect);
app.component('BaseSelectButton', BaseSelectButton);
app.component('BaseDatePicker', BaseDatePicker);
app.component('BaseToggle', BaseToggle)
app.component('BaseFileUpload', BaseFileUpload)
app.component('BaseAvatarUpload', BaseAvatarUpload)
app.component('BasePopOver', BasePopOver)
app.component('BaseFilter', BaseFilter)
app.component('BaseActionMenu', BaseActionMenu)
app.component('BaseBadge', BaseBadge)

import Tooltip from 'primevue/tooltip'
app.directive('tooltip', Tooltip)

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes'

app.use(createPinia())
app.use(router)

const MyCustomPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: 'var(--primary-color-soft)',
            100: 'var(--primary-color-soft)',
            200: 'var(--primary-color)',
            300: 'var(--primary-color)',
            400: 'var(--primary-color)',
            500: 'var(--primary-color)',
            600: 'var(--primary-color-dark)',
            700: 'var(--primary-color-dark)',
            800: 'var(--primary-color-dark)',
            900: 'var(--primary-color-dark)',
            950: 'var(--primary-color-dark)'
        },
        formField: {
            borderRadius: 'var(--border-radius)'
        }
    },
});


app.use(PrimeVue, {
    theme: {
        preset: MyCustomPreset,
    }
})

app.mount('#app')

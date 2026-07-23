import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# 1. Replace the entire <Tabs> block with the Breadcrumb + Single Table
template_regex = r'<Tabs v-model:value="activeTab".*?</Tabs>'

new_template = """<div class="card p-3 border-0 shadow-sm w-100" style="background-color: var(--surface-card);">
            <!-- Breadcrumbs -->
            <div class="d-flex align-items-center gap-2 mb-4 p-2 bg-light rounded" style="font-size: 14px;">
                <span class="cursor-pointer fw-bold hover-text-primary" 
                      :class="currentLevel === 'provinces' ? 'text-primary' : 'text-muted'"
                      @click="goToLevel('provinces')">Provinces</span>
                
                <template v-if="selectedProvince">
                    <ChevronRight :size="14" class="text-muted" />
                    <span class="cursor-pointer fw-bold hover-text-primary" 
                          :class="currentLevel === 'districts' ? 'text-primary' : 'text-muted'"
                          @click="goToLevel('districts')">{{ selectedProvince.name }} (Districts)</span>
                </template>

                <template v-if="selectedDistrict">
                    <ChevronRight :size="14" class="text-muted" />
                    <span class="cursor-pointer fw-bold hover-text-primary" 
                          :class="currentLevel === 'communes' ? 'text-primary' : 'text-muted'"
                          @click="goToLevel('communes')">{{ selectedDistrict.name }} (Communes)</span>
                </template>

                <template v-if="selectedCommune">
                    <ChevronRight :size="14" class="text-muted" />
                    <span class="cursor-pointer fw-bold hover-text-primary" 
                          :class="currentLevel === 'villages' ? 'text-primary' : 'text-muted'">
                          {{ selectedCommune.name }} (Villages)
                    </span>
                </template>
            </div>

            <!-- Action Banner -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold m-0 text-heading">
                    <span v-if="currentLevel === 'provinces'">All Provinces</span>
                    <span v-else-if="currentLevel === 'districts'">Districts in {{ selectedProvince?.name }}</span>
                    <span v-else-if="currentLevel === 'communes'">Communes in {{ selectedDistrict?.name }}</span>
                    <span v-else-if="currentLevel === 'villages'">Villages in {{ selectedCommune?.name }}</span>
                </h6>
                <BaseButton @click="openCurrentModal()" variant="primary" size="sm" class="d-flex align-items-center gap-2">
                    <i class="fas fa-plus"></i> Add New
                </BaseButton>
            </div>

            <!-- Dynamic Table -->
            <div class="border-top pt-3">
                <BaseTable :columns="colDefs" :rows="currentData" :loading="isLoadingCurrentData" @row-click="handleRowClick" :rowClass="() => 'cursor-pointer'">
                    <template #name="{ data }">
                        <span class="fw-bold" style="color: var(--text-color);">{{ data.name }}</span>
                    </template>
                    <template #name_en="{ data }">
                        <span class="text-muted" style="font-size: 13px;">{{ data.name_en || '-' }}</span>
                    </template>
                    <template #action="{ data }">
                        <div class="d-flex gap-1 justify-content-end">
                            <button v-if="currentLevel !== 'villages'" class="btn-action-square bg-light border d-flex align-items-center justify-content-center" @click.stop="handleRowClick(data)" v-tooltip.top="'View Children'">
                                <ChevronRight :size="16" class="text-secondary" />
                            </button>
                            <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openCurrentModal(data)">
                                <Edit2 :size="14" class="text-white" />
                            </button>
                            <button class="btn-action-square btn-action-danger d-flex align-items-center justify-content-center" @click.stop="confirmDeleteCurrent(data)">
                                <Trash2 :size="14" class="text-white" />
                            </button>
                        </div>
                    </template>
                </BaseTable>
            </div>
        </div>"""

content = re.sub(template_regex, new_template, content, flags=re.DOTALL)

# 2. Add computed properties and navigation functions to script
script_updates = """
import { computed } from 'vue';

const currentLevel = ref('provinces'); // 'provinces' | 'districts' | 'communes' | 'villages'

const currentData = computed(() => {
    if (currentLevel.value === 'provinces') return provinces.value;
    if (currentLevel.value === 'districts') return districts.value;
    if (currentLevel.value === 'communes') return communes.value;
    if (currentLevel.value === 'villages') return villages.value;
    return [];
});

const isLoadingCurrentData = computed(() => {
    if (currentLevel.value === 'provinces') return isLoadingProvinces.value;
    if (currentLevel.value === 'districts') return isLoadingDistricts.value;
    if (currentLevel.value === 'communes') return isLoadingCommunes.value;
    if (currentLevel.value === 'villages') return isLoadingVillages.value;
    return false;
});

const handleRowClick = (data) => {
    if (currentLevel.value === 'provinces') selectProvince(data);
    else if (currentLevel.value === 'districts') selectDistrict(data);
    else if (currentLevel.value === 'communes') selectCommune(data);
};

const openCurrentModal = (data = null) => {
    if (currentLevel.value === 'provinces') openProvinceModal(data);
    else if (currentLevel.value === 'districts') openDistrictModal(data);
    else if (currentLevel.value === 'communes') openCommuneModal(data);
    else if (currentLevel.value === 'villages') openVillageModal(data);
};

const confirmDeleteCurrent = (data) => {
    if (currentLevel.value === 'provinces') confirmDeleteProvince(data);
    else if (currentLevel.value === 'districts') confirmDeleteDistrict(data);
    else if (currentLevel.value === 'communes') confirmDeleteCommune(data);
    else if (currentLevel.value === 'villages') confirmDeleteVillage(data);
};

const goToLevel = (level) => {
    if (level === 'provinces') {
        currentLevel.value = 'provinces';
    } else if (level === 'districts') {
        if (!selectedProvince.value) return;
        currentLevel.value = 'districts';
    } else if (level === 'communes') {
        if (!selectedDistrict.value) return;
        currentLevel.value = 'communes';
    }
};
"""

# Replace `const activeTab = ref('provinces');`
content = content.replace("const activeTab = ref('provinces');", script_updates)
content = content.replace("activeTab.value = 'districts';", "currentLevel.value = 'districts';")
content = content.replace("activeTab.value = 'communes';", "currentLevel.value = 'communes';")
content = content.replace("activeTab.value = 'villages';", "currentLevel.value = 'villages';")

# Replace PrimeVue Tabs import because we removed it, but we can just leave it or remove it.
content = content.replace("import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';\n", "")
# Fix `import { computed } from 'vue';` being added twice, remove from `script_updates` and add to top.
content = content.replace("import { ref, onMounted } from 'vue';", "import { ref, computed, onMounted } from 'vue';")
content = content.replace("import { computed } from 'vue';\n", "")

# Add a CSS class for breadcrumbs
style_addition = """
.hover-text-primary:hover {
    color: var(--primary-color) !important;
    text-decoration: underline;
}
</style>
"""
content = content.replace("</style>", style_addition)

with open(file_path, "w") as f:
    f.write(content)

print("Drill-down layout applied!")

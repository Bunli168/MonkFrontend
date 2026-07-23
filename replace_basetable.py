import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# 1. Update provinces list
province_table = """<div class="border-top pt-3">
                        <BaseTable :columns="colDefs" :rows="provinces" :loading="isLoadingProvinces" @row-click="selectProvince" :rowClass="() => 'cursor-pointer'">
                            <template #name="{ data }">
                                <span class="fw-bold" style="color: var(--text-color);">{{ data.name }}</span>
                            </template>
                            <template #name_en="{ data }">
                                <span class="text-muted" style="font-size: 13px;">{{ data.name_en || '-' }}</span>
                            </template>
                            <template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary" @click.stop="openProvinceModal(data)">
                                        <i class="fas fa-edit fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                    <button class="btn-action-square btn-action-danger" @click.stop="confirmDeleteProvince(data)">
                                        <i class="fas fa-trash-alt fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                </div>
                            </template>
                        </BaseTable>
                    </div>"""

# 2. Update districts list
district_table = """<div class="border-top pt-3">
                        <div v-if="!selectedProvince" class="text-center py-5 text-muted">
                            <div class="mb-3 rounded-circle mx-auto" style="width: 50px; height: 50px; background-color: #f5f5f5;"></div>
                            <p class="mb-0 small text-muted">Select a province</p>
                        </div>
                        <BaseTable v-else :columns="colDefs" :rows="districts" :loading="isLoadingDistricts" @row-click="selectDistrict" :rowClass="() => 'cursor-pointer'">
                            <template #name="{ data }">
                                <span class="fw-bold" style="color: var(--text-color);">{{ data.name }}</span>
                            </template>
                            <template #name_en="{ data }">
                                <span class="text-muted" style="font-size: 13px;">{{ data.name_en || '-' }}</span>
                            </template>
                            <template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary" @click.stop="openDistrictModal(data)">
                                        <i class="fas fa-edit fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                    <button class="btn-action-square btn-action-danger" @click.stop="confirmDeleteDistrict(data)">
                                        <i class="fas fa-trash-alt fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                </div>
                            </template>
                        </BaseTable>
                    </div>"""

# 3. Update communes list
commune_table = """<div class="border-top pt-3">
                        <div v-if="!selectedDistrict" class="text-center py-5 text-muted">
                            <div class="mb-3 rounded-circle mx-auto" style="width: 50px; height: 50px; background-color: #f5f5f5;"></div>
                            <p class="mb-0 small text-muted">Select a district</p>
                        </div>
                        <BaseTable v-else :columns="colDefs" :rows="communes" :loading="isLoadingCommunes" @row-click="selectCommune" :rowClass="() => 'cursor-pointer'">
                            <template #name="{ data }">
                                <span class="fw-bold" style="color: var(--text-color);">{{ data.name }}</span>
                            </template>
                            <template #name_en="{ data }">
                                <span class="text-muted" style="font-size: 13px;">{{ data.name_en || '-' }}</span>
                            </template>
                            <template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary" @click.stop="openCommuneModal(data)">
                                        <i class="fas fa-edit fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                    <button class="btn-action-square btn-action-danger" @click.stop="confirmDeleteCommune(data)">
                                        <i class="fas fa-trash-alt fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                </div>
                            </template>
                        </BaseTable>
                    </div>"""

# 4. Update villages list
village_table = """<div class="border-top pt-3">
                        <div v-if="!selectedCommune" class="text-center py-5 text-muted">
                            <div class="mb-3 rounded-circle mx-auto" style="width: 50px; height: 50px; background-color: #f5f5f5;"></div>
                            <p class="mb-0 small text-muted">Select a commune</p>
                        </div>
                        <BaseTable v-else :columns="colDefs" :rows="villages" :loading="isLoadingVillages" :rowClass="() => 'cursor-pointer'">
                            <template #name="{ data }">
                                <span class="fw-bold" style="color: var(--text-color);">{{ data.name }}</span>
                            </template>
                            <template #name_en="{ data }">
                                <span class="text-muted" style="font-size: 13px;">{{ data.name_en || '-' }}</span>
                            </template>
                            <template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary" @click.stop="openVillageModal(data)">
                                        <i class="fas fa-edit fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                    <button class="btn-action-square btn-action-danger" @click.stop="confirmDeleteVillage(data)">
                                        <i class="fas fa-trash-alt fs-7 text-white" style="font-size: 12px;"></i>
                                    </button>
                                </div>
                            </template>
                        </BaseTable>
                    </div>"""

# Replace in content using regex
content = re.sub(r'<div class="province-list[^>]*>.*?</div>\s*</div>\s*</TabPanel>', province_table + '\n                    </div>\n                </TabPanel>', content, flags=re.DOTALL)
content = re.sub(r'<div class="district-list[^>]*>.*?</div>\s*</div>\s*</TabPanel>', district_table + '\n                    </div>\n                </TabPanel>', content, flags=re.DOTALL)
content = re.sub(r'<div class="commune-list[^>]*>.*?</div>\s*</div>\s*</TabPanel>', commune_table + '\n                    </div>\n                </TabPanel>', content, flags=re.DOTALL)
content = re.sub(r'<div class="village-list[^>]*>.*?</div>\s*</div>\s*</TabPanel>', village_table + '\n                    </div>\n                </TabPanel>', content, flags=re.DOTALL)

# Add colDefs to script setup
script_injection = """
const colDefs = [
    { field: 'name', header: 'Khmer Name' },
    { field: 'name_en', header: 'English Name' },
    { field: 'action', header: 'Action', sortable: false, headerClass: 'text-end', bodyClass: 'text-end' }
];
"""

content = content.replace("const activeTab = ref('provinces');", "const activeTab = ref('provinces');" + script_injection)

# Note: Added icons to the buttons since they were empty colored squares before.
with open(file_path, "w") as f:
    f.write(content)

print("Replacement successful")

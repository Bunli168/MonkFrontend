import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# 1. Extract modals (everything from <!-- Province Modal --> to the end of </template>)
modals_match = re.search(r'(<!-- Province Modal -->.*?)</div>\s*</template>', content, re.DOTALL)
if not modals_match:
    print("Could not find modals")
    exit(1)
modals_content = modals_match.group(1)

# 2. Extract column inner contents
def extract_column(col_num):
    # Regex to find `<div class="col-lg-3">` and its inner `card`
    # We will just find the `card p-3 h-100` and take its whole content.
    if col_num == 1:
        pattern = r'<!-- Column 1: Provinces -->.*?<div class="card p-3 h-100 border-0 shadow-sm".*?>(.*?)</div>\s*</div>\s*<!-- Column 2'
    elif col_num == 2:
        pattern = r'<!-- Column 2: Districts -->.*?<div class="card p-3 h-100 border-0 shadow-sm".*?>(.*?)</div>\s*</div>\s*<!-- Column 3'
    elif col_num == 3:
        pattern = r'<!-- Column 3: Communes -->.*?<div class="card p-3 h-100 border-0 shadow-sm".*?>(.*?)</div>\s*</div>\s*<!-- Column 4'
    else:
        pattern = r'<!-- Column 4: Villages -->.*?<div class="card p-3 h-100 border-0 shadow-sm".*?>(.*?)</div>\s*</div>\s*</div>\s*<!-- Province Modal'
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

col1 = extract_column(1)
col2 = extract_column(2)
col3 = extract_column(3)
col4 = extract_column(4)

# Re-style max-height in lists so they aren't cramped
for var_name in ['col1', 'col2', 'col3', 'col4']:
    locals()[var_name] = locals()[var_name].replace('style="max-height: calc(100vh - 200px); overflow-y: auto;"', 'style="min-height: 300px;"')

# 3. Construct New Template
new_template = f"""<template>
    <div class="pdc-management-container d-flex flex-column gap-3">
        <!-- Title Banner -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center p-3 rounded" style="background-color: var(--body-bg-color); border: 1px solid var(--border-color, rgba(0,0,0,0.06));">
            <div>
                <h5 class="fw-bold mb-1" style="color: var(--text-heading-color);">
                    Province District Commune Reports
                </h5>
            </div>
        </div>

        <Tabs v-model:value="activeTab" scrollable class="card gap-2 p-2" style="background-color: var(--surface-ground);">
            <div>
                <TabList>
                    <Tab value="provinces">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-map" style="color: var(--primary-color);"></i>
                            Provinces
                        </div>
                    </Tab>
                    <Tab value="districts" :disabled="!selectedProvince">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-map-marker-alt" style="color: var(--success-color);"></i>
                            Districts
                        </div>
                    </Tab>
                    <Tab value="communes" :disabled="!selectedDistrict">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-location-dot" style="color: var(--info-color);"></i>
                            Communes
                        </div>
                    </Tab>
                    <Tab value="villages" :disabled="!selectedCommune">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-house" style="color: var(--warning-color);"></i>
                            Villages
                        </div>
                    </Tab>
                </TabList>
            </div>
            <TabPanels class="p-0 bg-transparent">
                <TabPanel value="provinces">
                    <div class="card p-3 border-0 shadow-sm w-100" style="background-color: var(--surface-card);">
                        {col1}
                    </div>
                </TabPanel>
                <TabPanel value="districts">
                    <div class="card p-3 border-0 shadow-sm w-100" style="background-color: var(--surface-card);">
                        {col2}
                    </div>
                </TabPanel>
                <TabPanel value="communes">
                    <div class="card p-3 border-0 shadow-sm w-100" style="background-color: var(--surface-card);">
                        {col3}
                    </div>
                </TabPanel>
                <TabPanel value="villages">
                    <div class="card p-3 border-0 shadow-sm w-100" style="background-color: var(--surface-card);">
                        {col4}
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        {modals_content}
    </div>
</template>"""

# Replace the whole <template> block
content = re.sub(r'<template>.*?</template>', new_template, content, flags=re.DOTALL)

# 4. Script Updates
# Add import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';
script_start = r'<script setup>\n'
imports_to_add = "import { Tab, TabList, TabPanels, TabPanel, Tabs } from 'primevue';\n"
content = content.replace(script_start, script_start + imports_to_add)

# Add activeTab ref
content = content.replace("// Data", "const activeTab = ref('provinces');\n\n// Data")

# Update selectProvince to change activeTab
content = content.replace("fetchDistricts(province.id);\n};", "fetchDistricts(province.id);\n    activeTab.value = 'districts';\n};")

# Update selectDistrict to change activeTab
content = content.replace("fetchCommunes(district.id);\n};", "fetchCommunes(district.id);\n    activeTab.value = 'communes';\n};")

# Update selectCommune to change activeTab
content = content.replace("fetchVillages(commune.id);\n};", "fetchVillages(commune.id);\n    activeTab.value = 'villages';\n};")

with open(file_path, "w") as f:
    f.write(content)

print("Refactored to Tabs layout!")

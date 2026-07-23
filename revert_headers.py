import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# Original header templates to restore:
provinces_header = """<div class="d-flex align-items-center gap-2">
                            <div class="date-badge text-center p-2 rounded-3 bg-primary-soft text-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                                <i class="fas fa-map fs-6"></i>
                            </div>
                            <h6 class="fw-bold m-0 text-heading mb-0">Provinces</h6>
                        </div>
                        <BaseButton @click="openProvinceModal()" variant="primary" size="sm" class="action-btn">
                            <i class="fas fa-plus"></i>
                        </BaseButton>"""

districts_header = """<div class="d-flex align-items-center gap-2">
                            <div class="date-badge text-center p-2 rounded-3 bg-success-soft text-success" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                                <i class="fas fa-map-marker-alt fs-6"></i>
                            </div>
                            <h6 class="fw-bold m-0 text-heading mb-0">Districts</h6>
                        </div>
                        <BaseButton @click="openDistrictModal()" variant="success" size="sm" class="action-btn" :disabled="!selectedProvince">
                            <i class="fas fa-plus"></i>
                        </BaseButton>"""

communes_header = """<div class="d-flex align-items-center gap-2">
                            <div class="date-badge text-center p-2 rounded-3 bg-info-soft text-info" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                                <i class="fas fa-location-dot fs-6"></i>
                            </div>
                            <h6 class="fw-bold m-0 text-heading mb-0">Communes</h6>
                        </div>
                        <BaseButton @click="openCommuneModal()" variant="info" size="sm" class="action-btn" :disabled="!selectedDistrict">
                            <i class="fas fa-plus"></i>
                        </BaseButton>"""

villages_header = """<div class="d-flex align-items-center gap-2">
                            <div class="date-badge text-center p-2 rounded-3 bg-warning-soft text-warning" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                                <i class="fas fa-house fs-6"></i>
                            </div>
                            <h6 class="fw-bold m-0 text-heading mb-0">Villages</h6>
                        </div>
                        <BaseButton @click="openVillageModal()" variant="warning" size="sm" class="action-btn" :disabled="!selectedCommune">
                            <i class="fas fa-plus"></i>
                        </BaseButton>"""


# Replace Provinces
content = re.sub(
    r'<h6 class="fw-bold m-0 text-heading">Provinces</h6>\s*<button @click="openProvinceModal\(\)" class="btn-add btn-add-primary"></button>',
    provinces_header,
    content, flags=re.DOTALL
)

# Replace Districts
content = re.sub(
    r'<h6 class="fw-bold m-0 text-heading">Districts</h6>\s*<button @click="openDistrictModal\(\)" class="btn-add btn-add-success" :disabled="!selectedProvince"></button>',
    districts_header,
    content, flags=re.DOTALL
)

# Replace Communes
content = re.sub(
    r'<h6 class="fw-bold m-0 text-heading">Communes</h6>\s*<button @click="openCommuneModal\(\)" class="btn-add btn-add-secondary" :disabled="!selectedDistrict"></button>',
    communes_header,
    content, flags=re.DOTALL
)

# Replace Villages
content = re.sub(
    r'<h6 class="fw-bold m-0 text-heading">Villages</h6>\s*<button @click="openVillageModal\(\)" class="btn-add btn-add-warning" :disabled="!selectedCommune"></button>',
    villages_header,
    content, flags=re.DOTALL
)

with open(file_path, "w") as f:
    f.write(content)

print("Headers reverted.")

import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# Replace Header for Provinces
content = re.sub(
    r'<div class="d-flex align-items-center gap-2">\s*<div class="date-badge.*?>\s*<i.*?></i>\s*</div>\s*<h6 class="fw-bold m-0 text-heading mb-0">Provinces</h6>\s*</div>\s*<BaseButton @click="openProvinceModal\(\)" variant="primary" size="sm" class="action-btn">\s*<i class="fas fa-plus"></i>\s*</BaseButton>',
    r'<h6 class="fw-bold m-0 text-heading">Provinces</h6>\n                        <button @click="openProvinceModal()" class="btn-add btn-add-primary"></button>',
    content, flags=re.DOTALL
)

# Replace Header for Districts
content = re.sub(
    r'<div class="d-flex align-items-center gap-2">\s*<div class="date-badge.*?>\s*<i.*?></i>\s*</div>\s*<h6 class="fw-bold m-0 text-heading mb-0">Districts</h6>\s*</div>\s*<BaseButton @click="openDistrictModal\(\)" variant="success" size="sm" class="action-btn" :disabled="!selectedProvince">\s*<i class="fas fa-plus"></i>\s*</BaseButton>',
    r'<h6 class="fw-bold m-0 text-heading">Districts</h6>\n                        <button @click="openDistrictModal()" class="btn-add btn-add-success" :disabled="!selectedProvince"></button>',
    content, flags=re.DOTALL
)

# Replace Header for Communes
content = re.sub(
    r'<div class="d-flex align-items-center gap-2">\s*<div class="date-badge.*?>\s*<i.*?></i>\s*</div>\s*<h6 class="fw-bold m-0 text-heading mb-0">Communes</h6>\s*</div>\s*<BaseButton @click="openCommuneModal\(\)" variant="info" size="sm" class="action-btn" :disabled="!selectedDistrict">\s*<i class="fas fa-plus"></i>\s*</BaseButton>',
    r'<h6 class="fw-bold m-0 text-heading">Communes</h6>\n                        <button @click="openCommuneModal()" class="btn-add btn-add-secondary" :disabled="!selectedDistrict"></button>',
    content, flags=re.DOTALL
)

# Replace Header for Villages
content = re.sub(
    r'<div class="d-flex align-items-center gap-2">\s*<div class="date-badge.*?>\s*<i.*?></i>\s*</div>\s*<h6 class="fw-bold m-0 text-heading mb-0">Villages</h6>\s*</div>\s*<BaseButton @click="openVillageModal\(\)" variant="warning" size="sm" class="action-btn" :disabled="!selectedCommune">\s*<i class="fas fa-plus"></i>\s*</BaseButton>',
    r'<h6 class="fw-bold m-0 text-heading">Villages</h6>\n                        <button @click="openVillageModal()" class="btn-add btn-add-warning" :disabled="!selectedCommune"></button>',
    content, flags=re.DOTALL
)

# Replace Edit/Delete buttons in all lists
for list_type in ["Province", "District", "Commune", "Village"]:
    lower = list_type.lower()
    variant = "primary" if list_type == "Province" else "success" if list_type == "District" else "info" if list_type == "Commune" else "warning"
    
    content = re.sub(
        rf'<BaseButton variant="{variant}" size="sm" @click\.stop="open{list_type}Modal\({lower}\)">\s*<i class="fas fa-edit"></i>\s*</BaseButton>\s*<BaseButton variant="danger" size="sm" @click\.stop="confirmDelete{list_type}\({lower}\)">\s*<i class="fas fa-trash"></i>\s*</BaseButton>',
        rf'<button class="btn-action-square btn-action-primary" @click.stop="open{list_type}Modal({lower})"></button>\n                                    <button class="btn-action-square btn-action-danger" @click.stop="confirmDelete{list_type}({lower})"></button>',
        content
    )

# Replace Empty States (Select a province, etc.)
for text in ["province", "district", "commune"]:
    icon = "fa-map-marker-alt" if text == "province" else "fa-location-dot" if text == "district" else "fa-house"
    
    content = re.sub(
        rf'<div class="mb-2 p-2 bg-light rounded-circle text-muted mx-auto" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">\s*<i class="fas {icon} fs-5"></i>\s*</div>\s*<p class="mb-0 small">Select a {text}</p>',
        rf'<div class="mb-3 rounded-circle mx-auto" style="width: 50px; height: 50px; background-color: #f5f5f5;"></div>\n                            <p class="mb-0 small text-muted">Select a {text}</p>',
        content
    )


# Add CSS to style block
css_to_add = """
.pdc-management-container {
    background-color: transparent;
    position: relative;
    z-index: 1;
}

.pdc-management-container::before {
    content: '';
    position: absolute;
    top: -10%; left: -5%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(235, 230, 255, 0.6) 0%, rgba(245, 243, 255, 0) 70%);
    border-radius: 50%;
    z-index: -1;
    pointer-events: none;
}

.pdc-management-container::after {
    content: '';
    position: absolute;
    bottom: -20%; right: -10%;
    width: 800px; height: 800px;
    background: radial-gradient(circle, rgba(235, 230, 255, 0.6) 0%, rgba(245, 243, 255, 0) 70%);
    border-radius: 50%;
    z-index: -1;
    pointer-events: none;
}

.card {
    border-radius: 16px !important;
}

.btn-add {
    width: 24px;
    height: 38px;
    border-radius: 12px;
    border: none;
    transition: transform 0.2s, opacity 0.2s;
    cursor: pointer;
}
.btn-add:hover { opacity: 0.8; }
.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-add-primary { background-color: #7952b3; }
.btn-add-success { background-color: #9fccb6; }
.btn-add-secondary { background-color: #d8d8d8; }
.btn-add-warning { background-color: #f6d198; }

.btn-action-square {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    transition: transform 0.2s;
    cursor: pointer;
}
.btn-action-square:hover { opacity: 0.8; }

.btn-action-primary { background-color: #7952b3; }
.btn-action-danger { background-color: #dc3545; }

.border-top {
    border-top: 1px solid #f0f0f0 !important;
}
"""

content = content.replace("<style scoped>", "<style scoped>\n" + css_to_add)

with open(file_path, "w") as f:
    f.write(content)

print("Done")

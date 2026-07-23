import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# Add view button to Provinces
content = content.replace(
    '''<template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openProvinceModal(data)">''',
    '''<template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square bg-light border d-flex align-items-center justify-content-center" @click.stop="selectProvince(data)" v-tooltip.top="'View Districts'">
                                        <ChevronRight :size="16" class="text-secondary" />
                                    </button>
                                    <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openProvinceModal(data)">'''
)

# Add view button to Districts
content = content.replace(
    '''<template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openDistrictModal(data)">''',
    '''<template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square bg-light border d-flex align-items-center justify-content-center" @click.stop="selectDistrict(data)" v-tooltip.top="'View Communes'">
                                        <ChevronRight :size="16" class="text-secondary" />
                                    </button>
                                    <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openDistrictModal(data)">'''
)

# Add view button to Communes
content = content.replace(
    '''<template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openCommuneModal(data)">''',
    '''<template #action="{ data }">
                                <div class="d-flex gap-1 justify-content-end">
                                    <button class="btn-action-square bg-light border d-flex align-items-center justify-content-center" @click.stop="selectCommune(data)" v-tooltip.top="'View Villages'">
                                        <ChevronRight :size="16" class="text-secondary" />
                                    </button>
                                    <button class="btn-action-square btn-action-primary d-flex align-items-center justify-content-center" @click.stop="openCommuneModal(data)">'''
)

with open(file_path, "w") as f:
    f.write(content)

print("View buttons added!")

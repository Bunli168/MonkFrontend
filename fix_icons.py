import re

file_path = "/Volumes/MyFolder/Pagoda Managemant/MonkManage/src/views/admin/reports/ProvinceDistrictCommuneView.vue"

with open(file_path, "r") as f:
    content = f.read()

# Replace Edit icons
content = re.sub(
    r'<i class="fas fa-edit fs-7 text-white" style="font-size: 12px;"></i>',
    r'<Edit2 :size="14" class="text-white" />',
    content
)

# Replace Trash icons
content = re.sub(
    r'<i class="fas fa-trash-alt fs-7 text-white" style="font-size: 12px;"></i>',
    r'<Trash2 :size="14" class="text-white" />',
    content
)

# Add flex layout to action square classes so icons are centered properly
content = re.sub(
    r'btn-action-square btn-action-primary"',
    r'btn-action-square btn-action-primary d-flex align-items-center justify-content-center"',
    content
)

content = re.sub(
    r'btn-action-square btn-action-danger"',
    r'btn-action-square btn-action-danger d-flex align-items-center justify-content-center"',
    content
)


with open(file_path, "w") as f:
    f.write(content)

print("Icons fixed!")

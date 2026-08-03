const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<p id="test">
                    វត្តនាគវ័នគឺជាវត្តអារាមព្រះពុទ្ធសាសនាដ៏ចាស់ទុំ និងមានឈ្មោះបោះសំឡេងមួយក្នុងចំណោមវត្តអារាមសំខាន់ៗក្នុងរាជធានីភ្នំពេញ ដែលមានប្រវត្តិប្រទាក់ក្រឡាគ្នាយ៉ាងជិតស្និទ្ធជាមួយនឹងការអប់រំ និងការជ្រកកោនរបស់សិស្ស-និស្សិតមកពីតាមបណ្តាខេត្ត។ <br><br>

                    វត្តនាគវ័ន ស្ថិតនៅក្នុងសង្កាត់បឹងកក់ទី២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ (នៅជិតតំបន់បឹងកក់ និងផ្លូវកម្ពុជាក្រោម)។ ដោយសារទីតាំងស្ថិតនៅជិតសាកលវិទ្យាល័យ និងមជ្ឈមណ្ឌលសិក្សាធំៗ វត្តនេះបានដើរតួនាទីយ៉ាងសំខាន់ក្នុងជីវភាពរស់នៅរបស់និស្សិតជាច្រើនទសវត្សរ៍មកនេះ។ <br><br>
                    
                    ជម្រកសម្រាប់សិស្ស-និស្សិតក្រីក្រ៖ វត្តនាគវ័នត្រូវបានគេស្គាល់យ៉ាងច្បាស់ថាជា «ផ្ទះទីពីរ» របស់សិស្ស-និស្សិតប្រុសៗដែលចាកចេញពីស្រុកកំណើតមកបន្តការសិក្សាថ្នាក់ឧត្តមសិក្សានៅភ្នំពេញ។ ព្រះសង្ឃ និងចៅអធិការវត្តគ្រប់ជំនាន់បានផ្តល់កុដិស្នាក់នៅ អាហារ និងការប្រដៅធម៌អាថ៌ដល់និស្សិតរាប់ពាន់នាក់។
                </p>`);

const el = dom.window.document.getElementById('test');
const document = dom.window.document;
const segmenter = new Intl.Segmenter('km', { granularity: 'word' });

const walk = (node) => {
    const children = Array.from(node.childNodes);
    children.forEach(child => {
        if (child.nodeType === 3) {
            const text = child.nodeValue;
            if (!text.trim()) return;

            const fragment = document.createDocumentFragment();
            const segments = segmenter.segment(text);
            
            Array.from(segments).forEach(s => {
                if (!s.segment.trim()) {
                    fragment.appendChild(document.createTextNode(s.segment));
                } else {
                    const span = document.createElement('span');
                    span.className = 'sponsor-word';
                    span.textContent = s.segment;
                    fragment.appendChild(span);
                }
            });
            node.replaceChild(fragment, child);
        } else if (child.nodeType === 1) {
            walk(child);
        }
    });
};

walk(el);
console.log(el.innerHTML.substring(0, 500));

// Script nay xoa cac dong PostMan collection bi trung lap
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'postman_collection.json');
const content = fs.readFileSync(filePath, 'utf8').split('\n');

console.log('Total lines before clean:', content.length);

// Xoa old ORDER orphan (lines 1379-1572, array index 1378-1571)
// Xoa old PAYMENT orphan (lines 1678-1800, array index 1677-1799)
const result = [
  ...content.slice(0, 1378),    // lines 1-1378 (new ORDER section closing)
  ...content.slice(1572, 1677), // lines 1573-1677 (ORDER DETAIL + new PAYMENT)
  ...content.slice(1800)        // lines 1801-end (STAFF + HEALTH + closing)
];

fs.writeFileSync(filePath, result.join('\n'), 'utf8');
console.log('Total lines after clean:', result.length);

// Validate JSON
try {
  JSON.parse(result.join('\n'));
  console.log('JSON is VALID!');
} catch (e) {
  console.error('JSON ERROR:', e.message);
}

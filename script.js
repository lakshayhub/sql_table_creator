function createColumnRow() {
  const div = document.createElement('div');
  div.className = 'column-row';

  // Create each element manually for full control
  const colName = document.createElement('input');
  colName.type = 'text';
  colName.placeholder = 'Column Name';
  colName.className = 'col-name';

  const colType = document.createElement('select');
  colType.className = 'col-datatype';
  ['VARCHAR2(100)', 'NUMBER', 'DATE'].forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    colType.appendChild(option);
  });

  const pkLabel = createCheckboxWithLabel('PK', 'col-pk');
  const uniqueLabel = createCheckboxWithLabel('Unique', 'col-unique');
  const notnullLabel = createCheckboxWithLabel('Not Null', 'col-notnull');

  const defaultCheckbox = document.createElement('input');
  defaultCheckbox.type = 'checkbox';
  defaultCheckbox.className = 'default-toggle';

  const defaultLabel = document.createElement('label');
  defaultLabel.appendChild(defaultCheckbox);
  defaultLabel.appendChild(document.createTextNode(' Default'));

  const defaultInput = document.createElement('input');
  defaultInput.type = 'text';
  defaultInput.placeholder = 'Default Value';
  defaultInput.className = 'col-default';
  defaultInput.style.display = 'none';

  // Show/hide default input based on checkbox
  defaultCheckbox.addEventListener('change', () => {
    defaultInput.style.display = defaultCheckbox.checked ? 'inline-block' : 'none';
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-column';
  removeBtn.textContent = '❌';
  removeBtn.addEventListener('click', () => div.remove());

  // Add conflict checks
  pkLabel.querySelector('input').addEventListener('change', handleConstraintConflict);
  uniqueLabel.querySelector('input').addEventListener('change', handleConstraintConflict);

  // Append everything to div
  div.appendChild(colName);
  div.appendChild(colType);
  div.appendChild(pkLabel);
  div.appendChild(uniqueLabel);
  div.appendChild(notnullLabel);
  div.appendChild(defaultLabel);
  div.appendChild(defaultInput);
  div.appendChild(removeBtn);

  return div;
}

function createCheckboxWithLabel(text, className) {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = className;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(` ${text}`));
  return label;
}

function handleConstraintConflict(e) {
  const row = e.target.closest('.column-row');
  const pk = row.querySelector('.col-pk');
  const unique = row.querySelector('.col-unique');
  const error = document.getElementById('error-message');

  if (pk.checked && unique.checked) {
    error.style.display = 'block';
    error.textContent = '❗ A column cannot be both PK and Unique.';
    e.target.checked = false;
    setTimeout(() => {
      error.style.display = 'none';
    }, 2500);
  }
}

function generateDDL() {
  const tableName = document.getElementById('table-name').value.trim();
  const rows = document.querySelectorAll('.column-row');
  const output = document.getElementById('ddl-output');
  const error = document.getElementById('error-message');

  if (!tableName) {
    error.style.display = 'block';
    error.textContent = '❗ Please enter a table name.';
    return;
  }

  const columns = [];
  const pkColumns = [];

  rows.forEach(row => {
    const name = row.querySelector('.col-name').value.trim();
    const type = row.querySelector('.col-datatype').value;
    const pk = row.querySelector('.col-pk').checked;
    const unique = row.querySelector('.col-unique').checked;
    const notnull = row.querySelector('.col-notnull').checked;
    const defaultInput = row.querySelector('.col-default');
    const def = defaultInput && defaultInput.style.display !== 'none' ? defaultInput.value.trim() : '';

    if (!name) return;

    let line = `${name} ${type}`;
    if (def) line += ` DEFAULT ${def}`;
    if (notnull || pk) line += ` NOT NULL`;
    if (unique && !pk) line += ` UNIQUE`;
    if (pk) pkColumns.push(name);
    columns.push(line);
  });

  let ddl = `CREATE TABLE ${tableName} (\n  ${columns.join(",\n  ")}`;
  if (pkColumns.length) ddl += `,\n  PRIMARY KEY (${pkColumns.join(", ")})`;
  ddl += `\n);`;

  output.value = ddl;
  error.style.display = 'none';
}

// Event Listeners
document.getElementById('add-column-btn').addEventListener('click', () => {
  document.getElementById('columns-container').appendChild(createColumnRow());
});

document.getElementById('generate-btn').addEventListener('click', generateDDL);

// Initial Row
document.getElementById('columns-container').appendChild(createColumnRow());

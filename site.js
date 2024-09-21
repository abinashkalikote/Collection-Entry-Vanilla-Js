let DATA = [];

function InitializeFundLedgerSystem(profit) {
    var Profit = profit;

    const elm = {
        $Ledger: document.getElementById('Ledger'),
        $Amount: document.getElementById('Amount'),
        $DataTableContainer: document.getElementById('data-table-container'),
        $ProfitElm: document.getElementById('profit'),
    };

    const func = {
        $AddRowToTable: ({ ledgerName, ledgerId, amount, index }) => {
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-index', index);
            newRow.innerHTML = `
                <input type="hidden" name="funds[${index}].Ledger" value="${ledgerId}" />
                <input type="hidden" name="funds[${index}].Amount" value="${amount}" />
                <td>${ledgerName}</td>
                <td>${amount}</td>
                <td><button type="button" class="btn btn-sm btn-danger text-white deleteLedger">🗑️</button></td>
            `;
            elm.$DataTableContainer.appendChild(newRow);
        },

        $ClearFields: () => {
            elm.$Ledger.value = "";
            elm.$Amount.value = 0;
            elm.$Ledger.focus();
        },

        $GetValue: (elem) => elem.value ? elem.value.trim() : null,

        $ValidateFieldAndGetValue: ({ elm, errorMessage = "Field is required!" }) => {
            const value = func.$GetValue(elm);
            if (!value) {
                throw new Error(errorMessage);
            }
            return value;
        },

        $GetTotalAmount: () => DATA.reduce((accumulator, item) => accumulator + item.Amount, 0),

        $GetRemainingAmount: () => Profit - func.$GetTotalAmount(),

        $AddRow: ({ ledgerName, ledgerId, amount }) => {
            const dataValueIndex = DATA.length;
            DATA.push({ LedgerId: parseInt(ledgerId), Amount: amount, LedgerName: ledgerName });

            func.$AddRowToTable({ ledgerName, ledgerId, amount, index: dataValueIndex });
            elm.$ProfitElm.innerHTML = func.$GetRemainingAmount();
        },

        $RemoveRow: (index) => {
            DATA = DATA.filter((_, i) => i !== index);

            elm.$DataTableContainer.innerHTML = '';
            DATA.forEach((item, newIndex) => {
                item.index = newIndex;
                const rowValue = { ledgerName: item.LedgerName, ledgerId: item.LedgerId, amount: item.Amount, index: newIndex };
                func.$AddRowToTable(rowValue);
            });
            elm.$ProfitElm.innerHTML = func.$GetRemainingAmount();
        }

    };

    elm.$DataTableContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('deleteLedger')) {
            const row = e.target.closest('tr');
            const index = parseInt(row.getAttribute('data-index'));
            func.$RemoveRow(index); 
        }
    });

    elm.$Amount.addEventListener('keyup', (e) => {
        try {
            e.preventDefault();

            if (e.key !== 'Enter') return;

            const ledgerId = func.$ValidateFieldAndGetValue({
                elm: elm.$Ledger,
                errorMessage: "Ledger is required!"
            });

            let amount = func.$ValidateFieldAndGetValue({
                elm: elm.$Amount,
                errorMessage: "Amount is required!"
            });

            amount = parseFloat(amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Invalid amount entered!");
            }

            const ledgerName = elm.$Ledger.options[elm.$Ledger.selectedIndex].text;

            if (DATA.some(e => e.LedgerId == ledgerId)) {
                throw new Error("Ledger is already selected!");
            }

            const remainingAmount = func.$GetRemainingAmount();
            if (amount > remainingAmount) {
                throw new Error(`Amount exceeds remaining profit. Remaining profit is: ${remainingAmount}`);
            }

            func.$AddRow({ ledgerName, ledgerId, amount });
            func.$ClearFields();

        } catch (error) {
            console.error(error.message); // Display error in console
        }
    });
}

//Budget controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;
    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create new item on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push new item into structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;


        },

        calculateBudget: function () {

            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        deleteItem: function (type, id) {
            var ids, index;
            var ids = data.allItems[type].map(function (value) {
                return value.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };


})();

//Ui controller
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        description: '.add__description',
        value: '.add__value',
        addButton: ".add__btn",
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }


    return {
        getInput: function () {
            return {

                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.description).value,
                value: parseFloat(document.querySelector(DOMStrings.value).value)
            }


        },

        addListItem: function (obj, type) {
            var html, newHTML, element;
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace text with data

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%value%', obj.value);
            newHTML = newHTML.replace('%description%', obj.description);
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.description + ',' + DOMStrings.value);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();


        },

        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.budgetIncomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.budgetExpenseLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }


        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();

//Global app controller
var controller = (function (budgetCtrl, UICtrl) {

    function setUpEventListener() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {

        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);

    };

    var ctrlAddItem = function () {

        var input, newItem;


        //get the field input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //add the item to the budget
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //add the item to the ui
            UICtrl.addListItem(newItem, input.type);
            //clear fields
            UICtrl.clearFields();
            //calculate and update budget
            updateBudget();
        }


    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitID, type, id;


        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {

            //inc-1

            splitID = itemId.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }

        budgetCtrl.deleteItem(type, id);
    };

    return {
        init: function () {
            console.log('Application has started.');
            setUpEventListener();
            UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }
            );
        }
    }
})(budgetController, UIController);

controller.init();

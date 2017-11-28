/***********************************************************************
** Name: Ryan Mack
** Date: 11/27/2017
** Description: File that contains the code for a simple web based
** calculator
***********************************************************************/

// holds data and functions for the calculator
const calculator = {
  // data members
  total: null, // running total
  firstNum: true,
  nextNumNegative: false,
  currentInput: '', // data that is being inputted from the user
  stringOutput: '', // the output the user sees on the screen
  currentOperation: null, // will hold a closure

  add: function() {
    return function(num) {
      return this.total + num;
    }
  },

  subtract: function() {
    return function(num) {
      return this.total - num;
    }
  },

  multiply: function() {
    return function(num) {
      return this.total * num;
    }
  },

  divide: function() {
    return function(num) {
      return this.total / num;
    }
  },

  /* percentage: function() {
    return function(num) {
      return this.total + num;
    }
  },*/
  reset: function(hardReset) {
    // hard reset is used when "AC" is pressed
    if (hardReset) {
      calculator.total=  null;
      calculator.currentInput= '';
      calculator.stringOutput = '';
    }

    // soft reset, used when user presses 'equal'
    calculator.nextNumNegative = false;
    calculator.firstNum = true;
    calculator.currentOperation = null;
  },

  allClear: function() {
    // hard reset
    calculator.reset(true);
  },

  equals: function() {
    console.log('equals this value is: ', this);
    if (!this.currentOperation)
      return;
    // find out how much precision we want to dislay - avoids floating point problems
    const precision = (() => {
      return Math.max(calculator.currentInput.match(/(?!\d)\.$/)||''.length,
               String(calculator.total).match(/(?!\d)\.$/)||''.length);
    })();

    this.total = parseFloat(this.currentOperation(parseFloat(this.currentInput)).toFixed(precision));
    this.currentInput = `${this.total}`;
    this.stringOutput = `${this.total}`;

    // soft reset
    this.reset(false);
  }

} // end calculator object


/***********************************************************************
** Runs when the user clicks any buttons
***********************************************************************/
function handleClick(e) {
  // get the dataset information
  e.preventDefault();
  const buttonValue = e.target.dataset.value;
  const buttonOperator = e.target.dataset.operator;

  if (!buttonValue) { // all buttons have a buttonValue (add, 1, 2 etc.)
    console.log("not a button!!");
    return;
  }
  else if (!buttonOperator) { // If it's not an operator, it's a number
    if (calculator.firstNum && calculator.nextNumNegative) {
      calculator.currentInput += `-${buttonValue}`;
      calculator.stringOutput += `-${buttonValue}`;
    }
    else {
      calculator.currentInput += buttonValue;
      calculator.stringOutput += buttonValue;
    }
  }
  else { // we are dealing with an operator of some sort
    switch (buttonValue) {
      // these are special operators
      case 'AC':
        calculator.allClear();
        break;
      case 'equals':
        calculator.equals();
        break;
      case 'negative':
      case 'decimal':
        handleSpecialOperators(buttonValue, buttonOperator);
        break;
      default: // simple operators
        handleOperator(buttonValue, buttonOperator);
    }
  }
  console.log(calculator);
  updateView();
}

function handleOperator(value, operator) {
  if (!calculator.currentInput)
    return;

  // first number using is inputting
  if (calculator.firstNum) {
    calculator.firstNum = false;
    calculator.total = calculator.total || parseFloat(calculator.currentInput);
  }
  else { // not the first number user is inputting
    calculator.total = calculator.currentOperation(parseFloat(calculator.currentInput));
  }

  calculator.currentOperation = calculator[value]();
  calculator.currentInput = '';
  calculator.stringOutput += ` ${operator} `
}

function handleSpecialOperators(value, operator) {
  if (value === "negative") {
    calculator.nextNumNegative = !calculator.nextNumNegative;

    if (calculator.nextNumNegative === false) {
      calculator.currentInput = calculator.currentInput.replace(/^\-/, '');
      calculator.stringOutput = calculator.stringOutput.replace(/\-(\d+(.?\d)*)$/, '$1');
    }
    else if (calculator.total && calculator.firstNum) {
      calculator.total *= -1;
      calculator.stringOutput = calculator.stringOutput.replace(/\-(\d+(.?\d)*)$/, '$1');
    }
    else {
      calculator.currentInput = `-${calculator.currentInput}`;
      calculator.stringOutput = calculator.stringOutput.replace(/\s?(\d*\.?\d*)?$/, ` -$1`);
    }
  }
  else if (value === "decimal") {
    if (calculator.currentInput.includes('.'))
      return;

    // format the decimal
    const decimal = (calculator.currentInput && calculator.currentInput !== "-") ? '.' : '0.';
    calculator.currentInput += decimal;
    calculator.stringOutput += decimal;
  }
}

function updateView() {
  document.querySelector('.output-field p').innerText = calculator.stringOutput;
}

/***********************************************************************
** Event listener for the calculator object. Event delegation is used
** so we don't need 19 event listeners for all the buttons
***********************************************************************/
document.querySelector('main').addEventListener('click', handleClick);

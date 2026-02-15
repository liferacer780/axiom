class ScientificCalculator {
  constructor() {
    this.expression = '';
    this.result = '0';
    this.history = [];
    this.lastCalculation = null;
    
    this.expressionDisplay = document.getElementById('expression');
    this.resultDisplay = document.getElementById('result');
    this.historyPanel = document.getElementById('historyPanel');
    this.historyList = document.getElementById('historyList');
    this.historyToggle = document.getElementById('historyToggle');
    this.clearHistoryBtn = document.getElementById('clearHistory');
    this.calculator = document.querySelector('.calculator');
    
    this.initializeEventListeners();
    this.loadHistory();
  }
  
  initializeEventListeners() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleButtonClick(e.target);
      });
    });
    
    this.historyToggle.addEventListener('click', () => {
      this.toggleHistory();
    });
    
    this.clearHistoryBtn.addEventListener('click', () => {
      this.clearHistory();
    });
    
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });
  }
  
  handleButtonClick(button) {
    const value = button.getAttribute('data-value');
    const action = button.getAttribute('data-action');
    
    if (value !== null) {
      this.appendValue(value);
    } else if (action) {
      this.handleAction(action);
    }
    
    this.animateButton(button);
  }
  
  appendValue(value) {
    if (this.result !== '0' && this.expression === '') {
      this.expression = this.result;
      this.result = '0';
    }
    
    if (value === '.' && this.getCurrentNumber().includes('.')) {
      return;
    }
    
    this.expression += value;
    this.updateDisplay();
    this.calculateLive();
  }
  
  getCurrentNumber() {
    const matches = this.expression.match(/[\d.]+$/);
    return matches ? matches[0] : '';
  }
  
  handleAction(action) {
    switch (action) {
      case 'clear':
        this.clear();
        break;
      case 'equals':
        this.calculate();
        break;
      case 'add':
        this.appendOperator('+');
        break;
      case 'subtract':
        this.appendOperator('-');
        break;
      case 'multiply':
        this.appendOperator('*');
        break;
      case 'divide':
        this.appendOperator('/');
        break;
      case 'sin':
        this.applyFunction('sin');
        break;
      case 'cos':
        this.applyFunction('cos');
        break;
      case 'tan':
        this.applyFunction('tan');
        break;
      case 'log':
        this.applyFunction('log');
        break;
      case 'sqrt':
        this.applyFunction('sqrt');
        break;
      case 'power':
        this.applyFunction('power');
        break;
      case 'pi':
        this.appendValue(Math.PI.toString());
        break;
    }
  }
  
  appendOperator(operator) {
    if (this.expression === '' && this.result !== '0') {
      this.expression = this.result;
    }
    
    const lastChar = this.expression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
      this.expression = this.expression.slice(0, -1);
    }
    
    if (this.expression !== '') {
      this.expression += operator;
      this.updateDisplay();
    }
  }
  
  applyFunction(func) {
    let currentNum = this.getCurrentNumber() || this.result;
    let num = parseFloat(currentNum);
    
    if (isNaN(num)) return;
    
    let result;
    switch (func) {
      case 'sin':
        result = Math.sin(this.toRadians(num));
        break;
      case 'cos':
        result = Math.cos(this.toRadians(num));
        break;
      case 'tan':
        result = Math.tan(this.toRadians(num));
        break;
      case 'log':
        result = Math.log10(num);
        break;
      case 'sqrt':
        result = Math.sqrt(num);
        break;
      case 'power':
        result = Math.pow(num, 2);
        break;
    }
    
    if (this.getCurrentNumber()) {
      this.expression = this.expression.slice(0, -this.getCurrentNumber().length);
    } else {
      this.expression = '';
    }
    
    this.expression += this.formatNumber(result);
    this.updateDisplay();
    this.calculateLive();
  }
  
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  clear() {
    this.expression = '';
    this.result = '0';
    this.updateDisplay();
  }
  
  calculate() {
    if (this.expression === '') return;
    
    try {
      const sanitized = this.expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      const calculated = eval(sanitized);
      
      if (!isFinite(calculated)) {
        this.result = 'Error';
      } else {
        this.result = this.formatNumber(calculated);
        this.addToHistory(this.expression, this.result);
      }
      
      this.expression = '';
      this.updateDisplay();
    } catch (error) {
      this.result = 'Error';
      this.updateDisplay();
    }
  }
  
  calculateLive() {
    if (this.expression === '') return;
    
    try {
      const sanitized = this.expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      const lastChar = sanitized.slice(-1);
      
      if (['+', '-', '*', '/'].includes(lastChar)) {
        return;
      }
      
      const calculated = eval(sanitized);
      
      if (isFinite(calculated)) {
        this.result = this.formatNumber(calculated);
        this.updateDisplay();
      }
    } catch (error) {
      // Ignore live calculation errors
    }
  }
  
  formatNumber(num) {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    
    const decimalPlaces = 8;
    const rounded = Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    
    return rounded.toString().slice(0, 12);
  }
  
  updateDisplay() {
    this.expressionDisplay.textContent = this.expression || '';
    this.resultDisplay.textContent = this.result;
  }
  
  addToHistory(expression, result) {
    const historyItem = {
      expression,
      result,
      timestamp: Date.now()
    };
    
    this.history.unshift(historyItem);
    
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    
    this.saveHistory();
    this.renderHistory();
  }
  
  renderHistory() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }
    
    this.historyList.innerHTML = this.history.map((item, index) => `
      <div class="history-item" data-index="${index}">
        <div class="history-expression">${this.formatExpression(item.expression)}</div>
        <div class="history-result">= ${item.result}</div>
      </div>
    `).join('');
    
    const historyItems = this.historyList.querySelectorAll('.history-item');
    historyItems.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index'));
        this.loadHistoryItem(index);
      });
    });
  }
  
  formatExpression(expr) {
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−');
  }
  
  loadHistoryItem(index) {
    const item = this.history[index];
    this.result = item.result;
    this.expression = '';
    this.updateDisplay();
  }
  
  saveHistory() {
    try {
      localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }
  
  loadHistory() {
    try {
      const saved = localStorage.getItem('calculatorHistory');
      if (saved) {
        this.history = JSON.parse(saved);
        this.renderHistory();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }
  
  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderHistory();
  }
  
  toggleHistory() {
    this.historyPanel.classList.toggle('active');
    this.calculator.classList.toggle('history-open');
    
    const icon = this.historyToggle.querySelector('svg');
    if (this.historyPanel.classList.contains('active')) {
      icon.style.transform = 'rotate(180deg)';
    } else {
      icon.style.transform = 'rotate(0deg)';
    }
  }
  
  handleKeyPress(e) {
    const key = e.key;
    
    if (/^[0-9.]$/.test(key)) {
      this.appendValue(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      this.appendOperator(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      this.calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      this.clear();
    } else if (key === 'Backspace') {
      this.expression = this.expression.slice(0, -1);
      this.updateDisplay();
      this.calculateLive();
    }
  }
  
  animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ScientificCalculator();
});
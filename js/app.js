// Масив із бажаннями
const wishList = [
  {
    title: 'Сумка',
    price: 1000,
    priority: 'високий'
  },
  {
    title: 'Друшляк',
    price: 500,
    priority: 'низький'
  }
];

// Обчислює загальну суму всіх бажань у масиві та виводить результат у консоль
function getTotalCost(wishList) {
  let totalCost = 0;

  for (const wish of wishList) {
    totalCost += wish.price;
  }

  console.log(`Загальна вартість усіх бажань: ${totalCost} грн`);
}

getTotalCost(wishList);

// Класифікація елементів: додаємо прапорець isHighPriority для бажань з високим пріоритетом
for (const wish of wishList) {
  wish.isHighPriority = wish.priority === 'високий' ? true : false;
}

// Перевіряє, чи не перевищує ціна елемента заданий бюджет (повертає true або false)
const withinBudget = (price, budget) => price <= budget;

// Перевірка роботи функції withinBudget
const wish = wishList[0];
const itemTitle = wish.title;
const itemPrice = wish.price;
const myBudget = 800;

const result = withinBudget(itemPrice, myBudget);
const resultAnswer = result === true ? 'Так' : 'Ні';
console.log(`Чи входить бажання ${itemTitle} вартістю ${itemPrice} грн у бюджет ${myBudget} грн?`, resultAnswer);

